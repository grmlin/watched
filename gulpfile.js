var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var gzip = require("gulp-gzip");
var connect = require('gulp-connect');
var include = require('gulp-include');
var wrap = require("gulp-wrap");
var version = require('./package.json').version;

var browserify = require('browserify');
var transform = require('vinyl-transform');
var sourcemaps = require('gulp-sourcemaps');

//var browserified = transform(function(filename) {
//    var b = browserify(filename, {
//			standalone: 'watched'
//		});
//    return b.bundle();
//});

gulp.task('scriptsTest', function () {

	var browserified = transform(function(filename) {
		var b = browserify(filename, {
			standalone: 'watched',
			debug: false
		});
		return b.bundle();
	});

	return gulp.src('src/**/__tests__/*.js')
		.pipe(browserified)
		//.pipe(sourcemaps.init({loadMaps: true}))
		// Add transformation tasks to the pipeline here.
		//.pipe(uglify())
		//.pipe(sourcemaps.write())
		.pipe(concat('spec.js'))
		//.pipe(sourcemaps.init({loadMaps: true}))
		//.pipe(sourcemaps.write())
		.pipe(gulp.dest('./test/specs'));
});

gulp.task('javascript', function () {
	// transform regular node stream to gulp (buffered vinyl) stream
	return gulp.src('lib/watched.js')
		.pipe(browserified)
		.pipe(sourcemaps.init({loadMaps: true}))
		// Add transformation tasks to the pipeline here.
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('connect', function(){
	connect.server({
		root: ['test'],
		port: 8000,
		livereload: true
	})();
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
	gulp.watch(['src/**/*'], ['scriptsTest', 'reload']);
});

gulp.task('default', ['connect', 'scriptsTest', 'watch']);
gulp.task('build', ['uglify']);