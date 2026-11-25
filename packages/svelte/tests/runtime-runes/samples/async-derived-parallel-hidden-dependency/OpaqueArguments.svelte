<script lang="ts">
	import { invoke } from './OpaqueArgumentHelpers.js';

	let value = 0;

	function change() {
		value = 42;
	}

	await Promise.resolve();
	// Trusting an imported function must not hide the callback explicitly passed to it.
	invoke(change);

	const result = $derived(await Promise.resolve(value));
</script>

<output>{result}</output>
