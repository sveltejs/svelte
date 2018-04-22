import Element from '../Element';
import Text from '../Text';
import MustacheTag from '../MustacheTag';
import Node from './Node';

function getConstructor(type): typeof Node {
	switch (type) {
		case 'Element': return Element;
		case 'Text': return Text;
		case 'MustacheTag': return MustacheTag;
		default: throw new Error(`Not implemented: ${type}`);
	}
}

export default function mapChildren(compiler, parent, children: any[]) {
	let last = null;
	return children.map(child => {
		const constructor = getConstructor(child.type);
		const node = new constructor(compiler, parent, child);

		if (last) last.next = node;
		node.prev = last;
		last = node;

		return node;
	});
}