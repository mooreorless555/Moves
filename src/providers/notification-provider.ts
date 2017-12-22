import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { OneSignal } from '@ionic-native/onesignal';
import { NativeStorage } from '@ionic-native/native-storage';
import { MoveUser } from '../providers/login-provider';
import { ToastController, NavController, App } from 'ionic-angular';
import { FriendsPage } from '../pages/friends/friends';
import { System } from '../pages/functions/functions';
import { LocationTracker } from '../providers/location-tracker';
import { DatabaseProvider } from '../providers/database-provider';
import firebase from 'firebase';
// import { System } from '../pages/functions/functions';
import 'rxjs/add/operator/map';

/*
  Generated class for the NotificationProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class NotificationProvider {

  private navCtrl: NavController;

  friends: any;
  badgeCount: number = 0;

  constructor(private app: App, private db: DatabaseProvider, private platform: Platform, private ln: LocalNotifications, private mUser: MoveUser, private system: System, public oneSignal: OneSignal, public lt: LocationTracker) {

    console.log('Hello NotificationProvider SWEET');
    this.navCtrl = this.app.getActiveNav();
    this.mUser.getFriendsListArr(this.mUser.getFB().id)
    .then(friends => {
      this.friends = friends;
    });
  }

  /* TAG CONTROL */
  addTag(key, val) {
    if (this.platform.is('cordova')) this.oneSignal.sendTag(key, val);
  }

  removeTag(key) {
    if (this.platform.is('cordova')) this.oneSignal.deleteTag(key);
  }

  async getTags(type?: string) {
    let tags = {};
    let def = new $.Deferred();
    if (this.platform.is('cordova')) {
      let tags = await this.oneSignal.getTags();
      if (type == "moves") {
        tags = tags.filter(tag => Object.keys(tag)[0].startsWith("MOVE_"));
      }
      def.resolve(tags);
       return def;
    }
  }

  async hasTag(key) {
    let tags = await this.getTags();
    return tags[key];
  }

  sendTagNotification(key, relation, val, message) {
    this.sendFilterPushNotification(message,  [{"field": "tag", "key": key, "relation": relation, "value": val}], {}, '2');
  }

  async sendFollowerNotification(move, message, type?: string) {
    let photoUrl = this.mUser.getPhoto(this.mUser.getFB().id).square;
    let extraData = {
      move: move,
      userPhoto: photoUrl,
      type: type || ''
    }
    return await this.sendFilterPushNotification(message, [{"field": "tag", "key": `MOVE_${move.key}`, "relation": "=", "value": "follow"}], extraData, '3');
  }

  sendToHostNotification(move, message, type?: string) {
    let photoUrl = this.mUser.getPhoto(this.mUser.getFB().id).square;
    let extraData = {
      move: move,
      userPhoto: photoUrl,
      type: type || ''
    }

    this.sendFilterPushNotification(message, [{"field": "tag", "key": `HOST_${move.key}`, "relation": "=", "value": "is_host"}], extraData, '3'); 
  }

  getNotificationBadges() {
    let id = this.mUser.getFB().id;
    let ref = firebase.database().ref('/userData/'+id+'/friends');
    ref.on('value', snap => {
      if (!snap.val().requests_recv) this.badgeCount = 0;
      else this.badgeCount = Object.keys(snap.val().requests_recv).length;
    })
  }

  sendLocalNotification(message: string, title?: any, id?: number) {
    // Schedule multiple notifications
    if (!id) id = 1;
    if (!title) title = "Moves";
    this.ln.schedule([{
      id: id,
      title: title,
      text: message,
      data: { secret: "Hello" },
      color: '886FE8',
      led: '886FE8'
    }]);
    console.log('Sent notification with title: ' + title + " and message: " + message)
  }

  sendFriendNotification(friend) {
    var me = this;

    var title = "Moves";
    var message = friend.name + " wants to be your friend!";

    var data = {
      title: title,
      message: message
    }
    // this.ln.schedule([{
    //   id: 1,
    //   title: title,
    //   text: message,
    //   data: { secret: "Hello" },
    //   color: '886FE8',
    //   led: '886FE8'
    // }]);

    // console.log('Sent friend notification with title: ' + title + " and message: " + message)

    // this.ln.on('click', function() {
    //   me.navCtrl.push(FriendsPage);
    // })

  }

  sendBulletinNotification(friend) {

    var do_continue = false;
    var me = this;

      for (var your_friend of this.friends) {
        if (friend.id == your_friend.id) do_continue = true;
      }

      if (do_continue) {
        var title = friend.name + " posted!";
        var postString = friend.content.split(" ");
        // postString[0] = postString[0].slice(0, -3);
        // postString = postString.join(" ");
        var timeString = "";
        timeString += this.system.getTimeUntil(friend.startTime);
        if (timeString != "right now") timeString = "in " + timeString;
        var message = friend.first_name + ": " + postString.join(" ") + " " + timeString;


      }

  }

  async sendPushToUser(fbid, message) {
    let recipientPushId = await this.db.get('value', '/userData/'+fbid+'/push/userId')
    let recipientsIds = new Array();
    recipientsIds.push(recipientPushId)
    this.sendIndividualPush(recipientsIds, message)
  }

  async sendPushToNearby(message) {
    let location = {
      lat: this.lt.lat,
      lng: this.lt.lng,
      radius: 4828
    }
    this.sendLocationPushNotification({message: message, location: location})
  }

  async sendPushToWorld(message) {
    this.sendPushNotification({message: message, included_segments: ["All"]});
  }

  async sendPushToFriends(message) {
    let friends = await this.mUser.getFriendsListArr(this.mUser.getFB().id);
    for (let friend of friends) {
      this.sendPushToUser(friend.id, message);
    }
  }

  async sendPushToGroup(group, message) {
    for (let person of group) {
      this.sendPushToUser(person.id, message);
    }
  }

  sendIndividualPush(recipients, message) {
    this.sendPushNotification({message: message, player_ids: recipients})
  }

  sendPushNotification(obj) {
        var data = { 
          app_id: "73988abc-df1b-455e-b71c-03e817ba9c9a",
          contents: {"en": obj.message},
          android_background_layout: {
            "headings_color": "FF886FE8", 
            "contents_color": "FF886FE8"
          },
          android_visibility: 1,
          android_led_color: "FF886FE8",
          android_accent_color: "#FF886FE8",
          large_icon: "https://firebasestorage.googleapis.com/v0/b/moves-ad1b4.appspot.com/o/misc%2Flarge_icon?alt=media&token=d918d630-f163-48a9-85e5-a308b211ec62",
          payload: {
            android_led_color: "#FF886FE8",
            android_accent_color: "#FF886FE8",
          },
          location: obj.location || null,
          include_player_ids: obj.player_ids,
          included_segments: obj.included_segments || null
        };
    
        var headers = {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Basic NWM0YjA3MWQtMTNmNi00MDMyLWI1MzMtZjBkNmYxNmUxZTg0"
        };
        
        var options = {
          host: "onesignal.com",
          port: 443,
          path: "/api/v1/notifications",
          method: "POST",
          headers: headers
        };
        
        var https = require('https');
        var req = https.request(options, function(res) {  
          res.on('data', function(data) {
            console.log("Response:");
            console.log(JSON.parse(data));
          });
        });
        
        req.on('error', function(e) {
          console.log("ERROR:");
          console.log(e);
        });
        
        req.write(JSON.stringify(data));
        req.end();
    }

