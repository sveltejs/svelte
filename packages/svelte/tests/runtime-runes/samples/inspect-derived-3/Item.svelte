<script>
	import {getContext} from 'svelte';

	let { children, value} = $props();

	let listContext = getContext('list');

	let selected = $derived(listContext?.selectedValue === value);

	$inspect(value, selected);
</script>

<div class:selected>{@render children()}</div>
