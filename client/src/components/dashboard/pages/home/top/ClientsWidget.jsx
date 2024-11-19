import { PermIdentity } from "@mui/icons-material";
import React, { useState, useEffect } from "react";

export default function ClientsWidget() {
  const [clients, setClients] = useState([]);

  const getClients = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8000/allClients", {
        method: "GET",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const parseRes = await response.json();
      setClients(parseRes);
    } catch (error) {
      console.log("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  return (
    <div className="w-full">
      {/* CLIENTS */}
      <div
        className="mt-5 p-8 rounded-xl border border-t-4 border-t-red-500 cursor-pointer hover:bg-red-500
        hover:text-white hover:text-base transition duration-150
        ease-in-out shadow-md"
      >
        <div className="flex justify-between items-center">
          <span className="text-xl">Borrowers</span>
        </div>
        <div className="my-3">
          <span className="text-3xl">
            <PermIdentity fontSize="inherit" />{" "}
            {/* Use 'inherit' for consistent sizing */}
            {clients.length}
          </span>
        </div>
        <span className="text-base text-gray-500">Total Clients Serviced</span>
      </div>
    </div>
  );
}
