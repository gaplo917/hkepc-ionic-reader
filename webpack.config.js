// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const RemovePlugin = require('remove-files-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')
const webpack = require('webpack')
const isProduction = process.env.NODE_ENV === 'production'

const stylesHandler = 'style-loader'

const config = {
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
  entry: {
    './js/dependencies': './src/dependencies.js',
    './js/app': './src/es6/core/app.js',
    './css/ionic.app': './src/scss/ionic.app.scss',
    './css/ionic.app.dark': './src/scss/ionic.app.dark.scss',
    './css/ionic.app.oled.dark': './src/scss/ionic.app.oled.dark.scss'
  },
  output: {
    path: path.resolve(__dirname, 'dist')

  },
  devServer: {
    historyApiFallback: true,
    allowedHosts: 'all',
    port: 3000,
    host: '0.0.0.0',
    static: {
      directory: path.join(__dirname, 'www')
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      IS_DEV: process.env.NODE_ENV === 'development'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new RemovePlugin({
      before: {
        test: [
          {
            folder: path.resolve(__dirname, 'dist'),
            method: () => true
          }
        ]
      },
      // scss entry will produce unnecessary .js file, use this plugin to remove it
      after: {
        test: [
          {
            folder: path.resolve(__dirname, 'dist/css'),
            method: filePath => /\.js$|\.js.map$/.test(filePath)
          }
        ]
      }
    }),
    new CopyPlugin({
      patterns: [
        {
          from: '**/*',
          to: './',
          context: 'www/'
        }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          stylesHandler,
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false
            }
          },
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          },
          'sass-loader']
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif|html|json|txt|md)$/i,
        type: 'asset/resource'
      }

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ]
  },
  optimization: {
    minimize: process.env.NODE_ENV !== 'development',
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
      // `...`,
      new CssMinimizerPlugin(),
      new TerserPlugin({
        extractComments: false,
        parallel: true,
        terserOptions: {
          mangle: false,
          sourceMap: false, // Must be set to true if using source-maps in production
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }
}

module.exports = () => {
  if (isProduction) {
    config.mode = 'production'

    config.plugins.push(new WorkboxWebpackPlugin.GenerateSW())
  } else {
    config.mode = 'development'
  }
  return config
}
