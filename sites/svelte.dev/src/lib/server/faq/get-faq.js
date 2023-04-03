// @ts-check
import fs from 'node:fs';
import { extract_frontmatter } from '../markdown';

const base = '../../site/content/faq';

/**
 * @returns {import('./types').FAQData}
 */
export function get_faq_data() {
	const faqs = [];

	for (const file of fs.readdirSync(base)) {
		const { metadata, body } = extract_frontmatter(fs.readFileSync(`${base}/${file}`, 'utf-8'));

		faqs.push({
			title: metadata.question, // Initialise with empty
			slug: file.split('-').slice(1).join('-').replace('.md', ''),
			content: body
		});
	}

	return faqs;
}
