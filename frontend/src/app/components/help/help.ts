import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help.html',
  styleUrl: './help.css'
})
export class Help implements OnInit {
  
  // These will eventually be fetched from a store settings API
  storeContactInfo = {
    correo: '',
    telefono: '',
    whatsapp: ''
  };

  constructor() {}

  ngOnInit() {
    // In the future: this.settingsService.getStoreContact().subscribe(...)
  }
}
