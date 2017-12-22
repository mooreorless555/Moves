import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditStatsPage } from './edit-stats';

@NgModule({
  declarations: [
    // EditStatsPage,
  ],
  imports: [
    IonicPageModule.forChild(EditStatsPage),
  ],
  exports: [
    // EditStatsPage
  ]
})
export class EditStatsPageModule {}
