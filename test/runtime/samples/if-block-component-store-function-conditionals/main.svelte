<script>
	import {writable} from 'svelte/store';
	import Widget from './Widget.svelte';
	let a = (writable({}));
	let b = () => true;
</script>
{#if $a || b() }
		<Widget></Widget>
{:else}
	<pre>fail</pre>
{/if}