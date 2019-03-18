import { escape_html, escape_template, escape } from '../../utils/stringify';

export default function(node, renderer, options) {
	let text = node.data;
	if (
		!node.parent ||
		node.parent.type !== 'Element' ||
		(node.parent.name !== 'script' && node.parent.name !== 'style')
	) {
		// unless this Text node is inside a <script> or <style> element, escape &,<,>
		text = escape_html(text);
	}
	renderer.append(escape(escape_template(text)));
}