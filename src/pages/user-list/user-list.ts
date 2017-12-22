import { Component } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import { MovesProvider } from '../../providers/moves-provider';

/**
 * Generated class for the UserListPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

declare var $: any;
declare var velocity: any;

@IonicPage()
@Component({
  selector: 'page-user-list',
  templateUrl: 'user-list.html'
})
export class UserListPage {
  ui = {
    title: '---',
    subtitle: '------'
  }
  list: any;
  move: any;

  ngAfterViewInit() {
    this.mp.modalOn = true;
    this.introduceModal()
  }

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams, public mp: MovesProvider) {
    console.log('WE GOT: ', navParams.get('list'))
    this.list = navParams.get('list')
    this.ui.title = navParams.get('title')
    this.ui.subtitle = navParams.get('subtitle')
    this.move = navParams.get('move')

    if (this.list.length == 0) {
      this.ui.subtitle = 'No new friends :('
    }
}

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserListPage');
  }

  closeModal() {
    this.mp.modalOn = false;
    console.log('Closing modal...')
    this.viewCtrl.dismiss()
  }

  introduceModal() {
    $("*[id*=title]").velocity('transition.slideUpIn')
    $("*[id*=userItem]").velocity('transition.slideUpIn')
  }

}
