<x foo={'{;}'}></x>

<style>
	[foo='{;}'] {
		content: "{};[]";

		/* [] ; { } */
		color: red;
	}
</style>
