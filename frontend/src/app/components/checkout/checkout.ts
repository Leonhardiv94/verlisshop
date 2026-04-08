import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { Auth } from '../../services/auth';
import { OrderService } from '../../services/order.service';
import { CartService, CartItem } from '../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit, OnDestroy {
  product: Product | null = null;
  talla: string | null = null;
  cantidad: number = 1;

  // Multi-item cart support
  cartItems: any[] = [];
  isFromCart = false;

  currentUser: any = null;
  isLoading = true;

  // Checkout Form State
  selectedAddressIndex: number = -1; // -1 significa "Nueva o Antigua sin guardar"
  newAddress = {
    pais: '',
    ciudad: '',
    direccion: '',
    referencia: ''
  };
  
  // Pricing
  shippingCost = 0; // Administrable luego en backend

  // Delete Address Modal State
  addressToDelete: any = null;
  isDeleting = false;

  // Order Creation State
  orderSuccess = false;
  createdOrderCode = '';

  private routeSub: Subscription = new Subscription();
  private authSub: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: Auth,
    private orderService: OrderService,
    private cartService: CartService,
    private location: Location
  ) {}

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/']);
      } else {
        // Automatic address setup logic
        if (user.direccionesGuardadas && user.direccionesGuardadas.length > 0) {
          this.selectedAddressIndex = 0; // Seleccionamos la primera guardada
        } else {
          // Si no tiene direcciones múltiples, prellenamos con su registro base para que solo ponga referencia
          this.selectedAddressIndex = -1;
          this.newAddress.pais = user.pais;
          this.newAddress.ciudad = user.ciudad;
          this.newAddress.direccion = user.direccion;
        }
      }
    });

    this.routeSub = this.route.queryParams.subscribe(params => {
      this.isFromCart = params['fromCart'] === 'true';
      
      if (this.isFromCart) {
        this.cartItems = this.cartService.getCartSnapshot();
        if (this.cartItems.length === 0) {
          this.router.navigate(['/']);
          return;
        }
        this.isLoading = false;
      } else {
        const productId = params['producto'];
        this.talla = params['talla'] || null;
        this.cantidad = params['cantidad'] ? parseInt(params['cantidad'], 10) : 1;

        if (productId) {
          this.loadProduct(productId);
        } else {
          this.location.back();
        }
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
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading product for checkout:', err);
        this.isLoading = false;
        this.location.back();
      }
    });
  }

  get totalValue(): number {
    if (this.isFromCart) {
      return this.cartService.getTotalAmount() + this.shippingCost;
    }
    return ((this.product?.precio || 0) * this.cantidad) + this.shippingCost;
  }

  goBack() {
    this.location.back();
  }

  promptDeleteAddress(event: Event, address: any) {
    event.stopPropagation(); // Avoid triggering radio card selection
    this.addressToDelete = address;
  }

  cancelDeleteAddress() {
    this.addressToDelete = null;
  }

  confirmDeleteAddress() {
    if (!this.addressToDelete || !this.addressToDelete._id) return;
    this.isDeleting = true;

    this.authService.deleteSavedAddress(this.addressToDelete._id).subscribe({
      next: (res) => {
        this.isDeleting = false;
        this.addressToDelete = null;
        // The currentUser$ subscription will auto-update the list
      },
      error: (err) => {
        console.error('Error deleting address:', err);
        alert('Ocurrió un error eliminando la dirección.');
        this.isDeleting = false;
        this.addressToDelete = null;
      }
    });
  }

  onProceedToPay() {
    if (!this.isFromCart && !this.product) return;
    if (this.isFromCart && this.cartItems.length === 0) return;

    let finalAddress: any = null;

    // Si seleccionó una dirección nueva (o la predeterminada antigua que estamos convirtiendo)
    if (this.selectedAddressIndex === -1) {
      if (!this.newAddress.pais || !this.newAddress.ciudad || !this.newAddress.direccion) {
        alert('Por favor completa todos los campos de la dirección.');
        return;
      }
      if (!this.newAddress.referencia || this.newAddress.referencia.trim() === '') {
        alert('Debes ingresar una descripción o punto de referencia obligatoriamente.');
        return;
      }
      finalAddress = { 
        ...this.newAddress 
      };

      // Guardamos la direccion en su perfil silenciosamente y disparamos orden
      this.authService.addSavedAddress(this.newAddress).subscribe({
        next: (res) => {
           this.processOrderMock(finalAddress);
        },
        error: (err) => {
           console.error('No se pudo guardar la referencia en BD, pero procederemos con orden', err);
           this.processOrderMock(finalAddress);
        }
      });
      return;
    } else {
      // Tomamos la direccion guardada
      finalAddress = this.currentUser.direccionesGuardadas[this.selectedAddressIndex];
      this.processOrderMock(finalAddress);
    }
  }

  processOrderMock(addressPayload: any) {
    let orderItems = [];

    if (this.isFromCart) {
      orderItems = this.cartItems.map(item => ({
        productId: item.productId,
        tallaEscogida: item.size,
        cantidad: item.quantity
      }));
    } else {
      orderItems = [{
        productId: this.product?._id,
        tallaEscogida: this.talla,
        cantidad: this.cantidad
      }];
    }

    const orderData = {
      items: orderItems,
      direccionEnvio: addressPayload,
      costoEnvio: this.shippingCost,
      totalPagar: this.totalValue
    };

    console.log('Creando orden de compra en backend...', orderData);
    
    this.orderService.createOrder(orderData).subscribe({
      next: (res) => {
        this.createdOrderCode = res.order.codigoOrden;
        this.orderSuccess = true;
        if (this.isFromCart) {
          this.cartService.clearCart();
        }
      },
      error: (err) => {
        console.error('Error procesando pago:', err);
        alert('Lo sentimos, ocurrió un error procesando la compra.');
      }
    });
  }

  goToMyOrders() {
    this.router.navigate(['/mis-compras']);
  }
}
