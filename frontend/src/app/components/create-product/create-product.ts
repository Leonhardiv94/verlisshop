import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-product.html',
  styleUrl: './create-product.css'
})
export class CreateProduct implements OnInit {
  // Setup data
  categories = [
    {
      name: 'Zapatos para Dama',
      subcategories: [
        'Planas', 'Tres puntas', 'Planas con taloneras', 'Plataforma', 
        'Zapato elegante de tacón', 'Canoas', 'Botas', 'Deportivas', 'Casual bajito'
      ]
    },
    {
      name: 'Zapatos para Caballeros',
      subcategories: ['Zapato deportivo', 'Zapato casual', 'Canoas']
    },
    {
      name: 'Zapatos para Niños',
      subcategories: ['Deportivos', 'Para toda ocasión']
    },
    {
      name: 'Bolsos y Carteras',
      subcategories: ['Mochilas deportivas', 'Bolsos de salir', 'Bolsos deportivos']
    }
  ];

  tallasDisponibles = ['19', '21', '23', '25', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

  // Form Model
  product: Product = {
    nombre: '',
    precio: 0,
    categoria: '',
    subcategoria: '',
    material: '',
    descripcion: '',
    genero: '',
    fotoPrincipal: '',
    fotosAdicionales: [],
    tallas: []
  };

  subcategoriasActuales: string[] = [];
  isLoading = false;
  successMsg = '';
  errorMsg = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {}

  onCategoryChange() {
    // Buscar la categoria en el array
    const cat = this.categories.find(c => c.name === this.product.categoria);
    if (cat) {
      this.subcategoriasActuales = cat.subcategories;
    } else {
      this.subcategoriasActuales = [];
    }
    // Reiniciar subcategoria
    this.product.subcategoria = '';
    
    // Autocompletar Genero y Tallas cuando cambie categoria
    if (this.product.categoria.includes('Dama')) this.product.genero = 'Mujer';
    else if (this.product.categoria.includes('Caballeros')) this.product.genero = 'Hombre';
    else if (this.product.categoria.includes('Niños')) this.product.genero = 'Niño';
    else this.product.genero = ''; // Se usa radio button en bolsos
    
    if (!this.product.categoria.includes('Zapatos')) {
      this.product.tallas = [];
    }
  }

  toggleTalla(talla: string) {
    const idx = this.product.tallas.indexOf(talla);
    if (idx > -1) {
      this.product.tallas.splice(idx, 1);
    } else {
      this.product.tallas.push(talla);
    }
  }

  isTallaSelected(talla: string): boolean {
    return this.product.tallas.includes(talla);
  }

  // Comprimir imagen usando Canvas
  private processImage(file: File, callback: (base64: string) => void) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Productos pueden verse un poco mas grandes que avatares
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          callback(canvas.toDataURL('image/jpeg', 0.8)); // 80% calidad
        } else {
          callback(e.target.result); // Fallback
        }
      };
    };
    reader.readAsDataURL(file);
  }

  onMainPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processImage(file, (base64) => {
        this.product.fotoPrincipal = base64;
      });
    }
  }

  onAdditionalPhotosSelected(event: any) {
    const files = event.target.files;
    this.product.fotosAdicionales = []; // reiniciar si selecciona de nuevo
    for (let i = 0; i < files.length; i++) {
      this.processImage(files[i], (base64) => {
         this.product.fotosAdicionales.push(base64);
      });
    }
  }

  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';
    
    // Validate
    if (!this.product.fotoPrincipal) {
      this.errorMsg = 'Debes subir una foto principal.';
      return;
    }

    this.isLoading = true;
    this.productService.createProduct(this.product).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMsg = '¡Producto creado y publicado en la tienda exitosamente!';
        // Limpiar
         this.product = {
          nombre: '', precio: 0, categoria: '', subcategoria: '', material: '',
          descripcion: '', genero: '', fotoPrincipal: '', fotosAdicionales: [], tallas: []
        };
        this.subcategoriasActuales = [];
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = 'Error al crear el producto: ' + err.message;
      }
    });
  }
}
