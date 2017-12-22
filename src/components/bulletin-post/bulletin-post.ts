import { ViewChild, Input, Component } from '@angular/core';
import { ItemSliding } from 'ionic-angular';
import { MoveUser } from '../../providers/login-provider';
import { BulletinPage } from '../../pages/bulletin/bulletin';
import { System } from '../../pages/functions/functions';
import firebase from 'firebase';

/**
 * Generated class for the BulletinPostComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'bulletin-post',
  templateUrl: 'bulletin-post.html'
})


export class BulletinPostComponent {
  
  @Input('post') post: any;
  @ViewChild('item') item;

  countDownTime: string = "";
  coolDown = false;
  plusOneCount : any = "";
  plusOned: any = false;
  poRef: any;
  poVal: any;

  constructor(private mUser: MoveUser, private bpage: BulletinPage, private system: System) {
    console.log('Hello BulletinPostComponent Component');
  }

  wait(time) {
    this.coolDown = true;
    // setTimeout(() => this.coolDown = false, time);
  }

  ionViewWillLeave() {
    this.poRef.off();
  }

  ngAfterViewInit() {
    // anime({
    //   targets: '.b-post',
    //   easing: 'easeOutBack',
    //   opacity: [{value: 0}, {value: 1}],
    //   scale: [{value: 0}, {value: 1}],
    //   duration: 1000,
    //   delay: function (e, i, l) { return (i*100)}
    // })
    
    this.poRef = firebase.database().ref('/bulletin/posts/'+this.post.key+'/po/');
    
    setTimeout(() => {
    this.poRef.on('value', snap => {
      this.plusOneCount = Object.keys(snap.val() || 0).length;

      this.poVal = [];
      this.plusOned = false;
      if (this.plusOneCount > 0)
        for (let id in snap.val()) {
          this.poVal.push(snap.val()[id]);
          if (id == this.mUser.getFB().id) this.plusOned = true;
        }


      console.log(this.plusOneCount);
      
      if (this.plusOneCount == 0) {
        this.plusOneCount = "";
      }
      else if (this.plusOneCount > 0) {
        this.plusOneCount = "+" + this.plusOneCount;
      }


      if (!snap.val()) this.plusOneCount = "";
    })

      this.countDownTime = this.system.getTimeUntil(this.post.startTime);
      if (this.countDownTime != "right now") this.countDownTime = "in " + this.countDownTime;
      if (new Date().getTime() - this.post.endTime >= 0) {
        this.countDownTime = "...this already happened...";
      }
      if (new Date().getTime() - this.post.endTime >= 5*60*1000) {
        this.bpage.deleteBulletin(this.post.key);
      }
    }, 800);

  }

  ondrag(item: ItemSliding) {
    let percent = item.getSlidingPercent();
    if (percent > 0) {
      // positive
      console.log('right side ', percent);
    } else {
      // negative
      console.log('left side');
    }
    if (Math.abs(percent) > 1) {
      console.log('overscroll');
  }
}

plusOne() {
  this.bpage.addNum(this.post.key);
  this.item.close();

  if (!this.coolDown) {
    let user = this.mUser.getFB();
    this.bpage.notifyFriend(this.post.id, user.name + " +1'd your post!");
  }
  this.wait(20000);
}

removeOne() {
  this.bpage.removeNum(this.post.key);
  this.item.close();
}

}
