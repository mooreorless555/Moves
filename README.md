# Moves
### *(reuploaded)*
(To view remnants of Moves-past, visit the older repos: [MOVESYALEv2](https://github.com/mooreorless555/MOVESYALEv2), [MOVESYALE](https://github.com/mooreorless555/MOVESYALE))
#### Start date: September 13th, 2016



![MOVES TITLE IMAGE](/src/assets/img/MOVES_logo_git.png "Moves Logo")

**Moves** (at Yale University) is a mobile app written in the [Ionic Framework](http://ionicframework.com/) that will allow you to see analytics of events on campus (with a focus on parties at the moment.) Through GPS tracking, users will be able to see:
- how many people are at a party
- traffic flow in and out of the party
- and who of their Facebook friends are there 

before they make the decision to go or not. All of this is presented in realtime. 

The app is supposed to be lightweight (we know you'll be out and about) and give you the information you need when you want it and in a presentable and clean way! I have and am spending a lot of time on the UI/UX to make this the case. Having said that, the interface and general design will continue to be changed and improved upon until it's as pleasing and functional as possible. Finally, the app's premise hangs on the notion that a lot of people will have it installed.

--------

### Screenshots

#### Login
<img src="/screenshots/login.png" width="300"><img src="/screenshots/login_02.png" width="300">

#### Hub
<img src="/screenshots/hub.png" width="300"><img src="/screenshots/hub_02.png" width="300">

#### Information (stats)
<img src="/screenshots/info.png" width="300"><img src="/screenshots/info_02.png" width="300">

#### Make a Move!
<img src="/screenshots/make.png" width="300">

Same Moves app, new repo! (For the THIRD TIME! OMG.) Chris (AKA me) and Sam diverged too much on our own without making commits, had an issue with FB authentication and therefore Chris used what was on the Git and manually fixed all merges as well as overhauled the code structure. Later, Chris added a bunch of new additions to stabilize the login, home, and stats pages as well as new native plugins!

If you're collabing and want to get up and running, make sure you've already installed cordova and ionic.

- Download this repo.
- cd to this repo and run

```
movesupdate.bat && updatepackage.bat
```

If you're getting errors, you may be missing some native plugins.

---
## Native Plugins
You need to install these plugins for the app to be fully functional.

```
ionic plugin add cordova-plugin-facebook4 --variable APP_ID="xxxxxxxxxxxxxx" --variable APP_NAME="name"
```
Ask me personally for the APP_ID and APP_NAME.
```
ionic plugin add cordova-plugin-geolocation
```
```
ionic plugin add cordova-plugin-mauron85-background-geolocation
```
```
ionic plugin add cordova-plugin-statusbar
```
```
ionic plugin add cordova-plugin-splashscreen
```

## Other Plugins
Also these...
```
npm install --save sweetalert2
```
```
npm install --save toastr
```

If you have any questions just message me!
