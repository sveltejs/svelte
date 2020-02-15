import { createReadStream } from 'fs';

export function get(req, res) {
	const path = req.params.file.join('/');
	if (process.env.NODE_ENV !== 'development' || ('/' + path).includes('/.')) {
		res.writeHead(403);
		res.end();
		return;
	}
	createReadStream('../' + path)
		.on('error', () => {
			res.writeHead(403);
			res.end();
		})
		.pipe(res);
	res.writeHead(200, { 'Content-Type': 'text/javascript' });
}
