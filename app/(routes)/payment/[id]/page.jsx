"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/client";
import { Loader } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation"; // Ensure correct import

function Page({ params }) {
  const rentPrice = 15;
  const [timeRate, setTimeRate] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [name, setName] = useState("");
  const [gcashReference, setGcashReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null); 
  const [gears, setGears] = useState(null);
  const router = useRouter();

  const bikeId = params?.id;
  if (!bikeId) {
    toast.error("Bike ID is missing.");
    return;
  }

  useEffect(() => {
    const fetchBikeDetails = async () => {
      const { data, error } = await supabase
        .from("addBike")
        .select("gears")
        .eq("id", bikeId)
        .single();

      if (error) {
        toast.error("Failed to fetch bike details.");
        return;
      }

      setGears(data?.gears);
    };

    fetchBikeDetails();
  }, [bikeId]);

  const calculateTotalCost = () => {
    if (!timeRate || timeRate <= 0) {
      toast.error("Please enter a valid time rate.");
      return;
    }
    const calculatedCost = rentPrice * parseFloat(timeRate);
    setTotalCost(calculatedCost);
  };

  const publishBtnHandler = async () => {
    if (!name || !gcashReference) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (gcashReference.length !== 13 || !/^\d{13}$/.test(gcashReference)) {
      toast.error("GCash reference must be exactly 13 numeric characters.");
      return;
    }

    if (totalCost <= 0) {
      toast.error("Please calculate the total cost first.");
      return;
    }

    setLoading(true);

    try {
      const currentTime = new Date();
      const rentalEndTime = new Date(currentTime.getTime() + timeRate * 60 * 60 * 1000);

      const { error: bikeError } = await supabase
        .from("addBike")
        .update({ active: false, rental_start_time: currentTime, rental_end_time: rentalEndTime })
        .eq("id", bikeId);

      if (bikeError) {
        throw new Error("Failed to update bike status.");
      }

      const { error: paymentError } = await supabase
        .from("payment")
        .insert([
          {
            renter_name: name,
            gcash_reference: gcashReference,
            amount: totalCost,
          },
        ]);

      if (paymentError) {
        throw new Error("Failed to save payment details.");
      }

      toast.success("Payment Done! Rental Started!");
      startRentalTimer(rentalEndTime);

      const rentalData = JSON.parse(localStorage.getItem("rentalData")) || {};
      rentalData[bikeId] = rentalEndTime.toString();
      localStorage.setItem("rentalData", JSON.stringify(rentalData));

      router.push("/RentDashboard");
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startRentalTimer = (rentalEndTime) => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      const remainingTime = rentalEndTime - currentTime;

      if (remainingTime <= 0) {
        clearInterval(interval);
        setRemainingTime(0);
        endRental();
      } else {
        setRemainingTime(remainingTime);
      }
    }, 1000); 

    return () => clearInterval(interval);
  };

  const formatRemainingTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes} min ${seconds} sec`;
  };

  const endRental = async () => {
    try {
      const { error } = await supabase
        .from("addBike")
        .update({ active: true })
        .eq("id", bikeId);

      if (error) {
        throw new Error("Failed to end rental.");
      }

      const rentalData = JSON.parse(localStorage.getItem("rentalData")) || {};
      delete rentalData[bikeId];
      localStorage.setItem("rentalData", JSON.stringify(rentalData));

      toast.success("Rental period ended. Bike is now available.");
    } catch (error) {
      toast.error(error.message || "An error occurred while ending the rental.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold p-8">Bike Rent Details</h1>
      <div className="grid md:grid-cols-3 gap-5 px-4">

      <div className="p-10 border rounded-xl shadow-md mb-2">
        <h3 className="font-medium text-xl">Payment Method</h3>
        <div className="flex justify-center mt-4">
          <img src="/qrcode.jpeg" alt="QR Code" className="gap-5 w-60 h-50" />
        </div>
        <h3 className="flex justify-center font-medium text-l">09274074495</h3>
      </div>
        <div className="p-10 border rounded-xl shadow-md mb-2">
          <h3 className="font-medium text-xl">Time to Rent</h3>
          <h2 className="text-lg font-semibold">{gears !== null ? gears : "Loading..."}</h2>
          <div className="flex flex-col gap-5 mt-5">
            <div className="w-full">
              <label>Price ₱</label>
              <div className="p-2 border rounded-md">
                <span>₱{rentPrice}</span>
              </div>
            </div>
            <div className="w-full">
              <label>Time (hrs)</label>
              <Input
                type="number"
                value={timeRate}
                onChange={(e) => setTimeRate(e.target.value)}
                placeholder="Enter hours"
              />
            </div>
          </div>
          <Button className="w-full mt-5" size="lg" onClick={calculateTotalCost}>
            Calculate
          </Button>
        </div>

        <div className="p-10 border rounded-xl shadow-md mb-2">
          <h3 className="font-medium text-xl">Payment Information</h3>
          <div className="mt-5">
            <div className="mb-3">
              <label>Renter's Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan dela Cruz"
              />
            </div>
            <div className="mb-3">
              <label>GCASH Reference Number</label>
              <Input
                type="text"
                value={gcashReference}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,13}$/.test(value)) {
                    setGcashReference(value);
                  }
                }}
                placeholder="1001 543 610110"
              />
              {gcashReference.length > 0 && gcashReference.length !== 13 && (
                <p className="text-red-500 text-sm">Reference number must be exactly 13 digits.</p>
              )}
            </div>
            {totalCost > 0 && (
              <div className="mt-5">
                <h3 className="font-medium text-xl">Order Summary</h3>
                <hr />
                <p className="mt-2">
                  The Total Rent Cost: <span>₱{totalCost}</span>
                </p>
              </div>
            )}
          </div>
          <div className="flex mt-5 md:flex-col gap-5 justify-center">
            <Button className="text-primary border-primary" size="lg" variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button onClick={publishBtnHandler} className="confirm" size="lg">
              {loading ? <Loader className="animate-spin" /> : "Confirm & Pay"}
            </Button>
          </div>
          <Toaster />
        </div>
      </div>

      {/* Show remaining time if rental is in progress */}
      {remainingTime !== null && remainingTime > 0 && (
        <div className="text-center mt-5">
          <h3 className="font-medium text-xl">Time Remaining</h3>
          <p>{formatRemainingTime(remainingTime)}</p>
        </div>
      )}
    </div>
  );
}

export default Page;