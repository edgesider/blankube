const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    entry: './src/main.ts',
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, 'dist')
    },
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
        }, {
            test: /.css$/,
            use: ['style-loader', 'css-loader']
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
        new VueLoaderPlugin(),
    ],
    optimization: {
        splitChunks: {
            chunks: "async",
            automaticNameDelimiter: "~",
            cacheGroups: {
                three: {
                    chunks: "initial",
                    test: /node_modules\/three/,
                    name: 'three',
                    priority: 20,
                    enforce: true
                },
                vendors: {
                    chunks: "initial",
                    test: /node_modules/,
                    name: 'vendor',
                    priority: 10,
                    enforce: true
                },
                default: {
                    priority: 0,
                }
            }
        }
    },
    stats: {
        modules: false,
        chunks: true,
        assets: true,
    }
}