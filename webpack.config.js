/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = (env, argv) => ({
  mode: "development",
  entry: "./src/web/index.tsx",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "babel-loader",
      },
      {
        // ESM dependencies (csv-parse, csv-stringify) import node polyfills without extension
        test: /\.m?js$/,
        resolve: { fullySpecified: false },
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
  devtool: argv.mode === "production" ? false : "inline-source-map",
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.EnvironmentPlugin({
      SF_USERNAME: process.env.SF_USERNAME ?? "",
      SF_PASSWORD: process.env.SF_PASSWORD ?? "",
      SF_LOGIN_URL: process.env.SF_LOGIN_URL ?? "",
      SF_AJAX_PROXY: process.env.SF_AJAX_PROXY ?? "",
    }),
  ],
});
