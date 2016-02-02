# Dependencies

		// Clone Repo
		git clone https://github.com/gaplo917/hkepc-ionic-reader
		
		cd hkepc-ionic-reader
		
		npm install
		
		bower install
		
		// install ionic
		npm install ionic -g
		
		// install cordova
		npm install cordova -g

		// Use node modules
		npm install browserify -g
		
		// Build modules
		npm install gulp -g

		// ES6 -> ES5
		npm install --save-dev babelify
		npm install --save-dev babel-preset-es2015 babel-preset-react



# Run
		// run in Web (please ensure you disable CORS checking in browser)
		sh es6-transpile.sh  
		
		// [Optional] if you have err ,please try 
		mkdir www/js
		
		// run in web
		ionic serve
		
		// run in ios
		sh build-ios.sh
        

# Splash & icon generation

		brew install imagemagick && sudo npm i -g ticons
		
		// template command
		ticons icons path/to/image.png --output-dir path/to/your/project --alloy --platforms iphone,ipad,android
        
        ticons splashes path/to/image.png --output-dir path/to/your/project --alloy --platforms iphone,ipad,android