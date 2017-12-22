import { Component, Input, trigger, state, style, animate, transition } from '@angular/core';
import { flipYInOut } from '../../animations/common.ts';
import { ChangeDetectorRef } from '@angular/core';
import { App, NavController } from 'ionic-angular';
import { StatsPage } from '../../pages/stats/stats';
import firebase from 'firebase';
import * as _ from 'lodash';
import { MovesProvider } from '../../providers/moves-provider';
import { MoveUser } from '../../providers/login-provider';
import { DatabaseProvider } from '../../providers/database-provider';
import { PreferencesProvider } from '../../providers/preferences-provider';
import { NotificationProvider } from '../../providers/notification-provider';
import { Badges } from '../../providers/profile-provider';
import { System } from '../../pages/functions/functions';

declare var moment: any;

/**
 * Generated class for the MoveItemComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'move-item',
  templateUrl: 'move-item.html',
  animations: [
    // trigger('fadeInOut', [
    //   transition(':enter', [   // :enter is alias to 'void => *'
    //     style({ position: 'relative', top: '300px', opacity: 0 }),
    //     animate(200, style({ position: 'relative', top: '0px', opacity: 0 })),
    //     animate(500, style({ position: 'relative', top: '0px', opacity: 1 }))
    //   ]),
    //   transition(':leave', [   // :leave is alias to '* => void'
    //     animate(500, style({ opacity: 0 }))
    //   ])
    // ])
    trigger('slideInOut', [
      state('*', style({
                  // the view covers the whole screen with a semi tranparent background
                  position: 'relative',
                  opacity: 1,
                  scale: 1
              })),
      
              // route 'enter' transition
              transition(':enter', [
      
                  // styles at start of transition
                  style({
                      // start with the content positioned off the right of the screen,
                      // -400% is required instead of -100% because the negative position adds to the width of the element

      
                      // start with background opacity set to 0 (invisible)
                      transform: 'scale(0.95)',
                      opacity: 0
                  }),
      
                  // animation and styles at end of transition
                  animate('.8s ease', style({

                      // transition the background opacity to 0.8 to fade it in
                      transform: 'scale(1)',
                      opacity: 1
                  }))
              ]),
      
              // route 'leave' transition
              transition(':leave', [
                  // animation and styles at end of transition
                  animate('.8s ease', style({

                      // transition the background opacity to 0 to fade it out
                      transform: 'scale(0.95)',
                      opacity: 0
                  }))
              ])
          ])
        ]
})
export class MoveItemComponent {

  ngOnDestroy() {
    console.log("Watch stopped.");
    this._stopMoveWatch();
  }

  async _startMoveWatch() {
    var me = this;
    this.moveWatchRef = firebase.database().ref(`moves/yale/${this.move.key}`)
    this.moveWatchRef.on('value', updated => {
      this.move = updated.val();

      console.log(this.move.followers);

      let followerNames = this.system.getArrayFromObjProps(this.move.followers, 'name');

      let followTextSelector = `#id_${me.move.key} .follow-text`;
      let followTextAnimation = `transition.flipBounceYIn`;
      let followTextString = `
        <ion-icon name="add"></ion-icon>
        <a class="move-text follow-number">${followerNames.length}</a>
        ${followerNames.length == 1 ? "follow" : "follows"}`

      let captionTextSelector = `#id_${me.move.key} .caption-text`;
      let captionTextAnimation = `transition.flipBounceYIn`;
      let captionTextString = this.system.listOfNames(followerNames, 4);

    if (!this.animating) {
      this.animating = true;
      this.system.updateHTML(followTextSelector, followTextAnimation, followTextString)
          .then(() => {
            this.system.updateHTML(captionTextSelector, captionTextAnimation, captionTextString);
          })
          .then(() => {
            this.animating = false
          });
    }
    })
  }

  

  _stopMoveWatch() {
    this.moveWatchRef.off();
  }


  ngAfterViewInit() {

    this.introduceComponent();
    this.determineTagStatus();
    this.displayInformation();
    this._startMoveWatch();

    this.startTimeDate = new Date(this.move.info.pending.startTime);


    /* Place people bars in the Move container */
    this.mp.putBars(this.move);

    this.countDownInterval = setInterval(() => {
      let d = new Date();
      let newTime = d.getTime();
      this.countDownTime = this.getCountdownClock(this.move.info.pending.startTime, newTime)
      this.countDownNum = this.countDownTime.string;
      this.countDownMsg = `${moment(this.startTimeDate).startOf('minute').fromNow()}`;
    }, 1000)

    /* If move is still pending, grey out */
    if (this.move.info.isPending) {
      $('#id_'+this.move.key).addClass('greyed-out')
    } else {
      $('#id_'+this.move.key).removeClass('greyed-out')
    }

    setTimeout(() => {
      /* Show names of hosts */
      let hostNames = this.system.getArrayFromProps(this.system.convertListToArray(this.move.info.hosts), 'name', this.move.info.owner);
      this.hosts = this.system.listOfNames(hostNames, 1);

      /* Show start time */
      this.startTimeMsg =  moment(this.startTimeDate).calendar();
    }, 10)

    this._changeDetectorRef.detectChanges();
  }

  ionViewWillLeave() {
    this.exitComponent();
  }

  exitComponent() {
  var moveTimeline = anime.timeline();

   moveTimeline
    .add({
      targets: '.timer-text',
      easing: 'easeOutBack',
      scale: [{value: 1}, {value: 0.8}],
      opacity: [{value: 1}, {value: 0}],
      duration: 1000,
      offset: 0     
    })
    .add({
      targets: '.timer',
      delay: function(el, i, l) { return (i * 100)+500; },
      easing: 'easeOutBack',
      scale: [{value: 1}, {value: 0}],
      opacity: [{value: 1}, {value: 0}],
      duration: 1000,
      offset: 0
    })
  }

  introduceComponent() {
    // $('h2').find('#hosts').velocity('transition.fadeIn', {delay: 1000})
    setTimeout(() => {
      this.moveName = this.prefs.filterSwears(this.move.info.name);
      this.extraMoveInfo = this.prefs.filterSwears(this.move.info.extraInfo);
      this.badgeSrc = this.badges.get(this.move.info.owner.badgeId).image
    }, 200)

    // var moveTimeline = anime.timeline();

  //   moveTimeline
  //   .add({
  //     targets: '.timer-text',
  //     easing: 'easeOutBack',
  //     scale: [{value: 0.8}, {value: 1}],
  //     opacity: [{value: 0}, {value: 1}],
  //     duration: 1000,
  //     offset: 0     
  //   })
  //   .add({
  //     targets: '.timer',
  //     delay: function(el, i, l) { return (i * 100)+500; },
  //     easing: 'easeOutBack',
  //     scale: [{value: 0.8}, {value: 1}],
  //     opacity: [{value: 0}, {value: 1}],
  //     duration: 1000,
  //     offset: 0
  //   })
  }


  @Input('move') move: any;

  timesUpdated: number = 0;

  text: string;
  color: string;
  d: any;
  hosts: any;
  followers: any;

  moveName: string;
  extraMoveInfo: string;

  description: string;

  badgeSrc: string;

  countDownTime: any;
  countDownNum: string;
  countDownMsg: string;
  countDownInterval: any;
  startTimeMsg: string;

  isFollowing: any = false;

  startTimeDate: any;

  followersRef: any;
  numFollowers = 0;

  moveWatchRef: any;

  animating: any = false;

  constructor(public app: App, public mUser: MoveUser, private _changeDetectorRef: ChangeDetectorRef, public system: System, public badges: Badges, public prefs: PreferencesProvider, public np: NotificationProvider, public mp: MovesProvider, public db: DatabaseProvider) {
    console.log('Hello MoveItemComponent Component');
    let colors = ["lime", "orange", "blue"]
    this.color = colors[Math.floor(Math.random()*colors.length)]
    this.hosts = "...";
    this.startTimeMsg = ".......";
  }

  checkStats(move, key) {
    try {
      this.mp.stopTrackingChanges();
      this.app.getRootNav().push(StatsPage, {
        firstPassed: move,
        movekey: key
      });

      // if (move.info.isPending) 
        // this.system.displayToast(`${move.info.name} will go live ${this.countDownMsg}`);
    } catch (e) {
      // this.system.simpleAlert(`We encountered an error: ${JSON.stringify(e)}`, "Error", "Go back");
    }

  }

