import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, App, ViewController } from 'ionic-angular';
import { LoginProvider, MoveUser } from '../providers/login-provider';
import { MovesProvider } from '../providers/moves-provider';
import { LocationTracker } from '../providers/location-tracker'
import { NotificationProvider } from '../providers/notification-provider';
import { ServerStatusProvider } from '../providers/server-status-provider';
import { SoundProvider } from '../providers/sound-provider';
import { Facebook } from '@ionic-native/facebook';
import { SplashScreen } from "@ionic-native/splash-screen";
import { Geofence } from "@ionic-native/geofence";
import { NativeStorage } from "@ionic-native/native-storage";
import { OneSignal } from "@ionic-native/onesignal";
import { StatusBar } from "@ionic-native/status-bar";
import { AppMinimize } from '@ionic-native/app-minimize';
import { TabsPage } from '../pages/tabs/tabs';
import { System, Globals } from '../pages/functions/functions';
import firebase from 'firebase';
import { NativeAudio } from '@ionic-native/native-audio';
import { HeaderColor } from '@ionic-native/header-color';
import { LoginPage } from '../pages/login/login';
import { Keyboard } from '@ionic-native/keyboard';
import { Deploy } from '@ionic/cloud-angular';
import ImgCache from 'imgcache.js';

declare var ProgressBar: any;
declare var swal: any;

@Component({
  template: `<ion-nav style="transition: all ease 0.6s" [root]="rootPage"></ion-nav>
             <div id="full-app-loading-screen" class="app-loading-screen bg">
              <div class="app-loading-screen container">
                <div id="loader-container" class="app-loading-screen loader"></div>
                <div id="text-container" class="app-loading-screen text"></div>
              </div>
             </div>
             `,
  providers: [System, Globals, Nav]
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  @ViewChild(ViewController) viewCtrl: ViewController;

  rootPage: LoginPage;
  notificationReroute: number = 0;

  loaderInterval: any;
  loadIsDone: boolean = false;

  ngAfterViewInit() {
    this.showLoadingScreen();
    this.showLoadingText(this.globals.loadingMsg());
  }


  constructor(public platform: Platform,
    public deploy: Deploy,
    public keyboard: Keyboard,
    public system: System,
    public globals: Globals,
    public app: App,
    public appMinimize: AppMinimize,
    public headerColor: HeaderColor,
    public facebook: Facebook,
    public na: NativeAudio,
    public geofence: Geofence,
    public oneSignal: OneSignal,
    public lt: LocationTracker,
    public loginProvider: LoginProvider,
    public serverStatus: ServerStatusProvider,
    public sound: SoundProvider,
    public mp: MovesProvider,
    public mUser: MoveUser,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public np: NotificationProvider,
    public ns: NativeStorage) {
  

  //   let firebaseConfig = {
  //     apiKey: "AIzaSyANmdr_oNcjak8eVKUI7esAoyk4mtWKD-M",
  //     authDomain: "moves-ad1b4.firebaseapp.com",
  //     databaseURL: "https://moves-ad1b4.firebaseio.com",
  //     projectId: "moves-ad1b4",
  //     storageBucket: "moves-ad1b4.appspot.com",
  //     messagingSenderId: "583373480587"
  //   };

  // firebase.initializeApp(firebaseConfig)

      $('ion-nav').addClass('invisible');
      if (this.platform.is('cordova')) splashScreen.hide();
      setTimeout(() => {

    // this.system.apploader(this.globals.loadingMsg());
    this.platform.ready().then(() => {

      /******************** */
      statusBar.backgroundColorByHexString('#886cef');
      this.headerColor.tint('#886cef');

    if (this.platform.is('cordova')) {
      this.keyboard.disableScroll(false);
      this.checkForUpdates();
    } else {
      // // this.system.loader.dismiss();
      // this.setCurrentCollege();
      this.checkStatus();
    }
  });

    }, 3000)
    this.platform.registerBackButtonAction(() => {
  let activeVC = this.nav.getActive()
  let page = activeVC.instance

  if (!this.mp.modalOn) {
    if (page instanceof LoginPage) {
      /* You pressed BACK on the login page */
      this.mp.storeLocation();
      this.platform.exitApp()
    } else if (page instanceof TabsPage) {
      /* You pressed BACK on Home/Maps page */
      this.mp.storeLocation();
      this.appMinimize.minimize()
    } else {
      /* You pressed BACK anywhere else */
      // this.system.dismissKeyboard();
      swal.close();
      this.nav.pop()
    }
  }

})

    // window.addEventListener('native.keyboardshow', function(e){ 
    // setTimeout(function() {
    //     document.activeElement.scrollIntoView()
    // }, 100);
    // });
    

  }

  setCurrentCollege() {
    let myLat = this.lt.lat;
    let myLng = this.lt.lng;

    // Check distance from each college
    let colleges = this.globals.colleges;
    for (let college of colleges) {
      let collegeLat = college.location.lat;
      let collegeLng = college.location.lng;
      let dist = this.lt.calculateDistance(myLat, myLng, collegeLat, collegeLng);

      if (dist <= 4828)
        this.lt.currentCollege = college;
    }

    this.lt.currentCollege = {
      key: "yale"
    }
  }

listenForVal() {
  let ref = firebase.database().ref('/serverInfo/')
}

checkForUpdates() {
  // // this.system.apploader('Checking for updates...');
  this.deploy.check().then((snapshotAvailable) => {
    if (snapshotAvailable) {
      // this.system.loader.dismiss();
      // this.system.apploader(this.globals.ui.updating[Math.floor(Math.random() * this.globals.ui.updating.length)]);
      this.showLoadingText(this.globals.ui.updating[Math.floor(Math.random() * this.globals.ui.updating.length)]);
      this.deploy.download().then(() => {
        // this.system.loader.dismiss();
        // this.system.apploader("Installing...let's gooo~");
        this.showLoadingText("Installing...let's gooo~");
        this.deploy.extract().then(() => {
          this.deploy.getSnapshots().then(snapshots => {
            this.deploy.info().then(currentSnapshotInfo => {
              let activeUuid = currentSnapshotInfo.deploy_uuid;
              for (let suuid of snapshots) {
                if (suuid !== activeUuid) {
                  this.deploy.deleteSnapshot(suuid);
                }
              }
              // this.system.loader.dismiss();
              // this.system.apploader("OK, restarting now.");
              this.showLoadingText("OK, restarting now.");
              setTimeout(() => this.hideLoadingScreen(), 1000);
              setTimeout(() => {
                // this.system.loader.dismiss();
                this.deploy.load()
              }, 2500);
            })
          })

        })
      });
    } else {
      // // this.system.loader.dismiss();
      this.checkStatus();
    }
  });
}


checkVersion(client) {
  let g = this.globals
  // // this.system.apploader(g.ui.versionval)
  let server = firebase.database().ref('serverInfo/version')
  server.once('value', v => {
    if (v.val() != client) {
      /* Version number mismatch */
      // this.system.loader.dismiss()
      this.system.versionAlert('Hey! Your version number (' + client + ') is outdated. Please hit up the app store to update to the latest build!', 'Outdated Version', 'OK');
    } else {
      /* User has correct version! */
      // // this.system.loader.dismiss()
      this.checkStatus()
    }
  }).catch(e => {
    this.system.simpleAlert(e, "Aw man!", "Aiiight.", this.platform.exitApp);
  })
}

checkStatus() {
  let g = this.globals
  let server = firebase.database().ref('serverInfo/status')
  // // this.system.apploader(g.ui.status)
  server.once('value', s => {
    let status = s.val()
    if (status.type != 1) {
      let msg = ''
      switch (status.type) {
        case 0:
          msg = 'Server is down for maintanenance. Please check back later!';
          break;
        case 2:
          msg = status.message;
          break;
      }
      // this.system.loader.dismiss();
      this.system.simpleAlert(msg, 'Server Locked', 'Got it!', this.platform.exitApp)
    } else {
      this.serverStatus.run();
      this.checkLoginState(this)
    }
  })
}

checkLoginState(me) {



  let fade_options = {
    "duration": 700, // in milliseconds (ms), default 400
    "iosdelay": 50, // ms to wait for the iOS webview to update before animation kicks in, default 60
    "androiddelay": 100
  };

  let g = me.globals
  let unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      /* You are logged in. */
      unsubscribe();
      me.ns.getItem('accessToken').then(token => {
        // me.system.appLoader(g.ui.loading[Math.floor(Math.random() * g.ui.loading.length)])
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(token);
        var params = new Array();
        var g = me.globals.fb;
        return Promise.all([firebase.auth().signInWithCredential(facebookCredential), me.facebook.api(g.apifields, params)])
          .then(success => {
            // me.system.loader.dismiss();
            me.mUser.setFB(success);

            let user = me.mUser.getFB();
            me.hideLoadingScreen();
            setTimeout(() => me.nav.setRoot(TabsPage), 1500);
            me.system.displayToast("Hey " + user.first_name + "!", 3000, false, 'WELCOME BACK');
            me.serverStatus.watchDebugMessage(user.id);
          })
      }).catch(e => {
        /* You need to relog for reason e */
        // me.system.loader.dismiss();
        me.hideLoadingScreen();
        setTimeout(() => me.nav.setRoot(LoginPage), 1500);
      })
    } else {
      /* You are not logged in. */
      // me.system.loader.dismiss();
      me.nav.setRoot(LoginPage)
      unsubscribe();
      me.hideLoadingScreen();
    }
  })
}

