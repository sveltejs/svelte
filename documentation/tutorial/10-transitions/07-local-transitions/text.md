---
title: Local transitions
---

Ordinarily, transitions will play on elements when any container block is added or destroyed. In the example here, toggling the visibility of the entire list also applies transitions to individual list elements.

Instead, we'd like transitions to play only when individual items are added and removed — in other words, when the user drags the slider.

We can achieve this with a _local_ transition, which only plays when the block with the transition itself is added or removed:

```svelte
<div transition:slide|local>
	{item}
</div>
```
