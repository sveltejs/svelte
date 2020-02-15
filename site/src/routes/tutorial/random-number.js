export function get(req, res) {
	let { min = '0', max = '100' } = req.query;
	min = +min;
	max = +max;

	res.setHeader('Access-Control-Allow-Origin', '*');

	// simulate a long delay
	setTimeout(() => {
		// fail sometimes
		if (Math.random() < 0.333) {
			res.statusCode = 400;
			res.end(`Failed to generate random number. Please try again`);
			return;
		}

		const num = min + Math.round(Math.random() * (max - min));
		res.end(String(num));
	}, 1000);
}