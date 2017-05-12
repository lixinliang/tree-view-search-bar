'use babel';

import { NAME } from './constant';

import sass from 'sass.js';
import CompileError from './compile-error';

let loader = require.extensions['.vue'];

loader.script.set('babel');

function compile ( content, filePath, index ) {
    return new Promise(( resolve ) => {
        sass.compile(content, ({ status, text, formatted, message, line }) => {
            if (status) {
                formatted = ['`', formatted.split(/\n/).slice(2).join(/\n/), '`'].join('');
                throw new CompileError(`${ message }、${ formatted }、${ filePath }?style=${ index - 2 }:${ line }`);
            } else {
                resolve(text);
            }
        });
    });
}

loader.style.register('scss', async ( content, filePath, index ) => {
    return await compile(content, filePath, index);
});
