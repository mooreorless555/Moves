import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { LinkModalPage } from '../link-modal/link-modal';
import { MoveUser } from '../../providers/login-provider';
import { System } from '../functions/functions';
import { Aliases, Badges } from '../../providers/profile-provider';
import { Tutorial } from '../../providers/notification-provider';

/**
 * Generated class for the UserPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})
export class UserPage {

  user: any;
  aliasNameArray: any;
  aliasNames: string;
  currentBadgeImage: string;
  profilePic: string;
  userBio: string;
  friendStatus: any;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public mUser: MoveUser, public tutorial: Tutorial, public system: System, public aliases: Aliases, public badges: Badges, public navParams: NavParams) {
    this.user = navParams.get('userData')
    console.log('USER DATA RETREIVED', this.user)
    if (!this.user) this.system.simpleAlert("There's something wrong with this profile. RIP", "Error");

    let currentBadgeId = this.user.currentBadge;
    this.currentBadgeImage = this.badges.get(currentBadgeId).image;
    // this.mUser.getProfileData(this.user.id).then(profileData => {
    //   console.log('Profile data get: ', profileData)
    //   this.userBio = profileData.bio;
    // })
    this.profilePic = this.user.info.picture.prof;
    this.userBio = this.user.profile.bio;

    console.log('YOU AS AN FB USER: ', this.mUser.getFB())

    if (this.isOwner()) this.tutorial.you();
  }

  isOwner() {
    let viewingUser = this.mUser.getFB()
    return viewingUser.id == this.user.id
  }

  goToFacebookPage() {
    let pageUrl = 'https://www.facebook.com/'+this.user.id;

    let facebookModal = this.modalCtrl.create(LinkModalPage, {url: pageUrl})
    facebookModal.present();
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad UserPage');
    let user = this.user;
    let me = this;

    // Animate in the elements
    this.introducePage();

    let aliases = user.aliases;
    this.aliasNameArray = this.system.getArrayFromObjProps(aliases, 'name');
    this.aliasNames = this.system.listOfNames(this.aliasNameArray);

    this.mUser.getFriendsStatus(this.mUser.getFB().id, user.id).then(status => {
      console.log('Friends Status: ', status)
      this.friendStatus = status;
    })

    if (this.isOwner()) {
        $('span#user-bio').editable({type : "textarea", action : "click"}, function(e){
            me.userBio = e.value;
            me.saveProfile()
        });
    }
  }

  manageAliases() {
    if (this.isOwner()) this.aliases.manage()
  }

  saveProfile() {
    this.mUser.setProfileData({bio: this.userBio}, this.user.id)
    .then(success => {
      this.system.displayToast('Profile saved successfully!', 1000);
    })
  }

  manageBadges() {
    if (this.isOwner())
      this.badges.manage().then(newBadge => {
        $('.profile-badge').find('img').attr('src', newBadge.image);
      })
  }

  addFriend() {
    this.system.simpleAlert('Friend request sent!');
    this.mUser.sendFriendRequest(this.user.id, {id: this.user.id, name: this.user.name})
    .then(success => {
      this.mUser.getFriendsStatus(this.mUser.getFB().id, this.user.id).then(result => {
        this.friendStatus = result;
      })
    })
  }

  reportUser() {  
    let user = this.mUser.getFB()
    let reportReason;
    this.system.simpleInput("What is your reason for reporting " + this.user.name + "?", "Send Report", "Report User", "Reason").then(answer => {
      reportReason = answer;
      let reportObj = {
        reporter: {
          id: user.id,
          name: user.name
        },
        culprit: {
          id: this.user.id,
          name: this.user.name,
          email: this.user.email
        },
        reason: reportReason
      }
      if (reportReason.trim() != "") {
        this.system.report('user', reportObj);
      } else {
        this.system.simpleAlert("You need to give a reason for reporting this user.");
      }
    })
  }

  introducePage() {
    var basicTimeline = anime.timeline();

    basicTimeline
      .add({
        targets: '.profile-background',
        opacity: 1,
        duration: 800,
        easing: 'easeOutQuart',
        offset: '0'
    })
      .add({
        targets: '.profile-solid',
        height: '120%',
        duration: 4000,
        easing: 'easeOutQuart',
        offset: '400'
    })
      .add({
        targets: '.out-of-sight',
        opacity: 1,
        duration: 800,
        easing: 'easeOutQuart',
        offset: '1000'
    })
      .add({
        targets: '.user-title',
        right: '0px',
        duration: 800,
        easing: 'easeOutQuart',
        direction: 'reverse',
        offset: '1000'
    })
      .add({
        targets: '.profile-tint',
        width: '100%',
        duration: 1000,
        easing: 'easeOutQuart',
        offset: '1200'
    })
      .add({
        targets: '.profile-badge',
        left: '65%',
        opacity: 1,
        duration: 1000,
        easing: 'easeOutQuart',
        offset: '1600'
    })  
      .add({
        targets: '.profile-module',
        opacity: 1,
        duration: 800,
        easing: 'easeOutQuart',
        offset: '1800'
    })
  }

}
