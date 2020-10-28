import AwaitBlock from '../AwaitBlock.ts';
import Body from '../Body.ts';
import Comment from '../Comment.ts';
import EachBlock from '../EachBlock.ts';
import Element from '../Element.ts';
import Head from '../Head.ts';
import IfBlock from '../IfBlock.ts';
import InlineComponent from '../InlineComponent.ts';
import KeyBlock from '../KeyBlock.ts';
import MustacheTag from '../MustacheTag.ts';
import Options from '../Options.ts';
import RawMustacheTag from '../RawMustacheTag.ts';
import DebugTag from '../DebugTag.ts';
import Slot from '../Slot.ts';
import Text from '../Text.ts';
import Title from '../Title.ts';
import Window from '../Window.ts';
import { TemplateNode } from '../../../interfaces.ts';

export type Children = ReturnType<typeof map_children>;

function get_constructor(type) {
	switch (type) {
		case 'AwaitBlock': return AwaitBlock;
		case 'Body': return Body;
		case 'Comment': return Comment;
		case 'EachBlock': return EachBlock;
		case 'Element': return Element;
		case 'Head': return Head;
		case 'IfBlock': return IfBlock;
		case 'InlineComponent': return InlineComponent;
		case 'KeyBlock': return KeyBlock;
		case 'MustacheTag': return MustacheTag;
		case 'Options': return Options;
		case 'RawMustacheTag': return RawMustacheTag;
		case 'DebugTag': return DebugTag;
		case 'Slot': return Slot;
		case 'Text': return Text;
		case 'Title': return Title;
		case 'Window': return Window;
		default: throw new Error(`Not implemented: ${type}`);
	}
}

export default function map_children(component, parent, scope, children: TemplateNode[]) {
	let last = null;
	let ignores = [];

	return children.map(child => {
		const constructor = get_constructor(child.type);

		const use_ignores = child.type !== 'Text' && child.type !== 'Comment' && ignores.length;

		if (use_ignores) component.push_ignores(ignores);
		const node = new constructor(component, parent, scope, child);
		if (use_ignores) component.pop_ignores(), ignores = [];

		if (node.type === 'Comment' && node.ignores.length) {
			ignores.push(...node.ignores);
		}

		if (last) last.next = node;
		node.prev = last;
		last = node;

		return node;
	});
}
