const gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	cmq = require('gulp-merge-media-queries'),
	rename = require('gulp-rename'),
	browserSync = require('browser-sync'),
	plumber = require('gulp-plumber'),
	webpack = require('webpack'),
	webpackDevMiddleware = require('webpack-dev-middleware'),
	webpackHotMiddleware = require('webpack-hot-middleware'),
	webpackConfig = require(`${__dirname}/webpack.config.js`);
    svgmin = require('gulp-svgmin'),
    svgstore = require('gulp-svgstore'),
	inject = require('gulp-inject'),
	purgecss = require('gulp-purgecss'),
	cleancss = require('gulp-clean-css');

const THEMENAME = '{{ themeName }}';
const SITEURL = '{{ siteUrl }}'; //pull from .env file?

const paths = {
	styles: {
		src: `${__dirname}/wp-content/themes/${THEMENAME}/src/scss/style.scss`,
		dest: `${__dirname}/wp-content/themes/${THEMENAME}/assets/css/`,
		watch: `${__dirname}/wp-content/themes/${THEMENAME}/src/scss/**/*.scss`
	},
	twig: {
		watch: `${__dirname}/wp-content/themes/${THEMENAME}/views/**/*.twig`
	},
	php: {
		watch: `${__dirname}/wp-content/themes/${THEMENAME}/**/*.php`
	},
    svg: {
        src: `${__dirname}/wp-content/themes/${THEMENAME}/src/img/svgs/**/*.svg`,
        templateSrc: `${__dirname}/wp-content/themes/${THEMENAME}/src/img/gulp-svg-sprite-template.twig`,
        dest: `${__dirname}/wp-content/themes/${THEMENAME}/views/components/`
    }
};

//stops purgecss from removing special charcatcers, in our case colons and slashes
class CustomExtractor {
	static extract(content) {
		return content.match(/[A-z0-9-:\/]+/g) || [];
	}
}

//swallow dat error!
function swallow(err) {
	console.log(err);
	this.emit('end');
}

gulp.task('styles', () => {
	return gulp.src(paths.styles.src)
	.pipe(plumber({ errorHandler: swallow }))
	.pipe(sass())
	.pipe(autoprefixer())
	.pipe(cmq())
	.pipe(rename('style.css'))
	.pipe(gulp.dest(paths.styles.dest))
	.pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('css:purge', () => {
	return gulp.src(`${paths.styles.dest}style.css`)
	.pipe(purgecss({
		content: [paths.twig.watch],
		extractors: [{
			extractor: CustomExtractor,
			extensions: ['twig','html','js','vue','tag']
		}],
		whitelistPatterns: [],
		whitelistPatternsChildren: [] //use a regex - /gfield_wrap/ - this would let through gfield_wrap and all it's children
	}))
	.pipe(cleancss())
	.pipe(rename('style.min.css'))
	.pipe(gulp.dest(paths.styles.dest))
});

gulp.task('svg:store', () => {
    return gulp.src(paths.svg.src)
    .pipe(svgmin({
        js2svg: {
            pretty: true
        },
        plugins: [
            // {
            //     removeStyleElement: true
            // }
        ]
    }))
    .pipe(svgstore())
    .pipe(inject(gulp.src(paths.svg.templateSrc)))
    .pipe(rename('svg-sprite.twig'))
    .pipe(gulp.dest(paths.svg.dest));
});

gulp.task('webpack', () => {
    let compiler = webpack(webpackConfig);
});

gulp.task('webpack:dev-server', () => {
	let compiler = webpack(webpackConfig);

	gulp.watch(paths.styles.watch, ['styles']);

	browserSync.init({
		proxy: {
			target: `http://${SITEURL}/`
		},
		middleware: [
			webpackDevMiddleware(compiler, {
				publicPath: compiler.options.output.publicPath,
				noInfo: true,
				stats: {colors: true, errorsOnly: true}
			}),
			webpackHotMiddleware(compiler)
		],
		files: [
			paths.twig.watch,
			paths.php.watch
		],
		notify: false
	});
});
