"use client";
import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast, Toaster } from "sonner";

function AddNewBikes() {
  const predefinedLocations = [
    { label: "Main Gate", value: "main-gate", coordinates: { lat: 8.95742, lng: 125.59735 } },
    { label: "Green Gate", value: "green-gate", coordinates: { lat: 8.95702, lng: 125.59802 } },
    { label: "Kinaadman Lot", value: "kinaadman-lot", coordinates: { lat: 8.95623, lng: 125.59752 } },
    { label: "Villares Lot", value: "villares-lot", coordinates: { lat: 8.95329, lng: 125.59752 } }, 
    { label: "Hiradya Lot", value: "hiradya-lot", coordinates: { lat: 8.95445, lng: 125.59768 } },
    { label: "CSU Main Gymnasium", value: "csu-gym", coordinates: { lat: 8.95584, lng: 125.595828 } },
  ];

  const [selectedLocation, setSelectedLocation] = useState(null);
  const { user } = useUser();
  const [loader, setLoader] = useState(false);
  const router = useRouter();

  const nextHandler = async () => {
    setLoader(true);

    const { data, error } = await supabase
      .from("addBike")
      .insert([
        {
          address: selectedLocation.label,
          coordinates: selectedLocation.coordinates,
          createdBy: user?.primaryEmailAddress.emailAddress,
        },
      ])
      .select();

    setLoader(false);

    if (data) {
      console.log("New Data added,", data);
      toast("New address added for rent");
      router.replace(`/edit-bike/${data[0].id}`);
    }

    if (error) {
      console.log("Error", error);
      toast("Server side error");
    }
  };

  return (
    <div className="mt-10 md:mx-56 lg:mx-80">
      <div className="p-10 flex flex-col gap-5 items-center justify-center">
        <h2 className="font-bold text-3xl">Add New Bikes</h2>
        <div className="p-10 rounded-lg border w-full shadow-md flex flex-col gap-5">
          <h2 className="text-gray-500 text-lg">Select the bike location</h2>
          <select
            className="p-2 border rounded-lg"
            value={selectedLocation?.value || ""}
            onChange={(e) => {
              const location = predefinedLocations.find(
                (loc) => loc.value === e.target.value
              );
              setSelectedLocation(location);
            }}
          >
            <option value="" disabled>
              -- Select a Location --
            </option>
            {predefinedLocations.map((location) => (
              <option key={location.value} value={location.value}>
                {location.label}
              </option>
            ))}
          </select>
          <Button
            disabled={!selectedLocation || loader}
            onClick={nextHandler}
          >
            {loader ? <Loader className="animate-spin" /> : "Next"}
          </Button>
          <Toaster />
        </div>
      </div>
    </div>
  );
}

export default AddNewBikes;
