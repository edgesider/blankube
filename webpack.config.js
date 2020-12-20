const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    mode: "development",
    entry: './src/main.ts',
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map',
    module: {
        rules: [{
            test: /.ts$/,
            loader: 'ts-loader',
            options: {
                appendTsSuffixTo: [/\.vue$/]
            }
        }, {
            test: /.vue$/,
            loader: 'vue-loader'
        }]
    },
    resolve: {
        extensions: ['.js', '.vue', '.ts'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({template: "./public/index.html"}),
        new VueLoaderPlugin()
    ],
    devServer: {
        hot: true,
        contentBase: path.resolve(__dirname, 'public')
    },
    stats: {
        modules: false
    }
}