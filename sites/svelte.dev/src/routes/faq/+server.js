import { redirect } from '@sveltejs/kit';

export const prerender = true;

export function GET() {
	redirect(308, '/docs/faq');
}
