"use client";
import React, { useEffect, useState } from "react";
import Listing from "./Listing";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import { toast } from "sonner";
import GoogleMapSection from "./GoogleMapSection";
import Modal from "../modal/modal";

function ListingMapView({ type }) {
  const [listing, setListing] = useState([]);
  const [searchedAddress, setSearchedAddress] = useState();
  const [condition, setCondition] = useState();
  const [material, setMaterial] = useState();
  const [vehicleType, setVehicleType] = useState();
  const [coordinates,setCoordinates] =useState();

  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    getLatestListing();
  }, []);

  const getLatestListing = async () => {
    const { data, error } = await supabase
      .from("addBike")
      .select(
        `*,addBikeImages(
            url,
            addBike_id            
            )`
      )
    //  .eq("active", true)
      .eq("type", type)
      .order("id", { ascending: false });

    if (data) {
      setListing(data);
    }
    if (error) {
      toast("Server Side Error");
    }
  };

  const handleSearchClick = async () => {
    const searchTerm = searchedAddress?.value?.structured_formatting?.main_text;
    let query = supabase
      .from("addBike")
      .select(
        `*,addBikeImages(
            url,
            addBike_id            
            )`
      )
      .eq("active", true)
      .eq("type", type)
      .like("address", "%" + searchTerm + "%")
      .order("id", { ascending: false });

    if (vehicleType) {
      query = query.eq("vehicleType", vehicleType);
    }

    const { data, error } = await query;

    if (data) {
      setListing(data);
    }
  };

  return (
    <div>
       <div className="flex fixed bottom-6 right-10 z-50 items-center">
        <Modal/>
        </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <Listing listing={listing}
          handleSearchClick={handleSearchClick}
          searchedAddress={(v) => setSearchedAddress(v)}
          setVehicleType={setVehicleType}
          setCoordinates={setCoordinates}
        />
      </div>
      <div className="fixed right-10 h-full md:w-[350px] lg:w-[450px] xl:w-[700px] ">
        <GoogleMapSection 
        listing={listing}
       coordinates={coordinates}
        />
      </div>
    </div>
     </div>
  );
}

export default ListingMapView;
