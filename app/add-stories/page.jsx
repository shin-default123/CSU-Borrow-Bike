"use client";

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
import {
  Loader,
  Trash,
  Edit,
  BookOpenText,
  PlusCircle,
  Upload,
} from "lucide-react";
import { toast, Toaster } from "sonner";

function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newStory, setNewStory] = useState({
    title: "",
    author: "",
    content: "",
  });
  const [images, setImages] = useState([]);

  // Fetch stories and their linked images
  const fetchStories = async () => {
    const { data, error } = await supabase.from("addStories").select(`
      *,
      addStoriesImages (*)
    `);

    if (error) {
      console.error("Error fetching stories:", error.message);
      toast.error("Failed to fetch stories.");
    } else {
      setStories(data);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setNewStory({ ...newStory, [e.target.name]: e.target.value });
  };

  // Handle multiple image selection
  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // Add story with multiple image upload
  const handleAddStory = async () => {
    if (!newStory.title || !newStory.author || !newStory.content) {
      toast.error("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Insert story
      const { data: storyData, error: storyError } = await supabase
        .from("addStories")
        .insert([
          {
            title: newStory.title,
            author: newStory.author,
            content: newStory.content,
          },
        ])
        .select()
        .single();

      if (storyError) throw storyError;
      const storyId = storyData.id;

      // 2️⃣ Upload images if any
      if (images.length > 0) {
        for (const file of images) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `stories/${fileName}`;

          // Upload image to Supabase Storage (bucket: uploads)
          const { error: uploadError } = await supabase.storage
            .from("addStoriesImages")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("addStoriesImages").getPublicUrl(filePath);

          // Save image link to addStoriesImages
          const { error: imgErr } = await supabase
            .from("addStoriesImages")
            .insert([{ url: publicUrl, addStories_id: storyId }]);

          if (imgErr) throw imgErr;
        }
      }

      toast.success("Story added successfully!");
      setNewStory({ title: "", author: "", content: "" });
      setImages([]);
      fetchStories();
    } catch (err) {
      console.error(err.message);
      toast.error("Error adding story: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete story + related images
  const handleDelete = async (id) => {
    if (!id) {
      toast.error("Invalid story ID.");
      return;
    }

    setLoading(true);
    try {
      await supabase.from("addStoriesImages").delete().eq("addStories_id", id);
      await supabase.from("addStories").delete().eq("id", id);

      toast.success("Story deleted successfully!");
      setStories((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold px-10 mt-[130px] mb-2">
        Manage Stories
      </h1>

      <div className="px-10">
        {/* ADD STORY BUTTON */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="mb-5 flex gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Story
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add a New Story</AlertDialogTitle>
              <AlertDialogDescription>
                Fill in the story details below.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-2 my-2">
              <input
                type="text"
                name="title"
                placeholder="Story Title"
                value={newStory.title}
                onChange={handleChange}
                className="border rounded-md p-2"
              />
              <input
                type="text"
                name="author"
                placeholder="Author Name"
                value={newStory.author}
                onChange={handleChange}
                className="border rounded-md p-2"
              />
              <textarea
                name="content"
                placeholder="Write your story..."
                value={newStory.content}
                onChange={handleChange}
                className="border rounded-md p-2 h-28"
              />

              {/* Multi-image upload */}
              <label className="flex items-center gap-2 text-sm cursor-pointer text-primary">
                <Upload className="h-4 w-4" />
                Upload Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Preview selected images */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {images.map((img, i) => (
                    <div key={i} className="border rounded-md p-1">
                      <img
                        src={URL.createObjectURL(img)}
                        alt="Preview"
                        className="w-full h-20 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddStory}>
                {loading ? <Loader className="animate-spin" /> : "Add Story"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* DISPLAY STORIES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stories.length > 0 ? (
            stories.map((item) => (
              <div
                key={item.id}
                className="p-3 border hover:border-primary cursor-pointer rounded-lg shadow-sm bg-white"
              >
                <Image
                  src={item.addStoriesImages?.[0]?.url || "/placeholder.jpg"}
                  alt={item.title || "Story image"}
                  width={800}
                  height={200}
                  className="rounded-lg object-cover h-[200px]"
                />

                <div className="flex flex-col gap-2 mt-3">
                  <h2 className="font-bold text-lg">{item.title}</h2>
                  <p className="text-sm text-gray-500">By {item.author}</p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {item.content}
                  </p>

                  <div className="flex gap-2 mt-3 justify-between">
                    <Link
                      href={`/stories/${item.id}`}
                      className="flex gap-2 items-center text-primary hover:underline"
                    >
                      <BookOpenText className="h-4 w-4" /> Read
                    </Link>

                    <div className="flex gap-2">
                      <Link href={`/edit-stories/${item.id}`}>
                        <Button size="sm">
                          <Edit className="h-4 w-4" /> Edit
                        </Button>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Story</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this story?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>
                              {loading ? (
                                <Loader className="animate-spin" />
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="h-[250px] w-full bg-slate-200 animate-pulse rounded-lg"
                ></div>
              ))
          )}
        </div>
        <Toaster />
      </div>
    </div>
  );
}

export default Stories;
