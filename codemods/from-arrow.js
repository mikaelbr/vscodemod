// @ts-check
// @ts-ignore
module.exports = transform;
module.exports.title = 'Transform to normal functions';
module.exports.description = 'Changes from (a, b) => a + b to function (a, b) { return a + b; }';
module.exports = transform;

function transform(file, api, options) {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || { quote: 'single' };
  const root = j(file.source);
  const getBodyStatement = fn => {
    const inner = fn.body;
    const comments = (fn.body.comments || []).concat(inner.comments || []);

    if (fn.body.type == 'CallExpression') {
      inner.comments = (inner.comments || []).concat(comments);
      return j.blockStatement([j.returnStatement(inner)]);
    }
    return fn.body;
  };

  const createFunctionExpression = (fn, id) => {
    const func = j.functionExpression(id, fn.params, getBodyStatement(fn));
    func.comments = fn.comments;
    return func;
  };

  const replacedCallbacks =
    root
      .find(j.ArrowFunctionExpression)
      .filter(path => {
        const noThis =
          j(path)
            .find(j.ThisExpression)
            .size() == 0;
        return noThis;
      })
      .forEach(path => {
        const id = path.parentPath.type === 'VariableDeclaration' ? path.parentPath.value.id : null;
        j(path).replaceWith(createFunctionExpression(path.value, id));
      })
      .size() > 0;

  return replacedCallbacks ? root.toSource(printOptions) : null;
}
