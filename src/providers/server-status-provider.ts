import { Injectable } from '@angular/core';
import { Platform, App, NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import firebase from 'firebase';
import { System } from '../pages/functions/functions';
import { NotificationProvider } from '../providers/notification-provider';
import { MoveUser } from '../providers/login-provider';
import { DatabaseProvider} from '../providers/database-provider';

import { FriendsPage } from '../pages/friends/friends';

/*
  Generated class for the ServerStatusProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class ServerStatusProvider {

  noticeMessageCount = 0;
  notifMessageCount = 0;
  quitMessageCount = 0;

  serverStats = {
    uniqueDailyLogins: {nothing: 0},
    totalDailyLogins: 0
  }

  friendReqRef: any;
  bulletinRef: any;

  private navCtrl: NavController;



  constructor(private system: System, private platform: Platform, private db: DatabaseProvider, private app: App, public mUser: MoveUser, private np: NotificationProvider) {
    console.log('Hello Server Status!');
    this.navCtrl = app.getActiveNav();
  }

  run() {
    this.watchNoticeMessage();
    this.watchNotificationMessage();
    this.watchQuitMessage();
    // this.watchUserStatus();
    this.watchServerStats();
  }

  watchFriendRequests() {
    if (this.friendReqRef) this.friendReqRef.off();

    let me = this;
    let user = this.mUser.getFB();
    this.friendReqRef = firebase.database().ref('/userData/'+user.id+'/friends/requests_recv/')
    let newItems = false;

this.friendReqRef.on('child_added', function(friend) {
    if (!newItems) return;
    var person = friend.val();
    // console.log(message.val());
    me.np.sendFriendNotification(person);
    console.log('ADDED!', friend.val());
  });
    this.friendReqRef.once('value', function(friends) {
      newItems = true;
    });
  }

  watchBulletinPosts() {
    if (this.bulletinRef) this.bulletinRef.off();

    let me = this;
    let user = this.mUser.getFB();
    this.bulletinRef = firebase.database().ref('/bulletin/posts/')
    let newItems = false;

this.bulletinRef.on('child_added', function(friend) {
    if (!newItems) return;
    var person = friend.val();
    // console.log(message.val());
    // me.np.sendBulletinNotification(person);
    console.log('ADDED!', friend.val());
  });
    this.bulletinRef.once('value', function(friends) {
      newItems = true;
    });
  }

  watchNoticeMessage() {
    let ref = firebase.database().ref('/serverInfo/noticeMessage');

    ref.on('value', snapshot => {
      let message = snapshot.val();
      if (this.noticeMessageCount > 0) {
        this.system.simpleAlert(message, "Notice");
      }
      this.noticeMessageCount++;
    })
  }

  watchNotificationMessage() {
    let ref = firebase.database().ref('/serverInfo/notifMessage');

    ref.on('value', snapshot => {
      let message = snapshot.val();
      if (this.notifMessageCount > 0) {
        this.np.sendLocalNotification(message, "Moves", 5);
      }
      this.notifMessageCount++;
    })
  }

  watchQuitMessage() {
    let ref = firebase.database().ref('/serverInfo');

    ref.on('value', snapshot => {
      let serverInfo = snapshot.val();
      if (serverInfo.status.type == 0) {
        let me = this;
        let exitApp = function() {
          me.platform.exitApp();
        }
        this.system.simpleAlert(serverInfo.quitMessage + "<br>See you soon!</br>", "Server Shutting Down!", "NO!!! >:O", exitApp, false);
        setTimeout(() => this.platform.exitApp(), 10000);
      } else {
        console.log('Quit message attempted but status is not 0.')
      }
      this.quitMessageCount++;
    })
  }

  watchDebugMessage(yourId) {
    let ref = firebase.database().ref('/serverInfo/debug');

    ref.on('value', snapshot => {
      let debug = snapshot.val();

      let userList = debug.allowedUsers.split(',');
      let message = debug.message;

      let me = this;
      let exitApp = function() {
        me.platform.exitApp();
      }
      if (debug.status && userList.indexOf(yourId) == -1) {
        this.system.simpleAlert(message, "Fixing stuff!", "Quit", exitApp, false)
      } else if (debug.status) {
        this.system.displayToast("Debug access granted. Be careful in there!", 5000);
      }
    })
  }

  watchUserStatus() {
    let user = this.mUser.getFB();

    // only if user exists in the first place
    if (user) {
        let ref = firebase.database().ref('/userData/'+user.id+'/userStatus/');

        ref.on('value', snapshot => {
          let userStatus = snapshot.val();
          if (userStatus.banned == true) {
            let me = this;
            let exitApp = function() {
              me.platform.exitApp();
            }
            this.system.simpleAlert("Your account has been disabled.", "Notice", "OK", exitApp, false);
            setTimeout(() => this.platform.exitApp(), 10000);
          } else {
            console.log('User is not banned.')
          }
        })
      }
    }
    
    watchServerStats() {
      let def = new $.Deferred();
      let serverStatsRef = firebase.database().ref('/serverStats/')

      serverStatsRef.on('value', updated => {
        this.serverStats = updated.val();
        def.resolve();
      })

      return def;
    }

    async updateServerStats(request) {

      console.warn("PRINTING SERVER STATS BELOW");
      console.dir(this.serverStats);
      let user = this.mUser.getFB();

      // Determine request
      if (request == `ADD_UNIQUE_LOGIN`) {
        let userLoginEntry = this.serverStats.uniqueDailyLogins[user.id]

        // If entry doesn't yet exist
        if (!userLoginEntry) {
          Object.assign(this.serverStats.uniqueDailyLogins, {[user.id]: 1});
          console.error("userEntry does not exist yet.")
        }
        else {
          console.info("userEntry does exist.", userLoginEntry);
          this.serverStats.uniqueDailyLogins[user.id] += 1;
        }
      }

      else if (request == `ADD_TOTAL_LOGIN`) {
        this.serverStats.totalDailyLogins += 1;
      }

      // Update in the database
      return await this.db.insert(this.serverStats, '/serverStats/');
    }
  }
