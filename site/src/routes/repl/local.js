import { createReadStream } from 'fs';

export function get(req, res) {
	if (process.env.NODE_ENV !== 'development' || !/^[a-z.]+$/.test(req.query.file)) {
		res.writeHead(403);
		res.end();
		return;
	}
	createReadStream('../' + req.query.file)
		.on('error', () => {
			res.writeHead(403);
			res.end();
		})
		.pipe(res);
	res.writeHead(200, { 'Content-Type': 'text/javascript' });
}
