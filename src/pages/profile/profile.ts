import { Component } from '@angular/core';
import { NavController, App, Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { NativeStorage } from '@ionic-native/native-storage';
import { LoginPage } from '../login/login';
import { ConnectionsPage } from '../connections/connections';
import { FriendsPage } from '../friends/friends';
import { UserPage } from '../user/user';
import { MakePage } from '../make/make';
import { LoginProvider, MoveUser } from '../../providers/login-provider';
import { NotificationProvider } from '../../providers/notification-provider';
import { DatabaseProvider } from '../../providers/database-provider';
import { StatsProvider } from '../../providers/stats-provider';
import { SoundProvider } from '../../providers/sound-provider';
import { System, Globals } from '../functions/functions';

/*
  Generated class for the Profile page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

declare var $          : any;
declare var velocity   : any;

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  providers: [StatsProvider, LoginProvider, System]
})
export class ProfilePage {

  ui = {
    prof: {
      color: "#5021bc"
    },
    you: {
      name: "You",
      desc: "Go to your profile page where you can change your bio, aliases and badges."
    },
    friends: {
      name: "Friends",
      desc: "See who you're friends with on Moves."
    },
    squads: {
      name: "Squads",
      desc: "Join, create and view your squads. (Coming soon!)"
    },
    logout: {
      name: "Log Out",
      desc: "Sign out and return to the login page."
    },
    quit: {
      name: "Quit",
      desc: "Exit out of Moves completely.",
      color: "#ff1c1c"
    }
  }

  user:MoveUser;
  loading = false;


  ngAfterViewInit() {
    var me = this;
    $('#profilePic').load(() => {
      me.introducePage();
    })
  }


  constructor(public app: App, public db: DatabaseProvider, public ns: NativeStorage, public facebook: Facebook, public globals: Globals, public platform: Platform, public np: NotificationProvider, public sound: SoundProvider, public navCtrl: NavController, public loginProvider: LoginProvider, public mUser: MoveUser, public system: System) {
    this.user = this.mUser;

    this.checkNeedsNewToken()
}

  async checkNeedsNewToken() {
    let userId = this.mUser.getFB().id;
    let serverUpdate = await this.db.get('value', '/serverInfo/updates/facebook');
    let yourUpdate   = await this.db.get('value', `/userData/${userId}/facebook/updated`);

    if (serverUpdate != yourUpdate) {
      this.facebook.login(this.globals.fb.perms)
      .then(response => {
        var newToken = response.authResponse.accessToken;
        this.db.insert({token: newToken, updated: serverUpdate}, `/userData/${userId}/facebook`);
        
        // Relog
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(newToken);
        var params = new Array();
        var g      = this.globals.fb;
        this.system.appLoader("");
        return Promise.all([firebase.auth().signInWithCredential(facebookCredential), this.facebook.api(g.apifields, params)])
        .then(success => {
                  this.system.loader.dismiss();
                  this.ns.setItem('accessToken', newToken);
                  this.mUser.setFB(success);
                  this.mUser.signOut()
                  .then(() => {
                    this.system.simpleAlert("OK, all set! Thank you for updating your info. You should be able to log back in now :)", "Success", "Cool");
                    this.navCtrl.setRoot(LoginPage);
                  })
        })
        .catch(() => {
          this.system.simpleAlert("Yikes. Something went wrong. Try again if you can!");
        })
      }).catch((e) => {
        // Weird errors. Just don't show LOL, it still works!
        this.mUser.signOut()
        .then(() => {
          this.navCtrl.setRoot(LoginPage);
        })
      })
    }
  }

  introducePage() {
    // $("*[id*=info]").velocity('transition.slideUpIn', { stagger: 300 })
    // var introduce = anime.timeline()

    // introduce
    // .add({
    //   targets: '.img',
    //   opacity: [{value: 0}, {value: 1}],
    //   scale: [{value: 0}, {value: 1}],
    //   easing: 'easeOutBack',
    //   offset: 0
    // })
    // .add({
    //   targets: '.name',
    //   opacity: [{value: 0}, {value: 1}],
    //   scale: [{value: 0}, {value: 1}],
    //   easing: 'easeOutBack',
    //   offset: 300
    // })
  }

  goToConnections() {
    this.navCtrl.push(ConnectionsPage);
  }

  goToFriends() {
    this.navCtrl.push(FriendsPage);
  }

  goToMake() {
    this.navCtrl.push(MakePage);
  }

  goToYou() {
    this.system.appLoader('Getting profile...');
    this.mUser.getUser(this.mUser.getFB().id).then(user => {
      this.system.loader.dismiss();
      let params = {userData: user}
      this.navCtrl.push(UserPage, params);
    })
  }
  
  logOut() {
    let me = this
    let logOut = () => {
      me.system.appLoader('Logging you out!')
      setTimeout(() => me.mUser.signOut().then(() => {
        me.app.getRootNav().setRoot(LoginPage)
          .then(() => {
            me.system.loader.dismiss()
          })
      }), 2000)
    }
    this.system.logOutBox(logOut)
  }

  quit() {
    let me = this;
    let quitFunc = () => {
      me.system.appLoader('See you soon!')
      me.platform.exitApp();
    }
    this.system.simpleYesNo("Are you sure you want to quit out of Moves completely? You will not receive anymore in-app notifications nor will you be able to check the status of your friends.", quitFunc, null, "Quit", "Cancel", "Heading out?");
  }
}


