import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-auth-modal',
  imports: [FormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css'
})
export class AuthModal {
  @Input() modalType: 'login' | 'register' = 'login';
  @Output() closeModalEvent = new EventEmitter<void>();

  // Login form
  loginEmail = '';
  loginPassword = '';

  // Register form
  registerNombres = '';
  registerApellidos = '';
  registerCedula = '';
  registerFechaNacimiento = '';
  registerCorreo = '';
  registerPais = '';
  registerCiudad = '';
  registerDireccion = '';
  registerPassword = '';
  registerConfirmPassword = '';

  // UI state
  showLoginPassword = false;
  showRegisterPassword = false;
  showRegisterConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: Auth) {}

  closeModal() {
    this.closeModalEvent.emit();
    this.resetForms();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  switchToRegister() {
    this.modalType = 'register';
    this.resetForms();
  }

  switchToLogin() {
    this.modalType = 'login';
    this.resetForms();
  }

  toggleLoginPassword() {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPassword() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  toggleRegisterConfirmPassword() {
    this.showRegisterConfirmPassword = !this.showRegisterConfirmPassword;
  }

  onLogin() {
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.loginEmail, this.loginPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.closeModal();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error al iniciar sesión';
      }
    });
  }

  onRegister() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(this.registerPassword)) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres, una mayúscula y una minúscula';
      return;
    }

    const birthDate = new Date(this.registerFechaNacimiento);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) {
      this.errorMessage = 'Debes ser mayor de edad para registrarte';
      return;
    }

    this.isLoading = true;

    const userData = {
      nombres: this.registerNombres,
      apellidos: this.registerApellidos,
      cedula: this.registerCedula,
      fechaNacimiento: this.registerFechaNacimiento,
      correo: this.registerCorreo,
      pais: this.registerPais,
      ciudad: this.registerCiudad,
      direccion: this.registerDireccion,
      password: this.registerPassword
    };

    this.authService.register(userData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Registro exitoso';
        setTimeout(() => {
          this.closeModal();
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error al registrarse';
      }
    });
  }

  private resetForms() {
    this.loginEmail = '';
    this.loginPassword = '';
    
    this.registerNombres = '';
    this.registerApellidos = '';
    this.registerCedula = '';
    this.registerFechaNacimiento = '';
    this.registerCorreo = '';
    this.registerPais = '';
    this.registerCiudad = '';
    this.registerDireccion = '';
    this.registerPassword = '';
    this.registerConfirmPassword = '';

    this.errorMessage = '';
    this.successMessage = '';
    this.showLoginPassword = false;
    this.showRegisterPassword = false;
    this.showRegisterConfirmPassword = false;
  }

  get isRegisterDisabled(): boolean {
    return !this.registerNombres || 
           !this.registerApellidos || 
           !this.registerCedula ||
           !this.registerFechaNacimiento ||
           !this.registerCorreo ||
           !this.registerPais ||
           !this.registerCiudad ||
           !this.registerDireccion ||
           !this.registerPassword || 
           !this.registerConfirmPassword || 
           this.isLoading;
  }
}
