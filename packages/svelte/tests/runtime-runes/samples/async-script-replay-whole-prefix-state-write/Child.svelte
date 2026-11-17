<script lang="ts">
	let { register, load }: {
		register: (fn: () => void) => void;
		load: (value: number) => Promise<number>;
	} = $props();
	let n = $state(0);
	const origin = n;
	register(() => n++);
	console.log(`init ${n}`);
	const result = $derived(await load(n));
</script>
<p>{origin}|{n}|{result}</p>
