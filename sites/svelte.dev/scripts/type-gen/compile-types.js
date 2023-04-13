// @ts-check
import MagicString from 'magic-string';
import fs from 'node:fs';
import { rollup } from 'rollup';
import dts from 'rollup-plugin-dts';
import { VERSION } from 'svelte/compiler';
import { Project, SyntaxKind } from 'ts-morph';
import ts from 'typescript';

// get_bundled_types();

export async function get_bundled_types() {
	const dtsSources = fs.readdirSync(new URL('./dts-sources', import.meta.url));

	/** @type {Map<string, {code: string, ts_source_file: ts.SourceFile}>} */
	const codes = new Map();

	for (const file of dtsSources) {
		const bundle = await rollup({
			input: new URL(`./dts-sources/${file}`, import.meta.url).pathname,
			plugins: [dts({ respectExternal: true })]
		});

		const moduleName = (file === 'index.d.ts' ? 'svelte' : `svelte/${file}`).replace('.d.ts', '');
		const code = await bundle.generate({ format: 'esm' }).then(({ output }) => output[0].code);
		const [inlined_export_declaration_code, ts_source_file] = useExportDeclarations(code);

		codes.set(moduleName, { code: inlined_export_declaration_code, ts_source_file });

		// !IMPORTANT: This is for debugging purposes only.
		// !Do not remove until Svelte d.ts files are stable during v4/v5
		write_to_node_modules('before', file, code);
		write_to_node_modules('after', file, inlined_export_declaration_code);
	}

	return codes;
}

/**
 * @param {string} str
 * @returns {[string, ts.SourceFile]}
 */
function useExportDeclarations(str) {
	const project = new Project();
	const source_file = project.createSourceFile('index.d.ts', str, { overwrite: true });

	// There's only gonna be one because of the output of dts-plugin
	const exportDeclaration = source_file.getExportDeclarations()[0];
	const exportedSymbols = exportDeclaration
		.getNamedExports()
		.map((e) => e.getAliasNode()?.getText() ?? e.getNameNode().getText());

	// console.log(exportedSymbols);
	if (exportedSymbols.length === 0)
		return [
			str,
			ts.createSourceFile('index.d.ts', str, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
		];

	const aliasedExportedSymbols = new Map();
	const namedExports = exportDeclaration.getNamedExports();

	namedExports.forEach((namedExport) => {
		if (namedExport.getAliasNode()) {
			const alias = namedExport.getAliasNode()?.getText();
			const originalName = namedExport.getNameNode().getText();
			aliasedExportedSymbols.set(alias, originalName);
		}
	});

	for (const [exported, og] of aliasedExportedSymbols) {
		source_file.forEachDescendant((node) => {
			if (node.getKind() === ts.SyntaxKind.Identifier && node.getText() === og) {
				node.replaceWithText(exported);
			}
		});
	}

	const magicStr = new MagicString(source_file.getFullText());

	// Find all the identifiers from ewport declaration and prefix export before them
	const identifiers = [
		...new Set(
			source_file
				.getDescendantsOfKind(SyntaxKind.Identifier)
				.filter((identifier) => exportedSymbols.includes(identifier.getText()))
				.filter(
					(value, index, self) => index === self.findIndex((t) => t.getText() === value.getText())
				)
		)
	];

	for (const identifier of identifiers) {
		magicStr.appendLeft(identifier?.getFirstAncestor()?.getStartLinePos() ?? 0, 'export ');
	}

	magicStr.remove(exportDeclaration?.getStart() ?? 0, exportDeclaration?.getEnd() ?? 0);

	// In case it is export declare VERSION = '__VERSION__', replace it with svelte's real version
	magicStr.replace('__VERSION__', VERSION);

	return [
		magicStr.toString() ?? str,
		ts.createSourceFile(
			'index.d.ts',
			magicStr.toString() ?? str,
			ts.ScriptTarget.ESNext,
			true,
			ts.ScriptKind.TS
		)
	];
}

/**
 * @param {'before' | 'after'} label
 * @param {string} filename
 * @param {string} code
 */
function write_to_node_modules(label, filename, code) {
	const folder = new URL(`../../node_modules/.type-gen/${label}`, import.meta.url).pathname;

	try {
		fs.mkdirSync(folder, { recursive: true });
	} catch {}

	fs.writeFileSync(`${folder}/${filename}`, code);
}
