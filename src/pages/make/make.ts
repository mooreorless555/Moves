import { Component, ViewChild } from '@angular/core';

import { revealInOut, revealExpandInOut } from '../../animations/common.ts';

import { AlertController, Content } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { UserListButtonPage } from '../user-list-button/user-list-button';
import { FacebookEventsPage } from '../facebook-events/facebook-events';
import { TabsPage } from '../tabs/tabs';
import { MapPage } from '../map/map';

import { System, Globals } from '../functions/functions';
import { LocationTracker } from '../../providers/location-tracker';
import { StatsProvider } from '../../providers/stats-provider';
import { LoginProvider, MoveUser } from '../../providers/login-provider';
import { SoundProvider } from '../../providers/sound-provider';
import { MovesProvider } from '../../providers/moves-provider';
import { DatabaseProvider } from '../../providers/database-provider';
import { Aliases, Badges } from '../../providers/profile-provider';
import { Tutorial, NotificationProvider } from '../../providers/notification-provider';

import { DatePicker } from '@ionic-native/date-picker';

declare var $: any;
declare var velocity: any;
declare var google: any;

@Component({
  selector: 'page-make',
  templateUrl: 'make.html',
  providers: [MovesProvider, LoginProvider, System, Globals, StatsProvider],
  animations: [revealInOut(), revealExpandInOut()]
})



export class MakePage {
  public hello;
  public userData = {
    currentAlias: "...",
    currentBadge: "..."
  }

  public currentBadgeImg = "";
  public verifyDist = 80
  public customLatLng: any;
  public customAddress = "Unspecified";
  public startTime = new Date().getTime();
  public displayStartTime = "0:00am";
  public displayDay = "today";
  public rightHereRightNow = true;
  public adminStatus = false;
  public notifyAll = true;

  userListModal: any;

  @ViewChild(Content) content: Content;

  busy: Promise<any>;



  /* Move Object */
  public move = {
    key: "",
    info: {
      name: "",
      hosts: [],
      location: "",
      capacity: 30,
      hasAlcohol: false,
      extraInfo: "",
      address: "",
      showAddress: true,
      isOpen: true,
      isPending: false,
      isAnon: false,
      visibility: 1,
      owner: {
        id: 0,
        name: "",
        badgeId: "0"
      },
      pending: {
        startTime: new Date().getTime(),
        createdTime: new Date().getTime()
      }
    },
    LatLng: {
      lat: 0,
      lng: 0
    },

    stats: {
      people: 1,
      fun: 0,
      meh: 0,
      dead: 0
    }
  }

  ngAfterViewInit() {
    this.introducePage();
    // this.tutorial.make();
    let me = this
    this.displayStartTime = this.system.getClockTime();
    this.startTime = new Date().getTime();
    this.adminStatus = this.mUser.isAdmin();
    this.mUser.getUser(this.mUser.getFB().id).then(data => {
      this.userData = data

      let badgeId = this.userData.currentBadge;
      let badge = this.badges.get(badgeId)
      this.currentBadgeImg = badge.image;
    })
    // $("#formItems ion-item").bind("keydown", function(event) {
    //     if (event.which === 13) {
    //         console.log('ENTER!');
    //         event.stopPropagation();
    //         event.preventDefault();
    //         var nextEl =  $(this).nextAll("ion-item").find("input, textarea, #submitBtn").eq(0)
    //         if (!nextEl.offset()) {
    //           me.logForm();
    //         } else {
    //           nextEl.focus()
    //           me.content.scrollTo(0, nextEl.offset().top - ($(window).height() - nextEl.height())/2, 1000);
    //         }
    //     }
    // });

    // $("#formItems #capacity").bind("keydown", function(event) {
    //   console.log('Changing capacity.');
    //   var capacityEl = $(this).find("input")
    //   capacityEl.val(capacityEl.val().replace(/[^0-9]+/, ""))
    //   capacityEl.val(capacityEl.val().substring(0, capacityEl.val().length))
    // });
  }


