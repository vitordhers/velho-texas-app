import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { RegisterPageRoutingModule } from './register-routing.module';
import { RegisterPage } from './register.page';

import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { CellphoneBrModule } from '../../shared/modules/cellphone-br/cellphone-br.module';
import { environment } from '../../../environments/environment';

import { CustomDatePickerAdapter } from './date-adapter';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CUSTOM_DATE_FORMATS } from './date-formats';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RegisterPageRoutingModule,
    RecaptchaModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    NativeDateModule,
    CellphoneBrModule
  ],
  declarations: [RegisterPage],
  providers: [{
    provide: RECAPTCHA_SETTINGS,
    useValue: {
      siteKey: environment.recaptcha_site_key,
    } as RecaptchaSettings,
  },
  { provide: DateAdapter, useClass: CustomDatePickerAdapter },
  { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ]
})
export class RegisterPageModule { }
