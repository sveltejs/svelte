<script>
	import Button from './Button.svelte';

	let count = $state(0);
</script>

<Button onclick={count++}>
	clicks: {count}
</Button>
