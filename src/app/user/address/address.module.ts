import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddressPageRoutingModule } from './address-routing.module';
import { AddressPage } from './address.page';
import { AddEditAddressComponent } from './add-edit-address/add-edit-address.component';
import { CepDirective } from '../../shared/directives/cep.directive';
import { TooltipModule } from '../../shared/modules/tooltip/tooltip.module';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    AddressPageRoutingModule,
    TooltipModule
  ],
  declarations: [
    AddressPage,
    AddEditAddressComponent,
    CepDirective
  ],
  entryComponents: [AddEditAddressComponent],
  exports: [CepDirective]
})
export class AddressPageModule { }
