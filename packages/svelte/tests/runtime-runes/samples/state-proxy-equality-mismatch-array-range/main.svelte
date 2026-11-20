<script>
	export const object = {};

	// `array[1]` is a proxy of `object`
	export const array = $state([1, object, 2]);
</script>
