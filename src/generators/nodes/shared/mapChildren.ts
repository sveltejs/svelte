import AwaitBlock from '../AwaitBlock';
import Component from '../Component';
import EachBlock from '../EachBlock';
import Element from '../Element';
import IfBlock from '../IfBlock';
import Slot from '../Slot';
import Text from '../Text';
import MustacheTag from '../MustacheTag';
import RawMustacheTag from '../RawMustacheTag';
import Window from '../Window';
import Node from './Node';

function getConstructor(type): typeof Node {
	switch (type) {
		case 'AwaitBlock': return AwaitBlock;
		case 'Component': return Component;
		case 'EachBlock': return EachBlock;
		case 'Element': return Element;
		case 'IfBlock': return IfBlock;
		case 'Slot': return Slot;
		case 'Text': return Text;
		case 'MustacheTag': return MustacheTag;
		case 'RawMustacheTag': return RawMustacheTag;
		case 'Window': return Window;
		default: throw new Error(`Not implemented: ${type}`);
	}
}

export default function mapChildren(compiler, parent, scope, children: any[]) {
	let last = null;
	return children.map(child => {
		const constructor = getConstructor(child.type);
		const node = new constructor(compiler, parent, scope, child);

		if (last) last.next = node;
		node.prev = last;
		last = node;

		return node;
	});
}