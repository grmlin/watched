var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var gzip = require("gulp-gzip");
var connect = require('gulp-connect');
var include = require('gulp-include');
var wrap = require("gulp-wrap");


gulp.task('connect', connect.server({
	root: ['test'],
	port: 8000,
	livereload: true
}));

gulp.task('scripts', function() {

	gulp.src('lib/changed.js')
		.pipe(include())
		.pipe(gulp.dest('./dist'))
		.pipe(gulp.dest('./test/lib'))
		.pipe(connect.reload());
});

gulp.task('uglify', function() {
	gulp.src('dist/changed.js')
		.pipe(wrap({ src: 'umdWrapper.tpl'}))
		.pipe(uglify({
			outSourceMap: false,
			mangle: true
		}))
		.pipe(rename({
			suffix: ".min"
		}))
		.pipe(gulp.dest('dist'))
});

gulp.task("compress", function() {
	gulp.src("dist/changed.min.js")
		.pipe(gzip())
		.pipe(gulp.dest("dist"));
});

gulp.task("reload", function(){
	connect.reload();
});

gulp.task('watch', function () {
	gulp.watch(['lib/**/*'], ['scripts']);
	gulp.watch(['test/spec/**/*.js'], ['reload']);
});

gulp.task('default', ['connect', 'scripts', 'watch']);
gulp.task('build', ['scripts', 'uglify', 'compress']);