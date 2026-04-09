import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService, Product } from '../../services/product.service';
import { Auth } from '../../services/auth';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoading = true;
  isLoggedIn = false;
  
  private authSub: Subscription = new Subscription();
  private routeSub: Subscription = new Subscription();

  constructor(
    private productService: ProductService,
    private authService: Auth,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authSub.add(
      this.authService.isLoggedIn$.subscribe(status => {
        this.isLoggedIn = status;
      })
    );

    // Listen to query parameters for category/subcategory filtering
    this.routeSub.add(
      this.route.queryParams.subscribe(params => {
        const cat = params['categoria'];
        const sub = params['subcategoria'];
        this.loadProducts(cat, sub);
      })
    );
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
    this.routeSub.unsubscribe();
  }

  loadProducts(categoria?: string, subcategoria?: string) {
    this.isLoading = true;
    this.productService.getProducts(categoria, subcategoria).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.isLoading = false;
      }
    });
  }

  // To interact with the modal logic from anywhere we usually dispatch an event or call authService
  // For simplicity, we can emit an event or direct link it.
  // Actually, login is usually handled via header, but user wants buttons in the product card if logged out.
  // The user requested: "y el boton iniciar sesion y abajo registrarse si el usuario no esta logueado".
  // A clean way is to trigger a custom event or navigate to a login route, but since we use a modal,
  // we can create a service to open modals. 
  // Let's implement stub methods for those buttons:
  
  goToDetail(id: string | undefined) {
    if (!id) return;
    this.router.navigate(['/producto', id]);
  }

  getTotalStock(product: Product): number {
    if (!product.inventario) return 0;
    return product.inventario.reduce((acc, inv) => acc + inv.cantidad, 0);
  }

  onAddToCart(product: Product) {
    console.log('Añadir al carro:', product.nombre);
    // TODO: Implement cart logic
  }

  onBuyNow(product: Product) {
    console.log('Comprar:', product.nombre);
    // TODO: Implement checkout logic
  }

  triggerAuthModal(type: 'login' | 'register') {
    this.modalService.open(type);
  }

  startCarousel(product: any) {
    if (!product.fotosAdicionales || product.fotosAdicionales.length === 0) return;

    if (product._intervalId) {
      clearInterval(product._intervalId);
    }

    product._currentIndex = 1;
    const totalImages = 1 + product.fotosAdicionales.length;
    this.cdr.detectChanges();

    product._intervalId = setInterval(() => {
      product._currentIndex++;
      if (product._currentIndex >= totalImages) {
        product._currentIndex = 0;
      }
      this.cdr.detectChanges(); // Forzamos a Angular a redibujar
    }, 1500);
  }

  stopCarousel(product: any) {
    if (product._intervalId) {
      clearInterval(product._intervalId);
      product._intervalId = null;
    }
    product._currentIndex = 0;
    this.cdr.detectChanges();
  }
}
