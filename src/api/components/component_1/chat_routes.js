//sokcet io test endpoints
const getChatHistory = async (req, res) => {
  try {
    const query = `
      SELECT t.TextID, t.txtText as text, t.Timestamp, u.FirstName, u.EmployeeID as userId
      FROM Texts t
      JOIN Users u ON t.UserID = u.EmployeeID
      ORDER BY t.Timestamp ASC
    `;
    const results = await pool.query(query);
    res.status(200).json(results.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveChatMessage = async (userId, text) => {
  try {
    // 1. Insert the new message
    const insertQuery = `
      INSERT INTO Texts (UserID, txtText)
      VALUES ($1, $2)
      RETURNING TextID as textid, txtText as text, Timestamp, UserID as userid
    `;
    const insertResult = await pool.query(insertQuery, [userId, text]);
    const savedMessage = insertResult.rows[0];

    // 2. Fetch the user's first name to broadcast to others
    const userQuery = 'SELECT FirstName FROM Users WHERE EmployeeID = $1';
    const userResult = await pool.query(userQuery, [userId]);
    
    return {
      ...savedMessage,
      firstname: userResult.rows[0].firstname
    };
  } catch (error) {
    throw error;
  }
};

export {
    saveChatMessage,
    getChatHistory
}