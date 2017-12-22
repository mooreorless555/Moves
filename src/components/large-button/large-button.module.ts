import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LargeButtonComponent } from './large-button';

@NgModule({
  declarations: [
    // LargeButtonComponent,
  ],
  imports: [
    IonicPageModule.forChild(LargeButtonComponent),
  ],
  exports: [
    // LargeButtonComponent
  ]
})
export class LargeButtonComponentModule {}
