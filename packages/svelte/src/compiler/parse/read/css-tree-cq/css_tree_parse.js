// @ts-nocheck
import { fork } from 'css-tree';

import * as node from './node/index.js';

/**
 * Extends `css-tree` for container query support by forking and adding new nodes and at-rule support for `@container`.
 *
 * The new nodes are located in `./node`.
 */
const cq_syntax = fork({
	atrule: {
		// extend or override at-rule dictionary
		container: {
			parse: {
				prelude() {
					return this.createSingleNodeList(this.ContainerQuery());
				},
				block(is_style_block = false) {
					return this.Block(is_style_block);
				}
			}
		}
	},
	node
});

export const parse = cq_syntax.parse;