  goToId(id) {
    // setTimeout(() => {
    //   $('html, body, ion-content').animate({
    //     scrollTop: $(id)
    // }, 2000)
    // }, 500);
  }
  /* Form submission checking */
  async logForm() {
    var me = this;
    let yaleOnly = await this.db.get('value', 'serverInfo/exclusive');
    let yaleCollege = this.globals.collegesJSON['yale'];
    let distanceFromYale = this.locationTracker.calculateDistance(this.locationTracker.lat, this.locationTracker.lng, yaleCollege.location.lat, yaleCollege.location.lng);
    let newCapacity = parseInt((this.move.info.capacity + "").replace(/[^0-9]+/, ""))
    console.log('INVITES: ', this.mp.userInviteList);
    this.move.info.name = this.move.info.name.trim();
    if (isNaN(newCapacity)) newCapacity = this.globals.config.min;
    this.move.info.capacity = newCapacity;
    this.move.info.owner.name = this.userData.currentAlias;
    this.move.info.owner.badgeId = this.userData.currentBadge;
    this.move.info.location = this.move.info.location.trim();
    console.log(this.move.info.name);
    if (this.move.info.name == "") {
        this.system.showNotification("You need to give your Move a name.", 3000, 'error');
    } else if (this.allspaces(this.move.info.name)) {
        this.system.showNotification("This is an invalid name.", 3000);
    } else if (this.move.info.name.length < 3) {
        this.system.showNotification("The name needs to be at least 3 characters long.", 3000, 'error');
    } else if (isNaN(this.move.info.capacity)) {
        this.move.info.capacity = this.globals.config.min;
    } else if (this.move.info.capacity < this.globals.config.min) {
        this.system.showNotification("The minimum capacity is " + this.globals.config.min + " people.", 3000, 'error');
        this.move.info.capacity = this.globals.config.min;
    } else if (this.move.info.capacity > this.globals.config.max) {
        this.system.showNotification("The maximum capacity is " + this.globals.config.max + " people.", 3000, 'error');
        this.move.info.capacity = this.globals.config.max;
    } else if (yaleOnly && distanceFromYale >= 5000) {
        console.log('Your distance: ', distanceFromYale);
        this.system.simpleAlert("Don't worry, making moves off Yale's campus has just been postponed until after The Game! So we'll see you on campus!!", "You're too far from Yale!", "Got it!")
    } else {
      let savedLoc = {lat: this.locationTracker.lat, lng: this.locationTracker.lng}
      
      if (!this.move.info.isPending) {
        if (savedLoc.lat != 0) {
          this.revGeocode(savedLoc)
            .then(result => {

              let confirmYesFunc = function() {
                me.proceedMove();
              }
              let confirmFunc = function () {
                me.system.simpleYesNo(
                  "Okay, <br><br><h1 id='mtitle' class='mheader'>" + me.move.info.name + "</h1><br><br> will go live at the designated location. Do you confirm this?", confirmYesFunc, null, 'GO LIVE!', 'Wait, go back!')
                  $('#mtitle').velocity('transition.slideDownIn')
              }

              let yesFunc = function () {
                me.move.info.address = result
                confirmFunc()
              }

              let noFunc = function () {
                me.system.simpleInput("Make any small changes you need to the address.<br>(If it's wildly different, try moving around a bit and then resubmitting.)", 'Revise', "Address Revision", 'Revise address', result)
                .then(data => {
                  me.move.info.address = data
                  me.system.appLoader('Verifying distances...')
                  let timeout = setTimeout(() => {
                    me.system.loader.dismiss()
                    me.system.simpleAlert("Ahh, we couldn't find the address you typed in. Try again with another address or retype this one?", "Distance Verification Error", "Retry", noFunc)
                  }, 5000)
                  me.forwardGeocode(data).then(newLocData => {
                    clearTimeout(timeout)
                    me.system.loader.dismiss()
                    // For some reason, data needs to be stringified then parsed
                    // to return correctly. -_-
                    let newLocStr = JSON.stringify(newLocData)
                    let newLoc = JSON.parse(newLocStr)
                    console.log(newLoc)
                    let distance = me.locationTracker.calculateDistance(newLoc.lat, newLoc.lng, me.locationTracker.lat, me.locationTracker.lng)
                    if (distance < me.verifyDist) {
                      confirmFunc()
                    } else {
                      me.system.simpleYesNo(`The revised address <b>is apparently too far</b> from your coordinates. If this is not actually the case, try moving around a bit and then resubmit. Otherwise,  
                      you can either <b>revise the address again</b>, <b>move closer</b> to the currently revised address,
                      or <b>wait a bit</b> for GPS to triangulate your position and try again.`, noFunc, null, "Revise again", "Go back", "Address Revision Error")
                    }
                  })
                  .catch(e => {
                    me.system.simpleAlert(e, "Distance Verification Error")
                  })
                })
              }

              // this.system.simpleYesNo("<b>What we got for your address:</b><br>" + result, yesFunc, noFunc, 'Yes', 'No, change it', 'Is this right?')
              this.system.simpleYesNo("<b>What we got for your address:</b><br><br>" + result, yesFunc, noFunc, 'Yes', 'No, change it', 'Is this right?')
            })
          console.log(this.move);
        } else {
          let erralert = this.alertCtrl.create({
            message: "Move could not be created due to invalid GPS coordinates. Make sure you have GPS turned on or just try again in a little bit!",
            buttons: [
              {
                text: 'OK',
                role: 'cancel',
                handler: data => {
                  console.log('Cancel clicked');
                }
              }
            ]
          });
          erralert.present();
        }
      } else {
        /* Yes No Functions */
        let chooseLocYes = function() {

          me.selectLocation();
        }
        let chooseLocNo = function() {
          me.customLatLng = {lat: me.locationTracker.lat, lng: me.locationTracker.lng}
          me.locationTracker.getAddress(me.customLatLng).then(addy => {
            me.customAddress = addy ? addy : me.customAddress;
            me.customLatLng = {lat: me.locationTracker.lat, lng: me.locationTracker.lng}
          })
        }

        if (!this.customLatLng) {
          this.system.simpleYesNo("Are you going to use your current location or are you going to choose some other location?", chooseLocYes, chooseLocNo, "Choose location", "Use my current location", "You Need a Location")
        } else {
          let pendingMoveWarningFunc = function() {
            me.system.simpleAlert("You agree that you will be at your own move by the specified start time. If you fail to be at your own move by the time you said it would start, you recognize that your move will be deleted.", "Notice", "Agree", confirmFunc);
          }
          let proceedFunc = function () {
            me.proceedMove();
          }
          let confirmFunc = function () {
            me.move.info.address = me.customAddress; 
            me.system.simpleYesNo(
              "Okay, <br><br><h1 id='mtitle' class='mheader'>" + me.move.info.name + "</h1><br><br> will go live at the designated location. Do you confirm this?", proceedFunc, null, 'GO LIVE!', 'Wait, go back!')
              $('#mtitle').velocity('transition.slideDownIn')
          }

          this.busy = this.locationTracker.getAddress(this.customLatLng).then(result => {
            this.customAddress = result;
            this.system.simpleYesNo("<b>What you put for your address:</b><br><br>" + result, pendingMoveWarningFunc, chooseLocYes, "Yes", "No, let me fix this", "Is this right?")
          })      
        }
      }

    }
  }

