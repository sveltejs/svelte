<script>
	import Visibility from './Visibility.svelte';
	import counter from './counter.js';

	export let things = ['first thing', 'second thing'];
	export let visibilityMap = {};

	function visibleThings() {
		counter.count += 1;
		return things.filter(text => visibilityMap[text]);
	}
</script>

{#each things as thing}
	<Visibility bind:isVisible="visibilityMap[thing]">
		<p>{thing} ({visibilityMap[thing]})</p>
	</Visibility>
{/each}