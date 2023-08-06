import AwaitBlock from '../AwaitBlock.js';
import Body from '../Body.js';
import ConstTag from '../ConstTag.js';
import Comment from '../Comment.js';
import EachBlock from '../EachBlock.js';
import Document from '../Document.js';
import Element from '../Element.js';
import Head from '../Head.js';
import IfBlock from '../IfBlock.js';
import InlineComponent from '../InlineComponent.js';
import KeyBlock from '../KeyBlock.js';
import MustacheTag from '../MustacheTag.js';
import Options from '../Options.js';
import RawMustacheTag from '../RawMustacheTag.js';
import DebugTag from '../DebugTag.js';
import Slot from '../Slot.js';
import SlotTemplate from '../SlotTemplate.js';
import Text from '../Text.js';
import Title from '../Title.js';
import Window from '../Window.js';
import { push_array } from '../../../utils/push_array.js';

/** @typedef {ReturnType<typeof map_children>} Children */

/** @param {any} type */
function get_constructor(type) {
	switch (type) {
		case 'AwaitBlock':
			return AwaitBlock;
		case 'Body':
			return Body;
		case 'Comment':
			return Comment;
		case 'ConstTag':
			return ConstTag;
		case 'Document':
			return Document;
		case 'EachBlock':
			return EachBlock;
		case 'Element':
			return Element;
		case 'Head':
			return Head;
		case 'IfBlock':
			return IfBlock;
		case 'InlineComponent':
			return InlineComponent;
		case 'KeyBlock':
			return KeyBlock;
		case 'MustacheTag':
			return MustacheTag;
		case 'Options':
			return Options;
		case 'RawMustacheTag':
			return RawMustacheTag;
		case 'DebugTag':
			return DebugTag;
		case 'Slot':
			return Slot;
		case 'SlotTemplate':
			return SlotTemplate;
		case 'Text':
			return Text;
		case 'Title':
			return Title;
		case 'Window':
			return Window;
		default:
			throw new Error(`Not implemented: ${type}`);
	}
}

/**
 * @param {any} component
 * @param {any} parent
 * @param {any} scope
 * @param {import('../../../interfaces.js').TemplateNode[]} children
 */
export default function map_children(component, parent, scope, children) {
	let last = null;
	let ignores = [];
	return children.map((child) => {
		const constructor = get_constructor(child.type);
		const use_ignores = child.type !== 'Text' && child.type !== 'Comment' && ignores.length;
		if (use_ignores) component.push_ignores(ignores);
		const node = new constructor(component, parent, scope, child);
		if (use_ignores) component.pop_ignores(), (ignores = []);
		if (node.type === 'Comment' && node.ignores.length) {
			push_array(ignores, node.ignores);
		}
		if (last) last.next = node;
		node.prev = last;
		last = node;
		return node;
	});
}
