import { json } from '@sveltejs/kit';
import results from '../results.json';

export function GET() {
	return json(results);
}
