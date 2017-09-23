const { window } = require('vscode');
const jscodeshift = require('jscodeshift');

function empty() {}
module.exports = function codemod(source, transform) {
  try {
    const out = transform(
      { source: source },
      {
        j: jscodeshift,
        jscodeshift: jscodeshift,
        stats: empty
      },
      {}
    );
    return out == null ? source : out;
  } catch (err) {
    window.showErrorMessage(err.message);
  }
};
