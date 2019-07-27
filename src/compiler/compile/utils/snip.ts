export function snip(expression) {
	return `[✂${expression.node.start}-${expression.node.end}✂]`;
}