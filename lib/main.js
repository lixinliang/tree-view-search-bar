'use babel'

import { CompositeDisposable } from 'atom';
import { requirePackages } from 'atom-utils';
import treeViewAction from './tree-view-action';
import View from './view';

let autoToggle = atom.config.get('tree-view-search-bar').autoToggle;
let preventDefaultFocus = autoToggle;

let showTips = () => {
    atom.notifications.addInfo(
        '"tree-view-search-bar" require "tree-view"'
    );
};

class MainModel {

    treeViewActive = false;
    treeViewWatching = false;
    subscriptions = new CompositeDisposable();

    activate () {
        // require tree-view and until tree-view is active then initialize
        requirePackages('tree-view').then(([treeView]) => {
            this.treeView = treeView;
            if (treeView.treeView && treeView.treeView.isVisible()) {
                this.initializePackage();
            } else {
                // tree-view not exist give a tips
                let subscriptions = new CompositeDisposable();
                let checkTreeViewStatus = () => {
                    if (treeView.treeView && treeView.treeView.isVisible() && atom.project.rootDirectories.length) {
                        subscriptions.dispose();
                        listener.disposalAction();
                        this.initializePackage();
                    }
                };
                let listener = atom.project.onDidChangePaths((rootDirectories) => {
                    if (rootDirectories.length) {
                        checkTreeViewStatus();
                    }
                });
                subscriptions.add(
                    atom.commands.add(
                        'atom-workspace',
                        {
                            'tree-view:toggle' : checkTreeViewStatus,
                            'tree-view:show' : checkTreeViewStatus,
                        }
                    )
                );
                subscriptions.add(
                    atom.commands.add(
                        'atom-workspace',
                        {
                            'search-bar:toggle' : showTips,
                        }
                    )
                );
                showTips();
            }
        });
    }

    deactivate () {
        // tear down
        this.active = false;
        this.treeViewActive = false;
        this.subscriptions.dispose();
        this.view = null;
        this.treeView = null;
    }

    initializePackage () {
        // add commands
        // if tree-view is changed, show or hide the search-bar-view but do not change the 'active' status
        this.view = new View(this.treeView);
        this.treeViewActive = true;
        this.subscriptions.add(
            atom.commands.add(
                'atom-workspace',
                {
                    'search-bar:show' : () => {
                        if (this.treeViewActive) {
                            this.active = true;
                        } else {
                            showTips();
                        }
                    },
                    'search-bar:hide' : () => {
                        if (this.treeViewActive) {
                            this.active = false;
                        } else {
                            showTips();
                        }
                    },
                    'search-bar:toggle' : () => {
                        if (this.treeViewActive) {
                            this.active = !this.active;
                        } else {
                            showTips();
                        }
                    },
                    'search-bar:focus' : () => {
                        if (this.treeViewActive) {
                            this.active = true;
                            this.focus();
                        } else {
                            showTips();
                        }
                    },
                    'tree-view:toggle' : () => {
                        // if watching then show or hide search-bar-view but do not change the 'active'
                        this.treeViewActive = !this.treeViewActive;
                        if (this.treeViewWatching) {
                            if (this.treeViewActive) {
                                this.show();
                            } else {
                                this.hide();
                            }
                        }
                    },
                    'tree-view:show' : () => {
                        // if watching then show or hide search-bar-view but do not change the 'active'
                        if (!this.treeViewActive) {
                            this.treeViewActive = true;
                            if (this.treeViewWatching) {
                                this.show();
                            }
                        }
                    },
                }
            )
        );
        if (autoToggle) {
            // use 'active' to show or hide the search-bar-view
            // change 'active' to true if autoToggle
            this.active = true;
            atom.notifications.addSuccess('"tree-view-search-bar" is running!');
        }
    }

    constructor () {
        // when 'active' change to true watch tree-view and show search-bar-view
        // when 'active' change to false stop watching and hide search-bar-view
        let active = false;
        Object.defineProperty(
            this,
            'active',
            {
                get : () => {
                    return active
                },
                set : (value) => {
                    if (active == value) {
                        return active
                    } else {
                        if (value) {
                            this.treeViewWatching = true;
                            this.show();
                            this.focus();
                        } else {
                            this.treeViewWatching = false;
                            this.hide();
                        }
                        active = value;
                        return active
                    }
                }
            }
        );
    }

    show () {
        // console.log('show');
        this.view.create();
        this::treeViewAction.overwrite();
    }

    hide () {
        // console.log('hide');
        this.view.destroy();
        typeof treeViewAction.restore == 'function' && this::treeViewAction.restore();
    }

    focus () {
        // console.log('focus');
        if (preventDefaultFocus) {
            preventDefaultFocus = false;
            return;
        }
        this.view.focus();
    }
}

export default new MainModel();
