/** @import { TemplateElement } from 'estree' */
import * as w from '../../../warnings.js';
import { regex_bidirectional_control_characters } from '../../patterns.js';

/**
 * @param {TemplateElement} node
 */
export function TemplateElement(node) {
	if (regex_bidirectional_control_characters.test(node.value.cooked ?? '')) {
		w.bidirectional_control_characters(node);
	}
}
