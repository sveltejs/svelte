// @ts-check
import { rollup } from 'rollup';
import dts from 'rollup-plugin-dts';
import fs from 'node:fs';
import ts from 'typescript'

export async function get_bundled_types() {
	const dtsSources = fs.readdirSync(new URL('./dts-sources', import.meta.url));

	/** @type {Map<string, string>} */
	const codes = new Map();

	for (const file of dtsSources) {
		const bundle = await rollup({
			input: new URL(`./dts-sources/${file}`, import.meta.url).pathname,
			plugins: [dts({ respectExternal: true })],
			external: ['estree-walker']
		});

		codes.set(
			(file === 'index.d.ts' ? 'svelte' : `svelte/${file}`).replace('.d.ts', ''),
			await bundle.generate({ format: 'esm' }).then(({ output }) => output[0].code)
		);
	}

	console.log(codes.get('svelte/action'));

	return codes;
}


/**
 * Modify a TypeScript SourceFile to use export declarations instead of export specifiers.
 * @param {ts.SourceFile} sourceFile - The TypeScript SourceFile to modify
 * @returns {string} The modified TypeScript code
 */
function useExportDeclarations(sourceFile) {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  /**
   * Process the given node, modifying it if necessary.
   * @param {ts.Node} node - The TypeScript node to process
   * @returns {ts.Node} The processed TypeScript node
   */
  function processNode(node) {
    if (ts.isExportDeclaration(node)) {
      const namedExports = node.exportClause;

      if (namedExports && ts.isNamedExports(namedExports)) {
				/** @type {ts.Statement[]} */
        const newNodes = [];

        namedExports.elements.forEach((exportSpecifier) => {
          const exportedIdentifier = exportSpecifier.name;
          const exportedName = exportedIdentifier.text;
          const exportedDeclaration = sourceFile.statements.find((statement) => {
            if (ts.isInterfaceDeclaration(statement) && statement.name.text === exportedName) {
              return true;
            }

            if (ts.isFunctionDeclaration(statement) && statement.name && statement.name.text === exportedName) {
              return true;
            }

            if (ts.isVariableStatement(statement)) {
              return statement.declarationList.declarations.some(
                (declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === exportedName
              );
            }

            return false;
          });

          if (exportedDeclaration) {
            const newDeclaration = ts.factory.updateExportDeclaration(
              exportedDeclaration,
							exportedDeclaration.modifiers,
false,


              ts.factory.createNodeArray([ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)], exportedDeclaration.modifiers)
            );
            newNodes.push(newDeclaration as ts.Statement);
          }
        });

        return ts.factory.createBlock(newNodes, true);
      }
    }

    return ts.visitEachChild(node, processNode, nullTransformationContext);
  }

  const nullTransformationContext: ts.TransformationContext = {
    enableEmitNotification: () => {},
    enableSubstitution: () => {},
    endLexicalEnvironment: () => [],
    getCompilerOptions: () => ({}),
    getEmitHost: () => ({}),
    getEmitResolver: () => ({}),
    hoistFunctionDeclaration: () => {},
    hoistVariableDeclaration: () => {},
    isEmitNotificationEnabled: () => false,
    isSubstitutionEnabled: () => false,
    onEmitNode: () => {},
    onSubstituteNode: () => node => node,
    startLexicalEnvironment: () => {},
  };

  const resultFile = ts.visitNode(sourceFile, processNode);
  const resultCode = printer.printFile(resultFile);

  return resultCode;
}