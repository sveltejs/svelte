<script>
	import { hoistable_foo, hoistable_bar, hoistable_baz } from '';
	let foo;
	let bar;
	let baz;
</script>

<div in:hoistable_foo/>
<div out:hoistable_bar/>
<div transition:hoistable_baz/>
<div in:foo/>
<div out:bar/>
<div transition:baz/>
