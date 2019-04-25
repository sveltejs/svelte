import fetch from 'node-fetch';
import { body } from './_utils.js';
import send from '@polka/send';

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

	const result = await r.json();

	if (r.status === 200) {
		send(res, 200, {
			id: result.id,
			description: result.description,
			owner: result.owner,
			html_url: result.html_url,
			files: result.files
		});
	} else {
		send(res, r.status, result);
	}
}

export async function patch(req, res) {
	const user = req.session && req.session.passport && req.session.passport.user;

	if (!user) {
		return send(res, 403, { error: 'unauthorized' });
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

		if (r.status === 200) {
			send(res, 200, { ok: true });
		} else {
			send(res, r.status, await r.text(), {
				'Content-Type': 'application/json'
			});
		}
	} catch (err) {
		send(res, 500, {
			error: err.message
		});
	}
}
