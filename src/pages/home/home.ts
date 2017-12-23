import { Component, NgZone, trigger, style, animate, transition } from '@angular/core';
import { Nav, NavController, App, Platform } from 'ionic-angular';
import { OneSignal } from '@ionic-native/onesignal';

import { MakePage } from '../make/make';
import { StatsPage } from '../stats/stats';
import { ProfilePage } from '../profile/profile';
import { LoginPage } from '../login/login';
import { SettingsPage } from '../settings/settings';
import { MapPage } from '../map/map';
import { StatsProvider } from '../../providers/stats-provider';
import { LoginProvider, MoveUser } from '../../providers/login-provider';
import { DatabaseProvider } from '../../providers/database-provider';
import { MovesProvider } from '../../providers/moves-provider';
import { System, Globals } from '../functions/functions';
import { Tutorial, NotificationProvider } from '../../providers/notification-provider';
import { ServerStatusProvider } from '../../providers/server-status-provider';
import * as CONSTANTS from '../../constants.js';
import { LocationTracker } from '../../providers/location-tracker';

declare var ProgressBar: any;
declare var $: any;
declare var velocity: any;
declare var marquee: any;
declare var toastr: any;
declare var google: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(200, style({ opacity: 0 })),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ],
  providers: [System, Globals, LoginProvider, StatsProvider, MovesProvider]
})

export class HomePage {

  currentlyTracking = false;
  checks: any;



  /* Gathers all references to elements labeled 
  'container' for the progress bars (people counters) */
  // @ViewChildren('container') container: any;
  // public moves = [];
  sMoveSummary = "Getting data...";

  movesList = {
      open: [],
      private: [],
      hidden: []
    }
  
  searching = false;

  /* Lists all the moves after the page has fully loaded. 
  This is to allow @ViewChildren to work properly. */
  ngAfterViewInit() {
    var me = this;
    if (!this.currentlyTracking) this.start();
    this.mp.cleanUp();
    this.introducePage();
  this.mp.trackChanges()
    .then(result => {
      me.mp.movesArr = result;
      me.sortMoves(me);
      // me.tutorial.home(me.mp.movesList.open.length + me.mp.movesList.private.length);
    })
this.checks = setTimeout(() => {
      this.mp.trackChanges()
    .then(result => {
      me.mp.movesArr = result;
      me.sortMoves(me);
      // me.tutorial.home(me.mp.movesList.open.length + me.mp.movesList.private.length);
    })
}, 3000);

  }

