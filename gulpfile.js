const browserify = require('browserify')
const babelify = require('babelify')
const gulp = require('gulp')
const stripDebug = require('gulp-strip-debug')
const sass = require('gulp-sass')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const ngAnnotate = require('gulp-ng-annotate')
const minifyCss = require('gulp-minify-css')
const browserSync = require('browser-sync').create()

function onError (err) {
  console.log(err.message)
  this.emit('end')
}
gulp.task('bundle-dependencies', function () {
  const b = browserify({
    entries: './src/dependencies.js',
    insertGlobals: true,
    debug: false,
    // defining transforms here will avoid crashing your stream
    transform: [
      babelify.configure({
        plugins: ['transform-object-rest-spread', 'transform-async-to-generator'],
        presets: ['es2015']
      })
    ]
  })

  return b
    .bundle()
    .on('error', onError)
    .pipe(source('dependencies.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./www/js/'))
})

gulp.task('browserify', function () {
  // set up the browserify instance on a task basis
  const b = browserify({
    entries: './src/es6/core/app.js',
    insertGlobals: true,
    debug: false,
    // defining transforms here will avoid crashing your stream
    transform: [
      babelify.configure({
        plugins: ['transform-object-rest-spread', 'transform-async-to-generator'],
        presets: ['es2015']
      })
    ]
  })

  return b
    .bundle()
    .on('error', onError)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./www/js/'))
})

gulp.task('webserver', function () {
  return browserSync.init({
    port: 4000,
    server: {
      baseDir: './www'
    }
  })
})

gulp.task('webserverReload', function (done) {
  browserSync.reload()
  done()
})

gulp.task('sass', function () {
  return gulp.src(['./src/scss/ionic.app.scss', './src/scss/ionic.app.dark.scss', './src/scss/ionic.app.oled.dark.scss'])
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(browserSync.stream())
})

gulp.task('watchDependencies', function () {
  return gulp.watch(['./src/dependencies.js', './src/ionic/**/*.js'], gulp.series(['bundle-dependencies']))
})

gulp.task('watchJs', function () {
  return gulp.watch(['./src/es6/**/*'], gulp.series(['browserify']))
})

gulp.task('watchSass', function () {
  return gulp.watch(['./src/scss/**/*'], gulp.series(['sass']))
})

gulp.task('watchAsset', function () {
  return gulp.watch(['./www/**/*.html', './www/**/*.js']).on('change', browserSync.reload)
})

gulp.task('watch', gulp.parallel(['watchDependencies', 'watchJs', 'watchSass', 'watchAsset']))

gulp.task('compressCss', function () {
  return gulp.src(['./www/css/ionic.app.css', './www/css/ionic.app.dark.css'])
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(gulp.dest('./www/css/'))
})
gulp.task('compressJs', function () {
  return gulp.src('./www/js/app.js')
    .pipe(ngAnnotate())
    .pipe(stripDebug())
    .pipe(uglify({ mangle: false }))
    .pipe(gulp.dest('./www/js/'))
})

gulp.task('build', gulp.parallel(['bundle-dependencies', 'browserify', 'sass']))

gulp.task('release', gulp.series(['build', 'compressJs', 'compressCss']))

gulp.task('run', gulp.parallel(['build', 'watch', 'webserver']))
