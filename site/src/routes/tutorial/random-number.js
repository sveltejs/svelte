export async function get(req) {
	let { min = '0', max = '100' } = req.query;
	min = +min;
	max = +max;

	// simulate a long delay
	await new Promise((res) => setTimeout(res, 1000));

	// fail sometimes
	if (Math.random() < 0.333) {
		return {
			status: 400,
			headers: { 'Access-Control-Allow-Origin': '*' },
			body: `Failed to generate random number. Please try again`
		};
	}

	const num = min + Math.round(Math.random() * (max - min));
	return {
		headers: { 'Access-Control-Allow-Origin': '*' },
		body: String(num)
	};
}
