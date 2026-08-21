<script>
	let a = $state(0);

	const deferred = [];

	function delay(value) {
		if (!value) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<div>
	{a} {await delay(a)}
	{#if a < 2}
		{await delay(a)}
	{/if}
</div>

<button onclick={() => {a++;}}>a++</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => deferred[2]()}>middle</button>
