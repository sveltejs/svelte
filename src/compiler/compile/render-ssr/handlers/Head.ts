import Renderer, { RenderOptions } from '../Renderer';
import Head from '../../nodes/Head';

export default function(node: Head, renderer: Renderer, options: RenderOptions) {
	renderer.append('${($$result.head += `');

	renderer.render(node.children, options);

	renderer.append('`, "")}');
}
