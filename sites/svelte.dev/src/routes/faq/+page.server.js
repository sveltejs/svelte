import { get_parsed_faq, get_faq_data } from '$lib/server/faq/index.js';

export const prerender = true;

export async function load() {
	return { faq: get_parsed_faq(get_faq_data()) };
}