async sendFilterPushNotification(message, filterArray, extraData?, collapseId?: string) {
 if (!extraData) extraData = {};

 var def = new $.Deferred();
 var data = { 
          app_id: "73988abc-df1b-455e-b71c-03e817ba9c9a",
          contents: {"en": message},
          android_background_layout: {
            "headings_color": "FF886FE8", 
            "contents_color": "FF886FE8"
          },
          android_visibility: 1,
          android_led_color: "FF886FE8",
          android_accent_color: "#FF886FE8",
          large_icon: "https://firebasestorage.googleapis.com/v0/b/moves-ad1b4.appspot.com/o/misc%2Flarge_icon?alt=media&token=d918d630-f163-48a9-85e5-a308b211ec62",
          payload: {
            android_led_color: "#FF886FE8",
            android_accent_color: "#FF886FE8",
          },
          data: extraData,
          filters: filterArray,
          collapse_id: collapseId || '1'
        };
    
        var headers = {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Basic NWM0YjA3MWQtMTNmNi00MDMyLWI1MzMtZjBkNmYxNmUxZTg0"
        };
        
        var options = {
          host: "onesignal.com",
          port: 443,
          path: "/api/v1/notifications",
          method: "POST",
          headers: headers
        };
        
        var https = require('https');
        var req = https.request(options, function(res) {  
          res.on('data', function(data) {
            console.log("Response:");
            console.log(JSON.parse(data));
            def.resolve(data);
          });
        });
        
        req.on('error', function(e) {
          console.log("ERROR:");
          console.log(e);
        });
        
        req.write(JSON.stringify(data));
        req.end();
      
        return def;
    }


  sendLocationPushNotification(obj) {
        var data = { 
          app_id: "73988abc-df1b-455e-b71c-03e817ba9c9a",
          contents: {"en": obj.message},
          android_background_layout: {
            "headings_color": "FF886FE8", 
            "contents_color": "FF886FE8"
          },
          android_visibility: 1,
          android_led_color: "FF886FE8",
          android_accent_color: "#FF886FE8",
          large_icon: "https://firebasestorage.googleapis.com/v0/b/moves-ad1b4.appspot.com/o/misc%2Flarge_icon?alt=media&token=d918d630-f163-48a9-85e5-a308b211ec62",
          payload: {
            android_led_color: "#FF886FE8",
            android_accent_color: "#FF886FE8",
          },
          filters: [{"field": "location", "lat": obj.location.lat, "long": obj.location.lng, "radius": 4828}]
        };
    
        var headers = {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Basic NWM0YjA3MWQtMTNmNi00MDMyLWI1MzMtZjBkNmYxNmUxZTg0"
        };
        
        var options = {
          host: "onesignal.com",
          port: 443,
          path: "/api/v1/notifications",
          method: "POST",
          headers: headers
        };
        
        var https = require('https');
        var req = https.request(options, function(res) {  
          res.on('data', function(data) {
            console.log("Response:");
            console.log(JSON.parse(data));
          });
        });
        
        req.on('error', function(e) {
          console.log("ERROR:");
          console.log(e);
        });
        
        req.write(JSON.stringify(data));
        req.end();
    }


  // sendPushNotification(data) {
  //   var notificationObj: any = {
  //     headings: {"en": "Moves"},
  //     contents: {"en": "Hello!"},
  //     android_led_color: "#FF886FE8",
  //     android_accent_color: "#FF886FE8",
  //     included_segments: ["All"]
  //   }

  //   // var payload = {
  //   //   notificationID: "1",
  //   //   title: "Moves",
  //   //   body: data.message,
  //   //   ledColor: "#FF886FE8",
  //   //   smallIconAccentColor: "#FF886FE8"
  //   // }
    // this.oneSignal.postNotification(notificationObj)

  // }

}




