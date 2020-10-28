import { escape_html } from '../../utils/stringify.ts';
import Renderer, { RenderOptions } from '../Renderer.ts';
import Text from '../../nodes/Text.ts';
import Element from '../../nodes/Element.ts';

export default function(node: Text, renderer: Renderer, _options: RenderOptions) {
	let text = node.data;
	if (
		!node.parent ||
		node.parent.type !== 'Element' ||
		((node.parent as Element).name !== 'script' && (node.parent as Element).name !== 'style')
	) {
		// unless this Text node is inside a <script> or <style> element, escape &,<,>
		text = escape_html(text);
	}

	renderer.add_string(text);
}
