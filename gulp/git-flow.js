'use strict';

var gulp = require('gulp');
var fs = require('fs');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'semver']
});

var version;
var priority;
var releaseBranch;

gulp.task('git-flow', ['mergeIntoDevelop'], function() {

});

gulp.task('mergeIntoDevelop', ['tagBranch'], function() {
  $.git.checkout('develop');
  $.git.merge('master');
});

gulp.task('tagBranch', ['mergeIntoMaster'], function() {
  $.git.tag(version, 'Merge branch ' + releaseBranch);
});

gulp.task('mergeIntoMaster', ['commitBump'], function() {
  $.git.checkout('master');
  $.git.merge(releaseBranch);
});

gulp.task('commitBump', ['bump', 'createReleaseBranch'], function() {
  return gulp.src(['package.json', 'bower.json'])
    .pipe($.git.add())
    .pipe($.git.commit('Version bump'));
});

gulp.task('bump', ['setVersion'], function() {
  return gulp.src(['package.json', 'bower.json'])
    .pipe($.bump({type: priority}))
    .pipe(gulp.dest('./'));
});

gulp.task('createReleaseBranch', ['setVersion'], function() {
  releaseBranch = 'release/' + version;
  $.git.checkout(releaseBranch, {args: '-b'});
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
