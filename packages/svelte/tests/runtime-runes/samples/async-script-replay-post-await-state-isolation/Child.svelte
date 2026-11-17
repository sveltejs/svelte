<script lang="ts">
	let { input, load }: {
		input: number;
		load: (site: string, value: number) => Promise<number>;
	} = $props();

	const first = $derived(await load('first', input));
	let local = $state(first);
	const snapshot = local;
	console.log(`state ${local}/${snapshot}`);
	const result = $derived(await load('last', input));
</script>

<button onclick={() => local++}>edit local</button>
<p>{input}|{snapshot}|{local}|{result}</p>
