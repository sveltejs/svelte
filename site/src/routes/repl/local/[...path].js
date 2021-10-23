import { readFileSync } from 'fs';

export function get({ params: { path } }) {
	if (process.env.NODE_ENV !== 'development' || ('/' + path).includes('/.')) {
		return { status: 403 };
	}
	return {
		headers: { 'Content-Type': 'text/javascript' },
		body: readFileSync('../' + path)
	};
}
