'use strict';

var Component = require('./internal/Component-9c4b98a2.js');
var dev = require('./internal/dev-1537023e.js');

/** @returns {void} */
function onMount() {}

/** @returns {void} */
function beforeUpdate() {}

/** @returns {void} */
function afterUpdate() {}

exports.createEventDispatcher = Component.createEventDispatcher;
exports.getAllContexts = Component.getAllContexts;
exports.getContext = Component.getContext;
exports.hasContext = Component.hasContext;
exports.onDestroy = Component.onDestroy;
exports.setContext = Component.setContext;
exports.tick = Component.tick;
exports.SvelteComponent = dev.SvelteComponentDev;
exports.SvelteComponentTyped = dev.SvelteComponentTyped;
exports.afterUpdate = afterUpdate;
exports.beforeUpdate = beforeUpdate;
exports.onMount = onMount;
