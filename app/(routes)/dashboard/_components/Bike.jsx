import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Bolt, MapPin, Trash, Loader, BikeIcon, Check, CheckCheck } from "lucide-react";
import { toast, Toaster } from "sonner";

function Bike() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBikes = async () => {
      const { data, error } = await supabase.from("addBike").select(`
        *,
        addBikeImages (*)
      `);

      if (error) {
        console.error("Error fetching bikes:", error.message);
        toast.error("Failed to fetch bikes.");
      } else {
        setBikes(data);
      }
    };

    fetchBikes();
  }, []);

  //Mark as rented
  const markAsRented = async (id) => {
    try {
      const { error } = await supabase
        .from("addBike")
        .update({ active: false })
        .eq("id", id);

      if (error) throw new Error("Failed to mark bike as rented.");

      toast.success("Bike marked as rented.");
      setBikes((prevBikes) =>
        prevBikes.map((bike) =>
          bike.id === id ? { ...bike, active: false } : bike
        )
      );
    } catch (err) {
      console.error(err.message);
      toast.error(err.message);
    }
  };

   // Mark bike as available
   const markAsAvailable = async (id) => {
    try {
      const { error } = await supabase
        .from("addBike")
        .update({ active: true })
        .eq("id", id);

      if (error) throw new Error("Failed to mark bike as available.");

      toast.success("Bike marked as available.");
      setBikes((prevBikes) =>
        prevBikes.map((bike) => (bike.id === id ? { ...bike, active: true } : bike))
      );
    } catch (err) {
      console.error(err.message);
      toast.error(err.message);
    }
  };


  // Delete bike and associated images
  const handleDelete = async (id) => {
    if (!id) {
      toast.error("Invalid bike ID.");
      return;
    }

    setLoading(true);

    try {
      // Delete associated images
      const { error: imageError } = await supabase
        .from("addBikeImages")
        .delete()
        .eq("addBike_id", id);

      if (imageError) throw new Error("Failed to delete bike images.");

      // Delete bike record
      const { error } = await supabase
        .from("addBike")
        .delete()
        .eq("id", id);

      if (error) throw new Error("Failed to delete bike.");

      toast.success("Bike deleted successfully!");
      setBikes((prevBikes) => prevBikes.filter((bike) => bike.id !== id));
    } catch (err) {
      console.error(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold px-10 mt-[130px] mb-2">Manage Bikes</h1>
    <div className="px-10 flex gap-1">
      <div className="grid grid-cols-2  md:grid-cols-5 gap-1">
        {bikes.length > 0
          ? bikes.map((item) => (
              <div
                key={item.id}
                className="p-3 hover:border hover:border-primary cursor-pointer rounded-lg"
              >
           <h2
                className={`rounded-lg text-white absolute px-2 text-sm m-1 ${
                  item.active ? "bg-primary" : "bg-gray-400"
                }`}
              >
                {item.active ? "Available" : "Not Available"}
          </h2>

                <Image
                  src={item.addBikeImages?.[0]?.url || "/placeholder.jpg"}
                  alt={`${item.vehicleType} image`}
                  width={800}
                  height={150}
                  className="rounded-lg object-cover h-[170px]"
                />
                <div className="flex mt-2 flex-col gap-2">
                  <h2 className="font-bold text-xl">{item.gears}</h2>
                  <h2 className="flex gap-2 text-sm text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {item.address}
                  </h2> 
                  <div className="flex gap-2 mt-1 justify-between">
                  {/*  <h2 className="flex gap-2 text-sm bg-slate-200 rounded-md p-2 w-full text-gray-500 justify-center items-center">
                      <BikeIcon className="h4 w-4" />
                      {item.vehicleType}
                    </h2> */}
                    <Button
                        onClick={() => markAsRented(item.id)}
                        className="flex gap-2 text-sm bg-gray-700 rounded-md w-full p-2 justify-center items-center" >
                        <Check className="h1 w-1" />
                        Rented
                      </Button>
                      <Button
                        onClick={() => markAsAvailable(item.id)}
                        className="flex gap-2 text-sm bg-primary rounded-md w-full p-2 text-white justify-center items-center" >
                        <CheckCheck className="h1 w-1" />
                        Live
                      </Button>
                  </div>
                  <div className="flex gap-2 justify-between">
                    <AlertDialog>
                    <AlertDialogTrigger className="w-full">
                      <Button size="sm" className="w-full">
                        Edit
                      </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Edit Bike</AlertDialogTitle>
                          <AlertDialogDescription>
                            Do you want to edit the bike's details?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction asChild>
                          <Link href={`/edit-bike/${item.id}`}>
                            {loading ? (
                              <Loader className="animate-spin" />
                            ) : (
                              "Continue"
                            )}
                             </Link>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                      </AlertDialog>



                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button size="sm" variant="destructive">
                          <Trash />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Bike</AlertDialogTitle>
                          <AlertDialogDescription>
                            Do you want to delete the bike permanently?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                          >
                            {loading ? (
                              <Loader className="animate-spin" />
                            ) : (
                              "Continue"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))
          : Array(8)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="h-[230px] w-full bg-slate-200 animate-pulse rounded-lg"
                ></div>
              ))}
      </div>
      <Toaster />
    </div>
    </div>
  );
}

export default Bike;
