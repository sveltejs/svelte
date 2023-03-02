import Renderer, { RenderOptions } from '../Renderer';
import Head from '../../nodes/Head';
import { x } from 'code-red';
import { Node } from 'estree';

export default function(node: Head, renderer: Renderer, options: RenderOptions) {
	const head_options = {
		...options,
		head_id: node.id
	};

	renderer.push();
	renderer.render(node.children, head_options);
	const result = renderer.pop();
	let expression: Node = result;
	if (options.hydratable) {
		const start_comment = `HEAD_${node.id}_START`;
		const end_comment = `HEAD_${node.id}_END`;
		expression = x`'<!-- ${start_comment} -->' + ${expression} + '<!-- ${end_comment} -->'`;
	}

	renderer.add_expression(x`$$result.head += ${expression}, ""`);
}
