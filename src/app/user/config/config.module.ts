import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfigPageRoutingModule } from './config-routing.module';
import { ChangeEmailComponent } from './change-email/change-email.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ConfigPage } from './config.page';
import { CellphoneBrModule } from '../../shared/modules/cellphone-br/cellphone-br.module';
import { TooltipModule } from '../../shared/modules/tooltip/tooltip.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ConfigPageRoutingModule,
    CellphoneBrModule,
    TooltipModule
  ],
  declarations: [
    ConfigPage,
    ChangeEmailComponent,
    ChangePasswordComponent
  ],
  entryComponents: [
    ChangeEmailComponent,
    ChangePasswordComponent
  ]
})
export class ConfigPageModule { }
