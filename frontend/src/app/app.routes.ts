import { Routes } from '@angular/router';
import { UserProfile } from './components/user-profile/user-profile';
import { Help } from './components/help/help';
import { CreateProduct } from './components/create-product/create-product';
import { Home } from './components/home/home';
import { EditProduct } from './components/edit-product/edit-product';
import { DeleteProduct } from './components/delete-product/delete-product';
import { ProductDetail } from './components/product-detail/product-detail';
import { Checkout } from './components/checkout/checkout';
import { MyOrders } from './components/my-orders/my-orders';
import { SalesHistory } from './components/sales-history/sales-history';
import { AdminUsers } from './components/admin-users/admin-users';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'profile', component: UserProfile },
  { path: 'help', component: Help },
  { path: 'producto/:id', component: ProductDetail },
  { path: 'checkout', component: Checkout },
  { path: 'mis-compras', component: MyOrders },
  { path: 'admin/crear-producto', component: CreateProduct },
  { path: 'admin/modificar-producto', component: EditProduct },
  { path: 'admin/eliminar-producto', component: DeleteProduct },
  { path: 'admin/historial-ventas', component: SalesHistory },
  { path: 'admin/gestion-usuarios', component: AdminUsers }
];

