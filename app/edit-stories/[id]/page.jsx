"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "../_components/FileUpload";
import { toast, Toaster } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { Loader } from "lucide-react";

function EditStory() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStory = async () => {
    const { data, error } = await supabase
      .from("addStories")
      .select("*, addStoriesImages(*)")
      .eq("id", params.id)
      .single();

    if (error) {
      toast.error("Failed to fetch story");
      console.error(error);
    } else {
      setStory(data);
    }
  };

  useEffect(() => {
    fetchStory();
  }, [params.id]);

  const handleUpdateStory = async () => {
    if (!story.title || !story.author || !story.content) {
      toast.error("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("addStories")
        .update({
          title: story.title,
          author: story.author,
          content: story.content,
        })
        .eq("id", params.id);

      if (updateError) throw updateError;

      // Upload new images if any
      if (images.length > 0) {
        for (const file of images) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `stories/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("addStoriesImages")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("addStoriesImages").getPublicUrl(filePath);

          const { error: insertError } = await supabase
            .from("addStoriesImages")
            .insert([{ url: publicUrl, addStories_id: params.id }]);

          if (insertError) throw insertError;
        }
      }

      toast.success("Story updated successfully!");
      fetchStory();
      setImages([]);
    } catch (err) {
      console.error(err.message);
      toast.error("Error updating story: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!story) return <div className="p-10">Loading...</div>;

  return (
    <div className="px-10 md:px-36 my-10">
      <h2 className="font-bold text-2xl mb-5">Edit Story</h2>

      <div className="p-5 border rounded-lg shadow-md grid gap-7">
        <div className="flex flex-col gap-3">
          <label className="font-semibold">Title</label>
          <Input
            value={story.title || ""}
            onChange={(e) => setStory({ ...story, title: e.target.value })}
          />

          <label className="font-semibold">Author</label>
          <Input
            value={story.author || ""}
            onChange={(e) => setStory({ ...story, author: e.target.value })}
          />

          <label className="font-semibold">Content</label>
          <Textarea
            value={story.content || ""}
            onChange={(e) => setStory({ ...story, content: e.target.value })}
          />
        </div>

        <div>
          <h2 className="font-semibold text-gray-700 mb-2">
            Upload Story Images
          </h2>
          <FileUpload
            setImages={(value) => setImages(value)}
            imageList={story.addStoriesImages || []}
            storyId={params.id}
            refreshData={fetchStory}
          />
        </div>

        <div className="flex gap-5 justify-end">
          <Button onClick={handleUpdateStory} disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : "Save Changes"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/stories")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default EditStory;
