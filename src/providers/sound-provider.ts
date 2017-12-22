import { Injectable } from '@angular/core';
import { NativeAudio } from '@ionic-native/native-audio';
import 'rxjs/add/operator/map';

/*
  Generated class for the SoundProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class SoundProvider {

  constructor(public na: NativeAudio) {
    console.log('Hello SoundProvider Provider');
  }

  preloadAll() {
    this.na.preloadSimple('complete', 'assets/sounds/arrive.mp3');
    this.na.preloadSimple('press_0', 'assets/sounds/btnpress_0.mp3');
    this.na.preloadSimple('press_1', 'assets/sounds/btnpress_1.mp3');
    this.na.preloadSimple('press_2', 'assets/sounds/btnpress_2.mp3');
  }

  play(fileName) {
    this.na.preloadSimple('newSound', 'assets/sounds/'+fileName).then(() => {
      this.na.play('newSound');
    })

  }

  playBtnPress() {
    var btnSound = "btnpress_";
    var num = Math.floor(Math.random() * 3);
    this.play(btnSound+num+'.mp3');
    console.log('playing ' + btnSound+num)
  }

}
