import { Logout } from "@mui/icons-material";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../sidebar/Sidebar";

const AddAdmin = ({ setAuth }) => {
  const [inputs, setInputs] = useState({
    firstname: "",
    lastname: "",
    contactNumber: "",
    address: "",
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false); // Added loading state

  const {
    firstname,
    lastname,
    contactNumber,
    address,
    email,
    username,
    password,
  } = inputs;

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const addSuccessful = () => {
    toast.success("Added Successfully!", { autoClose: 1000 });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        firstname,
        lastname,
        contactNumber,
        address,
        email,
        username,
        password,
      };

      const response = await fetch("http://localhost:8000/addAdmin", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const parseRes = await response.json();

      if (!response.ok) {
        throw new Error(parseRes.message || "An error occurred");
      }

      addSuccessful();
      setInputs({
        firstname: "",
        lastname: "",
        contactNumber: "",
        address: "",
        email: "",
        username: "",
        password: "",
      });
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    } catch (error) {
      toast.error("Failed to add admin already exists: " + error.message, {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[900px] ">
      <Sidebar />
      <ToastContainer />

      <div className="w-full h-[900px] border bg-white shadow-md rounded">
        <div className="w-full px-8 pt-6 pb-8 mb-4 bg-white rounded">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-5 sm:px-6 bg-red-500 rounded shadow-md ">
            <div>
              <h3 className="text-lg font-medium leading-6 text-white">
                Add New Admin
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-white">
                Register all the required fields.
              </p>
            </div>

            <div className="text-white">
              <button
                className=""
                onClick={() => {
                  setAuth(false);
                }}
              >
                <Link to="/login">
                  <Logout />
                </Link>
              </button>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            className="mt-5 p-8 rounded border shadow-md border-t-4 border-t-red-500 "
          >
            {/* FIRST NAME */}
            <label htmlFor="firstname">First Name: </label>
            <input
              type="text"
              className="block border border-grey-500 w-full p-3 rounded mb-4"
              name="firstname"
              value={firstname}
              onChange={onChange}
              placeholder="First Name"
              required
            />
            {/* LAST NAME */}
            <label htmlFor="lastname">Last Name: </label>
            <input
              type="text"
              className="block border border-grey-500 w-full p-3 rounded mb-4"
              name="lastname"
              value={lastname}
              onChange={onChange}
              placeholder="Last Name"
              required
            />
            {/* CONTACT NUMBER */}
            <label htmlFor="contactNumber">Contact Number: </label>
            <input
              type="number"
              className="block border border-grey-500 w-full p-3 rounded mb-4"
              name="contactNumber"
              value={contactNumber}
              onChange={onChange}
              placeholder="Contact Number"
              required
            />
            {/* ADDRESS */}
            <label htmlFor="address">Address: </label>
            <input
              type="text"
              className="block border border-grey-500 w-full p-3 rounded mb-4"
              name="address"
              value={address}
              onChange={onChange}
              placeholder="Address"
              required
            />
            {/* EMAIL */}
            <label htmlFor="email">Email: </label>
            <input
              type="email"
              className="block border border-grey-500 w-full p-3 rounded mb-4"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Email"
              required
            />
            {/* PASSWORD */}
            <label htmlFor="password">Password: </label>
            <input
              type="password"
              className="block border border-grey-500 w-full p-3 rounded mb-4"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="**********"
              required
            />
            {/* USERNAME */}
            <label htmlFor="username">Username: </label>
            <input
              type="text"
              className="block border border-grey-500 w-full p-3 rounded mb-4"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Username"
              required
            />

            {/* BUTTONS */}
            <div className="flex justify-between">
              <button
                type="submit"
                className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                <Link to="/admin">Cancel</Link>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAdmin;
