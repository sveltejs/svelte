<script>
	import Countdown from './Countdown.svelte';
	export let count = 5;
</script>

{count}

<Countdown {count} let:count>
	<svelte:self {count} />
</Countdown>