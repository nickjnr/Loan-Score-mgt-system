import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { VisibilityOutlined } from "@mui/icons-material";

export default function ApprovalWidget() {
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState(null);

  const getLoans = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8000/allLoans", {
        method: "GET",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch loans");
      }

      const parseRes = await response.json();
      setLoans(parseRes);
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    getLoans();
  }, []);

  // Sort loans by maturity date and filter only Pending loans
  const sortedLoans = loans
    .filter((loan) => loan.status === "Pending")
    .sort((a, b) => new Date(a.maturity_date) - new Date(b.maturity_date));

  return (
    <div className="w-full h-[450px]">
      <div className="mt-5 p-8 rounded-xl border border-t-4 border-t-red-500 cursor-pointer shadow-md">
        <h3 className="text-xl mb-5 border-b-2">Loans For Approval</h3>
        <div className="flex justify-between items-center">
          <div className="w-full h-[350px] overflow-auto hover:overflow-scroll">
            <table className="table-fixed text-center w-full">
              <thead>
                <tr>
                  <th className="w-1/3 px-1 py-2">Gross Loan</th>
                  <th className="w-1/3 px-1 py-2">Status</th>
                  <th className="w-1/3 px-1 py-2">View</th>
                </tr>
              </thead>
              <tbody>
                {error ? (
                  <tr className="border px-4 py-2 bg-red-50">
                    <td colSpan={3} className="px-4 py-2">
                      {error}
                    </td>
                  </tr>
                ) : sortedLoans.length <= 0 ? (
                  <tr className="border px-4 py-2 bg-red-50">
                    <td colSpan={3} className="px-4 py-2">
                      No Loan Data
                    </td>
                  </tr>
                ) : (
                  sortedLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td className="border px-4 py-2 bg-gray-50">
                        KES {loan.gross_loan}
                      </td>
                      <td className="border px-4 py-2">
                        <span className="bg-yellow-300 text-white px-4 py-1 rounded-md">
                          {loan.status}
                        </span>
                      </td>
                      <td className="border px-4 py-2 bg-gray-50">
                        <Link to={`/editLoan/${loan.id}`}>
                          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                            <VisibilityOutlined className="text-sm" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
