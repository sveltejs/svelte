<script>
	import Nested from './irrelevant';
</script>

<!-- allowed in custom elements -->
<c-e>
    <c-e-item slot="allowed"></c-e-item>
    <c-e-item slot="allowed"></c-e-item>
</c-e>

<Nested>
	<p slot="foo">{value}</p>
	<p slot="foo">{value}</p>
</Nested>