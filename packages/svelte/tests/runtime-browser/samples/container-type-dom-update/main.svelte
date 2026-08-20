<script>
	let toggled = $state(true);
</script>

<fieldset>
	<input type="checkbox" bind:checked={toggled} />
	<div class="container">
		<table>
			<thead><tr><th>A</th></tr></thead>
			<tbody><tr>{#if !toggled}<td>one</td>{/if}</tr></tbody>
		</table>
	</div>
	{#if toggled}<div></div>{/if}
</fieldset>

<div data-comments><!--before-1--><!--before-2-->{#if toggled}<span>removed</span>{/if}<!--after-1--><!--after-2--></div>
<div data-sibling><i>keep</i>{#if toggled}<span>removed</span>{/if}<!--after--></div>

<style>
	.container {
		container-type: inline-size;
	}
</style>
