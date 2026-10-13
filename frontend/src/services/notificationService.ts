import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { AppNotification, NotificationListParams, PaginatedNotifications } from '../types/notification';
interface NotificationListApiResponse {
  success: true;
  data: AppNotification[];
  meta: PaginatedNotifications['meta'];
}
export const notificationService = {
  async list(params: NotificationListParams): Promise<PaginatedNotifications> {
    const response = await api.get<NotificationListApiResponse>('/notifications', {
      params: {
        onlyUnread: params.onlyUnread || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return { items: response.data.data, meta: response.data.meta };
  },
  async unreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/non-lues');
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data.count;
  },
  async markAsRead(id: number): Promise<AppNotification> {
    const response = await api.put<ApiResponse<AppNotification>>(`/notifications/${id}/lu`);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/lu-toutes');
  },
};
