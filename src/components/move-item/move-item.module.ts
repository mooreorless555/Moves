import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MoveItemComponent } from './move-item';

@NgModule({
  declarations: [
    // MoveItemComponent,
  ],
  imports: [
    IonicPageModule.forChild(MoveItemComponent),
  ],
  exports: [
    // MoveItemComponent
  ]
})
export class MoveItemComponentModule {}
