const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: "development",
    entry: './src/index.ts',
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map',
    module: {
        rules: [{
            test: /.ts$/,
            loader: 'ts-loader'
        }]
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    plugins: [new HtmlWebpackPlugin({template: "./src/index.html"})],
    devServer: {hot: true},
    stats: {
        modules: false
    }
}