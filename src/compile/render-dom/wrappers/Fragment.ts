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
import { INode } from '../../nodes/interfaces';
import TextWrapper from './Text';
import Renderer from '../Renderer';
import Block from '../Block';
import { trim_start, trim_end } from '../../../utils/trim';

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
	MustacheTag,
	Options: null,
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
		nodes: INode[],
		parent: Wrapper,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		this.nodes = [];

		let last_child: Wrapper;
		let window_wrapper;

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
				window_wrapper = new Window(renderer, block, parent, child);
				continue;
			}

			if (child.type === 'Text') {
				let { data } = child;

				// We want to remove trailing whitespace inside an element/component/block,
				// *unless* there is no whitespace between this node and its next sibling
				if (this.nodes.length === 0) {
					const should_trim = (
						// @ts-ignore todo:
						next_sibling ? (next_sibling.node.type === 'Text' && /^\s/.test(next_sibling.data)) : !child.has_ancestor('EachBlock')
					);

					if (should_trim) {
						data = trim_end(data);
						if (!data) continue;
					}
				}

				// glue text nodes (which could e.g. be separated by comments) together
				if (last_child && last_child.node.type === 'Text') {
					// @ts-ignore todo: probably error, should it be last_child.node.data?
					last_child.data = data + last_child.data;
					continue;
				}

				const wrapper = new TextWrapper(renderer, block, parent, child, data);
				if (wrapper.skip) continue;

				this.nodes.unshift(wrapper);

				link(last_child, last_child = wrapper);
			} else {
				const Wrapper = wrappers[child.type];
				if (!Wrapper) continue;

				const wrapper = new Wrapper(renderer, block, parent, child, strip_whitespace, last_child || next_sibling);
				this.nodes.unshift(wrapper);

				link(last_child, last_child = wrapper);
			}
		}

		if (strip_whitespace) {
			const first = this.nodes[0] as TextWrapper;

			if (first && first.node.type === 'Text') {
				first.data = trim_start(first.data);
				if (!first.data) {
					first.var = null;
					this.nodes.shift();

					if (this.nodes[0]) {
						this.nodes[0].prev = null;
					}
				}
			}
		}

		if (window_wrapper) {
			this.nodes.unshift(window_wrapper);
			link(last_child, window_wrapper);
		}
	}

	render(block: Block, parent_node: string, parent_nodes: string) {
		for (let i = 0; i < this.nodes.length; i += 1) {
			this.nodes[i].render(block, parent_node, parent_nodes);
		}
	}
}
