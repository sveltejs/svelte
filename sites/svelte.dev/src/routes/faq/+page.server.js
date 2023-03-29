import { get_parsed_faq } from '$lib/server/faq';
import { get_faq_data } from '$lib/server/faq/get-faq';

export const prerender = true;

export async function load() {
	return { faqs: get_parsed_faq(get_faq_data()) };
}
