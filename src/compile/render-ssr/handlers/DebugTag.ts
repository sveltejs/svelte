import { stringify } from '../../../utils/stringify';

export default function(node, renderer, options) {
	if (!options.dev) return;

	const filename = options.file || null;
	const { line, column } = options.locate(node.start + 1);

	const obj = node.expressions.length === 0
		? `ctx`
		: `{ ${node.expressions
			.map(e => e.node.name)
			.map(name => `${name}: ctx.${name}`)
			.join(', ')} }`;

	const str = '${@debug(' + `${filename && stringify(filename)}, ${line}, ${column}, ${obj})}`;

	renderer.append(str);
}