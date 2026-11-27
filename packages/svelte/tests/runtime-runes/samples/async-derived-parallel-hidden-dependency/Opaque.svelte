<script module lang="ts">
	function module_checkpoint() {
		console.log(['opaque', 'module checkpoint']);
	}

	function module_load(label: string, value: string) {
		console.log(['opaque', `module ${label}`]);
		return Promise.resolve(value);
	}
</script>

<script lang="ts">
	import { checkpoint, load } from './OpaqueHelpers.js';

	const gate = await load('gate', 'ready');
	module_checkpoint();
	checkpoint();

	// Opaque module and imported functions cannot access instance locals except through arguments.
	const module_value = $derived(await module_load('independent', 'module'));
	const imported_value = $derived(await load('independent', 'import'));

	// Explicit arguments still make a derived wait for their declarations.
	const argument = $derived(await load('argument', gate));
	const returned = await load('return', 'returned');
	const dependent = $derived(await module_load('dependent', returned));
</script>

<output>{module_value} {imported_value} {argument} {dependent}</output>
