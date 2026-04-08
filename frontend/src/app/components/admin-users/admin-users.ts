import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsers implements OnInit {
  activeTab: 'create' | 'edit' | 'delete' = 'create';
  
  // Search
  searchQuery = '';
  foundUsers: User[] = [];
  selectedUser: User | null = null;

  // Form Data (Create)
  createData = {
    nombres: '',
    apellidos: '',
    cedula: '',
    correo: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'admin',
    pais: '',
    ciudad: '',
    direccion: '',
    fechaNacimiento: ''
  };

  // Form Data (Edit)
  editData = {
    correo: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'admin',
    deleteAvatar: false
  };

  // Modals
  showConfirmModal = false;
  modalType: 'update' | 'delete' | 'create' = 'create';

  // Notifications
  notification = { show: false, message: '', type: 'success' as 'success' | 'error' };

  // Password Visibility
  showPassC = false;
  showPassCC = false;
  showPassE = false;
  showPassEC = false;

  constructor(private userService: UserService) {}

  ngOnInit() {}

  setTab(tab: 'create' | 'edit' | 'delete') {
    this.activeTab = tab;
    this.clearData();
  }

  clearData() {
    this.searchQuery = '';
    this.foundUsers = [];
    this.selectedUser = null;
    this.createData = { 
      nombres: '', apellidos: '', cedula: '', correo: '', password: '', confirmPassword: '', role: 'user',
      pais: '', ciudad: '', direccion: '', fechaNacimiento: ''
    };
    this.editData = { correo: '', password: '', confirmPassword: '', role: 'user', deleteAvatar: false };
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.foundUsers = [];
      return;
    }
    this.userService.getUsers(this.searchQuery).subscribe({
      next: (users) => this.foundUsers = users,
      error: (err) => console.error(err)
    });
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.foundUsers = [];
    this.searchQuery = `${user.nombres} ${user.apellidos} (${user.cedula})`;
    
    if (this.activeTab === 'edit') {
      this.editData.correo = user.correo;
      this.editData.role = user.role;
      this.editData.password = '';
      this.editData.confirmPassword = '';
      this.editData.deleteAvatar = false;
    }
  }

  openConfirm(type: 'update' | 'delete' | 'create') {
    if (type === 'create' || type === 'update') {
      const data = type === 'create' ? this.createData : this.editData;
      if (data.password !== data.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
    }
    this.modalType = type;
    this.showConfirmModal = true;
  }

  closeConfirm() {
    this.showConfirmModal = false;
  }

  private showNotification(message: string, type: 'success' | 'error') {
    this.notification = { show: true, message, type };
    setTimeout(() => {
      this.notification.show = false;
    }, 4000);
  }

  handleAction() {
    if (this.modalType === 'create') {
      this.userService.createUser(this.createData).subscribe({
        next: () => {
          this.showNotification('Usuario creado exitosamente', 'success');
          this.clearData();
          this.closeConfirm();
        },
        error: (err) => this.showNotification(err.error?.message || 'Error al crear usuario', 'error')
      });
    } else if (this.modalType === 'update' && this.selectedUser) {
      this.userService.updateUser(this.selectedUser._id, this.editData).subscribe({
        next: () => {
          this.showNotification('Usuario actualizado con éxito', 'success');
          this.clearData();
          this.closeConfirm();
        },
        error: (err) => this.showNotification(err.error?.message || 'Error al actualizar', 'error')
      });
    } else if (this.modalType === 'delete' && this.selectedUser) {
      this.userService.deleteUser(this.selectedUser._id).subscribe({
        next: () => {
          this.showNotification('Usuario eliminado permanentemente', 'success');
          this.clearData();
          this.closeConfirm();
        },
        error: (err) => this.showNotification(err.error?.message || 'Error al eliminar', 'error')
      });
    }
  }
}
