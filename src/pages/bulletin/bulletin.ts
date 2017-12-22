import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { System, Globals } from '../functions/functions';
import { MoveUser } from '../../providers/login-provider';
import { NotificationProvider } from '../../providers/notification-provider';
import { DatabaseProvider } from '../../providers/database-provider';

declare var swal: any;

/**
 * Generated class for the BulletinPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-bulletin',
  templateUrl: 'bulletin.html',
})
export class BulletinPage {

  searching = true;

  bulletinObject = {
    id: "",
    name: "",
    first_name: "",
    startTime: "",
    endTime: "",
    key: "",
    content: ""
  }

  bulletinDBPath = "/bulletin/";

  user: any;

  friends: any;

  posts = [];

  constructor(public navCtrl: NavController, public np: NotificationProvider, private system: System, private mUser: MoveUser, private db: DatabaseProvider, public navParams: NavParams) {
    this.user = this.mUser.getFB();
    this.getFriends();
  }

  ngAfterViewInit() {
  }

  getAll() {
    return this.db.get('value', this.bulletinDBPath+'posts/')
  }

  getFriends() {
    this.mUser.getFriendsListArr(this.user.id)
    .then(friends => {
      this.friends = friends;
      this.refreshPosts();
    })
  }

  hasPost() {
    for (var post of this.posts) {
      if (post.id == this.user.id) return true;
    }
    return false;
  }

  refreshPosts(refresher?: any) {
    try {
    this.posts = [];
    this.searching = true;
    this.getAll()
    .then(posts => {
      for (var post in posts) {

        // If its the user's own post
        if (posts[post].id == this.user.id) {
          this.posts.push(posts[post])
        } else {

          // Filtering just friends' posts.
          for (var friend of this.friends) {
            if (friend.id == posts[post].id) this.posts.push(posts[post]);
          }

        }



      }
      console.log('Friends Posts: ', this.posts);
      if (refresher) {
        setTimeout (() => {
        refresher.complete()
        this.searching = false}, 500)
      } else {
        this.searching = false;
      }
    })
  }
  catch (e) {
    alert(JSON.stringify(e));
    alert(e);
  }
}

  delete(key) {
    var me = this;
    var deleteFunc = function() {
      me.deleteBulletin(key);
    }

    this.system.simpleYesNo("You sure you want to delete your post?", deleteFunc, null, "Yes, take it off", "Nevermind", "Delete?");
  }

  make() {
    var bulletinData = {};

    if (!this.hasPost()) {
    swal({
      title: 'What are you doing?',
      html: 'ex. "getting dinner in Morse"<br>' + "(This post will only be visible to those you've friended on Moves)",
      confirmButtonText: "Next",
      confirmButtonColor: '#e86f6f',
      input: 'text',
      inputPlaceholder: 'getting dinner in Morse',
      // inputValidator: function (value) {
      //   return new Promise(function (resolve, reject) {
      //     if (!value) {
      //       reject('You need to write something!');
      //     } else if (!value.split(" ")[0].endsWith('ing')) {
      //       reject("This isn't the right format. Just fill in the [doing something] part with what you're doing.");
      //     } else {
      //       resolve();
      //     }
      //   })
      // }
    }).then(text => {
        swal({
          title: 'In how many minutes?',
          html: "Do 0 minutes if you're doing it right now.",
          input: 'range',
          confirmButtonText: "Next",
          confirmButtonColor: '#e86f6f',
          inputAttributes: {
            min: 0,
            max: 120,
            step: 5
          },
          inputValue: 10
        })
        .then(in_minutes => {
          swal({
            title: 'And for how long?',
            html: "This is just about how long (in hours) you think it'll be for. If it's less than an hour just put 1 for now.",
            input: 'range',
            confirmButtonText: "Post",
            confirmButtonColor: '#58bb50',
            inputAttributes: {
              min: 1,
              max: 5,
              step: 1
            },
            inputValue: 1
          })   
          .then(for_hours => {      
            bulletinData["startTime"] = new Date().getTime() + in_minutes*60*1000;
            bulletinData["endTime"] = new Date().getTime() + for_hours*60*60*1000;
            bulletinData["text"] = text;
            this.addBulletin(bulletinData);
        })
    })
  })
} else {
  this.system.simpleAlert("You already posted something! Click the trash icon to delete your old one before you make a new one.");
}
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BulletinPage');
  }

  notifyFriends(friend) {

    var postString = friend.content.split(" ");
    var timeString = "";
    timeString += this.system.getTimeUntil(friend.startTime);
    if (timeString != "right now") timeString = "in " + timeString;
    var message = friend.first_name + ' - ' + postString.join(" ") + ' ' + timeString;

    this.np.sendPushToFriends(message);

  }

  addBulletin(data: any) {
    let user = this.mUser.getFB();        // get user
    this.bulletinObject.id = user.id;     // set bulletin attributes
    this.bulletinObject.startTime = data.startTime;
    this.bulletinObject.endTime = data.endTime;
    this.bulletinObject.first_name = user.first_name;
    this.bulletinObject.name = user.name;

    var text = data.text.split(" ");
    text[0] = text[0].toLowerCase();

    for (var i = 0; i < text.length; i++) {
      if (text[i].toLowerCase() == "my") text[i] = "their";
      if (text[i].toLowerCase() == "mine") text[i] = "theirs";
      if (text[i].toLowerCase() == "i") text[i] = "they";
      if (text[i].toLowerCase() == "am") text[i] = "are";
      if (text[i].toLowerCase() == "i'm") text[i] = "they're";
    }

    text = text.join(" ");
    this.bulletinObject.content = text;
    let newKey = this.db.push(this.bulletinObject, this.bulletinDBPath+'posts/'); // push to DB and get key also
    this.db.insert({key: newKey}, this.bulletinDBPath + 'posts/' + newKey)
    .then(() => {
      this.notifyFriends(this.bulletinObject);
      this.refreshPosts();
    })
  }

  editBulletin(key: string) {
    swal({
      title: 'Edit?',
      html: 'Make any changes you need to.',
      confirmButtonText: "Confirm Changes",
      confirmButtonColor: '#58bb50',
      input: 'text',
      inputPlaceholder: 'studying in Bass'
    })
    .then(result => {
      this.db.insert({content: result},this.bulletinDBPath + 'posts/' + key)
      .then(() => {
        this.refreshPosts();
      })
    })
  }

  deleteBulletin(key: string) {
    this.db.remove(this.bulletinDBPath + 'posts/' + key)
    .then(() => {
      this.refreshPosts();
    })
  }

  async addNum(key: string) {
    let user = this.mUser.getFB();
    let userObj = {
      id: user.id,
      name: user.name
    }
    return this.db.insert({[user.id]: userObj} , this.bulletinDBPath + 'posts/' + key + '/po/');
  }

  async removeNum(key: string) {
    let user = this.mUser.getFB();
    return this.db.remove(this.bulletinDBPath + 'posts/' + key + '/po/' + user.id);
  }

  async notifyFriend(theirId: string, message: string) {
    this.np.sendPushToUser(theirId, message);
  }

}
