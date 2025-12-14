import { ProductsListComponent } from './pages/products/products-list/products-list.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  { path: 'productos', loadComponent: () => import('./pages/products/products-list/products-list.component').then(m => m.ProductsListComponent) },
  { path: 'nuevo-producto', loadComponent: () => import('./pages/products/products-form/products-form.component').then(m => m.ProductsFormComponent) },
  { path: '**', redirectTo: 'productos' }
]
