export function GET() {
	return new Response(undefined, {
		status: 302,
		headers: { Location: 'https://discord.gg/D6Dzc5m3' }
	});
}
