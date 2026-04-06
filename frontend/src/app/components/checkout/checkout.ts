import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { Auth } from '../../services/auth';
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

  private routeSub: Subscription = new Subscription();
  private authSub: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: Auth,
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
      const productId = params['producto'];
      this.talla = params['talla'] || null;
      this.cantidad = params['cantidad'] ? parseInt(params['cantidad'], 10) : 1;

      if (productId) {
        this.loadProduct(productId);
      } else {
         // Si no mandan producto, regresamos
         this.location.back();
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
    return ((this.product?.precio || 0) * this.cantidad) + this.shippingCost;
  }

  goBack() {
    this.location.back();
  }

  onProceedToPay() {
    if (!this.product) return;

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
    const orderData = {
      product: this.product,
      tallaEscogida: this.talla,
      cantidad: this.cantidad,
      direccionEnvio: addressPayload,
      referencia: addressPayload.referencia, // Already bundled inside address
      totalPagar: this.totalValue
    };

    console.log('Orden lista para pagar:', orderData);
    alert('Orden ensamblada. Referencia verificada. Redirigiendo a pasarela de pago... (en construcción)');
  }
}
