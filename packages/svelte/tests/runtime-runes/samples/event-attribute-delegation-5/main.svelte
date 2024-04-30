<script>
	import Component from "./Component.svelte";
	import Button from "./Button.svelte";
</script>

<Component onclick={() => console.log('outer div onclick')}>
	<Component on:click={() => console.log('inner div on:click')}>
		<Button onclick={() => console.log('button onclick')} on:click={() => console.log('button on:click')}>main</Button>
	</Component>
</Component>
