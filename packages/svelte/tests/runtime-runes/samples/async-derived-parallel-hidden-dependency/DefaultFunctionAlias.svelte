<script lang="ts">
	import { checkpoint, loadWithCompletion } from './ReadSchedulingHelpers.js';

	const { get = readA } = {};
	const a = $derived(await loadWithCompletion('default-function-alias', 'a', 42));
	checkpoint('default-function-alias');
	const b = $derived(await get());

	function readA() {
		console.log(['default-function-alias', 'read b']);
		return a;
	}
</script>

<output>{a}/{b}</output>
