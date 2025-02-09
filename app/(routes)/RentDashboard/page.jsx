"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Info } from "lucide-react";

function TimeDashboard({ params }) {
  const overdueRate = 0.5;
  const [bikeDetails, setBikeDetails] = useState({});

  const predefinedLocations = [
    { label: "Main Gate", value: "main-gate", coordinates: { lat: 8.95742, lng: 125.59735 } },
    { label: "Green Gate", value: "green-gate", coordinates: { lat: 8.95702, lng: 125.59802 } },
 //   { label: "Kinaadman Lot", value: "kinaadman-lot", coordinates: { lat: 8.95623, lng: 125.59752 } },
  //  { label: "Villares Lot", value: "villares-lot", coordinates: { lat: 8.95329, lng: 125.59752 } },
   // { label: "Hiradya Lot", value: "hiradya-lot", coordinates: { lat: 8.95445, lng: 125.59768 } },
  ];

  const [rentalData, setRentalData] = useState({});
  const [remainingTime, setRemainingTime] = useState({});
  const [overdueFees, setOverdueFees] = useState({});
  const [rackLocation, setRackLocation] = useState({});
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState({});
  const { user } = useUser();

  const formatTime = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };


  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("rentalData")) || {};
    setRentalData(data);
  }, []);
{/*
    const interval = setInterval(() => {
      const updatedFees = {};
      const now = new Date();

      for (const bikeId in data) {
        const rentalEndTime = new Date(data[bikeId]);
        const overdueTime = now - rentalEndTime;

        if (overdueTime > 0) {
          const overdueHours = Math.ceil(overdueTime / (1000 * 60 * 60));
          updatedFees[bikeId] = overdueRate * overdueHours;
        }
      } 

      setOverdueFees(updatedFees);
    }, 1000);

    return () => clearInterval(interval);
  }, []);*/}

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("rentalData")) || {};
    setRentalData(data);

    const fetchBikeDetails = async () => {
      const { data: bikes, error } = await supabase
        .from("addBike")
        .select("id, gears");
      
      if (error) {
        console.error("Error fetching bike details:", error);
      } else {
        const bikeMap = {};
        bikes.forEach((bike) => {
          bikeMap[bike.id] = bike;
        });
        setBikeDetails(bikeMap);
      }
    };

    fetchBikeDetails();
  }, []);


  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const updatedTimes = {};
      const updatedFees = {};

      for (const bikeId in rentalData) {
        const rentalEndTime = new Date(rentalData[bikeId]);
        const remaining = rentalEndTime - now;
        const overdueTime = now - rentalEndTime;

        updatedTimes[bikeId] = remaining;

        if (overdueTime > 0) {
          const overdueMinutes = Math.ceil(overdueTime / (1000 * 60 * 60));
          updatedFees[bikeId] = overdueRate * overdueMinutes;
        }

        if (remaining <= 0) {
          const overdueMinutes = Math.ceil(Math.abs(remaining) / (1000 * 60 * 60));
          updatedFees[bikeId] = overdueRate * overdueMinutes;
        }
      }

      setRemainingTime(updatedTimes);
      setOverdueFees(updatedFees);
    };

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [rentalData]);


  useEffect(() => {
    const channel = supabase
      .channel("table-change")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "addBike" },
        (payload) => {
          const updatedRow = payload.new;

          if (updatedRow.active) {
            // Clear the relevant transaction
            const updatedRentalData = { ...rentalData };
            delete updatedRentalData[updatedRow.id];
            setRentalData(updatedRentalData);
            localStorage.setItem("rentalData", JSON.stringify(updatedRentalData));

            const updatedFees = { ...overdueFees };
            delete updatedFees[updatedRow.id];
            setOverdueFees(updatedFees);

            toast.success(`Bike ID: ${updatedRow.id} has been activated and cleared.`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rentalData, overdueFees]);

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleRackLocationChange = (bikeId, value) => {
    const location = predefinedLocations.find((loc) => loc.value === value);
    setRackLocation((prev) => ({ ...prev, [bikeId]: location }));
  };

  const submitReturnPhoto = async (bikeId) => {
    if (!photo) {
      toast.error("Please upload a photo of the returned bike.");
      return;
    }

    if (!rackLocation[bikeId]) {
      toast.error("Please select a rack location.");
      return;
    }

    setLoading((prev) => ({ ...prev, [bikeId]: true }));

    try {
      const fileName = `${Date.now()}-${photo.name}`;
      const fileExt = photo.name.split(".").pop();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("bikeRentalPhotos")
        .upload(fileName, photo, {
          contentType: `image/${fileExt}`,
        });

      if (uploadError) {
        throw new Error("Failed to upload the image. Please try again.");
      }

      const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}${fileName}`;
      const { error: dbError } = await supabase
        .from("bikeRentalPhotos")
        .insert([
          {
            url: imageUrl,
            rental_id: bikeId,
            fullName: user.fullName,
            email: user.primaryEmailAddress.emailAddress,
            profileImage: user?.imageUrl,
          },
        ]);

      if (dbError) {
        throw new Error("Failed to save the image URL. Please try again.");
      }

      const { error: updateRackError } = await supabase
        .from("addBike")
        .update({
          address: rackLocation[bikeId].label,
          coordinates: rackLocation[bikeId].coordinates,
          active: true,
        })
        .eq("id", bikeId);

      if (updateRackError) {
        throw new Error("Failed to update the rack location. Please try again.");
      }

      toast.success("Bike returned successfully!");

      const updatedRentalData = { ...rentalData };
      delete updatedRentalData[bikeId];
      setRentalData(updatedRentalData);
      localStorage.setItem("rentalData", JSON.stringify(updatedRentalData));

      const updatedFees = { ...overdueFees };
      delete updatedFees[bikeId];
      setOverdueFees(updatedFees);

      setPhoto(null);
      setRackLocation((prev) => {
        const { [bikeId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, [bikeId]: false }));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Rent Dashboard</h1>

      <div className="grid gap-5">
        {Object.keys(rentalData).length > 0 ? (
          Object.keys(rentalData).map((bikeId) => {
            const rentalEndTime = new Date(rentalData[bikeId]);
            const now = new Date();
            const remaining = rentalEndTime - now;
            const overdueTime = now - rentalEndTime;

            return (
              <div key={bikeId} className="p-5 border rounded-lg shadow-md">
                <p>
                  <strong>Remaining Time:</strong> {formatTime(remainingTime[bikeId])}
                </p>
                <p><strong>{bikeDetails[bikeId]?.gears || "Unknown"}</strong></p>
                {overdueTime > 0 && (
                  <p>
                    <strong>Overdue Fee:</strong> ₱{overdueFees[bikeId] || 0}
                    <h3 className="font-medium ">Pay with Gcash:  09274074495</h3>
                  </p>
                )}

                <div className="mt-4">
                  <h3>Returned to:</h3>
                  <Select
                    onValueChange={(value) =>
                      handleRackLocationChange(bikeId, value)
                    }
                    value={rackLocation[bikeId]?.value || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Rack Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedLocations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-2 relative group">
                    <strong>Submit proof of return</strong>
                    <span className="cursor-pointer text-gray-500">
                      <Info size={16} />
                    </span>
                    <div className="absolute left-0 mt-2 hidden w-52 bg-gray-800 text-white text-sm px-2 py-1 rounded-md group-hover:block">
                      Uploading a photo may take some time due to connectivity. Please wait
                    </div>
                  </div>

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  <Button
                    onClick={() => submitReturnPhoto(bikeId)}
                    className="mt-2"
                    disabled={loading[bikeId] || false}
                  >
                    {loading[bikeId] ? "Processing..." : "Upload Return Photo"}
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <p>No active rentals.</p>
        )}
      </div>

      <Toaster />
    </div>
  );
}

export default TimeDashboard;
