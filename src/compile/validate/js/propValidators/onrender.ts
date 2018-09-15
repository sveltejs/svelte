import oncreate from './oncreate';
import { Node } from '../../../../interfaces';
import Component from '../../../Component';

export default function onrender(component: Component, prop: Node) {
	component.warn(prop, {
		code: `deprecated-onrender`,
		message: `'onrender' has been deprecated in favour of 'oncreate', and will cause an error in Svelte 2.x`
	});

	oncreate(component, prop);
}
