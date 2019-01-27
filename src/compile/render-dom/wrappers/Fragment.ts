import Wrapper from './shared/Wrapper';
import AwaitBlock from './AwaitBlock';
import Body from './Body';
import DebugTag from './DebugTag';
import EachBlock from './EachBlock';
import Element from './Element/index';
import Head from './Head';
import IfBlock from './IfBlock';
import InlineComponent from './InlineComponent/index';
import MustacheTag from './MustacheTag';
import RawMustacheTag from './RawMustacheTag';
import Slot from './Slot';
import Text from './Text';
import Title from './Title';
import Window from './Window';
import Node from '../../nodes/shared/Node';
import { trimStart, trimEnd } from '../../../utils/trim';
import TextWrapper from './Text';
import Renderer from '../Renderer';
import Block from '../Block';

const wrappers = {
	AwaitBlock,
	Body,
	Comment: null,
	DebugTag,
	EachBlock,
	Element,
	Head,
	IfBlock,
	InlineComponent,
	Meta: null,
	MustacheTag,
	RawMustacheTag,
	Slot,
	Text,
	Title,
	Window
};

function link(next: Wrapper, prev: Wrapper) {
	prev.next = next;
	if (next) next.prev = prev;
}

export default class FragmentWrapper {
	nodes: Wrapper[];

	constructor(
		renderer: Renderer,
		block: Block,
		nodes: Node[],
		parent: Wrapper,
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		this.nodes = [];

		let lastChild: Wrapper;
		let windowWrapper;

		let i = nodes.length;
		while (i--) {
			const child = nodes[i];

			if (!child.type) {
				throw new Error(`missing type`)
			}

			if (!(child.type in wrappers)) {
				throw new Error(`TODO implement ${child.type}`);
			}

			// special case — this is an easy way to remove whitespace surrounding
			// <svelte:window/>. lil hacky but it works
			if (child.type === 'Window') {
				windowWrapper = new Window(renderer, block, parent, child);
				continue;
			}

			if (child.type === 'Text') {
				let { data } = child;

				// We want to remove trailing whitespace inside an element/component/block,
				// *unless* there is no whitespace between this node and its next sibling
				if (this.nodes.length === 0) {
					const shouldTrim = (
						nextSibling ? (nextSibling.node.type === 'Text' && /^\s/.test(nextSibling.data)) : !child.hasAncestor('EachBlock')
					);

					if (shouldTrim) {
						data = trimEnd(data);
						if (!data) continue;
					}
				}

				// glue text nodes (which could e.g. be separated by comments) together
				if (lastChild && lastChild.node.type === 'Text') {
					lastChild.data = data + lastChild.data;
					continue;
				}

				const wrapper = new TextWrapper(renderer, block, parent, child, data);
				if (wrapper.skip) continue;

				this.nodes.unshift(wrapper);

				link(lastChild, lastChild = wrapper);
			} else {
				const Wrapper = wrappers[child.type];
				if (!Wrapper) continue;

				const wrapper = new Wrapper(renderer, block, parent, child, stripWhitespace, lastChild || nextSibling);
				this.nodes.unshift(wrapper);

				link(lastChild, lastChild = wrapper);
			}
		}

		if (stripWhitespace) {
			const first = this.nodes[0] as TextWrapper;

			if (first && first.node.type === 'Text') {
				first.data = trimStart(first.data);
				if (!first.data) {
					first.var = null;
					this.nodes.shift();

					if (this.nodes[0]) {
						this.nodes[0].prev = null;
					}
				}
			}
		}

		if (windowWrapper) {
			this.nodes.unshift(windowWrapper);
			link(lastChild, windowWrapper);
		}
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		for (let i = 0; i < this.nodes.length; i += 1) {
			this.nodes[i].render(block, parentNode, parentNodes);
		}
	}
}
