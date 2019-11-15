import Renderer, { RenderOptions } from '../Renderer';
import Title from '../../nodes/Title';

export default function(node: Title, renderer: Renderer, options: RenderOptions) {
	renderer.add_string(`<title>`);

	renderer.render(node.children, options);

	renderer.add_string(`</title>`);
}
