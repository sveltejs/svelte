import fetch from 'node-fetch';
import { body } from './_utils.js';

export async function get(req, res) {
	const { id } = req.params;

	const headers = {};
	const user = req.session && req.session.passport && req.session.passport.user;
	if (user) {
		headers.Authorization = `token ${user.token}`;
	}

	const r = await fetch(`https://api.github.com/gists/${id}`, {
		headers
	});

	res.writeHead(r.status, {
		'Content-Type': 'application/json'
	});

	const result = await r.json();

	if (r.status === 200) {
		res.end(JSON.stringify({
			id: result.id,
			description: result.description,
			owner: result.owner,
			html_url: result.html_url,
			files: result.files
		}));
	} else {
		res.end(JSON.stringify(result));
	}
}

export async function patch(req, res) {
	const user = req.session && req.session.passport && req.session.passport.user;

	if (!user) {
		res.writeHead(403, {
			'Content-Type': 'application/json'
		});
		res.end(JSON.stringify({ error: 'unauthorized' }));
		return;
	}

	try {
		const { description, files } = await body(req);

		const r = await fetch(`https://api.github.com/gists/${req.params.id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `token ${user.token}`
			},
			body: JSON.stringify({
				description,
				files
			})
		});

		res.writeHead(r.status, {
			'Content-Type': 'application/json'
		});

		if (r.status === 200) {
			res.end(JSON.stringify({
				ok: true
			}));
		} else {
			res.end(await r.text());
		}
	} catch (err) {
		res.writeHead(500, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			error: err.message
		}));
	}
}