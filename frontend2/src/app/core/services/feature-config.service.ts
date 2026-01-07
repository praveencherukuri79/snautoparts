import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  children?: NavigationItem[];
  badge?: {
    type: 'count' | 'dot';
    source: string;
  };
}

export interface FeatureConfig {
  role: string;
  version: number;
  features: Record<string, Record<string, boolean>>;
  navigation: {
    primary: NavigationItem[];
    secondary?: NavigationItem[];
    account: NavigationItem[];
  };
  ui: {
    dashboardLayout: 'customer' | 'operations' | 'admin';
    showPriceHistory: boolean;
    showCostPrice: boolean;
    showAuditInfo: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class FeatureConfigService {
  private api = inject(ApiService);

  private config = signal<FeatureConfig | null>(null);
  private loading = signal(false);

  readonly featureConfig = this.config.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly navigation = computed(() => this.config()?.navigation);
  readonly features = computed(() => this.config()?.features);
  readonly ui = computed(() => this.config()?.ui);
  readonly dashboardLayout = computed(() => this.config()?.ui?.dashboardLayout ?? 'customer');

  async loadConfig(): Promise<void> {
    this.loading.set(true);
    try {
      const config = await this.api.get<FeatureConfig>('/auth/feature-config');
      this.config.set(config);
    } catch (error) {
      console.error('Failed to load feature config:', error);
      // Set default customer config
      this.config.set(this.getDefaultConfig());
    } finally {
      this.loading.set(false);
    }
  }

  clearConfig(): void {
    this.config.set(null);
  }

  hasFeature(featurePath: string): boolean {
    const features = this.features();
    if (!features) return false;

    // Navigate the feature path (e.g., "orders.viewAll")
    const parts = featurePath.split('.');
    if (parts.length !== 2) return false;

    const [category, feature] = parts;
    return features[category]?.[feature] === true;
  }

  private getDefaultConfig(): FeatureConfig {
    return {
      role: 'CUSTOMER',
      version: 1,
      features: {
        catalog: { browse: true, search: true, viewDetail: true, fitmentFilter: true },
        cart: { view: true, modify: true, checkout: true },
        orders: { viewOwn: true },
      },
      navigation: {
        primary: [
          { id: 'home', label: 'Home', icon: 'home', route: '/' },
          { id: 'products', label: 'Products', icon: 'grid_view', route: '/products' },
          { id: 'cart', label: 'Cart', icon: 'shopping_cart', route: '/cart' },
        ],
        account: [
          { id: 'orders', label: 'My Orders', icon: 'package', route: '/orders' },
          { id: 'profile', label: 'Profile', icon: 'person', route: '/account/profile' },
        ],
      },
      ui: {
        dashboardLayout: 'customer',
        showPriceHistory: false,
        showCostPrice: false,
        showAuditInfo: false,
      },
    };
  }
}

