import send from '@polka/send';
import get_faqs from './_faqs.js';

let json;

export function get(req, res) {
	if (!json || process.env.NODE_ENV !== 'production') {
		const faqs = get_faqs()
			.map(faq => {
				return {
					fragment: faq.fragment,
					answer: faq.answer,
					metadata: faq.metadata
				};
			});

		json = JSON.stringify(faqs);
	}

	send(res, 200, json, {
		'Content-Type': 'application/json',
		'Cache-Control': `max-age=${5 * 60 * 1e3}` // 5 minutes
	});
}
