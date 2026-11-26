<script>
	let form_attributes = $state({ id: 'initial-form' });
	let class_name = $state('first');
	let background_color = $state('rgb(255, 0, 0)');

	function update() {
		form_attributes = { id: 'updated-form' };
		class_name = 'second';
		background_color = 'rgb(0, 0, 255)';
	}
</script>

<button onclick={update}>update</button>

<form {...form_attributes} class={class_name} style:background-color={background_color}>
	<!-- the once non-symbol-ified hidden properties we used -->
	<input {...{ name: '__className' }} value="x" />
	<input {...{ name: '__style' }} value="y" />
	<input {...{ name: '__attributes' }} value="z" />
</form>
