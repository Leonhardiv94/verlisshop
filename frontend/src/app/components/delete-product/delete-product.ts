import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-delete-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-product.html',
  styleUrl: './delete-product.css'
})
export class DeleteProduct implements OnInit {
  searchQuery: string = '';
  searchResults: Product[] = [];
  isSearching = false;

  // Delete Modal State
  productToDelete: Product | null = null;
  adminPassword = '';
  showPassword = false;
  isDeleting = false;
  errorMsg = '';
  successMsg = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {}

  onSearch() {
    if (!this.searchQuery) return;
    this.isSearching = true;
    this.successMsg = '';
    this.errorMsg = '';
    
    this.productService.getProducts(undefined, undefined, this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error in search', err);
        this.isSearching = false;
      }
    });
  }

  promptDelete(product: Product) {
    this.productToDelete = product;
    this.adminPassword = '';
    this.showPassword = false;
    this.errorMsg = '';
    this.successMsg = '';
  }

  cancelDelete() {
    this.productToDelete = null;
    this.adminPassword = '';
    this.errorMsg = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onConfirmDelete() {
    if (!this.productToDelete || !this.productToDelete._id || !this.adminPassword) return;

    this.isDeleting = true;
    this.errorMsg = '';

    this.productService.deleteProduct(this.productToDelete._id, this.adminPassword).subscribe({
      next: () => {
        this.isDeleting = false;
        this.successMsg = `¡El producto "${this.productToDelete!.nombre}" fue eliminado permanentemente!`;
        
        // Lo sacamos de la lista visual
        this.searchResults = this.searchResults.filter(p => p._id !== this.productToDelete!._id);
        
        // Cerramos el modal
        this.productToDelete = null;
        this.adminPassword = '';
      },
      error: (err) => {
        this.isDeleting = false;
        this.errorMsg = err.error?.error || 'Error desconocido al intentar eliminar.';
      }
    });
  }
}
