'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    }
  },
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  plugins: [
    // copy manifest.json,sw.js,register.simple.js,register.js from src to root
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../src/sw/manifest.json'),
        to: config.build.assetsRoot,
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, '../src/sw/sw.js'), // just runtime
        to: config.build.assetsRoot,
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, '../src/sw/register.simple.js'), // no web push notifications
        to: config.build.assetsRoot,
        ignore: ['.*']
      },
      { 
        from: path.resolve(__dirname, process.env.NODE_ENV === 'production' ? '../src/sw/register.prd.js' : '../src/sw/register.dev.js'), // with web push notifications
        to: config.build.assetsRoot + '/register.js',
        toType: 'file',
        ignore: ['.*']
      }
    ]),
    // compile webpack output files to service-worker.tmpl and write as sw.js on root
    new SWPrecacheWebpackPlugin({
      cacheId: 'vue-pwa',
      filename: 'sw.js', // just build
      templateFilePath: path.resolve(__dirname, '../src/sw/service-worker.tmpl'),
      staticFileGlobs: ['dist/**/*.{js,html,css,png,jpg,jpeg,gif,svg}'],
      staticFileGlobsIgnorePatterns: [/\.map$/, /manifest\.json$/],
      minify: true,
      stripPrefix: 'dist/'
    })
  ]
}
