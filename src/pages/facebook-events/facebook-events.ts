import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, App } from 'ionic-angular';
import { MovesProvider } from '../../providers/moves-provider';
import { MoveUser } from '../../providers/login-provider';
import { Facebook } from '@ionic-native/facebook';
import { NativeStorage } from '@ionic-native/native-storage';
import { System, Globals } from '../../pages/functions/functions';
import firebase from 'firebase';
import { LoginPage } from '../../pages/login/login';
import { ProfilePage } from '../../pages/profile/profile';

/**
 * Generated class for the FacebookEventsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-facebook-events',
  templateUrl: 'facebook-events.html',
  providers: [ProfilePage]
})
export class FacebookEventsPage {

  eventsList = [];
  eventsListFake = [];
  guestListArr = [];
  guestObjList: any;

  move: any = new Object();

  constructor(public navCtrl: NavController, public app: App, public profPage: ProfilePage, public ns: NativeStorage, public navParams: NavParams, public viewCtrl: ViewController, public mp: MovesProvider, public mUser: MoveUser, public facebook: Facebook, public system: System, public globals: Globals) {
    this.mp.modalOn = true;

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FacebookEventsPage');
    this.getEvents();
    // var me = this;
    // var refresh = function() {
    //   me.refreshTokenPerms();
    // }
    // this.system.simpleAlert("You need to give Moves permission to access your Facebook events.", "Old Access Token", "Give permission", refresh)
  }

  closeModal() {
    this.mp.modalOn = false;
    console.log('Closing modal...');
    this.viewCtrl.dismiss();
  }

  getEvents() {
    this.facebook.api('/me?fields=events', [])
    .then(results => {
      this.eventsList = results.events.data;
    })
    .catch(e => {
        this.profPage.checkNeedsNewToken();
    })
  }

  getInvites(id) {
    let params = new Array();
    params.push('user_events');
    // return Promise.all([this.facebook.api(id + '/attending', params), this.facebook.api(id + '/maybe', params), this.facebook.api(id + '/noreply', params)])
    let def = new $.Deferred();

    this.facebook.api(id + '/attending?limit=500', []).then(attending => {
      this.addToGuestList(attending.data);
      this.facebook.api(id + '/maybe?limit=500', []).then(maybe => {
        this.addToGuestList(maybe.data);
        this.facebook.api(id + '/interested?limit=500', []).then(interested => {
          this.addToGuestList(interested.data);
          this.facebook.api(id + '/admins?limit=500', []).then(admins => {
            this.addToGuestList(admins.data);
            this.facebook.api(id + '/noreply?limit=500', []).then(noreply => {
              this.addToGuestList(noreply.data);
              this.finalizeList(this.guestListArr);
              def.resolve();
            })
          })
        })
      })
    })

    return def;
  }

  getPicture(event) {
    let params = new Array();
    params.push('user_events')
    this.facebook.api(event.id + '/picture', []).then(picture => {
      return picture.data.url;
    })
  }

  addToGuestList(array) {
    for (var item of array) {
      console.log(item);
      let id = item.id;
      let newObj = {[id]: item}
      this.guestListArr.push(newObj)
    }
  }

  finalizeList(array) {
    var finalObjList: any;
    finalObjList = Object.assign.apply(null, array);
    console.log('fOBJL: ', finalObjList);
    this.guestObjList = finalObjList;
  }

  selectEvent(event) {
    var startDate = new Date(event.start_time);

    this.move.info = {};
    this.move.info.name = event.name;
    this.move.info.extraInfo = event.description;
    this.move.info.location = event.place.name;
    this.move.info.isPending = true;
    this.move.info.pending = {};

    if (startDate.getTime() - new Date().getTime() > 24*60*60*1000) {
      this.move.info.pending.startTime = 0;
      this.move.info.pending.createdTime = new Date().getTime();
    } else {
      this.move.info.pending.startTime = startDate.getTime();
      this.move.info.pending.createdTime = new Date().getTime();
    }

    this.system.appLoader('Getting data...');
    this.getInvites(event.id).then(() => {
      this.system.loader.dismiss();
      // this.addToGuestList(guests[0].data);
      // this.addToGuestList(guests[1].data);
      // this.addToGuestList(guests[2].data);
      // console.log('DONE: ', this.finalizeList(this.guestListArr));

      this.viewCtrl.dismiss({move: this.move, guests: this.guestObjList});
      this.mp.modalOn = false;
    }).catch(e => {
      alert('Uh oh.\n'+JSON.stringify(e));
    })
}

  refreshTokenPerms() {
    var facebookCredential;
    this.ns.remove('accessToken')
    .then(() => {
      this.facebook.logout()
      .then(() => {
        this.facebook.login(this.globals.fb.perms)
        .then(response => {
          facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
          this.facebook.getAccessToken()
          .then(newToken => {
            this.ns.setItem('accessToken', newToken)
            .then(() => {
              firebase.auth().signOut()
              .then(() => {
                firebase.auth().signInWithCredential(firebase.auth.FacebookAuthProvider.credential(newToken))
                .then(() => {
                  this.system.loader.dismiss();
                  this.getEvents();
                }).catch(e => {
                  this.system.simpleAlert("Sign in error. ("+JSON.stringify(e)+")");
                  this.system.loader.dismiss();
                })
              }).catch(e => {
                this.system.simpleAlert("Sign out error. ("+JSON.stringify(e)+")");
                this.system.loader.dismiss();
              })
            }).catch(e => {
              this.system.simpleAlert("Token reset error. ("+e+")");
              this.system.loader.dismiss();
            })
          }).catch(e => {
            this.system.simpleAlert("Oh god, a Facebook login error? ("+e+")");
            this.system.loader.dismiss();
          })
        })
      })
    })
  }
}
