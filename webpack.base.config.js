const path = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const fs = require('fs')
const {sources: {RawSource}} = require("webpack");

class CopyPlugin {
    // [['src', 'dest'], ['src', 'dest']]
    constructor(pairs) {
        this.pairs = pairs
    }

    async readFile(path) {
        return new Promise((res, rej) =>
            fs.readFile(path, null, (e, d) => e ? rej(e) : res(d)))
    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap('CopyStaticPlugin', ctx =>
            ctx.hooks.processAssets.tap('CopyStaticPlugin', async () => {
                for (let [src, dest] of this.pairs) {
                    ctx.emitAsset(dest, new RawSource(await this.readFile(src)))
                }
            })
        )
    }
}

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
        }, {
            test: /.*/,
            include: path.resolve(__dirname, 'asset'),
            type: 'asset/resource'
        }]
    },
    resolve: {
        extensions: ['.js', '.vue', '.ts'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    plugins: [
        new HtmlPlugin({
            template: "./public/index.html", favicon: "./public/favicon.ico"
        }),
        new VueLoaderPlugin(),
        new CopyPlugin([
            ['public/favicon-16x16.png', 'favicon-16x16.png'],
            ['public/favicon-32x32.png', 'favicon-32x32.png']])
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