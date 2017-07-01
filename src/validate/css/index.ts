import { groupSelectors, isGlobalSelector } from '../../utils/css';
import { Validator } from '../index';
import { Node } from '../../interfaces';

export default function validateCss(validator: Validator, css: Node) {
	function validateRule(rule: Node) {
		if (rule.type === 'Atrule') {
			if (rule.name === 'keyframes') return;
			if (rule.name == 'media') {
				rule.block.children.forEach(validateRule);
				return;
			}
			
			// TODO
			throw new Error(`Not implemented: @${rule.name}. Please raise an issue at https://github.com/sveltejs/svelte/issues — thanks!`);
		}

		const selectors = rule.selector.children;
		selectors.forEach(validateSelector);
	}

	function validateSelector(selector: Node) {
		const blocks: Node[][] = groupSelectors(selector);

		blocks.forEach((block, i) => {
			if (block.find((part: Node) => part.type === 'PseudoClassSelector' && part.name === 'global')) {
				// check that :global(...) is by itself
				if (block.length !== 1) {
					validator.error(`:global(...) cannot be mixed with non-global selectors`, block[0].start);
				}

				// check that :global(...) isn't sandwiched by other selectors
				// if (i > 0 && i < blocks.length - 1) {
				// 	validator.error(`:global(...) can be at the start or end of a selector sequence, but not in the middle`, block[0].start);
				// }
			}
		});

		let start = 0;
		let end = blocks.length;

		for (; start < end; start += 1) {
			if (!isGlobalSelector(blocks[start])) break;
		}

		for (; end > start; end -= 1) {
			if (!isGlobalSelector(blocks[end - 1])) break;
		}

		for (let i = start; i < end; i += 1) {
			if (isGlobalSelector(blocks[i])) {
				validator.error(`:global(...) can be at the start or end of a selector sequence, but not in the middle`, blocks[i][0].start);
			}
		}
	}

	css.children.forEach(validateRule);
}