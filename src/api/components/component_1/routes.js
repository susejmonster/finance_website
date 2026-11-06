import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const getUsers = async (request, response) => {
  try {
    // Changed 'employees' to 'Users'
    const results = await pool.query('SELECT * FROM Users ORDER BY employeeid ASC');
    response.status(200).json(results.rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    response.status(500).json({ error: error.message });
  }
};

const createEmployee = async (req, res) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    departmentId,
    salary,
    hireDate,
  } = req.body || {};

  try {
    // Changed 'Employees' to 'Users'
    const query = `
      INSERT INTO Users (FirstName, LastName, DateOfBirth, Gender, DepartmentID, Salary, HireDate)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      firstName,
      lastName,
      dateOfBirth,
      gender,
      departmentId,
      salary,
      hireDate,
    ];

    const results = await pool.query(query, values);

    res.status(201).json({
      message: `Employee added with ID: ${results.rows[0].employeeid}`,
      employee: results.rows[0],
    });
  } catch (error) {
    console.error('Error creating employee:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const gett_eeid = async (req, res) => {
  // Extract employeeid from query string, route params, or request body
  const employeeid = req.query.employeeid || req.params.employeeid || req.body.employeeid;
  const transactiondate = req.query.transactiondate;

  if (!employeeid) {
    return res.status(400).json({ 
      error: "employeeid is missing! Ensure your frontend passes it (e.g., /eeid?employeeid=1)" 
    });
  }

  try {
    let query = `
      SELECT 
        t.transactionid,
        t.employeeid,
        t.amount,
        t.transactiondate,
        t.description,
        tc.categoryname,
        tc.categorytype
      FROM transactions t
      JOIN transactioncategories tc ON t.categoryid = tc.categoryid
      WHERE t.employeeid = $1
    `;
    const values = [employeeid];

    if (transactiondate) {
      query += ` AND t.transactiondate = $2`;
      values.push(transactiondate);
    }
    query += ` ORDER BY t.transactiondate DESC`;

    const results = await pool.query(query, values);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error fetching employee transactions:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const post_eeid = async (req, res) => {
  const {
    transactiondate,
    amount,
    description,
    categoryid,
  } = req.body || {};
  
  // Extract employeeid from body, query, or params
  const employeeid = req.body.employeeid || req.query.employeeid || req.params.employeeid;

  try {
    if (!employeeid) {
      return res.status(400).json({ error: "employeeid is missing!" });
    }

    const finalCategoryId = categoryid || 1;

    const query = `
      INSERT INTO Transactions (EmployeeID, CategoryID, Amount, TransactionDate, Description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [employeeid, finalCategoryId, amount, transactiondate, description];
    const results = await pool.query(query, values);

    res.status(201).json({
      message: `Transaction added with ID: ${results.rows[0].transactionid}`,
      transaction: results.rows[0],
    });
  } catch (error) {
    console.error('Error creating transaction:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const loginEmployee = async (request, response) => {
  try {
    const { username, password } = request.body || {};
    console.log("LOGIN REQUEST BODY:", request.body);
    if (!username|| !password) {
      return response.status(400).json({ message: 'Employee ID and password are required' });
    }

    const query = 'SELECT * FROM Users WHERE FirstName ILIKE $1';
    const results = await pool.query(query, [username]);
   
    if (results.rows.length === 0) {
      return response.status(401).json({ message: 'Employee ID not found' });
    }

   
    const user = results.rows[0];
    console.log("DATABASE FOUND THIS USER:", user);
    if (user.pass === password) {
      return response.status(200).json({
        message: 'Login successful',
        user: user,
      });
    } else {
      return response.status(401).json({ message: 'Incorrect password' });
    }

  } catch (error) {
    console.error('DETAILED LOGIN ERROR:', error.message);
    return response.status(500).json({ message: error.message });
  }
};


export {
  getUsers,
  createEmployee,
  gett_eeid,
  post_eeid,
  loginEmployee,
};