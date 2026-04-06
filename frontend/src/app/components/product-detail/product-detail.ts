import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { Auth } from '../../services/auth';
import { ModalService } from '../../services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit, OnDestroy {
  product: Product | null = null;
  isLoading = true;
  errorMsg = '';
  
  // UI State
  selectedImage = '';
  selectedTalla = '';
  isLoggedIn = false;
  
  private routeSub: Subscription = new Subscription();
  private authSub: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: Auth,
    private modalService: ModalService,
    private location: Location
  ) {}

  ngOnInit() {
    this.authSub = this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });

    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.authSub.unsubscribe();
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.productService.getProduct(id).subscribe({
      next: (data) => {
        this.product = data;
        this.selectedImage = data.fotoPrincipal;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = 'No pudimos encontrar este producto.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  changeMainImage(img: string) {
    this.selectedImage = img;
  }

  selectTalla(talla: string) {
    this.selectedTalla = talla;
  }

  goBack() {
    this.location.back();
  }

  triggerAuthModal(type: 'login' | 'register') {
    this.modalService.open(type);
  }

  // Pendiente logica real de carrito
  onAddToCart() {
    if (this.product?.tallas && this.product.tallas.length > 0 && !this.selectedTalla) {
      alert('Por favor selecciona una talla antes de añadir al carrito.');
      return;
    }
    console.log('Agregando al carrito...', this.product?.nombre, 'Talla:', this.selectedTalla);
  }

  onBuyNow() {
    if (this.product?.tallas && this.product.tallas.length > 0 && !this.selectedTalla) {
      alert('Por favor selecciona una talla para continuar.');
      return;
    }
    console.log('Comprando ahora...', this.product?.nombre);
  }
}
