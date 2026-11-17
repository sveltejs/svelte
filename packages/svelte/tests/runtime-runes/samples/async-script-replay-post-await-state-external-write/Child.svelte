<script lang="ts">
	let { register, load }: {
		register: (fn: () => void) => void;
		load: (site: string, value: number) => Promise<number>;
	} = $props();
	console.log('prefix');

	await load('start', 0);
	let n = $state(0);
	const snapshot = n;
	register(() => n++);
	console.log(`state ${n}/${snapshot}`);
	const value = $derived(await load('value', n));
</script>

<p>{snapshot}|{n}|{value}</p>
