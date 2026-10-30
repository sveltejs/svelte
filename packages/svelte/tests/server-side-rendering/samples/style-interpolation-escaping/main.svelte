<script>
	export let special;
	export let value;
	export let empty = null;
	export let missing;
	export let blank = '';
	export let color = 'red';
</script>

<div data-case="escaped" style="--static: &quot;&amp;&lt;; --dynamic: {special};"></div>
<div data-case="default-coercion" style="--value: {value};"></div>
<div data-case="nullish" style="--null: {empty}; --undefined: {missing};"></div>
<div data-case="raw-template" style={`--null: ${empty}; --object: ${value};`}></div>
<div data-case="empty" style="{blank}{missing}"></div>
<div data-case="direct-null" style={empty}></div>
<div data-case="directives" style="color: {color};" style:color="blue"></div>
