import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css'
})
export class EditProduct implements OnInit {
  searchQuery: string = '';
  searchResults: Product[] = [];
  isSearching = false;

  // Edit Mode
  editingProduct: Product | null = null;
  isLoading = false;
  successMsg = '';
  errorMsg = '';

  tallasDisponibles = ['19', '21', '23', '25', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

  constructor(private productService: ProductService) {}

  ngOnInit() {}

  onSearch() {
    if (!this.searchQuery) return;
    this.isSearching = true;
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

  startEdit(product: Product) {
    // Clonamos profundamente para no mutar el modelo listado accidentalmente
    this.editingProduct = JSON.parse(JSON.stringify(product));
    this.successMsg = '';
    this.errorMsg = '';
  }

  cancelEdit() {
    this.editingProduct = null;
    this.successMsg = '';
    this.errorMsg = '';
  }

  toggleTalla(talla: string) {
    if (!this.editingProduct) return;
    if (!this.editingProduct.tallas) this.editingProduct.tallas = [];
    
    const idx = this.editingProduct.tallas.indexOf(talla);
    if (idx > -1) {
      this.editingProduct.tallas.splice(idx, 1);
    } else {
      this.editingProduct.tallas.push(talla);
    }
  }

  isTallaSelected(talla: string): boolean {
    return this.editingProduct?.tallas?.includes(talla) || false;
  }

  removeAdicionalPhoto(index: number) {
    if (this.editingProduct && this.editingProduct.fotosAdicionales) {
      this.editingProduct.fotosAdicionales.splice(index, 1);
    }
  }

  // Comprimir imagen usando Canvas (misma lógica que CreateProduct)
  private processImage(file: File, callback: (base64: string) => void) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // límite de servidor local para performance
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          callback(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          callback(e.target.result);
        }
      };
    };
    reader.readAsDataURL(file);
  }

  onReplaceMainPhoto(event: any) {
    const file = event.target.files[0];
    if (file && this.editingProduct) {
      this.processImage(file, (base64) => {
        this.editingProduct!.fotoPrincipal = base64;
      });
    }
  }

  onAddMorePhotos(event: any) {
    const files = event.target.files;
    if (!this.editingProduct) return;
    if (!this.editingProduct.fotosAdicionales) this.editingProduct.fotosAdicionales = [];
    
    for (let i = 0; i < files.length; i++) {
        this.processImage(files[i], (base64) => {
           this.editingProduct!.fotosAdicionales.push(base64);
        });
    }
  }

  onUpdate() {
    if (!this.editingProduct || !this.editingProduct._id) return;
    
    this.isLoading = true;
    this.successMsg = '';
    this.errorMsg = '';
    
    // Solo enviamos los datos permitidos para actualización
    const updatePayload = {
      precio: this.editingProduct.precio,
      descripcion: this.editingProduct.descripcion,
      tallas: this.editingProduct.tallas,
      fotoPrincipal: this.editingProduct.fotoPrincipal,
      fotosAdicionales: this.editingProduct.fotosAdicionales
    };

    this.productService.updateProduct(this.editingProduct._id, updatePayload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMsg = '¡Producto actualizado correctamente en la tienda!';
        // Actualizar el resultado en la lista de búsqueda
        const index = this.searchResults.findIndex(p => p._id === this.editingProduct!._id);
        if (index !== -1) {
          this.searchResults[index] = { ...this.editingProduct! };
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = 'Error al actualizar el producto: ' + err.message;
      }
    });
  }
}
