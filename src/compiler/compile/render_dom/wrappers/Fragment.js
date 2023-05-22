import AwaitBlock from './AwaitBlock.js';
import Body from './Body.js';
import DebugTag from './DebugTag.js';
import Document from './Document.js';
import EachBlock from './EachBlock.js';
import Element from './Element/index.js';
import Head from './Head.js';
import IfBlock from './IfBlock.js';
import KeyBlock from './KeyBlock.js';
import InlineComponent from './InlineComponent/index.js';
import MustacheTag from './MustacheTag.js';
import RawMustacheTag from './RawMustacheTag.js';
import Slot from './Slot.js';
import SlotTemplate from './SlotTemplate.js';
import Text from './Text.js';
import Comment from './Comment.js';
import Title from './Title.js';
import Window from './Window.js';
import { trim_start, trim_end } from '../../../utils/trim.js';
import { link } from '../../../utils/link.js';
import { regex_starts_with_whitespace } from '../../../utils/patterns.js';

const wrappers = {
	AwaitBlock,
	Body,
	Comment,
	DebugTag,
	Document,
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

/**
 * @param {import('../../nodes/interfaces.js').INode} child
 * @param {import('./shared/Wrapper.js').default} next_sibling
 * @returns {boolean}
 */
function trimmable_at(child, next_sibling) {
	// Whitespace is trimmable if one of the following is true:
	// The child and its sibling share a common nearest each block (not at an each block boundary)
	// The next sibling's previous node is an each block
	return (
		next_sibling.node.find_nearest(/EachBlock/) === child.find_nearest(/EachBlock/) ||
		next_sibling.node.prev.type === 'EachBlock'
	);
}

export default class FragmentWrapper {
	/** @type {import('./shared/Wrapper.js').default[]} */
	nodes;

	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('../../nodes/interfaces.js').INode[]} nodes
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {boolean} strip_whitespace
	 * @param {import('./shared/Wrapper.js').default} next_sibling
	 */
	constructor(renderer, block, nodes, parent, strip_whitespace, next_sibling) {
		this.nodes = [];

		/** @type {import('./shared/Wrapper.js').default} */
		let last_child;

		/** @type {import('./Window.js').default | undefined} */
		let window_wrapper;
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
				let { data } = child;
				// We want to remove trailing whitespace inside an element/component/block,
				// *unless* there is no whitespace between this node and its next sibling
				if (this.nodes.length === 0) {
					const should_trim = next_sibling
						? next_sibling.node.type === 'Text' &&
						  regex_starts_with_whitespace.test(next_sibling.node.data) &&
						  trimmable_at(child, next_sibling)
						: !child.has_ancestor('EachBlock');
					if (should_trim && !child.keep_space()) {
						data = trim_end(data);
						if (!data) continue;
					}
				}
				// glue text nodes (which could e.g. be separated by comments) together
				if (last_child && last_child.node.type === 'Text') {
					/** @type {import('./Text.js').default} */ (last_child).data =
						data + /** @type {import('./Text.js').default} */ (last_child).data;
					continue;
				}
				const wrapper = new Text(renderer, block, parent, child, data);
				if (wrapper.skip) continue;
				this.nodes.unshift(wrapper);
				link(last_child, (last_child = wrapper));
			} else {
				const Wrapper = wrappers[child.type];
				if (!Wrapper || (child.type === 'Comment' && !renderer.options.preserveComments)) continue;
				const wrapper = new Wrapper(
					renderer,
					block,
					parent,
					child,
					strip_whitespace,
					last_child || next_sibling
				);
				this.nodes.unshift(wrapper);
				link(last_child, (last_child = wrapper));
			}
		}
		if (strip_whitespace) {
			const first = /** @type {import('./Text.js').default} */ (this.nodes[0]);
			if (first && first.node.type === 'Text' && !first.node.keep_space()) {
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

	/**
	 * @param {import('../Block.js').default} block
	 * @param {import('estree').Identifier} parent_node
	 * @param {import('estree').Identifier} parent_nodes
	 */
	render(block, parent_node, parent_nodes) {
		for (let i = 0; i < this.nodes.length; i += 1) {
			this.nodes[i].render(block, parent_node, parent_nodes);
		}
	}
}
