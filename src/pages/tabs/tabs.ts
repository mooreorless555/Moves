import { Component } 	from '@angular/core';
import { NavController } from 'ionic-angular';
import { System } from '../functions/functions';
import { StatusBar } from "@ionic-native/status-bar";
import { HeaderColor } from "@ionic-native/header-color";
import { NotificationProvider } from '../../providers/notification-provider';

import { HomePage } 	from '../home/home';
import { MapPage } 		from '../map/map';
import { MakePage } 	from '../make/make';
import { BulletinPage } from '../bulletin/bulletin';
import { ProfilePage } 	from '../profile/profile';
import { SoundProvider } from '../../providers/sound-provider';
import { MoveUser } from '../../providers/login-provider';

@Component({
  templateUrl: 'tabs.html',
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = HomePage;
  tab2Root: any = BulletinPage;
  tab3Root: any = MakePage;
  tab4Root: any = ProfilePage;

  currentColor: string = "navbar2";

  user: any;

  constructor(public navCtrl: NavController, public np: NotificationProvider, private statusBar: StatusBar, private headerColor: HeaderColor, private system: System, private mUser: MoveUser, public sound: SoundProvider) {
    this.user = this.mUser.getFB();
    this.np.getNotificationBadges();
  }

  changeStatusBarColor(newColor: string) {
    // this.statusBar.backgroundColorByHexString(newColor);
    // this.headerColor.tint(newColor);;
  }
  
  goToMake() {
    // this.sound.play('btnpress_0.mp3')
    console.log('Make!');
    try {
    this.navCtrl.push(MakePage);
    } catch (e) {
      alert(e)
    }
  }

  goToProfile() {
    // this.sound.play('btnpress_0.mp3')
    console.log('Profile!');
    this.navCtrl.push(ProfilePage);
  }

  goToMap() {
    // this.sound.play('btnpress_0.mp3')
    console.log('Map!')
    this.navCtrl.push(MapPage);
  }
}
