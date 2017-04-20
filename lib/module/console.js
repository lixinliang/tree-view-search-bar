'use babel';

const DEV = atom.devMode || true;
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
