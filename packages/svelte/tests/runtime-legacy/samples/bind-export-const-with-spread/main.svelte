<script>
	import Test from "./Test.svelte";

	let x;
</script>

<Test
	bind:x
	{...{}}
/>
<p>{x}</p>