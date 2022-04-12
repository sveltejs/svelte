---
title: The style directive
---

Being able to set CSS properties dynamically is nice. However, this can get unwieldy if you have to write a long string. Mistakes like missing any of the semicolons could make the whole string invalid. Therefore, Svelte provides a nicer way to write inline styles with the style directive.

Change the style attribute of the paragraph to the following:

```html
<p 
	style:color 
	style:--opacity="{bgOpacity}"
>
```

The style directive shares a few qualities with the class directive. You can use a shorthand when the name of the property and the variable are the same. So `style:color="{color}"` can be written as just `style:color`.

Similar to the class directive, the style directive will take precedence if you try to set the same property through a style attribute.
