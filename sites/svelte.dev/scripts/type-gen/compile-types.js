// @ts-check
import MagicString from 'magic-string';
import fs from 'node:fs';
import { rollup } from 'rollup';
import dts from 'rollup-plugin-dts';
import ts from 'typescript';
import { VERSION } from 'svelte/compiler';

export async function get_bundled_types() {
	const dtsSources = fs.readdirSync(new URL('./dts-sources', import.meta.url));

	/** @type {Map<string, string>} */
	const codes = new Map();

	for (const file of dtsSources) {
		const bundle = await rollup({
			input: new URL(`./dts-sources/${file}`, import.meta.url).pathname,
			plugins: [dts({ respectExternal: true })]
			// external: ['estree-walker']
		});

		try {
			fs.mkdirSync(new URL(`../../node_modules/.type-gen`, import.meta.url));
		} catch {}

		codes.set(
			(file === 'index.d.ts' ? 'svelte' : `svelte/${file}`).replace('.d.ts', ''),
			useExportDeclarations(
				await bundle.generate({ format: 'esm' }).then(({ output }) => output[0].code)
			)
		);
	}

	return codes;
}

/**
 * @param {string} str
 */
function useExportDeclarations(str) {
	const magicStr = new MagicString(str);

	const sourceFile = ts.createSourceFile(
		'index.d.ts',
		str,
		ts.ScriptTarget.ESNext,
		true,
		ts.ScriptKind.TS
	);

	// There's only gonna be one because of the output of dts-plugin
	const exportDeclaration = sourceFile.statements.find((statement) =>
		ts.isExportDeclaration(statement)
	);

	if (exportDeclaration && !ts.isExportDeclaration(exportDeclaration)) return str;

	// @ts-ignore Why does TS not identify `elements`
	const exportedSymbols = exportDeclaration?.exportClause?.elements.map(
		(element) => element.name.text
	);

	for (const statement of sourceFile.statements) {
		if (
			!(
				ts.isFunctionDeclaration(statement) ||
				ts.isInterfaceDeclaration(statement) ||
				ts.isTypeAliasDeclaration(statement) ||
				ts.isVariableStatement(statement)
			)
		)
			continue;

		for (const exportedSymbol of exportedSymbols) {
			if (
				(ts.isVariableStatement(statement) &&
					statement.declarationList.declarations[0].name.getText() === exportedSymbol) ||
				// @ts-ignore
				statement.name?.getText() === exportedSymbol
			) {
				magicStr.appendLeft(statement.getStart(), 'export ');
			}
		}
	}

	magicStr.remove(exportDeclaration?.getStart() ?? 0, exportDeclaration?.getEnd() ?? 0);

	// In case it is export declare VERSION = '__VERSION__', replace it with svelte's real version
	magicStr.replace('__VERSION__', VERSION);

	return magicStr.toString() ?? str;
}

get_bundled_types();
