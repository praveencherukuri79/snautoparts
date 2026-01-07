import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { FeatureConfigService } from '@core/services/feature-config.service';

export const featureGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const featureConfigService = inject(FeatureConfigService);
  const router = inject(Router);

  const requiredFeature = route.data['feature'] as string;

  if (!requiredFeature) {
    return true;
  }

  // Handle OR conditions (feature1|feature2)
  const features = requiredFeature.split('|');
  const hasAccess = features.some(f => featureConfigService.hasFeature(f));

  if (!hasAccess) {
    // Redirect to home or show unauthorized
    router.navigate(['/']);
    return false;
  }

  return true;
};

