import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/guards/auth.guard';

import { UserPage } from './user.page';

const routes: Routes = [
  {
    path: '',
    component: UserPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'enderecos',
        loadChildren: () => import('./address/address.module').then(m => m.AddressPageModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'configuracoes',
        loadChildren: () => import('./config/config.module').then(m => m.ConfigPageModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'pedidos',
        loadChildren: () => import('./orders/orders.module').then(m => m.OrdersPageModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'painel',
        loadChildren: () => import('./start/start.module').then(m => m.StartPageModule),
        pathMatch: 'full',
        canActivate: [AuthGuard],
      },
      {
        path: '**',
        redirectTo: '/usuario/painel',
      }
    ]
  },
  {
    path: '',
    redirectTo: '/usuario/painel',
    pathMatch: 'full',
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserPageRoutingModule { }
