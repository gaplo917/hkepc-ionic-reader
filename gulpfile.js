const browserify = require('browserify');
const babelify = require('babelify');
const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const run = require('gulp-run');
const webserver = require('gulp-webserver')
const stripDebug = require('gulp-strip-debug');
const minify = require('gulp-minify');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename')
const ngAnnotate = require('gulp-ng-annotate');
const minifyCss = require('gulp-minify-css')

function onError(err) {
  console.log(err.message)
  this.emit('end')
}

gulp.task('browserify', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './src/es6/core/app.js',
    insertGlobals : true,
    debug: false,
    // defining transforms here will avoid crashing your stream
    transform: [
      babelify.configure({
        presets: ["es2015"]
      })
    ]
  })

  return b
      .bundle()
      .on('error', onError)
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      // Add transformation tasks to the pipeline here.
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./www/js/'))
})


gulp.task('webserver',() => {
  return gulp.src('./www')
      .pipe(webserver({
        host: '0.0.0.0',
        port: 3000,
        livereload: true,
        open: true,
      }))
})

gulp.task('sass', function() {
  return gulp.src(['./src/scss/ionic.app.scss','./src/scss/ionic.app.dark.scss'])
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
})

gulp.task('watch', function() {
  gulp.watch(['./src/es6/**/*.js'], ['browserify'])
  gulp.watch(['./src/scss/**/*'], ['sass'])
})

gulp.task('compress', function(done) {
  return gulp.src('./www/js/app.js')
      .pipe(ngAnnotate())
      .pipe(stripDebug())
      .pipe(uglify({mangle: false}))
      .pipe(gulp.dest('./www/js/'))
      .on('end', done)

})

gulp.task('build', ['browserify','sass'])

gulp.task('release', ['build','compress'])

gulp.task('run', ['build','watch','webserver'])