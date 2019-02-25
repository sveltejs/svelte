---
title: Basics
---

Welcome to the Svelte tutorial. This will teach you everything you need to know to build fast, small web applications easily.

You can also consult the [API docs](docs) and the [examples](examples), or — if you're impatient to start hacking on your machine locally — the [60-second quickstart](blog/the-easiest-way-to-get-started).


## What is Svelte?

Svelte is a tool for building fast web applications.

It is similar to JavaScript frameworks such as React and Vue, which share a goal of making it easy to build slick interactive user interfaces.

But there's a crucial difference: Svelte converts your app into ideal JavaScript at *build time*, rather than interpreting your application code at *run time*. This means you don't pay the performance cost of the framework's abstractions, and you don't incur a penalty when your app first loads.

You can build your entire app with Svelte, or you can add it incrementally to an existing codebase. You can also ship components as standalone packages that work anywhere, without the overhead of a dependency on a conventional framework.


## How to use this tutorial

TKTK is this necessary?

You'll need to have basic familiarity with HTML, CSS and JavaScript to understand Svelte. Later on we'll be using Node.js and the command line, but don't worry if that's new territory for you — you won't be thrown in at the deep end.


## Understanding components

In Svelte, an application is composed from one or more *components*. A component is a reusable self-contained block of code that encapsulates HTML, CSS and JavaScript that belong together, written into a `.svelte` file. The 'hello world' example on the right is a simple component.