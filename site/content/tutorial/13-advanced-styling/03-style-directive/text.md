---
title: The style directive
---

Being able to set css properties dynamically is nice, however this can get unwieldly if you have to write a long string, and mistakes like missing any of the semicolons could make the whole string invalid. Therefore, Svelte provides a nicer way to write inline styles with the style directive.

Change the style attribute of the paragraph to the following:

```html
<p 
	style:color 
	style:--opacity="{bgOpacity}"
>
```

Style directives share a few qualities with class directives. You can use a shorthand when the name of the property and the variable are the same. So `style:color="{color}"` can be written as just `style:color`. And just like class directives, the directives will take precedence if you set the same property through a style attribute.
