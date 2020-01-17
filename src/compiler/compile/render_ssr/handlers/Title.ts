import Renderer, { RenderOptions } from '../Renderer';
import Title from '../../nodes/Title';
import { x } from 'code-red';

export default function(node: Title, renderer: Renderer, options: RenderOptions) {
	renderer.push();

	renderer.add_string('<title');
	if (options.hydratable && options.head_id) {
		renderer.add_string(` data-svelte="${options.head_id}"`);
	}
	renderer.add_string('>');

	renderer.render(node.children, options);

	renderer.add_string(`</title>`);
	const result = renderer.pop();

	renderer.add_expression(x`($$result.title = ${result}, "")`);
}
