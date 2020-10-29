<script>
	const test = { placeholder: 'Text' };
</script>

<style>
	input:focus + div { color: red; }
	input:focus ~ div { color: red; }
</style>

<input {...test}>
<div>Should be red, when input is focused</div>