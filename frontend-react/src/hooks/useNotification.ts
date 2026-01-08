import { useSetRecoilState } from 'recoil';
import { notificationAtom, NotificationType } from '@/state/atoms';

export interface UseNotificationReturn {
  /** Show a notification */
  showNotification: (message: string, type?: NotificationType) => void;
  /** Show success notification */
  success: (message: string) => void;
  /** Show error notification */
  error: (message: string) => void;
  /** Show warning notification */
  warning: (message: string) => void;
  /** Show info notification */
  info: (message: string) => void;
  /** Clear current notification */
  clear: () => void;
}

/**
 * useNotification Hook
 * 
 * Provides functions to show and manage notifications.
 * 
 * @example
 * ```tsx
 * const { success, error } = useNotification();
 * 
 * const handleSave = async () => {
 *   try {
 *     await saveData();
 *     success('Saved successfully!');
 *   } catch (e) {
 *     error('Failed to save');
 *   }
 * };
 * ```
 */
export function useNotification(): UseNotificationReturn {
  const setNotification = useSetRecoilState(notificationAtom);

  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({
      id: `notification-${Date.now()}`,
      message,
      type,
    });
  };

  const success = (message: string) => showNotification(message, 'success');
  const error = (message: string) => showNotification(message, 'error');
  const warning = (message: string) => showNotification(message, 'warning');
  const info = (message: string) => showNotification(message, 'info');

  const clear = () => {
    setNotification(null);
  };

  return {
    showNotification,
    success,
    error,
    warning,
    info,
    clear,
  };
}

export default useNotification;
