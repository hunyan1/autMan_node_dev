const ts = require('typescript');

module.exports.adapterTypeTransformer = function (context) {
	return (sourceFile) => {
		const visitor = (node) => {
			if (ts.isVariableDeclaration(node) &&
				node.initializer?.getText() === '"__AUT_ADAPTER_TYPE__"') {
				const sourceText = sourceFile.text;
				const title = sourceText.match(/\/\/ \[title: (.*?)\]/)?.[1];
				if (!title||title.split('_').length!==3||!title.split('_')[1]){
					throw new Error('请添加注释 [title: adapter_适配器标识_适配器类型]');
				}
				return ts.factory.updateVariableDeclaration(
					node,
					node.name,
					node.exclamationToken,
					node.type,
					ts.factory.createStringLiteral(title.split('_')[1])
				);

			}
			return ts.visitEachChild(node, visitor, context);
		};
		return ts.visitNode(sourceFile, visitor);
	};
}