import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class Inventory implements OnInit {
  products: Product[] = [];
  isLoading = true;
  searchTerm = '';
  notification = { show: false, message: '', type: 'success' };

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data.map(p => {
          // Si el producto no tiene inventario inicializado (productos viejos), lo inicializamos localmente
          if (!p.inventario || p.inventario.length === 0) {
            if (p.tallas && p.tallas.length > 0) {
              p.inventario = p.tallas.map(t => ({ talla: t, cantidad: 0 }));
            } else {
              p.inventario = [{ talla: 'Única', cantidad: 0 }];
            }
          }
          return p;
        });
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  get filteredProducts() {
    if (!this.searchTerm) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.codigo?.toString().includes(term)
    );
  }

  getTotalStock(product: Product): number {
    if (!product.inventario) return 0;
    return product.inventario.reduce((acc, inv) => acc + inv.cantidad, 0);
  }

  updateStock(product: Product) {
    if (!product._id || !product.inventario) return;

    this.productService.updateInventory(product._id, product.inventario).subscribe({
      next: () => {
        this.showNotification('Inventario actualizado exitosamente', 'success');
      },
      error: () => {
        this.showNotification('Error al actualizar inventario', 'error');
      }
    });
  }

  showNotification(message: string, type: 'success' | 'error') {
    this.notification = { show: true, message, type };
    setTimeout(() => {
      this.notification.show = false;
    }, 3000);
  }
}
