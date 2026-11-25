<script lang="ts">
	import { api, checkpoint } from './ReadSchedulingHelpers.js';

	// async deriveds are pure, so these run in parallel...
	const a = $derived(await api.load('imported-method-barrier', 'a', 1));
	const b = $derived(await api.load('imported-method-barrier', 'b', 2));

	// ...whereas a regular `await` might mutate `api`, so `d` (which reads it) has to wait for it
	const c = await api.load('imported-method-barrier', 'c', 3);
	checkpoint('imported-method-barrier');
	const d = $derived(await api.load('imported-method-barrier', 'd', 4));
</script>

<output>{a}/{b}/{c}/{d}</output>