showLoadingScreen() {
  var counter = new ProgressBar.SemiCircle('#loader-container', {
      strokeWidth: 22,
      easing: 'easeInOutQuad',
      duration: 5000,
      color: '#FFFFFF',
      svgStyle: null,

      text: {
        value: '',
        className: "progressbar__label",
      },

      from: { color: '#ffffff' },
      to: { color: '#ffffff' },

      step: (state, bar) => {
        bar.path.setAttribute('stroke', state.color);
      }
    });

    this.counterAnimationLoop(counter);

    //   counter.animate(3);
    // this.loaderInterval = setInterval(() => {
    //   setTimeout(() => counter.animate(-1*Math.random()*5), 3000);
    // }, 3000);
}

counterAnimationLoop(counter) {
  counter.animate(7);
  setTimeout(() => {
    counter.animate(-1*Math.random()*11);
    setTimeout(() => {
      if (!this.loadIsDone) this.counterAnimationLoop(counter);
    }, 5000)
  }, 5000)
}

hideLoadingScreen() {
  $('#loader-container').velocity('transition.shrinkOut');
  $('#text-container').velocity('transition.shrinkOut');
  setTimeout(() => {
    this.loadIsDone = true;
    $('#full-app-loading-screen').velocity('transition.fadeOut', { complete: function() {
      $('ion-nav').removeClass('invisible');
      $('div').remove('#full-app-loading-screen');
    }})
  }, 1500);
}

showLoadingText(newText) {
  this.system.updateHTML('#text-container', 'transition.shrinkIn', newText);
}

}