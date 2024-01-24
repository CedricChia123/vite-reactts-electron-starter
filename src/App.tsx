import React, { useEffect, useState } from 'react';
import AppBar from './AppBar';
import { Button } from "@/components/ui/button"

function App() {
  console.log(window.ipcRenderer);

  const [isOpen, setOpen] = useState(false);
  const [isSent, setSent] = useState(false);
  const [fromMain, setFromMain] = useState<string | null>(null);

  const handleToggle = () => {
    if (isOpen) {
      setOpen(false);
      setSent(false);
    } else {
      setOpen(true);
      setFromMain(null);
    }
  };
  const sendMessageToElectron = () => {
    if (window.Main) {
      window.Main.sendMessage("Hello Bitbit");
      setSent(true);
  
      // Trigger file download
      const scriptPath = '/src/assets/scripts/testscript.ps1';
      window.Main.execScript(scriptPath);
    } else {
      setFromMain('You are in a Browser, so no Electron functions are available');
    }
  };

  const handleNavigate = () => {
    const targetURL = 'http://localhost:8080/#/';
    
    window.Main.navigate(targetURL);
  };

  useEffect(() => {
    if (isSent && window.Main)
      window.Main.on('message', (message: string) => {
        setFromMain(message);
      });
  }, [fromMain, isSent]);

  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col h-screen">
      {/* <div className="flex-none">
          <AppBar />
      </div> */}
      <div className="flex-auto">
        <div className=" flex flex-col justify-center items-center h-full bg-yellow-50 space-y-4">
          <Button onClick={handleNavigate}>Navigate</Button>
          <Button onClick={handleToggle}>Button</Button>
          {isOpen && (
            <div className="flex flex-col space-y-4 items-center">
              <div className="flex space-x-3">
                <Button variant="destructive"
                  onClick={sendMessageToElectron}
                >
                  Reconnect Wifi
                </Button>
              </div>
              {isSent && (
                <div>
                  <h4 className=" text-green-500">Script ran</h4>
                </div>
              )}
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
