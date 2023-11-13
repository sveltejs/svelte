<script>
	import Button from "./Button.svelte";

	const {log = []} = $props();
</script>

<Button log={log} onclick={() => log.push('external!')}>Test</Button>
