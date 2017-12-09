import { DomGenerator } from '../../dom/index';
import Block from '../../dom/Block';
import State from '../../dom/State';
import { trimStart, trimEnd } from '../../../utils/trim';

export default class Node {
	type: string;
	start: number;
	end: number;

	metadata: {
		dependencies: string[];
	};

	parent: Node;
	prev?: Node;
	next?: Node;
	generator: DomGenerator;

	canUseInnerHTML: boolean;
	var: string;

	constructor(data: Record<string, any>) {
		Object.assign(this, data);
	}

	cannotUseInnerHTML() {
		if (this.canUseInnerHTML !== false) {
			this.canUseInnerHTML = false;
			if (this.parent) {
				if (!this.parent.cannotUseInnerHTML) console.log(this.parent.type, this.type);
				this.parent.cannotUseInnerHTML();
			}
		}
	}

	init(
		block: Block,
		state: State,
		inEachBlock: boolean,
		elementStack: Node[],
		componentStack: Node[],
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		// implemented by subclasses
	}

	initChildren(
		block: Block,
		state: State,
		inEachBlock: boolean,
		elementStack: Node[],
		componentStack: Node[],
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		// glue text nodes together
		const cleaned: Node[] = [];
		let lastChild: Node;

		let windowComponent;

		this.children.forEach((child: Node) => {
			if (child.type === 'Comment') return;

			// special case — this is an easy way to remove whitespace surrounding
			// <:Window/>. lil hacky but it works
			if (child.type === 'Window') {
				windowComponent = child;
				return;
			}

			if (child.type === 'Text' && lastChild && lastChild.type === 'Text') {
				lastChild.data += child.data;
				lastChild.end = child.end;
			} else {
				if (child.type === 'Text' && stripWhitespace && cleaned.length === 0) {
					child.data = trimStart(child.data);
					if (child.data) cleaned.push(child);
				} else {
					cleaned.push(child);
				}
			}

			lastChild = child;
		});

		lastChild = null;

		cleaned.forEach((child: Node, i: number) => {
			child.canUseInnerHTML = !this.generator.hydratable;

			child.init(block, state, inEachBlock, elementStack, componentStack, stripWhitespace, cleaned[i + 1] || nextSibling);

			if (child.shouldSkip) return;

			if (lastChild) lastChild.next = child;
			child.prev = lastChild;

			lastChild = child;
		});

		// We want to remove trailing whitespace inside an element/component/block,
		// *unless* there is no whitespace between this node and its next sibling
		if (stripWhitespace && lastChild && lastChild.type === 'Text') {
			const shouldTrim = (
				nextSibling ?  (nextSibling.type === 'Text' && /^\s/.test(nextSibling.data)) : !inEachBlock
			);

			if (shouldTrim) {
				lastChild.data = trimEnd(lastChild.data);
				if (!lastChild.data) {
					cleaned.pop();
					lastChild = cleaned[cleaned.length - 1];
					lastChild.next = null;
				}
			}
		}

		this.children = cleaned;
		if (windowComponent) cleaned.unshift(windowComponent);
	}

	build(
		block: Block,
		state: State,
		elementStack: Node[],
		componentStack: Node[]
	) {
		// implemented by subclasses
	}

	isChildOfComponent() {
		return this.parent ?
			this.parent.type === 'Component' || this.parent.isChildOfComponent() :
			false;
	}

	isDomNode() {
		return this.type === 'Element' || this.type === 'Text' || this.type === 'MustacheTag';
	}
}