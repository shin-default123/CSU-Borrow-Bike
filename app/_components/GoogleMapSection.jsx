"use client"


import React, { useContext, useEffect, useState } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import MarkerItem from "./MarkerItem";
import UserLocationContext from "../context/UserLocationContext";
import { supabase } from "@/utils/supabase/client";

const containerStyle = {
  width: "100%",
  height: "80vh",
  borderRadius: 10,
};

function GoogleMapSection({ coordinates,listing, bikeId }) {
  const { userLocation, setUserLocation } = useContext(UserLocationContext);
  const [bikeLocation, setBikeLocation] = useState(coordinates);
  const [center, setCenter] = useState({
    lat: 8.95875,
    lng: 125.59766,
  });
  console.log("hey:", userLocation)


  const [map, setMap] = React.useState(null);


 // const { isLoaded } = useJsApiLoader({
  //  id: "google-map-script",
 //   googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY,
//  })

useEffect(() => {
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const newUserLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setUserLocation(newUserLocation); // Update user location in context
      setBikeLocation(newUserLocation); // Also update the bike's location to user's location
      // Optionally, update the bike's location in the database too
      updateBikeLocationInDatabase(newUserLocation);
    },
    (error) => {
      console.error("Error getting user location:", error);
    },
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
  );

  // Clean up the geolocation watcher
  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}, [setUserLocation]);

const updateBikeLocationInDatabase = async (newLocation) => {
  try {
    const { error } = await supabase
      .from("addBike")
      .update({
        coordinates: newLocation,
      })
      .eq("id", bikeId);
    
    if (error) {
      console.error("Error updating bike location:", error);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};

  useEffect(() => {
    coordinates&&setCenter(coordinates)
  }, [coordinates])

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map);
  }, []);
  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  

  return (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        //center or userLocation
        zoom={16}
        onLoad={onLoad}
        onUnmount={onUnmount}
        gestureHandling="greedy"
      >
        {/* Child components, such as markers, info windows, etc. */}
        {listing.map((item,index)=>(
          <MarkerItem
            key={index}
            item={item}
          />
        ))}
        <MarkerF
          position={bikeLocation} 
          icon={{
            url: "/bikeLocation.png",
            scaledSize: {
              width: 50,
              height: 50,
            },
          }}
        />
        <MarkerF
          position={userLocation}
          icon={{
            url:'/userLocation.png',
            scaledSize:{
              width:50,
              height:50
            }
          }}

        />
      </GoogleMap>
    </div>
  );
}

export default GoogleMapSection;