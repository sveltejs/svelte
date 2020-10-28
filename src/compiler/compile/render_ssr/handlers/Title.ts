import Renderer, { RenderOptions } from '../Renderer.ts';
import Title from '../../nodes/Title.ts';
import { x } from 'code-red';

export default function(node: Title, renderer: Renderer, options: RenderOptions) {
	renderer.push();

	renderer.add_string('<title>');

	renderer.render(node.children, options);

	renderer.add_string('</title>');
	const result = renderer.pop();

	renderer.add_expression(x`$$result.title = ${result}, ""`);
}
