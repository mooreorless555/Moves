REM call ionic cordova platform remove android
REM call ionic cordova plugin remove cordova-plugin-facebook4
REM call ionic cordova plugin add cordova-plugin-facebook4

REM call npm cache clean
rmdir /s node_modules
call npm cache clean
call npm cache clear
call npm uninstall -g ionic
call npm install
call npm install -g ionic@latest
call npm install @ionic/app-scripts@latest
call npm install ionic-angular@latest
call npm install @ionic-native
call npm install @ionic-native/core
call npm install @ionic-native/facebook
call npm install @ionic-native/status-bar
call npm install @ionic-native/splash-screen
call npm install @ionic-native/native-audio
call npm install @ionic-native/background-mode
call npm install @ionic-native/background-geolocation
call npm install @ionic-native/geolocation
REM call npm install @ionic-native/geofence
REM call ionic serve --lab