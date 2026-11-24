<p class="used other" title="*/">red</p>

<style>
	.unused[title="*/"], .used { color: red; }
	.used, .unused[title='*/'], .other { color: red; }
	.used, .unused[title="*/"], .unused[title="**/"] { color: red; }
	.unused[title="*/"] { content: "*/ */"; /* comment */ }
	.unused[title="*/"] { /* empty */ }
	.unused[title="\*/"] { content: "*/"; }
	.used:is(.unused[title="*/"], .used) { color: red; }
	.unused[title="*/"] /* comment */ , .used { color: red; }
	.used[title="*/"] { content: "*/"; }
	:global /* comment */ { .global { color: red; } }
</style>
