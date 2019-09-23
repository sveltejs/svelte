import DebugTag from '../../nodes/DebugTag';
import Renderer, { RenderOptions } from '../Renderer';
import { x } from 'code-red';

export default function(node: DebugTag, renderer: Renderer, options: RenderOptions) {
	if (!options.dev) return;

	const filename = options.filename || null;
	const { line, column } = options.locate(node.start + 1);

	const obj = x`{
		${node.expressions.map(e => e.node.name)}
	}`;

	renderer.add_expression(x`@debug(${filename ? x`"${filename}"` : x`null`}, ${line}, ${column}, ${obj})`);
}
