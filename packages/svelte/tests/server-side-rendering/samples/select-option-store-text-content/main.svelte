<script>
	import { readable } from 'svelte/store';

	const t = readable((/** @type {string} */ key) => key);

	let value = $state('');
</script>

<select bind:value>
	<option disabled value="">{$t('placeholder')}</option>
	<option value="a">A</option>
	<option value="b">B</option>
</select>
