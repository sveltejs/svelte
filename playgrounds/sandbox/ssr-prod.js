import fs from 'node:fs';
import path from 'node:path';
import polka from 'polka';
import { render } from 'svelte/server';
import App from './src/main.svelte';

const { head, body } = render(App);

const rendered = fs
	.readFileSync(path.resolve('./dist/client/index.html'), 'utf-8')
	.replace(`<!--ssr-body-->`, body)
	.replace(`<!--ssr-head-->`, head);

const types = {
	'.js': 'application/javascript',
	'.css': 'text/css'
};

polka()
	.use((req, res) => {
		if (req.url === '/') {
			res.writeHead(200, { 'content-type': 'text/html' });
			res.end(rendered);
			return;
		}

		const file = path.resolve('./dist/client' + req.url);

		if (fs.existsSync(file)) {
			const type = types[path.extname(req.url)] ?? 'application/octet-stream';
			res.writeHead(200, { 'content-type': type });
			fs.createReadStream(file).pipe(res);
			return;
		}

		res.writeHead(404);
		res.end('not found');
	})
	.listen('3000');

console.log('listening on http://localhost:3000');
