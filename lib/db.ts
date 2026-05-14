import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DB_HOST || "",
  port: parseInt(process.env.DB_PORT || "26140"),
  user: process.env.DB_USER || "",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "okekirim",
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
})

export default pool
