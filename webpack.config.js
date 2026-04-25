const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        backgroundScript: './src/backgroundScript.ts',
        injectedScript: './src/injectedScript.ts',
        offscreen: './src/offscreen.ts',
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },

    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'public/offscreen.html',
                    to: 'offscreen.html',
                },
            ],
        }),
    ],

    devtool: 'inline-source-map',
};
