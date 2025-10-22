"use client"
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ListingMapView from "./_components/ListingMapView";
import BikeDashboard from "./(routes)/dashboard/_components/BikeDashboard";

export default function Home() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();

  {/*
  useEffect(() => {
    if (!isSignedIn)
      router.push("/sign-in")
    return
  }, [isSignedIn]);
*/}
  if (user && user.publicMetadata.role) {
    return <BikeDashboard />; 
  } else {
    return (
      <div className="px-10 p-10">
        <ListingMapView type="inclusive" /> 
      </div>
    );
  }
}

