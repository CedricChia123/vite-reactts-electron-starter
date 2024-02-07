import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectScriptProps {
  onScriptSelect: (script: string) => void;
}

export const SelectScript: React.FC<SelectScriptProps> = ({ onScriptSelect }) => {
  const handleSelectChange = (selectedValue: string) => {
    onScriptSelect(selectedValue);
  };

  const items = [
    { value: "ClearCache", label: "Clear Cache" },
    { value: "dummy", label: "Dummy" },
    { value: "reconnectWifi", label: "Reconnect Wifi" },
    { value: "sample", label: "Sample" },
    { value: "Scanner", label: "Scanner" },
    { value: "ScannerV2", label: "Scanner V2" },
    { value: "tempCodeRunnerFile", label: "Temp Code Runner File" },
    { value: "testing", label: "Testing 1" },
    { value: "testing2", label: "Testing 2" }
  ]; 

  return (
    <Select onValueChange={handleSelectChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a script" />
      </SelectTrigger>
      <SelectContent className="max-h-[200px] overflow-y-auto">
        <SelectGroup>
          <SelectLabel>Scripts</SelectLabel>
          {items.map(item => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
