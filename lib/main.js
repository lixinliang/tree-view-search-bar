'use babel';

import { Vue } from 'use-vue';
import { requirePackages } from 'atom-utils';
import StateMachine from 'javascript-state-machine';

import DEV from './module/dev.js';
import './module/use-vue-config.js';
import console from './module/console';

import app from './views/app.vue';

const NAME = 'Tree View Search Bar';

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
         * | Null | RequireTreeView | Created | Actived | Disabled |
         * @type {String}
         */
        initial : 'Null',
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
                    this.remove('tree-view:show');
                    this.remove('tree-view:toggle');
                    this.remove('search-bar:toggle');
                    projectListener.disposalAction();
                });
            }
        });

        /**
         * Create Stage
         */
        this.on('Create', ( event, treeView ) => {
            console.log('event => Create');
            let vm = null;
            let element = document.createElement('div');
            atom.notifications.addSuccess(NAME, {
                detail : 'Plugin is running!',
            });
            /**
             * Activate Stage
             */
            this.on('Activate', () => {
                console.log('Activate');
                try {
                    if (DEV) {
                        let path = require('path');
                        let file = './views/app.vue';
                        let Module = module.constructor;
                        Module._cache[path.join(__dirname, file)] = null;
                        let app = require(file);
                        vm = new Vue(app);
                    } else {
                        vm = new Vue(app);
                    }
                    treeView.element.parentNode.insertBefore(element, treeView.element);
                    vm.$mount(element);
                } catch ( err ) {
                    // TODO: show a link to open a github issue
                    // TODO: cancel this event
                    atom.notifications.addError(NAME, {
                        detail : err.toString(),
                    });
                    return false;
                }
            });
            /**
             * Deactivate Stage
             */
            this.on('Deactivate', () => {
                console.log('Deactivate');
                if (vm) {
                    vm.$destroy();
                    vm.$el.remove();
                    vm = null;
                }
            });
            this.on('beforeDestroy', () => {
                console.log('beforeDestroy');
                if (vm) {
                    vm.$destroy();
                    vm.$el.remove();
                    vm = null;
                }
            });
            let assert = ( callback ) => {
                return () => {
                    if (treeView.isVisible()) {
                        callback();
                    } else {
                        showTips();
                    }
                };
            };
            this.add('search-bar:show', assert(() => {
                this.emit('Activate');
            }));
            this.add('search-bar:hide', assert(() => {
                this.emit('Deactivate');
            }));
            this.add('search-bar:focus', assert(() => {
                this.emit('Activate');
                vm.$emit('focus');
            }));
            this.add('search-bar:toggle', assert(() => {
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
            this.remove('tree-view:show');
            this.remove('tree-view:toggle');
            this.remove('search-bar:show');
            this.remove('search-bar:hide');
            this.remove('search-bar:focus');
            this.remove('search-bar:toggle');
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
        this.commands[command] && this.commands[command].dispose();
        this.commands[command] = atom.commands.add(
            'atom-workspace',
            {
                [command] : handler,
            }
        );
    }

    /**
     * Remove Atom Command
     * @param {String} command
     */
    remove ( command ) {
        console.log(`remove => ${ command }`);
        this.commands[command] && this.commands[command].dispose();
    }

}

export default new TreeViewSearchBar;
