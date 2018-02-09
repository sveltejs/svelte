import * as acorn from 'acorn';
import injectDynamicImport from 'acorn-dynamic-import/src/inject';
import repeat from '../../utils/repeat';
import { Parser } from '../index';
import { Node } from '../../interfaces';

const scriptClosingTag = '</script>';

injectDynamicImport(acorn);

export default function readScript(parser: Parser, start: number, attributes: Node[]) {
	const scriptStart = parser.index;
	const scriptEnd = parser.template.indexOf(scriptClosingTag, scriptStart);

	if (scriptEnd === -1) parser.error(`<script> must have a closing tag`);

	const source =
		repeat(' ', scriptStart) + parser.template.slice(scriptStart, scriptEnd);
	parser.index = scriptEnd + scriptClosingTag.length;

	let ast;

	try {
		ast = acorn.parse(source, {
			ecmaVersion: 8,
			sourceType: 'module',
			plugins: {
				dynamicImport: true
			}
		});
	} catch (err) {
		parser.acornError(err);
	}

	if (!ast.body.length) return null;

	ast.start = scriptStart;
	visitImports(ast, parser);

	return {
		start,
		end: parser.index,
		attributes,
		content: ast,
	};
}

function visitImports(ast, parser) {
	ast.body
		.filter(stmt => stmt.type === 'ImportDeclaration')
		.forEach((stmt) => {
			const m = /[\.\\]?(\w+)\.html$/g.exec(stmt.source.value);
			if (m) {
				let componentName;
				if (stmt.specifiers.length && stmt.specifiers[0].type === 'ImportDefaultSpecifier') {					
					componentName = stmt.specifiers[0].local.name;
				} else {
					componentName = m[1];
					stmt.specifiers.push(
						{
							"type": "ImportDefaultSpecifier",
							"start": stmt.start,
							"end": stmt.end,
							"local": {
								"type": "Identifier",
								"start": stmt.source.start,
								"end": stmt.source.end,
								"name": componentName
							}
						}
					);
				}
				exportComponent(ast, parser, stmt, componentName);
			}
		});
}

function exportComponent(ast, parser, importStmt, componentName) {
	let wasExported = false;
	let exportStatement, exportedComponents;
	ast.body
		.filter(stmt => stmt.type === 'ExportDefaultDeclaration')
		.some((stmt) => {
			exportStatement = stmt;
			stmt.declaration.properties.some((p) => {
				const isComponents = p.type === 'Property' && p.key.name === 'components';
				if (isComponents) {
					if (p.value.type !== 'ObjectExpression')
						parser.error(`export default must have components as an object`);
					else {
						exportedComponents = p;
						wasExported = exportedComponents.value.properties.some(comp => comp.type === 'Property' && comp.key.name === componentName);
					}
				}
				return wasExported;
			});
			return wasExported;
		});
	if (!wasExported) {
		if (!exportStatement) {
			exportStatement = {
				"type": "ExportDefaultDeclaration",
				"start": importStmt.start,
				"end": importStmt.end,
				"declaration": {
					"type": "ObjectExpression",
					"start": importStmt.start,
					"end": importStmt.end,
					"properties": [
					]
				}
			};
			ast.body.push(exportStatement);
		}
		if (!exportedComponents) {
			exportedComponents = {
				"type": "Property",
				"start": exportStatement.start,
				"end": exportStatement.end,
				"method": false,
				"shorthand": false,
				"computed": false,
				"key": {
					"type": "Identifier",
					"start": exportStatement.start,
					"end": exportStatement.end,
					"name": "components"
				},
				"value": {
					"type": "ObjectExpression",
					"start": exportStatement.start,
					"end": exportStatement.end,
					"properties": []
				},
				"kind": "init"
			};
			exportStatement.declaration.properties.push(exportedComponents);
		}
		exportedComponents.value.properties.push(
			{
				"type": "Property",
				"start": importStmt.start,
				"end": importStmt.end,
				"method": false,
				"shorthand": true,
				"computed": false,
				"key": {
					"type": "Identifier",
					"start": importStmt.start,
					"end": importStmt.start,
					"name": componentName
				},
				"kind": "init",
				"value": {
					"type": "Identifier",
					"start": importStmt.start,
					"end": importStmt.start,
					"name": componentName
				}
			}
		);
	}
}
