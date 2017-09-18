import deindent from '../../../utils/deindent';
import { CompileOptions, ModuleFormat, Node } from '../../../interfaces';

interface Dependency {
	name: string;
	statements: string[];
	source: string;
}

export default function getModuleWrapper(
	format: ModuleFormat,
	name: string,
	options: CompileOptions,
	imports: Node[],
	source: string
) {
	if (format === 'es') return getEsWrapper(name, options, imports, source);

	const dependencies = imports.map((declaration, i) => {
		const defaultImport = declaration.specifiers.find(
			(x: Node) =>
				x.type === 'ImportDefaultSpecifier' ||
				(x.type === 'ImportSpecifier' && x.imported.name === 'default')
		);

		const namespaceImport = declaration.specifiers.find(
			(x: Node) => x.type === 'ImportNamespaceSpecifier'
		);

		const namedImports = declaration.specifiers.filter(
			(x: Node) =>
				x.type === 'ImportSpecifier' && x.imported.name !== 'default'
		);

		const name = defaultImport || namespaceImport
			? (defaultImport || namespaceImport).local.name
			: `__import${i}`;

		const statements: string[] = [];

		namedImports.forEach((specifier: Node) => {
			statements.push(
				`var ${specifier.local.name} = ${name}.${specifier.imported.name};`
			);
		});

		if (defaultImport) {
			statements.push(
				`${name} = (${name} && ${name}.__esModule) ? ${name}["default"] : ${name};`
			);
		}

		return { name, statements, source: declaration.source.value };
	});

	if (format === 'amd') return getAmdWrapper(name, options, dependencies);
	if (format === 'cjs') return getCjsWrapper(name, options, dependencies);
	if (format === 'iife') return getIifeWrapper(name, options, dependencies);
	if (format === 'umd') return getUmdWrapper(name, options, dependencies);
	if (format === 'eval') return getEvalWrapper(name, options, dependencies);

	throw new Error(`Not implemented: ${format}`);
}

function getEsWrapper(name: string, options: CompileOptions, imports: Node[], source: string) {
	const importBlock = imports
		.map((declaration: Node) => source.slice(declaration.start, declaration.end))
		.join('\n');

	return {
		intro: deindent`
			${importBlock}

			export default (function() {
		`,
		outro: deindent`
			return ${name};
			}());`
	};
}

function getAmdWrapper(name: string, options: CompileOptions, dependencies: Dependency[]) {
	const sourceString = dependencies.length
		? `[${dependencies.map(d => `"${removeExtension(d.source)}"`).join(', ')}], `
		: '';

	const id = options.amd && options.amd.id;

	return {
		intro: deindent`
			define(${id ? `"${id}", ` : ''}${sourceString}function(${paramString(dependencies)}) { "use strict";

			${getCompatibilityStatements(dependencies)}

			`,
		outro: deindent`
			return ${name};
			});`
	};
}

function getCjsWrapper(name: string, options: CompileOptions, dependencies: Dependency[]) {
	const requireBlock = dependencies
		.map(d => `var ${d.name} = require("${d.source}");`)
		.join('\n\n');

	const intro = requireBlock ?
		deindent`
			"use strict";

			${requireBlock}
			${getCompatibilityStatements(dependencies)}

			` :
		deindent`
			"use strict";

			`;

	const outro = `module.exports = ${name};`

	return { intro, outro };
}

function getIifeWrapper(name: string, options: CompileOptions, dependencies: Dependency[]) {
	if (!options.name) {
		throw new Error(`Missing required 'name' option for IIFE export`);
	}

	const globals = getGlobals(dependencies, options);

	return {
		intro: deindent`
			var ${options.name} = (function(${paramString(dependencies)}) { "use strict";

			${getCompatibilityStatements(dependencies)}

			`,

		outro: `return ${name};\n\n}(${globals.join(', ')}));`
	};
}

function getUmdWrapper(name: string, options: CompileOptions, dependencies: Dependency[]) {
	if (!options.name) {
		throw new Error(`Missing required 'name' option for UMD export`);
	}

	const amdId = options.amd && options.amd.id ? `'${options.amd.id}', ` : '';

	const amdDeps = dependencies.length
		? `[${dependencies.map(d => `"${removeExtension(d.source)}"`).join(', ')}], `
		: '';

	const cjsDeps = dependencies
		.map(d => `require("${d.source}")`)
		.join(', ');

	const globals = getGlobals(dependencies, options);

	return {
		intro: deindent`
			(function(global, factory) {
				typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(${cjsDeps}) :
				typeof define === "function" && define.amd ? define(${amdId}${amdDeps}factory) :
				(global.${options.name} = factory(${globals}));
			}(this, (function (${paramString(dependencies)}) { "use strict";

			${getCompatibilityStatements(dependencies)}

			`,

		outro: deindent`
			return ${name};

			})));`
	};
}

function getEvalWrapper(name: string, options: CompileOptions, dependencies: Dependency[]) {
	const globals = getGlobals(dependencies, options);

	return {
		intro: deindent`
			(function (${paramString(dependencies)}) { "use strict";

			${getCompatibilityStatements(dependencies)}

			`,

		outro: `return ${name};\n\n}(${globals.join(', ')}));`
	};
}

function paramString(dependencies: Dependency[]) {
	return dependencies.map(dep => dep.name).join(', ');
}

function removeExtension(file: string) {
	const index = file.lastIndexOf('.');
	return ~index ? file.slice(0, index) : file;
}

function getCompatibilityStatements(dependencies: Dependency[]) {
	if (!dependencies.length) return null;

	const statements: string[] = [];

	dependencies.forEach(dependency => {
		statements.push(...dependency.statements);
	});

	return statements.join('\n');
}

function getGlobals(dependencies: Dependency[], options: CompileOptions) {
	const { globals, onerror, onwarn } = options;
	const globalFn = getGlobalFn(globals);

	return dependencies.map(d => {
		let name = globalFn(d.source);

		if (!name) {
			if (d.name.startsWith('__import')) {
				const error = new Error(
					`Could not determine name for imported module '${d.source}' – use options.globals`
				);
				if (onerror) {
					onerror(error);
				} else {
					throw error;
				}
			} else {
				const warning = {
					message: `No name was supplied for imported module '${d.source}'. Guessing '${d.name}', but you should use options.globals`,
				};

				if (onwarn) {
					onwarn(warning);
				} else {
					console.warn(warning); // eslint-disable-line no-console
				}
			}

			name = d.name;
		}

		return name;
	});
}

function getGlobalFn(globals: any): (id: string) => string {
	if (typeof globals === 'function') return globals;
	if (typeof globals === 'object') {
		return id => globals[id];
	}

	return () => undefined;
}