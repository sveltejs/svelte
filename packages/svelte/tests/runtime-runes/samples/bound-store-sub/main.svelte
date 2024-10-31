<script>
	import { writable } from 'svelte/store';
	import Child from './Child.svelte';

	let form = writable({
		count: 0
	});
</script>

<Child bind:form={$form} />
{JSON.stringify($form)}
