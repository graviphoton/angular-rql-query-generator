'use strict';

module.exports = function (grunt) {

  grunt.initConfig({

    meta: {
      pkg: grunt.file.readJSON('package.json'),
      src: {
        js: [
          // order is important!
          'src/angular-rql-query-generator.js'
        ]
      }
    },

    clean: {
      build: ['<%= destination_dir %>/bower_components', 'tmp', 'dist'],
      tmp: ['tmp']
    },

    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },

    concat: {
      options: {
        separator: ';',
        banner: '/*!\n' +
        ' * <%= meta.pkg.name %> - v<%= meta.pkg.version %>\n' +
        ' * <%= meta.pkg.homepage %>\n\n' +
        ' * License: <%= meta.pkg.license %>\n' +
        ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' */\n'
      },
      dist: {
        src: ['<%= meta.src.js %>', 'tmp/*.js'],
        dest: 'dist/<%= meta.pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        // Preserve banner
        preserveComments: 'some'
      },
      dist: {
        files: {
          'dist/<%= meta.pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    jshint: {
      files: ['src/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    copy: {
      dist: {
        expand: true,
        dot: true,
        cwd: 'images/',
        dest: 'dist/images/',
        src: ['**']
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');

  // TODO uncomment below and remove last line once unit tests are implemented
  //grunt.registerTask('default', ['clean:build', 'less', 'jshint', 'html2js', 'concat', 'clean:tmp', 'karma', 'uglify', 'copy']);
  grunt.registerTask('default', ['clean:build', 'jshint', 'concat', 'clean:tmp', 'uglify', 'copy']);

};