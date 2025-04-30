const { RawSource } = require('webpack-sources');
const { parseSync, traverse, transformFromAstSync } = require('@babel/core');

class MoveCommentsToTopPlugin {
    apply(compiler) {
        compiler.hooks.compilation.tap('ExtractCommentsPlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'ExtractCommentsPlugin',
                    stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
                },
                (assets) => {
                    for (const [filename, asset] of Object.entries(assets)) {
                        if (filename.endsWith('.js')) {
                            const source = asset.source().toString();
                            const ast = parseSync(source, { sourceType: 'unambiguous' });

                            // 使用 Set 存储已处理的注释（去重）
                            const comments = new Set();
                            const seenComments = new WeakSet(); // 避免重复处理同一注释对象

                            traverse(ast, {
                                enter(path) {
                                    const { node } = path;
                                    // 处理 leadingComments
                                    if (node.leadingComments) {
                                        node.leadingComments.forEach(comment => {
                                            if (!seenComments.has(comment)) {
                                                comments.add(formatComment(comment));
                                                seenComments.add(comment);
                                            }
                                        });
                                        node.leadingComments = null;
                                    }
                                    // 处理 trailingComments
                                    if (node.trailingComments) {
                                        node.trailingComments.forEach(comment => {
                                            if (!seenComments.has(comment)) {
                                                comments.add(formatComment(comment));
                                                seenComments.add(comment);
                                            }
                                        });
                                        node.trailingComments = null;
                                    }
                                    // 处理 innerComments
                                    if (node.innerComments) {
                                        node.innerComments.forEach(comment => {
                                            if (!seenComments.has(comment)) {
                                                comments.add(formatComment(comment));
                                                seenComments.add(comment);
                                            }
                                        });
                                        node.innerComments = null;
                                    }
                                },
                            });

                            // 生成新代码
                            const newSource = transformFromAstSync(ast, source).code;
                            const finalSource = [...comments].join('\n\n') + '\n\n' + newSource;
                            compilation.updateAsset(filename, new RawSource(finalSource));
                        }
                    }
                }
            );
        });
    }
}

function formatComment(comment) {
    return comment.type === 'CommentLine'
        ? '//' + comment.value
        : '/*' + comment.value + '*/';
}

module.exports = { MoveCommentsToTopPlugin };