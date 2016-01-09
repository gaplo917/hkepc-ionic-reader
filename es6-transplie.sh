browserify ./src/es6/**/*.js -o www/js/bundle.js  -t [ babelify --presets [ es2015 react ] ]
