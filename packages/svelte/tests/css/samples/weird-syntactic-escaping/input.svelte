<div title={'{;}'}>
	<foo/>
</div>

<style>
[title='{;}'] {
	content: "{};[]";
	/* {} */
	color: red;
	foo {
		color: red;
		/* [] ; { } */
		color: green;
		/* [] { } ; */
		color: black;
	}
	color: red;
}
</style>
