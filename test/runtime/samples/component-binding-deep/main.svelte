<script>
	import Widget from './Widget.svelte';

	export let deep = {
		name: 'foo'
	};
</script>

<Widget bind:value={deep.name}/>

<p>{deep.name}</p>