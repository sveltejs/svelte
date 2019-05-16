<script>
	import Converter from './Converter.svelte';

	let value = 'Every word in this input gets converted into symbol on hover';
</script>

<style>
	input {
		width: 500px;
	}
	section {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 200px;
	}
</style>

<input bind:value placeholder="Write something" />

<h1>Hover us</h1>

<section>
	<Converter symbol="🍕" text={value} />
	<Converter symbol="🙈" text={value} />
	<Converter symbol="🥔" text={value} />
</section>