  inviteFriends() {
    let me = this;
    let params = {move: "",
                  objListToPopulate: this.mp.userInviteList,
                  list: this.mUser.getConnections(),
                  title: 'INVITE',
                  subtitle: "Select who you would like to invite!"
                }
    this.userListModal = this.modalCtrl.create(UserListButtonPage, params);
    this.userListModal.present();
    this.userListModal.onDidDismiss(function(data) {
      console.log('Sweet, we got: ', data);
      me.mp.userInviteList = data;
    })
  }

  allspaces(string) {
    var numspace = 0;
    for (var i = 0; i < string.length; i++) {
      if (string[i] == ' ' || string[i] == '.') {
        numspace++;
      }
    }

    if (numspace == string.length) return true;
    return false;
  }

  resetFields(move) {
    move.info.name = '';
    move.info.hasAlcohol = false;
    move.info.extraInfo = '';
  }




  constructor(public navCtrl: NavController, public np: NotificationProvider, public db: DatabaseProvider, public sound: SoundProvider, public tutorial: Tutorial, public datePicker: DatePicker, public badges: Badges, public aliases: Aliases, public modalCtrl: ModalController, public mp: MovesProvider, public loginProvider: LoginProvider, public mUser: MoveUser, public locationTracker: LocationTracker, public toastCtrl: ToastController, public alertCtrl: AlertController, public system: System, private globals: Globals) {
    let messages = ["It can be a party, concert, free food, anything. Anything you'd like to share with the community."
    ];
    this.hello = messages[Math.floor(Math.random() * messages.length)];
    $('ion-toggle').attr('checked', 'true');

  }

