import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Logout, PermIdentity } from "@mui/icons-material";
import Sidebar from "../../../sidebar/Sidebar";
import TopWidgett from "./top/TopWidget";
import BotWidget from "./bottom/BotWidget";

export default function Home({ setAuth }) {
  const [name, setName] = useState();

  const getProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8000/profile", {
        method: "GET",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!response.ok) {
        throw new Error("Unauthorized access");
      }

      const parseRes = await response.json();
      setName(`${parseRes.firstName} ${parseRes.lastName}`);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from local storage
    setAuth(false); // Update authentication state
  };

  return (
    <div className="flex h-[900px]">
      <Sidebar />
      <div className="w-full px-8 py-8 pb-8 mb-4 bg-white border rounded shadow-md h-[900px]">
        {/* HOME ITEMS */}
        <div className="px-4 py-5 sm:px-6 rounded shadow-md bg-red-500 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-medium leading-6 text-white">
              WELCOME {name}
            </h3>
            <span className="text-md font-medium leading-6 text-white">
              Logged in: {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div>
            {/* LOGOUT BUTTON */}
            <div className="text-white float-right">
              {/* ADMIN PAGE */}
              <button className="hover:-translate-y-0.5">
                <Link to="/admin">
                  <PermIdentity />
                </Link>
              </button>

              {/* LOGOUT */}
              <button
                className="ml-2 hover:-translate-y-0.5"
                onClick={handleLogout} // Call handleLogout on click
              >
                <Link to="/login">
                  <Logout />
                </Link>
              </button>
            </div>
            <span className="mr-10 text-lg font-medium leading-6 text-white">
              {new Date().toLocaleString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <TopWidgett />
        <BotWidget />
      </div>
    </div>
  );
}
