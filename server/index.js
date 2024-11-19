import express from "express";
import bodyParser from "body-parser";
import { connectDatabase } from "./pool.js";
import bcrypt from "bcryptjs";
import { generateJWT } from "./utils/jwtGenerator.js";
import { auth } from "./middlewares/auth.js";
import cors from "cors";
const pool = connectDatabase();
const app = express();

app.use(bodyParser.json());
app.use(cors());

const PORT = 8000;

//* LOGIN SESSIONS
//! AUTHENTICATION ROUTES

//LOGIN ROUTE
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Use placeholders for MySQL query
    const [rows] = await pool.query(`SELECT * FROM admins WHERE username = ?`, [
      username,
    ]);

    // Check if admin exists
    if (rows.length === 0) {
      return res.status(401).json({ error: "Username or password is wrong" });
    }

    const admin = rows[0]; // Access the first row from the result

    // Compare the password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Username or password is wrong" });
    }

    // Generate JWT token
    const token = generateJWT({ id: admin.id, username: admin.username });

    // Return the token to the client
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Add admin details in the database
app.post("/addAdmin", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      contactNumber,
      address,
      email,
      username,
      password,
    } = req.body;

    // Validate input
    if (
      !firstname ||
      !lastname ||
      !contactNumber ||
      !address ||
      !email ||
      !username ||
      !password
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Use placeholders for MySQL query to check if the username already exists
    const [existingAdmin] = await pool.query(
      `SELECT * FROM admins WHERE username = ?`,
      [username]
    );

    // Check if the username already exists
    if (existingAdmin.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // Insert the new admin into the database
    const [newAdmin] = await pool.query(
      `INSERT INTO admins (firstname, lastname, contactnumber, address, email, password, username) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        firstname,
        lastname,
        contactNumber,
        address,
        email,
        bcryptPassword,
        username,
      ]
    );

    // Check if the insertion was successful
    if (newAdmin.affectedRows > 0) {
      const adminId = newAdmin.insertId; // Retrieve the inserted admin's ID
      const token = generateJWT({ id: adminId, username }); // Create JWT token
      return res.json({ token }); // Respond with the token
    } else {
      return res.status(500).json({ error: "Failed to add admin" });
    }
  } catch (error) {
    console.error("Error adding admin:", error.message); // Log the error message
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//! PRIVATE ROUTES
//* ADMIN
app.post("/register", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      contactNumber,
      address,
      email,
      username,
      password,
    } = req.body;

    const admin = await pool.query(
      `SELECT * FROM admins WHERE username = '${username}'`
    );

    if (admin.rows.length > 0) {
      res.status(401).send("User already exist");
    }

    // bcrypt
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);

    const bcryptPassword = await bcrypt.hash(password, salt);

    const newAdmin = await pool.query(
      `INSERT INTO admins (firstname, lastname, contactnumber, address, email, password, username) VALUES ('${firstname}', '${lastname}', ${contactNumber}, '${address}', '${email}', '${bcryptPassword}', '${username}') RETURNING *`
    );

    const token = generateJWT(newAdmin.rows[0]);

    res.json({ token });
  } catch (error) {
    console.log(error);
  }
});

//get the user profile
app.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user contains the user id
    const [rows] = await pool.query(
      "SELECT firstName, lastName, contactNumber, address, email FROM admins WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ err: "User not found" });
    }

    // Send the user data back to the client
    res.json({
      id: rows[0].id,
      firstName: rows[0].firstName,
      lastName: rows[0].lastName,
      contactNumber: rows[0].contactNumber, // Added contactNumber
      address: rows[0].address, // Added address
      email: rows[0].email, // Added email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "Server error" });
  }
});

app.get("/allAdmins", auth, async (req, res) => {
  try {
    // Use placeholders for MySQL query to get all admins
    const [rows] = await pool.query(`SELECT * FROM admins`);

    // Return the list of admins
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/admins/:id", async (req, res) => {
  try {
    const id = req.params["id"];
    await pool.query(`DELETE FROM admins WHERE id = ${id}`);

    res.json({ msg: `Deleted admin with an id of ${id}` });
  } catch (error) {
    console.log(error);
  }
});

//* CLIENTS
app.get("/allClients", auth, async (req, res) => {
  try {
    const [getClient] = await pool.query(`SELECT * FROM clients`);

    res.json(getClient);
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/client/:id", auth, async (req, res) => {
  try {
    const id = req.params["id"];

    // Use parameterized query to prevent SQL injection
    const [getClient] = await pool.query("SELECT * FROM clients WHERE id = ?", [
      id,
    ]);

    if (getClient.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Return the first row from the query result
    res.json(getClient[0]);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Client Email
app.get("/email/:email", auth, async (req, res) => {
  try {
    const email = req.params["email"];

    // Use a parameterized query to prevent SQL injection
    const [getClient] = await pool.query(
      `SELECT * FROM clients WHERE email = ?`,
      [email]
    );

    if (getClient.length > 0) {
      res.json(getClient[0]);
    } else {
      res.status(404).json({ message: "Client not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// New Client
app.post("/addClient", async (req, res) => {
  try {
    const { firstname, lastname, contactNumber, address, email, username } =
      req.body;

    // Check if the user already exists
    const [existingUser] = await pool.query(
      `SELECT * FROM clients WHERE username = ?`,
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(401).send("User already exists");
    }

    // Insert new client into the database using parameterized query
    const [newClient] = await pool.query(
      `INSERT INTO clients (firstname, lastname, contactnumber, address, email, username) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [firstname, lastname, contactNumber, address, email, username]
    );

    // Fetch the newly inserted client using the insertId
    const [insertedClient] = await pool.query(
      `SELECT * FROM clients WHERE id = ?`,
      [newClient.insertId]
    );

    res.json(insertedClient[0]); // Send the inserted client as response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/clients/:id", async (req, res) => {
  try {
    const id = req.params["id"];
    const { firstname, lastname, contactNumber, email, address } = req.body;

    // const updateClient = await pool.query(
    //   `UPDATE clients SET firstname = '${firstname}', lastname = '${lastname}', contactNumber = '${contactNumber}', email = '${email}', address = '${address}' WHERE id = ${id} RETURNING *`

    const updateClient = await pool.query(
      `UPDATE clients SET firstname = '${firstname}', lastname = '${lastname}', contactNumber = ${contactNumber}, address = '${address}', email = '${email}' WHERE id = ${id} RETURNING *;`
    );

    res.json(updateClient.rows);
  } catch (error) {
    console.log(error);
  }
});

