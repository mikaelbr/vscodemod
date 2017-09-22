const transform = require('./src/transform');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function promisify(fn) {
  return function(...args) {
    return new Promise(function(resolve, reject) {
      return fn(...args, function(err, data) {
        if (!err) resolve(data);
        else reject(err);
      });
    });
  };
}

const readdirAsync = promisify(fs.readdir);

const { window, Range } = vscode;

function activate(context) {
  var disposable = vscode.commands.registerCommand('extension.vscodeMod', vscodemod);
  context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;

function codemodSelection(e, doc, sel, fn) {
  e.edit(function(edit) {
    for (var x = 0; x < sel.length; x++) {
      let txt = doc.getText(new Range(sel[x].start, sel[x].end));
      const out = transform(txt, fn);
      edit.replace(sel[x], out);
    }
  });
}

function getFunction(items, label) {
  return items.find(i => i.label === label).fn;
}

const basedir = path.join(__dirname, 'codemods');

function getCodemods() {
  return readdirAsync(basedir)
    .catch(err => window.showErrorMessage(err.message))
    .then(files => files.filter(f => path.extname(f) === '.js'))
    .then(items =>
      items.map(i => require(path.join(basedir, i))).map(i => ({
        label: i.title,
        description: i.description,
        fn: i
      }))
    );
}

function vscodemod() {
  if (!vscode.window.activeTextEditor) {
    window.showInformationMessage('Open a file first to manipulate text selections');
    return;
  }

  getCodemods().then(function(items) {
    window.showQuickPick(items).then(selection => {
      if (!selection || !selection.label) return;
      const fn = getFunction(items, selection.label);

      let e = window.activeTextEditor;
      let d = e.document;
      let sel = e.selections;

      codemodSelection(e, d, sel, fn);
    });
  });
}
