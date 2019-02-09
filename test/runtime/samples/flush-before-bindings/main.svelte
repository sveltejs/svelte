<script>
	import { beforeUpdate } from 'svelte';
	import Nested from './Nested.svelte';

	export let snapshots;
	export let visibleThings = [];

	beforeUpdate(() => {
		if (!snapshots) {
			// first run
			snapshots = [];
		}

		snapshots.push(visibleThings);
	});
</script>

<Nested bind:visibleThings={visibleThings} />