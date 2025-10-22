"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { Toaster, toast } from "sonner";

export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("addStories")
        .select(`
          id,
          title,
          author,
          content,
          created_at,
          addStoriesImages ( url )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Failed to load stories.");
      } else {
        setStories(data);
      }
      setLoading(false);
    };

    fetchStories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* 🟩 Header */}
        <h1 className="text-4xl mb-8 text-gray-800 border-b pb-3">
          Our Impact and Stories
        </h1>

        {/* 🟨 Loading / No Data */}
        {loading ? (
          <p className="text-center text-gray-500">Loading stories...</p>
        ) : stories.length === 0 ? (
          <p className="text-center text-gray-500">No stories available.</p>
        ) : (
          <div className="space-y-10">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="block group"
              >
                <article className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm hover:shadow-lg transition duration-300 overflow-hidden">
                  {/* 🖼️ Thumbnail */}
                  {story.addStoriesImages && story.addStoriesImages.length > 0 ? (
                    <img
                      src={story.addStoriesImages[0].url}
                      alt={story.title}
                      className="h-56 md:h-auto md:w-64 object-cover"
                    />
                  ) : (
                    <div className="h-56 md:h-auto md:w-64 bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}

                  {/* 📰 Content Preview */}
                  <div className="flex flex-col justify-between p-5 flex-1">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                        {story.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        By {story.author || "Anonymous"} •{" "}
                        {new Date(story.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-3 text-gray-700 line-clamp-3">
                        {story.content}
                      </p>
                    </div>
                    <p className="mt-4 text-green-700 font-medium group-hover:underline">
                      Read more →
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
