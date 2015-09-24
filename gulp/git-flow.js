'use strict';

var fs = require('fs');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*']
});

function bump(src, releaseType) {
  return src
    .pipe($.bump({type: releaseType}))
    .pipe(gulp.dest('./'));
}

gulp.task('git-flow', ['bump', 'createReleaseBranch'], function() {
  console.log('test');
});

gulp.task('bump', function () {
  var src = gulp.src(['package.json', 'bower.json'])
    .pipe($.prompt.prompt({
      type: 'list',
      name: 'bump',
      message: 'What type of bump would you like to do?',
      choices: ['patch', 'minor', 'major']
    }, function (res) {
      src
        .pipe($.bump({type: res.bump}))
        .pipe(gulp.dest('./'));
    }));
  return src;
});

gulp.task('createReleaseBranch', ['bump'], function() {
  var json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  var version = json.version;
  $.git.checkout('release/' + version, {args:'-b'});
});
