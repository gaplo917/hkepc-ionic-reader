# Dependencies

		// Use node modules
		npm install browserify -g
		
		// Build modules
		npm install gulp -g

		// ES6 -> ES5
		npm install --save-dev babelify
		npm install --save-dev babel-preset-es2015 babel-preset-react

		// In App browser plugin
		cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git --save



# Run
		// run in Web (please ensure you disable CORS checking in browser)
		sh es6-transpile.sh
		ionic serve
		
		// run in ios
		sh build-ios.sh

# Splash & icon generation

		brew install imagemagick && sudo npm i -g ticons
		
		// template command
		ticons icons path/to/image.png --output-dir path/to/your/project --alloy --platforms iphone,ipad,android
        
        ticons splashes path/to/image.png --output-dir path/to/your/project --alloy --platforms iphone,ipad,android