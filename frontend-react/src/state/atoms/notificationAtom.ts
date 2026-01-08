import { atom } from 'recoil';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

/**
 * Notification Atom
 * Manages toast notifications
 */
export const notificationAtom = atom<Notification | null>({
  key: 'notificationAtom',
  default: null,
});