@Injectable()
export class Tutorial {

  toast: any;
  isPlaying = false;

  tutorialText = {
    stats: false,
    home: false,
    make: false,
    you: false
  }

  constructor(private mUser: MoveUser, private toastCtrl: ToastController, private ns: NativeStorage) {
    this.get().then(result => this.tutorialText = result);
  }

  get() {
    return this.ns.getItem('tutorialText')
  }

  update() {
    return this.ns.setItem('tutorialText', this.tutorialText);
  }

  home(numMoves) {
    if (!this.tutorialText.home) {
      let currentUser = this.mUser.getFB()
      this.mUser.getUser(currentUser.id).then(userData => {
          let numMovesComment = function() {
            if (numMoves == 0) {
              return "Rip, no moves right now. If there were, you could tap on one of them to get more info about them. Why not make a move yourself?";
            } else if (numMoves == 1) {
              return "Lit, there's a move right now. You can tap it to see more info about it!";
            } else {
              return "Lit, there's " + numMoves + " moves going on right now. You can tap any of them to get more info!";
            }
          }

          let toastOpts = [
          {message: "Hey " + userData.first_name + ", welcome to Moves! Let me just give you a little rundown of what you're seeing here..."},
          {message: "This is the Hub- here you'll be able to see an overview of the moves going on right now."},
          {message: numMovesComment(), closeBtn: "GOT IT"}
        ]
      if (!this.isPlaying) {
        this.displayMultiToast(toastOpts); 
        this.tutorialText.home = true;
        this.update();
      }
      })
    }
  }

