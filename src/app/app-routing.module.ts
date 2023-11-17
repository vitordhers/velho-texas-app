import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { NonAuthGuard } from './auth/guards/non-auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    pathMatch: 'full'
  },
  {
    path: 'registrar',
    loadChildren: () => import('./user/register/register.module').then(m => m.RegisterPageModule),
    canActivate: [NonAuthGuard]
  },
  {
    path: 'entrar',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthPageModule),
    canActivate: [NonAuthGuard]
  },
  {
    path: 'produtos',
    loadChildren: () => import('./products/products.module').then(m => m.ProductsPageModule)
  },
  {
    path: 'usuario',
    loadChildren: () => import('./user/user.module').then(m => m.UserPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'carrinho',
    loadChildren: () => import('./cart/cart.module').then(m => m.CartPageModule)
  },
  {
    path: 'confirmar',
    loadChildren: () => import('./confirm/confirm.module').then(m => m.ConfirmPageModule)
  },
  {
    path: 'pedido',
    loadChildren: () => import('./user/orders/order/order.module').then(m => m.OrderPageModule),
    canActivate: [NonAuthGuard]
  },
  {
    path: 'redefinirsenha',
    loadChildren: () => import('./redefinepassword/redefinepassword.module').then(m => m.RedefinepasswordPageModule),
    canActivate: [NonAuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
