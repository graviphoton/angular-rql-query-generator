'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep');

var paths = gulp.paths;

function runTests(singleRun) {
  var bowerDeps = wiredep({
    directory: 'bower_components',
    exclude: [],
    dependencies: true,
    devDependencies: true
  });

  var testFiles = bowerDeps.js.concat([
    paths.src + '/*.js',
    paths.test + '/*.js'
  ]);

  gulp.src(testFiles)
    .pipe($.karma({
      configFile: 'karma.conf.js',
      action: (singleRun) ? 'run' : 'watch'
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
}

gulp.task('test', function() {
  runTests(true /* singleRun */);
});
gulp.task('test:auto', function() {
  runTests(false /* singleRun */);
});