  //
  confirmMove() {
    var me = this;
    let objList;
    let anonConfirm = function() {
      me.system.simpleAlert("By reporting this move as happening you confirm that the move is indeed OPEN-- and you confirm that you will be listed as reporting the event. <b>You'll face repercussions for publicizing a private event.</b>",
      "Report Agreement", "Agree", confirmPresent);
    }
    let confirmPresent = function() {
      confirm.present();
    }
    
    // If move is reported by someone else.
    if (this.move.info.isAnon) {
      anonConfirm();
    }
    
    if (this.mp.userInviteList) {
      objList = this.system.convertArrayToList(this.mp.userInviteList, 'id')
    }

    let confirm = this.alertCtrl.create({
      message: 'Okay, <br><br><b><h1>"' + this.move.info.name + '"</h1></b><br><br> will go live at the designated location. Do you confirm this?',
      buttons: [
        {
          text: 'Wait, go back',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'GO LIVE!',
          handler: data => {
            me.proceedMove()
          }
        }]
    });
  }

  confirmLocation() {
    let loc = this.alertCtrl.create({

    })
  }

  selectLocation() {
    this.unfocusAll();
    if (this.move.info.isPending) {
      let params = {isModal: true}
      let mapPage = this.modalCtrl.create(MapPage, params);
      mapPage.present();
      mapPage.onWillDismiss(result => {
        this.customLatLng = result.latLng;
        this.customAddress = result.address ? result.address : this.customAddress;
      })
    }
  }

  pickTime() {
    this.unfocusAll();
    this.datePicker.show({
      date: new Date(),
      mode: 'time',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_LIGHT,
      minuteInterval: 10,
      doneButtonColor: '#886FE8',
      cancelButtonColor: '#db3f44'
    }).then(date => {
      var me = this;
      var todayFunc = function() {
        me.startTime = date.getTime();
        me.displayStartTime = me.system.getClockTime(date);
        me.displayDay = "today";
      }
      var tomorrowFunc = function() {
        me.startTime = date.getTime() + 24*60*60*1000;
        me.displayStartTime = me.system.getClockTime(date);
        me.displayDay = "tomorrow";
      }

      this.system.simpleYesNo("", todayFunc, tomorrowFunc, "Today", "Tomorrow", "Today or Tomorrow?");

    });
  }

  unfocusAll() {
    // console.log('Unfocusing.');
    // $('input').blur();
    // $('textarea').blur();
  }

  visibilityChanged(event) {
    this.move.info.visibility = event.getActiveIndex()+1;

  }

  slideBoolChanged(event) {
    return event.getActiveIndex();
  }

  instantSlideChange(event) {
     let currentIndex = event.getActiveIndex();
     let maxSlides = event.length();
     event.slideTo((currentIndex+1) % maxSlides, 0);
  }

  proceedMove() {
    let d = new Date();
    this.move.stats.people = 0;
    this.move.stats.fun = Math.floor(Math.random() * this.move.info.capacity);
    this.move.stats.meh = Math.floor(Math.random() * this.move.info.capacity);
    this.move.stats.dead = Math.floor(Math.random() * this.move.info.capacity);
    if (!this.move.info.isPending) {
      this.move.LatLng.lat = this.locationTracker.lat;
      this.move.LatLng.lng = this.locationTracker.lng;
    } else {
      this.move.info.pending.startTime = this.startTime;
      this.move.info.pending.createdTime = d.getTime();
      this.move.LatLng.lat = this.customLatLng.lat;
      this.move.LatLng.lng = this.customLatLng.lng;
    }
    if (this.move.info.extraInfo.trim() == "") this.move.info.extraInfo = ""
    let host = this.mUser.getFB();
    if (!host) {
      this.move.info.hosts.push("Test Man");
    } else {
      // this.move.info.hosts.push({name: host.name, id: host.id});
    }

    if (this.move.LatLng.lat && this.move.LatLng.lng) {
      try {
       this.mp.makeMove(this.move)
      } catch (e) {
        console.log('IGNORE THIS: ' + e)
      }
      // this.mp.addUser(this.move.key);
      this.system.appLoader(`Going live!`);
      setTimeout(() => {
        this.system.loader.dismiss();
        // Notify users
        if (this.move.info.visibility == 3) 
          this.notifyAll = false;

        if (this.notifyAll) {
          if (!this.move.info.isAnon)
              this.np.sendPushToNearby(`${this.move.info.owner.name} is hosting "${this.move.info.name}"! Tap to get details.`);
          else
              this.np.sendPushToNearby(`"${this.move.info.name}" was reported to be happening. Tap for details.`);
        }

        this.navCtrl.setRoot(TabsPage);
        console.log('Confirmed.');
        console.log("Move creation success. Sending out object data for database storage.");
        // this.resetFields(this.move);           
      }, 1000);
    } else {
      let erralert = this.alertCtrl.create({
        message: "Move could not be created due to invalid GPS coordinates. Make sure you have GPS turned on or just try again in a little bit!",
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      erralert.present();
    }
  }


  getLocationName(location) {
    var me = this;
    me.move.info.address = location;
  }

  revGeocode(inlatLng) {
    if (inlatLng.lat != 0) {
      var me = this;
      var geocoder = new google.maps.Geocoder;
      var location = "NO_ADDRESS";
      var latLng = inlatLng;
      var answer = new $.Deferred();


      geocoder.geocode({ 'location': latLng }, function (results, status) {
        if (results[0]) {
          answer.resolve(results[0].formatted_address)
        } else {
          answer.reject('REVERSE GEOCODE ERROR: ' + status)
        }
      })

      return answer;
    }
  }

  forwardGeocode(address) {
    var geocoder = new google.maps.Geocoder;
    var def = new $.Deferred()
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (results[0]) {
        def.resolve(results[0].geometry.location)
        return def;
      } else {
        def.reject('GEOCODE ERROR: ' + status)
        return def;
      }
    })
  
    return def;
  }


