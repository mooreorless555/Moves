import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommentComponent } from './comment';

@NgModule({
  declarations: [
    // CommentComponent,
  ],
  imports: [
    IonicPageModule.forChild(CommentComponent),
  ],
  exports: [
    // CommentComponent
  ]
})
export class CommentComponentModule {}
