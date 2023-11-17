import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RedefinepasswordPage } from './redefinepassword.page';

const routes: Routes = [
  {
    path: '',
    component: RedefinepasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RedefinepasswordPageRoutingModule {}
