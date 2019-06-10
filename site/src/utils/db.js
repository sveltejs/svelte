import { Pool } from 'pg';

export const DB = new Pool({
	connectionString: process.env.DATABASE_URL
});

export function query(text, values=[]) {
	return DB.query(text, values).then(r => r.rows);
}

export function find(text, values=[]) {
	return query(text, values).then(arr => arr[0]);
}
