import { Component, ViewChild, NgZone } from '@angular/core';
import firebase from 'firebase';
import { App, NavController, NavParams, ModalController, Content, Platform } from 'ionic-angular';
import { MovesProvider } from '../../providers/moves-provider';
import { StatsProvider } from '../../providers/stats-provider';
import { LocationTracker } from '../../providers/location-tracker';
import { LoginProvider, MoveUser } from '../../providers/login-provider';
import { Tutorial } from '../../providers/notification-provider';
import { DatabaseProvider } from '../../providers/database-provider';
import { PreferencesProvider } from '../../providers/preferences-provider';
import { SoundProvider } from '../../providers/sound-provider';
import { Badges } from '../../providers/profile-provider';

import { TabsPage } from '../tabs/tabs';
import { UserPage } from '../user/user';
import { UserListPage } from '../user-list/user-list';
import { UserListButtonPage } from '../user-list-button/user-list-button';
import { EditStatsPage } from '../edit-stats/edit-stats';
import { ListPage } from '../list/list';
import { ControlPanelPage } from '../control-panel/control-panel';

import { System } from '../functions/functions';

declare var ProgressBar: any;

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html',
  providers: [MovesProvider, LoginProvider, StatsProvider, DatabaseProvider, System]
})

export class StatsPage {
  @ViewChild('containerbig') container;
  @ViewChild('funbar') funbar;
  @ViewChild('mehbar') mehbar;
  @ViewChild('deadbar') deadbar;
  @ViewChild(Content) content: Content;

  trackFbObjects = (idx, obj) => obj.$key;

  address = "Retrieving address...";
  dataStreamInfo = "Fetching data...";
  dot = ".";

  isHost = false;

  id: any;
  user: any;
  hosts: any;
  move: any;
  moves: any;

  movesPath: string;
  moveName: string;
  moveLocation: string;
  moveAddress: string
  moveExtraInfo: string;

  progbar: any;
  funstatbar: any;
  mehstatbar: any;
  deadstatbar: any;
  percentage: any;
  alcStatus = "No.";
  numppl = 0;

  connectionsAtMove = []
  friendsAtMove = []
  numFriends = 0
  numConnections = 0
  badgeSrc = "";
  userIsHereListener: any;
  userIsHere = false;

  moveIsLive = false;
  checks: any;

  movesRef: any;
  moveWatchRef: any;
  flowInterval: any;

  meters: any;

  comments: any;
  comment: string;

  doneLoading: boolean = false;



  ngAfterViewInit() {
    this.animatedDot();
    this.tutorial.stats();
    setTimeout(() => {
      this.mp.trackStatChanges(this.move, this.funstatbar, this.mehstatbar, this.deadstatbar, this.progbar);
    }, 3000);

    /* Create necessary JQuery handlers */
    var me = this;
    // $('input').click(function(e) {
    //   var thisEl = $(this);
    //   console.log('OFFSET: ', e)
    //    me.content.scrollTo(0, 9999, 1000);
    //  });
  }

