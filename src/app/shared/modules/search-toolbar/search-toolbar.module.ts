import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { SearchToolbarPage } from './searchtoolbar.page';
import { CartContentModule } from '../../components/cart-content/cart-content.module';
import { ScrollbarThemeModule } from './scrollbar-theme.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatMenuModule,
        RouterModule,
        CartContentModule,
        ScrollbarThemeModule
    ],
    declarations: [SearchToolbarPage],
    exports: [
        SearchToolbarPage
    ]
})
export class SearchToolbarModule { }
