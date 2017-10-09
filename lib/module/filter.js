'use babel';

import console from './console';

function match ({ name, path, tags }) {
    // TODO:
    return !!((name.slice(-1).charCodeAt(0) + tags.length) % 2)
}

/**
 * filter
 * @param  {TreeView} $treeView
 * @param  {Array} tags
 */
export default function filter ({ tags, $treeView }) {

    let hidden = [];
    let visible = [];

    /**
     * all items of files or directories
     * @type {Array} items
     */
    const items = Array.from(
        $treeView.element.querySelectorAll(
            '.list-item:not(.project-root-header)'
        )
    );

    if (tags.length) {
        // filter from back to font
        items.reverse().forEach(( item ) => {
            const {
                name,
                path,
            } = item.firstElementChild.dataset;
            if (match({ name, path, tags })) {
                visible.push(item);
            } else {
                hidden.push(item);
            }
        });
    } else {
        visible = items;
    }

    return {
        hidden,
        visible,
    };
}