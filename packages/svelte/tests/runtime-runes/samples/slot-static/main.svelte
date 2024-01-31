<script>
	import Child from './Child.svelte';

	let message = 'hello';
</script>

<Child message={message} let:message>
	<p>message: {message}</p>
</Child>
