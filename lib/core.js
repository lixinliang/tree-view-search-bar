'use babel'

import minimatch from 'minimatch';
import process from 'process';
import $ from 'jquery';

// transform "keywords string" to "keywords object"
function transform (expression) {
    let result = {
        type : '',
        paths : '',
        expression : '',
    };
    if (typeof expression == 'symbol') {
        result.type = 'symbol';
    } else if (expression.indexOf('/') != -1 || expression.indexOf('\\') != -1) {
        result.type = 'directory';
        let speartor = expression.indexOf('/') != -1 ? '/' : '\\';
        let parts = expression.split(speartor);
        result.expression = parts.shift();
        result.paths = parts.join(speartor);
        if (result.children == '') {
            result.children = Symbol('*');
        }
    } else if (expression.indexOf('.') != -1) {
        result.type = 'file';
        result.expression = expression.indexOf('.') ? expression : '*' + expression;
    } else {
        result.type = 'string';
        result.expression = expression;
    }
    return result
}

// switch result.type to handle different situation
let actions = {
    symbol () {
        // the children file of matched directory
        return true
    },
    directory (name, result) {
        let item = this;
        if (name.toLowerCase().indexOf(result.expression.toLowerCase()) != -1 && item.hasClass('header')) {
            filter(item.next().find('.list-item'), [result.paths]);
            return true
        } else {
            return false
        }
    },
    file (name, result) {
        return minimatch(name.toLowerCase(), result.expression.toLowerCase())
    },
    string (name, result) {
        return name.toLowerCase().indexOf(result.expression.toLowerCase()) != -1
    }
};

function filter (items, keywords) {
    keywords = keywords.map(transform);
    items.each(function () {
        let item = $(this);
        let name = item.text();
        let isMatch = keywords.some((result) => item::actions[result.type](name, result));
        if (isMatch) {
            item.attr('search-bar', 'is-match');
            item.parents('.directory:not(.project-root)').attr('search-bar', 'has-match');
        }
    });
}

function render () {
    $('[search-bar="is-match"]').addClass('tree-view-search-bar--is-match');
    $('[search-bar="has-match"]').addClass('tree-view-search-bar--has-match');
}

function reset () {
    $('.tree-view-search-bar--has-match').removeClass('tree-view-search-bar--has-match');
    $('.tree-view-search-bar--is-match').removeClass('tree-view-search-bar--is-match');
    $('[search-bar]').attr('search-bar', '');
}

export default {
    filter,
    render,
    reset,
}
