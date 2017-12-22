import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { MovesProvider } from '../../providers/moves-provider';

/**
 * Generated class for the LinkModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-link-modal',
  templateUrl: 'link-modal.html',
})
export class LinkModalPage {

  url: string;

  ngAfterViewInit() {
    this.mp.modalOn = true;
    this.url = this.navParams.get('url');
    $("#frame").attr("src", this.url);
  }

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams, public mp: MovesProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LinkModalPage');
  }

  closeModal() {
    this.mp.modalOn = false;
    console.log('Closing modal...')
    this.viewCtrl.dismiss()
  }

}
