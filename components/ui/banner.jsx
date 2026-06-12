import { Bot } from "lucide-react";
import React from "react";

const Announcement = () => {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-2  text-white md:px-8">
        <div className="flex justify-center items-center gap-x-4">
          <div className="w-7 h-7 flex-none rounded-lg bg-cyan-300/50 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <p className="py-2 font-medium text-xs">
         From idea to publication, our AI tools help you research smarter and publish faster.{"  "}  
            <a
              href="/ai"
              className="font-semibold text-xs ml-2 underline underline-offset-3 tracking-wider duration-150 hover:text-indigo-100"
            >
               TRY NOW
            </a>
          </p>
        </div>
      
      </div>
    </div>
  );
};

export default Announcement;