app.delete("/clients/:id", async (req, res) => {
  try {
    const id = req.params["id"];
    await pool.query(`DELETE FROM clients WHERE id = ${id}`);

    res.json({ msg: `Deleted client with an id of ${id}` });
  } catch (error) {
    console.log(error);
  }
});

//* LOANS

// Get all loans
app.get("/allLoans", auth, async (req, res) => {
  try {
    const [loans] = await pool.query(
      `SELECT c.firstname, c.lastname, l.id, l.type, l.gross_loan, l.amort, l.terms, l.date_released, l.maturity_date, l.balance, l.status 
       FROM loans AS l 
       INNER JOIN clients AS c ON l.client_id = c.id`
    );

    if (!loans || loans.length === 0) {
      return res.status(404).json({ message: "No loans found" });
    }

    res.json(loans);
  } catch (error) {
    // Remove debugging log
    res.status(500).json({ message: "Server error" });
  }
});

// Get loans of one client
app.get("/loans/:id", auth, async (req, res) => {
  try {
    const id = req.params["id"];

    // Use parameterized query to prevent SQL injection
    const [getClientLoans] = await pool.query(
      `SELECT c.firstname, c.id AS clientId, l.id AS loanId, l.type, l.gross_loan, l.amort, 
      l.terms, l.date_released, l.maturity_date, l.balance, l.status 
      FROM loans AS l 
      INNER JOIN clients AS c 
      ON l.client_id = c.id 
      WHERE c.id = ?`,
      [id]
    );

    if (getClientLoans.length === 0) {
      return res.status(404).json({ error: "No loans found for this client" });
    }

    res.json(getClientLoans);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get loan
app.get("/loan/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [getLoan] = await pool.query(
      `SELECT c.firstname, c.lastname, l.id, l.client_id, l.type, l.gross_loan, l.amort, l.terms, l.date_released, l.maturity_date, l.balance, l.status 
       FROM loans AS l 
       INNER JOIN clients AS c ON l.client_id = c.id 
       WHERE l.id = ?`,
      [id]
    );

    if (!getLoan.length) {
      return res.status(404).json({ error: "Loan not found" });
    }

    res.json(getLoan[0]); // Send the first row
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get loan's maturity date
app.get("/dates", auth, async (req, res) => {
  try {
    const id = req.params["id"];

    const getLoan = await pool.query(`SELECT maturity_date FROM loans`);

    res.json(getLoan.rows);
  } catch (error) {
    console.log(error.message);
  }
});

// Create loan for borrower page
app.post("/loans/:id", auth, async (req, res) => {
  try {
    const id = req.params["id"];

    const {
      type,
      gross_loan,
      balance,
      amort,
      terms,
      date_released,
      maturity_date,
    } = req.body;

    // Use parameterized query to prevent SQL injection
    const query = `
      INSERT INTO loans (client_id, type, status, balance, gross_loan, amort, terms, date_released, maturity_date) 
      VALUES (?, ?, 'Pending', ?, ?, ?, ?, ?, ?)
    `;

    // Execute query with parameters
    const [newLoan] = await pool.query(query, [
      id,
      type,
      balance,
      gross_loan,
      amort,
      terms,
      date_released,
      maturity_date,
    ]);

    res.json(newLoan);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Create loan for loans page
app.post("/loans/", auth, async (req, res) => {
  try {
    const {
      client_id,
      type,
      status,
      gross_loan,
      balance,
      amort,
      terms,
      date_released,
      maturity_date,
    } = req.body;

    // Use a parameterized query to prevent SQL injection
    const [newLoan] = await pool.query(
      `INSERT INTO loans (client_id, type, status, balance, gross_loan, amort, terms, date_released, maturity_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_id,
        type,
        status,
        balance,
        gross_loan,
        amort,
        terms,
        date_released,
        maturity_date,
      ]
    );

    // MySQL does not support `RETURNING *`, so we can use the insertId to fetch the inserted record
    const [insertedLoan] = await pool.query(
      `SELECT * FROM loans WHERE id = ?`,
      [newLoan.insertId]
    );

    res.json(insertedLoan[0]); // Send the inserted loan record back
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update loan
app.patch("/loans/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      balance,
      gross_loan,
      amort,
      terms,
      date_released,
      maturity_date,
      status,
    } = req.body;

    // Update query with parameterized values
    const updateLoan = await pool.query(
      `UPDATE loans 
       SET type = ?, balance = ?, gross_loan = ?, amort = ?, terms = ?, date_released = ?, maturity_date = ?, status = ?
       WHERE id = ?`,
      [
        type,
        balance,
        gross_loan,
        amort,
        terms,
        date_released,
        maturity_date,
        status,
        id,
      ]
    );

    // Check if any rows were updated
    if (updateLoan.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Loan not found or no changes made" });
    }

    // Fetch the updated loan
    const [updatedLoan] = await pool.query(`SELECT * FROM loans WHERE id = ?`, [
      id,
    ]);

    res.json(updatedLoan);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE LOAN PAYMENT
app.patch("/loan/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const updateLoan = await pool.query(
      `UPDATE loans SET balance = payments.new_balance FROM payments WHERE payments.loan_id = ${id} RETURNING *`
    );

    // If id is not the real user
    // if (updateLoan.rows.length === 0) {
    //   return res.json('This loan is not yours');
    // }

    // console.log(updateLoan.rows);
    res.json(updateLoan.rows);
  } catch (error) {
    console.log(error.message);
  }
});

// Delete payment
app.delete("/payment/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Using a parameterized query
    const [deletePayment] = await pool.query(
      `DELETE FROM payments WHERE id = ?`,
      [id]
    );

    if (deletePayment.affectedRows === 0) {
      return res
        .status(403)
        .json("You are not authorized to delete this payment");
    }

    res.json({ msg: `Deleted payment with an id of ${id}` });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete loan
app.delete("/loans/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // First, delete related payments
    const [deletePayments] = await pool.query(
      "DELETE FROM payments WHERE loan_id = ?",
      [id]
    );

    // Then, delete the loan
    const [deleteLoan] = await pool.query("DELETE FROM loans WHERE id = ?", [
      id,
    ]);

    if (deleteLoan.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Loan not found or not authorized to delete" });
    }

    res.json({ msg: `Deleted loan with an ID of ${id}` });
  } catch (error) {
    console.error("Error deleting loan:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

//* PAYMENTS
// View all payments
app.get("/allPayments", auth, async (req, res) => {
  try {
    const [payments] = await pool.query(
      `SELECT c.firstname, c.lastname, p.id, p.amount, p.collection_date, p.new_balance, p.collected_by, p.method, p.loan_id 
       FROM payments AS p 
       INNER JOIN clients AS c ON p.client_id = c.id`
    );

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No payments found" });
    }

    res.json(payments);
  } catch (error) {
    // Remove debugging log
    res.status(500).json({ message: "Server error" });
  }
});

// View all client payments to single loan
app.get("/payments/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    const [getPayments] = await pool.query(
      `SELECT * FROM payments WHERE client_id = ?`,
      [id]
    );

    res.json(getPayments); // getPayments already contains the result rows
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Create payment for single loan
app.post("/payments/:id", auth, async (req, res) => {
  const id = req.params.id;

  const {
    amount,
    collection_date,
    collected_by,
    new_balance,
    method,
    client_id,
  } = req.body;

  // Input validation
  if (!amount || !collection_date || !collected_by || !method || !client_id) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Insert payment
    const result = await pool.query(
      `INSERT INTO PAYMENTS (amount, collection_date, collected_by, new_balance, method, client_id, loan_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        amount,
        collection_date,
        collected_by,
        new_balance,
        method,
        client_id,
        id,
      ]
    );

    // Get the last inserted ID
    const paymentId = result[0].insertId;

    // Fetch the inserted payment details
    const [addedPayment] = await pool.query(
      `SELECT * FROM PAYMENTS WHERE id = ?`,
      [paymentId]
    );

    res.json(addedPayment); // Return the inserted row
  } catch (error) {
    console.error("Error adding payment:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/loans/", auth, async (req, res) => {
  try {
    const {
      amount,
      collection_date,
      collected_by,
      new_balance,
      method,
      loan_id,
    } = req.body;

    const addPayment = await pool.query(
      `INSERT INTO payments (amount, collection_date, collected_by, new_balance, method, loan_id) VALUES (${amount}, '${collection_date}', '${collected_by}', ${new_balance}, '${method}', ${loan_id}) RETURNING *`
    );

    res.json(addPayment.rows[0]);
  } catch (error) {
    console.log(error.message);
  }
});

// PAYMENT W. CLIENT ID AND LOAN ID
app.get("/payment/:client/:loan", auth, async (req, res) => {
  try {
    const client_id = req.params["client"];
    const loan_id = req.params["loan"];

    const getPayments = await pool.query(
      `SELECT * FROM payments WHERE client_id = ${client_id} AND loan_id = ${loan_id};`
    );

    res.json(getPayments.rows);
  } catch (error) {
    console.log(error.message);
  }
});

//
app.listen(PORT, () => {
  console.log(`Server has started on http://localhost:${PORT}`);
});
