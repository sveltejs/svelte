import deindent from '../../../utils/deindent';
import list from '../../../utils/list';
import { CompileOptions, ModuleFormat, Node } from '../../../interfaces';

interface Dependency {
	name: string;
	statements: string[];
	source: string;
}

const wrappers = { es, amd, cjs, iife, umd, eval: expr };

export default function wrapModule(
	code: string,
	format: ModuleFormat,
	name: string,
	options: CompileOptions,
	banner: string,
	sharedPath: string,
	helpers: { name: string, alias: string }[],
	imports: Node[],
	source: string
): string {
	if (format === 'es') return es(code, name, options, banner, sharedPath, helpers, imports, source);

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

	if (format === 'amd') return amd(code, name, options, banner, dependencies);
	if (format === 'cjs') return cjs(code, name, options, banner, sharedPath, helpers, dependencies);
	if (format === 'iife') return iife(code, name, options, banner, dependencies);
	if (format === 'umd') return umd(code, name, options, banner, dependencies);
	if (format === 'eval') return expr(code, name, options, banner, dependencies);

	throw new Error(`options.format is invalid (must be ${list(Object.keys(wrappers))})`);
}

function es(
	code: string,
	name: string,
	options: CompileOptions,
	banner: string,
	sharedPath: string,
	helpers: { name: string, alias: string }[],
	imports: Node[],
	source: string
) {
	const importHelpers = helpers && (
		`import { ${helpers.map(h => h.name === h.alias ? h.name : `${h.name} as ${h.alias}`).join(', ')} } from ${JSON.stringify(sharedPath)};`
	);

	const importBlock = imports.length > 0 && (
		imports
			.map((declaration: Node) => source.slice(declaration.start, declaration.end))
			.join('\n')
	);

	return deindent`
		${banner}
		${importHelpers}
		${importBlock}

		${code}
		export default ${name};`;
}

function amd(
	code: string,
	name: string,
	options: CompileOptions,
	banner: string,
	dependencies: Dependency[]
) {
	const sourceString = dependencies.length
		? `[${dependencies.map(d => `"${removeExtension(d.source)}"`).join(', ')}], `
		: '';

	const id = options.amd && options.amd.id;

	return deindent`
		define(${id ? `"${id}", ` : ''}${sourceString}function(${paramString(dependencies)}) { "use strict";
			${getCompatibilityStatements(dependencies)}

			${code}
			return ${name};
		});`;
}

function cjs(
	code: string,
	name: string,
	options: CompileOptions,
	banner: string,
	sharedPath: string,
	helpers: { name: string, alias: string }[],
	dependencies: Dependency[]
) {
	const SHARED = '__shared';
	const helperBlock = helpers && (
		`var ${SHARED} = require(${JSON.stringify(sharedPath)});\n` +
		helpers.map(helper => {
			return `var ${helper.alias} = ${SHARED}.${helper.name};`;
		}).join('\n')
	);

	const requireBlock = dependencies.length > 0 && (
		dependencies
			.map(d => `var ${d.name} = require("${d.source}");`)
			.join('\n\n')
	);

	return deindent`
		${banner}
		"use strict";

		${helperBlock}
		${requireBlock}
		${getCompatibilityStatements(dependencies)}

		${code}

		module.exports = ${name};`
}

function iife(
	code: string,
	name: string,
	options: CompileOptions,
	banner: string,
	dependencies: Dependency[]
) {
	if (!options.name) {
		throw new Error(`Missing required 'name' option for IIFE export`);
	}

	const globals = getGlobals(dependencies, options);

	return deindent`
		${banner}
		var ${options.name} = (function(${paramString(dependencies)}) { "use strict";
			${getCompatibilityStatements(dependencies)}

			${code}
			return ${name};
		}(${globals.join(', ')}));`;
}

function umd(
	code: string,
	name: string,
	options: CompileOptions,
	banner: string,
	dependencies: Dependency[]
) {
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

	return deindent`
		${banner}
		(function(global, factory) {
			typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(${cjsDeps}) :
			typeof define === "function" && define.amd ? define(${amdId}${amdDeps}factory) :
			(global.${options.name} = factory(${globals.join(', ')}));
		}(this, (function (${paramString(dependencies)}) { "use strict";

			${getCompatibilityStatements(dependencies)}

			${code}

			return ${name};

		})));`;
}

function expr(
	code: string,
	name: string,
	options: CompileOptions,
	banner: string,
	dependencies: Dependency[]
) {
	const globals = getGlobals(dependencies, options);

	return deindent`
		(function (${paramString(dependencies)}) { "use strict";
			${banner}

			${getCompatibilityStatements(dependencies)}

			${code}

			return ${name};
		}(${globals.join(', ')}))`;
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
				onerror(error);
			} else {
				const warning = {
					message: `No name was supplied for imported module '${d.source}'. Guessing '${d.name}', but you should use options.globals`,
				};

				onwarn(warning);
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