import { Component } from '@angular/core';
import { App, NavController, NavParams, ModalController } from 'ionic-angular';
import { LinkModalPage } from '../link-modal/link-modal';
import { PreferencesProvider } from '../../providers/preferences-provider';
import { System, Globals } from '../functions/functions';
import {Deploy} from '@ionic/cloud-angular';
import { MoveUser } from '../../providers/login-provider';
import { NotificationProvider } from '../../providers/notification-provider';
import { Badges } from '../../providers/profile-provider';
import { ServerStatusProvider } from '../../providers/server-status-provider';
import { LoginPage } from '../../pages/login/login';


/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  privacyPolicyUrl = 'https://cdn.rawgit.com/mooreorless555/mooreorless555.github.io/6cfad8d7/privacy_policy_v2.html';
  oneSignal_appID = '73988abc-df1b-455e-b71c-03e817ba9c9a';
  changeChannel = false;

  uniqueDailyLogins: any;

  constructor(public navCtrl: NavController, public ss: ServerStatusProvider, public app: App, public badges: Badges, public np: NotificationProvider, public mUser: MoveUser, public modalCtrl: ModalController, public deploy: Deploy, public system: System, public globals: Globals, public prefs: PreferencesProvider, public navParams: NavParams) {
    // this.prefs.load();
    this.uniqueDailyLogins = Object.keys(this.ss.serverStats.uniqueDailyLogins).length - 1;
  }

  about() {
    let g = this.globals;
    this.system.simpleAlert("Here's some basic information about Moves.<br><br>Developed by <b>Chris Moore</b> (Yale '19)<br><br><b>Version<br>"+g.version+"<br><br>Contact<br>christopher.v.moore@yale.edu<br>movesbot@gmail.com", "Info", "OK", null, false)
  }

  isAdmin(){
    return this.system.isAdmin(this.mUser.getFB().id)
  }

  privacyPolicy() {
    let privacyPolicyModal = this.modalCtrl.create(LinkModalPage, {url: this.privacyPolicyUrl});
    privacyPolicyModal.present();
  }

  async sendWorldPush() {
    var message = await this.system.simpleInput("Everyone on Moves will receive this.", "Send To All Users", "World Push Message", "message")
    this.np.sendPushToNearby(message)
  }

  async grantAlias() {
    var name = await this.system.simpleInput("Type in the exact name of the user you wish to grant an alias to.", "Continue", "", "Gray Newfield")
    this.system.appLoader(`Searching records for ${name}`);
    var user = await this.mUser.getUserByName(name);
    this.system.loader.dismiss();

    if (!user) { // if user doesn't exist
      this.system.simpleAlert("Could not find any records on this user.");
    } else {
      console.log(user.name);
      var userName = user.name;
      var alias = await this.system.simpleInput("What is the alias you'd like to give " + userName + "?", "Grant", "Add Alias", "", "Aepi");
      if (!alias) {
        this.system.simpleAlert("You never typed in an alias.");
      } else {
        this.system.appLoader("Granting alias to " + userName + "...");
        await this.mUser.addAlias(user.id, alias);
        this.system.loader.dismiss();
        this.system.simpleAlert(userName + " now has the alias: " + alias + "!", "Success!");
        this.np.sendPushToUser(user.id, "You can now host moves as: " + alias + "!");
      }
    }
  }

  async grantBadge() {
    var name = await this.system.simpleInput("Type in the exact name of the user you wish to grant a badge to.", "Continue", "", "Owais Khan")
    this.system.appLoader(`Searching records for ${name}`);
    var user = await this.mUser.getUserByName(name);
    this.system.loader.dismiss();

     if (!user) { // if user doesn't exist
      this.system.simpleAlert("Could not find any records on this user.");
    } else {
      console.log(user.name);
      var userName = user.name;
      var badgeId = await this.system.simpleInput("What is the ID of the badge you'd like to give " + userName + "?", "Grant", "Add Badge", "", "720");
      if (!badgeId) {
        this.system.simpleAlert("You never typed in an a badge ID.");
      } else {
        this.system.appLoader(`Granting badge to ${userName}...`);
        await this.mUser.addBadge(user.id, badgeId);
        this.system.loader.dismiss();
        let badge = this.badges.get(720);
        this.system.simpleAlert(`${userName} now has the '${badge.name}' badge!"`,  "Success!");
        this.np.sendPushToUser(user.id, `You can now host moves using the '${badge.name}' badge.`);
      }
    }
  }

  async getUserInfo() {
    let name = await this.system.easyInput("Type in the exact name of the user's information you wish to view", "Get Data", "", "Owais Khan");
    this.system.appLoader(`Searching records for ${name}`);
    var user = await this.mUser.getUserByName(name);
    this.system.loader.dismiss();    
    if (!user) { // if user doesn't exist
          this.system.simpleAlert("Could not find any records on this user.");
        } else {
          this.system.simpleAlert(`${JSON.stringify(user)}`, `${user.name}`, "Done", null, false);
        }
  }

  async getPushData() {
    var data;

    var player_id = this.system.easyInput("Enter the PLAYER_ID here.");

    var headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Basic NWM0YjA3MWQtMTNmNi00MDMyLWI1MzMtZjBkNmYxNmUxZTg0"
    };
    
    var options = {
      host: "onesignal.com",
      port: 443,
      path: `/api/v1/players/${player_id}?app_id=${this.oneSignal_appID}`,
      method: "GET",
      headers: headers
    };
    
    var https = require('https');
    var req = https.request(options, function(res) {  
      alert("Getting data...");
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

  async showLoader() {
    this.system.appLoader("Showing loader for 10 seconds.")
    setTimeout(() => this.system.loader.dismiss(), 10000);
  }

  async sendTagNotification() {
    let tagKey = await this.system.easyInput("Type the tag key here.");
    this.system.appLoader("Sending message to those with the tag.");
    this.np.sendTagNotification(tagKey, "exists", "bar", `You have a tag ${tagKey}.`);
    this.system.loader.dismiss();
  }

  async giveTag() {
    let tagKey = await this.system.easyInput("Type the tag key that you want here.");
    let tagVal = await this.system.easyInput(`Now type the tag value that you want for "${tagKey}".`);
    this.np.addTag(tagKey, tagVal);
    this.system.simpleAlert(`You now have tag with key: ${tagKey} and value ${tagVal}`);
  }

  async giveOtherUserTag() {
    let user = await this.getUser();
    this.system.simpleAlert(`Actually, ${user.name} can't receive a tag right now. (This feature doesn't work yet.)`);
  }

  async getUser() {
    let name = await this.system.easyInput("Type in the name of the user here.");
    let user = await this.mUser.getUserByName(name);

    if (!user) {
      this.system.simpleAlert("Couldn't find a user that exists with these records.");
      return null;
    } else {
      return user;
    }
  }

  async showTags() {
    let type = await this.system.easyInput("What type of tags? (i.e. 'moves')");
    if (type == "none") type = "";
    let tags = await this.np.getTags(type);
    this.system.simpleAlert(JSON.stringify(tags), "Your Tags");
  }

  async removeAllTags() {
    let tags = await this.np.getTags();

    if (Object.keys(tags).length <= 0) {
      this.system.displayToast("You don't have any tags to remove.");
      return;
    }

    this.system.displayToast("All tags have been successfully removed.")
    for (let key in tags) this.np.removeTag(key);
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



  ionViewCanLeave() {
    this.prefs.save();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  checkForUpdates() {
    this.system.appLoader('Checking for updates...');
    this.deploy.channel = "dev";
    this.deploy.check().then((snapshotAvailable: boolean) => {
      this.system.loader.dismiss();
      if (snapshotAvailable) {
        this.system.appLoader('Developer update found! Downloading...');
        this.deploy.download().then(() => {
          this.system.loader.dismiss();
          this.system.appLoader("Installing...let's gooo~");
          this.deploy.extract().then(() => {
            this.system.loader.dismiss();
            this.deploy.load();
          })
        });
      } else {
        this.system.simpleAlert("No updates currently.");
      }
    }).catch(e => {
      this.system.loader.dismiss();
      this.system.simpleAlert(e, "Error")
    });

    this.deploy.channel = "production";
  }

  changeDeployChannel() {
    if (this.changeChannel) {
      this.deploy.channel = "development";
      this.system.displayToast("Development for debugging.");
    } else {
      this.deploy.channel = "production";
      this.system.displayToast("Production")
    }
  }

}
