/** @import { Literal } from 'estree' */
import * as w from '../../../warnings.js';
import { regex_bidirectional_control_characters } from '../../patterns.js';

/**
 * @param {Literal} node
 */
export function Literal(node) {
	if (typeof node.value === 'string') {
		if (regex_bidirectional_control_characters.test(node.value)) {
			w.bidirectional_control_characters(node);
		}
	}
}
