<style>
    /* test that all these are parsed correctly */
	h1:nth-of-type(2n+1){
        background: red;
    }
    h1:nth-child(-n + 3 of li.important) {
        background: red;
    }
    h1:nth-child(1) {
        background: red;
    }
    h1:nth-child(p) {
        background: red;
    }
    h1:nth-child(n+7) {
        background: red;
    }
    h1:nth-child(even) {
        background: red;
    }
    h1:nth-child(odd) {
        background: red;
    }
    h1:nth-child(
        n
    ) {
        background: red;
    }
    h1:global(nav) {
        background: red;
    }
</style>

<h1>Foo</h1>
