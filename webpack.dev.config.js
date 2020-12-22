const path = require('path')
const baseConfig = require('./webpack.base.config')
const {merge} = require('webpack-merge')

module.exports = merge(baseConfig, {
    mode: "development",
    devtool: 'source-map',
    devServer: {
        hot: true,
        contentBase: path.resolve(__dirname, 'public')
    },
})
