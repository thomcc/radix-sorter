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


suite('RadixSorter', function() {
	suite('small arrays (insertion sort)', function() {
		test('Uint8Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Uint8Array, 31, function() { return Math.floor(Math.random()*0xff); })
			var copy = new Uint8Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});

		test('Uint16Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Uint16Array, 31, function() { return Math.floor(Math.random()*0xffff); })
			var copy = new Uint16Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});

		test('Uint32Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Uint32Array, 31, function() { return Math.floor(Math.random()*0xffffffff); })
			var copy = new Uint32Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});

		test('Float32Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Float32Array, 31, function() { return (Math.random()-0.5)*1000; })
			var copy = new Float32Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});
	});


	suite('big arrays (radix sort)', function() {
		test('Uint8Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Uint8Array, 2048, function() { return Math.floor(Math.random()*0xff); })
			var copy = new Uint8Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});

		test('Uint16Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Uint16Array, 2048, function() { return Math.floor(Math.random()*0xffff); })
			var copy = new Uint16Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});

		test('Uint32Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Uint32Array, 2048, function() { return Math.floor(Math.random()*0xffffffff); })
			var copy = new Uint32Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});

		test('Float32Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Float32Array, 2048, function() { return (Math.random()-0.5)*1000; })
			var copy = new Float32Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});
	});


	suite('unsupported types still work', function() {
		test('Int8Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Int8Array, 128, function() { return Math.floor(Math.random()*0xff); })
			var copy = new Int8Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});

		test('Int16Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Int16Array, 128, function() { return Math.floor(Math.random()*0xffff); })
			var copy = new Int16Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});

		test('Int32Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Int32Array, 128, function() { return Math.floor(Math.random()*0xffffffff); })
			var copy = new Int32Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});

		test('Float64Array', function() {
			var r = new RadixSorter();
			var arr = buildTypedArray(Float64Array, 128, function() { return (Math.random()-0.5)*1000; })
			var copy = new Float64Array(arr);
			var results = r.sort(arr);
			sortingCheck(arr, results, copy);
		});
	});



});


