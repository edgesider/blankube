const {merge} = require('webpack-merge')
const baseConfig = require('./webpack.base.config')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

module.exports = merge(baseConfig, {
    mode: 'production',
    devtool: false,
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
        })
    ]
})
