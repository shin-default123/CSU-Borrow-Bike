"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Formik } from "formik";
import { toast, Toaster } from "sonner";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import Modal from "../modal/modal";

function Page() {
  const params = useParams();
  const [bikeList, setBikeList] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      verifyUserRecord();
      fetchBikeList();
    }
  }, [user]);

  const verifyUserRecord = async () => {
    try {
      const { data, error } = await supabase
        .from("report")
        .select("id, bike_number, description, created_at, status")
        .eq("createdBy", user?.primaryEmailAddress?.emailAddress);

      if (error) {
        console.error("Error fetching user reports:", error.message);
      } else {
        setUserReports(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching user reports:", err);
    }
  };

  const fetchBikeList = async () => {
    try {
      const { data, error } = await supabase
        .from("addBike")
        .select("id, gears");
      if (error) {
        console.error("Error fetching bike list:", error);
        toast.error("Failed to load bike list.");
      } else {
        setBikeList(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching bike list:", err);
    }
  };

  const onSubmitHandler = async (values, { resetForm }) => {
    setLoading(true);
    try {
      const { bikeNumber, predefinedIssue, customIssue } = values;
      const description = predefinedIssue
        ? customIssue
          ? `${predefinedIssue}: ${customIssue}`
          : predefinedIssue
        : customIssue;

      const { data, error } = await supabase
        .from("report")
        .insert([
          {
            bike_number: bikeNumber,
            description,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            profileImage: user?.imageUrl || "",
            fullName: user?.fullName || "",
            status: "Pending", // Default status
          },
        ]);
      if (error) {
        console.error("Error submitting report:", error);
        toast.error("Failed to submit the report.");
      } else {
        toast.success("Report submitted successfully.");
        resetForm();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        verifyUserRecord(); // Refresh the report history
      }
    } catch (err) {
      console.error("Unexpected error submitting report:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const validate = (values) => {
    const errors = {};
    if (!values.bikeNumber) {
      errors.bikeNumber = "Please select a bike.";
    }
    if (!values.predefinedIssue) {
      errors.predefinedIssue = "Please select an issue.";
    }
    if (values.predefinedIssue === "Other" && !values.customIssue) {
      errors.customIssue = "Please describe the issue.";
    }
    return errors;
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Report Bike Condition</h2>

      <Formik
        initialValues={{
          bikeNumber: "",
          predefinedIssue: "",
          customIssue: "",
        }}
        validate={validate}
        onSubmit={onSubmitHandler}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <div className="p-5 border rounded-lg shadow-md grid gap-7 mt-6">
              <div className="flex gap-2 flex-col">
                <h2 className="text-lg text-gray-500">Select Bike</h2>
                <Select
                  onValueChange={(value) => setFieldValue("bikeNumber", value)}
                  name="bikeNumber"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Bike Number" />
                  </SelectTrigger>
                  <SelectContent>
                    {bikeList.map((bike) => (
                      <SelectItem key={bike.id} value={bike.gears}>
                        {bike.gears}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bikeNumber && touched.bikeNumber && (
                  <p className="text-red-500 text-sm">{errors.bikeNumber}</p>
                )}
              </div>

              <div className="flex gap-2 flex-col">
                <h2 className="text-lg text-gray-500">Issue</h2>
                <Select
                  onValueChange={(value) =>
                    setFieldValue("predefinedIssue", value)
                  }
                  name="predefinedIssue"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an issue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flat tire">Flat tire</SelectItem>
                    <SelectItem value="Broken chain">Broken chain</SelectItem>
                    <SelectItem value="Loose brakes">Loose brakes</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.predefinedIssue && touched.predefinedIssue && (
                  <p className="text-red-500 text-sm">
                    {errors.predefinedIssue}
                  </p>
                )}
              </div>

              {values.predefinedIssue === "Other" && (
                <div className="flex gap-2 flex-col">
                  <h2 className="text-lg text-gray-500">Describe Issue</h2>
                  <Textarea
                    placeholder="Describe the issue, e.g., misaligned gears"
                    name="customIssue"
                    onChange={handleChange}
                    value={values.customIssue}
                  />
                  {errors.customIssue && touched.customIssue && (
                    <p className="text-red-500 text-sm">{errors.customIssue}</p>
                  )}
                </div>
              )}

              <div className="flex gap-5 justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="text-white bg-primary"
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Formik>

      <h3 className="text-xl font-semibold mt-8">Your Report History</h3>
      <div className="mt-4 space-y-4">
        {userReports.length > 0 ? (
          userReports.map((report) => (
            <div
              key={report.id}
              className="p-4 border rounded-md shadow-md bg-gray-50"
            >
              <p><strong>Bike Number:</strong> {report.bike_number}</p>
              <p><strong>Description:</strong> {report.description}</p>
              <p>
                <strong>Reported On:</strong>{" "}
                {new Date(report.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    report.status === "Resolved"
                      ? "text-green-500 font-bold"
                      : "text-gray-700"
                  }
                >
                  {report.status}
                </span>
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reports found.</p>
        )}
      </div>

      <Toaster />
      <Modal/>
    </div>
  );
}

export default Page;
