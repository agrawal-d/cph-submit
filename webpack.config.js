const path = require("path");

module.exports = {
  entry: {
    backgroundScript: "./src/backgroundScript.ts",
    injectedScript: "./src/injectedScript.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  devtool: 'inline-source-map'
};
