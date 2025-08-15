"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Formik } from "formik";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "sonner";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";
import FileUpload from "../_components/FileUpload";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
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

function EditBike() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const [addBike, setListing] = useState([]);
  const [images, setImages] = useState([]);
  const [otherRackLocation, setOtherRackLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    user && verifyUserRecord();
  }, [user]);

  const verifyUserRecord = async () => {
    const { data, error } = await supabase
      .from("addBike")
      .select("*,addBikeImages(addBike_id,url)")
      .eq("createdBy", user?.primaryEmailAddress.emailAddress)
      .eq("id", params.id);

    if (data) {
      console.log(data);
      setListing(data[0]);
    }

    if (data?.length <= 0) {
      router.replace("/");
    }
  };

  const onSubmitHandler = async (formValue) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("addBike")
      .update(formValue)
      .eq("id", params.id)
      .select();

    if (data) {
      console.log(data);
      toast("Listing updated and published");
      setLoading(false);
    } else {
      console.log("Data is not available");
    }

    for (const image of images) {
      setLoading(true);
      const file = image;
      const fileName = Date.now().toString();
      const fileExt = fileName.split(".").pop();
      const { data, error } = await supabase.storage
        .from("addBikeImages")
        .upload(`${fileName}`, file, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (error) {
        setLoading(false);
        toast("Error while uploading images");
      } else {
        const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL + fileName;
        const { data, error } = await supabase
          .from("addBikeImages")
          .insert([{ url: imageUrl, addBike_id: params?.id }])
          .select();
        if (error) {
          setLoading(false);
        }
      }
      setLoading(false);
    }
  };

  const publishBtnHandler = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("addBike")
      .update({ active: true })
      .eq("id", params?.id)
      .select();

    if (data) {
      setLoading(false);
      toast("Listing published!");
    }
  };

  return (
    <div className="px-10 md:px-36 my-10">
      <h2 className="font-bold text-2xl">Add details</h2>

      <Formik
        initialValues={{
          type: "",
          vehicleType: "",
          profileImage: user?.imageUrl,
          fullName: user?.fullName,
        }}
        onSubmit={(values) => {
          console.log(values);
          onSubmitHandler(values);
        }}
      >
        {({ values, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <div>
              <div className="p-5 border rounded-lg shadow-md grid gap-7 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div className="flex gap-2 flex-col">
                    <h2 className="text-lg text-slate-500">
                      Inclusive or Exclusive
                    </h2>
                    <RadioGroup
                      onValueChange={(v) => (values.type = v)}
                      defaultValue={addBike?.type}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inclusive" id="inclusive" />
                        <Label htmlFor="inclusive">Inclusive</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="exclusive" id="option-two" />
                        <Label htmlFor="option-two">Exclusive</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex gap-2 flex-col">
                    <h2 className="text-lg text-gray-500">Vehicle Type</h2>
                    <Select
                      onValueChange={(e) => (values.vehicleType = e)}
                      name="vehicleType"
                      defaultValue={addBike?.vehicleType}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue
                          placeholder={
                            addBike?.vehicleType
                              ? addBike?.vehicleType
                              : "Vehicle Type"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Road bike">Road Bike</SelectItem>
                        <SelectItem value="Mountain bike">
                          Mountain Bike
                        </SelectItem>
                        <SelectItem value="City Bike">
                          City Bike
                        </SelectItem>
                        <SelectItem value="Electric bike">
                          Electric Bike
                        </SelectItem>
                        <SelectItem value="Scooter">Scooter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 flex-col">
                    <h2 className="text-lg text-gray-500">Rack Location</h2>
                    <Input
                      readOnly
                      value={addBike?.address || "No location selected"}
                      className="cursor-not-allowed bg-gray-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex gap-2 flex-col">
                    <h2 className="text-gray-500">Bike Condition</h2>
                    <Input
                      placeholder="e.g. new"
                      defaultValue={addBike?.condition}
                      name="condition"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex gap-2 flex-col">
                    <h2 className="text-gray-500"> Material</h2>
                    <Input
                      placeholder="e.g. aluminum"
                      name="material"
                      onChange={handleChange}
                      defaultValue={addBike?.material}
                    />
                  </div>
                  <div className="flex gap-2 flex-col">
                    <h2 className="text-gray-500"> Bike Number</h2>
                    <Input
                      placeholder="e.g. 2024-001"
                      name="gears"
                      onChange={handleChange}
                      defaultValue={addBike?.gears}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-10">
                  <div className="flex gap-2 flex-col">
                    <h2 className="text-gray-500">Description</h2>
                    <Textarea
                      placeholder=""
                      name="description"
                      onChange={handleChange}
                      defaultValue={addBike?.description}
                    />
                  </div>
                  <div>
                    <h2 className="font-lg text-gray-500 my-2">
                      Upload Vehicle Images
                    </h2>
                    <FileUpload
                      setImages={(value) => setImages(value)}
                      imageList={addBike.addBikeImages}
                    />
                  </div>
                </div>
                <div className="flex gap-5 justify-end">
                  <Button
                    disabled={loading}
                    variant="outline"
                    className="text-primary border-primary"
                  >
                    {loading ? <Loader className="animate-spin" /> : "Save"}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" disabled={loading} className="">
                        {loading ? (
                          <Loader className="animate-spin" />
                        ) : (
                          "Save & Publish"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ready to Publish?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Do you want to publish this vehicle?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => publishBtnHandler()}>
                          {loading ? (
                            <Loader className="animate-spin" />
                          ) : (
                            "Continue"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Toaster />
                  <Toaster />
                </div>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}

export default EditBike;
