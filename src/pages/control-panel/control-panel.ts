import { Component }                from '@angular/core';
import { System }                   from '../functions/functions';
import { NavController, NavParams } from 'ionic-angular';

import { MoveUser }                 from '../../providers/login-provider';
import { DatabaseProvider }         from '../../providers/database-provider';
import { NotificationProvider }     from '../../providers/notification-provider';

import { TabsPage }                 from '../tabs/tabs';
import { UserListPage }             from '../user-list/user-list';
import { EditStatsPage }            from '../edit-stats/edit-stats';
import { UserListButtonPage }       from '../user-list-button/user-list-button';
import firebase from 'firebase';

/**
 * Generated class for the ControlPanelPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-control-panel',
  templateUrl: 'control-panel.html',
})
export class ControlPanelPage {

  move: any;
  moveName: any;
  currentCollege: any;

  moveWatchRef: any;

  notifyModal: any;
  messagesSent: any;
  maxMessages = 5;

  owner: any;
  hosts: any;
  followers: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public system: System, public np: NotificationProvider, public mUser: MoveUser, public db: DatabaseProvider) {
    this.move = navParams.get("move");
    this.currentCollege = navParams.get("currentCollege");
    this.moveName = this.move.info.name;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ControlPanelPage');
    this._getMessagesSent().then(num => this.messagesSent = parseInt(num))

    var me = this;
  // $('#modal').iziModal({

  // });
  
    this._watchMoveStart();

  }

  ionViewWillUnload() {
    console.log("Stopping watch");
    $('#modal').iziModal('destroy');
    this._watchMoveStop();
  }

  _watchMoveStart() {
    this.moveWatchRef = firebase.database().ref(`moves/${this.currentCollege.key}/${this.move.key}`)
    this.moveWatchRef.on('value', updated => {
      this.move = updated.val();

      // Update information
      this.hosts = this.system.listOfNames(this.system.getArrayFromObjProps(this.move.info.hosts, 'name'));
      this.owner = this.move.info.owner.name;
      

    })
  }

  _watchMoveStop() {
    this.moveWatchRef.off();
  }

editStats() {
    console.log("Editing stats...");
    this.navCtrl.push(EditStatsPage, {move: this.move})
}

inviteFriends() {
    let params = {move: "",
                  objListToPopulate: this.move.info.guests,
                  list: this.mUser.getConnections(),
                  title: 'LIST',
                  subtitle: "Select who you would like to add/remove as a guest! (Guests will not be notified if you decide to remove/uninvite them).",
                  addText: "INVITE",
                  addedText: "UNINVITE",
                  updateDB: true,
                  dBPath: 'moves/'+this.currentCollege.key+'/'+this.move.key+'/info/guests'}
    // let userListModal = this.modalCtrl.create(UserListButtonPage, params);
    // userListModal.present();
    // userListModal.onWillDismiss(result => {
    //   if (!result) { // if the user uninvited everyone
    //     this.system.simpleAlert("You've uninvited everyone from this move", "No Invites?")
    //   }
    // })
    this.navCtrl.push(UserListButtonPage, params);
  }
  changeHosts() {
    let params = {move: "",
                  objListToPopulate: this.move.info.hosts,
                  list: this.mUser.getConnections(),
                  title: 'HOSTS',
                  subtitle: "Select who you would like to add/remove as a host!",
                  updateDB: true,
                  dBPath: 'moves/'+this.currentCollege.key+'/'+this.move.key+'/info/hosts'}
    this.navCtrl.push(UserListButtonPage, params);
  }

  endMove() {
    var me = this;
    let yesFunc = function() {
      me.db.remove('moves/'+me.currentCollege.key+'/'+me.move.key)
      me.navCtrl.setRoot(TabsPage);
    }

    this.system.simpleYesNo("Are you sure you want to end your move? There's no going back.", yesFunc, null, "End it.", "Not yet!", "Shutting Down?");
  }

createButton(text: string, id: any, color?: string) {
    let btnString = `<button id=${id} class='swal2-styled' style='width: 100% !important; background-color: ${color || '#886fe8'} !important; border-radius: 20px; padding: 20px; font-weight: 800em !important; font-family: 'TruLato' !important; color: #fff; font-size: 20px !important;'>${text}</button>`
    return btnString;
  }

async hostNotifyOptions() {
  let me = this;
  let choice = -1;

  let button_id = 'hostnotify';
  let buttons = "";
  buttons += this.createButton('100%+ Full', 'hostnotify_4');
  buttons += this.createButton('70-90% Full (Sweet Spot)', 'hostnotify_3');
  buttons += this.createButton('50-70% Full', 'hostnotify_2');
  buttons += this.createButton('20-50% Full', 'hostnotify_1');
  buttons += this.createButton('0-20% Full', 'hostnotify_0');

  buttons =  this.createButton('Make an Announcement', 'personal-message');
  buttons +=  this.createButton('Capacity Update Message', 'capacity-update-message');

  // $('#modal').iziModal('setContent', `<p>Example hello.</p>
  // <button>Hi there</button>`);


  let afterRenderFunc = function(){
          $('.modal-button').each(function() {
            $(this).click(e => {
              choice = parseInt($(this).attr('choice'));
              me._changeCapacity(choice);
            })
          });    
        }

  let afterRenderFunc_personal = function(){
  $('.modal-button').each(function() {
      $(this).click(e => {
      let message = $('#personal-message-input').val().trim();

      if (!message) {
        me.system.displayError("Please enter a message first.", "MESSAGE IS EMPTY");
      }

      me._getMessagesSent()
        .then(result => {
          let num = parseInt(result);
          if (num < me.maxMessages) {
            me._sendPersonalNotification(message).then(results => {
              me.messagesSent++;
              me._setMessagesSent(me.messagesSent);
              me._saveMessageSent(message);
              me.system.displayToast("Your followers have been notified.", 4000, false, "SENT", null, 'success');
            })
            .catch(e => {
              this.displayError("Something went wrong. Please try this again later.", "DID NOT SEND");
            })
          } else {
            me.system.displayToast("You've already sent your maximum number of messages to your followers.", 5000, null, "MAXIMUM MESSAGES REACHED")
          }
        })
      })
  });    
}

    let content = {
      changeCapacity: `<div class="button-selection">
    <div tappable data-izimodal-close="" choice="4" class="modal-button capacity">${this.move.info.name} is way too full and can't handle anymore people.</div> 
    <div tappable data-izimodal-close="" choice="3" class="modal-button capacity">${this.move.info.name} is fun, there's an almost perfect amount of people there.</div> 
    <div tappable data-izimodal-close="" choice="2" class="modal-button capacity">${this.move.info.name} is growing, people are starting to come now.</div> 
    <div tappable data-izimodal-close="" choice="1" class="modal-button capacity">${this.move.info.name} wants more people to come!</div>
  </div>`,
      personalizedMessage: `
      <div class="modal-box">
        <div class="modal-title">Message</div>
        <div class="modal-divider"></div>
        <div class="modal-subtitle">Update your followers about ${this.move.info.name}!</div>
        <div class="modal-divider"></div>
          <textarea id="personal-message-input" class="modal-input" type="text" maxlength="60" rows="2" placeholder="Type here"></textarea>
          <div tappable id="personal-message-submit" data-izimodal-close="" class="modal-button personal">Send (${this.maxMessages - this.messagesSent} remaining)</div>
      </div>`
    }

        swal({
          title: 'Notify',
          showConfirmButton: false,
          html: `Choose type <br><br>
            ` + buttons
        }).then(function (result) {
          swal(JSON.stringify(result))
        }).catch(swal.noop)  

        // Establish event listeners
        $('#capacity-update-message').click(function(e) {
          swal.close();
          me.notifyModal = me.system.showModal('#modal', 'Capacity Update', 'Notify your followers of the change in capacity.',
              content.changeCapacity, afterRenderFunc);
        })

        $('#personal-message').click(function(e) {
          swal.close();
          me.notifyModal = me.system.showModal('#modal', 'Make an Announcement', 'Give your followers an update.',
              content.personalizedMessage, afterRenderFunc_personal);
        })
  // this.notifyModal = this.system.showModal('#modal', 'Status Update', 'Notify your followers of the change in capacity.', content, after);
    
}

async _getMessagesSent() {
  let numMessages = await this.db.get('value', `moves/yale/${this.move.key}/messages/announcements/total`);
  if (!numMessages)
    return 0;
  else
    return numMessages;
}

async _setMessagesSent(value) {
  await this.db.insert({total: value}, `moves/yale/${this.move.key}/messages/announcements/`);
}

async _saveMessageSent(message) {
  await this.db.push({message: message, time: new Date().getTime()}, `moves/yale/${this.move.key}/messages/announcements/`);
}

async _changeCapacity(choice) {
  // TODO: Change Capacity

  // TODO: Send notification
  this._sendCapacityNotification(choice);
  this.system.displayToast("Your followers have been notified.", 4000, false, "SENT", null, 'success');
}

_sendCapacityNotification(choice) {
  let moveName = this.move.info.name;
  let message = "";

  switch (choice) {
    case 4: message = `${moveName} is way too full and can't handle anymore people.`
    break;
    case 3: message = `${moveName} is fun, there's an almost perfect amount of people there.`
    break;
    case 2: message = `${moveName} is growing, people are starting to come now.`
    break;
    case 1: message = `${moveName} wants more people to come!`
    break;
  }

  this.np.sendFollowerNotification(this.move, message, 'hostHasNotified');
}

async _sendPersonalNotification(message) {
  let moveName = this.move.info.name;
  let sentMessage = `${moveName}: ${message}`;
  return await this.np.sendFollowerNotification(this.move, sentMessage, 'hostHasNotified');
}


}

@Component({
  selector: 'ProfileButton',
  template: `<div>HEY THERE</div>`
})
class ProfOptionButton {
  
}

