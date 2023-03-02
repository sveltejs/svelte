// @ts-nocheck
// Note: Must import from the `css-tree` browser bundled distribution due to `createRequire` usage if importing from
// `css-tree` Node module directly. This allows the production build of Svelte to work correctly.
import { fork } from '../../../../../node_modules/css-tree/dist/csstree.esm.js';

import * as Comparison from './node/comparison';
import * as ContainerFeature from './node/container_feature';
import * as ContainerFeatureRange from './node/container_feature_range';
import * as ContainerFeatureStyle from './node/container_feature_style';
import * as ContainerQuery from './node/container_query';
import * as QueryCSSFunction from './node/query_css_function';

/**
 * Extends `css-tree` for container query support by forking and adding new nodes and at-rule support for `@container`.
 *
 * The new nodes are located in `./node`.
 */
const cqSyntax = fork({
	atrule: { // extend or override at-rule dictionary
		container: {
			parse: {
				prelude() {
					return this.createSingleNodeList(
						this.ContainerQuery()
					);
				},
				block(isStyleBlock = false) {
					return this.Block(isStyleBlock);
				}
			}
		}
	},
	node: { // extend node types
		Comparison,
		ContainerFeature,
		ContainerFeatureRange,
		ContainerFeatureStyle,
		ContainerQuery,
		QueryCSSFunction
	}
});

export const parse = cqSyntax.parse;
