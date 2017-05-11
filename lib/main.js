'use babel';

import { Vue } from 'use-vue';
import { requirePackages } from 'atom-utils';
import StateMachine from 'javascript-state-machine';

import './module/use-vue-config';

import {
    DEV,
    NAME,
} from './module/constant';

import console from './module/console';

let { autoToggle } = !!atom.config.get('tree-view-search-bar');
console.log('autoToggle => ', autoToggle);

let addInfo = ( detail ) => atom.notifications.addInfo(NAME, { detail });
let showTips = () => addInfo(`Plugin require "tree-view".`);

class TreeViewSearchBar {

    /**
     * Plugin Active State
     * @type {Boolean}
     */
    active = false;

    /**
     * Plugin Commands Collection
     * @type {Object}
     */
    commands = {};

    /**
     * Define Finite State Machine Model
     * @type {StateMachine}
     */
    fsm = StateMachine.create({
        /**
         * | "Null" | "RequireTreeView" | "Created" | "Actived" | "Disabled" |
         * @type {String}
         */
        initial : 'Null',
        error : null,
        events : [
            {
                from : 'Null',
                name : 'Init',
                to : 'RequireTreeView',
            },
            {
                from : 'RequireTreeView',
                name : 'Create',
                to : 'Created',
            },
            {
                from : ['Created', 'Disabled'],
                name : 'Activate',
                to : 'Actived',
            },
            {
                from : 'Actived',
                name : 'Deactivate',
                to : 'Disabled',
            },
            {
                from : ['Disabled', 'Actived', 'Created', 'RequireTreeView'],
                name : 'Destroy',
                to : 'Null',
            },
        ],
    });

    constructor () {

        if (DEV) {
            window.test = this;
        }

        /**
         * Init Stage
         */
        this.on('Init', async () => {
            console.log('event => Init');
            let [{ treeView }] = await requirePackages('tree-view');
            if (treeView && treeView.isVisible()) {
                this.emit('Create', treeView);
            } else {
                showTips();
                this.add('search-bar:toggle', showTips);
                let ensureTreeViewVisible = () => {
                    console.log('ensureTreeViewVisible');
                    process.nextTick(() => {
                        if (treeView && treeView.isVisible() && atom.project.rootDirectories.length) {
                            this.emit('Create', treeView);
                        }
                    });
                };
                this.add('tree-view:show', ensureTreeViewVisible);
                this.add('tree-view:toggle', ensureTreeViewVisible);
                let projectListener = atom.project.onDidChangePaths(ensureTreeViewVisible);
                this.on('leaveRequireTreeView', () => {
                    console.log('event => leaveRequireTreeView');
                    this.remove(
                        'tree-view:show',
                        'tree-view:toggle',
                        'search-bar:toggle'
                    );
                    projectListener.disposalAction();
                });
            }
        });

        /**
         * Create Stage
         */
        this.on('Create', ( event, treeView ) => {
            console.log('event => Create');
            atom.notifications.addSuccess(NAME, {
                detail : 'Plugin is running!',
            });

            /**
             * Vue instance
             * @type {Vue|null}
             */
            let vm = null;

            /**
             * Plugin Placeholder
             * @type {Element}
             */
            let element = document.createElement('div');

            /**
             * Activate Stage
             */
            this.on('beforeActivate', () => {
                console.log('beforeActivate');
                if (DEV) {
                    let path = require('path');
                    let files = [
                        './views/app.vue',
                    ];
                    let Module = module.constructor;
                    files.forEach(( file ) => {
                        Module._cache[path.join(__dirname, file)] = null;
                    });
                }
                let app = require('./views/app.vue');
                vm = new Vue(app);
                treeView.element.parentNode.insertBefore(element, treeView.element);
                vm.$mount(element);
            });

            /**
             * Destroy Vue instance
             * @type {Function}
             */
            let clean = () => {
                if (vm) {
                    vm.$destroy();
                    vm.$el.remove();
                    vm = null;
                }
            };

            /**
             * Deactivate Stage
             */
            this.on('Deactivate', () => {
                console.log('Deactivate');
                clean();
            });

            this.on('beforeDestroy', () => {
                console.log('beforeDestroy');
                clean();
            });

            /**
             * ensure Tree View visible
             * @param {Function} callback
             * @return {Function} handler
             */
            let requireTreeView = ( callback ) => {
                return () => {
                    if (treeView.isVisible()) {
                        callback();
                    } else {
                        showTips();
                    }
                };
            };

            this.add('search-bar:show', requireTreeView(() => {
                this.emit('Activate');
            }));
            this.add('search-bar:hide', requireTreeView(() => {
                this.emit('Deactivate');
            }));
            this.add('search-bar:focus', requireTreeView(() => {
                this.emit('Activate');
                vm.$emit('focus');
            }));
            this.add('search-bar:toggle', requireTreeView(() => {
                let current = this.fsm.current;
                this.emit('Activate');
                if (current === this.fsm.current) {
                    this.emit('Deactivate');
                }
            }));

            /**
             * autoToggle
             */
            if (autoToggle) {
                this.emit('Activate');
            }

        });

        /**
         * Destroy Stage
         */
        this.on('Destroy', () => {
            console.log('event => Destroy');
            this.remove(
                'tree-view:show',
                'tree-view:toggle',
                'search-bar:show',
                'search-bar:hide',
                'search-bar:focus',
                'search-bar:toggle'
            );
        });

    }

    /**
     * Plugin Active State
     * @return {Boolean} active
     */
    isActive () {
        return this.active;
    }

    /**
     * Atom Activate Hook
     */
    activate ( state ) {
        if (this.active) return;
        this.active = true;
        /**
         * Init Plugin
         */
        this.emit('Init');
    }

    /**
     * Atom Deactivate Hook
     */
    deactivate () {
        if (!this.active) return;
        this.active = false;
        /**
         * Destroy Plugin
         */
        this.emit('Destroy');
    }

    /**
     * Bind State Machine Event
     * @param {String} event
     * @param {Function} handler
     */
    on ( event, handler ) {
        this.fsm[`on${ event }`] = function ( name, from, to, payload ) {
            let event = { name, from, to };
            return handler.call(this, event, payload);
        };
    }

    /**
     * Emit State Machine Event
     * @param {String} event
     * @param {Any} payload
     */
    emit ( event, payload ) {
        if (this.fsm.can(event)) {
            this.fsm[event](payload);
        }
    }

    /**
     * Add Atom Command
     * @param {String} command
     * @param {Function} handler
     */
    add ( command, handler ) {
        console.log(`add => ${ command }`);
        this.dispose(
            command,
            atom.commands.add(
                'atom-workspace',
                {
                    [command] : handler,
                }
            )
        );
    }

    /**
     * Remove Atom Command
     * @param {String} command
     */
     remove ( ...commands ) {
         commands.forEach(( command ) => {
             console.log(`remove => ${ command }`);
             this.dispose(command);
         });
     }

     /**
      * Add or Remove Atom Command
      * @param {String} command
      * @param {Function} handler
      */
     dispose ( command, handler ) {
         let composition = this.commands[command];
         if (composition) {
             composition.dispose();
             if (handler) {
                 this.commands[command] = handler;
             }
         }
     }

}

export default new TreeViewSearchBar;
