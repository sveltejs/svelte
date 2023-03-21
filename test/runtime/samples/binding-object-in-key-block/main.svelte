<script>
	import Component from './Component.svelte';
	let obj = {
		value: '0'
	};
</script>

{#key obj}
	<Component bind:obj={obj} />
{/key}
