"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast, Toaster } from "sonner";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";

function TimeDashboard() {
  const [mergedData, setMergedData] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [paymentResponse, photosResponse] = await Promise.all([
          supabase
            .from("payment")
            .select(`renter_name, amount, gcash_reference, rental_start_time`),
          supabase
            .from("bikeRentalPhotos")
            .select(
              `email, 
               fullName, 
               returned_at, 
               rental_id, 
               addBike(vehicleType, rackLocation)`
            ),
        ]);

        if (paymentResponse.error) throw paymentResponse.error;
        if (photosResponse.error) throw photosResponse.error;

        const merged = paymentResponse.data.map((transaction, index) => ({
          renter_name: transaction.renter_name || "N/A",
          amount: transaction.amount || 0,
          gcash_reference: transaction.gcash_reference || "N/A",
          rental_start_time: transaction.rental_start_time || "N/A",
          email: photosResponse.data[index]?.email || "N/A",
          fullName: photosResponse.data[index]?.fullName || "N/A",
          returned_at: photosResponse.data[index]?.returned_at || "N/A",
          vehicleType: photosResponse.data[index]?.addBike?.vehicleType || "N/A",
          rackLocation: photosResponse.data[index]?.addBike?.rackLocation || "N/A",
        }));

        const incomeByMonth = merged.reduce((acc, item) => {
          const date = new Date(item.rental_start_time);
          if (isNaN(date)) return acc;

          const year = date.getFullYear();
          const month = date.toLocaleString("default", { month: "long" });

          const key = `${year} - ${month}`;
          acc[key] = (acc[key] || 0) + item.amount;

          return acc;
        }, {});

        const incomeArray = Object.entries(incomeByMonth).map(([key, value]) => ({
          period: key,
          totalIncome: value,
        }));

        setMergedData(merged);
        setMonthlyIncome(incomeArray);
        setFilteredData(merged); // Default to show all data
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalIncome = filteredData.reduce((sum, data) => sum + (data.amount || 0), 0);

  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);

    if (month === "All") {
      setFilteredData(mergedData);
    } else {
      setFilteredData(
        mergedData.filter((data) => {
          const date = new Date(data.rental_start_time);
          const formattedMonth = `${date.getFullYear()} - ${date.toLocaleString("default", {
            month: "long",
          })}`;
          return formattedMonth === month;
        })
      );
    }
  };

  const downloadExcel = () => {
    const workbook = XLSX.utils.book_new();
  
    const dataToExport =
      selectedMonth === "All"
        ? mergedData
        : mergedData.filter((data) => {
            const date = new Date(data.rental_start_time);
            const formattedMonth = `${date.getFullYear()} - ${date.toLocaleString("default", {
              month: "long",
            })}`;
            return formattedMonth === selectedMonth;
          });
  
    const transactionSheet = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, transactionSheet, selectedMonth === "All" ? "All Transactions" : selectedMonth);
  
    const monthlyIncomeSheet = XLSX.utils.json_to_sheet(
      monthlyIncome.map(({ period, totalIncome }) => ({
        Period: period,
        "Total Income": totalIncome,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, monthlyIncomeSheet, "Monthly Income");
  
    XLSX.writeFile(workbook, `Transaction_Dashboard_${selectedMonth}.xlsx`);
  };
  

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Transaction Dashboard</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          {mergedData.length > 0 ? (
            <>
              <p className="text-lg font-semibold mb-4">
                Total Income: <span className="text-green-600">₱ {totalIncome}.00</span>
              </p>

              <div className="mb-4">
                <label className="block font-semibold mb-2">Filter by Month:</label>
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="border border-gray-300 rounded px-4 py-2"
                >
                  <option value="All">All</option>
                  {monthlyIncome.map((item, index) => (
                    <option key={index} value={item.period}>
                      {item.period}
                    </option>
                  ))}
                  
                </select>
                <button
                  onClick={downloadExcel}
                  className="text-white bg-primary px-2 py-2 rounded hover:bg-blue-600 mx-1"
                >
                  <Download  /> 
                </button>
              </div>

              
             

              <div className="mt-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2">Gcash User</th>
                      <th className="border border-gray-300 px-4 py-2">Amount</th>
                      <th className="border border-gray-300 px-4 py-2">Gcash Reference</th>
                      <th className="border border-gray-300 px-4 py-2">Rental Time</th>
                      <th className="border border-gray-300 px-4 py-2">Email</th>
                      <th className="border border-gray-300 px-4 py-2">Full Name</th>
                      <th className="border border-gray-300 px-4 py-2">Returned At</th>
                      <th className="border border-gray-300 px-4 py-2">Vehicle Type</th>
                      <th className="border border-gray-300 px-4 py-2">Rack Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((data, index) => (
                      <tr key={index} className="text-center hover:bg-gray-100">
                        <td className="border border-gray-300 px-4 py-2">{data.renter_name}</td>
                        <td className="border border-gray-300 px-4 py-2">₱ {data.amount}.00</td>
                        <td className="border border-gray-300 px-4 py-2">{data.gcash_reference}</td>
                        <td className="border border-gray-300 px-4 py-2">{data.rental_start_time}</td>
                        <td className="border border-gray-300 px-4 py-2">{data.email}</td>
                        <td className="border border-gray-300 px-4 py-2">{data.fullName}</td>
                        <td className="border border-gray-300 px-4 py-2">{data.returned_at}</td>
                        <td className="border border-gray-300 px-4 py-2">{data.vehicleType}</td>
                        <td className="border border-gray-300 px-4 py-2">{data.rackLocation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p>No data available.</p>
          )}
        </>
      )}

      <Toaster />
    </div>
  );
}

export default TimeDashboard;
