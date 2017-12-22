import { Component, Input, trigger, transition, style, animate } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MoveUser } from '../../providers/login-provider'
import { System } from '../../pages/functions/functions'
import { UserPage } from '../../pages/user/user';
import { PreferencesProvider } from '../../providers/preferences-provider';

declare var $:any;
declare var velocity:any;

/**
 * Generated class for the CommentComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'comment',
  templateUrl: 'comment.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 , right: '30px'}),
        animate(200,  style({ right: '15px', opacity: 0 })),
        animate(500,  style({ right: '15px', opacity: 0 })),
        animate('500ms ease-out', style({ right: '0px', opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(100, style({ opacity: 1 })),
        animate(500, style({ opacity: 0 }))
      ])
    ]),
    trigger('fIOText', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 , right: '80px'}),
        animate(200,  style({ right: '0px', opacity: 0 })),
        animate('300ms ease-out', style({ right: '0px', opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(100, style({ opacity: 1 })),
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class CommentComponent {

  id: string;
  name: string;
  first_name: string;
  comment: string;
  photo: string;
  clocktime: string;
  timesince: string;
  key: string;

  timeUpdate: any;
  @Input('commentInfo') commentInfo;


  constructor(public mUser: MoveUser, public prefs: PreferencesProvider, public system: System, public navCtrl: NavController) {
    console.log('Hello CommentComponent Component');
  this.clocktime = "0:00am";
  this.timesince = "0s";
  this.photo = 'http://graph.facebook.com/1248413801916793/picture?type=square';
  this.id = "---"
  this.name = "---"
  this.first_name = "---"
  this.comment = "---"
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.id = this.commentInfo.id
      this.clocktime = this.commentInfo.clocktime
      this.timesince = this.system.getTimeSince(this.commentInfo.timeref);
      this.timeUpdate = setInterval(() => this.timesince = this.system.getTimeSince(this.commentInfo.timeref), 7000);
      this.name = this.commentInfo.name
      this.first_name = this.name.split(" ")[0]
      this.comment = this.prefs.filterSwears(this.commentInfo.comment)
      this.photo = this.mUser.getPhoto(this.id).square
      this.introduceComponent()
    }, 500);
  }

  ionViewWillLeave() {
    clearInterval(this.timeUpdate);
  }



  introduceComponent() {
    // $('ion-item[id='+this.key+']').velocity('transition.bounceIn');
  }

}