  make() {
    if (!this.tutorialText.make) {
        let toastOpts = [
        {message: "Here you can make a move! By default, the move will be Open to everyone else unless you specify otherwise in the options below (where you can invite any of your Facebook friends also on Moves)."},
        {message: "Just a quick note about the 'Place' field- Moves will either get your address from your current location via GPS or you can specify where you want the address of your move to be in the options below, so the 'Place' field is more for like a shorthand name of the location."},
        {message: "(Think like, Place is TD Suite A21, Location (address) is 345 Temple Street.)", closeBtn: 'GOT IT', position: "top"},
        {message: "One last thing- if you're making a move, you have to be hosting something legit!"},
        {message: "So please no fake moves or anything like that- others can report you for doing so and it's just not a fun thing to do."},
        {message: "Alright, sweet. Thanks!", closeBtn: 'NP'}
      ]
      if (!this.isPlaying) { this.displayMultiToast(toastOpts);    
      this.tutorialText.make = true;
      this.update();
    }
    }
  }

  you() {
    if (!this.tutorialText.you) {
      let toastOpts = [
        {message: "This is a little profile page for you. You can tap on your aliases and badges to change them, as well as change your bio. Every user has one of these. That's about it!"},
      ]
      if (!this.isPlaying) { 
        this.displayMultiToast(toastOpts);   
        this.tutorialText.you = true;    
        this.update();
      }
    }
  }

  stats() {
    if (!this.tutorialText.stats) {
      let toastOpts = [
        {message: "Stats. You can see how many people are currently at this move, how many of your Facebook friends are there, and who of your friends on Moves are there!"}
        // {message: "You can also post comments about the move below-", duration: 2000},
        // {message: "Hosts: this can come in handy for you if you need to tell any of your current or potential guests something important."},
        // {message: "Guests: you can be useful to other guests with comments about the move here, too.", closeBtn: "GOT IT"},
        // {message: "Remember to keep it respectful.", position: 'top', duration: 3000},
        // {message: "You can tap on any of these data blocks to get more information. Alright, that's it!"}
      ]
      if (!this.isPlaying) { 
      this.displayMultiToast(toastOpts);    
      this.tutorialText.stats = true;    
      this.update();
    }
    }
  }


  displayMultiToast(opts, end?:number, start?:number) {
    if (!start) {
      start = 0;
      this.isPlaying = true;
    }
    if (!end) end = opts.length;

    if (start < end) {

      let settings = opts[start];
      let closeBtnText = function() {
        if (!settings.closeBtn) {
          if (start == end-1) {
            return 'DONE';
          } else {
            return 'NEXT';
          }
        } else {
          return settings.closeBtn;
        }
      }

      this.toast = this.toastCtrl.create({
        message: settings.message,
        duration: settings.duration ? settings.duration : 20000,
        position: settings.position ? settings.position : 'bottom',
        cssClass: 'my-toast',
        showCloseButton: true,
        closeButtonText: closeBtnText(),
        dismissOnPageChange: false
      })

      this.toast.onDidDismiss(() => {
          start++;
          this.displayMultiToast(opts, end, start);
      })

      this.toast.present();
    } else {
      this.isPlaying = false;
    }
  }

  dismissAll() {
    this.toast = 0;
  }
}