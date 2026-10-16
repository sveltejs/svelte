<script>
	let count = $state(1);
	let other = $state(0);
	let d = $derived(count * 2);
	let pending = [];

	function wait(value) {
		return new Promise((resolve) => pending.push(() => resolve(value)));
	}
</script>

<button onclick={() => other++}>other</button>
<button
	onclick={() => {
		d = 100;
		count++;
	}}>assign then update</button
>
<button onclick={() => pending.shift()?.()}>resolve</button>

<svelte:boundary>
	<p>{await wait(other)}</p>
	{#snippet pending()}<p>loading</p>{/snippet}
</svelte:boundary>

<p>{d}</p>
