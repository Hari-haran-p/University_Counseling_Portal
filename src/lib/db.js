import { Pool } from "pg";

const pool = new Pool({
  connectionString: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}`,
  ssl: { rejectUnauthorized: false },
});

export { pool };
