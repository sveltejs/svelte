import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { head, html } from './server/entry-server.js';

const rendered = fs
	.readFileSync(path.resolve('./dist/client/index.html'), 'utf-8')
	.replace(`<!--ssr-html-->`, html)
	.replace(`<!--ssr-head-->`, head);

express()
	.use('*', async (req, res) => {
		if (req.originalUrl !== '/') {
			res.sendFile(path.resolve('./dist/client' + req.originalUrl));
			return;
		}

		res.status(200).set({ 'Content-Type': 'text/html' }).end(rendered);
	})
	.listen('3000');

console.log('listening on http://localhost:3000');
