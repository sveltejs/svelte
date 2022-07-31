import Renderer, { RenderOptions } from '../Renderer';
import Head from '../../nodes/Head';
import { x } from 'code-red';

export default function(node: Head, renderer: Renderer, options: RenderOptions) {
	const head_options = {
		...options,
		head_id: node.id
	};

	renderer.push();
	renderer.render(node.children, head_options);
	const result = renderer.pop();

	renderer.add_expression(x`$$result.head += '<!-- HEAD_START data-svelte="${node.id}" -->' + ${result} + '<!-- HEAD_END data-svelte="${node.id}" -->', ""`);
}
