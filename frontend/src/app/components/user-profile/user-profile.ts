import { Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  user: any = {};
  
  // Update state flags
  isLoadingGeneral = false;
  isLoadingPhones = false;
  isLoadingCredentials = false;
  isLoadingAvatar = false;
  
  // Messages
  generalMsg = '';
  phonesMsg = '';
  credentialsMsg = '';
  avatarMsg = '';

  // Phone inputs
  telefonoLlamadas = '';
  telefonoWhatsapp = '';

  // Credential inputs
  newCorreo = '';
  newPassword = '';
  newConfirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(private authService: Auth) {}

  ngOnInit() {
    // Ideally we would fetch the profile from backend to get all fields,
    // because the token payload might not have everything.
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        this.user = res.user;
        this.telefonoLlamadas = this.user.telefonoLlamadas || '';
        this.telefonoWhatsapp = this.user.telefonoWhatsapp || '';
        this.newCorreo = this.user.correo || '';
      },
      error: (err) => console.error(err)
    });
  }

  updateGeneral() {
    this.isLoadingGeneral = true;
    this.generalMsg = '';
    
    const data = {
      pais: this.user.pais,
      ciudad: this.user.ciudad,
      direccion: this.user.direccion
    };

    this.authService.updateGeneralInfo(data).subscribe({
      next: (res: any) => {
        this.isLoadingGeneral = false;
        this.generalMsg = '¡Información general actualizada!';
        this.user = res.user;
        setTimeout(() => this.generalMsg = '', 3000);
      },
      error: (err) => {
        this.isLoadingGeneral = false;
        this.generalMsg = 'Error al actualizar: ' + (err.error?.message || 'Asegúrate de estar autenticado.');
      }
    });
  }

  updatePhones() {
    this.isLoadingPhones = true;
    this.phonesMsg = '';

    const data = {
      telefonoLlamadas: this.telefonoLlamadas,
      telefonoWhatsapp: this.telefonoWhatsapp
    };

    this.authService.updatePhones(data).subscribe({
      next: (res: any) => {
        this.isLoadingPhones = false;
        this.phonesMsg = '¡Números de contacto actualizados!';
        this.user = res.user;
        setTimeout(() => this.phonesMsg = '', 3000);
      },
      error: (err) => {
        this.isLoadingPhones = false;
        this.phonesMsg = 'Error al actualizar: ' + (err.error?.message || 'Error desconocido.');
      }
    });
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  updateCredentials() {
    this.isLoadingCredentials = true;
    this.credentialsMsg = '';

    if (this.newPassword && this.newPassword !== this.newConfirmPassword) {
      this.credentialsMsg = 'Error: Las contraseñas no coinciden.';
      this.isLoadingCredentials = false;
      return;
    }

    if (this.newPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
      if (!passwordRegex.test(this.newPassword)) {
        this.credentialsMsg = 'Error: La contraseña debe tener al menos 8 caracteres, una mayúscula y una minúscula.';
        this.isLoadingCredentials = false;
        return;
      }
    }

    const data: any = { correo: this.newCorreo };
    if (this.newPassword) {
      data.password = this.newPassword;
    }

    this.authService.updateCredentials(data).subscribe({
      next: (res: any) => {
        this.isLoadingCredentials = false;
        this.credentialsMsg = '¡Credenciales actualizadas correctamente!';
        this.user = res.user;
        this.newPassword = ''; 
        this.newConfirmPassword = '';
        setTimeout(() => this.credentialsMsg = '', 3000);
      },
      error: (err) => {
        this.isLoadingCredentials = false;
        this.credentialsMsg = 'Error al actualizar credenciales: ' + (err.error?.message || 'Revisa los datos e intenta nuevamente.');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Image = e.target.result;
        
        // Comprimir imagen usando Canvas
        const img = new Image();
        img.src = base64Image;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Definir tamaño máximo (ej: 250px x 250px es de sobra para un avatar)
          const MAX_WIDTH = 250;
          const MAX_HEIGHT = 250;
          let width = img.width;
          let height = img.height;

          // Calcular proporciones si la imagen es muy grande
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
            
            // Exportar como JPEG a un 75% de calidad
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
            this.uploadAvatar(compressedBase64);
          } else {
            // Si el canvas falla (edge case rarisimo), sube la original
            this.uploadAvatar(base64Image);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  uploadAvatar(base64String: string) {
    this.isLoadingAvatar = true;
    this.avatarMsg = '';
    
    this.authService.updateAvatar({ avatar: base64String }).subscribe({
      next: (res: any) => {
        this.isLoadingAvatar = false;
        this.avatarMsg = '¡Foto de perfil actualizada!';
        this.user = res.user;
        setTimeout(() => this.avatarMsg = '', 3000);
      },
      error: (err) => {
        this.isLoadingAvatar = false;
        this.avatarMsg = 'Error al subir la imagen.';
      }
    });
  }
}
