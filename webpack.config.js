const path = require("path");

module.exports = {
  entry: {
    backgroundScript: "./out/backgroundScript.js",
    injectedScript: "./out/injectedScript.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
};
