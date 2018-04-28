import Generator from '../../Generator';
import { walk } from 'estree-walker';
import isReference from 'is-reference';
import flattenReference from '../../../utils/flattenReference';
import { createScopes } from '../../../utils/annotateWithScopes';

export default class Expression {
	compiler: Generator;
	node: any;
	snippet: string;

	usesContext: boolean;
	references: Set<string>;
	dependencies: Set<string>;
	contexts: Set<string>;
	indexes: Set<string>;

	thisReferences: Array<{ start: number, end: number }>;

	constructor(compiler, parent, scope, info) {
		// TODO revert to direct property access in prod?
		Object.defineProperties(this, {
			compiler: {
				value: compiler
			}
		});

		this.node = info;
		this.thisReferences = [];

		this.snippet = `[✂${info.start}-${info.end}✂]`;

		this.usesContext = false;
		const contextDependencies = new Map(); // TODO
		const indexes = new Map();

		const dependencies = new Set();

		const { code, helpers } = compiler;

		let { map, scope: currentScope } = createScopes(info);

		const isEventHandler = parent.type === 'EventHandler';
		const expression = this;
		const isSynthetic = parent.isSynthetic;

		walk(info, {
			enter(node: any, parent: any, key: string) {
				// don't manipulate shorthand props twice
				if (key === 'value' && parent.shorthand) return;

				code.addSourcemapLocation(node.start);
				code.addSourcemapLocation(node.end);

				if (map.has(node)) {
					currentScope = map.get(node);
					return;
				}

				if (node.type === 'ThisExpression') {
					expression.thisReferences.push(node);
				}

				if (isReference(node, parent)) {
					const { name } = flattenReference(node);

					if (currentScope.has(name) || (name === 'event' && isEventHandler)) return;

					if (compiler.helpers.has(name)) {
						let object = node;
						while (object.type === 'MemberExpression') object = object.object;

						const alias = compiler.templateVars.get(`helpers-${name}`);
						if (alias !== name) code.overwrite(object.start, object.end, alias);
						return;
					}

					expression.usesContext = true;

					if (!isSynthetic) {
						// <option> value attribute could be synthetic — avoid double editing
						code.prependRight(node.start, key === 'key' && parent.shorthand
							? `${name}: ctx.`
							: 'ctx.');
					}

					if (scope.names.has(name)) {
						scope.dependenciesForName.get(name).forEach(dependency => {
							dependencies.add(dependency);
						});
					} else if (!indexes.has(name)) {
						dependencies.add(name);
						compiler.expectedProperties.add(name);
					}

					if (node.type === 'MemberExpression') {
						walk(node, {
							enter(node) {
								code.addSourcemapLocation(node.start);
								code.addSourcemapLocation(node.end);
							}
						});
					}

					this.skip();
				}
			},

			leave(node: Node, parent: Node) {
				if (map.has(node)) currentScope = currentScope.parent;
			}
		});

		this.dependencies = dependencies;

		this.contexts = new Set(); // TODO...
		this.indexes = new Set(); // TODO...
	}

	overwriteThis(name) {
		this.thisReferences.forEach(ref => {
			this.compiler.code.overwrite(ref.start, ref.end, name, {
				storeName: true
			});
		});
	}
}