// @ts-check
// @ts-ignore
module.exports = transform;
module.exports.title = 'To function declaration';
module.exports.description =
  'Changes from const foo = (a, b) => a + b to function foo (a, b) { return a + b; }';

function transform(file, api, options) {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || { quote: 'single' };
  const root = j(file.source);

  function getBodyStatement(fn) {
    const inner = fn.body;
    const comments = (fn.body.comments || []).concat(inner.comments || []);
    if (j.Expression.check(fn.body)) {
      inner.comments = (inner.comments || []).concat(comments);
      return j.blockStatement([j.returnStatement(inner)]);
    }
    return fn.body;
  }

  function createFunctionExpression(fn, id) {
    const func = j.functionDeclaration(id, fn.params, getBodyStatement(fn));
    func.comments = fn.comments;
    return func;
  }

  const replacedCallbacks =
    root
      .find(j.VariableDeclaration)
      .filter(path => {
        return path.value.declarations.every(f => j.ArrowFunctionExpression.check(f.init));
      })
      .forEach(function(pp) {
        j(pp).replaceWith(
          j(pp.value.declarations)
            .filter(path => {
              const fn = path.value.init;
              const noThis =
                j(fn)
                  .find(j.ThisExpression)
                  .size() == 0;

              return j.ArrowFunctionExpression.check(fn) && noThis;
            })
            .nodes()
            .map(decl => {
              console.log(decl.init);
              return createFunctionExpression(decl.init, decl.id);
            })
        );
      })
      .size() > 0;

  return replacedCallbacks ? root.toSource(printOptions) : null;
}
