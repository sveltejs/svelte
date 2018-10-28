export default function(node, renderer, options) {
	const { snippet } = node.expression;

	const props = node.contexts.map(prop => `${prop.key.name}: item${prop.tail}`);

	const getContext = node.index
		? `(item, i) => Object.assign({}, ctx, { ${props.join(', ')}, ${node.index}: i })`
		: `item => Object.assign({}, ctx, { ${props.join(', ')} })`;

	const open = `\${ ${node.else ? `${snippet}.length ? ` : ''}@each(${snippet}, ${getContext}, ctx => \``;
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