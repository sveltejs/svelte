export async function GET(req) {
	const query = req.url.searchParams;
	const minString = query.get('min') || '0';
	const maxString = query.get('max') || '100';
	const min = +minString;
	const max = +maxString;

	// simulate a long delay
	await new Promise((res) => setTimeout(res, 1000));

	// fail sometimes
	if (Math.random() < 0.333) {
		return new Response(`Failed to generate random number. Please try again`, {
			status: 400,
			headers: { 'Access-Control-Allow-Origin': '*' }
		});
	}

	const num = min + Math.round(Math.random() * (max - min));
	return new Response(String(num), {
		headers: { 'Access-Control-Allow-Origin': '*' }
	});
}
