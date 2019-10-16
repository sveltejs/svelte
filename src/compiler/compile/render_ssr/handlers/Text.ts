import { escape_html } from '../../utils/stringify';
import Renderer, { RenderOptions } from '../Renderer';
import Text from '../../nodes/Text';
import Element from '../../nodes/Element';

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