  alcWarning() {
    let warning = this.toastCtrl.create({
      message: "You agree that you must be of 21 years or older to drink alcohol in the state of Connecticut.",
      duration: 5000
    });

    this.globals.config.displayMsg = !(this.globals.config.displayMsg);
    if (this.globals.config.displayMsg) {
      warning.present();
    }
  }

  introducePage() {
    // $("ion-item").velocity('transition.slideUpIn', { stagger: 130 });
    // setTimeout(() => { 
    //   $('#submitBtn').removeClass('hide').velocity('transition.shrinkIn', { duration: 100 }); 
    //   $("#formItems ion-item").find("input, textarea, button").eq(0).focus()
    // }, 900);
    // setTimeout(() => {
    //   $("ion-content").eq(0).animate({scrollTop: $('#submitBtn').offset().top}, 2000);
    // }, 2000)

    // var fbEventsTimeline = anime.timeline();

    // fbEventsTimeline
    // .add({
    //   targets: '.big-logo',
    //   scale: [{value: 0}, {value: 1}],
    //   easing: 'easeOutBack',
    //   duration: 1000,
    //   offset: 0,
    // })
    // .add({
    //   targets: '.facebook-event-text',
    //   opacity: 1,
    //   scale: [{value: 0}, {value: 1}],
    //   easing: 'easeOutBack',
    //   duration: 1000,
    //   offset: 1000,
    // })
    // .add({
    //   targets: '.big-logo',
    //   rotateY: 720,
    //   elasticity: 75,
    //   duration: 3000,
    //   offset: 1500,
    // })
  }

  manageAliases() {
    this.aliases.manage().then(newAlias => {
      this.userData.currentAlias = newAlias;
    })
  }
  
  async useCustomAlias() {
    let newAlias = await this.system.simpleInput("Who are you hosting as? (Admin only)", "Confirm", "Custom Host", "Custom Host Name");
    if (newAlias != "") this.userData.currentAlias = newAlias;
  }

  manageBadges() {
      this.badges.manage().then(newBadge => {
        this.userData.currentBadge = newBadge.id;
        this.currentBadgeImg = newBadge.image;
      })
  }

  openFacebookModule() {
    let facebookEventsPage = this.modalCtrl.create(FacebookEventsPage);
    facebookEventsPage.present();

    var me = this;
    facebookEventsPage.onDidDismiss(data => {
      me.move.info.name = data.move.info.name;
      me.move.info.extraInfo = data.move.info.extraInfo;
      me.move.info.location = data.move.info.location;
      me.move.info.isAnon = false;
      me.move.info.isOpen = false;
      me.move.info.isPending = true;
      me.move.info.pending.startTime = data.move.info.pending.startTime;
      me.mp.userInviteList = data.guests;
      me.system.displayToast("Facebook event has been imported! " + Object.keys(data.guests).length + " guests invited to the event. This move is private right now- you can make it open by toggling the 'Open?' slider below!", 999999, true);
    })
  }

}
