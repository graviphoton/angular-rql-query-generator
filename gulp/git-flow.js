'use strict';

var gulp = require('gulp');
var fs = require('fs');
var semver = require('semver');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*']
});

var version;
var priority;

gulp.task('git-flow', ['createReleaseBranch', 'bump'], function() {
  return gulp.src(['package.json', 'bower.json'])
    .pipe($.git.add())
    .pipe($.git.commit('v' + version));
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
  version = semver.inc(currentVersion, priority);
});

gulp.task('promptPriority', function() {
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
