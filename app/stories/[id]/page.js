"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Facebook, Twitter, Link as LinkIcon } from "lucide-react";

export default function StoryView() {
  const { id } = useParams();
  const router = useRouter();
  const [story, setStory] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("addStories")
        .select(`
          id,
          title,
          author,
          content,
          created_at,
          addStoriesImages ( id, url )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        toast.error("Failed to load story.");
        setLoading(false);
        return;
      }

      setStory(data);

      // fetch related posts (3 latest except this one)
      const { data: relatedData } = await supabase
        .from("addStories")
        .select("id, title, created_at, addStoriesImages ( url )")
        .neq("id", id)
        .order("created_at", { ascending: false })
        .limit(3);

      setRelated(relatedData || []);
      setLoading(false);
    };

    fetchStory();
  }, [id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(story?.title || "Check this out!");
    let shareLink = "";

    if (platform === "facebook")
      shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    if (platform === "x")
      shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

    window.open(shareLink, "_blank", "noopener,noreferrer");
  };

  if (loading)
    return <p className="text-center text-gray-500 py-10">Loading story...</p>;

  if (!story)
    return <p className="text-center text-gray-500 py-10">Story not found.</p>;

  const images = story.addStoriesImages || [];
  const headerImage = images.length > 0 ? images[0].url : null;
  const otherImages = images.length > 1 ? images.slice(1) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* 🔙 Back Button */}
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => router.push("/stories")}
        >
          ← Back to Stories
        </Button>

        {/* 📰 Story Header */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{story.title}</h1>
        <p className="text-sm text-gray-500 mb-6">
          By {story.author || "Anonymous"} •{" "}
          {new Date(story.created_at).toLocaleDateString()}
        </p>

        {/* 🖼️ Header Image */}
        {headerImage && (
          <div className="mb-8">
            <img
              src={headerImage}
              alt="Header image"
              className="w-full h-[420px] object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* 📖 Story Content */}
        <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line mb-8">
          {story.content}
        </p>

        {/* 🖼️ Additional Images Below */}
        {otherImages.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              More Photos
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {otherImages.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="Additional story photo"
                  className="rounded-lg shadow-md object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* 🔗 Share Section */}
        <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Share this story:
          </h3>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              Copy Link
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("facebook")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("x")}
              className="flex items-center gap-2 text-black hover:text-gray-700"
            >
              <Twitter className="w-4 h-4" />
              X
            </Button>
          </div>
        </div>

        {/* 📰 Related Posts */}
        {related.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Related Posts
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {related.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => router.push(`/stories/${post.id}`)}
                >
                  {post.addStoriesImages?.[0]?.url && (
                    <img
                      src={post.addStoriesImages[0].url}
                      alt={post.title}
                      className="rounded-t-xl h-40 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
