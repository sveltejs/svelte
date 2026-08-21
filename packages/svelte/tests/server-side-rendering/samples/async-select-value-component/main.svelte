<script lang="ts">
	import Option from './Option.svelte';
</script>
<select value={await Promise.resolve('dog')}>
	<Option value="">--Please choose an option--</Option>
	<Option value={await Promise.resolve('dog')}>Dog</Option>
	<Option value="cat">Cat</Option>
</select>