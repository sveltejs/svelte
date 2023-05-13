<script>
	let content = ["a ", "b ", "c "];
</script>

<div>before</div>
<br>

{#each content as c}
    {@html c}
{/each}
<div>after</div>
