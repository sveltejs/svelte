export function appendNode(node, target) {
	target.appendChild(node);
}

export function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

export function detachNode(node) {
	node.parentNode.removeChild(node);
}

export function detachBetween(before, after) {
	while (before.nextSibling && before.nextSibling !== after) {
		before.parentNode.removeChild(before.nextSibling);
	}
}

export function detachBefore(after) {
	while (after.previousSibling) {
		after.parentNode.removeChild(after.previousSibling);
	}
}

export function detachAfter(before) {
	while (before.nextSibling) {
		before.parentNode.removeChild(before.nextSibling);
	}
}

export function reinsertBetween(before, after, target) {
	while (before.nextSibling && before.nextSibling !== after) {
		target.appendChild(before.parentNode.removeChild(before.nextSibling));
	}
}

export function reinsertChildren(parent, target) {
	while (parent.firstChild) target.appendChild(parent.firstChild);
}

export function reinsertAfter(before, target) {
	while (before.nextSibling) target.appendChild(before.nextSibling);
}

export function reinsertBefore(after, target) {
	var parent = after.parentNode;
	while (parent.firstChild !== after) target.appendChild(parent.firstChild);
}

export function destroyEach(iterations) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].destroy();
	}
}

export function createFragment() {
	return document.createDocumentFragment();
}

export function createElement(name) {
	return document.createElement(name);
}

export function createSvgElement(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

export function createText(data) {
	return document.createTextNode(data);
}

export function createComment() {
	return document.createComment('');
}

export function addListener(node, event, handler) {
	node.addEventListener(event, handler, false);
}

export function removeListener(node, event, handler) {
	node.removeEventListener(event, handler, false);
}

export function setAttribute(node, attribute, value) {
	node.setAttribute(attribute, value);
}

export function setXlinkAttribute(node, attribute, value) {
	node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
}

export function getBindingGroupValue(group) {
	var value = [];
	for (var i = 0; i < group.length; i += 1) {
		if (group[i].checked) value.push(group[i].__value);
	}
	return value;
}

export function toNumber(value) {
	return value === '' ? undefined : +value;
}

export function timeRangesToArray(ranges) {
	var array = [];
	for (var i = 0; i < ranges.length; i += 1) {
		array.push({ start: ranges.start(i), end: ranges.end(i) });
	}
	return array;
}

export function children (element) {
	return Array.from(element.childNodes);
}

export function claimElement (nodes, name, attributes, svg) {
	for (var i = 0; i < nodes.length; i += 1) {
		var node = nodes[i];
		if (node.nodeName === name) {
			for (var j = 0; j < node.attributes.length; j += 1) {
				var attribute = node.attributes[j];
				if (!attributes[attribute.name]) node.removeAttribute(attribute.name);
			}
			return nodes.splice(i, 1)[0]; // TODO strip unwanted attributes
		}
	}

	return svg ? createSvgElement(name) : createElement(name);
}

export function claimText (nodes, data) {
	for (var i = 0; i < nodes.length; i += 1) {
		var node = nodes[i];
		if (node.nodeType === 3) {
			node.data = data;
			return nodes.splice(i, 1)[0];
		}
	}

	return createText(data);
}

export function setInputType(input, type) {
	try {
		input.type = type;
	} catch (e) {}
}

export function setStyle(node, key, value) {
	node.style.setProperty(key, value);
}