<script>
	import CheckBox from './CheckBox.svelte';

	let checked = $state(false);
	function wrap() {
		return {
			get checked() { return checked },
			set checked(v) { checked = v },
		}
	}
</script>

{#if true}
	{@const obj = wrap()}
	<CheckBox type="checkbox" bind:checked={obj.checked} />
{/if}
<br/>
Checked: {checked}
