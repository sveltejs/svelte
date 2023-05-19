// @ts-check
import { render_markdown } from '../markdown/renderer';

/** @param {import('./types').FAQData} faq_data */
export async function get_parsed_faq(faq_data) {
	const str = faq_data.map(({ content, title }) => `## ${title}\n\n${content}`).join('\n\n');

	return await render_markdown('faq', str);
}
