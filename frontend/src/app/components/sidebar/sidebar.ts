import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Subscription } from 'rxjs';

interface Subcategory {
  name: string;
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
        { name: 'Planas' }, { name: 'Tres puntas' }, { name: 'Planas con taloneras' },
        { name: 'Plataforma' }, { name: 'Zapato elegante de tacón' }, { name: 'Canoas' },
        { name: 'Botas' }, { name: 'Deportivas' }, { name: 'Casual bajito' }
      ]
    },
    {
      name: 'Zapatos para Caballeros',
      isOpen: false,
      subcategories: [
        { name: 'Zapato deportivo' }, { name: 'Zapato casual' }, { name: 'Canoas' }
      ]
    },
    {
      name: 'Zapatos para Niños',
      isOpen: false,
      subcategories: [
        { name: 'Deportivos' }, { name: 'Para toda ocasión' }
      ]
    },
    {
      name: 'Bolsos y Carteras',
      isOpen: false,
      subcategories: [
        { name: 'Mochilas deportivas' }, { name: 'Bolsos de salir' }, { name: 'Bolsos deportivos' }
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

  constructor(private authService: Auth, private router: Router) {}

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

    if (category.isOpen) {
      this.router.navigate(['/'], { queryParams: { categoria: category.name } });
      this.activeLink = '';
    } else {
      this.router.navigate(['/']);
    }
  }

  filterSubcategory(catName: string, subName: string) {
    this.activeLink = subName;
    this.router.navigate(['/'], { queryParams: { categoria: catName, subcategoria: subName } });
  }

  setActiveLink(link: string) {
    this.activeLink = link;
    this.router.navigate([link]);
  }
}
