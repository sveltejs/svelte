export function snip(expression) {
	throw new Error(`snip bad`);
	return `[✂${expression.node.start}-${expression.node.end}✂]`;
}