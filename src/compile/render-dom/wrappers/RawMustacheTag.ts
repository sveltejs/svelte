import Renderer from '../Renderer';
import Block from '../Block';
import Node from '../../nodes/shared/Node';
import Tag from './shared/Tag';
import Wrapper from './shared/wrapper';
import deindent from '../../../utils/deindent';

export default class RawMustacheTagWrapper extends Tag {
	var = 'raw';

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Node
	) {
		super(renderer, block, parent, node);
		this.cannotUseInnerHTML();
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		const name = this.var;

		// TODO use isDomNode instead of type === 'Element'?
		const needsAnchorBefore = this.prev ? this.prev.node.type !== 'Element' : !parentNode;
		const needsAnchorAfter = this.next ? this.next.node.type !== 'Element' : !parentNode;

		const anchorBefore = needsAnchorBefore
			? block.getUniqueName(`${name}_before`)
			: (this.prev && this.prev.var) || 'null';

		const anchorAfter = needsAnchorAfter
			? block.getUniqueName(`${name}_after`)
			: (this.next && this.next.var) || 'null';

		let detach: string;
		let insert: (content: string) => string;
		let useInnerHTML = false;

		if (anchorBefore === 'null' && anchorAfter === 'null') {
			useInnerHTML = true;
			detach = `${parentNode}.innerHTML = '';`;
			insert = content => `${parentNode}.innerHTML = ${content};`;
		} else if (anchorBefore === 'null') {
			detach = `@detachBefore(${anchorAfter});`;
			insert = content => `${anchorAfter}.insertAdjacentHTML("beforebegin", ${content});`;
		} else if (anchorAfter === 'null') {
			detach = `@detachAfter(${anchorBefore});`;
			insert = content => `${anchorBefore}.insertAdjacentHTML("afterend", ${content});`;
		} else {
			detach = `@detachBetween(${anchorBefore}, ${anchorAfter});`;
			insert = content => `${anchorBefore}.insertAdjacentHTML("afterend", ${content});`;
		}

		const { init } = this.renameThisMethod(
			block,
			content => deindent`
				${!useInnerHTML && detach}
				${insert(content)}
			`
		);

		// we would have used comments here, but the `insertAdjacentHTML` api only
		// exists for `Element`s.
		if (needsAnchorBefore) {
			block.addElement(
				anchorBefore,
				`@createElement('noscript')`,
				parentNodes && `@createElement('noscript')`,
				parentNode,
				true
			);
		}

		function addAnchorAfter() {
			block.addElement(
				anchorAfter,
				`@createElement('noscript')`,
				parentNodes && `@createElement('noscript')`,
				parentNode
			);
		}

		if (needsAnchorAfter && anchorBefore === 'null') {
			// anchorAfter needs to be in the DOM before we
			// insert the HTML...
			addAnchorAfter();
		}

		block.builders.mount.addLine(insert(init));

		if (!parentNode) {
			block.builders.destroy.addConditional('detach', needsAnchorBefore
				? `${detach}\n@detachNode(${anchorBefore});`
				: detach);
		}

		if (needsAnchorAfter && anchorBefore !== 'null') {
			// ...otherwise it should go afterwards
			addAnchorAfter();
		}
	}
}