import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  tabs = [
    { label: 'General', path: 'general', icon: 'settings' },
    { label: 'Shipping', path: 'shipping', icon: 'local_shipping' },
    { label: 'Tax', path: 'tax', icon: 'receipt' },
    { label: 'Integrations', path: 'integrations', icon: 'extension' },
  ];
}