  ionViewDidLoad() {

      /* Push Notifications */
      console.log("Turning on push notifications.");
      if (this.platform.is('cordova')) {

          // OneSignal variables
          var message 
          var move;
          var photo;
          var type;

          // OneSignal Init
          this.oneSignal.startInit(CONSTANTS.APP_IDs.ONE_SIGNAL, CONSTANTS.SECRET.ONE_SIGNAL);
          
          this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);
          
          this.oneSignal.handleNotificationReceived().subscribe((data) => {
          // do something when notification is received
          message = data.payload.body;

            if (data.payload.additionalData) {
              move  = data.payload.additionalData.move;
              photo = data.payload.additionalData.userPhoto;
              type  = data.payload.additionalData.type;
            }


            if (type == 'userHasFollowed') {
              this.system.displayToast(message, 3000, true, 'NEW FOLLOW', null, null, photo);
            } else if (type == 'hostHasNotified') {
              this.system.displayToast(message, 5000, true, `UPDATE FROM ${(move.info.name).toUpperCase()}`);
            } else {
              this.system.displayToast(message, 3000, true, 'HEY');
            }
          });
          
          this.oneSignal.handleNotificationOpened().subscribe((data) => {
            // do something when a notification is opened
            message = data.notification.payload.body;

            if (data.notification.payload.additionalData) {
                move  = data.notification.payload.additionalData.move;
                photo = data.notification.payload.additionalData.userPhoto;
                type  = data.notification.payload.additionalData.type;
            }

            if (type == 'hostHasNotified') {
              this.system.displayToast(message, 5000, true, `${(move.info.name).toUpperCase()}`);
            }


          });
          
          this.oneSignal.endInit();
        }
  }

  constructor(public app: App,
    public platform: Platform,
    public nav: Nav,
    public navCtrl: NavController,
    public zone: NgZone,
    public system: System,
    public loginProvider: LoginProvider,
    public mUser: MoveUser,
    public np: NotificationProvider,
    public locationTracker: LocationTracker,
    public db: DatabaseProvider,
    public oneSignal: OneSignal,
    public globals: Globals,
    public stat: StatsProvider,
    public mp: MovesProvider,
    public ss: ServerStatusProvider,
    public tutorial: Tutorial) {

    // Initialize
    this.ss.watchFriendRequests();
    this.ss.watchBulletinPosts();
    this.ss.watchServerStats().then(() => {
      this.ss.updateServerStats(`ADD_UNIQUE_LOGIN`)
      .then(() => {
        this.ss.updateServerStats(`ADD_TOTAL_LOGIN`);
      })
    })
    
    this.setPushData();
    this.removeOldTags();

      
    var me = this
    this.system.dismissKeyboard();
  //   this.checks = setInterval(() => {
  // }, 30000);
    this.zone.run(() => {
      // Update the fields of the form, and Angular will update
      // the view for you.
      console.log("A CHANGE!");
    });

    setTimeout(() => {
        $('.marquee').marquee({
    //speed in milliseconds of the marquee
    duration: 7000,
    //gap in pixels between the tickers
    gap: 500,
    //time in milliseconds before the marquee will start animating
    delayBeforeStart: 0,
    //'left' or 'right'
    direction: 'left',
    //true or false - should the marquee be duplicated to show an effect of continues flow
    duplicated: false
});
    }, 200)


    // this.zone.run(() => this.counterbar = "YO");
  }

  /* Check if user is invited or not */
  filterInvited(array: Array<any>, fbid: string) : Array<any> {

    let filteredArray = [];
    let acceptable = false;

    for (var i = 0; i < array.length; i++) {

      // Check to see whether your fb ID is in the guests list or
      // whether you're one of the hosts.
      var guestList = array[i].info.guests;
      var hostList = array[i].info.hosts;
      
      for (var id in guestList) {
        if (guestList[id].id == fbid) {
          acceptable = true;
        }
      }

      for (var id in hostList) {
        if (hostList[id].id == fbid) {
          acceptable = true;
        }
      }

      if (acceptable) {
          filteredArray.push(array[i]);
      }

    }
    return filteredArray;

  }

  async removeOldTags() {
    let exists = false;
    let keyToRemove = "";
    let tags = await this.np.getTags('moves');
    let moves = [];
    moves.push(this.movesList.open);
    moves.push(this.movesList.private);
    moves.push(this.movesList.hidden);

    for (let move of moves) {
      exists = false;
      for (let tag in tags) {
        let moveKeyFromTag = tag.slice(5)
        if (moveKeyFromTag == move.key) {
          keyToRemove = tag;
          exists = true;
        }
      }

      if (!exists)
        this.np.removeTag(keyToRemove);
    }


  }

  sortMoves(myThis) {
      myThis.mp.movesArr = myThis.system.sortArray(myThis.mp.movesArr, 'users')
      console.log('SORTED MOVES!: ', myThis.mp.movesArr);

      myThis.mp.movesList.open = [];
      myThis.mp.movesList.open = myThis.system.filterArray(myThis.mp.movesArr, ['info.visibility'], 1);
      myThis.mp.movesList.open = myThis.system.sortArray(myThis.mp.movesList.open, 'info.isPending');
      console.log('OPEN MOVES!: ', myThis.mp.movesList.open);

      myThis.mp.movesList.private = [];
      myThis.mp.movesList.private = myThis.system.filterArray(myThis.mp.movesArr, ['info.visibility'], 2);
      myThis.mp.movesList.private = myThis.system.sortArray(myThis.mp.movesList.private, 'info.isPending');
      console.log('PRIVATE MOVES!: ', myThis.mp.movesList.private);

      myThis.mp.movesList.hidden = [];
      let filterHidden = myThis.system.filterArray(myThis.mp.movesArr, ['info.visibility'], 3);
      myThis.mp.movesList.hidden = myThis.filterInvited(filterHidden, myThis.mUser.getFB().id)
      myThis.mp.movesList.hidden = myThis.system.sortArray(myThis.mp.movesList.hidden, 'info.isPending');
      console.log('HIDDEN MOVES: ', myThis.mp.movesList.hidden);

      
      myThis.mp.movenum = myThis.mp.movesArr.length;

      if (myThis.mp.movesArr.length == 0 || (myThis.mp.movesList.open.length == 0 
          && myThis.mp.movesList.private.length == 0
          && myThis.mp.movesList.hidden.length == 0)) {
        myThis.noMoves();
      }
      myThis.mp.stopTrackingChanges()
  }


  /* Push Notification Update */
  async setPushData() {
    let user = this.mUser.getFB();
    let osInfo = await this.oneSignal.getIds();
    this.db.insert({push: osInfo}, '/userData/'+user.id)
  }

  /* GPS Tracking */
  start() {
    this.currentlyTracking = true;
    this.locationTracker.startTracking();
  }

  stop() {
    // this.system.showNotification("Tracking stopped.", 1000);
    this.locationTracker.stopTracking();
    this.currentlyTracking = false;
  }

  goToProfile() {
    this.navCtrl.push(ProfilePage);
  }

  goToMake() {
    console.log('Make!');
    this.nav.push(MakePage);
  }

  goToMap() {
    this.navCtrl.push(MapPage, {
      // moves: this.moves;
    });
  }

  presentInfo() {
    // let g = this.globals
    // this.system.simpleAlert("There are no settings yet, so here's just some basic information about Moves.<br><br>Developed by <b>Chris Moore</b> (Yale '19)<br><br><b>Version<br>"+g.version, "Info")
    this.nav.push(SettingsPage)
  }

  ionViewWillLeave() {
    clearInterval(this.checks);
  }


  /* Refresh list of moves event. */
  refreshMoves(refresher) {
    // this.system.showNotification('Refreshing...', 500, 'loading');
    this.searching = true;
    let me = this
    this.mp.trackChanges()
      .then(result => {
        me.mp.movesArr = result;
        me.sortMoves(me);  
        if (refresher) {
          setTimeout (() => {
          refresher.complete()
          console.log("ALL MOVES", me.mp.movesArr);
          this.searching = false}, 1000)
        } else {
          this.searching = false;
        }
        me.mp.stopTrackingChanges()
      })
      // .catch((error) => {
      //   this.system.showNotification('Yikes! Something went wrong. ERROR: ' + error, 3000, 'error');
      //   this.mp.stopTrackingChanges();
      // });
  }



  /* Go to the Stats page */
  checkStats(move, key) {
    this.mp.stopTrackingChanges();
    this.app.getRootNav().push(StatsPage, {
      firstPassed: move,
      movekey: key
    }
    );
    // this.system.showNotification("LOL", 3000, 'success');
  }

  totalRatings(move) {
    let nFun  = move.stats.fun;
    let nMeh  = move.stats.meh;
    let nDead = move.stats.dead;
    let nMax  = Math.max(nFun, nMeh, nDead);

    if (nMax == nFun) return 1;
    if (nMax == nMeh) return 2;
    if (nMax == nDead) return 3;
  }

  animateMoves() {
    // $("*[id*=indivMove]").velocity('transition.slideUpIn', { stagger: 200 });
  }

  introducePage() {
    $('#fadeOverlay').velocity('transition.fadeOut');
    setTimeout(() => $('#fadeOverlay').removeClass('purple-fade'), 500);
    // $('html').velocity('transition.fadeIn', { duration: 1000 })
    // setTimeout(() => $("*[id*=all]").removeClass('invisible').velocity('transition.fadeIn', { duration: 1000 }), 200)
    // setTimeout(() => $("*[id*=yaleLoadingBar]").removeClass('invisible').velocity('transition.bounceIn', { duration: 1000 }), 400)
    // setTimeout(() => $("*[id*=day]").removeClass('invisible').velocity('transition.slideUpIn', { duration: 800 }), 2000)
    // setTimeout(() => $("*[id*=date]").removeClass('invisible').velocity('transition.slideUpIn', { duration: 900 }), 2300)
    // setTimeout(() => $("*[id*=infobord]").removeClass('invisible').velocity('transition.slideDownIn', { duration: 1100 }), 2500)
    // setTimeout(() => $("*[id*=sortBy]").removeClass('invisible').velocity('transition.slideDownIn', { duration: 1100 }), 2500)
    // // setTimeout(() => $("*[id*=oneMove]").velocity('transition.slideUpIn', { duration: 700 }, { stagger: 400 }), 2500)
    // setTimeout(() => {
    //   $("*[id*=moves]").removeClass('invisible')
    //   $('move-item').velocity('transition.slideUpIn', { duration: 700, stagger: 400 })}
    //   , 2500)

    this.noMoves();
  }

  clearIntervals() {
    if (this.system.stat_updates) {
      clearInterval(this.system.stat_updates);
      console.log('Interval cleared!');
    } else {
      console.log('No interval to clear.', this.system.stat_updates);
    }
  }

  logOut() {
    let me = this
    let logOut = () => {
      me.system.appLoader('Logging you out!')
      setTimeout(() => me.mUser.signOut().then(() => {
        me.app.getRootNav().setRoot(LoginPage)
          .then(() => me.system.loader.dismiss())
      }), 2000)
    }
    this.system.logOutBox(logOut)
  }

  noMoves() {
    // var noMovesTimeline = anime.timeline({
    //   loop: true
    // });

    // noMovesTimeline
    // .add({
    //   targets: '.load-dot',
    //   opacity: [{value: 0}, {value: 1}],
    //   scale: [{value: 0}, {value: 1}],
    //   delay: function(el, i, l) { return (i * 100)+2000; },
    //   easing: 'easeInOutQuad',
    //   offset: 0,  
    // })
    // .add({
    //   targets: '.text',
    //   opacity: [{value: 0}, {value: 1}],
    //   translateY: [{value: -20}, {value: 0}],
    //   offset: 2000,
    //   duration: 3000
    // })
    // .add({
    //   targets: '.load-dot',
    //   scale: [{value: 0.2}, {value: 1}],
    //   delay: function(el, i, l) { return (i * 100)+2000; },
    //   easing: 'easeInOutQuad',
    //   offset: 2000 
    // })
    // .add({
    //   targets: '.load-dot',
    //   rotateX: [{value: 180}, {value: 0}],
    //   delay: function(el, i, l) { return (i * 100)+2000; },
    //   easing: 'easeInOutQuad',
    //   offset: 6000
    // })
    // .add({
    //   targets: '.load-dot',
    //   translateY: [{value: 50}, {value: 0}],
    //   delay: function(el, i, l) { return (i * 100)+2000; },
    //   easing: 'easeInOutQuad',
    //   offset: 0  
    // })
    // var dotAnim = anime({
    //   targets: '.load-dot',
    //   opacity: [{value: 0}, {value: 1}],
    //   scale: [{value: 0}, {value: 1}],
    //   delay: function(el, i, l) { return (i * 100)+2000; },
    //   easing: 'easeInOutQuad',
    //   loop: true,
    //   autoplay: true,
    // });

    // var moveAnim = anime({
    //   targets: '.text',
    //   opacity: [{value: 0}, {value: 1}],
    //   translateY: [{value: -20}, {value: 0}],
    //   delay: 2000,
    //   duration: 3000,
    //   loop: true,
    //   autoplay: true,
    // })
  }
}