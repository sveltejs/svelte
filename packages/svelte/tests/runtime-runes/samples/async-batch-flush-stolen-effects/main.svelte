<script>
	import Async from './Async.svelte';
	import Sync from './Sync.svelte';

	let x = $state(0);
	let y = $state(0);
</script>

<button
	onclick={() => {
		x++;
		// the second batch is created while the first one is pending, after the first one
		// scheduled its effects but before it is flushed again
		queueMicrotask(() => queueMicrotask(() => y++));
	}}>increment</button
>
<Async {x} />
<Sync {y} />
