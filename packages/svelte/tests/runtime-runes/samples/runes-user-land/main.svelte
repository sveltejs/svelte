<script>
	import ExplicitRunes from './ExplicitRunes.svelte';
	import ExplicitLegacy from './ExplicitLegacy.svelte';

	let count = $state(1);
</script>

<p>{count}</p>
<ExplicitRunes />
<ExplicitLegacy />
