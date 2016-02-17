browserify ./src/es6/**/*.js -o build/bundle.js  -t [ babelify --presets [ es2015 react ] ]
cp build/bundle.js www/js/bundle.js
