import Renderer, { RenderOptions } from '../Renderer';
import Title from '../../nodes/Title';

export default function(node: Title, renderer: Renderer, options: RenderOptions) {
	renderer.append(`<title>`);

	renderer.render(node.children, options);

	renderer.append(`</title>`);
}
