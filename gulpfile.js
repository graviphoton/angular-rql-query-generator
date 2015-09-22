'use strict';

var gulp = require('gulp');

gulp.paths = {
  src: 'src',
  dist: 'dist',
  test: 'test'
};

require('require-dir')('./gulp');

gulp.task('default', [], function () {
  gulp.start('test');
});
