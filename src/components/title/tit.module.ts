import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TitleComponent } from './tit';

@NgModule({
  declarations: [
    // TitleComponent,
  ],
  imports: [
    IonicPageModule.forChild(TitleComponent),
  ],
  exports: [
    // TitleComponent
  ]
})
export class TitleComponentModule {}
