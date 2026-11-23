<script lang="ts">
	let n = $state(0);
	let show = $state(true);
	let resolve: () => void;
	let reject: () => void;

	function load(i: number) {
		return new Promise<{ i: number }>((yes, no) => {
			resolve = () => yes({ i });
			reject = () => no({ i });
		});
	}
</script>

<button onclick={() => n++}>next</button>
<button onclick={() => resolve()}>resolve</button>
<button onclick={() => reject()}>reject</button>
<button onclick={() => (show = false)}>hide</button>

<output>
	{#if show}
		{#key n}
			{#await load(n)}
				pending
			{:then value}
				<p>{value.i}</p>
			{:catch error}
				<p>error {error.i}</p>
			{/await}
		{/key}
	{/if}
</output>
