import { Component } from '@angular/core';

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

  toggleCategory(category: Category) {
    category.isOpen = !category.isOpen;
  }

  setActiveLink(link: string) {
    this.activeLink = link;
  }
}
