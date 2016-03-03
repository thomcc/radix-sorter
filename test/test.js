var assert = require('chai').assert;
var RadixSorter = require('../radix-sorter');




function sortingCheck(items, result, original) {
	assert.equal(items.length, result.length, "Wrong length for results");
	assert.equal(items.length, original.length, "Mutated array length");

	var seenIndices = new Uint8Array(result.length)
	for (var i = 0; i < result.length; ++i) {
		var ci = result[i];
		var cur = items[ci];
		if (i) {
			var prev = items[result[i-1]];
			assert.isTrue(prev <= cur, "Items not in sorted order");
		}
		assert.isFalse(!!seenIndices[ci], "Duplicate index in results");
		seenIndices[ci] = 1;
	}

	for (var i = 0; i < seenIndices.length; ++i) {
		assert.isTrue(!!seenIndices[i], "Missing index in results");
	}

	for (var i = 0; i < items.length; ++i) {
		assert.equal(items[i], original[i], "Mutated array during sorting and didn't fix it.");
	}
}

function buildTypedArray(Kind, size, generate) {
	var a = [];
	for (var i = 0; i < size; ++i) {
		a.push(generate());
	}
	return new Kind(a);
}

var testInfo = [
	{name: 'Uint8Array', type: Uint8Array, rand: function() { return Math.floor(Math.random() * 0xff); }},
	{name: 'Uint16Array', type: Uint16Array, rand: function() { return Math.floor(Math.random() * 0xffff); }},
	{name: 'Uint32Array', type: Uint32Array, rand: function() { return Math.floor(Math.random() * 0xffffffff); }},

	{name: 'Int8Array', type: Int8Array, rand: function() { return Math.floor(Math.random() * 0xff) - 0x7f; }},
	{name: 'Int16Array', type: Int16Array, rand: function() { return Math.floor(Math.random() * 0xffff) - 0x7fff; }},
	{name: 'Int32Array', type: Int32Array, rand: function() { return Math.floor(Math.random() * 0xffffffff) - 0x7fffffff; }},

	{name: 'Float32Array', type: Float32Array, rand: function() { return (Math.random()-0.5)*1000; }}
];

suite('RadixSorter', function() {
	suite('small arrays (insertion sort)', function() {
		testInfo.forEach(function(t) {
			test(t.name, function() {
				r = new RadixSorter();
				var arr = buildTypedArray(t.type, 31, t.rand);
				var copy = new t.type(arr);
				var results = r.sort(arr);
				sortingCheck(arr, results, copy);
			});
		});
	});


	suite('big arrays (radix sort)', function() {
		testInfo.forEach(function(t) {
			test(t.name, function() {
				r = new RadixSorter();
				var arr = buildTypedArray(t.type, 2048, t.rand);
				var copy = new t.type(arr);
				var results = r.sort(arr, true);
				sortingCheck(arr, results, copy);
			});
		});
	});


	suite('unsupported types still work', function() {
		test('Float64Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Float64Array, 128, function() { return (Math.random()-0.5)*1000; })
			var copy = new Float64Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});
	});



});


