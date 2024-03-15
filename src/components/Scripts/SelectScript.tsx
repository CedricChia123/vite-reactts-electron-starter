import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface SelectScriptProps {
  onScriptSelect: (script: string) => void;
}

export const SelectScript: React.FC<SelectScriptProps> = ({ onScriptSelect }) => {
  const handleSelectChange = (selectedValue: string) => {
    onScriptSelect(selectedValue);
  };

  const items = [
    { value: 'CheckVersion', label: 'Check Version' },
    { value: 'CleanSystemPrefetch', label: 'Clean System Prefetch' },
    { value: 'ClearChromeCookiesAndHistory', label: 'Clear Chrome Cookies And History' },
    { value: 'ClearDNSCache', label: 'Clear DNS Cache' },
    { value: 'ClearEdgeCookies', label: 'Clear Edge Cookies' },
    { value: 'ClearEdgeHistory', label: 'Clear Edge History' },
    { value: 'ClearEdgeURL', label: 'Clear Edge URL' },
    { value: 'ClearRecentlyUsedDocument', label: 'Clear Recently Used Document' },
    { value: 'ClearTempInternetFiles', label: 'Clear Temp Internet Files' },
    { value: 'DiskStorageSpace', label: 'Disk Storage Space' },
    { value: 'EnableFirewall', label: 'Enable Firewall' },
    { value: 'FoldersPane', label: 'Folders Pane' },
    { value: 'FreeStorageSpace', label: 'Free Storage Space' },
    { value: 'HTTPSdiagnosis', label: 'HTTPS Diagnosis' },
    { value: 'IPaddress', label: 'IP Address' },
    { value: 'NetworkStrength', label: 'Network Strength' },
    { value: 'reconnectWifi', label: 'Reconnect Wifi' },
    { value: 'RemoveTempFilesAll', label: 'Remove Temp Files All' },
    { value: 'RemoveTempFilesUser', label: 'Remove Temp Files User' },
    { value: 'ResetInternetSettings', label: 'Reset Internet Settings' },
    { value: 'RestartOutlook', label: 'Restart Outlook' },
    { value: 'RestartSystem', label: 'Restart System' },
    { value: 'RoutingAndRemoteAccess', label: 'Routing And Remote Access' },
    { value: 'RoutingAndRemoteAccessDisable', label: 'Routing And Remote Access Disable' },
    { value: 'RoutingAndRemoteAccessEnable', label: 'Routing And Remote Access Enable' }
  ];

  return (
    <Select onValueChange={handleSelectChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a script" />
      </SelectTrigger>
      <SelectContent className="max-h-[200px] overflow-y-auto">
        <SelectGroup>
          <SelectLabel>Scripts</SelectLabel>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
