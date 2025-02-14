import * as $ from 'svelte/internal/server';
import { random } from './module.svelte';

export default function Imports_in_modules($$payload) {
	const $$cleanup = $.setup($$payload);

	$$cleanup($$payload);
}