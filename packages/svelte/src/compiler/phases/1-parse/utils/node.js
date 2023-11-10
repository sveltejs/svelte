/** @param {import('#compiler').TemplateNode} node */
export function to_string(node) {
	switch (node.type) {
		case 'IfBlock':
			return '{#if} block';
		case 'AwaitBlock':
			return '{#await} block';
		case 'EachBlock':
			return '{#each} block';
		case 'HtmlTag':
			return '{@html} block';
		case 'DebugTag':
			return '{@debug} block';
		case 'ConstTag':
			return '{@const} tag';
		case 'RegularElement':
		case 'Component':
		case 'SlotElement':
		case 'TitleElement':
			return `<${node.name}> tag`;
		default:
			return node.type;
	}
}
