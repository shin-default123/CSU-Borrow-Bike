"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast, Toaster } from "sonner";

function ActiveUsersDashboard() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("bikeRentalPhotos")
          .select("profileImage, fullName, email");

        if (error) throw error;

        // Filter out duplicate users based on email or full name
        const uniqueUsers = [];
        const seenEmails = new Set();
        const seenNames = new Set();

        data.forEach(user => {
          // Check if email or full name already exists in the respective set
          if (!seenEmails.has(user.email) && !seenNames.has(user.fullName)) {
            uniqueUsers.push(user);
            seenEmails.add(user.email);
            seenNames.add(user.fullName);
          }
        });

        setActiveUsers(uniqueUsers);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveUsers();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Active Users Dashboard</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          {activeUsers.length > 0 ? (
            <div className="mt-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">Profile Image</th>
                    <th className="border border-gray-300 px-4 py-2">Full Name</th>
                    <th className="border border-gray-300 px-4 py-2">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.map((user, index) => (
                    <tr key={index} className="text-center hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2">
                        <img
                          src={user.profileImage || "/default-profile.png"}
                          alt={user.fullName}
                          className="w-12 h-12 rounded-full mx-auto"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{user.fullName || "N/A"}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.email || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No active users available.</p>
          )}
        </>
      )}

      <Toaster />
    </div>
  );
}

export default ActiveUsersDashboard;
