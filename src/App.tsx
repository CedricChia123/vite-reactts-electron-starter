import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Progress } from '@/components/ui/progress';
import { SelectScript } from './components/Scripts/SelectScript';
import NotificationContext from './context/NotificationContext';
import Notifications from './components/Notifications/Notifications';
import NotificationsForm from './components/Notifications/NotificationsForm';
import SearchBar from './components/Alca/SearchBar';

function App() {
  console.log(window.ipcRenderer);

  const [isOpen, setOpen] = useState(false);
  const [isOpenNotifs, setOpenNotifs] = useState(false);
  const [isSent, setSent] = useState(false);
  const [fromMain, setFromMain] = useState<string | null>(null);
  const [loading, setLoading] = useState(0);
  const [selectedScript, setSelectedScript] = useState<string>('');
  const { notificationCount, incrementNotificationCount } = useContext(NotificationContext);
  const [result, setResult] = useState('');
  const [isPushNotificationsEnabled, setIsPushNotificationsEnabled] = useState(false);

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
      window.Main.sendMessage("Received");
      setSent(true);
  
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

  // Short polling for notifications
  const fetchNotifications = async () => {
    try {      
      const response = await axios.get('http://localhost:5000/api/notifications');
      const newNotification = response.data;

      if (newNotification) {
        incrementNotificationCount((newCount) => {
          const { title, body, date } = newNotification;
          window.Main.sendMessage(newCount.toString());
          window.Main.sendNotification(title, body, newCount, isPushNotificationsEnabled);
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 6000); 
    return () => clearInterval(interval);
  }, [isPushNotificationsEnabled, Notifications]);

  // Handle Alca Logic
  const handleNavigate = () => {
    const targetURL = 'https://d3059pba9o3da7.cloudfront.net/#/';
    window.Main.navigate(targetURL);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Notifications to the left */}
      <div className="w-full md:w-[398px] bg-yellow-50 overflow-auto">
        <Notifications isPushEnabled={isPushNotificationsEnabled} onPushChange={setIsPushNotificationsEnabled} />
      </div>
  
      {/* Main content to the right */}
      <div className="flex-1 flex flex-col">
        <div className="flex-auto flex justify-center items-center bg-yellow-50">
          <div className="flex flex-col items-center space-y-4 mt-64"> 
            {/* <Button onClick={handleNavigate}>ALCA page</Button> */}
            <Button onClick={handleToggle}>Scripts</Button>
          {isOpen && (
            <div className="flex flex-col space-y-4 items-center mt-4"> 
              <div className="flex space-x-3 mt-8">
                <SelectScript onScriptSelect={handleScriptSelect} />
                <Button onClick={() => runScript(selectedScript)}>
                  Test script
                </Button>
              </div>
              <Progress value={loading} className="w-72" />
              {result && (
                <div>
                  <h4 className="text-green-500">Script ran</h4>
                  <div className="result-output">
                    <h4>Script Output:</h4>
                    <pre>{result}</pre>
                  </div>
                </div>
              )}
              {fromMain && (
                <div>
                  <h4 className="text-red-500">{fromMain}</h4>
                </div>
              )}
            </div>
          )}
          <Button onClick={handleToggleNotifications}>Notifications Console</Button>
          {isOpenNotifs && (<NotificationsForm/>)}
          <SearchBar/>
          </div>
        </div>
      </div>
    </div>
  );
  
}

export default App;
