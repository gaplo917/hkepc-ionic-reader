browserify -r node_modules/cheerio/index.js:cheerio  > cheerio-bundle.js
cp cheerio-bundle.js www/lib/cheerio/cheerio-bundle.js