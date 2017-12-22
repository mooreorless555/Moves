import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserListButtonPage } from './user-list-button';

@NgModule({
  declarations: [
    // UserListButtonPage,
  ],
  imports: [
    IonicPageModule.forChild(UserListButtonPage),
  ],
  exports: [
    // UserListButtonPage
  ]
})
export class UserListButtonPageModule {}
