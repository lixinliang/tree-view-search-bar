'use babel'

import $ from 'jquery';

let some = Array.prototype.some;

let moveDown = (selected) => {
    let all = $('.tree-view').find('.project-root,.entry[search-bar*="match"],.selected');
    let max = all.length - 1;
    let index = 0;
    if (selected) {
        all::some((item, i) => {
            if (item === selected) {
                index = i;
                return true
            }
        });
    }
    let result = index + 1;
    result = result < 0 ? 0 : result > max ? max : result;
    if (result == index) {
        return all[result - 1]
    }
    return all[result]
};

let moveUp = (selected) => {
    let all = $('.tree-view').find('.project-root,.entry[search-bar*="match"],.selected');
    let max = all.length - 1;
    let index = 0;
    if (selected) {
        all::some((item, i) => {
            if (item === selected) {
                index = i;
                return true
            }
        });
    }
    let result = index - 1;
    result = result < 0 ? 0 : result > max ? max : result;
    if (result == index) {
        return all[result + 1]
    }
    return all[result]
};

// make sure the selected element is visible
// moveUp moveDown scrollToBottom selectActiveFile revealActiveFile
export default {
    overwrite () {
        let view = this.view;
        let treeView = this.treeView.treeView;
        let prototype = treeView.constructor.prototype;
        if (!treeView.find) {
            // HACK: for atom 1.16.0
            treeView = $(treeView.element);
        }
        let replacer = {
            scrollToEntry () {
                let realFunction = arguments.callee.caller.caller.toString();
                if (new RegExp('event.stopImmediatePropagation()').test(realFunction)) {
                    // that is moveUp or moveDown probably
                    if (new RegExp('selectedEntry.next').test(realFunction)) {
                        // moveDown
                        let selected = $(this.selectedEntry());
                        if (!selected.is('.project-root,[search-bar*="match"]')) {
                            selected = moveDown(selected[0]);
                            this.selectEntry(selected);
                            return origin.scrollToEntry.call(this, selected)
                        }
                    }
                    if (new RegExp('selectedEntry.prev').test(realFunction)) {
                        // moveUp
                        let selected = $(this.selectedEntry());
                        if (!selected.is('.project-root,[search-bar*="match"]')) {
                            selected = moveUp(selected[0]);
                            this.selectEntry(selected);
                            return origin.scrollToEntry.call(this, selected)
                        }
                    }
                    // if the bug should happen, it will
                    // I can not do anything
                }
                return origin.scrollToEntry.apply(this, arguments)
            },
            scrollToBottom () {
                let lastEntry = treeView.find('.project-root,.entry[search-bar*="match"]').last()[0];
                if (lastEntry) {
                    this.selectEntry(lastEntry);
                    return this.scrollToEntry(lastEntry)
                }
            },
            selectActiveFile () {
                let previousSelected = this.selectedEntry();
                let ret = origin.selectActiveFile.apply(this, arguments);
                let selected = treeView.find('.selected');
                if (!selected.is('[search-bar*="match"]')) {
                    this.selectEntry(previousSelected);
                }
                return ret
            },
            revealActiveFile () {
                let previousSelected = this.selectedEntry();
                let ret = origin.revealActiveFile.apply(this, arguments);
                let selected = treeView.find('.selected');
                if (!selected.is('[search-bar*="match"]')) {
                    this.selectEntry(previousSelected);
                }
                return ret
            }
        };
        let actions = Object.keys(replacer);
        let origin = {};
        actions.forEach((action) => {
            origin[action] = prototype[action];
            prototype[action] = function () {
                if (view.searching) {
                    return replacer[action].apply(this, arguments)
                } else {
                    return origin[action].apply(this, arguments)
                }
            };
        });
        this.restore = function () {
            actions.forEach((action) => prototype[action] = origin[action]);
            this.restore = null;
        };
    }
}
