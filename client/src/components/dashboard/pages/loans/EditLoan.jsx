import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logout } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "../../../sidebar/Sidebar";
import OneLoan from "./OneLoan";

const EditLoan = ({ setAuth }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const loanId = location.pathname.split("/")[2];

  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [inputs, setInputs] = useState({
    type: "",
    balance: "",
    gross_loan: "",
    amort: "",
    terms: "",
    status: "",
    date_released: "",
    maturity_date: "",
  });

  const {
    type,
    balance,
    gross_loan,
    amort,
    terms,
    status,
    date_released,
    maturity_date,
  } = inputs;

  const getClient = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authorization token is missing");

      const response = await fetch(`http://localhost:8000/client/${clientId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch client data");

      const parseRes = await response.json();
      setName(`${parseRes.firstName} ${parseRes.lastName}`);
    } catch (error) {
      console.error("Error fetching client details:", error.message);
    }
  };

  const getLoan = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authorization token is missing");

      const response = await fetch(`http://localhost:8000/loan/${loanId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch loan details");
      }

      const parseRes = await response.json();

      const formatDate = (d) => {
        const date = new Date(d);
        let month = date.getMonth() + 1;
        month = month < 10 ? `0${month}` : month;
        let day = date.getDate();
        day = day < 10 ? `0${day}` : day;
        return `${date.getFullYear()}-${month}-${day}`;
      };

      setInputs({
        type: parseRes.type,
        balance: parseRes.balance,
        gross_loan: parseRes.gross_loan,
        amort: parseRes.amort,
        terms: parseRes.terms,
        status: parseRes.status,
        date_released: formatDate(parseRes.date_released),
        maturity_date: formatDate(parseRes.maturity_date),
      });

      setClientId(parseRes.client_id);
    } catch (error) {
      console.error("Error fetching loan details:", error.message);
    }
  };

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const editSuccessful = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        pending: "Updating Loan...",
        success: "Updated Successfully!",
        error: "Error!",
      },
      { autoClose: 1000 }
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        type,
        balance,
        gross_loan,
        amort,
        terms,
        date_released,
        status,
        maturity_date,
      };
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authorization token is missing");

      const response = await fetch(`http://localhost:8000/loans/${loanId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update loan");
      }

      editSuccessful();

      setTimeout(() => {
        navigate(-1);
      }, 3000);
    } catch (error) {
      console.error("Error updating loan:", error.message);
    }
  };

  useEffect(() => {
    if (clientId) {
      getClient(); // Fetch client data if clientId is available
    }
    getLoan(); // Always fetch loan data on mount
  }, [clientId]); // Trigger when clientId changes

  return (
    <div className="flex h-[900px]">
      <Sidebar />
      <ToastContainer />

      <div className="w-full h-[900px] mx-auto px-8 py-8 mb-4 border bg-white shadow-md rounded">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-5 sm:px-6 bg-red-500 rounded shadow-md">
          {/* TITLE */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-white">
              Update Loan For{" "}
              <span className="text-gray-900 text-xl font-semibold">
                {name}
              </span>
            </h3>

            <p className="mt-1 max-w-2xl text-sm text-white">
              Edit and update your loan
            </p>
          </div>

          <div className="text-white">
            <button className="" onClick={() => setAuth(false)}>
              <Link to="/login">
                <Logout />
              </Link>
            </button>
          </div>
        </div>

        {/* LOAN INFO */}
        <OneLoan />

        {/* EDIT FORM */}
        <div className="mt-5 px-4 py-2 h-[530px] rounded border shadow-md border-t-4 border-t-red-500">
          <h3 className="text-lg font-medium leading-6 text-gray my-2 px-1 py-4 border-y-2">
            Edit Loan Information
          </h3>
          <form onSubmit={onSubmit} className="grid grid-cols-2 p-2">
            {/* LOAN TYPE */}
            <div>
              <label htmlFor="type">Loan Type: </label>
              <select
                className="block border border-grey-500 w-10/12 p-3 rounded mb-4"
                name="type"
                id="type"
                value={type}
                onChange={onChange}
              >
                <option value="Personal Loan">Personal Loan</option>
                <option value="Salary Loan">Salary Loan</option>
                <option value="Business Loan">Business Loan</option>
              </select>
            </div>
            {/* LOAN STATUS */}
            <div>
              <label htmlFor="status">Status: </label>
              <select
                className="block border border-grey-500 w-10/12 p-3 rounded mb-4"
                name="status"
                id="status"
                value={status}
                onChange={onChange}
              >
                <option value="Approved">Approved</option>
                <option value="Fully Paid">Fully Paid</option>
                <option value="Disbursed">Disbursed</option>
                <option value="Pending">Pending</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
            {/* GROSS LOAN */}
            <div>
              <label htmlFor="gross_loan">Gross Loan: </label>
              <input
                type="number"
                className="block border border-grey-500 w-10/12 p-3 rounded mb-4"
                name="gross_loan"
                value={gross_loan}
                onChange={onChange}
                placeholder="Gross Loan"
              />
            </div>
            {/* BALANCE */}
            <div>
              <label htmlFor="balance">Balance: </label>
              <input
                type="number"
                className="block border border-grey-500 w-10/12 p-3 rounded mb-4"
                name="balance"
                value={balance}
                onChange={onChange}
                placeholder="Balance"
              />
            </div>
            {/* AMORTIZATION */}
            <div>
              <label htmlFor="amort">Amortization: </label>
              <input
                type="number"
                className="block border border-grey-500 w-10/12 p-3 rounded mb-4"
                name="amort"
                value={amort}
                onChange={onChange}
                placeholder="Monthly Amortization"
              />
            </div>
            {/* TERMS */}
            <div>
              <label htmlFor="terms">Terms: </label>
              <select
                className="block border border-grey-500 w-10/12 p-3 rounded mb-4"
                name="terms"
                id="terms"
                value={terms}
                onChange={onChange}
              >
                <option value="1">1 Month</option>
                <option value="2">2 Months</option>
                <option value="3">3 Months</option>
                <option value="4">4 Months</option>
                <option value="5">5 Months</option>
                <option value="6">6 Months</option>
                <option value="7">7 Months</option>
                <option value="8">8 Months</option>
                <option value="9">9 Months</option>
                <option value="10">10 Months</option>
                <option value="11">11 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>
            {/* DATE RELEASED */}
            <div>
              <label htmlFor="date_released">Date Released: </label>
              <input
                type="date"
                className="block border border-grey-500 w-10/12 p-3 rounded mb-4"
                name="date_released"
                value={date_released}
                onChange={onChange}
              />
            </div>
            {/* MATURITY DATE */}
            <div>
              <label htmlFor="maturity_date">Maturity Date: </label>
              <input
                type="date"
                className="block border border-grey-500 w-10/12 p-3 rounded mb-4"
                name="maturity_date"
                value={maturity_date}
                onChange={onChange}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="bg-red-500 w-3/12 rounded-lg p-3 text-white"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLoan;
