import { onDestroy } from 'svelte';

export function onInterval(callback, milliseconds) {
	const interval = setInterval(callback, milliseconds);

	onDestroy(() => {
		// After the component is destroyed, setInterval will continue to work, fix it here
	});
}