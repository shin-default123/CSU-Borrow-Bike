"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast, Toaster } from "sonner";
import * as XLSX from "xlsx";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Trash, Loader, Download } from "lucide-react";

function ReportDashboard() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [monthlyReports, setMonthlyReports] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("report")
          .select("id, fullName, bike_number, created_at, description, status");

        if (error) throw error;

        setReportData(data);

        const incomeByMonth = data.reduce((acc, item) => {
          const date = new Date(item.created_at);
          if (isNaN(date)) return acc;

          const year = date.getFullYear();
          const month = date.toLocaleString("default", { month: "long" });

          const key = `${year} - ${month}`;
          acc[key] = (acc[key] || 0) + 1;

          return acc;
        }, {});

        const incomeArray = Object.entries(incomeByMonth).map(([key, value]) => ({
          period: key,
          totalReports: value,
        }));

        setMonthlyReports(incomeArray);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);

    if (month === "All") {
      setReportData(reportData);
    } else {
      setReportData(
        reportData.filter((report) => {
          const date = new Date(report.created_at);
          const formattedMonth = `${date.getFullYear()} - ${date.toLocaleString("default", { month: "long" })}`;
          return formattedMonth === month;
        })
      );
    }
  };

  const updateStatus = async (reportId, newStatus) => {
    try {
      const { error } = await supabase
        .from("report")
        .update({ status: newStatus })
        .eq("id", reportId);
  
      if (error) throw error;
  
      // Update the local state after updating in Supabase
      setReportData((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
  
      toast.success("Status updated successfully!");
    } catch (err) {
      toast.error("Failed to update status: " + err.message);
    }
  };
  
  const downloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    const reportSheet = XLSX.utils.json_to_sheet(
      reportData.map(({ id, fullName, bike_number, created_at, description, status }) => ({
        ID: id,
        "Reported By": fullName,
        "Bike Number": bike_number,
        "Reported At": created_at,
        Description: description,
        Status: status || "Pending",
      }))
    );
    XLSX.utils.book_append_sheet(workbook, reportSheet, "Reports");
    XLSX.writeFile(workbook, "Reported_Issues.xlsx");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Reported Issues Dashboard</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          {reportData.length > 0 ? (
            <div className="mt-8">
              <div className="mb-4">
                <label className="block font-semibold mb-2">Filter by Month:</label>
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="border border-gray-300 rounded px-4 py-2"
                >
                  <option value="All">All</option>
                  {monthlyReports.map((item, index) => (
                    <option key={index} value={item.period}>
                      {item.period}
                    </option>
                  ))}
       </select>
                <button
                  onClick={downloadExcel}
                  className="text-white bg-primary px-2 py-2 rounded hover:bg-blue-600  items-center mx-1"
                >
                  <Download  />
                </button>
              </div>

              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">Reported by</th>
                    <th className="border border-gray-300 px-4 py-2">Bike Number</th>
                    <th className="border border-gray-300 px-4 py-2">Time Reported</th>
                    <th className="border border-gray-300 px-4 py-2">Reported Issues</th>
                    <th className="border border-gray-300 px-4 py-2">Status</th>
                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((report) => (
                    <tr key={report.id} className="text-center hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2">{report.fullName}</td>
                      <td className="border border-gray-300 px-4 py-2">{report.bike_number}</td>
                      <td className="border border-gray-300 px-4 py-2">{report.created_at}</td>
                      <td className="border border-gray-300 px-4 py-2">{report.description}</td>
                      <td
                        className={`border border-gray-300 px-4 py-2 ${report.status === "Resolved" ? "text-green-500 font-bold" : "text-gray-700"}`}
                      >
                        {report.status || "Pending"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <select
                          value={report.status || "Pending"}
                          onChange={(e) => updateStatus(report.id, e.target.value)}
                          className="border rounded p-1"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <button className="ml-4 text-red-500 hover:text-red-700">
                              <Trash />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this report? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(report.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No reports available.</p>
          )}
        </>
      )}

      <Toaster />
    </div>
  );
}

export default ReportDashboard;
