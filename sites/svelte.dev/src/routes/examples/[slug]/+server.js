import { redirect } from '@sveltejs/kit';

export async function GET({ params }) {
	throw redirect(308, `/repl/${params.slug}`);
}
