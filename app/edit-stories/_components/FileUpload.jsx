"use client";
import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";

function FileUpload({ setImages, imageList = [], storyId, refreshData }) {
  const [imagePreview, setImagePreview] = useState([]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleDeleteImage = async (id) => {
    const { error } = await supabase
      .from("addStoriesImages")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting image");
    } else {
      toast.success("Image deleted");
      refreshData();
    }
  };

  return (
    <div>
      {/* Upload area */}
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 000-6h-.025A5.56 5.56 0 0016 6.5 5.5 5.5 0 005.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 000 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*"
          />
        </label>
      </div>

      {/* Preview new images */}
      {imagePreview.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-3">
          {imagePreview.map((image, index) => (
            <div key={index} className="relative">
              <Image
                src={image}
                width={100}
                height={100}
                className="rounded-lg object-cover h-[100px] w-[100px]"
                alt="Preview"
              />
            </div>
          ))}
        </div>
      )}

      {/* Display existing images */}
      {imageList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-5">
          {imageList.map((image) => (
            <div key={image.id} className="relative group">
              <Image
                src={image.url}
                width={100}
                height={100}
                className="rounded-lg object-cover h-[100px] w-[100px]"
                alt="Uploaded"
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(image.id)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
