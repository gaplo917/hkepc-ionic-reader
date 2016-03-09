var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var babel = require("gulp-babel");
var plumber = require("gulp-plumber");
var browserSync = require('browser-sync').create();

var paths = {
  es6: ['./www/js/**/*.js'],
  sass: ['./scss/**/*.scss']
};

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "./www/"
    }
  });

  gulp.watch(paths.sass, ['sass',browserSync.reload]);
});

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src(['./scss/ionic.app.scss','./scss/ionic.app.dark.scss'])
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

//gulp.task("babel", function () {
//  return gulp.src(paths.es6)
//    .pipe(plumber())
//    .pipe(babel({presets: ['es2015']}))
//    .pipe(gulp.dest("www/js"));
//});

gulp.task('watch', function() {
  gulp.watch(paths.es6, []);
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
