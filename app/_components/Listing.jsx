import { BikeIcon, MapPin, Search, LayoutList } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import GoogleAddressSearch from "./GoogleAddressSearch";
import { Button } from "@/components/ui/button";
import FilterSection from "./FilterSection";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import GoogleMapSection from "./GoogleMapSection";

function Listing({
  listing,
  handleSearchClick,
  searchedAddress,
  setVehicleType,
  setCoordinates,
}) {
  const [address, setAddress] = useState();
  const [remainingTimes, setRemainingTimes] = useState({});
  const [viewMode, setViewMode] = useState("listing"); 

  useEffect(() => {
    const fetchBikeAvailability = async () => {
      const { data: bikes, error } = await supabase
        .from("addBike")
        .select("id, active, rental_start_time, rental_end_time");

      if (error) {
        console.error("Error fetching bike availability:", error);
        return;
      }

      const updatedTimes = {};
      bikes.forEach((bike) => {
        if (!bike.active) {
          const rentalEndTime = new Date(bike.rental_end_time);
          const currentTime = new Date();
          const remainingTime = rentalEndTime - currentTime;

          if (remainingTime > 0) {
            const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
            updatedTimes[bike.id] = `${hours}h:${minutes}m left`;
          } else {
            updatedTimes[bike.id] = "Currently Rented";
          }
        }
      });

      setRemainingTimes(updatedTimes);
    };

    fetchBikeAvailability();
    const interval = setInterval(fetchBikeAvailability, 1000);
    return () => clearInterval(interval);
  }, [listing]);

    //For small dimension to larger dimensions
        useEffect(() => {
          const handleResize = () => {
            if (window.innerWidth >= 768) { 
              setViewMode("listing");
            }
          };

          window.addEventListener("resize", handleResize);
          handleResize(); 

          return () => window.removeEventListener("resize", handleResize);
        }, []);

  return (
    <div>
      {viewMode === "listing" && (
        <>
          <div className="p-3 flex gap-6">
            <GoogleAddressSearch
              selectedAddress={(v) => {
                searchedAddress(v);
                setAddress(v);
              }}
              setCoordinates={setCoordinates}
            />
            <Button className="flex gap-2" onClick={handleSearchClick}>
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
          <div className="flex">
            <FilterSection setVehicleType={setVehicleType} />
            {/* View Mode Switcher for Mobile */}
            <div className="flex md:hidden  px-1 py-4">
            <LayoutList className="h-10 w-10 p-3 rounded-l-lg text-primary bg-green-100" />

              <select
                className="w-[120px] p-2 border rounded  bg-white"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <option value="listing">Listing</option>
                <option value="map">Map</option>
              </select>
            </div>
          </div>

          {address && (
            <div className="px-3 my-10">
              <h2 className="text-xl">
                Found <span className="font-bold">{listing?.length}</span>{" "}
                Result(s) in{" "}
                <span className="text-primary font-bold">{address?.label}</span>
              </h2>
            </div>
          )}

          {/* Bike Listing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {listing?.length > 0
              ? listing.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 hover:border hover:border-primary cursor-pointer rounded-lg"
                  >
                    <h2
                      className={`rounded-lg text-white absolute px-2 text-sm m-1 ${
                        item.active ? "bg-primary" : "bg-gray-400"
                      }`}
                    >
                      {item.active
                        ? "Available"
                        : remainingTimes[item.id] || "Not Available"}
                    </h2>
                    <Image
                      src={item.addBikeImages[0]?.url}
                      width={800}
                      height={150}
                      className="rounded-lg object-cover h-[170px]"
                      alt="Bike Image"
                    />

                    <div className="flex mt-2 flex-col gap-2">
                      <h2 className="font-bold text-xl">{item.gears}</h2>
                      <h2 className="flex gap-2 text-sm text-gray-400">
                        <MapPin className="h-4 w-4" /> {item?.address}
                      </h2>

                      <div className="flex gap-2 mt-2 justify-between">
                        <h2 className="flex gap-2 text-sm bg-slate-200 rounded-md p-2 w-full text-gray-500 justify-center items-center">
                          <BikeIcon className="h-4 w-4" />
                          {item?.vehicleType}
                        </h2>
                        <Link href={item.active ? `/payment/${item.id}` : "#"}>
                          <Button size="sm" disabled={!item.active}>
                            Rent
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              : Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[230px] w-full bg-slate-200 animate-pulse rounded-lg"
                  ></div>
                ))}
          </div>
        </>
      )}

      {/* Map View */}
      {viewMode === "map" && (
        
        <div className="h-[400px] md:hidden">
          <div className="flex py-4">
              <LayoutList className="h-10 w-10 p-3 rounded-l-lg text-primary bg-green-100" />
              <select
                className="w-40 p-2 border rounded"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <option value="listing">Listing</option>
                <option value="map">Map</option>
              </select>
            </div>
          <GoogleMapSection  listing={listing} /><div className="flex">
          </div>
        </div>
      )}
    </div>
  );
}

export default Listing;
