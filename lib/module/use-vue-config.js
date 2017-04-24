'use babel';

import sass from 'sass.js';

let loader = require.extensions['.vue'];

loader.script.set('babel');

function compile ( content ) {
    return new Promise(( resolve ) => {
        sass.compile(content, ( result ) => {
            resolve(result.text);
        });
    });
}

loader.style.register('scss', async ( content, filePath ) => {
    return await compile(content);
});
