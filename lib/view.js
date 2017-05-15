'use babel'

import { TextEditorView } from 'atom-space-pen-views';
import { CompositeDisposable } from 'atom';
import process from 'process';
import core from './core.js';
import $ from 'jquery';

let some = Array.prototype.some;

export default class TreeViewSearchBarView {

    creating = false;
    element = $('<div>').attr('id','tree-view-search-bar').addClass('tree-view-search-bar');
    editor = new TextEditorView({
        mini : true,
        softTab : false,
        placeholderText : 'Filter files by name',
    });

    constructor (treeViewObject) {
        // save the treeViewObject
        this.treeViewObject = treeViewObject;
        this.editor.appendTo(this.element);
        // figure out the result when setting the `keyword`
        let keyword = '';
        Object.defineProperty(this, 'keyword', {
            get : () => keyword,
            set : (value) => keyword = this.filter(value)
        });
    }

    create () {
        // if tree-view is visible initialize immediately
        // if tree-view is not exist initialize in nextTick
        if (this.creating) {
            return
        }
        this.creating = true;
        let treeView = this.treeViewObject.treeView;
        if (treeView && treeView.isVisible()) {
            this.treeView = treeView;
            this.initialize();
        } else {
            process.nextTick(() => {
                this.treeView = treeView;
                this.initialize();
            });
        }
    }

    initialize () {
        if (!this.treeView.before) {
            // HACK: for atom 1.16.0
            let plugin = this.treeView;
            this.treeView = $(plugin.element);
            this.treeView.deselect = ::plugin.deselect;
            this.treeView.selectedEntry = ::plugin.selectedEntry;
        }
        // append the element before tree-view
        this.treeView.before(this.element);
        // observe the list-item of tree-view
        this.items = this.treeView.find('.project-root .list-tree .list-item');
        this.observer = new MutationObserver((mutations) => {
            this.items = this.treeView.find('.project-root .list-tree .list-item');
            if (this.searching) {
                this.filter(this.keyword);
                let selected = $(this.treeView.selectedEntry());
                if (selected.length) {
                    if (selected.is('.directory') && !selected.is('[search-bar="has-match"]')) {
                        // selected is exist but missed
                        // selected is directory and it has been collapsed probably
                        this.treeView.deselect();
                    }
                } else {
                    // selected is missed
                    // maybe the file/directory is removed
                }
            }
        });
        this.observer.observe(this.treeView[0], { childList : true, subtree : true });
        this.searching = false;
        this.bindEvent();
        this.creating = false;
    }

    destroy () {
        // remove the element
        let destroy = () => {
            this.items = null;
            this.treeView = null;
            this.observer.disconnect();
            this.observer = null;
            this.unbindEvent();
            this.element.remove();
        };
        if (this.creating) {
            process.nextTick(() => {
                destroy();
            });
        } else {
            destroy();
        }
    }

    bindEvent () {
        // bind event of editor
        let relatedTarget;
        this.editor.on('focus', function (event) {
            relatedTarget = event.relatedTarget;
        }).on('keydown', function (event) {
            if (event.keyCode == 27) {
                // esc
                this.blur();
                if (relatedTarget) {
                    relatedTarget.focus();
                } else {
                    try {
                        atom.workspace.paneContainer.activePane.activeItem.editorElement.focus();
                    } catch (e) {

                    }
                }
                return false
            }
            if (event.keyCode == 32) {
                // space
            }
            if (event.keyCode == 13) {
                // enter
            }
            if (event.keyCode == 9) {
                // tab
            }
        });
        // bind event of buffer
        let buffer = this.buffer = this.editor[0].model.buffer;
        this.bufferListener = buffer.onDidStopChanging(() => {
            this.keyword = buffer.getText();
        });
    }

    unbindEvent () {
        // unbind event
        this.editor.off('focus').off('keydown');
        if (this.bufferListener) {
            this.bufferListener.disposalAction();
            this.bufferListener = null;
        }
    }

    focus () {
        this.editor.focus();
    }

    filter (value) {
        // filter
        core.reset();
        if (value.trim() == '') {
            this.searching = false;
            this.element.removeClass('tree-view-search-bar--searching');
        } else {
            this.element.addClass('tree-view-search-bar--searching');
            core.filter(this.items, value.split(' ').filter((item) => item != ''));
            core.render();
            this.searching = true;
        }
        return value
    }
}
