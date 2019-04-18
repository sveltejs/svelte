---
title: "Svelte 3: Rethinking Reactivity"
description: It's finally here
pubdate: 2019-04-18
author: Rich Harris
authorURL: https://twitter.com/Rich_Harris
---

After several months of being just days away, we are over the moon to announce the stable release of Svelte 3. This is a huge release representing hundreds of hours of work by many people in the Svelte community, including invaluable feedback from beta testers who have helped shape the design every step of the way.

We think you're going to love it.


## What is Svelte?

Svelte is a component framework — like React or Vue — but with an important difference. Traditional frameworks allow you to write declarative state-driven code, but there's a penalty: the browser must do extra work to convert that into DOM operations, using techniques like [virtual DOM diffing](blog/virtual-dom-is-pure-overhead) that eat into your frame budget and tax the garbage collector.

Instead, Svelte runs at *build time*, converting your declarative code into highly efficient imperative code that surgically updates the DOM. As a result, you're able to write ambitious applications with excellent performance characteristics.

