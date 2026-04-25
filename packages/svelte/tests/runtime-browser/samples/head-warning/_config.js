import { test } from '../../assert';

export default test({
    warnings: [{
        code: "head_in_component",
        message: "A `<head>` tag was detected in file `(unknown)`, component `_unknown_`, at line 1. This can lead to runtime errors. Did you mean to use `<svelte:head>`?\nhttps://svelte.dev/e/head_in_component",
        start: {
            line: 1,
            character: 0,
            column: 0
        },
        end: {
            line: 3,
            character: 73,
            column: 7
        }
    }]
});
