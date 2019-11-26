<script>
	import { bar } from './utils.js';
			
	function foo() {
		return 42;
	}
	
	bar(foo);
</script>

<p>You'll be pleased to know the answer is {foo()}.</p>