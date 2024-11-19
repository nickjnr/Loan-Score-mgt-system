import mysql from "mysql2/promise"; // Use mysql2/promise for async/await support

const connectDatabase = () => {
  return mysql.createPool({
    host: "localhost",
    user: "root", // Your MySQL username
    port: 3306,
    password: "", // Your MySQL password
    database: "lending", // The name of your MySQL database
  });
};

export { connectDatabase };
