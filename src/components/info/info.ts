import { Component, Input } from '@angular/core';

/**
 * Generated class for the InfoComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'info',
  templateUrl: 'info.html'
})
export class InfoComponent {

  @Input('text') text: string;

  constructor() {
    console.log('Hello InfoComponent Component');
  }

}