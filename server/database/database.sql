-- Create the database
CREATE DATABASE lending;

-- Use the newly created database
USE lending;

-- Create the clients table
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  contactNumber INT,
  email VARCHAR(255),
  address VARCHAR(255),
  username VARCHAR(255)
);

-- Create the admin table
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  contactNumber INT,
  email VARCHAR(255),
  address VARCHAR(255),
  password VARCHAR(255),
  username VARCHAR(255)
);

-- Create the loans table
CREATE TABLE loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  balance DECIMAL(12, 2),
  gross_loan DECIMAL(12, 2),
  amort DECIMAL(12, 2),
  terms INT,
  date_released DATETIME,
  maturity_date DATE,
  type VARCHAR(255),
  status VARCHAR(255),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Create the payments table
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  loan_id INT,
  amount DECIMAL(12, 2),
  new_balance DECIMAL(12, 2),
  collection_date DATETIME,
  collected_by VARCHAR(255),
  method VARCHAR(255),
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (loan_id) REFERENCES loans(id)
);

-- Insert data into clients table
INSERT INTO clients (firstName, lastName, contactNumber, email, address, username)
VALUES 
('Elon', 'Musk', 444333, 'elonmusk@gmail.com', 'Boca Chica, Texas', 'notElonMusk'),
('Peter', 'Parker', 555666, 'peterparker@gmail.com', 'New York', 'notPeterParker'),
('Tony', 'Stark', 777888, 'tonystark@gmail.com', 'New York', 'notTonyStark'),
('Bruce', 'Banner', 999000, 'bruce@gmail.com', 'New York', 'notHulk'),
('Stephen', 'Strange', 111222, 'stephen@gmail.com', 'New York', 'notStrange');

-- Update a client record (make sure id=9 exists, otherwise adjust accordingly)
UPDATE clients 
SET firstName = 'Ian Czar', 
    lastName = 'Dino', 
    contactNumber = 112233, 
    address = 'Daraga Albay', 
    email = 'ianczar@gmail.com', 
    username = 'ian2' 
WHERE id = 1;  -- Use an existing id here, adjust if necessary

-- Insert data into loans table
INSERT INTO loans (client_id, balance, gross_loan, amort, terms, date_released, maturity_date, type, status) 
VALUES 
(1, 5000, 5000, 2500, 1, '2023-02-04 05:30:01', '2023-03-04', 'Personal Loan', 'Pending');

-- Insert another loan to ensure loan_id = 2 exists for the payments table
INSERT INTO loans (client_id, balance, gross_loan, amort, terms, date_released, maturity_date, type, status) 
VALUES 
(1, 7000, 7000, 3500, 1, '2023-03-05 05:30:01', '2023-04-05', 'Salary Loan', 'Pending');

-- Insert data into payments table using a valid loan_id
INSERT INTO payments (client_id, loan_id, amount, new_balance, collection_date, collected_by, method) 
VALUES (1, 2, 5000, 0, '2023-03-04', 'admin', 'ATM');

-- Joined data query
SELECT * 
FROM clients 
INNER JOIN loans ON clients.id = loans.client_id;

-- Another join query with LEFT JOIN
SELECT * 
FROM clients AS c 
LEFT JOIN loans AS l ON c.id = l.client_id 
WHERE c.id = 1;  -- Adjust this ID as needed
