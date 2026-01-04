import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { PLACEHOLDER_IMAGES } from '../../core/constants/images';

export type ImageType = 'product' | 'category' | 'brand' | 'cartItem' | 'hero';

/**
 * Directive to handle image loading errors gracefully
 * Usage: <img [src]="imageUrl" appImageFallback="product">
 */
@Directive({
  selector: 'img[appImageFallback]',
  standalone: true,
})
export class ImageFallbackDirective {
  @Input() appImageFallback: ImageType = 'product';

  private hasError = false;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError(): void {
    if (this.hasError) {
      // Already tried fallback, set a simple placeholder
      this.el.nativeElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="14" text-anchor="middle" x="200" y="200"%3EImage unavailable%3C/text%3E%3C/svg%3E';
      return;
    }
    this.hasError = true;
    this.el.nativeElement.src = this.getFallbackImage();
  }

  private getFallbackImage(): string {
    switch (this.appImageFallback) {
      case 'category':
        return PLACEHOLDER_IMAGES.category;
      case 'brand':
        return PLACEHOLDER_IMAGES.brand;
      case 'cartItem':
        return PLACEHOLDER_IMAGES.cartItem;
      case 'hero':
        return PLACEHOLDER_IMAGES.hero;
      case 'product':
      default:
        return PLACEHOLDER_IMAGES.product;
    }
  }
}

