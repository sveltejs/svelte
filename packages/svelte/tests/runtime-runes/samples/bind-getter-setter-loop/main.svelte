<script>
	let arr = $state([1, 2, 3, 4, 5]);
	let elements = $state([]);
</script>

<button onclick={() => arr = [5, 1, 4, 2, 3]}>Shuffle</button><br>
{#each arr as item, i (item)}
	<b bind:this={() => elements[i], (v) => elements[i] = v }>{item}</b>
{/each}
<br>
{#each elements as elem}
	{elem.textContent}
{/each}