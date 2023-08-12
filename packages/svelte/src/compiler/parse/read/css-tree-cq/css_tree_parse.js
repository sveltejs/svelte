// @ts-nocheck
import { fork } from 'css-tree';
import { String, Url, Function, RightParenthesis, Ident, Semicolon } from 'css-tree/tokenizer';

import * as node from './node/index.js';

/**
 * Extends `css-tree` for container query support by forking and adding new nodes and at-rule support for `@container`.
 *
 * The new nodes are located in `./node`.
 */
const cqSyntax = fork({
	atrule: {
		// extend or override at-rule dictionary
		container: {
			parse: {
				prelude() {
					return this.createSingleNodeList(this.ContainerQuery());
				},
				block(isStyleBlock = false) {
					return this.Block(isStyleBlock);
				}
			}
		},
		// TODO: Wait until css-tree supports layer() or supports() for import and remove this
		import: {
			parse: {
				prelude() {
					const children = this.createList();

					this.skipSC();

					switch (this.tokenType) {
						case String:
							children.push(this.String());
							break;

						case Url:
						case Function:
							children.push(this.Url());
							break;
					}

					this.skipSC();

					if (this.tokenType == Function && this.cmpStr(this.tokenStart, this.tokenEnd, 'layer(')) {
						children.push(this.Function(() => {
							const children = this.createList();
							this.skipSC();
							children.push(this.LayerName());
							this.skipSC();
							return children;
						}, this.scope.AtrulePrelude));
					} else if (this.tokenType == Ident && this.cmpStr(this.tokenStart, this.tokenEnd, 'layer')) {
						children.push(this.Identifier());
					}

					this.skipSC();

					if (this.tokenType == Function && this.cmpStr(this.tokenStart, this.tokenEnd, 'supports(')) {
						children.push(this.Function(() => {
							const children = this.createList();
							this.skipSC();
							children.push(this.SupportsCondition());
							this.skipSC();
							return children;
						}, this.scope.AtrulePrelude));
					}

					this.skipSC();
					
					if (this.tokenType !== Semicolon) {
						children.push(this.MediaQueryList());
					}

					return children;
				},
				block: null
			}
		},
	},
	node
});

export const parse = cqSyntax.parse;
