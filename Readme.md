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


# Run
		// init ionic
		ionic state reset

		// build the .js .scss files
		sh build.sh  
		
		// run in web
		ionic serve
		
		// run in ios
		sh build-ios.sh
        
# Cordova Platform
		// only work for this two version...
		ionic platforms add ios@3.9.2 (Cordova 5.4.2)
		
		// android 6.0.0 version has bug on locating the icon & splash image
		// use 5.2.2 instead and update to 6.x.x later 
		ionic platforms add android@5.2.2 
		ionic platform update android@6.0.0
		ionic platform update android@6.2.2 (Cordova 7)