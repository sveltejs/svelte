<script>
	export let values = {
		inner: []
	};
</script>

<input type='checkbox' value='first' bind:group={values.inner} />
<input type='checkbox' value='second' bind:group={values.inner} />
<input type='checkbox' value='third' bind:group={values.inner} />

<div>
	{#each ['first', 'second', 'third'] as k}
		<span>{k}</span>
	{/each}
</div>
