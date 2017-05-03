'use babel';

import DEV from '../lib/module/dev';
// import TreeViewSearchBar from '../lib/main';

describe('TreeViewSearchBar', () => {
    it('Publish', () => {
        expect(DEV).toBe(false);
    });
});

// import MyTestPlugin from '../lib/my-test-plugin';
//
// describe("MyTestPlugin", function() {
//   var editor,
//       ref,
//       workspaceElement;
//
//   beforeEach(function() {
//     workspaceElement = atom.views.getView(atom.workspace);
//     jasmine.attachToDOM(workspaceElement);
//     waitsForPromise(function() { return atom.workspace.open('sample.js'); });
//
//     runs(function() {
//       editor = atom.workspace.getActiveTextEditor();
//       editor.setText("This is the file content");
//     });
//     waitsForPromise(function() {
//       return atom.packages.activatePackage('minimap');
//     });
//     return waitsForPromise(function() {
//       return atom.packages.activatePackage('my-test-plugin');
//     });
//   });
//   describe("with an open editor that have a minimap", function() {
//     it("lives", function() {
//       expect('life').toBe('easy');
//     });
//   });
// });
