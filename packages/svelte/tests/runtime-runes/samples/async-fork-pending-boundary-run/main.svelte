<script>
	import { fork } from 'svelte';

	let a = $state(0);
	let show = $state(false);

	let deferreds = [];
	let f;

	function push(v) {
		const d = Promise.withResolvers();
		deferreds.push({ v, d });
		return d.promise;
	}

	function shift() {
		const { v, d } = deferreds.shift();
		d.resolve(v);
	}
</script>

<button onclick={() => (show = true)}>show</button>
<button onclick={() => (f = fork(() => a++))}>fork</button>
<button onclick={shift}>shift</button>
<button onclick={() => f.commit()}>commit</button>

{#if show}
	<svelte:boundary>
		<p>{await push(a)}</p>

		{#snippet pending()}
			<p>loading</p>
		{/snippet}
	</svelte:boundary>
{/if}
