---
title: $$restProps
---

If you want to pass down props that are not defined with `export`, you can use `$$restProps`:

```html
<input {...$$restProps}/>
```