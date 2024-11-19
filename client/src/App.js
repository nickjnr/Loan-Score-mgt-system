import "./App.css";
import React, { Fragment, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Home from "./components/dashboard/pages/home/Home";
import Login from "./components/auths/Login";
import Register from "./components/auths/Register";
import Landing from "./components/landing/Landing";
import GetAllLoans from "./components/dashboard/pages/loans/ClientLoans";
import AddLoan from "./components/dashboard/pages/loans/AddLoan";
import AddBorrower from "./components/dashboard/pages/borrowers/AddBorrower";
import Borrower from "./components/dashboard/pages/borrowers/Borrower";
import Borrowers from "./components/dashboard/pages/borrowers/Borrowers";
import EditLoan from "./components/dashboard/pages/loans/EditLoan";
import EditBorrower from "./components/dashboard/pages/borrowers/EditBorrower";
import AddLoans from "./components/dashboard/pages/loans/AddLoans";
import Payments from "./components/dashboard/pages/payments/AllPayments";
import EmailPage from "./components/dashboard/pages/messages/EmailPage";
import PaymentLoansInfo from "./components/dashboard/pages/payments/PaymentLoanInfo";
// import Admins from "./components/dashboard/admin/AllAdmins";
import AdminPage from "./components/dashboard/admin/AdminPage";
import AddAdmin from "./components/dashboard/admin/AddAdmin";

function App() {
  // Initialize authentication state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  // Function to update authentication state
  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
    localStorage.setItem("isAuthenticated", boolean);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuth(true); // Consider the user authenticated if there's a token
    }
  }, []);

  return (
    <Router>
      <div className="App py-10 px-10">
        <div>
          <Fragment>
            <Routes>
              {/* LANDING */}
              <Route exact path="/" element={<Landing />} />

              {/* REGISTER */}
              <Route
                exact
                path="/register"
                element={
                  !isAuthenticated ? (
                    <Register setAuth={setAuth} />
                  ) : (
                    <Navigate to="/home" />
                  )
                }
              />

              {/* ADD ADMIN */}
              <Route
                exact
                path="/addAdmin"
                element={
                  isAuthenticated ? (
                    <AddAdmin setAuth={setAuth} />
                  ) : (
                    <Navigate to="/admin" />
                  )
                }
              />

              {/* LOGIN */}
              <Route
                exact
                path="/login"
                element={
                  !isAuthenticated ? (
                    <Login setAuth={setAuth} />
                  ) : (
                    <Navigate to="/home" />
                  )
                }
              />

              {/* ADMIN */}
              <Route
                exact
                path="/admin"
                element={
                  isAuthenticated ? (
                    <AdminPage setAuth={setAuth} />
                  ) : (
                    <Navigate to="/home" />
                  )
                }
              />

              {/* HOME */}
              <Route
                exact
                path="/home"
                element={
                  isAuthenticated ? (
                    <Home setAuth={setAuth} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* BORROWERS */}
              <Route
                exact
                path="/borrowers"
                element={
                  isAuthenticated ? (
                    <Borrowers setAuth={setAuth} />
                  ) : (
                    <Navigate to="/home" />
                  )
                }
              />

              {/* BORROWER */}
              <Route
                exact
                path="/borrower/:id"
                element={
                  isAuthenticated ? (
                    <Borrower setAuth={setAuth} />
                  ) : (
                    <Navigate to="/borrowers" />
                  )
                }
              />

              {/* EDIT BORROWER */}
              <Route
                exact
                path="/editBorrower/:id"
                element={
                  isAuthenticated ? (
                    <EditBorrower setAuth={setAuth} />
                  ) : (
                    <Navigate to="/borrower" />
                  )
                }
              />

              {/* ADD BORROWER */}
              <Route
                exact
                path="/addBorrower"
                element={
                  isAuthenticated ? (
                    <AddBorrower setAuth={setAuth} />
                  ) : (
                    <Navigate to="/borrowers" />
                  )
                }
              />

              {/* LOANS */}
              <Route
                exact
                path="/loans"
                element={
                  isAuthenticated ? (
                    <GetAllLoans setAuth={setAuth} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* ADD LOAN (BORROWER PAGE) */}
              <Route
                exact
                path="/addLoan/:id"
                element={
                  isAuthenticated ? (
                    <AddLoan setAuth={setAuth} />
                  ) : (
                    <Navigate to="/loans" />
                  )
                }
              />

              {/* ADD LOANS (LOANS PAGE) */}
              <Route
                exact
                path="/addLoan"
                element={
                  isAuthenticated ? (
                    <AddLoans setAuth={setAuth} />
                  ) : (
                    <Navigate to="/loans" />
                  )
                }
              />

              {/* EDIT LOAN */}
              <Route
                exact
                path="/editLoan/:id"
                element={
                  isAuthenticated ? (
                    <EditLoan setAuth={setAuth} />
                  ) : (
                    <Navigate to="/loans" />
                  )
                }
              />

              {/* PAYMENTS */}
              <Route
                exact
                path="/payments"
                element={
                  isAuthenticated ? (
                    <Payments setAuth={setAuth} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* ADD PAYMENT (BORROWER PAGE) */}
              <Route
                exact
                path="/addPayments/:id"
                element={
                  isAuthenticated ? (
                    <PaymentLoansInfo setAuth={setAuth} />
                  ) : (
                    <Navigate to="/loans" />
                  )
                }
              />

              <Route
                exact
                path="/payment/:client_id/:loan_id"
                element={
                  isAuthenticated ? (
                    <PaymentLoansInfo setAuth={setAuth} />
                  ) : (
                    <Navigate to="/loans" />
                  )
                }
              />

              {/* MESSAGES */}
              <Route
                exact
                path="/emailClient"
                element={
                  isAuthenticated ? (
                    <EmailPage setAuth={setAuth} />
                  ) : (
                    <Navigate to="/home" />
                  )
                }
              />
            </Routes>
          </Fragment>
        </div>
      </div>
    </Router>
  );
}

export default App;
