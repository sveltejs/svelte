<script lang="ts">
	let { load, allow_write }: {
		load: (site: string, value: number) => Promise<number>;
		allow_write: () => boolean;
	} = $props();
	console.log('prefix');

	await load('start', 0);
	let n = $state(0);
	const before = n;
	allow_write() && n++;
	const value = $derived(await load('value', n));
</script>

<p>{before}|{n}|{value}</p>
