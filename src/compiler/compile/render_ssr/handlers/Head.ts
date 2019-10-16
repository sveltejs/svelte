import Renderer, { RenderOptions } from '../Renderer';
import Head from '../../nodes/Head';
import { x } from 'code-red';

export default function(node: Head, renderer: Renderer, options: RenderOptions) {
	renderer.push();
	renderer.render(node.children, options);
	const result = renderer.pop();

	renderer.add_expression(x`($$result.head += ${result}, "")`);
}
