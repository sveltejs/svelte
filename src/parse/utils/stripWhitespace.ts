import { trimStart, trimEnd } from '../../utils/trim';
import { Node } from '../../interfaces';

export default function stripWhitespace(nodes: Node[]) {
	while (nodes.length) {
		const firstChild = nodes[0];

		if (firstChild.type !== 'Text') break;

		const length = firstChild.data.length;
		firstChild.data = trimStart(firstChild.data);

		if (firstChild.data === '') {
			nodes.shift();
		} else {
			break;
		}
	}

	while (nodes.length) {
		const lastChild = nodes[nodes.length - 1];

		if (lastChild.type !== 'Text') break;

		const length = lastChild.data.length;
		lastChild.data = trimEnd(lastChild.data);

		if (lastChild.data === '') {
			nodes.pop();
		} else {
			break;
		}
	}
}


// function stripWhitespace(element) {
// 	if (element.children.length) {
// 		const firstChild = element.children[0];
// 		const lastChild = element.children[element.children.length - 1];

// 		if (firstChild.type === 'Text') {
// 			firstChild.data = trimStart(firstChild.data);
// 			if (!firstChild.data) element.children.shift();
// 		}

// 		if (lastChild.type === 'Text') {
// 			lastChild.data = trimEnd(lastChild.data);
// 			if (!lastChild.data) element.children.pop();
// 		}
// 	}
// }