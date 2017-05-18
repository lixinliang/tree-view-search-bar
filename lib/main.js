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

let { autoToggle } = !!atom.config.get(`${ NAME.kebab }`);
console.log('autoToggle => ', autoToggle);

let addInfo = ( detail ) => atom.notifications.addInfo(`${ NAME }`, { detail });
let showTips = () => addInfo(`Plugin require "tree-view".`);

Vue.prototype.$dispatch = function ( event, payload ) {
    return new Promise(( resolve ) => {
        this.$emit(`${ event }`, resolve, payload);
    });
};

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
     * @type {String} Status | "Null" | "RequireTreeView" | "Created" | "Actived" | "Disabled" | "Destroyed" |
     * @type {String} Event | "Setup" | "Create" | "Activate" | "Deactivate" | "Destroy" | "Teardown" |
     */
    fsm = StateMachine.create({
        initial : 'Null',
        error : null,
        events : [
            {
                from : 'Null',
                name : 'Setup',
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
                to : 'Destroyed',
            },
            {
                from : 'Destroyed',
                name : 'Teardown',
                to : 'Null',
            },
        ],
    });

    constructor () {

        if (DEV) {
            window.test = this;
        }

        /**
         * Setup Stage
         */
        this.on('Setup', async () => {
            console.log('event => Setup');
            let [{ treeView }] = await requirePackages('tree-view');
            if (treeView && treeView.isVisible()) {
                this.emit('Create');
            } else {
                showTips();
                this.add('search-bar:toggle', showTips);
                let ensureTreeViewVisible = () => {
                    console.log('ensureTreeViewVisible');
                    process.nextTick(() => {
                        if (treeView && treeView.isVisible() && atom.project.rootDirectories.length) {
                            this.emit('Create');
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
                        'search-bar:toggle',
                    );
                    projectListener.disposalAction();
                });
            }
        });

        /**
         * Create Stage
         */
        this.on('Create', async () => {
            console.log('event => Create');
            let [{ treeView }] = await requirePackages('tree-view');

            atom.notifications.addSuccess(`${ NAME }`, {
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
            this.on('Activate', async () => {
                console.log('Activate');
                if (vm) {
                    await vm.$dispatch('show');
                } else {
                    if (DEV) {
                        let path = require('path');
                        let files = [
                            './views/app.vue',
                        ];
                        let Module = module.constructor;
                        for (let file of files) {
                            Module._cache[path.join(__dirname, file)] = null;
                        }
                    }
                    let app = require('./views/app.vue');
                    vm = new Vue(app);
                    treeView.element.parentNode.insertBefore(element, treeView.element);
                    vm.$mount(element);
                }
                console.log('app => show');
            });

            /**
             * Destroy Vue instance
             * @type {Function}
             */
            let clean = async () => {
                if (vm) {
                    await vm.$dispatch('hide');
                    vm = null;
                }
                console.log('app => hide');
            };

            /**
             * Deactivate Stage
             */
            this.on('Deactivate', () => {
                console.log('Deactivate');
                clean();
            });

            /**
             * Destroy Stage
             */
            this.on('Destroy', () => {
                console.log('Destroy');
                // clean();
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
         * Teardown Stage
         */
        this.on('Teardown', () => {
            console.log('event => Teardown');
            this.remove(
                'tree-view:show',
                'tree-view:toggle',
                'search-bar:show',
                'search-bar:hide',
                'search-bar:focus',
                'search-bar:toggle',
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
         * Setup Plugin
         */
        this.emit('Setup');
    }

    /**
     * Atom Deactivate Hook
     */
    deactivate () {
        if (!this.active) return;
        this.active = false;
        /**
         * Teardown Plugin
         */
        this.emit('Teardown');
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
                },
            ),
        );
    }

    /**
     * Remove Atom Command
     * @param {String} command
     */
     remove ( ...commands ) {
         for (let command of commands) {
             console.log(`remove => ${ command }`);
             this.dispose(command);
         }
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
