<script>
	import Child from './child.svelte';
	let foo = $state('foo');
	let show = $state(true);
	let i = 0;
</script>

<button onclick={() => show = !show}>toggle</button>
<button onclick={() => foo = 'top'+i++}>change top</button>

<svelte:html {foo} class="foo bar"></svelte:html>

{#if show}
	<Child />
{/if}
