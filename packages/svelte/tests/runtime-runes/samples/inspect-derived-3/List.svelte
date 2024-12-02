<script>
	import {setContext} from 'svelte';

	let {children, selectedValue} = $props();

	let listContext = $state({ selectedValue});

	$effect(() => {
		listContext.selectedValue = selectedValue;
	});

	setContext('list',listContext);
</script>

<div class="list">
	{@render children()}
</div>
