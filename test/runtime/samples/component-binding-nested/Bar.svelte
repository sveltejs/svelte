<script>
	import Baz from './Baz.svelte';

	export let x;
</script>

<button class='bar' on:click='{() => x = "q"}'>bar</button>
<p>bar x: {x}</p>

<Baz bind:x/>