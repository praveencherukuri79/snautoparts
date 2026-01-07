import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  readonly companyLinks = [
    { label: 'About Us', route: '/about' },
    { label: 'Careers', route: '/careers' },
    { label: 'Locations', route: '/locations' },
    { label: 'Blog', route: '/blog' },
  ];

  readonly supportLinks = [
    { label: 'Contact Us', route: '/contact' },
    { label: 'Return Policy', route: '/returns' },
    { label: 'Shipping Info', route: '/shipping' },
    { label: 'Track Order', route: '/track' },
  ];

  readonly legalLinks = [
    { label: 'Terms of Service', route: '/terms' },
    { label: 'Privacy Policy', route: '/privacy' },
    { label: 'Cookie Policy', route: '/cookies' },
  ];
}

