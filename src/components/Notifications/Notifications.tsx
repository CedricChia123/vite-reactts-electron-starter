import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BellIcon, CheckIcon } from '@radix-ui/react-icons';
import { Switch } from '@/components/ui/switch';
import NotificationContext from '@/context/NotificationContext';

export const Notifications: React.FC<{ isPushEnabled: boolean; onPushChange: (isEnabled: boolean) => void }> = ({
  isPushEnabled,
  onPushChange
}) => {
  const { notificationCount, resetNotificationCount } = useContext(NotificationContext);
  const fetchNotificationsList = async () => {
    return axios.get('http://localhost:5000/api/notificationslist').then((res) => res.data);
  };

  const {
    data: notifications,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['notificationsList'],
    queryFn: fetchNotificationsList
  });

  const [readNotifications, setReadNotifications] = useState<Set<number>>(new Set());

  const markAllAsRead = () => {
    if (Array.isArray(notifications)) {
      const allIndexes = notifications.map((_, index) => index);
      setReadNotifications(new Set(allIndexes));
    }
    resetNotificationCount();
    window.Main.resetNotification();
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching notifications</div>;

  return (
    <Card className="w-full md:w-[390px] h-full flex flex-col">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          You have {Array.isArray(notifications) ? notifications.length - readNotifications.size : '0'} unread messages.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="flex items-center space-x-4 rounded-md border p-4 mb-4">
          <BellIcon />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">Push Notifications</p>
            <p className="text-sm text-muted-foreground">Send notifications to device.</p>
          </div>
          <Switch checked={isPushEnabled} onCheckedChange={onPushChange} />
        </div>
        {Array.isArray(notifications) &&
          [...notifications].reverse().map((notification, index) => (
            <div key={index} className="mb-4 flex items-start pb-4 last:mb-0 last:pb-0">
              {!readNotifications.has(notifications.length - 1 - index) && (
                <span className={`flex h-2 w-2 translate-y-1 ${'rounded-full bg-sky-500'}`} />
              )}
              <div className="flex-1 space-y-1 ml-2">
                <p className="text-sm font-medium leading-none overflow-x-auto">{notification.title}</p>
                <p className="text-sm font-medium leading-none">Date: {notification.date}</p>
                <div
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: notification.body }}
                ></div>
                <hr></hr>
              </div>
            </div>
          ))}
      </CardContent>
      <CardFooter className="mt-auto">
        <Button className="w-full" onClick={markAllAsRead}>
          <CheckIcon className="mr-2 h-4 w-4" /> Mark all as read
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Notifications;
