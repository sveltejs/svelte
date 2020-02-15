import { Pool } from 'pg';

// Uses `PG*` ENV vars
export const DB = process.env.PGHOST ? new Pool() : null;

export function query(text, values=[]) {
	return DB.query(text, values).then(r => r.rows);
}

export function find(text, values=[]) {
	return query(text, values).then(arr => arr[0]);
}
