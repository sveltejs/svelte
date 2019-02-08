<script>
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';

	const dispatch = createEventDispatcher();

	export let value;

	function handleClick() {
		dispatch('value', { value });
	}
</script>

<Button on:click="{handleClick}">one</Button>
<Button on:click="{() => dispatch('value', {value})}">two</Button>