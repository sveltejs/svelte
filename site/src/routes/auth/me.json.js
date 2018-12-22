export function get(req, res) {
	if (!req.session.passport || !req.session.passport.user) {
		res.send(null);
		return;
	}

	const { id, username, displayName, photo } = req.session.passport && req.session.passport.user;
	res.send({ id, username, displayName, photo });
}