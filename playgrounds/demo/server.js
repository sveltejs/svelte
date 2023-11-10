import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer, build } from 'vite';

const PORT = process.env.PORT || '3000';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.NODE_ENV = 'development';

async function createServer() {
	const app = express();

	const vite = await createViteServer({
		server: { middlewareMode: true },
		appType: 'custom'
	});

	app.use(vite.middlewares);

	app.use('*', async (req, res) => {
		if (req.originalUrl !== '/') {
			res.sendFile(path.resolve('./dist' + req.originalUrl));
			return;
		}

		// Uncomment the line below to enable optimizer.
		// process.env.SVELTE_ENV = 'hydrate';

		await build({
			root: path.resolve(__dirname, './'),
			build: {
				minify: false,
				rollupOptions: {
					output: {
						manualChunks(id) {
							if (id.includes('svelte/src')) {
								return 'vendor';
							}
						}
					}
				}
			}
		});

		const template = fs.readFileSync(path.resolve(__dirname, 'dist', 'index.html'), 'utf-8');

		const { html: appHtml, head: headHtml } = await vite.ssrLoadModule('/src/entry-server.ts');

		const html = template.replace(`<!--ssr-html-->`, appHtml).replace(`<!--ssr-head-->`, headHtml);

		res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
	});

	return { app, vite };
}

createServer()
	.then(({ app }) =>
		app.listen(PORT, () => {
			// eslint-disable-next-line no-console
			console.log(`http://localhost:${PORT}`);
		})
	)
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.error('Error Starting Server:\n', err);
		process.exit(1);
	});
