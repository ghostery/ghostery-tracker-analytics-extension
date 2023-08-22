const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AutoPrefixer = require('autoprefixer');

const SRC_DIR = path.resolve(__dirname, 'src');
const APP_DIR = path.resolve(__dirname, 'app');
const DIST_DIR = path.resolve(__dirname, 'dist');

function HTMLPlugin(name) {
  return new HtmlWebPackPlugin({
    template: `${APP_DIR}/${name}/template.html`,
    filename: `${DIST_DIR}/${name}/index.html`,
    chunks: [name],
  });
}

const buildPlugins = [
  new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
  new CopyWebpackPlugin({
    patterns: [
      { from: `${APP_DIR}/images`, to: `${DIST_DIR}/images/` },
      { from: `${APP_DIR}/vendor/fonts`, to: `${DIST_DIR}/fonts/` },
    ],
  }),
  HTMLPlugin('insights'),
  HTMLPlugin('infoCenter'),
  HTMLPlugin('licenses'),
  HTMLPlugin('options'),
  new MiniCssExtractPlugin({
    filename: '[name]/styles.css',
    chunkFilename: '[id].css',
  }),
  // Set `chrome` global for browsers that don't support it
  new webpack.BannerPlugin({
    banner: 'if(typeof browser!=="undefined"){chrome=browser;}',
    raw: true,
    include: /\.js$/
  }),
];

const config = {
  entry: {
    background: `${SRC_DIR}/background.js`,
    insights: `${APP_DIR}/insights/index.jsx`,
    injectionControl: `${APP_DIR}/content-scripts/injectionControl/index.js`,
    panel: `${APP_DIR}/content-scripts/panel/index.jsx`,
    performance: `${APP_DIR}/content-scripts/performanceTiming.js`,
    injectReloadPopup: `${APP_DIR}/content-scripts/injectReloadPopup.js`,
    infoCenter: `${APP_DIR}/infoCenter/index.jsx`,
    licenses: `${APP_DIR}/licenses/index.jsx`,
    options: `${APP_DIR}/options/index.jsx`,
  },
  output: {
    filename: '[name]/index.js',
    path: DIST_DIR,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: [SRC_DIR],
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              plugins: ['@babel/plugin-proposal-class-properties'],
            },
          },
          'eslint-loader',
        ],
      },
      {
        test: /\.(js|jsx)$/,
        include: [APP_DIR],
        use: ['babel-loader', 'eslint-loader'],
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
          options: {
            minimize: false,
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          {
            // This loader will compile all SCSS/CSS to a file.
            // We use this over 'style-loader' because loading SCSS/CSS as JavaScript
            // results in a larger bundle.
            // Additionally, we need a file for injecting styles into Shadow Dom.
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [AutoPrefixer],
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
  plugins: buildPlugins,
  devtool: 'none',
  watchOptions: {
    ignored: /node_modules/,
  },
};

module.exports = config;
