<script>
	import { obj } from './data.js';

	$: prop = obj.prop;
	obj.foo = 'a different prop';
</script>

<p>{prop}</p>
