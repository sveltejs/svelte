<script>
	import Nested from './irrelevant';
	import Inner from './irrelevant';
</script>

<Nested>
	<p slot="foo">{value}</p>
	<Inner slot="foo">{value}</Inner>
</Nested>
