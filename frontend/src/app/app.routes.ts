import { Routes } from '@angular/router';
import { UserProfile } from './components/user-profile/user-profile';
import { Help } from './components/help/help';
import { CreateProduct } from './components/create-product/create-product';
import { Home } from './components/home/home';
import { EditProduct } from './components/edit-product/edit-product';
import { DeleteProduct } from './components/delete-product/delete-product';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'profile', component: UserProfile },
  { path: 'help', component: Help },
  { path: 'admin/crear-producto', component: CreateProduct },
  { path: 'admin/modificar-producto', component: EditProduct },
  { path: 'admin/eliminar-producto', component: DeleteProduct }
];

