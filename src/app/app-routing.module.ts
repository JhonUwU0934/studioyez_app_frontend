import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './shared/pages/error404/error404.component';
import { ResetPasswordComponent } from './shared/pages/reset-password/reset-password.component';
import { authGuard } from './auth/guards/validar-auth.guard';
import { publicGuard } from './auth/guards/validar-public.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((module) => module.AuthModule),
    canActivate:[publicGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((module) => module.HomeModule),
    canMatch:[authGuard]
  },
  {
    path: '404',
    component: Error404Component,
  },
  { 
    path: 'reset-password', 
    component: ResetPasswordComponent
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
