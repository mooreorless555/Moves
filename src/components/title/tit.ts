import { Component, Input } from '@angular/core';

/**
 * Generated class for the TitleComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'tit',
  templateUrl: 'tit.html'
})
export class TitleComponent {

  @Input('title') sTitle: any;
  @Input('subtitle') sSubtitle: any;

  title: any;
  subtitle: any;

  showTitle: boolean = false;

  constructor() {
    console.log('Hello TitleComponent Component');
  }

  ngOnInit() {
    this.showTitle = false;
  }

  ngAfterViewInit() {
    setTimeout(() => {
    this.title = this.sTitle;
    this.subtitle = this.sSubtitle;
    this.showTitle = true;
    }, 100);
    // var intro = anime.timeline()

    // intro
    // .add({
    //   targets: '.title-text',
    //   opacity: [{value: 0}, {value: 1}],
    //   rotateX: [{value: 180}, {value: 0}],
    //   duration: 2000,
    //   offset: 0
    // })
    // .add({
    //   targets: '.subtitle-text',
    //   opacity: [{value: 0}, {value: 1}],
    //   rotateX: [{value: -180}, {value: 0}],
    //   duration: 2000,
    //   offset: 300
    // })
  }

}
