## dynamic_void_element_content

> `<svelte:element this="%tag%">` is a void element — it cannot have content

Elements such as `<input>` cannot have content, any children passed to these elements will be ignored.

## state_snapshot_uncloneable

> Value cannot be cloned with `$state.snapshot` — the original value was returned

> The following properties cannot be cloned with `$state.snapshot` — the return value contains the originals:
>
> %properties%

`$state.snapshot` tries to clone the given value in order to return a reference that no longer changes. Certain objects may not be cloneable, in which case the original value is returned. In the following example, `property` is cloned, but `window` is not, because DOM elements are uncloneable:

```js
const object = $state({ property: 'this is cloneable', window })
const snapshot = $state.snapshot(object);
```

## svelte_html_duplicate_attribute

> Duplicate attribute '%name%' across multiple `<svelte:html>` blocks, the latest value will be used.

This warning appears when you have multiple `<svelte:html>` blocks across several files, and they set the same attribute. In that case, the latest value wins. On the server and on the client for static attributes, that's the last occurence of the attribute. On the client for dynamic attributes that's the value which was updated last across all `<svelte:html>` blocks.
