const path = require('path');
const webpack = require('webpack');
const THEMENAME = '{{ themeName }}';
let entry = [];
let output = {};
let plugins = [];
let mode = 'development';

if (process.env.NODE_ENV == 'production') {
	entry = [`${__dirname}/wp-content/themes/${THEMENAME}/src/js/app.js`];
	output = {
		filename: 'bundle.min.js',
		path: path.resolve(__dirname, `wp-content/themes/${THEMENAME}/assets/js/`),
	};
	plugins = [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		})
	];
	mode = 'production';
} else if (process.env.NODE_ENV == 'staging') {
    entry = [`${__dirname}/wp-content/themes/${THEMENAME}/src/js/app.js`];
    output = {
		filename: 'bundle.js',
		path: path.resolve(__dirname, `wp-content/themes/${THEMENAME}/assets/js/`)
	}
	plugins = [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		})
	];
} else {
    entry = [`webpack-hot-middleware/client`,`webpack/hot/dev-server`,`${__dirname}/wp-content/themes/${THEMENAME}/src/js/app.js`];
    output = {
		filename: 'bundle.js',
		path: path.resolve(__dirname, `wp-content/themes/${THEMENAME}/assets/js/`),
		publicPath: `http://localhost:3000/wp-content/themes/${THEMENAME}/assets/js/`
	}
	plugins = [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		}),
		new webpack.HotModuleReplacementPlugin()
	];
}

module.exports = {
	entry: entry,
	output: output,
	mode: mode,
	module: {
	  rules: [
	    {
	      test: /\.js$/,
	      exclude: /(node_modules|bower_components)/,
	      use: {
	        loader: 'babel-loader',
	        options: {
	          presets: ['env']
	        }
	      }
	    }
	  ]
  },
  plugins: plugins,
  externals: {
		jquery: 'window.jQuery'
  }
};
