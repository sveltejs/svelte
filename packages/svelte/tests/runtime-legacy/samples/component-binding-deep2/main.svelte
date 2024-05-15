<script>
	import Widget from './Widget.svelte';

	export let deep = {
		name: 'foo'
	};
</script>

<Widget bind:value={deep}/>

<p>{deep.name}</p>