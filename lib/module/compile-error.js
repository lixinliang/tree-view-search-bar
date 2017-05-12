'use babel';

function CompileError ( message ) {
   this.message = message;
   this.name = 'CompileError';
}

CompileError.prototype = new Error;
CompileError.prototype.constructor = CompileError;

export default CompileError;
