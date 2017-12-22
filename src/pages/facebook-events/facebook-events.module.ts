import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FacebookEventsPage } from './facebook-events';

@NgModule({
  declarations: [
    // FacebookEventsPage,
  ],
  imports: [
    IonicPageModule.forChild(FacebookEventsPage),
  ],
  exports: [
    // FacebookEventsPage
  ]
})
export class FacebookEventsPageModule {}
