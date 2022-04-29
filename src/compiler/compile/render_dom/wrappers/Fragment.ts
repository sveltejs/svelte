import Wrapper from './shared/Wrapper';
import AwaitBlock from './AwaitBlock';
import Body from './Body';
import DebugTag from './DebugTag';
import EachBlock from './EachBlock';
import Element from './Element/index';
import Head from './Head';
import IfBlock from './IfBlock';
import KeyBlock from './KeyBlock';
import InlineComponent from './InlineComponent/index';
import MustacheTag from './MustacheTag';
import RawMustacheTag from './RawMustacheTag';
import Slot from './Slot';
import SlotTemplate from './SlotTemplate';
import Text from './Text';
import Title from './Title';
import Window from './Window';
import { INode } from '../../nodes/interfaces';
import Renderer from '../Renderer';
import Block from '../Block';
import { trim_text_node, trim_first_text_node } from '../../utils/trim';
import { link } from '../../../utils/link';
import { Identifier } from 'estree';

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
	KeyBlock,
	MustacheTag,
	Options: null,
	RawMustacheTag,
	Slot,
	SlotTemplate,
	Text,
	Title,
	Window
};

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
    let wrapper: Wrapper;
		let window_wrapper: Window;

		let i = nodes.length;
		while (i--) {
			const child = nodes[i];

			if (!child.type) {
				throw new Error('missing type');
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
        if (child.should_skip()) continue;

				const data = trim_text_node(child, this.nodes, next_sibling);
				if (!data) continue;

				// glue text nodes (which could e.g. be separated by comments) together
				if (last_child && last_child.node.type === 'Text') {
					(last_child as Text).data = data + (last_child as Text).data;
					continue;
				}

				wrapper = new Text(renderer, block, parent, child, data);
			} else {
				const Wrapper = wrappers[child.type];
				if (!Wrapper) continue;

				wrapper = new Wrapper(renderer, block, parent, child, strip_whitespace, last_child || next_sibling);
			}

      this.nodes.unshift(wrapper);
      link(last_child, last_child = wrapper);
		}

		if (strip_whitespace) {
			trim_first_text_node(this.nodes);
		}

		if (window_wrapper) {
			this.nodes.unshift(window_wrapper);
			link(last_child, window_wrapper);
		}
	}

	render(block: Block, parent_node: Identifier, parent_nodes: Identifier) {
		for (let i = 0; i < this.nodes.length; i += 1) {
			this.nodes[i].render(block, parent_node, parent_nodes);
		}
	}
}
