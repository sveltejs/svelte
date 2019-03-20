import { snip } from '../../utils/snip';

export default function(node, renderer, options) {
	const snippet = snip(node.expression);

	const { start, end } = node.context_node;

	const ctx = node.index
		? `([✂${start}-${end}✂], ${node.index})`
		: `([✂${start}-${end}✂])`

	const open = `\${${node.else ? `${snippet}.length ? ` : ''}@each(${snippet}, ${ctx} => \``;
	renderer.append(open);

	renderer.render(node.children, options);

	const close = `\`)`;
	renderer.append(close);

	if (node.else) {
		renderer.append(` : \``);
		renderer.render(node.else.children, options);
		renderer.append(`\``);
	}

	renderer.append('}');
}