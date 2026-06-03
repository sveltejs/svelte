<script>
	let primitive = 'foo';
	let object = {};

	let array = $state([primitive, object]);
</script>

<button onclick={() => array.includes(primitive)}>array.includes(primitive)</button>
<button onclick={() => array.includes(object)}>array.includes(object)</button>

<hr />

<button onclick={() => array.indexOf(primitive)}>array.indexOf(primitive)</button>
<button onclick={() => array.indexOf(object)}>array.indexOf(object)</button>

<hr />

<button onclick={() => array.lastIndexOf(primitive)}>array.lastIndexOf(primitive)</button>
<button onclick={() => array.lastIndexOf(object)}>array.lastIndexOf(object)</button>

<hr />

<button onclick={() => (array.length = 0)}>clear</button>