  constructor(public navCtrl: NavController,
              public app: App,
              public db: DatabaseProvider,
              public modalCtrl: ModalController,
              public params: NavParams, 
              public lp: LoginProvider, 
              public mUser: MoveUser, 
              public mp: MovesProvider, 
              public system: System, 
              public badges: Badges,
              public stat: StatsProvider, 
              public prefs: PreferencesProvider,
              public zone: NgZone, 
              public tutorial: Tutorial,
              public sound: SoundProvider,
              public locationTracker: LocationTracker,
            public platform: Platform) {
    var me = this;
    this.move = params.get("firstPassed");
    setTimeout(() => this.filterSwearsInMove(), 300);
    // setInterval(() => this.meters = this.locationTracker.calculateDistance(this.move.LatLng.lat, this.move.LatLng.lng, this.locationTracker.lat, this.locationTracker.lng), 5000)
    this.badgeSrc = this.badges.get(this.move.info.owner.badgeId).image;
    if (this.move.info.owner.badgeId == 999) this.badgeSrc = "";
    this.introducePage();
    this.user = this.lp.getUser();
    let commentsPath = 'moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key+'/comments/'
    this.comments = this.db.listen(commentsPath)
    this.checkIfHost();
    let hostNames = this.system.getArrayFromProps(this.system.convertListToArray(this.move.info.hosts), 'name', this.move.info.owner);
    this.hosts = this.system.listOfNames(hostNames);
    this.checks = setInterval(() => {
      this.movesChecks();
    }, 10000);

    /* Perform statistical analysis. */
    if (this.move.info.hasAlcohol) {
      this.alcStatus = "Yes.";
    }
    
    this.userIsHereListener = this.db.getListener(this.locationTracker.movesPath+this.move.key+'/users/');
    this.userIsHereListener.on('value', snap => {
      let users = snap.val();
      console.log('USERS:', users);
      let found = false;
      for (let userKey in users) {
        if (userKey == this.mUser.getFB().id) {
          found = true;
        }
      }

      this.userIsHere = found;

    })
  }

  goToList() {
    this.app.getRootNav().push(ListPage, {
      move: this.move
    });
  }

  goToControlPanel() {
    this.navCtrl.push(ControlPanelPage, {
      move: this.move,
      currentCollege: this.locationTracker.currentCollege
    });
  }

  movesChecks() {
    // User Here Check
    // this.mUser.getUser(this.mUser.getFB().id).then(userData => {
    //   if (userData.currently.move == this.move.key) {
    //     this.userIsHere = true;
    //   } else {
    //     this.userIsHere = false;
    //   }
    // })

    // Refresh move
    this.refreshStats(true);

    // Friends & Connections & Flow Update Check
    this.mp.netFlow = this.stat.calculateFlow(this.move.stats.flow);
    this.getConnectionsAtMove(this.move.key)
    this.getFriendsAtMove(this.move.key)

    // Is Move Live Check
    this.moveIsLive = this.mp.isMoveLive(this.move);
  }

  focusOnMe() {
      console.log('Focusing.');
  }

