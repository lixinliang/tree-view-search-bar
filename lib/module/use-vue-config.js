'use babel';

import { NAME } from './constant';

import CompileError from './compile-error';

let loader = require.extensions['.vue'];

loader.script.set('babel');
