/**
 * @param {import("../../interfaces.js").TemplateNode} node
 */
export function to_string(node) {
	switch (node.type) {
		case 'IfBlock':
			return '{#if} block';
		case 'ThenBlock':
			return '{:then} block';
		case 'ElseBlock':
			return '{:else} block';
		case 'PendingBlock':
		case 'AwaitBlock':
			return '{#await} block';
		case 'CatchBlock':
			return '{:catch} block';
		case 'EachBlock':
			return '{#each} block';
		case 'RawMustacheTag':
			return '{@html} block';
		case 'DebugTag':
			return '{@debug} block';
		case 'ConstTag':
			return '{@const} tag';
		case 'Element':
		case 'InlineComponent':
		case 'Slot':
		case 'Title':
			return `<${node.name}> tag`;
		default:
			return node.type;
	}
}
