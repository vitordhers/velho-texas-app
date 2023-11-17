import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BrandsPageRoutingModule } from './brands-routing.module';

import { BrandsPage } from './brands.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BrandsPageRoutingModule
  ],
  declarations: [BrandsPage]
})
export class BrandsPageModule {}
