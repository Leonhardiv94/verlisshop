import { Component, OnInit, OnDestroy } from '@angular/core';
import { Auth } from '../../services/auth';
import { Subscription } from 'rxjs';

interface Subcategory {
  name: string;
  link: string;
}

interface Category {
  name: string;
  isOpen: boolean;
  subcategories: Subcategory[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  categories: Category[] = [
    {
      name: 'Zapatos para Dama',
      isOpen: false,
      subcategories: [
        { name: 'Planas', link: '/productos/dama/planas' },
        { name: 'Tres puntas', link: '/productos/dama/tres-puntas' },
        { name: 'Planas con taloneras', link: '/productos/dama/planas-taloneras' },
        { name: 'Plataforma', link: '/productos/dama/plataforma' },
        { name: 'Zapato elegante de tacón', link: '/productos/dama/elegante-tacon' },
        { name: 'Canoas', link: '/productos/dama/canoas' },
        { name: 'Botas', link: '/productos/dama/botas' },
        { name: 'Deportivas', link: '/productos/dama/deportivas' },
        { name: 'Casual bajito', link: '/productos/dama/casual-bajito' }
      ]
    },
    {
      name: 'Zapatos para Caballeros',
      isOpen: false,
      subcategories: [
        { name: 'Zapato deportivo', link: '/productos/caballeros/deportivo' },
        { name: 'Zapato casual', link: '/productos/caballeros/casual' },
        { name: 'Canoas', link: '/productos/caballeros/canoas' }
      ]
    },
    {
      name: 'Zapatos para Niños',
      isOpen: false,
      subcategories: [
        { name: 'Deportivos', link: '/productos/ninos/deportivos' },
        { name: 'Para toda ocasión', link: '/productos/ninos/toda-ocasion' }
      ]
    },
    {
      name: 'Bolsos y Carteras',
      isOpen: false,
      subcategories: [
        { name: 'Mochilas deportivas', link: '/productos/bolsos/mochilas-deportivas' },
        { name: 'Bolsos de salir', link: '/productos/bolsos/bolsos-salir' },
        { name: 'Bolsos deportivos', link: '/productos/bolsos/bolsos-deportivos' }
      ]
    }
  ];

  activeLink: string = '';
  currentUser: any = null;
  isAdminMenuOpen = false;
  private authSub: Subscription = new Subscription();

  adminOptions = [
    { name: 'Historial de ventas', link: '/admin/historial-ventas' },
    { name: 'Crear usuario', link: '/admin/crear-usuario' },
    { name: 'Modificar usuario', link: '/admin/modificar-usuario' },
    { name: 'Eliminar usuario', link: '/admin/eliminar-usuario' },
    { name: 'Crear producto', link: '/admin/crear-producto' },
    { name: 'Modificar producto', link: '/admin/modificar-producto' },
    { name: 'Eliminar producto', link: '/admin/eliminar-producto' }
  ];

  constructor(private authService: Auth) {}

  ngOnInit() {
    this.authSub.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

  toggleAdminMenu() {
    this.categories.forEach(c => c.isOpen = false);
    this.isAdminMenuOpen = !this.isAdminMenuOpen;
  }

  toggleCategory(category: Category) {
    this.isAdminMenuOpen = false;
    const wasOpen = category.isOpen;
    this.categories.forEach(c => c.isOpen = false);
    category.isOpen = !wasOpen;
  }

  setActiveLink(link: string) {
    this.activeLink = link;
  }
}
