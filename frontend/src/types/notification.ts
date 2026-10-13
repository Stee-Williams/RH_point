export type NotificationType = 'info' | 'alerte' | 'validation_requise' | 'rappel';
export interface AppNotification {
  id: number;
  titre: string;
  message: string;
  type: NotificationType;
  lu: boolean;
  lien: string | null;
  createdAt: string;
}
export interface NotificationListParams {
  onlyUnread?: boolean;
  page?: number;
  limit?: number;
}
export interface PaginatedNotificationsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface PaginatedNotifications {
  items: AppNotification[];
  meta: PaginatedNotificationsMeta;
}
