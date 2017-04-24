'use babel';

import DEV from './dev.js';

const LOG = console.log.bind(console);
const EMPTY = () => {};

export default Object.defineProperty({}, 'log', {
    get () {
        if (DEV) {
            return LOG;
        } else {
            return EMPTY;
        }
    },
});
