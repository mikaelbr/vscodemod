// @ts-check
// @ts-ignore
module.exports = transform;
module.exports.title = 'Transform implicit function return to explicit';
module.exports.description = 'Changes from (a, b) => a + b to (a, b) => { return a + b; }';

function transform(file, api, options) {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || { quote: 'single' };
  const root = j(file.source);

  function createFunctionExpression(fn) {
    return j.arrowFunctionExpression(fn.params, j.blockStatement([j.returnStatement(fn.body)]));
  }

  const replacedCallbacks =
    root
      .find(j.ArrowFunctionExpression)
      .filter(path => path.value.body.type !== 'BlockStatement')
      .forEach(path => j(path).replaceWith(createFunctionExpression(path.value)))
      .size() > 0;

  return replacedCallbacks ? root.toSource(printOptions) : null;
}
