'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'uglify-save-license']
});

gulp.task('lint', function() {
  var lintTaks = gulp.src('{gulp,src,test}/*.js')
    .pipe($.jshint())
    .pipe($.jscs())
    .pipe($.jshint.reporter('jshint-stylish'));

  // only fail on this if not in serve-mode
  if (this.seq.slice(-1)[0] !== 'serve') {
    lintTaks.pipe($.jshint.reporter('fail'));
  }

  return lintTaks;
});

gulp.task('minify', [], function() {
  return gulp.src(paths.src + '/*.js')
    .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.dist + '/'));
});

gulp.task('build', ['minify']);
