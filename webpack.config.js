const path = require('path');
const glob = require('glob');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');
const {MoveCommentsToTopPlugin} = require("./plugins/MoveCommentsToTop");
const { adapterTypeTransformer } = require('./ts-transformer/adapter_type_transformer');
// 插件入口文件
const pluginEntries = glob.sync( 'src/plugins/**/*.ts').reduce((acc, entry) => {
  const relativePath = path.relative(path.resolve(__dirname, 'src'), entry);
  const name = path.basename(relativePath, '.ts');
  // @ts-ignore
  acc[`plugins/${name}`] = entry;
  console.log(acc)
  return acc;
}, {});

// 适配器入口文件
const adapterEntries = glob.sync( 'src/adapter/**/*.ts').reduce((acc, entry) => {
  const relativePath = path.relative(path.resolve(__dirname, 'src'), entry);
  const name = path.basename(relativePath, '.ts');
  // @ts-ignore
  acc[`adapter/${name}`] = entry;
  console.log(acc)
  return acc;
}, {});

const entries = {
  ...pluginEntries,
  ...adapterEntries,
}

module.exports = {
  mode: 'production', // 生产模式打包
  entry: entries,
  output: {
    path: path.resolve(__dirname, 'dist'), // 设置输出路径
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{
          loader: 'ts-loader',
          options: {
            getCustomTransformers: () => ({
              before: [adapterTypeTransformer] // 注入自定义转换器
            })
          },
        }],

        exclude: /node_modules|middlewire/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    // 使用preferRelative选项来优先解析相对路径
    preferRelative: true,
    alias: {
      // 将 middleware 映射./middleware.js
      // middleware: './middleware.js',
    },
  },
  // externals: [nodeExternals(),{middleware: 'commonjs2 \.\/middleware',}], // 使用nodeExternals来排除node_modules中的依赖
  externals: [nodeExternals(), ({ context, request },callback) => {
    // 检查请求的模块是否是 'middleware'
    if (request === 'middleware') {
      const normalizedContext = context.replace(/\\/g, '/');
      if (normalizedContext.includes('src/adapter')) {
        return callback(null, 'commonjs2 ./plugin/scripts/middleware');
      } else if (normalizedContext.includes('src/plugins')) {
        return callback(null, 'commonjs2 ./middleware');
      }
    }
    callback();
  },], // 使用nodeExternals来排除node_modules中的依赖
  target: 'node', // 指定打包目标为Node.js环境
  devtool: false, // 不生成源映射文件
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // 混淆选项
          mangle: true, // 修改变量名为无意义的短名称
          compress: {
            unused: true, // 删除未使用的代码
            dead_code: true, // 删除死代码
            drop_console: false, // 移除所有的 `console` 语句
            drop_debugger: true, // 移除所有的 `debugger` 语句
            passes: 2, // 增加压缩次数，确保删除未使用的代码
            // pure_funcs: ['console.log'] // 移除特定的函数调用
          },
          format: {
            // 只保留 [] 注释
            comments: /\[[\s\S]*\]/i
          }
        },
      }),
    ],
  },
  plugins: [
    //   将注释移动到最顶部
    new MoveCommentsToTopPlugin(),
  ]
};