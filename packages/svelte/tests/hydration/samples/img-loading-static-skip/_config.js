import { test } from '../../test';

// `<img loading="...">` used to be treated as a non-static element, which broke the
// run of skipped static nodes around it. Make sure hydration still lands on the right
// nodes (and reuses them) now that it doesn't.
export default test({
	props: { title: 'hello' },

	snapshot(target) {
		const paragraphs = target.querySelectorAll('p');
		const images = target.querySelectorAll('img');

		return {
			h1: target.querySelector('h1'),
			span: target.querySelector('span'),
			img_0: images[0],
			img_1: images[1],
			p_0: paragraphs[0],
			p_1: paragraphs[1],
			p_2: paragraphs[2],
			p_3: paragraphs[3]
		};
	}
});
