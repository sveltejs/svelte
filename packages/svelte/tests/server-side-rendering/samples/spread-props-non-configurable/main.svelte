<script>
	import Child from './Child.svelte';

	// Module namespace exports have non-configurable data descriptors.
	const data = Object.defineProperty({}, 'value', {
		value: 'original',
		writable: true,
		enumerable: true,
		configurable: false
	});

	const accessor = Object.freeze({
		get value() {
			throw new Error('An overridden getter should not be called');
		}
	});
</script>

<Child {...data} value="explicit data" />
<Child {...data} {...{ value: 'spread data' }} />
<Child {...accessor} value="explicit accessor" />
<Child {...accessor} {...{ value: 'spread accessor' }} />
