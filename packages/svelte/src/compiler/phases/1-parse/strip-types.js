import { walk } from 'zimmerframe';
import * as b from '../../utils/builders.js';

/**
 * @param {import('estree').Node} node
 */
export function strip_types(node) {
	return walk(node, null, {
		_(node, context) {
			// @ts-expect-error
			if (node.exportKind === 'type' || node.importKind === 'type') {
				console.log('>>>', node);
				return b.empty;
			}

			// @ts-expect-error
			delete node.loc.start.index;
			// @ts-expect-error
			delete node.loc.end.index;
			// // @ts-expect-error
			// delete node.returnType;
			// // @ts-expect-error
			// delete node.importKind;
			// // @ts-expect-error
			// delete node.exportKind;
			// // @ts-expect-error
			// delete node.typeAnnotation;
			// // @ts-expect-error
			// delete node.typeParameters;

			// if (node.type.startsWith('TS')) {
			// 	const ts_node = /** @type {any} */ (node);

			// 	switch (ts_node.type) {
			// 		case 'TSAsExpression':
			// 		case 'TSNonNullExpression':
			// 			// hack to make sure parser skips over the type assertion
			// 			ts_node.expression.end = ts_node.end;
			// 			return context.visit(ts_node.expression);
			// 		default:
			// 			return b.empty;
			// 	}
			// }

			context.next();
		}
	});
}
