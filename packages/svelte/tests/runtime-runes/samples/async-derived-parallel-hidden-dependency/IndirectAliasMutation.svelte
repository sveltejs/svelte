<script lang="ts">
	let { theme }: { theme?: { mode: string } } = $props();

	const local = { mode: 'light' };
	const active = theme ?? local;

	await Promise.resolve();

	// mutates `local`, since no theme is passed
	active.mode = 'dark';

	const result = $derived(await Promise.resolve(local.mode));
</script>

<output>{result}</output>
