import ondestroy from './ondestroy';
import { Node } from '../../../../interfaces';
import Component from '../../../Component';

export default function onteardown(component: Component, prop: Node) {
	component.warn(prop, {
		code: `deprecated-onteardown`,
		message: `'onteardown' has been deprecated in favour of 'ondestroy', and will cause an error in Svelte 2.x`
	});

	ondestroy(component, prop);
}
