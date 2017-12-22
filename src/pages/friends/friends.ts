import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MoveUser } from '../../providers/login-provider';
import { ConnectionsPage } from '../connections/connections';
import { NotificationProvider } from '../../providers/notification-provider';
import { System } from '../functions/functions';

/**
 * Generated class for the Friends page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-friends',
  templateUrl: 'friends.html',
})
export class FriendsPage {

  busy: Promise<any>;

  friendRequestsList: any;
  friendsList = []

  ui = {
    title: "Friends",
    friends: {
      title: "YOUR FRIENDS"
    },
    info: {
      title: "INCOMING FRIEND REQUESTS",
      status: {
          a: "ACCEPT",
          b: "REQUEST SENT",
          c: "FRIENDS",
          num: 0
      },
    }
  }

  ngOnInit() {
     this.busy = this.mUser.getFriendsListArr(this.mUser.getFB().id).then(data => {
      this.friendsList = data;
    })
  }

  ngAfterViewInit() {
    this.introducePage();
    var me = this;
    $('#add').on('click', function (e) {me.goToConnections()})
  }


  constructor(public navCtrl: NavController, public np: NotificationProvider, public navParams: NavParams, public system: System, public mUser: MoveUser) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Friends');
    this.mUser.updateConnections();
    this.mUser.getFriendRequests(this.mUser.getFB().id);
  }

  ionViewWillLeave() {
    this.system.dismissKeyboard();
  }

  acceptFriend(id) {
    this.system.appLoader("");
    this.mUser.acceptFriend(id).then(() => {
      this.mUser.getFriendsListArr(this.mUser.getFB().id).then(data => {
        this.mUser.getFriendRequests(this.mUser.getFB().id);
        this.system.loader.dismiss();
        this.system.displayToast(`You're friends now!`, 1300);
        this.np.sendPushToUser(id, "You and " + this.mUser.getFB().name + " are now friends on Moves!");
        this.friendsList = data;
      })
    })
  }

  userOptions(id) {
    let me = this;
    let yesFunc = function() {
      me.mUser.removeFriend(id).then(() => {
        me.system.displayToast("All done.");
        me.mUser.getFriendsListArr(me.mUser.getFB().id).then(data => {
        me.friendsList = data;
        })
      })
    }
    this.system.simpleAlert("What do you want to do?", "Actions", "Remove Friend", yesFunc);
  }


  goToConnections() {
    this.navCtrl.push(ConnectionsPage);
  }

  introducePage() {
    // var introduceAdd = anime({
    //   targets: '.addBtn',
    //   opacity: [{value: 1}, {value: 0.8}],
    //   scale: [{value: 1.2}, {value: 1.0}],
    //   loop: true,
    //   duration: 2000,
    //   easing: 'easeInOutQuad',
    //   autoplay: true
    // })


  }

}
