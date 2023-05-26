<script>
	export let list = [
		{ name: "a", text: "This is a test." },
		{ name: "b", text: "This is another test." },
		{ name: "c", text: "This is also a test." },
	];
	export let current = "a";
	export function moveUp(i) {
		list = [
			...list.slice(0, Math.max(i - 1, 0)),
			list[i],
			list[i - 1],
			...list.slice(i + 1),
		];
	}
	export function moveDown(i) {
		moveUp(i + 1);
	}
</script>

{#each list as item}
	<div class="item">
		{item.name}
		{#if true}
			<label
				><input
					type="radio"
					name="current"
					bind:group={current}
					value={item.name}
				/> current</label
			>
		{/if}
	</div>
{/each}

