import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordsInputPage } from './passwords-input.page';
import { IonicModule } from '@ionic/angular';

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        ReactiveFormsModule
    ],
    declarations: [PasswordsInputPage],
    exports: [PasswordsInputPage]
})

export class PasswordsInputModule { }
