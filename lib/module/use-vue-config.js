'use babel';

import { NAME } from './constant';

import CompileError from './compile-error';

let loader = require.extensions['.vue'];

loader.script.set('babel');

loader.style.register('scss', ( content, filePath, index ) => {
    // TODO: compile
    if (false) {
        throw new CompileError(`${ message }、${ filePath }?style=${ index - 2 }:${ line }`);
    }
    return content;
});
