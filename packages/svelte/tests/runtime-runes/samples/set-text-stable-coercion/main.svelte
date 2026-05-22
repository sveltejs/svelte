<script>
	class Widget {
		toString() { return "toString" }
		valueOf() { return "valueOf" }
	}

	const value = new Widget();
</script>

<!-- case 1 -->
{value}

<!-- case 2 -->
<p>{value}</p>

<!-- case 3 -->
<p>[{value}]</p>

<!-- case 4 -->
{#if 1}
	{value}
{/if}
