import Generator from '../../Generator';
import { walk } from 'estree-walker';
import isReference from 'is-reference';
import flattenReference from '../../../utils/flattenReference';
import { createScopes } from '../../../utils/annotateWithScopes';

export default class Expression {
	compiler: Generator;
	node: any;
	snippet: string;

	references: Set<string>;
	dependencies: Set<string>;
	contexts: Set<string>;
	indexes: Set<string>;

	constructor(compiler, parent, info) {
		this.compiler = compiler;
		this.node = info;

		this.snippet = `[✂${info.start}-${info.end}✂]`;

		const contextDependencies = new Map(); // TODO
		const indexes = new Map();

		const dependencies = new Set();

		const { code, helpers } = compiler;

		let { map, scope } = createScopes(info);
		const isEventHandler = parent.type === 'EventHandler';

		walk(info, {
			enter(node: any, parent: any) {
				code.addSourcemapLocation(node.start);
				code.addSourcemapLocation(node.end);

				if (map.has(node)) {
					scope = map.get(node);
					return;
				}

				if (isReference(node, parent)) {
					const { name } = flattenReference(node);
					if (scope && scope.has(name) || helpers.has(name) || (name === 'event' && isEventHandler)) return;

					code.prependRight(node.start, 'ctx.');

					if (contextDependencies.has(name)) {
						contextDependencies.get(name).forEach(dependency => {
							dependencies.add(dependency);
						});
					} else if (!indexes.has(name)) {
						dependencies.add(name);
					}

					this.skip();
				}
			},

			leave(node: Node, parent: Node) {
				if (map.has(node)) scope = scope.parent;
			}
		});

		this.dependencies = dependencies;

		this.contexts = new Set(); // TODO...
		this.indexes = new Set(); // TODO...
	}
}