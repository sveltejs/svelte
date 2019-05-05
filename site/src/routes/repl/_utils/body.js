export default function body(req) {
	return new Promise((fulfil, reject) => {
		let str = '';

		req.on('error', reject);

		req.on('data', chunk => {
			str += chunk;
		});

		req.on('end', () => {
			try {
				fulfil(JSON.parse(str));
			} catch (err) {
				reject(err);
			}
		});
	});
}