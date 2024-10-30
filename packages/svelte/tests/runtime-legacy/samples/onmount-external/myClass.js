import { onMount } from 'svelte';

export class MyClass {
	constructor() {
		onMount(() => console.log('mounted'));
	}
}
