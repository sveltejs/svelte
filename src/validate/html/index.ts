import validateComponent from './validateComponent';
import validateElement from './validateElement';
import validateWindow from './validateWindow';
import validateHead from './validateHead';
import validateSlot from './validateSlot';
import a11y from './a11y';
import fuzzymatch from '../utils/fuzzymatch'
import flattenReference from '../../utils/flattenReference';
import { Validator } from '../index';
import { Node } from '../../interfaces';
import unpackDestructuring from '../../utils/unpackDestructuring';

function isEmptyBlock(node: Node) {
	if (!/Block$/.test(node.type) || !node.children) return false;
	if (node.children.length > 1) return false;
	const child = node.children[0];
	return !child || (child.type === 'Text' && !/\S/.test(child.data));
}

export default function validateHtml(validator: Validator, html: Node) {
	const refs = new Map();
	const refCallees: Node[] = [];
	const stack: Node[] = [];
	const elementStack: Node[] = [];

	function visit(node: Node) {
		if (node.type === 'Window') {
			validateWindow(validator, node, refs, refCallees);
		}

		else if (node.type === 'Head') {
			validateHead(validator, node, refs, refCallees);
		}

		else if (node.type === 'Slot') {
			validateSlot(validator, node);
		}

		else if (node.type === 'Component' || node.name === 'svelte:self' || node.name === 'svelte:component') {
			validateComponent(
				validator,
				node,
				refs,
				refCallees,
				stack,
				elementStack
			);
		}

		else if (node.type === 'Element') {
			validateElement(
				validator,
				node,
				refs,
				refCallees,
				stack,
				elementStack
			);

			a11y(validator, node, elementStack);
		}

		else if (node.type === 'EachBlock') {
			const contexts = [];
			unpackDestructuring(contexts, node.context, '');

			contexts.forEach(prop => {
				if (validator.helpers.has(prop.key.name)) {
					validator.warn(prop.key, {
						code: `each-context-clash`,
						message: `Context clashes with a helper. Rename one or the other to eliminate any ambiguity`
					});
				}
			});
		}

		else if (node.type === 'DebugTag') {
			// Only allow the `_` expression if it's by itself
			// i.e. {@debug _, name } is redundantredundant-debug-all
			const names = node.expression.expressions.map(e => e.name);

			if (names.length > 0 && names.includes('_')) {
				validator.error(node, {
					code: 'redundant-debug-all',
					message: `Combining other expressions with '_' is redundant`
				});
			}
		}

		if (validator.options.dev && isEmptyBlock(node)) {
			validator.warn(node, {
				code: `empty-block`,
				message: 'Empty block'
			});
		}

		if (node.children) {
			if (node.type === 'Element') elementStack.push(node);
			stack.push(node);
			node.children.forEach(visit);
			stack.pop();
			if (node.type === 'Element') elementStack.pop();
		}

		if (node.else) {
			visit(node.else);
		}

		if (node.type === 'AwaitBlock') {
			visit(node.pending);
			visit(node.then);
			visit(node.catch);
		}
	}

	html.children.forEach(visit);

	refCallees.forEach(callee => {
		const { parts } = flattenReference(callee);
		const ref = parts[1];

		if (refs.has(ref)) {
			// TODO check method is valid, e.g. `audio.stop()` should be `audio.pause()`
		} else {
			const match = fuzzymatch(ref, Array.from(refs.keys()));

			let message = `'refs.${ref}' does not exist`;
			if (match) message += ` (did you mean 'refs.${match}'?)`;

			validator.error(callee, {
				code: `missing-ref`,
				message
			});
		}
	});
}
