<script>
	import { flushSync } from 'svelte';

	let s = $state({ restoring: false, item: 'A', shown: '-' });

	$effect.pre(() => {
		if (s.restoring) flushSync();
	});

	$effect.pre(() => {
		s.shown = s.item;
	});
</script>

<button onclick={() => { s.restoring = true; s.item = 'B'; flushSync(); }}>step1</button>
<button onclick={() => { s.item = 'C'; }}>step2</button>
<p>shown={s.shown}</p>
