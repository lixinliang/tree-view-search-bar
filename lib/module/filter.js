'use babel';

import path from 'path';
import console from './console';
import minimatch from 'minimatch';

function match ({ name, path, tags }) {
    for (let expression of tags) {
        expression = expression.toLowerCase();
        // directory
        // if (expression.indexOf('/') != -1 || expression.indexOf('\\') != -1) {
        //     const reg = /[\/|\\]/;
        //     let keywords = expression.split(reg);
        //     if (!keywords.slice(-1)[0]) {
        //         keywords.push('*');
        //     }
        //     keywords = keywords.filter(( keyword ) => !!keyword);
        //     const dir = path.split(reg);
        //     while (dir.length && keywords.length) {
        //         if (dir.shift().indexOf(keywords[0]) != -1) {
        //             keywords.shift();
        //         }
        //     }
        //     if (keywords.length == 0) {
        //         return true;
        //     }
        //     if (dir.length == 0) {
        //         if (keywords.length == 1) {
        //             expression = keywords[0];
        //             path = '';
        //         } else {
        //             continue;
        //         }
        //     }
        // }
        // file
        if (expression.indexOf('.') != -1) {
            if (minimatch(name, expression)) {
                return true;
            }
        }
        // wildcard
        if (expression === '*') {
            return true;
        }
        // string
        if (path.indexOf(expression) != -1) {
            return true;
        }
    }
    return false;
}

/**
 * filter
 * @param  {TreeView} $treeView
 * @param  {Array} tags
 */
export default function filter ({ tags, $treeView }) {

    let hidden = [];
    let visible = [];

    const projects = Array.from(
        $treeView.element.querySelectorAll(
            '.project-root'
        )
    );

    for (let project of projects) {
        const relative = path.relative.bind(path, path.join(project.directory.path.toLowerCase(), '..'));
        const items = Array.from(
            project.querySelectorAll(
                '.project-root > .list-tree .list-item'
            )
        );
        if (tags.length) {
            items.forEach(( item ) => {
                const name = (item.file || item.parentElement.directory).name.toLowerCase();
                const path = relative((item.file || item.parentElement.directory).path.toLowerCase());
                if (match({
                    name,
                    path,
                    tags,
                })) {
                    visible.push(item);
                } else {
                    hidden.push(item);
                }
            });
        } else {
            visible = visible.concat(items);
        }
    }

    return {
        hidden,
        visible,
    };
}
