<script>
	import Bar from './Bar.svelte';

	export let x;
</script>

<button class='foo' on:click='{() => x = "p"}'>foo</button>
<p>foo x: {x}</p>

<Bar bind:x/>