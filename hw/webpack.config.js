const webpack = require('webpack')
const path = require('path')

module.exports = {

  entry: {
    'sailplay.magic.min': './src/js/main.js',
  },

  mode: 'production',

  // for production
  devtool: 'source-map',

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },

  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'jquery': 'jQuery',
      'vue$': 'vue/dist/vue.esm.js',
      'img': path.resolve(__dirname, 'src/img'),
    }
  },

  module: {
    rules: [

      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
      },

      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // loaders: {
          //   stylus: 'vue-style-loader?sourceMap=true!css-loader?sourceMap=true!postcss?sourceMap=true!stylus-loader?sourceMap=true',
          // },
          postcss: [require('postcss-cssnext')()]
        }
      },

      {
        test: /\.(?:png|jpg|svg)$/,
        loader: 'url-loader',
        query: {
          // Inline images smaller than 10kb as data URIs
          limit: 10000
        }
      }

    ]
  },
  
  devServer: {
    contentBase: './'
  },

  plugins: [
  ]

}