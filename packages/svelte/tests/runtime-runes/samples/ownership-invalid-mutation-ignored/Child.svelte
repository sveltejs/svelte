<script>
	let { test, store } = $props();
	let der = $derived(test);
	let state = $state(test);
</script>

<button
	onclick={() => {
		//svelte-ignore ownership_invalid_mutation
		test.test = Math.random();
		//svelte-ignore ownership_invalid_mutation
		test.test++;
	}}
>
</button>

<button
	onclick={() => {
		//svelte-ignore ownership_invalid_mutation
		der.test = Math.random();
		//svelte-ignore ownership_invalid_mutation
		der.test++;
	}}
>
</button>

<button
	onclick={() => {
		//svelte-ignore ownership_invalid_mutation
		state.test = Math.random();
		//svelte-ignore ownership_invalid_mutation
		state.test++;
	}}
>
</button>

<button
	onclick={() => {
		//svelte-ignore ownership_invalid_mutation
		$store.test = Math.random();
		//svelte-ignore ownership_invalid_mutation
		$store.test++;
	}}
>
</button>
