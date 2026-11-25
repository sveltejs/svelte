<script lang="ts">
	import { checkpoint, load, loadWithCompletion } from './ReadSchedulingHelpers.js';

	const options = {
		get id() {
			return a;
		}
	};

	const a = $derived(await loadWithCompletion('dependent-getter', 'a', 42));
	checkpoint('dependent-getter');
	const b = $derived(await load('dependent-getter', 'b', options.id));
</script>

<output>{a}/{b}</output>
