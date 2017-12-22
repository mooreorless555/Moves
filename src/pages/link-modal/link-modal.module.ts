import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LinkModalPage } from './link-modal';

@NgModule({
  declarations: [
    // LinkModalPage,
  ],
  imports: [
    IonicPageModule.forChild(LinkModalPage),
  ],
  exports: [
    // LinkModalPage
  ]
})
export class LinkModalPageModule {}
