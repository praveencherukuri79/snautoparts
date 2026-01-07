import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminService, NotificationService } from '@core/services';
import { CardComponent } from '@shared/primitives/card/card.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';

interface Integration {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  category: 'core' | 'supplier';
  status: 'connected' | 'disconnected' | 'error';
  lastVerified?: string;
  description?: string;
  features?: string[];
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggered?: string;
}

@Component({
  selector: 'app-settings-integrations',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
  ],
  templateUrl: './settings-integrations.component.html',
  styleUrl: './settings-integrations.component.scss',
})
export class SettingsIntegrationsComponent implements OnInit {
  private adminService = inject(AdminService);
  private notification = inject(NotificationService);

  isLoading = signal(true);
  integrations = signal<Integration[]>([]);
  webhooks = signal<Webhook[]>([]);

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Fetch from API (or mock data if enabled)
      const [integrationsData, webhooksData] = await Promise.all([
        this.adminService.getIntegrations(),
        this.adminService.getWebhooks(),
      ]);

      // Transform API response to our component's interface
      const iconColors: Record<string, string> = {
        'payment': '#635BFF',
        'email': '#1A82E2',
        'analytics': '#F9AB00',
        'shipping': '#FF6900',
        'supplier': '#2C5282',
      };

      const integrations = (integrationsData as unknown[]).map((i: unknown) => {
        const integration = i as Record<string, unknown>;
        const type = integration['type'] as string;
        return {
          id: integration['id'] as string,
          name: integration['name'] as string,
          icon: integration['icon'] as string || 'extension',
          iconColor: iconColors[type] || '#666',
          category: type === 'supplier' ? 'supplier' : 'core',
          status: integration['isConnected'] ? 'connected' : 'disconnected',
          lastVerified: integration['isConnected'] ? new Date().toISOString().split('T')[0] : undefined,
          description: integration['description'] as string,
          features: [],
        } as Integration;
      });

      const webhooks = (webhooksData as unknown[]).map((w: unknown) => {
        const webhook = w as Record<string, unknown>;
        return {
          id: webhook['id'] as string,
          url: webhook['url'] as string,
          events: webhook['events'] as string[] || [],
          isActive: webhook['isActive'] as boolean || false,
          lastTriggered: webhook['lastTriggeredAt'] as string,
        };
      });

      this.integrations.set(integrations);
      this.webhooks.set(webhooks);
    } catch (error) {
      this.notification.error('Failed to load integrations');
      console.error('Integrations load error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  get coreIntegrations(): Integration[] {
    return this.integrations().filter(i => i.category === 'core');
  }

  get supplierIntegrations(): Integration[] {
    return this.integrations().filter(i => i.category === 'supplier');
  }

  configure(integration: Integration): void {
    this.notification.info(`Configure ${integration.name}`);
  }

  connect(integration: Integration): void {
    this.notification.info(`Connect ${integration.name}`);
  }

  async testConnection(integration: Integration): Promise<void> {
    this.notification.info(`Testing connection to ${integration.name}...`);
    try {
      const result = await this.adminService.testIntegration(integration.id);
      if (result.success) {
        this.notification.success(`${integration.name} connection successful`);
      } else {
        this.notification.error(`${integration.name} connection failed: ${result.message}`);
      }
    } catch {
      this.notification.error(`Failed to test ${integration.name} connection`);
    }
  }

  addWebhook(): void {
    this.notification.info('Add webhook dialog would open here');
  }

  editWebhook(webhook: Webhook): void {
    this.notification.info(`Edit webhook: ${webhook.url}`);
  }

  async toggleWebhook(webhook: Webhook): Promise<void> {
    webhook.isActive = !webhook.isActive;
    this.notification.success(`Webhook ${webhook.isActive ? 'enabled' : 'disabled'}`);
  }

  async testWebhook(webhook: Webhook): Promise<void> {
    this.notification.info('Testing webhook...');
    try {
      const result = await this.adminService.testWebhook(webhook.id);
      if (result.success) {
        this.notification.success('Webhook test successful');
      } else {
        this.notification.error('Webhook test failed');
      }
    } catch {
      this.notification.error('Failed to test webhook');
    }
  }

  async deleteWebhook(webhook: Webhook): Promise<void> {
    try {
      await this.adminService.deleteWebhook(webhook.id);
      this.webhooks.update(list => list.filter(w => w.id !== webhook.id));
      this.notification.success('Webhook deleted');
    } catch {
      this.notification.error('Failed to delete webhook');
    }
  }

  viewLogs(integration: Integration): void {
    this.notification.info(`View logs for ${integration.name}`);
  }

  viewErrorLog(integration: Integration): void {
    this.notification.info(`View error log for ${integration.name}`);
  }

  async retrySync(integration: Integration): Promise<void> {
    this.notification.info(`Retrying sync for ${integration.name}...`);
    try {
      await this.adminService.testIntegration(integration.id);
      this.notification.success('Sync retry initiated');
      await this.loadData();
    } catch {
      this.notification.error('Failed to retry sync');
    }
  }

  addSupplier(): void {
    this.notification.info('Add supplier dialog would open here');
  }

  getStatusBadgeVariant(status: string): 'success' | 'default' | 'error' {
    const variants: Record<string, 'success' | 'default' | 'error'> = {
      'connected': 'success',
      'disconnected': 'default',
      'error': 'error',
    };
    return variants[status] || 'default';
  }

  // Alias for template compatibility
  getStatusVariant(status: string): 'success' | 'default' | 'error' {
    return this.getStatusBadgeVariant(status);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'connected': 'Connected',
      'disconnected': 'Disconnected',
      'error': 'Error',
    };
    return labels[status] || status;
  }

  trackByIntegration(_index: number, integration: Integration): string {
    return integration.id;
  }

  trackByWebhook(_index: number, webhook: Webhook): string {
    return webhook.id;
  }
}
