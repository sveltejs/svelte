import { groupSelectors, isGlobalSelector, walkRules } from '../../utils/css';
import { Validator } from '../index';
import { Node } from '../../interfaces';

export default function validateCss(validator: Validator, css: Node) {
	walkRules(css.children, rule => {
		rule.selector.children.forEach(validateSelector);
	});

	function validateSelector(selector: Node) {
		const blocks: Node[][] = groupSelectors(selector);

		blocks.forEach((block) => {
			let i = block.length;
			while (i-- > 1) {
				const part = block[i];
				if (part.type === 'PseudoClassSelector' && part.name === 'global') {
					validator.error(`:global(...) must be the first element in a compound selector`, part.start);
				}
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
}