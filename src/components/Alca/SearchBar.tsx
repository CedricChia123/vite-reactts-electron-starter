import React, { useState } from "react";
import axios from 'axios'; // Make sure to import Axios
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
    const [input, setInput] = useState("");
    const [responses, setResponses] = useState([]);

    const handleSearch = async () => {
      try {
        // Use Axios for the POST request
        const response = await axios.post("http://localhost:5000/api/message", {
          message: input,
        });
        // Axios automatically parses the JSON, so you can directly access `data`
        setResponses(response.data);
      } catch (error) {
        console.error("There was a problem with the Axios operation:", error);
      }
    };

  return (
    <div className="flex flex-col items-center space-x-2">
      <div className="relative mb-2">
        <Input
          type="text"
          className="px-3 py-2 w-80"
          placeholder="Search..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          className="absolute top-1/2 right-2 transform -translate-y-1/2"
          style={{ padding: "8px" }}
          onClick={handleSearch}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </Button>
      </div>
      <div>
        {responses.map((response: any, index) => (
          <div key={index}>{response.text}</div>
        ))}
      </div>
    </div>
  );
}
