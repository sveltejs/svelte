import { DomGenerator } from '../../dom/index';
import Block from '../../dom/Block';
import { trimStart, trimEnd } from '../../../utils/trim';

export default class Node {
	type: string;
	start: number;
	end: number;
	[key: string]: any;

	metadata?: {
		dependencies: string[];
		snippet: string;
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
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		// implemented by subclasses
	}

	initChildren(
		block: Block,
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
			// <svelte:window/>. lil hacky but it works
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

			child.init(block, stripWhitespace, cleaned[i + 1] || nextSibling);

			if (child.shouldSkip) return;

			if (lastChild) lastChild.next = child;
			child.prev = lastChild;

			lastChild = child;
		});

		// We want to remove trailing whitespace inside an element/component/block,
		// *unless* there is no whitespace between this node and its next sibling
		if (stripWhitespace && lastChild && lastChild.type === 'Text') {
			const shouldTrim = (
				nextSibling ?  (nextSibling.type === 'Text' && /^\s/.test(nextSibling.data)) : !this.hasAncestor('EachBlock')
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
		parentNode: string,
		parentNodes: string
	) {
		// implemented by subclasses
	}

	isDomNode() {
		return this.type === 'Element' || this.type === 'Text' || this.type === 'MustacheTag';
	}

	hasAncestor(type: string) {
		return this.parent ?
			this.parent.type === type || this.parent.hasAncestor(type) :
			false;
	}

	findNearest(selector: RegExp) {
		if (selector.test(this.type)) return this;
		if (this.parent) return this.parent.findNearest(selector);
	}

	getOrCreateAnchor(block: Block, parentNode: string, parentNodes: string) {
		// TODO use this in EachBlock and IfBlock — tricky because
		// children need to be created first
		const needsAnchor = this.next ? !this.next.isDomNode() : !parentNode || !this.parent.isDomNode();
		const anchor = needsAnchor
			? block.getUniqueName(`${this.var}_anchor`)
			: (this.next && this.next.var) || 'null';

		if (needsAnchor) {
			block.addElement(
				anchor,
				`@createComment()`,
				parentNodes && `@createComment()`,
				parentNode
			);
		}

		return anchor;
	}

	getUpdateMountNode(anchor: string) {
		return this.parent.isDomNode() ? this.parent.var : `${anchor}.parentNode`;
	}

	remount(name: string) {
		return `${this.var}.m(${name}._slotted.default, null);`;
	}
}