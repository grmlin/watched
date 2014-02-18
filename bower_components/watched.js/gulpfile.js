var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var gzip = require("gulp-gzip");
var connect = require('gulp-connect');
var include = require('gulp-include');
var wrap = require("gulp-wrap");
var version = require('./package.json').version;

gulp.task('connect', function(){
	connect.server({
		root: ['test'],
		port: 8000,
		livereload: true
	})();
});

gulp.task('scriptsTest', function () {
	gulp.src('lib/watched.js')
			.pipe(include())
			.pipe(gulp.dest('./test/lib'));
			//.pipe(wrap({ src: 'umdWrapper.tpl'}))
			//.pipe(gulp.dest('./dist'))
});

gulp.task('uglify', function () {
	gulp.src('lib/watched.js')
			.pipe(include())
			.pipe(wrap({ src: 'build/umdWrapper.tpl'}))
			.pipe(wrap({ src: 'build/licenseHeader.tpl'}, { version: version}, { variable: 'data' }))
			.pipe(gulp.dest('./dist'))
			.pipe(uglify({
				outSourceMap: false,
				mangle: true
			}))
			.pipe(wrap({ src: 'build/licenseHeader.tpl'}, { version: version}, { variable: 'data' }))
			.pipe(rename({
				suffix: ".min"
			}))
			.pipe(gulp.dest('dist'))
			.pipe(gzip())
			.pipe(gulp.dest("dist"));
});

gulp.task("compress", function () {
	gulp.src("dist/watched.min.js")
			.pipe(gzip())
			.pipe(gulp.dest("dist"));
});

gulp.task("reload", function () {
	gulp.src('lib/watched.js')
			.pipe(connect.reload());
});

gulp.task('watch', function () {
	gulp.watch(['lib/**/*'], ['scriptsTest', 'reload']);
	gulp.watch(['test/spec/**/*.js'], ['reload']);
});

gulp.task('default', ['connect', 'scriptsTest', 'watch']);
gulp.task('build', ['uglify']);