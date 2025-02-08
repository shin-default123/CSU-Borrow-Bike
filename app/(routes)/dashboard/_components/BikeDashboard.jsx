
import React, { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import Bike from './Bike'

function BikeDashboard() {

  const [listing,setListing]=useState([])
  useEffect(()=>{
      getLatestListing();
  },[])

  const getLatestListing=async()=>{
    const { data, error } = await supabase
      .from("addBike")
      .select(
        `*,addBikeImages(
            url,
            addBike_id            
            )`
      )
      .eq("active", true)
      .order("id", { ascending: false });

    if(data)
    {
      setListing(data);
    }
    if(error)
      {
        toast('Error');
      }
  };

  


  return (
    <div>
      
      <div>
        <Bike listing={listing}
        />
        
      </div>



    </div>
  )
}

export default BikeDashboard