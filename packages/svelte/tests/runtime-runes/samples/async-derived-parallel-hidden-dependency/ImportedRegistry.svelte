<script lang="ts">
	import { registry } from './ReadSchedulingHelpers.js';

	// any method might hold on to its arguments
	registry.register(() => value);

	await Promise.resolve();
	const value = 42;

	// so `registry` might hold a callback that reads `value`
	const result = $derived(await registry.run());
</script>

<output>{result}</output>
