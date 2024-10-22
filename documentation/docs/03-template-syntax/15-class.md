---
title: class:
---

The `class:` directive is a convenient way to conditionally set classes on elements, as an alternative to using conditional expressions inside `class` attributes:

```svelte
<!-- These are equivalent -->
<div class={isCool ? 'cool' : ''}>...</div>
<div class:cool={isCool}>...</div>
```

As with other directives, we can use a shorthand when the name of the class coincides with the value:

```svelte
<div class:cool>...</div>
```

Multiple `class:` directives can be added to a single element:

```svelte
<div class:cool class:lame={!cool} class:potato>...</div>
```
