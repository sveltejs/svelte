import send from '@polka/send';

export function get(req, res) {
	if (!req.session || !req.session.passport || !req.session.passport.user) {
		return send(res, 200, 'null');
	}

	const { id, username, displayName, photo } = req.session.passport.user;
	send(res, 200, { id, username, displayName, photo });
}
