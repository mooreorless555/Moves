import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserItemComponent } from './user-item';

@NgModule({
  declarations: [
    // UserItemComponent,
  ],
  imports: [
    IonicPageModule.forChild(UserItemComponent),
  ],
  exports: [
    // UserItemComponent
  ]
})
export class UserItemComponentModule {}
