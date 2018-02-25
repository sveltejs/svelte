import deindent from '../../utils/deindent';
import Node from './shared/Node';
import Tag from './shared/Tag';
import Block from '../dom/Block';

export default class RawMustacheTag extends Tag {
	init(block: Block) {
		this.cannotUseInnerHTML();
		this.var = block.getUniqueName('raw');
		block.addDependencies(this.metadata.dependencies);
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const name = this.var;

		const needsAnchorBefore = this.prev ? this.prev.type !== 'Element' : !parentNode;
		const needsAnchorAfter = this.next ? this.next.type !== 'Element' : !parentNode;

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
				parentNode
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
		block.builders.detachRaw.addBlock(detach);

		if (needsAnchorAfter && anchorBefore !== 'null') {
			// ...otherwise it should go afterwards
			addAnchorAfter();
		}
	}

	remount(name: string) {
		return `@appendNode(${this.var}, ${name}._slotted${this.generator.legacy ? `["default"]` : `.default`});`;
	}
}