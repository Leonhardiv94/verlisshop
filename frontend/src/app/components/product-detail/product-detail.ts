import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { Auth } from '../../services/auth';
import { ModalService } from '../../services/modal.service';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  cantidad: number = 1;
  isLoggedIn = false;
  currentUser: any = null;

  // Notifications
  notification = { show: false, message: '', type: 'success' as 'success' | 'error' };

  // Admin Reply logic
  replyingToId: string | null = null;
  adminReplyText = '';

  // User Edit Comment logic
  editingReviewId: string | null = null;
  editCommentText = '';
  
  private routeSub: Subscription = new Subscription();
  private authSub: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: Auth,
    private modalService: ModalService,
    private cartService: CartService,
    private location: Location
  ) {}

  ngOnInit() {
    this.authSub = this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
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

  increaseQty() {
    if (this.cantidad < 20) this.cantidad++; // Limit to max reasonable quantity for retail
  }

  decreaseQty() {
    if (this.cantidad > 1) this.cantidad--;
  }

  goBack() {
    this.location.back();
  }

  getTotalStock(): number {
    if (!this.product || !this.product.inventario) return 0;
    return this.product.inventario.reduce((acc, inv) => acc + inv.cantidad, 0);
  }

  isSizeInStock(talla: string): boolean {
    if (!this.product || !this.product.inventario) return false;
    const item = this.product.inventario.find(i => i.talla === talla);
    return item ? item.cantidad > 0 : false;
  }

  triggerAuthModal(type: 'login' | 'register') {
    this.modalService.open(type);
  }

  // Pendiente logica real de carrito
  onAddToCart() {
    if (!this.product) return;
    if (this.product.tallas && this.product.tallas.length > 0 && !this.selectedTalla) {
      this.showNotification('Por favor selecciona una talla.', 'error');
      return;
    }
    
    this.cartService.addItem({
      productId: this.product._id || '',
      name: this.product.nombre,
      price: this.product.precio,
      image: this.product.fotoPrincipal,
      quantity: this.cantidad,
      size: this.selectedTalla
    });

    this.showNotification('¡Producto añadido a la bolsa!', 'success');
    this.modalService.open('cart');
  }

  onBuyNow() {
    if (this.product?.tallas && this.product.tallas.length > 0 && !this.selectedTalla) {
      alert('Por favor selecciona una talla para continuar.');
      return;
    }
    
    // Redirect to checkout passing ID, Talla, and Cantidad via URL Search Params
    const queryParams: any = { 
      producto: this.product?._id,
      cantidad: this.cantidad 
    };
    if (this.selectedTalla) {
      queryParams.talla = this.selectedTalla;
    }
    this.router.navigate(['/checkout'], { queryParams });
  }

  // --- REVIEW EDIT METHODS ---
  startEdit(review: any) {
    this.editingReviewId = review._id;
    this.editCommentText = review.comment;
  }

  cancelEdit() {
    this.editingReviewId = null;
    this.editCommentText = '';
  }

  submitUpdateReview(reviewId: string) {
    if (!this.product || !this.editCommentText.trim()) return;

    this.productService.updateReview(this.product._id || '', reviewId, this.editCommentText).subscribe({
      next: (res) => {
        this.product = res.product;
        this.cancelEdit();
        this.showNotification('Comentario actualizado correctamente.', 'success');
      },
      error: (err) => {
        console.error('Error updating review:', err);
        this.showNotification('No se pudo actualizar el comentario.', 'error');
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error') {
    this.notification = { show: true, message, type };
    setTimeout(() => {
      this.notification.show = false;
    }, 4000);
  }

  // Star Rating Helper
  getStarArray(rating: number) {
    return Array(5).fill(0).map((_, i) => i < rating);
  }

  startReply(reviewId: string) {
    this.replyingToId = reviewId;
    this.adminReplyText = '';
  }

  cancelReply() {
    this.replyingToId = null;
  }

  submitAdminReply(reviewId: string) {
    if (!this.product || !this.adminReplyText.trim()) return;

    this.productService.replyReview(this.product._id || '', reviewId, this.adminReplyText).subscribe({
      next: (res) => {
        this.product = res.product;
        this.cancelReply();
        this.showNotification('Respuesta enviada exitosamente.', 'success');
      },
      error: (err) => {
        console.error('Error replying:', err);
        this.showNotification('No se pudo enviar la respuesta.', 'error');
      }
    });
  }
}
