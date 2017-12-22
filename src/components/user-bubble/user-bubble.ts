import { Component, Input, Output, EventEmitter, trigger, transition, style, animate } from '@angular/core';
import { MoveUser } from '../../providers/login-provider';

/**
 * Generated class for the UserBubbleComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'user-bubble',
  templateUrl: 'user-bubble.html'
})
export class UserBubbleComponent {

  @Input('user') user
  @Input('x') x
  @Input('y') y
  text: string;

  userBubbleEl: any;

  ngAfterViewInit() {
      this.userBubbleEl = $('#'+this.user.id)[0]
      this.userBubbleEl.style.position = "absolute";
    setInterval(() => {
      if (this.x && this.y) {
        this.userBubbleEl.style.left = this.x+'px';
        this.userBubbleEl.style.top = this.y+'px';
      } else {
        this.userBubbleEl.style.left = 0+'px';
        this.userBubbleEl.style.top = 0+'px';       
      }
    }, 1000)
  }

  constructor(public mUser: MoveUser) {
    console.log('Hello UserBubbleComponent Component');
    this.text = 'Hello World';
  }

}
