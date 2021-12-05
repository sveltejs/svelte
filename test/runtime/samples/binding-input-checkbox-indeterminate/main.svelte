<script>
	export let checked;
	export let indeterminate;
</script>

<input type='checkbox' bind:checked bind:indeterminate>
<p>checked? {checked}</p>
<p>indeterminate? {indeterminate}</p>