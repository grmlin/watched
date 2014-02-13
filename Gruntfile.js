/*global module:false*/
module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['lib/changed.js'],
        dest: 'dist/<%= pkg.name %>.v<%= pkg.version %>.js'
      }
    },
		includes: {
			dist: {
				src: ['lib/changed.js'],
				dest: 'dist/<%= pkg.name %>.v<%= pkg.version %>.js',
				options: {
					banner : '<%= banner %>',
					includeRegexp: /^(\s*)\/\/=\srequire\s+"(\S+)"\s*$/,
					duplicates: false,
					debug: true
				}
			}
		},
		traceur: {
			options: {
				experimental: true
			},
			dist: {
				src: ['lib/**/*.js'],
				dest: 'dist/<%= pkg.name %>.v<%= pkg.version %>.js'
			}
		},
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= includes.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.v<%= pkg.version %>.min.js'
      }
    },
    jshint: {
      options: grunt.file.readJSON('.jshintrc'),
      lib_test: {
        src: ['lib/{,*/}*.js']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'nyan'
        },
        src: ['test/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    }
  });

  

  // Default task.
  grunt.registerTask('default', [/*'mochaTest', */'traceur', 'uglify']);

  // Specific tasks
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('hint', ['jshint']);

};
