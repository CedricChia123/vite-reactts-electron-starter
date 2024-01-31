import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Progress } from '@/components/ui/progress';
import { SelectScript } from './components/SelectScript';
import NotificationContext from './context/NotificationContext';

function App() {
  console.log(window.ipcRenderer);

  const [isOpen, setOpen] = useState(false);
  const [isSent, setSent] = useState(false);
  const [fromMain, setFromMain] = useState<string | null>(null);
  const [loading, setLoading] = useState(0);
  const [selectedScript, setSelectedScript] = useState<string>('');
  const { notificationCount, incrementNotificationCount } = useContext(NotificationContext);
  const [result, setResult] = useState('');

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

  const sendMessageToElectron = (scriptName: string) => {
    if (window.Main) {
      window.Main.sendMessage("Received");
      setSent(true);
  
      // Trigger file download
      const scriptPath = `/src/assets/scripts/${scriptName}.ps1`;
      setLoading(1);
      window.Main.execScript(scriptPath);
    } else {
      setFromMain('You are in a Browser, so no Electron functions are available');
    }
  };

  const handleNavigate = () => {
    const targetURL = 'https://d3059pba9o3da7.cloudfront.net/#/';

    console.log('here')
    
    window.Main.navigate(targetURL);
  };


  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications');
      const newNotification = response.data;
  
      if (newNotification) {
        incrementNotificationCount((newCount) => {
          const { title, body } = newNotification;
          window.Main.sendMessage(newCount.toString());
          window.Main.sendNotification(title, body, newCount);
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Polling for new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isSent && window.Main)
      window.Main.on('message', (message: string) => {
        setFromMain(message);
      });
  }, [fromMain, isSent]);

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
    if (window.Main) {
      window.Main.on('scriptCompleted', (stdout) => {
        setLoading(100);
        setResult(stdout); 
      });
    }
  }, []);

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
  
  
  return (
    <div className="flex flex-col h-screen">
      {/* <div className="flex-none">
          <AppBar />
      </div> */}
      <div className="flex-auto">
        <div className=" flex flex-col justify-center items-center h-full bg-yellow-50 space-y-4">
          <Button onClick={handleNavigate}>ALCA page</Button>
          <Button onClick={handleToggle}>Scripts</Button>
          {isOpen && (
            <div className="flex flex-col space-y-4 items-center">
              <div className="flex space-x-3">
                <SelectScript onScriptSelect={handleScriptSelect}/>
                <Button variant="destructive"
                  onClick={() => sendMessageToElectron(selectedScript)}
                >
                  Test script
                </Button>
              </div>
              <Progress value={loading} className="w-72"/>
              {result && (
              <div>
                <h4 className="text-green-500">Script ran</h4>
                <div className="result-output">
                  <h4>Script Output:</h4>
                  <pre>{result}</pre>
                </div>
              </div>)}
              {fromMain && (
                <div>
                  {' '}
                  <h4 className=" text-red-500">{fromMain}</h4>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