  peopleDetails() {
    this.sound.playBtnPress();
    this.db.get('number', 'moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key+'/users').then(numUsers => {
      var additionalComment = "";
      if (numUsers >= this.move.info.capacity) {
        additionalComment = "It's packed! You may have trouble getting in.";
      } else if (numUsers <= 7) {
        additionalComment = "It could use more people!";
      } else if (numUsers >= this.move.info.capacity*0.70) {
        additionalComment = "Come through before it fills up!";
      }
      this.system.simpleAlert("There are <br><b class='bdt'>" + numUsers + " out of a capacity of " + this.move.info.capacity + "</b><br> at this move.<br><br>"+additionalComment,
      "People")
    })
  }

  ratingsDetails() {
    let user = this.mUser.getFB();
    this.db.get('value', 'userData/'+user.id+'/currently/move').then(movekey => {
      // this.userIsHere = movekey == this.move.key;
      if (!this.moveIsLive) {
        this.system.simpleAlert(`${this.move.info.name} is not live yet.`, "Not Yet");
      } else if (this.userIsHere) {
        this.getFeedbackScreen(this.move)
      } else {
        this.system.simpleAlert("You need to be at this move to rate it.", "Notice");
      }
    })
   
  }

  flowDetails() {
    this.sound.playBtnPress();
    var flowStats = this.mp.netFlow;
    var flowDescription = "<b>Flow</b> gets a rudimentary estimate of the rate of change of people at a move by getting entry and exit data from the last 10 users.<br><span style='font-size: 12px'>(Future calculations will involve taking the rate of change of people at the move at more nuanced time intervals.)</span><br><br>"
    this.system.simpleAlert(flowDescription + "<b>Entry/Exit Ratio (EER):</b><br>" + flowStats.in + " / " + flowStats.out, "Flow");
  }

  connectionDetails() {
    this.sound.playBtnPress();
    this.system.simpleAlert("You have <br><b class='bdt'>" + this.connectionsAtMove.length + " connections (Facebook friends)</b><br> at this move.", 
    "Connections")
  }

  editStats() {
    console.log("Editing stats...");
    let editStats = this.modalCtrl.create(EditStatsPage, {move: this.move})
    editStats.present();
    editStats.onWillDismiss(result => {
      this.refreshStats();
    })
  }
  
  endMove() {
    var me = this;
    let yesFunc = function() {
      me.db.remove('moves/'+me.locationTracker.currentCollege.key+'/'+me.move.key)
      me.navCtrl.setRoot(TabsPage);
    }

    this.system.simpleYesNo("Are you sure you want to end your move? There's no going back.", yesFunc, null, "End it.", "Not yet!", "Shutting Down?");
  }


  addHosts() {
    this.refreshStats()
    let params = {move: "",
                  objListToPopulate: this.move.info.hosts,
                  list: this.mUser.getConnections(),
                  title: 'HOSTS',
                  subtitle: "Select who you would like to add/remove as a host!",
                  updateDB: true,
                  dBPath: 'moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key+'/info/hosts'}
    let userListModal = this.modalCtrl.create(UserListButtonPage, params);
    userListModal.present();
  }

  getFeedbackScreen(move) {
    var me = this;
    var msg = 'Rate';
    var ratingBtns = "How is it for you?<br><span style='font-size: 1.4rem; line-height: 0.2em'>Your feedback will be anonymously added to this move's data feed (and everyone will appreciate it.)</span><br><br>" +
      "<button id='funBtn' class='button_sliding_bg fun-color lit'>fun</button>" +
      "<button id='mehBtn' class='button_sliding_bg meh-color meh'>meh</button>" +
      "<button id='deadBtn' class='button_sliding_bg dead-color dead'>dead</button>";
    swal({
      title: msg,
      html: ratingBtns,
      showCloseButton: true,
      showConfirmButton: false,
      allowOutsideClick: false
    }).then(function () {
      console.log('Okay..');
    }, function (dismiss) {
      // dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer' 
      if (dismiss === 'cancel') {
        swal.close();
      }
    })




    $('#funBtn').on('click', function (e) {
      console.log('Hello?')
      me.mp.incStat(move, 'fun')
      swal.close();
    });
    $('#mehBtn').on('click', function (e) {
      me.mp.incStat(move, 'meh');
      swal.close();
    });
    $('#deadBtn').on('click', function (e) {
      me.mp.incStat(move, 'dead');
      swal.close();
    });
  }

  // editInvites() {
  //   this.refreshStats()
  //   let params = {move: "",
  //                 objListToPopulate: this.move.info.guests,
  //                 list: this.mUser.getConnections(),
  //                 title: 'LIST',
  //                 subtitle: "Select who you would like to add/remove as a guest!",
  //                 addText: "INVITE",
  //                 addedText: "UNINVITE",
  //                 updateDB: true,
  //                 dBPath: 'moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key+'/info/guests'}
  //   let userListModal = this.modalCtrl.create(UserListButtonPage, params);
  //   userListModal.present();
  //   userListModal.onWillDismiss(result => {
  //     if (!result) { // if the user uninvited everyone
  //       this.system.simpleAlert("You've uninvited everyone from this move", "No Invites?")
  //     }
  //   })
  // }

  refreshStats(silent?: boolean) {
    if (!silent) this.system.appLoader("Refreshing...")
      this.db.get('value', 'moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key).then((updatedMove) => {
      if (this.system.loader) this.system.loader.dismiss();
      this.move = updatedMove;
      this.filterSwearsInMove()
      this.mp.netFlow = this.stat.calculateFlow(this.move.stats.flow);
      this.getConnectionsAtMove(this.move.key)
      this.getFriendsAtMove(this.move.key)
      this.checkIfHost();
      let hostNames = this.system.getArrayFromProps(this.system.convertListToArray(this.move.info.hosts), 'name', this.move.info.owner);
      this.hosts = this.system.listOfNames(hostNames);
    })
  }

  filterSwearsInMove() {
      console.log("filtering swears...")
      this.moveName = this.prefs.filterSwears(this.move.info.name);
      this.moveExtraInfo = this.truncate(this.prefs.filterSwears(this.move.info.extraInfo), 75);
      this.moveLocation = this.prefs.filterSwears(this.move.info.location);
      this.moveAddress = this.prefs.filterSwears(this.move.info.address);
  }

  truncate(str, chunk) {
    return str.length >= chunk ? str.substr(0, chunk)+"...(tap to see more)" : str;
  }

  isiOS() {
    return this.platform.is('ios');
  }

    

  /**
   * Essentially opens up a friends list panel of who is at the move
   * @param {any} move - Use the current move
   */
  goToUserList(move) {
    let params = {move: move,
                  list: this.friendsAtMove,
                  title: 'FRIENDS',
                  subtitle: this.friendsAtMove.length + ' friend(s) are currently at or around ' + move.info.name}
    let userListModal = this.modalCtrl.create(UserListPage, params)

    $('#friends').velocity({scale: 1.1}, {duration: 50, easing: "easeOutBack"})
                 .velocity({scale: 1}, {duration: 50, easing: "easeInOut"})
      userListModal.present()
  }

  /**
   * Animates the dots while we "watch the data stream" from the move LOL
   */
  animatedDot() {
    setInterval(() => {
      this.dataStreamInfo = "Watching data stream from " + this.moveName;
      setTimeout(() => this.dataStreamInfo += ".", 1000);
      setTimeout(() => this.dataStreamInfo += ".", 2000);
      setTimeout(() => this.dataStreamInfo += ".", 3000);
    }, 5000);
  }

  createProgBar(moves_container, move) {
    console.log("Executing createProgbar...");
    var progbar = new ProgressBar.SemiCircle(moves_container.nativeElement, {
      strokeWidth: 18,
      easing: 'easeInOut',
      duration: 2300,
      color: '#9932CC',
      svgStyle: null,

      text: {
        value: '',
        className: 'progressbar__label',
      },

      from: { color: '#9932CC' },
      to: { color: '#FFFFFF' },

      step: (state, bar) => {
        bar.path.setAttribute('stroke', state.color);
        this.numppl = Math.round(bar.value() * move.info.capacity);
        bar.setText(this.numppl);
        bar.text.style.color = state.color;
      }

    });

    progbar.text.style.fontFamily = 'AppFont';
    progbar.text.style.fontSize = '2rem';


    var perc = 0;

    if (perc > 1) {
      progbar.animate(1);
    } else if (perc >= 0) {
      progbar.animate(perc);
    } else {
      progbar.animate(0);
    }
    this.progbar = progbar;

  }

  /**
   * Introduce the page and animate all elements in correctly
   */
  introducePage() {

    setTimeout(() => {
      this.doneLoading = true
      $('#pageBox').removeClass('hide').velocity('transition.slideUpIn'), { duration: 300}}, 800);
    // /* INITIALIZE MODULE ANIMATIONS */
    setTimeout(() => { 
    //   $('#headerTextSection').removeClass('hide').velocity('transition.shrinkIn') });
    // setTimeout(() => { $('#extraInfoTextSection').removeClass('invisible').velocity('transition.flipXIn', 500) }, 500);
    // setTimeout(() => { $('#addressSection').removeClass('hide').velocity('transition.flipYIn'), { duration: 2000 } }, 800);
    // setTimeout(() => { $('#ANIM_ratingstrip').removeClass('hide').addClass('animatestrip') }, 1300);
    // setTimeout(() => {

    // /* SHOW BADGE */
    // var basicTimeline = anime.timeline();

    // basicTimeline
    //   .add({
    //     targets: '.move-badge',
    //     scale: [{value: 0}, {value: 1}],
    //     opacity: [{value: 0}, {value: 1}],
    //     duration: 3000,
    //     elasticity: 200
    // })
    //   .add({
    //     targets: '.you-are-here',
    //     scale: [{value: 0}, {value: 0.5}],
    //     opacity: [{value: 0}, {value: 1}],
    //     duration: 3000,
    //     elasticity: 200
    // })

      /* INITIALIZE PROGRESS BARS */
      // $('#statsSection').removeClass('invisible').velocity('transition.fadeIn', { duration: 2000 });
      $("ion-col .module").velocity('transition.flipXIn', { stagger: 400 });
      this.progbar = this.stat.CreateStatsCounter(this.container, this.move);
      this.funstatbar = this.stat.CreateGeneralCounter(this.funbar, 'line', '#27e833', 1400, this.move, this.move.stats.fun, 'fun');
      this.mehstatbar = this.stat.CreateGeneralCounter(this.mehbar, 'line', '#FBD200', 1600, this.move, this.move.stats.meh, 'meh');
      this.deadstatbar = this.stat.CreateGeneralCounter(this.deadbar, 'line', '#f9152f', 1800, this.move, this.move.stats.dead, 'dead');
    }, 100);
    setTimeout(() => {
      $('#infoSection').removeClass('hide');
      $("*[id*=info]").velocity('transition.shrinkIn', { stagger: 800 })
      $('#infoSection').animate({ scrollTop: 0 });
    }, 1000)

    /* GET DATA */
    this.getConnectionsAtMove(this.move.key)
    this.getFriendsAtMove(this.move.key)

    /* ADD LISTENERS */
  }

  /**
   * Gets connections at a move
   * @param {string} movekey - the unique key of the move in the database (move.key)
   */
  getConnectionsAtMove(movekey) {
    this.connectionsAtMove = [];
    this.db.get('array', 'moves/'+this.locationTracker.currentCollege.key+'/'+movekey+'/users')
    .then(users => {
      for (let user of users) {
        if (this.mUser.isConnection(user.id)) {
          console.log('Adding ' + user.name + ' as connection...')
          this.connectionsAtMove.push(user)
          this.numConnections = this.connectionsAtMove.length;
        }
      }
    })
  }

  /**
   * Gets friends at a move
   * @param {string} movekey - the unique key of the move in the database (move.key)
   */
  getFriendsAtMove(movekey) {
    this.friendsAtMove = [];
    let mUser = this.mUser
    this.db.get('array', 'moves/'+this.locationTracker.currentCollege.key+'/'+movekey+'/users')
    .then(users => {
      this.db.get('array', 'userData/'+mUser.getFB().id+'/friends/members')
      .then(friends => {
        for (let user of users) {
          for (let friend of friends) {
            if (friend.id == user.id) {
              this.friendsAtMove.push(user)
              console.log('Adding ' + user.name + ' as friend...')
            }
          }}
        this.numFriends = this.friendsAtMove.length;
        })
      })
  }

  async checkIfHost() {
    let id = this.mUser.getFB().id;
    let gotHosts = await this.db.get('value', 'moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key+'/info/hosts');
    for (let host in gotHosts) {
      if (gotHosts[host].id == id) {
        this.isHost = true;
        break;
      } else {
        this.isHost = false;
      }
    }

  }

  scrollToCommentBox() {
    this.content.scrollTo(0, 9999, 1000);
  }

  submitComment() {
    let user = this.mUser.getFB()

    let dBPath = 'moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key+"/comments/"

    if (this.comment) {
      if (this.comment.trim() != "") {
        let commentInfo = {
          id: user.id,
          name: user.name,
          comment: this.comment,
          clocktime: this.system.getClockTime(),
          timestamp: this.system.getTimeStamp(),
          timeref: this.system.getTime()
        }
        let key = this.db.push(commentInfo, dBPath)
        this.db.insert({key: key}, dBPath+key)
        this.comment = "";
      }
    } else {
      this.system.showNotification('You need to enter a comment first.', 3000, 'error')
    }
  }

  deleteComment(key) {
    return this.db.remove('moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key+'/comments/'+key)
  }

  addUser() {
    let randomNum = Math.floor(Math.random() * 5000)
    this.db.insert({[randomNum]: 0}, 'moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key+'/users/')
    var newResult = {id: randomNum, in: 1, out: 0, timeRef: new Date().getTime()}
    this.db.push(newResult, 'moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key+'/stats/flow/')
  }

  removeUser() {
    this.db.get('value', 'moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key+'/users/').then(users => {
      let userKey = Object.keys(users)[0];
      this.db.remove('moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key+'/users/'+userKey)
      var newResult = {id: userKey, in: 0, out: 1, timeRef: new Date().getTime()}
      this.db.push(newResult, 'moves/'+this.locationTracker.currentCollege.key+'/'+this.move.key+'/stats/flow/')
    })
  }

  isAdmin() {
    let fbid = this.mUser.getFB().id
    if (fbid == '1248413801916793' || fbid == '5678910202') {
      return true;
    }
    return false;
  }

  userOptions(fbid, commentInfo?: any) {
      let me = this;
      let imageUrl = this.mUser.getPhoto(fbid).prof;
      let user = this.mUser.getFB();
      if (user.id != fbid) {
        let reportObj = {
          reporter: {
            id: user.id,
            name: user.name
          },
          culprit: {
            id: commentInfo.id,
            name: commentInfo.name
          },
          comment: {
            content: commentInfo.comment,
            key: commentInfo.key
          },
          move: {
            key: this.move.key, 
            name: this.move.info.name
          }
        }
        let imageHTML = '<div class="circle-avatar"><img class="image-circle" src="'+imageUrl+'"/>';
        let confirmFunc = function() {
            me.system.appLoader('Getting profile...');
            me.mUser.getUser(fbid).then(user => {
              me.system.loader.dismiss();
              let params = {userData: user}
              me.navCtrl.push(UserPage, params);
            })
        }

        let yesFunc = function() {
          me.system.report('comment', reportObj);
        }

        let reportFunc = function() {
          me.system.simpleYesNo("Are you sure you wish to report this comment? Reports will be evaluated by the administrators and are taken very seriously.", yesFunc, null, "Yes", "No, go back", "Are you sure?")
        }
        this.system.simpleYesNo(imageHTML, confirmFunc, reportFunc, "View Profile", "Report Comment", commentInfo.name); 
    } else {
      let removeFunc = function() {
        me.deleteComment(commentInfo.key).then(success => {
          me.system.displayToast('Comment has been removed.');
        })
      }
      this.system.simpleAlert("", "Options", "Remove Comment", removeFunc);
    }
  }

  viewDesc() {
    // this.system.displayToast(this.move.info.extraInfo, 999999, true);
    if (this.move.info.extraInfo.trim() != "") this.system.simpleAlert(this.move.info.extraInfo, this.move.info.name, "Close");
  }

  checkIn() {
    if (!this.userIsHere) {
      this.system.appLoader("Checking in right now...")
      this.mp.addUser(this.move.key);
      setTimeout(() => {
        this.system.displayToast("You're checked in!", 2000);
        this.system.loader.dismiss();
      }, 100);
    } else {
      this.system.appLoader("Checking out right now...")
      this.mp.removeUser(this.move.key);
      setTimeout(() => {
        this.system.displayToast("You're checked out.", 2000);
        this.system.loader.dismiss();
      }, 100);
    }
  }

  ionViewWillUnload() {
    clearInterval(this.checks);
    this.mp.cleanUp();
    this._watchMoveStop();
  }

    ionViewDidLoad() {
    // this._watchMoveStart();
  }

  _watchMoveStart() {
    // this.moveWatchRef = firebase.database().ref(`moves/${this.locationTracker.currentCollege.key}/${this.move.key}`)
    // this.moveWatchRef.on('value', updated => {
    //   console.log('STATS PAGE UPDATE!');
    //   this.refreshStats(true);
    // })
  }

  _watchMoveStop() {
    this.moveWatchRef.off();
  }
}
