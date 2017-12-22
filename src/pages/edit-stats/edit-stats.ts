import { Component } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import { MovesProvider } from '../../providers/moves-provider';
import { DatabaseProvider } from '../../providers/database-provider';
import { LocationTracker } from '../../providers/location-tracker';
import { System } from '../functions/functions';

/**
 * Generated class for the EditStatsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-edit-stats',
  templateUrl: 'edit-stats.html',
})
export class EditStatsPage {

  move: any;
  oldMove: any;

  ngAfterViewInit() {
    this.mp.modalOn = true;
  }

  constructor(public navCtrl: NavController, 
              public viewCtrl: ViewController, 
              public navParams: NavParams, 
              public db: DatabaseProvider, 
              public mp: MovesProvider,
              public lt: LocationTracker,
              public system: System) {
    this.move = this.navParams.get('move')
    console.log('Editing', this.move);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditStatsPage');
  }

  ionViewWillLeave() {
      // this.system.displayToast("Saved.");
      this.confirmEdits();
  }

  confirmEdits() {
    console.log('Changes: ', this.move)

    if (this.move.info.name.length < 3) {
      /* TODO: Put error. */
    } else if (this.move.info.capacity < 30) {
      /* TODO: Put error. */
    } else if (this.move.info.capacity > 600) {
      /* TODO: Put error. */
    } else {
      let updatedMove = {info: this.move.info};
      this.db.insert(updatedMove, 'moves/'+this.lt.currentCollege.key+'/'+this.move.key).then(() => {
          this.closeModal();
      })
    }

  }

  visibilityChanged(event) {
    this.move.info.visibility = parseInt(event.value);
  }


  closeModal() {
    this.mp.modalOn = false;
    console.log('Closing modal...', this.move)
    this.viewCtrl.dismiss(this.move)
  }

}
