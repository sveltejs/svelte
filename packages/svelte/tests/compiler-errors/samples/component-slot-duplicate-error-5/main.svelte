<script>
	import Nested from './irrelevant';
	import Inner from './irrelevant';
</script>

<Nested>
	<Inner slot="foo">{value}</Inner>
	<Inner slot="foo">{value}</Inner>
</Nested>
