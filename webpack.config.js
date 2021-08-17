/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/web/index.tsx",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "babel-loader",
      },
    ],
  },
  output: {
    filename: "migration-app-pack.js",
    path: __dirname + "/dist",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  devtool: "inline-source-map",
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.EnvironmentPlugin({
      SF_USERNAME: process.env.SF_USERNAME ?? "",
      SF_PASSWORD: process.env.SF_PASSWORD ?? "",
      SF_LOGIN_URL: process.env.SF_LOGIN_URL ?? "",
      SF_AJAX_PROXY: process.env.SF_AJAX_PROXY ?? "",
    }),
  ],
};
