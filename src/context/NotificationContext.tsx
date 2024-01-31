import React, { createContext, useState, useCallback } from 'react';

interface NotificationContextType {
    notificationCount: number;
    incrementNotificationCount: (callback?: (newCount: number) => void) => void;
}

const defaultContextValue: NotificationContextType = {
    notificationCount: 0,
    incrementNotificationCount: () => 0,
};

const NotificationContext = createContext<NotificationContextType >(defaultContextValue);

export const NotificationProvider: React.FC = ({ children }) => {
    const [notificationCount, setNotificationCount] = useState(0);

    const incrementNotificationCount = useCallback((callback?: (newCount: number) => void) => {
        setNotificationCount(prevCount => {
            const newCount = prevCount + 1;
            if (callback) {
                callback(newCount);
            }
            return newCount;
        });
    }, []);

    const value = {
        notificationCount,
        incrementNotificationCount,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
