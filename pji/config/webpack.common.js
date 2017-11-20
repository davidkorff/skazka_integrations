var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var helpers = require('./helpers');
var rupture = require('rupture');
var jeet = require('jeet');
var nib = require('nib');
var path = require('path');
var fs = require('fs');

module.exports = {
  entry: () => {
    let files = fs.readdirSync('./partners');
    let result = {};
    for (let f of files) {
      result[f] = `./partners/${f}/main.js`
    }

    return result
  },

  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, '..', 'lib/'),
    }
  },

  output: {
    libraryTarget: "var",
    library: "Foo"
  },

  externals: {
    "jquery": "jQuery"
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env', 'es2015']
          }
        }
      },
      {
        test: /\.pug$/,
        loader: './cssRename-loader!pug-loader'
      },
      {
        test: /\.html$/,
        loader: 'html-loader?css-class-rename-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg|otf|woff|woff2|ttf|eot|ico)$/,
        loader: 'url-loader'
      },
      {
        test: /\.css$/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader"
        }, {
          loader: "cssimportant-loader"
        }]
      },
      {
        test: /\.important.styl$/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader"
        }, {
          loader: "cssimportant-loader"
        }, {
          loader: "stylus-loader",
        }]
      },
      {
        test: /\.native.styl$/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader"
        }, {
          loader: "stylus-loader",
        }]
      }
    ]
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      test: /\.styl$/,
      options: {
        stylus: {
          use: [nib(), jeet(), rupture()]
        }
      }
    }),

    new HtmlWebpackPlugin({
      title: 'pj',
      template: 'src/index.pug'
    })
    ,

    new webpack.ProvidePlugin({
      "$": "jquery",
      "jQuery": "jquery",
      "window.jQuery": "jquery"
    })
  ]
};