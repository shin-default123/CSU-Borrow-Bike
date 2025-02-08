"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

function RentBikeModal() {
  const [showModal, setShowModal] = useState(false);
  const { isSignedIn } = useUser();

  // Trigger modal on login
  useEffect(() => {
    if (isSignedIn) {
      setShowModal(true);
    }
  }, [isSignedIn]);

  const handleCloseRules = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-4/5 h-4/5 overflow-y-auto relative">
        <button
          onClick={handleCloseRules}
          className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>
        <h2 className="text-3xl font-bold mb-4">CSU Rent-A-Bike Guide</h2>
        <ul className="list-disc pl-7">
          <li>Ride at a speed that allows you to react quickly to unexpected situations.</li>
          <li>Keep an eye on your surroundings and watch out for obstacles, vehicles, and pedestrians.</li>
          <li>Park bikes in designated areas only.</li>
          <li>Do not overload the bike; only one person should ride a bike.</li>
          <li>Report any damages or issues promptly.</li>
          <li>Return the bike on time to avoid penalties.</li>
          <li>Don’t ride a bike with malfunctioning brakes, loose chains, or other mechanical issues.</li>
          <li>Keep the bike clean and in good condition.</li>
          <li>Do not leave your belongings unattended, as the campus is not responsible for lost or stolen items</li>
        </ul>

        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-4">Rental System</h3>
          <ul className="list-disc pl-7">
            <li>Your account can rent more than one bicycle at a time.</li>
            <li>The minimum rental time is 1 hour for 10 pesos.</li>
            <li>If the time limit is exceeded, an additional fee will be recorded to your account to pay.</li>
          </ul>
        </div>

        <h3 className="flex text-2xl text-red-500 mt-2 justify-center">
          <span className="h-8 w-10">&#9888;</span> NOTE - Regularly check your rental dashboard for your remaining time!
        </h3>
      </div>
    </div>
  );
}

export default RentBikeModal;
