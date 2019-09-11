export function snip(expression) {
	throw new Error(`bad`);
	return `[✂${expression.node.start}-${expression.node.end}✂]`;
}