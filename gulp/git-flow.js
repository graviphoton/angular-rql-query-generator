'use strict';

var gulp = require('gulp');
var fs = require('fs');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'semver']
});

var version;
var priority;

gulp.task('git-flow', ['createReleaseBranch', 'commitBump'], function() {

});

gulp.task('commitBump', ['bump', 'createReleaseBranch'], function() {
  return gulp.src(['package.json', 'bower.json'])
    .pipe($.git.add())
    .pipe($.git.commit(version));
});

gulp.task('bump', ['setVersion'], function() {
  return gulp.src(['package.json', 'bower.json'])
    .pipe($.bump({type: priority}))
    .pipe(gulp.dest('./'));
});

gulp.task('createReleaseBranch', ['setVersion'], function() {
  $.git.checkout('release/' + version, {args: '-b'});
});

gulp.task('setVersion', ['promptPriority'], function() {
  var currentVersion = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  version = 'v' + $.semver.inc(currentVersion, priority);
});

gulp.task('promptPriority', ['checkoutDevelop'], function() {
  console.warn('This command will tag your repo. Please abort if you don\'t understand this.');
  return gulp.src('*')
    .pipe($.prompt.prompt({
      type: 'list',
      name: 'priority',
      message: 'What type of bump would you like to do?',
      choices: ['patch', 'minor', 'major']
    }, function(res) {
      priority = res.priority;
    }));
});

gulp.task('checkoutDevelop', function() {
  // $.git.checkout('develop');
});