getCountdownClock(startTime, nowTime) {
    var millis = startTime - nowTime;

    var hours = Math.floor(millis / 36e5),
        mins = Math.floor((millis % 36e5) / 6e4),
        secs = Math.floor((millis % 6e4) / 1000);
    
    var returnObj = {
      string: ("0"+hours).slice(-2)+":"+("0"+mins).slice(-2)+":"+("0"+secs).slice(-2),
      time: millis,
      done: false
    }

    if (millis <= 0) {
      returnObj.done = true;
      returnObj.string = "00:00:00";
    }

    return returnObj;
}

  async determineTagStatus() {
    let tags = await this.np.getTags();
    let followStatus = tags[`MOVE_${this.move.key}`] || null;
    let hostStatus   = tags[`HOST_${this.move.key}`] || null;

    let isHost = this.move.info.hosts[this.mUser.getFB().id];

     if (followStatus == "follow") {
      this.isFollowing = true;
    } else if (followStatus == "unfollow") {
      this.isFollowing = false;
    }

    if (isHost) {
      this.np.addTag(`HOST_${this.move.key}`, "is_host");
    } else if (!isHost) {
      this.np.removeTag(`HOST_${this.move.key}`);
    }
  }


  async follow(on) {
    if (on) {
      // Add push tag
      this.np.addTag(`MOVE_${this.move.key}`, "follow");
      this.system.displayToast(`You will receive notifications from ${this.move.info.name}.`, 5000, null, 'FOLLOWING', null, 'success');
      this.mp.addFollower(this.move);
      
      // Notify host
      this.np.sendToHostNotification(this.move, `${this.mUser.getFB().name} just followed ${this.move.info.name}.`, 'userHasFollowed');
    } else {
      // Add push tag
      this.np.addTag(`MOVE_${this.move.key}`, "unfollow");
      this.system.displayToast(`You will no longer receive notifications from ${this.move.info.name}.`, 5000, null, 'UNFOLLOWED');
      this.mp.removeFollower(this.move);
    }

    this.determineTagStatus();
  }

  async displayInformation() {
    this.followersRef = firebase.database().ref(`/moves/yale/${this.move.key}/followers`);

    this.followersRef.on('value', followers => {
      if (followers.val()) {
        this.numFollowers = Object.keys(followers.val()).length;
      } else {
        this.numFollowers = 0;
      }
    })

  }

  
}
