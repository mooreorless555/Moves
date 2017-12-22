import { Component, Input} from '@angular/core';

declare var $: any;
declare var velocity: any;

/**
 * Generated class for the LargeButtonComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'large-button',
  templateUrl: 'large-button.html'
})
export class LargeButtonComponent {

  @Input('id') id
  @Input('title') title
  @Input('desc') desc
  @Input('disabled') disabled
  @Input('icon') icon_name
  @Input('color') color


  constructor() {
    console.log('Hello LargeButtonComponent Component');
    if (!this.color) {
      this.color = '#886fe8';
    } 

}

  ngAfterViewInit() {
    this.introduceComponent()
  }

  introduceComponent() {
    // setTimeout(() => {
    // $('#'+this.id).find('#'+this.id+"_btn").css({'background-color':this.color});
    // $('#'+this.id).find("#title").removeClass('invisible').velocity('transition.slideRightIn', { stagger: 500})
    // setTimeout(() => $('#'+this.id).find("#desc").removeClass('invisible').velocity('transition.slideRightIn', { stagger: 500 }), 200);
    // setTimeout(() => $('#'+this.id).find("#icon-side").removeClass('invisible').velocity('transition.bounceIn', { duration: 1000 }), 400);
    // }, 800)
    // var intro = anime.timeline()
    // intro
    // .add({
    //   targets: '#largeBtn',
    //   opacity: [{value: 0}, {value: 1}],
    //   translateY: [{value: 800}, {value: 0}],
    //   duration: 400,
    //   easing: 'easeOutBack',
    //   delay: function(el, i, l) { return (i * 100); },
    //   offset: 0
    // })
    // .add({
    //   targets: '#title',
    //   scale: [{value: 1}, {value: 1}],
    //   duration: 1000,
    //   easing: 'easeOutQuad',
    //   delay: function(el, i, l) { return (i * 100)+500; },
    //   offset: 200
    // })

  if (this.disabled) {
    anime({
      targets: '#'+this.id,
      opacity: [{value: 1}, {value: 0.4}],
      duration: 1  
    })
  }
        
  }
}
