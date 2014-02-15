var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var gzip = require("gulp-gzip");
var connect = require('gulp-connect');
var include = require('gulp-include');
var wrap = require("gulp-wrap");

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
			.pipe(gulp.dest('./test/lib'))
			.pipe(wrap({ src: 'umdWrapper.tpl'}))
			.pipe(gulp.dest('./dist'))
});

gulp.task('uglify', function () {
	gulp.src('lib/watched.js')
			.pipe(include())
			.pipe(gulp.dest('./dist'))
			.pipe(wrap({ src: 'umdWrapper.tpl'}))
			.pipe(uglify({
				outSourceMap: false,
				mangle: true
			}))
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