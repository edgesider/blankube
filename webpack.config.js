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
    plugins: [new HtmlWebpackPlugin({template: "./public/index.html"})],
    devServer: {
        hot: true,
        contentBase: path.resolve(__dirname, 'public')
    },
    stats: {
        modules: false
    }
}