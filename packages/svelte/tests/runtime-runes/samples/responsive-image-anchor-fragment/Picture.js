import { append, comment, from_html } from 'svelte/internal/client';

const parent_template = from_html('<div><!></div>');
const picture_template = from_html(
	'<picture><source srcset="small.webp 400w, large.webp 800w" sizes="100vw" type="image/webp"> <img src="small.jpg" srcset="small.jpg 400w, large.jpg 800w" sizes="100vw" alt=""></picture>'
);

export default function Picture(anchor) {
	const parent = parent_template();
	const fragment = comment();
	const fragment_anchor = fragment.lastChild;
	const picture = picture_template();
	const img = picture.querySelector('img');

	img.dataset.pageDocument = String(img.ownerDocument === document);
	append(fragment_anchor, picture);
	parent.firstChild.before(fragment);
	append(anchor, parent);
}
