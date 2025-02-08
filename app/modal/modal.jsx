import React, { useState } from "react";
import {
  CircleChevronUp,
  X,
  ClipboardPlus,
  BookOpen,
  ChevronUp,
  FileWarning,
  MessageCircleWarning,
  MapPinned,
} from "lucide-react";
import Link from "next/link";

function Button({ children, className, ...props }) {
  return (
    <button className={`px-4 py-2 rounded ${className}`} {...props}>
      {children}
    </button>
  );
}

function Modal() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const toggleFAB = () => {
    setIsExpanded(!isExpanded);
  };

  const handleShowRules = () => {
    setShowRules(true);
    setIsExpanded(false);
  };

  const handleCloseRules = () => {
    setShowRules(false);
  };

  return (
    <div className="fixed bottom-6 right-10 z-50">
      <button
        onClick={toggleFAB}
        className={`flex items-center justify-center shadow-lg rounded-full bg-primary text-white transition-all duration-300 ${
          isExpanded ? "w-12 h-12" : "w-14 h-14"
        }`}
      >
        {isExpanded ? <X className="h-6 w-6 " /> : <ChevronUp className="h-6 w-6" />}
      </button>

      {isExpanded && (
        <div className="absolute bottom-12 right-0 flex flex-col items-end gap-4">
          <button
            onClick={handleShowRules}
            className="flex items-center gap-2 p-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all"
          >
            <BookOpen className="h-10 w-10 text-primary" />
            <span className="text-sm font-medium">Guidelines</span>
          </button>
          <Link
            href="/file-report"
            className="flex items-center gap-2 p-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all"
          >
            <ClipboardPlus className="h-10 w-10 text-primary" />
            <span className="text-sm font-medium">Report Issue</span>
          </Link>
          <Link 
             href="/RentDashboard"
             className="flex items-center gap-2 p-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all"
          >
          <MapPinned className="h-10 w-10 text-primary" />
          <span className="text-sm font-medium">Return Bike</span>
          </Link>
        </div>
      )}

      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-4/5 h-4/5 overflow-y-auto relative">
            <button
              onClick={handleCloseRules}
              className="flex fixed right-10 top-10 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
            <h2 className="text-3xl font-bold mb-4">
              CSU Rent-A-Bike Guide
            </h2>
            <ul className="list-disc pl-7">
              <li>
                Ride at a speed that allows you to react quickly to unexpected
                situations.
              </li>
              <li>
                Keep an eye on your surroundings and watch out for obstacles,
                vehicles, and pedestrians.
              </li>
              <li>Park bikes in designated areas only.</li>
              <li>
                Do not overload the bike; only one person should ride a bike.
              </li>
              <li>Report any damages or issues promptly.</li>
              <li>Return the bike on time to avoid penalties.</li>
              <li>
                Don’t ride a bike with malfunctioning brakes, loose chains, or
                other mechanical issues.
              </li>
              <li>Keep the bike clean and in good condition.</li>
              <li>Do not leave your belongings unattended, as the campus is not responsible for lost or stolen items</li>
            </ul>




          <div className="mt-10">
            <h3 className="text-2xl font-bold mb-4">
              Rental System
            </h3>
            <ul className="list-disc pl-7">
              <li>
                Your account can rent more than one bicycle at a time.
              </li>
              <li>
                The minimum rental time is 1 hour for 10 pesos.
              </li>
              <li>If the time limit is exceeded, an addtional fee will be recorded to your account to pay.</li>
            </ul>
          </div>
          <h3 className="flex text-2xl text-red-500  mt-2 justify-center">
                <MessageCircleWarning className="h-8 w-10"/> NOTE - Regularly check your rental dashboard for your remaining time!
          </h3>
        </div>
        </div>
      )}
    </div>
  );
}

export default Modal;
