import { stringify } from '../../utils/stringify';
import DebugTag from '../../nodes/DebugTag';
import Renderer, { RenderOptions } from '../Renderer';
export default function(node: DebugTag, renderer: Renderer, options: RenderOptions) {
	if (!options.dev) return;

	const filename = options.filename || null;
	const { line, column } = options.locate(node.start + 1);

	const obj = node.expressions.length === 0
		? `{}`
		: `{ ${node.expressions
			.map(e => e.node.name)
			.join(', ')} }`;

	const str = '${@debug(' + `${filename && stringify(filename)}, ${line}, ${column}, ${obj})}`;

	renderer.append(str);
}
