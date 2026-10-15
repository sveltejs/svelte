<script>
	let array = $state([1, 2, 3]);

	const original = [1, 2, 3];
	original.splice = Array.prototype.splice;
	let owned = $state(original);

	$inspect(array).with((type, value) => console.log(type, value));
	$inspect(owned).with((type, value) => console.log(type, value));

	$effect(() => {
		void Object.hasOwn(array, 'splice');
	});
</script>

<button onclick={() => array.splice(0, 2)}>splice</button>
<button
	onclick={() => {
		delete owned.splice;
		owned.splice(0, 2);
	}}>delete and splice</button
>
