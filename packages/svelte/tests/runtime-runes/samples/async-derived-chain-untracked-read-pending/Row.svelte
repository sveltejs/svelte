<script lang="ts">
	import { stats } from './stats.js';

	let n = $state(0);

	// a chain of ten deriveds, each reading the previous one
	let previous = () => n;
	for (let i = 0; i < 10; i++) {
		const read = previous;
		const value = $derived((stats.runs++, read() + 1));
		previous = () => value;
	}
	const last = previous;

	// one read in the script, where nothing tracks it...
	const initial = last();
</script>

<!-- ...and one in the template -->
<p>{initial} {last()}</p>
