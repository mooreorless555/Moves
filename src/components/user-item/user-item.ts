import { Component, Input, Output, EventEmitter, trigger, transition, style, animate } from '@angular/core';
import { NavController } from 'ionic-angular';
import { UserPage } from '../../pages/user/user';
import { MoveUser } from '../../providers/login-provider';
import { System } from '../../pages/functions/functions';

/**
 * Generated class for the UserItemComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */

declare var $: any;
declare var velocity: any;

@Component({
  selector: 'user-item',
  templateUrl: 'user-item.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(200, style({ opacity: 0 })),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ],
})
export class UserItemComponent {

  @Input('user') user;
  @Input('detailed') detailed;
  @Input('showMenu') showMenu;

  name: string;
  first_name: string;
  image: string;
  imageSrc: string;
  
  loaded: boolean;

  constructor(public mUser: MoveUser, public system: System, public navCtrl: NavController) {
    console.log('Hello UserItemComponent Component');
    this.name = "---"
    this.first_name = "------"
    this.image = "---";
    this.loaded = false;
  }

  ngAfterViewInit() {

    var me = this;
    var user = this.user;

    this.image = this.mUser.getPhoto(this.user.id).square;

    setTimeout(() => { // fixes ExpressionChangedAfterItHasBeenCheckedError
      if (this.detailed) {
        $('a').removeClass('nametext').addClass('nametext-smaller');
        this.first_name = this.user.name;
        this.name = "---";
        $(`#image_${user.id}`).attr("src", this.image);
        $('h3').addClass('invisible');       
      } else {
        this.name = this.user.name;
        this.first_name = this.user.name.split(" ")[0]
      }
      if (this.detailed != 99) {
        $(`#image_${user.id}`).attr("src", this.image);
        //  $(`#image_${user.id}`).attr("src", this.image);
        // anime({
        //   targets: 'ion-avatar',
        //   easing: 'easeOutBack',
        //   opacity: [{value: 0}, {value: 1}],
        //   scale: [{value: 0}, {value: 1.15}],
        //   duration: 1000,
        //   delay: function (e, i, l) { return (i*100)}
        // })
      }
    }, 0)
  }

  showUserMenu() {
    var me = this;
    var user = this.user;
    let imageUrl = this.mUser.getPhoto(user.id).prof;
    let imageHTML = '<div class="circle-avatar"><img class="image-circle" src="'+imageUrl+'"/></div>';
        let confirmFunc = function() {
            me.system.appLoader('Getting profile...');
            me.mUser.getUser(user.id).then(user => {
              me.system.loader.dismiss();
              let params = {userData: user}
              me.navCtrl.push(UserPage, params);
            })
        }

      this.system.simpleAlert(imageHTML, this.user.name, "View Profile", confirmFunc); 
  }




}
