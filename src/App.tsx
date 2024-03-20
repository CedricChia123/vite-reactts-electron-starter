import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SelectScript } from './components/Scripts/SelectScript';
import NotificationContext from './context/NotificationContext';
import Notifications from './components/Notifications/Notifications';
import NotificationsForm from './components/Notifications/NotificationsForm';
import SearchBar from './components/Alca/SearchBar';
import io from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

function App() {
  console.log(window.ipcRenderer);
  const queryClient = useQueryClient();

  const [isOpen, setOpen] = useState(false);
  const [isOpenNotifs, setOpenNotifs] = useState(false);
  const [isSent, setSent] = useState(false);
  const [fromMain, setFromMain] = useState<string | null>(null);
  const [loading, setLoading] = useState(0);
  const [selectedScript, setSelectedScript] = useState<string>('');
  const { notificationCount, incrementNotificationCount } = useContext(NotificationContext);
  const [result, setResult] = useState('');
  const [isPushNotificationsEnabled, setIsPushNotificationsEnabled] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  // Listen for changes in main desktop
  useEffect(() => {
    if (isSent && window.Main)
      window.Main.on('message', (message: string) => {
        setFromMain(message);
      });
  }, [fromMain, isSent]);

  const handleScriptSelect = (script: string) => {
    setSelectedScript(script);
  };

  const handleToggle = () => {
    if (isOpen) {
      setOpen(false);
      setSent(false);
    } else {
      setOpen(true);
      setFromMain(null);
    }
  };

  const handleToggleNotifications = () => {
    if (isOpenNotifs) {
      setOpenNotifs(false);
    } else {
      setOpenNotifs(true);
    }
  };

  // Run scripts logic
  const runScript = (scriptName: string) => {
    if (window.Main) {
      window.Main.sendMessage('Received');
      setSent(true);

      // Disable the button
      setButtonDisabled(true);

      // Re-enable the button after 10 seconds
      setTimeout(() => setButtonDisabled(false), 10000);

      // Trigger file download
      const scriptPath = `/src/assets/scripts/${scriptName}`;
      setLoading(1);
      window.Main.execScript(scriptPath);
    } else {
      setFromMain('You are in a Browser, so no Electron functions are available');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (loading > 0 && loading < 100) {
      interval = setInterval(() => {
        setLoading((prevLoading) => {
          const nextLoading = prevLoading + 5;
          return nextLoading >= 95 ? 95 : nextLoading;
        });
      }, 200);
    }

    if (loading === 100) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (window.Main) {
      window.Main.on('scriptCompleted', (stdout) => {
        setLoading(100);
        setResult(stdout);
        console.log(stdout);
      });
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isSent) {
      timer = setTimeout(() => {
        setSent(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSent]);

  useEffect(() => {
    // Connect to the Flask-SocketIO server
    const socket = io('http://dev-super-app-env.eba-gbce2swp.ap-southeast-1.elasticbeanstalk.com');

    socket.on('connect', () => {
      console.log('Connected to Flask-SocketIO server');
    });

    // Listen for 'new_notification' events from the server
    socket.on('new_notification', (data: any) => {
      window.Main.sendMessage(data);
      incrementNotificationCount((newCount) => {
        const { title, body, date } = data.message; // Assuming the message is JSON stringified
        window.Main.sendMessage(newCount.toString());
        window.Main.sendNotification(title, newCount, isPushNotificationsEnabled);
        // Here, you can update your state or context with the new notification details as needed
        queryClient.invalidateQueries({
          queryKey: ['notificationsList']
        });
      });
    });

    return () => {
      socket.off('connect');
      socket.off('new_notification');
      socket.close();
    };
  }, [incrementNotificationCount, isPushNotificationsEnabled, queryClient]);

  // Handle Alca Logic
  const handleNavigate = () => {
    const targetURL = 'https://d3059pba9o3da7.cloudfront.net/#/';
    window.Main.navigate(targetURL);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-[398px] bg-yellow-50 overflow-auto md:h-screen">
        <Notifications isPushEnabled={isPushNotificationsEnabled} onPushChange={setIsPushNotificationsEnabled} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-auto flex justify-center items-center bg-yellow-50 overflow-hidden">
          <div className="flex flex-col items-center space-y-4 overflow-auto p-4">
            <Button onClick={handleToggle}>Scripts</Button>
            {isOpen && (
              <div className="flex flex-col space-y-4 items-center mt-4 overflow-hidden">
                <div className="flex space-x-3">
                  <SelectScript onScriptSelect={handleScriptSelect} />
                  <Button onClick={() => runScript(selectedScript)} disabled={isButtonDisabled}>
                    Test script
                  </Button>
                </div>
                <Progress value={loading} className="w-72" />
                {result && (
                  <div className="overflow-auto max-h-[50vh] max-w-[30]">
                    <h4 className="text-green-500">Script ran</h4>
                    <div className="result-output">
                      <h4>Script Output:</h4>
                      <pre
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'keep-all'
                        }}
                      >
                        {result}
                      </pre>
                    </div>
                  </div>
                )}
                {fromMain && (
                  <div className="overflow-auto max-h-[50vh]">
                    <h4 className="text-red-500">{fromMain}</h4>
                  </div>
                )}
              </div>
            )}
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
