// @ts-nocheck
export const name = 'SupportsCondition';
export const structure = {
	children: [[]]
};

// TODO: Wait until css-tree has better @supports condition AST and remove this file
export function parse() {
	const start = this.tokenStart;
	const support_condition = this.atrule.supports.prelude.call(this);

	return {
		type: 'SupportsCondition',
		children: support_condition,
		loc: this.getLocation(start, this.tokenStart)
	};
}

export function generate(node) {
	this.children(node);
}
