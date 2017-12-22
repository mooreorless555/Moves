/*
import { Component, ElementRef, ViewChildren } from '@angular/core';
// import { RoundProgressModule } from 'angular-svg-round-progressbar';

import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

import { StatsPage } from '../stats/stats';

import { MovesService } from '../services/MovesService';

declare var ProgressBar: any;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [MovesService]
})

// @NgModule({
//   imports: [RoundProgressModule]
// })

export class HomePage {

 @ViewChildren('container') container: any;
  moves: Array<any>;
  stuff: any;
  conty: any;


  ngAfterViewInit() {
    this.listMoves();
  }

  constructor(public navCtrl: NavController, public toastCtrl: ToastController, public elementRef: ElementRef, private movesService: MovesService) {

  // this.stuff = this.container + "stuff";
  }

  presentToast() {
    let toast = this.toastCtrl.create({
      message: 'User was added successfully',
      duration: 3000
    });
    toast.present();
  }

  refreshMoves(refresher) {
        setTimeout(() => {
      console.log('Async operation has ended');
        this.listMoves();
        refresher.complete();
    }, 1000);

  }

  listMoves() {
    this.movesService.getMoves().subscribe(
      data => {
        this.moves = data;
        console.log(this.moves);
      },
      err => {
        console.log(err);
      },
      () => console.log('Got Moves')
    );
    

  this.createProgBars(this.container.toArray());   
  }

  deleteMove(move) {
    this.movesService.deleteMove(move).subscribe(
      err => {
        console.log(err);
      }
    )
    this.listMoves();
  }

  checkStats(move) {
    this.navCtrl.push(StatsPage, { 
      firstPassed: move}
      );
  }
  

  createProgBars(moves) {
    for (var i = 0; i < moves.length; i++) {
      var progbar = new ProgressBar.SemiCircle(moves[i].nativeElement, {
        strokeWidth: 18,
        easing: 'easeInOut',
        duration: 1400,
        color: '#9932CC',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: null,

        text: {
          value: '',
          alignToBottom: false
        },

        from: {color: '#9932CC'},
        to: {color: '#FFFFFF'},

      // Set default step function for all animate calls
        step: (state, bar) => {
          bar.path.setAttribute('stroke', state.color);
        }
        });
      progbar.animate(1-(i*0.27));
    }
  }

}
*/