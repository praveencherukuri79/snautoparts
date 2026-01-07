import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit, effect } from '@angular/core';
import { FeatureConfigService } from '../services/feature-config.service';

/**
 * Feature Visible Directive
 * Shows or hides elements based on feature configuration
 * 
 * Usage:
 * <button *featureVisible="'orders.cancel'">Cancel Order</button>
 * <div *featureVisible="'inventory.view|inventory.adjust'">...</div>
 */
@Directive({
  selector: '[featureVisible]',
  standalone: true,
})
export class FeatureVisibleDirective implements OnInit {
  @Input() featureVisible!: string;

  private featureConfig = inject(FeatureConfigService);
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private hasView = false;

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    const features = this.featureVisible.split('|');
    const hasAccess = features.some(f => this.featureConfig.hasFeature(f));

    if (hasAccess && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasAccess && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

