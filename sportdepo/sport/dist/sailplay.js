(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var ES = require('es-abstract/es6');

module.exports = function find(predicate) {
	var list = ES.ToObject(this);
	var length = ES.ToInteger(ES.ToLength(list.length));
	if (!ES.IsCallable(predicate)) {
		throw new TypeError('Array#find: predicate must be a function');
	}
	if (length === 0) {
		return undefined;
	}
	var thisArg = arguments[1];
	for (var i = 0, value; i < length; i++) {
		value = list[i];
		if (ES.Call(predicate, thisArg, [value, i, list])) {
			return value;
		}
	}
	return undefined;
};

},{"es-abstract/es6":8}],2:[function(require,module,exports){
'use strict';

var define = require('define-properties');
var ES = require('es-abstract/es6');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

var slice = Array.prototype.slice;

var polyfill = getPolyfill();

var boundFindShim = function find(array, predicate) { // eslint-disable-line no-unused-vars
	ES.RequireObjectCoercible(array);
	var args = slice.call(arguments, 1);
	return polyfill.apply(array, args);
};

define(boundFindShim, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = boundFindShim;

},{"./implementation":1,"./polyfill":3,"./shim":4,"define-properties":6,"es-abstract/es6":8}],3:[function(require,module,exports){
'use strict';

module.exports = function getPolyfill() {
	// Detect if an implementation exists
	// Detect early implementations which skipped holes in sparse arrays
  // eslint-disable-next-line no-sparse-arrays
	var implemented = Array.prototype.find && [, 1].find(function () {
		return true;
	}) !== 1;

  // eslint-disable-next-line global-require
	return implemented ? Array.prototype.find : require('./implementation');
};

},{"./implementation":1}],4:[function(require,module,exports){
'use strict';

var define = require('define-properties');
var getPolyfill = require('./polyfill');

module.exports = function shimArrayPrototypeFind() {
	var polyfill = getPolyfill();

	define(Array.prototype, { find: polyfill }, {
		find: function () {
			return Array.prototype.find !== polyfill;
		}
	});

	return polyfill;
};

},{"./polyfill":3,"define-properties":6}],5:[function(require,module,exports){
module.exports = function (css, customDocument) {
  var doc = customDocument || document;
  if (doc.createStyleSheet) {
    var sheet = doc.createStyleSheet()
    sheet.cssText = css;
    return sheet.ownerNode;
  } else {
    var head = doc.getElementsByTagName('head')[0],
        style = doc.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(doc.createTextNode(css));
    }

    head.appendChild(style);
    return style;
  }
};

module.exports.byUrl = function(url) {
  if (document.createStyleSheet) {
    return document.createStyleSheet(url).ownerNode;
  } else {
    var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = url;

    head.appendChild(link);
    return link;
  }
};

},{}],6:[function(require,module,exports){
'use strict';

var keys = require('object-keys');
var foreach = require('foreach');
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

var toStr = Object.prototype.toString;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
	var obj = {};
	try {
		Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        /* eslint-disable no-unused-vars, no-restricted-syntax */
        for (var _ in obj) { return false; }
        /* eslint-enable no-unused-vars, no-restricted-syntax */
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported();

var defineProperty = function (object, name, value, predicate) {
	if (name in object && (!isFunction(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		Object.defineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value;
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = props.concat(Object.getOwnPropertySymbols(map));
	}
	foreach(props, function (name) {
		defineProperty(object, name, map[name], predicates[name]);
	});
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;

},{"foreach":18,"object-keys":30}],7:[function(require,module,exports){
'use strict';

var $isNaN = require('./helpers/isNaN');
var $isFinite = require('./helpers/isFinite');

var sign = require('./helpers/sign');
var mod = require('./helpers/mod');

var IsCallable = require('is-callable');
var toPrimitive = require('es-to-primitive/es5');

// https://es5.github.io/#x9
var ES5 = {
	ToPrimitive: toPrimitive,

	ToBoolean: function ToBoolean(value) {
		return Boolean(value);
	},
	ToNumber: function ToNumber(value) {
		return Number(value);
	},
	ToInteger: function ToInteger(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number)) { return 0; }
		if (number === 0 || !$isFinite(number)) { return number; }
		return sign(number) * Math.floor(Math.abs(number));
	},
	ToInt32: function ToInt32(x) {
		return this.ToNumber(x) >> 0;
	},
	ToUint32: function ToUint32(x) {
		return this.ToNumber(x) >>> 0;
	},
	ToUint16: function ToUint16(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x10000);
	},
	ToString: function ToString(value) {
		return String(value);
	},
	ToObject: function ToObject(value) {
		this.CheckObjectCoercible(value);
		return Object(value);
	},
	CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
		/* jshint eqnull:true */
		if (value == null) {
			throw new TypeError(optMessage || 'Cannot call method on ' + value);
		}
		return value;
	},
	IsCallable: IsCallable,
	SameValue: function SameValue(x, y) {
		if (x === y) { // 0 === -0, but they are not identical.
			if (x === 0) { return 1 / x === 1 / y; }
			return true;
		}
		return $isNaN(x) && $isNaN(y);
	},

	// http://www.ecma-international.org/ecma-262/5.1/#sec-8
	Type: function Type(x) {
		if (x === null) {
			return 'Null';
		}
		if (typeof x === 'undefined') {
			return 'Undefined';
		}
		if (typeof x === 'function' || typeof x === 'object') {
			return 'Object';
		}
		if (typeof x === 'number') {
			return 'Number';
		}
		if (typeof x === 'boolean') {
			return 'Boolean';
		}
		if (typeof x === 'string') {
			return 'String';
		}
	}
};

module.exports = ES5;

},{"./helpers/isFinite":10,"./helpers/isNaN":11,"./helpers/mod":13,"./helpers/sign":14,"es-to-primitive/es5":15,"is-callable":22}],8:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';
var symbolToStr = hasSymbols ? Symbol.prototype.toString : toStr;

var $isNaN = require('./helpers/isNaN');
var $isFinite = require('./helpers/isFinite');
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

var assign = require('./helpers/assign');
var sign = require('./helpers/sign');
var mod = require('./helpers/mod');
var isPrimitive = require('./helpers/isPrimitive');
var toPrimitive = require('es-to-primitive/es6');
var parseInteger = parseInt;
var bind = require('function-bind');
var strSlice = bind.call(Function.call, String.prototype.slice);
var isBinary = bind.call(Function.call, RegExp.prototype.test, /^0b[01]+$/i);
var isOctal = bind.call(Function.call, RegExp.prototype.test, /^0o[0-7]+$/i);
var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
var nonWSregex = new RegExp('[' + nonWS + ']', 'g');
var hasNonWS = bind.call(Function.call, RegExp.prototype.test, nonWSregex);
var invalidHexLiteral = /^[-+]0x[0-9a-f]+$/i;
var isInvalidHexLiteral = bind.call(Function.call, RegExp.prototype.test, invalidHexLiteral);

// whitespace from: http://es5.github.io/#x15.5.4.20
// implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324
var ws = [
	'\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003',
	'\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028',
	'\u2029\uFEFF'
].join('');
var trimRegex = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
var replace = bind.call(Function.call, String.prototype.replace);
var trim = function (value) {
	return replace(value, trimRegex, '');
};

var ES5 = require('./es5');

var hasRegExpMatcher = require('is-regex');

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-abstract-operations
var ES6 = assign(assign({}, ES5), {

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-call-f-v-args
	Call: function Call(F, V) {
		var args = arguments.length > 2 ? arguments[2] : [];
		if (!this.IsCallable(F)) {
			throw new TypeError(F + ' is not a function');
		}
		return F.apply(V, args);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toprimitive
	ToPrimitive: toPrimitive,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toboolean
	// ToBoolean: ES5.ToBoolean,

	// http://www.ecma-international.org/ecma-262/6.0/#sec-tonumber
	ToNumber: function ToNumber(argument) {
		var value = isPrimitive(argument) ? argument : toPrimitive(argument, 'number');
		if (typeof value === 'symbol') {
			throw new TypeError('Cannot convert a Symbol value to a number');
		}
		if (typeof value === 'string') {
			if (isBinary(value)) {
				return this.ToNumber(parseInteger(strSlice(value, 2), 2));
			} else if (isOctal(value)) {
				return this.ToNumber(parseInteger(strSlice(value, 2), 8));
			} else if (hasNonWS(value) || isInvalidHexLiteral(value)) {
				return NaN;
			} else {
				var trimmed = trim(value);
				if (trimmed !== value) {
					return this.ToNumber(trimmed);
				}
			}
		}
		return Number(value);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
	// ToInteger: ES5.ToNumber,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint32
	// ToInt32: ES5.ToInt32,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint32
	// ToUint32: ES5.ToUint32,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint16
	ToInt16: function ToInt16(argument) {
		var int16bit = this.ToUint16(argument);
		return int16bit >= 0x8000 ? int16bit - 0x10000 : int16bit;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint16
	// ToUint16: ES5.ToUint16,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint8
	ToInt8: function ToInt8(argument) {
		var int8bit = this.ToUint8(argument);
		return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8
	ToUint8: function ToUint8(argument) {
		var number = this.ToNumber(argument);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x100);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8clamp
	ToUint8Clamp: function ToUint8Clamp(argument) {
		var number = this.ToNumber(argument);
		if ($isNaN(number) || number <= 0) { return 0; }
		if (number >= 0xFF) { return 0xFF; }
		var f = Math.floor(argument);
		if (f + 0.5 < number) { return f + 1; }
		if (number < f + 0.5) { return f; }
		if (f % 2 !== 0) { return f + 1; }
		return f;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tostring
	ToString: function ToString(argument) {
		if (typeof argument === 'symbol') {
			throw new TypeError('Cannot convert a Symbol value to a string');
		}
		return String(argument);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toobject
	ToObject: function ToObject(value) {
		this.RequireObjectCoercible(value);
		return Object(value);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-topropertykey
	ToPropertyKey: function ToPropertyKey(argument) {
		var key = this.ToPrimitive(argument, String);
		return typeof key === 'symbol' ? symbolToStr.call(key) : this.ToString(key);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	ToLength: function ToLength(argument) {
		var len = this.ToInteger(argument);
		if (len <= 0) { return 0; } // includes converting -0 to +0
		if (len > MAX_SAFE_INTEGER) { return MAX_SAFE_INTEGER; }
		return len;
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-canonicalnumericindexstring
	CanonicalNumericIndexString: function CanonicalNumericIndexString(argument) {
		if (toStr.call(argument) !== '[object String]') {
			throw new TypeError('must be a string');
		}
		if (argument === '-0') { return -0; }
		var n = this.ToNumber(argument);
		if (this.SameValue(this.ToString(n), argument)) { return n; }
		return void 0;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-requireobjectcoercible
	RequireObjectCoercible: ES5.CheckObjectCoercible,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isarray
	IsArray: Array.isArray || function IsArray(argument) {
		return toStr.call(argument) === '[object Array]';
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable
	// IsCallable: ES5.IsCallable,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
	IsConstructor: function IsConstructor(argument) {
		return typeof argument === 'function' && !!argument.prototype; // unfortunately there's no way to truly check this without try/catch `new argument`
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isextensible-o
	IsExtensible: function IsExtensible(obj) {
		if (!Object.preventExtensions) { return true; }
		if (isPrimitive(obj)) {
			return false;
		}
		return Object.isExtensible(obj);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isinteger
	IsInteger: function IsInteger(argument) {
		if (typeof argument !== 'number' || $isNaN(argument) || !$isFinite(argument)) {
			return false;
		}
		var abs = Math.abs(argument);
		return Math.floor(abs) === abs;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ispropertykey
	IsPropertyKey: function IsPropertyKey(argument) {
		return typeof argument === 'string' || typeof argument === 'symbol';
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-isregexp
	IsRegExp: function IsRegExp(argument) {
		if (!argument || typeof argument !== 'object') {
			return false;
		}
		if (hasSymbols) {
			var isRegExp = argument[Symbol.match];
			if (typeof isRegExp !== 'undefined') {
				return ES5.ToBoolean(isRegExp);
			}
		}
		return hasRegExpMatcher(argument);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue
	// SameValue: ES5.SameValue,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero
	SameValueZero: function SameValueZero(x, y) {
		return (x === y) || ($isNaN(x) && $isNaN(y));
	},

	/**
	 * 7.3.2 GetV (V, P)
	 * 1. Assert: IsPropertyKey(P) is true.
	 * 2. Let O be ToObject(V).
	 * 3. ReturnIfAbrupt(O).
	 * 4. Return O.[[Get]](P, V).
	 */
	GetV: function GetV(V, P) {
		// 7.3.2.1
		if (!this.IsPropertyKey(P)) {
			throw new TypeError('Assertion failed: IsPropertyKey(P) is not true');
		}

		// 7.3.2.2-3
		var O = this.ToObject(V);

		// 7.3.2.4
		return O[P];
	},

	/**
	 * 7.3.9 - http://www.ecma-international.org/ecma-262/6.0/#sec-getmethod
	 * 1. Assert: IsPropertyKey(P) is true.
	 * 2. Let func be GetV(O, P).
	 * 3. ReturnIfAbrupt(func).
	 * 4. If func is either undefined or null, return undefined.
	 * 5. If IsCallable(func) is false, throw a TypeError exception.
	 * 6. Return func.
	 */
	GetMethod: function GetMethod(O, P) {
		// 7.3.9.1
		if (!this.IsPropertyKey(P)) {
			throw new TypeError('Assertion failed: IsPropertyKey(P) is not true');
		}

		// 7.3.9.2
		var func = this.GetV(O, P);

		// 7.3.9.4
		if (func == null) {
			return undefined;
		}

		// 7.3.9.5
		if (!this.IsCallable(func)) {
			throw new TypeError(P + 'is not a function');
		}

		// 7.3.9.6
		return func;
	},

	/**
	 * 7.3.1 Get (O, P) - http://www.ecma-international.org/ecma-262/6.0/#sec-get-o-p
	 * 1. Assert: Type(O) is Object.
	 * 2. Assert: IsPropertyKey(P) is true.
	 * 3. Return O.[[Get]](P, O).
	 */
	Get: function Get(O, P) {
		// 7.3.1.1
		if (this.Type(O) !== 'Object') {
			throw new TypeError('Assertion failed: Type(O) is not Object');
		}
		// 7.3.1.2
		if (!this.IsPropertyKey(P)) {
			throw new TypeError('Assertion failed: IsPropertyKey(P) is not true');
		}
		// 7.3.1.3
		return O[P];
	},

	Type: function Type(x) {
		if (typeof x === 'symbol') {
			return 'Symbol';
		}
		return ES5.Type(x);
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-speciesconstructor
	SpeciesConstructor: function SpeciesConstructor(O, defaultConstructor) {
		if (this.Type(O) !== 'Object') {
			throw new TypeError('Assertion failed: Type(O) is not Object');
		}
		var C = O.constructor;
		if (typeof C === 'undefined') {
			return defaultConstructor;
		}
		if (this.Type(C) !== 'Object') {
			throw new TypeError('O.constructor is not an Object');
		}
		var S = hasSymbols && Symbol.species ? C[Symbol.species] : undefined;
		if (S == null) {
			return defaultConstructor;
		}
		if (this.IsConstructor(S)) {
			return S;
		}
		throw new TypeError('no constructor found');
	}
});

delete ES6.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible

module.exports = ES6;

},{"./es5":7,"./helpers/assign":9,"./helpers/isFinite":10,"./helpers/isNaN":11,"./helpers/isPrimitive":12,"./helpers/mod":13,"./helpers/sign":14,"es-to-primitive/es6":16,"function-bind":20,"is-regex":24}],9:[function(require,module,exports){
var has = Object.prototype.hasOwnProperty;
module.exports = Object.assign || function assign(target, source) {
	for (var key in source) {
		if (has.call(source, key)) {
			target[key] = source[key];
		}
	}
	return target;
};

},{}],10:[function(require,module,exports){
var $isNaN = Number.isNaN || function (a) { return a !== a; };

module.exports = Number.isFinite || function (x) { return typeof x === 'number' && !$isNaN(x) && x !== Infinity && x !== -Infinity; };

},{}],11:[function(require,module,exports){
module.exports = Number.isNaN || function isNaN(a) {
	return a !== a;
};

},{}],12:[function(require,module,exports){
module.exports = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}],13:[function(require,module,exports){
module.exports = function mod(number, modulo) {
	var remain = number % modulo;
	return Math.floor(remain >= 0 ? remain : remain + modulo);
};

},{}],14:[function(require,module,exports){
module.exports = function sign(number) {
	return number >= 0 ? 1 : -1;
};

},{}],15:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

var isPrimitive = require('./helpers/isPrimitive');

var isCallable = require('is-callable');

// https://es5.github.io/#x8.12
var ES5internalSlots = {
	'[[DefaultValue]]': function (O, hint) {
		var actualHint = hint || (toStr.call(O) === '[object Date]' ? String : Number);

		if (actualHint === String || actualHint === Number) {
			var methods = actualHint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
			var value, i;
			for (i = 0; i < methods.length; ++i) {
				if (isCallable(O[methods[i]])) {
					value = O[methods[i]]();
					if (isPrimitive(value)) {
						return value;
					}
				}
			}
			throw new TypeError('No default value');
		}
		throw new TypeError('invalid [[DefaultValue]] hint supplied');
	}
};

// https://es5.github.io/#x9
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	return ES5internalSlots['[[DefaultValue]]'](input, PreferredType);
};

},{"./helpers/isPrimitive":17,"is-callable":22}],16:[function(require,module,exports){
'use strict';

var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

var isPrimitive = require('./helpers/isPrimitive');
var isCallable = require('is-callable');
var isDate = require('is-date-object');
var isSymbol = require('is-symbol');

var ordinaryToPrimitive = function OrdinaryToPrimitive(O, hint) {
	if (typeof O === 'undefined' || O === null) {
		throw new TypeError('Cannot call method on ' + O);
	}
	if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
		throw new TypeError('hint must be "string" or "number"');
	}
	var methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
	var method, result, i;
	for (i = 0; i < methodNames.length; ++i) {
		method = O[methodNames[i]];
		if (isCallable(method)) {
			result = method.call(O);
			if (isPrimitive(result)) {
				return result;
			}
		}
	}
	throw new TypeError('No default value');
};

var GetMethod = function GetMethod(O, P) {
	var func = O[P];
	if (func !== null && typeof func !== 'undefined') {
		if (!isCallable(func)) {
			throw new TypeError(func + ' returned for property ' + P + ' of object ' + O + ' is not a function');
		}
		return func;
	}
};

// http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	var hint = 'default';
	if (arguments.length > 1) {
		if (PreferredType === String) {
			hint = 'string';
		} else if (PreferredType === Number) {
			hint = 'number';
		}
	}

	var exoticToPrim;
	if (hasSymbols) {
		if (Symbol.toPrimitive) {
			exoticToPrim = GetMethod(input, Symbol.toPrimitive);
		} else if (isSymbol(input)) {
			exoticToPrim = Symbol.prototype.valueOf;
		}
	}
	if (typeof exoticToPrim !== 'undefined') {
		var result = exoticToPrim.call(input, hint);
		if (isPrimitive(result)) {
			return result;
		}
		throw new TypeError('unable to convert exotic object to primitive');
	}
	if (hint === 'default' && (isDate(input) || isSymbol(input))) {
		hint = 'string';
	}
	return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
};

},{"./helpers/isPrimitive":17,"is-callable":22,"is-date-object":23,"is-symbol":25}],17:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],18:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],19:[function(require,module,exports){
var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],20:[function(require,module,exports){
var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":19}],21:[function(require,module,exports){
var bind = require('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

},{"function-bind":20}],22:[function(require,module,exports){
'use strict';

var fnToStr = Function.prototype.toString;

var constructorRegex = /^\s*class /;
var isES6ClassFn = function isES6ClassFn(value) {
	try {
		var fnStr = fnToStr.call(value);
		var singleStripped = fnStr.replace(/\/\/.*\n/g, '');
		var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, '');
		var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' ');
		return constructorRegex.test(spaceStripped);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionObject(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isCallable(value) {
	if (!value) { return false; }
	if (typeof value !== 'function' && typeof value !== 'object') { return false; }
	if (hasToStringTag) { return tryFunctionObject(value); }
	if (isES6ClassFn(value)) { return false; }
	var strClass = toStr.call(value);
	return strClass === fnClass || strClass === genClass;
};

},{}],23:[function(require,module,exports){
'use strict';

var getDay = Date.prototype.getDay;
var tryDateObject = function tryDateObject(value) {
	try {
		getDay.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

var toStr = Object.prototype.toString;
var dateClass = '[object Date]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) { return false; }
	return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
};

},{}],24:[function(require,module,exports){
'use strict';

var has = require('has');
var regexExec = RegExp.prototype.exec;
var gOPD = Object.getOwnPropertyDescriptor;

var tryRegexExecCall = function tryRegexExec(value) {
	try {
		var lastIndex = value.lastIndex;
		value.lastIndex = 0;

		regexExec.call(value);
		return true;
	} catch (e) {
		return false;
	} finally {
		value.lastIndex = lastIndex;
	}
};
var toStr = Object.prototype.toString;
var regexClass = '[object RegExp]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isRegex(value) {
	if (!value || typeof value !== 'object') {
		return false;
	}
	if (!hasToStringTag) {
		return toStr.call(value) === regexClass;
	}

	var descriptor = gOPD(value, 'lastIndex');
	var hasLastIndexDataProperty = descriptor && has(descriptor, 'value');
	if (!hasLastIndexDataProperty) {
		return false;
	}

	return tryRegexExecCall(value);
};

},{"has":21}],25:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

if (hasSymbols) {
	var symToStr = Symbol.prototype.toString;
	var symStringRegex = /^Symbol\(.*\)$/;
	var isSymbolObject = function isSymbolObject(value) {
		if (typeof value.valueOf() !== 'symbol') { return false; }
		return symStringRegex.test(symToStr.call(value));
	};
	module.exports = function isSymbol(value) {
		if (typeof value === 'symbol') { return true; }
		if (toStr.call(value) !== '[object Symbol]') { return false; }
		try {
			return isSymbolObject(value);
		} catch (e) {
			return false;
		}
	};
} else {
	module.exports = function isSymbol(value) {
		// this environment does not support Symbols.
		return false;
	};
}

},{}],26:[function(require,module,exports){
/*!
 * Knockout Mapping plugin v2.6.0
 * (c) 2013 Steven Sanderson, Roy Jacobs - http://knockoutjs.com/
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
(function(factory) {
    'use strict';

    /*jshint sub:true,curly:false*/
    /*global ko,require,exports,define,module*/

    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // CommonJS or Node: hard-coded dependency on "knockout"
        factory(require("knockout"), exports);
    }
    else if (typeof define === "function" && define["amd"]) {
        // AMD anonymous module with hard-coded dependency on "knockout"
        define(["knockout", "exports"], factory);
    }
    else {
        // <script> tag: use the global `ko` object, attaching a `mapping` property
        if (typeof ko === 'undefined') {
            throw new Error('Knockout is required, please ensure it is loaded before loading this mapping plug-in');
        }
        factory(ko, ko.mapping = {});
    }
}(function(ko, exports) {
    /*jshint sub:true,curly:false*/
    'use strict';

    ko.mapping = exports;

    var DEBUG=true;
    var mappingProperty = "__ko_mapping__";
    var realKoDependentObservable = ko.dependentObservable;
    var mappingNesting = 0;
    var dependentObservables;
    var visitedObjects;
    var recognizedRootProperties = ["create", "update", "key", "arrayChanged"];
    var emptyReturn = {};

    var _defaultOptions = {
        include: ["_destroy"],
        ignore: [],
        copy: [],
        observe: []
    };
    var defaultOptions = _defaultOptions;

    function unionArrays() {
        var args = arguments,
            l = args.length,
            obj = {},
            res = [],
            i, j, k;

        while (l--) {
            k = args[l];
            i = k.length;

            while (i--) {
                j = k[i];
                if (!obj[j]) {
                    obj[j] = 1;
                    res.push(j);
                }
            }
        }

        return res;
    }

    function extendObject(destination, source) {
        var destType;

        for (var key in source) {
            if (source.hasOwnProperty(key) && source[key]) {
                destType = exports.getType(destination[key]);
                if (key && destination[key] && destType !== "array" && destType !== "string") {
                    extendObject(destination[key], source[key]);
                }
                else {
                    var bothArrays = exports.getType(destination[key]) === "array" && exports.getType(source[key]) === "array";
                    if (bothArrays) {
                        destination[key] = unionArrays(destination[key], source[key]);
                    }
                    else {
                        destination[key] = source[key];
                    }
                }
            }
        }
    }

    function merge(obj1, obj2) {
        var merged = {};
        extendObject(merged, obj1);
        extendObject(merged, obj2);

        return merged;
    }

    exports.isMapped = function(viewModel) {
        var unwrapped = ko.utils.unwrapObservable(viewModel);
        return unwrapped && unwrapped[mappingProperty];
    };

    exports.fromJS = function(jsObject /*, inputOptions, target*/) {
        if (arguments.length === 0) {
            throw new Error("When calling ko.fromJS, pass the object you want to convert.");
        }
        try {
            if (!mappingNesting) {
                dependentObservables = [];
                visitedObjects = new ObjectLookup();
            }
            mappingNesting++;

            var options;
            var target;

            if (arguments.length === 2) {
                if (arguments[1][mappingProperty]) {
                    target = arguments[1];
                }
                else {
                    options = arguments[1];
                }
            }
            if (arguments.length === 3) {
                options = arguments[1];
                target = arguments[2];
            }

            if (target) {
                options = merge(options, target[mappingProperty]);
            }
            options = fillOptions(options);

            var result = updateViewModel(target, jsObject, options);
            if (target) {
                result = target;
            }

            // Evaluate any dependent observables that were proxied.
            // Do this after the model's observables have been created
            if (!--mappingNesting) {
                while (dependentObservables.length) {
                    var DO = dependentObservables.pop();
                    if (DO) {
                        DO();
                        // Move this magic property to the underlying dependent observable
                        DO.__DO["throttleEvaluation"] = DO["throttleEvaluation"];
                    }
                }
            }

            // Save any new mapping options in the view model, so that updateFromJS can use them later.
            result[mappingProperty] = merge(result[mappingProperty], options);

            return result;
        }
        catch (e) {
            mappingNesting = 0;
            throw e;
        }
    };

    exports.fromJSON = function(jsonString /*, options, target*/) {
        var args = Array.prototype.slice.call(arguments, 0);
        args[0] = ko.utils.parseJson(jsonString);
        return exports.fromJS.apply(this, args);
    };

    exports.toJS = function(rootObject, options) {
        if (!defaultOptions) exports.resetDefaultOptions();

        if (arguments.length === 0) throw new Error("When calling ko.mapping.toJS, pass the object you want to convert.");
        if (exports.getType(defaultOptions.ignore) !== "array") throw new Error("ko.mapping.defaultOptions().ignore should be an array.");
        if (exports.getType(defaultOptions.include) !== "array") throw new Error("ko.mapping.defaultOptions().include should be an array.");
        if (exports.getType(defaultOptions.copy) !== "array") throw new Error("ko.mapping.defaultOptions().copy should be an array.");

        // Merge in the options used in fromJS
        options = fillOptions(options, rootObject[mappingProperty]);

        // We just unwrap everything at every level in the object graph
        return exports.visitModel(rootObject, function(x) {
            return ko.utils.unwrapObservable(x);
        }, options);
    };

    exports.toJSON = function(rootObject, options, replacer, space) {
        var plainJavaScriptObject = exports.toJS(rootObject, options);
        return ko.utils.stringifyJson(plainJavaScriptObject, replacer, space);
    };

    exports.defaultOptions = function() {
        if (arguments.length > 0) {
            defaultOptions = arguments[0];
        }
        else {
            return defaultOptions;
        }
    };

    exports.resetDefaultOptions = function() {
        defaultOptions = {
            include: _defaultOptions.include.slice(0),
            ignore: _defaultOptions.ignore.slice(0),
            copy: _defaultOptions.copy.slice(0),
            observe: _defaultOptions.observe.slice(0)
        };
    };

    exports.getType = function(x) {
        if ((x) && (typeof (x) === "object")) {
            if (x.constructor === Date) return "date";
            if (x.constructor === Array) return "array";
        }
        return typeof x;
    };

    function fillOptions(rawOptions, otherOptions) {
        var options = merge({}, rawOptions);

        // Move recognized root-level properties into a root namespace
        for (var i = recognizedRootProperties.length - 1; i >= 0; i--) {
            var property = recognizedRootProperties[i];

            // Carry on, unless this property is present
            if (!options[property]) continue;

            // Move the property into the root namespace
            if (!(options[""] instanceof Object)) options[""] = {};
            options[""][property] = options[property];
            delete options[property];
        }

        if (otherOptions) {
            options.ignore = mergeArrays(otherOptions.ignore, options.ignore);
            options.include = mergeArrays(otherOptions.include, options.include);
            options.copy = mergeArrays(otherOptions.copy, options.copy);
            options.observe = mergeArrays(otherOptions.observe, options.observe);
        }
        options.ignore = mergeArrays(options.ignore, defaultOptions.ignore);
        options.include = mergeArrays(options.include, defaultOptions.include);
        options.copy = mergeArrays(options.copy, defaultOptions.copy);
        options.observe = mergeArrays(options.observe, defaultOptions.observe);

        options.mappedProperties = options.mappedProperties || {};
        options.copiedProperties = options.copiedProperties || {};
        return options;
    }

    function mergeArrays(a, b) {
        if (a === undefined) {
            a = [];
        }
        else if (exports.getType(a) !== "array") {
            a = [a];
        }

        if (b === undefined) {
            b = [];
        }
        else if (exports.getType(b) !== "array") {
            b = [b];
        }

        return ko.utils.arrayGetDistinctValues(a.concat(b));
    }

    // When using a 'create' callback, we proxy the dependent observable so that it doesn't immediately evaluate on creation.
    // The reason is that the dependent observables in the user-specified callback may contain references to properties that have not been mapped yet.
    function withProxyDependentObservable(dependentObservables, callback) {
        var localDO = ko.dependentObservable;
        ko.dependentObservable = function(read, owner, options) {
            options = options || {};

            if (read && typeof read === "object") { // mirrors condition in knockout implementation of DO's
                options = read;
            }

            var realDeferEvaluation = options.deferEvaluation;
            var realIsPure = options.pure;

            var isRemoved = false;

            // We wrap the original dependent observable so that we can remove it from the 'dependentObservables' list we need to evaluate after mapping has
            // completed if the user already evaluated the DO themselves in the meantime.
            var wrap = function(DO) {
                // Temporarily revert ko.dependentObservable, since it is used in ko.isWriteableObservable
                var tmp = ko.dependentObservable;
                ko.dependentObservable = realKoDependentObservable;
                var isWriteable = ko.isWriteableObservable(DO);
                ko.dependentObservable = tmp;

                var wrapped = realKoDependentObservable({
                    read: function() {
                        if (!isRemoved) {
                            ko.utils.arrayRemoveItem(dependentObservables, DO);
                            isRemoved = true;
                        }
                        return DO.apply(DO, arguments);
                    },
                    write: isWriteable && function(val) {
                        return DO(val);
                    },
                    deferEvaluation: true
                });
                if (DEBUG) wrapped._wrapper = true;
                wrapped.__DO = DO;
                return wrapped;
            };

            options.deferEvaluation = true; // will either set for just options, or both read/options.
            var realDependentObservable = realKoDependentObservable(read, owner, options);

            if (!realDeferEvaluation && !realIsPure) {
                realDependentObservable = wrap(realDependentObservable);
                dependentObservables.push(realDependentObservable);
            }

            return realDependentObservable;
        };
        ko.dependentObservable.fn = realKoDependentObservable.fn;
        ko.computed = ko.dependentObservable;
        var result = callback();
        ko.dependentObservable = localDO;
        ko.computed = ko.dependentObservable;
        return result;
    }

    function updateViewModel(mappedRootObject, rootObject, options, parentName, parent, parentPropertyName, mappedParent) {
        var isArray = exports.getType(ko.utils.unwrapObservable(rootObject)) === "array";

        parentPropertyName = parentPropertyName || "";

        // If this object was already mapped previously, take the options from there and merge them with our existing ones.
        if (exports.isMapped(mappedRootObject)) {
            var previousMapping = ko.utils.unwrapObservable(mappedRootObject)[mappingProperty];
            options = merge(previousMapping, options);
        }

        var callbackParams = {
            data: rootObject,
            parent: mappedParent || parent
        };

        var hasCreateCallback = function() {
            return options[parentName] && options[parentName].create instanceof Function;
        };

        var createCallback = function(data) {
            return withProxyDependentObservable(dependentObservables, function() {

                if (ko.utils.unwrapObservable(parent) instanceof Array) {
                    return options[parentName].create({
                        data: data || callbackParams.data,
                        parent: callbackParams.parent,
                        skip: emptyReturn
                    });
                }
                else {
                    return options[parentName].create({
                        data: data || callbackParams.data,
                        parent: callbackParams.parent
                    });
                }
            });
        };

        var hasUpdateCallback = function() {
            return options[parentName] && options[parentName].update instanceof Function;
        };

        var updateCallback = function(obj, data) {
            var params = {
                data: data || callbackParams.data,
                parent: callbackParams.parent,
                target: ko.utils.unwrapObservable(obj)
            };

            if (ko.isWriteableObservable(obj)) {
                params.observable = obj;
            }

            return options[parentName].update(params);
        };

        var alreadyMapped = visitedObjects.get(rootObject);
        if (alreadyMapped) {
            return alreadyMapped;
        }

        parentName = parentName || "";

        if (!isArray) {
            // For atomic types, do a direct update on the observable
            if (!canHaveProperties(rootObject)) {
                switch (exports.getType(rootObject)) {
                    case "function":
                        if (hasUpdateCallback()) {
                            if (ko.isWriteableObservable(rootObject)) {
                                rootObject(updateCallback(rootObject));
                                mappedRootObject = rootObject;
                            }
                            else {
                                mappedRootObject = updateCallback(rootObject);
                            }
                        }
                        else {
                            mappedRootObject = rootObject;
                        }
                        break;
                    default:
                        if (ko.isWriteableObservable(mappedRootObject)) {
                            var valueToWrite;
                            if (hasUpdateCallback()) {
                                valueToWrite = updateCallback(mappedRootObject);
                                mappedRootObject(valueToWrite);
                                return valueToWrite;
                            }
                            else {
                                valueToWrite = ko.utils.unwrapObservable(rootObject);
                                mappedRootObject(valueToWrite);
                                return valueToWrite;
                            }
                        }
                        else {
                            var hasCreateOrUpdateCallback = hasCreateCallback() || hasUpdateCallback();

                            if (hasCreateCallback()) {
                                mappedRootObject = createCallback();
                            }
                            else {
                                mappedRootObject = ko.observable(ko.utils.unwrapObservable(rootObject));
                            }

                            if (hasUpdateCallback()) {
                                mappedRootObject(updateCallback(mappedRootObject));
                            }

                            if (hasCreateOrUpdateCallback) return mappedRootObject;
                        }
                }

            }
            else {
                mappedRootObject = ko.utils.unwrapObservable(mappedRootObject);
                if (!mappedRootObject) {
                    if (hasCreateCallback()) {
                        var result = createCallback();

                        if (hasUpdateCallback()) {
                            result = updateCallback(result);
                        }
                        return result;
                    }
                    else {
                        if (hasUpdateCallback()) {
                            //Removed ambiguous parameter result
                            return updateCallback();
                        }
                        mappedRootObject = {};
                    }
                }

                if (hasUpdateCallback()) {
                    mappedRootObject = updateCallback(mappedRootObject);
                }

                visitedObjects.save(rootObject, mappedRootObject);
                if (hasUpdateCallback()) return mappedRootObject;

                // For non-atomic types, visit all properties and update recursively
                visitPropertiesOrArrayEntries(rootObject, function(indexer) {
                    var fullPropertyName = parentPropertyName.length ? parentPropertyName + "." + escapePropertyNameComponent(indexer) : escapePropertyNameComponent(indexer);

                    if (ko.utils.arrayIndexOf(options.ignore, fullPropertyName) !== -1) {
                        return;
                    }

                    if (ko.utils.arrayIndexOf(options.copy, fullPropertyName) !== -1) {
                        mappedRootObject[indexer] = rootObject[indexer];
                        return;
                    }

                    if (typeof rootObject[indexer] !== "object" && exports.getType(rootObject[indexer]) !== "array" && options.observe.length > 0 && ko.utils.arrayIndexOf(options.observe, fullPropertyName) === -1) {
                        mappedRootObject[indexer] = rootObject[indexer];
                        options.copiedProperties[fullPropertyName] = true;
                        return;
                    }

                    // In case we are adding an already mapped property, fill it with the previously mapped property value to prevent recursion.
                    // If this is a property that was generated by fromJS, we should use the options specified there
                    var prevMappedProperty = visitedObjects.get(rootObject[indexer]);
                    var retval = updateViewModel(mappedRootObject[indexer], rootObject[indexer], options, indexer, mappedRootObject, fullPropertyName, mappedRootObject);
                    var value = prevMappedProperty || retval;

                    if (options.observe.length > 0 && ko.utils.arrayIndexOf(options.observe, fullPropertyName) === -1) {
                        mappedRootObject[indexer] = ko.utils.unwrapObservable(value);
                        options.copiedProperties[fullPropertyName] = true;
                        return;
                    }

                    if (ko.isWriteableObservable(mappedRootObject[indexer])) {
                        value = ko.utils.unwrapObservable(value);
                        if (mappedRootObject[indexer]() !== value) {
                            mappedRootObject[indexer](value);
                        }
                    }
                    else {
                        value = mappedRootObject[indexer] === undefined ? value : ko.utils.unwrapObservable(value);
                        mappedRootObject[indexer] = value;
                    }

                    options.mappedProperties[fullPropertyName] = true;
                });
            }
        }
        else { //mappedRootObject is an array
            var changes = [];

            var hasKeyCallback = false;
            var keyCallback = function(x) {
                return x;
            };
            if (options[parentName] && options[parentName].key) {
                keyCallback = options[parentName].key;
                hasKeyCallback = true;
            }

            if (!ko.isObservable(mappedRootObject)) {
                // When creating the new observable array, also add a bunch of utility functions that take the 'key' of the array items into account.
                mappedRootObject = ko.observableArray([]);

                mappedRootObject.mappedRemove = function(valueOrPredicate) {
                    var predicate = typeof valueOrPredicate === "function" ? valueOrPredicate : function(value) {
                        return value === keyCallback(valueOrPredicate);
                    };
                    return mappedRootObject.remove(function(item) {
                        return predicate(keyCallback(item));
                    });
                };

                mappedRootObject.mappedRemoveAll = function(arrayOfValues) {
                    var arrayOfKeys = filterArrayByKey(arrayOfValues, keyCallback);
                    return mappedRootObject.remove(function(item) {
                        return ko.utils.arrayIndexOf(arrayOfKeys, keyCallback(item)) !== -1;
                    });
                };

                mappedRootObject.mappedDestroy = function(valueOrPredicate) {
                    var predicate = typeof valueOrPredicate === "function" ? valueOrPredicate : function(value) {
                        return value === keyCallback(valueOrPredicate);
                    };
                    return mappedRootObject.destroy(function(item) {
                        return predicate(keyCallback(item));
                    });
                };

                mappedRootObject.mappedDestroyAll = function(arrayOfValues) {
                    var arrayOfKeys = filterArrayByKey(arrayOfValues, keyCallback);
                    return mappedRootObject.destroy(function(item) {
                        return ko.utils.arrayIndexOf(arrayOfKeys, keyCallback(item)) !== -1;
                    });
                };

                mappedRootObject.mappedIndexOf = function(item) {
                    var keys = filterArrayByKey(mappedRootObject(), keyCallback);
                    var key = keyCallback(item);
                    return ko.utils.arrayIndexOf(keys, key);
                };

                mappedRootObject.mappedGet = function(item) {
                    return mappedRootObject()[mappedRootObject.mappedIndexOf(item)];
                };

                mappedRootObject.mappedCreate = function(value) {
                    if (mappedRootObject.mappedIndexOf(value) !== -1) {
                        throw new Error("There already is an object with the key that you specified.");
                    }
                    var item = hasCreateCallback() ? createCallback(value) : value;
                    if (hasUpdateCallback()) {
                        var newValue = updateCallback(item, value);
                        if (ko.isWriteableObservable(item)) {
                            item(newValue);
                        }
                        else {
                            item = newValue;
                        }
                    }
                    mappedRootObject.push(item);
                    return item;
                };
            }

            var currentArrayKeys = filterArrayByKey(ko.utils.unwrapObservable(mappedRootObject), keyCallback).sort();
            var newArrayKeys = filterArrayByKey(rootObject, keyCallback);
            if (hasKeyCallback) newArrayKeys.sort();
            var editScript = ko.utils.compareArrays(currentArrayKeys, newArrayKeys);

            var ignoreIndexOf = {};

            var i, j, key;

            var unwrappedRootObject = ko.utils.unwrapObservable(rootObject);
            var itemsByKey = {};
            var optimizedKeys = true;
            for (i = 0, j = unwrappedRootObject.length; i < j; i++) {
                key = keyCallback(unwrappedRootObject[i]);
                if (key === undefined || key instanceof Object) {
                    optimizedKeys = false;
                    break;
                }
                itemsByKey[key] = unwrappedRootObject[i];
            }

            var newContents = [];
            var passedOver = 0;
            var item, index;

            for (i = 0, j = editScript.length; i < j; i++) {
                key = editScript[i];
                var mappedItem;
                var fullPropertyName = parentPropertyName + "[" + escapePropertyNameComponent(i) + "]";

                switch (key.status) {
                    case "added":
                        item = optimizedKeys ? itemsByKey[key.value] : getItemByKey(ko.utils.unwrapObservable(rootObject), key.value, keyCallback);
                        mappedItem = updateViewModel(undefined, item, options, parentName, mappedRootObject, fullPropertyName, parent);
                        if (!hasCreateCallback()) {
                            mappedItem = ko.utils.unwrapObservable(mappedItem);
                        }

                        index = ignorableIndexOf(ko.utils.unwrapObservable(rootObject), item, ignoreIndexOf);

                        if (mappedItem === emptyReturn) {
                            passedOver++;
                        }
                        else {
                            newContents[index - passedOver] = mappedItem;
                        }

                        ignoreIndexOf[index] = true;
                        break;
                    case "retained":
                        item = optimizedKeys ? itemsByKey[key.value] : getItemByKey(ko.utils.unwrapObservable(rootObject), key.value, keyCallback);
                        mappedItem = getItemByKey(mappedRootObject, key.value, keyCallback);
                        updateViewModel(mappedItem, item, options, parentName, mappedRootObject, fullPropertyName, parent);

                        index = ignorableIndexOf(ko.utils.unwrapObservable(rootObject), item, ignoreIndexOf);
                        newContents[index] = mappedItem;
                        ignoreIndexOf[index] = true;
                        break;
                    case "deleted":
                        mappedItem = getItemByKey(mappedRootObject, key.value, keyCallback);
                        break;
                }

                changes.push({
                    event: key.status,
                    item: mappedItem
                });
            }

            mappedRootObject(newContents);

            if (options[parentName] && options[parentName].arrayChanged) {
                ko.utils.arrayForEach(changes, function(change) {
                    options[parentName].arrayChanged(change.event, change.item);
                });
            }
        }

        return mappedRootObject;
    }

    function ignorableIndexOf(array, item, ignoreIndices) {
        for (var i = 0, j = array.length; i < j; i++) {
            if (ignoreIndices[i] === true) continue;
            if (array[i] === item) return i;
        }
        return null;
    }

    function mapKey(item, callback) {
        var mappedItem;
        if (callback) mappedItem = callback(item);
        if (exports.getType(mappedItem) === "undefined") mappedItem = item;

        return ko.utils.unwrapObservable(mappedItem);
    }

    function getItemByKey(array, key, callback) {
        array = ko.utils.unwrapObservable(array);
        for (var i = 0, j = array.length; i < j; i++) {
            var item = array[i];
            if (mapKey(item, callback) === key) return item;
        }

        throw new Error("When calling ko.update*, the key '" + key + "' was not found!");
    }

    function filterArrayByKey(array, callback) {
        return ko.utils.arrayMap(ko.utils.unwrapObservable(array), function(item) {
            if (callback) {
                return mapKey(item, callback);
            }
            else {
                return item;
            }
        });
    }

    function visitPropertiesOrArrayEntries(rootObject, visitorCallback) {
        if (exports.getType(rootObject) === "array") {
            for (var i = 0; i < rootObject.length; i++)
                visitorCallback(i);
        }
        else {
            for (var propertyName in rootObject) {
                if (rootObject.hasOwnProperty(propertyName)) {
                    visitorCallback(propertyName);
                }
            }
        }
    }

    function canHaveProperties(object) {
        if (object === null) {
            return false;
        }
        var type = exports.getType(object);
        return (type === "object") || (type === "array");
    }

    // Based on the parentName, this creates a fully classified name of a property

    function getPropertyName(parentName, parent, indexer) {
        var propertyName = parentName || "";
        if (exports.getType(parent) === "array") {
            if (parentName) {
                propertyName += "[" + escapePropertyNameComponent(indexer) + "]";
            }
        }
        else {
            if (parentName) {
                propertyName += ".";
            }
            propertyName += escapePropertyNameComponent(indexer);
        }
        return propertyName;
    }

    function escapePropertyNameComponent(indexer) {
        var escapedIndexer  = (''+indexer)
            .replace(/~/g, '~~')
            .replace(/\[/g, '~[')
            .replace(/]/g, '~]')
            .replace(/\./g, '~.');
        return escapedIndexer;
    }


    exports.visitModel = function(rootObject, callback, options) {
        options = options || {};
        options.visitedObjects = options.visitedObjects || new ObjectLookup();

        var mappedRootObject;
        var unwrappedRootObject = ko.utils.unwrapObservable(rootObject);

        if (!canHaveProperties(unwrappedRootObject)) {
            return callback(rootObject, options.parentName);
        }
        else {
            options = fillOptions(options, unwrappedRootObject[mappingProperty]);

            // Only do a callback, but ignore the results
            callback(rootObject, options.parentName);
            mappedRootObject = exports.getType(unwrappedRootObject) === "array" ? [] : {};
        }

        options.visitedObjects.save(rootObject, mappedRootObject);

        var parentName = options.parentName;
        visitPropertiesOrArrayEntries(unwrappedRootObject, function(indexer) {
            var escapedIndexer = escapePropertyNameComponent(indexer);
            if (options.ignore && ko.utils.arrayIndexOf(options.ignore, escapedIndexer) !== -1) return;

            var propertyValue = unwrappedRootObject[indexer];
            options.parentName = getPropertyName(parentName, unwrappedRootObject, indexer);

            // If we don't want to explicitly copy the unmapped property...
            if (ko.utils.arrayIndexOf(options.copy, escapedIndexer) === -1) {
                // ...find out if it's a property we want to explicitly include
                if (ko.utils.arrayIndexOf(options.include, escapedIndexer) === -1) {
                    // The mapped properties object contains all the properties that were part of the original object.
                    // If a property does not exist, and it is not because it is part of an array (e.g. "myProp[3]"), then it should not be unmapped.
                    var unwrappedRootMappingProperty = unwrappedRootObject[mappingProperty];
                    if (unwrappedRootMappingProperty) {
                        var mappedProperties = unwrappedRootMappingProperty.mappedProperties;
                        if (mappedProperties && !mappedProperties[escapedIndexer]) {
                            var copiedProperties = unwrappedRootMappingProperty.copiedProperties;
                            if (copiedProperties && !copiedProperties[escapedIndexer] && (exports.getType(unwrappedRootObject) !== "array")) {
                                return;
                            }
                        }
                    }
                }
            }

            switch (exports.getType(ko.utils.unwrapObservable(propertyValue))) {
                case "object":
                case "array":
                case "undefined":
                    var previouslyMappedValue = options.visitedObjects.get(propertyValue);
                    mappedRootObject[indexer] = (exports.getType(previouslyMappedValue) !== "undefined") ? previouslyMappedValue : exports.visitModel(propertyValue, callback, options);
                    break;
                default:
                    mappedRootObject[indexer] = callback(propertyValue, options.parentName);
            }
        });

        return mappedRootObject;
    };

    function SimpleObjectLookup() {
        var keys = [];
        var values = [];
        this.save = function(key, value) {
            var existingIndex = ko.utils.arrayIndexOf(keys, key);
            if (existingIndex >= 0) values[existingIndex] = value;
            else {
                keys.push(key);
                values.push(value);
            }
        };
        this.get = function(key) {
            var existingIndex = ko.utils.arrayIndexOf(keys, key);
            var value = (existingIndex >= 0) ? values[existingIndex] : undefined;
            return value;
        };
    }

    function ObjectLookup() {
        var buckets = {};

        var findBucket = function(key) {
            var bucketKey;
            try {
                bucketKey = key;//JSON.stringify(key);
            }
            catch (e) {
                bucketKey = "$$$";
            }

            var bucket = buckets[bucketKey];
            if (!buckets.hasOwnProperty(bucketKey)) {
                bucket = new SimpleObjectLookup();
                buckets[bucketKey] = bucket;
            }
            return bucket;
        };

        this.save = function(key, value) {
            findBucket(key).save(key, value);
        };
        this.get = function(key) {
            return findBucket(key).get(key);
        };
    }
}));

},{"knockout":28}],27:[function(require,module,exports){
/*=============================================================================
	Author:			Eric M. Barnard - @ericmbarnard								
	License:		MIT (http://opensource.org/licenses/mit-license.php)		
																				
	Description:	Validation Library for KnockoutJS							
	Version:		2.0.3											
===============================================================================
*/
/*globals require: false, exports: false, define: false, ko: false */

(function (factory) {
	// Module systems magic dance.

	if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
		// CommonJS or Node: hard-coded dependency on "knockout"
		factory(require("knockout"), exports);
	} else if (typeof define === "function" && define["amd"]) {
		// AMD anonymous module with hard-coded dependency on "knockout"
		define(["knockout", "exports"], factory);
	} else {
		// <script> tag: use the global `ko` object, attaching a `mapping` property
		factory(ko, ko.validation = {});
	}
}(function ( ko, exports ) {

	if (typeof (ko) === 'undefined') {
		throw new Error('Knockout is required, please ensure it is loaded before loading this validation plug-in');
	}

	// create our namespace object
	ko.validation = exports;

	var kv = ko.validation,
		koUtils = ko.utils,
		unwrap = koUtils.unwrapObservable,
		forEach = koUtils.arrayForEach,
		extend = koUtils.extend;
;/*global ko: false*/

var defaults = {
	registerExtenders: true,
	messagesOnModified: true,
	errorsAsTitle: true,            // enables/disables showing of errors as title attribute of the target element.
	errorsAsTitleOnModified: false, // shows the error when hovering the input field (decorateElement must be true)
	messageTemplate: null,
	insertMessages: true,           // automatically inserts validation messages as <span></span>
	parseInputAttributes: false,    // parses the HTML5 validation attribute from a form element and adds that to the object
	writeInputAttributes: false,    // adds HTML5 input validation attributes to form elements that ko observable's are bound to
	decorateInputElement: false,         // false to keep backward compatibility
	decorateElementOnModified: true,// true to keep backward compatibility
	errorClass: null,               // single class for error message and element
	errorElementClass: 'validationElement',  // class to decorate error element
	errorMessageClass: 'validationMessage',  // class to decorate error message
	allowHtmlMessages: false,		// allows HTML in validation messages
	grouping: {
		deep: false,        //by default grouping is shallow
		observable: true,   //and using observables
		live: false		    //react to changes to observableArrays if observable === true
	},
	validate: {
		// throttle: 10
	}
};

// make a copy  so we can use 'reset' later
var configuration = extend({}, defaults);

configuration.html5Attributes = ['required', 'pattern', 'min', 'max', 'step'];
configuration.html5InputTypes = ['email', 'number', 'date'];

configuration.reset = function () {
	extend(configuration, defaults);
};

kv.configuration = configuration;
;kv.utils = (function () {
	var seedId = new Date().getTime();

	var domData = {}; //hash of data objects that we reference from dom elements
	var domDataKey = '__ko_validation__';

	return {
		isArray: function (o) {
			return o.isArray || Object.prototype.toString.call(o) === '[object Array]';
		},
		isObject: function (o) {
			return o !== null && typeof o === 'object';
		},
		isNumber: function(o) {
			return !isNaN(o);	
		},
		isObservableArray: function(instance) {
			return !!instance &&
					typeof instance["remove"] === "function" &&
					typeof instance["removeAll"] === "function" &&
					typeof instance["destroy"] === "function" &&
					typeof instance["destroyAll"] === "function" &&
					typeof instance["indexOf"] === "function" &&
					typeof instance["replace"] === "function";
		},
		values: function (o) {
			var r = [];
			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					r.push(o[i]);
				}
			}
			return r;
		},
		getValue: function (o) {
			return (typeof o === 'function' ? o() : o);
		},
		hasAttribute: function (node, attr) {
			return node.getAttribute(attr) !== null;
		},
		getAttribute: function (element, attr) {
			return element.getAttribute(attr);
		},
		setAttribute: function (element, attr, value) {
			return element.setAttribute(attr, value);
		},
		isValidatable: function (o) {
			return !!(o && o.rules && o.isValid && o.isModified);
		},
		insertAfter: function (node, newNode) {
			node.parentNode.insertBefore(newNode, node.nextSibling);
		},
		newId: function () {
			return seedId += 1;
		},
		getConfigOptions: function (element) {
			var options = kv.utils.contextFor(element);

			return options || kv.configuration;
		},
		setDomData: function (node, data) {
			var key = node[domDataKey];

			if (!key) {
				node[domDataKey] = key = kv.utils.newId();
			}

			domData[key] = data;
		},
		getDomData: function (node) {
			var key = node[domDataKey];

			if (!key) {
				return undefined;
			}

			return domData[key];
		},
		contextFor: function (node) {
			switch (node.nodeType) {
				case 1:
				case 8:
					var context = kv.utils.getDomData(node);
					if (context) { return context; }
					if (node.parentNode) { return kv.utils.contextFor(node.parentNode); }
					break;
			}
			return undefined;
		},
		isEmptyVal: function (val) {
			if (val === undefined) {
				return true;
			}
			if (val === null) {
				return true;
			}
			if (val === "") {
				return true;
			}
		},
		getOriginalElementTitle: function (element) {
			var savedOriginalTitle = kv.utils.getAttribute(element, 'data-orig-title'),
				currentTitle = element.title,
				hasSavedOriginalTitle = kv.utils.hasAttribute(element, 'data-orig-title');

			return hasSavedOriginalTitle ?
				savedOriginalTitle : currentTitle;
		},
		async: function (expr) {
			if (window.setImmediate) { window.setImmediate(expr); }
			else { window.setTimeout(expr, 0); }
		},
		forEach: function (object, callback) {
			if (kv.utils.isArray(object)) {
				return forEach(object, callback);
			}
			for (var prop in object) {
				if (object.hasOwnProperty(prop)) {
					callback(object[prop], prop);
				}
			}
		}
	};
}());;var api = (function () {

	var isInitialized = 0,
		configuration = kv.configuration,
		utils = kv.utils;

	function cleanUpSubscriptions(context) {
		forEach(context.subscriptions, function (subscription) {
			subscription.dispose();
		});
		context.subscriptions = [];
	}

	function dispose(context) {
		if (context.options.deep) {
			forEach(context.flagged, function (obj) {
				delete obj.__kv_traversed;
			});
			context.flagged.length = 0;
		}

		if (!context.options.live) {
			cleanUpSubscriptions(context);
		}
	}

	function runTraversal(obj, context) {
		context.validatables = [];
		cleanUpSubscriptions(context);
		traverseGraph(obj, context);
		dispose(context);
	}

	function traverseGraph(obj, context, level) {
		var objValues = [],
			val = obj.peek ? obj.peek() : obj;

		if (obj.__kv_traversed === true) {
			return;
		}

		if (context.options.deep) {
			obj.__kv_traversed = true;
			context.flagged.push(obj);
		}

		//default level value depends on deep option.
		level = (level !== undefined ? level : context.options.deep ? 1 : -1);

		// if object is observable then add it to the list
		if (ko.isObservable(obj)) {
			// ensure it's validatable but don't extend validatedObservable because it
			// would overwrite isValid property.
			if (!obj.errors && !utils.isValidatable(obj)) {
				obj.extend({ validatable: true });
			}
			context.validatables.push(obj);

			if (context.options.live && utils.isObservableArray(obj)) {
				context.subscriptions.push(obj.subscribe(function () {
					context.graphMonitor.valueHasMutated();
				}));
			}
		}

		//get list of values either from array or object but ignore non-objects
		// and destroyed objects
		if (val && !val._destroy) {
			if (utils.isArray(val)) {
				objValues = val;
			}
			else if (utils.isObject(val)) {
				objValues = utils.values(val);
			}
		}

		//process recursively if it is deep grouping
		if (level !== 0) {
			utils.forEach(objValues, function (observable) {
				//but not falsy things and not HTML Elements
				if (observable && !observable.nodeType && (!ko.isComputed(observable) || observable.rules)) {
					traverseGraph(observable, context, level + 1);
				}
			});
		}
	}

	function collectErrors(array) {
		var errors = [];
		forEach(array, function (observable) {
			// Do not collect validatedObservable errors
			if (utils.isValidatable(observable) && !observable.isValid()) {
				// Use peek because we don't want a dependency for 'error' property because it
				// changes before 'isValid' does. (Issue #99)
				errors.push(observable.error.peek());
			}
		});
		return errors;
	}

	return {
		//Call this on startup
		//any config can be overridden with the passed in options
		init: function (options, force) {
			//done run this multiple times if we don't really want to
			if (isInitialized > 0 && !force) {
				return;
			}

			//because we will be accessing options properties it has to be an object at least
			options = options || {};
			//if specific error classes are not provided then apply generic errorClass
			//it has to be done on option so that options.errorClass can override default
			//errorElementClass and errorMessage class but not those provided in options
			options.errorElementClass = options.errorElementClass || options.errorClass || configuration.errorElementClass;
			options.errorMessageClass = options.errorMessageClass || options.errorClass || configuration.errorMessageClass;

			extend(configuration, options);

			if (configuration.registerExtenders) {
				kv.registerExtenders();
			}

			isInitialized = 1;
		},

		// resets the config back to its original state
		reset: kv.configuration.reset,

		// recursively walks a viewModel and creates an object that
		// provides validation information for the entire viewModel
		// obj -> the viewModel to walk
		// options -> {
		//	  deep: false, // if true, will walk past the first level of viewModel properties
		//	  observable: false // if true, returns a computed observable indicating if the viewModel is valid
		// }
		group: function group(obj, options) { // array of observables or viewModel
			options = extend(extend({}, configuration.grouping), options);

			var context = {
				options: options,
				graphMonitor: ko.observable(),
				flagged: [],
				subscriptions: [],
				validatables: []
			};

			var result = null;

			//if using observables then traverse structure once and add observables
			if (options.observable) {
				result = ko.computed(function () {
					context.graphMonitor(); //register dependency
					runTraversal(obj, context);
					return collectErrors(context.validatables);
				});
			}
			else { //if not using observables then every call to error() should traverse the structure
				result = function () {
					runTraversal(obj, context);
					return collectErrors(context.validatables);
				};
			}

			result.showAllMessages = function (show) { // thanks @heliosPortal
				if (show === undefined) {//default to true
					show = true;
				}

				result.forEach(function (observable) {
					if (utils.isValidatable(observable)) {
						observable.isModified(show);
					}
				});
			};

			result.isAnyMessageShown = function () {
				var invalidAndModifiedPresent;

				invalidAndModifiedPresent = !!result.find(function (observable) {
					return utils.isValidatable(observable) && !observable.isValid() && observable.isModified();
				});
				return invalidAndModifiedPresent;
			};

			result.filter = function(predicate) {
				predicate = predicate || function () { return true; };
				// ensure we have latest changes
				result();

				return koUtils.arrayFilter(context.validatables, predicate);
			};

			result.find = function(predicate) {
				predicate = predicate || function () { return true; };
				// ensure we have latest changes
				result();

				return koUtils.arrayFirst(context.validatables, predicate);
			};

			result.forEach = function(callback) {
				callback = callback || function () { };
				// ensure we have latest changes
				result();

				forEach(context.validatables, callback);
			};

			result.map = function(mapping) {
				mapping = mapping || function (item) { return item; };
				// ensure we have latest changes
				result();

				return koUtils.arrayMap(context.validatables, mapping);
			};

			/**
			 * @private You should not rely on this method being here.
			 * It's a private method and it may change in the future.
			 *
			 * @description Updates the validated object and collects errors from it.
			 */
			result._updateState = function(newValue) {
				if (!utils.isObject(newValue)) {
					throw new Error('An object is required.');
				}
				obj = newValue;
				if (options.observable) {
					context.graphMonitor.valueHasMutated();
				}
				else {
					runTraversal(newValue, context);
					return collectErrors(context.validatables);
				}
			};
			return result;
		},

		formatMessage: function (message, params, observable) {
			if (utils.isObject(params) && params.typeAttr) {
				params = params.value;
			}
			if (typeof message === 'function') {
				return message(params, observable);
			}
			var replacements = unwrap(params);
            if (replacements == null) {
                replacements = [];
            }
			if (!utils.isArray(replacements)) {
				replacements = [replacements];
			}
			return message.replace(/{(\d+)}/gi, function(match, index) {
				if (typeof replacements[index] !== 'undefined') {
					return replacements[index];
				}
				return match;
			});
		},

		// addRule:
		// This takes in a ko.observable and a Rule Context - which is just a rule name and params to supply to the validator
		// ie: kv.addRule(myObservable, {
		//		  rule: 'required',
		//		  params: true
		//	  });
		//
		addRule: function (observable, rule) {
			observable.extend({ validatable: true });

			var hasRule = !!koUtils.arrayFirst(observable.rules(), function(item) {
				return item.rule && item.rule === rule.rule;
			});

			if (!hasRule) {
				//push a Rule Context to the observables local array of Rule Contexts
				observable.rules.push(rule);
			}
			return observable;
		},

		// addAnonymousRule:
		// Anonymous Rules essentially have all the properties of a Rule, but are only specific for a certain property
		// and developers typically are wanting to add them on the fly or not register a rule with the 'kv.rules' object
		//
		// Example:
		// var test = ko.observable('something').extend{(
		//	  validation: {
		//		  validator: function(val, someOtherVal){
		//			  return true;
		//		  },
		//		  message: "Something must be really wrong!',
		//		  params: true
		//	  }
		//  )};
		addAnonymousRule: function (observable, ruleObj) {
			if (ruleObj['message'] === undefined) {
				ruleObj['message'] = 'Error';
			}

			//make sure onlyIf is honoured
			if (ruleObj.onlyIf) {
				ruleObj.condition = ruleObj.onlyIf;
			}

			//add the anonymous rule to the observable
			kv.addRule(observable, ruleObj);
		},

		addExtender: function (ruleName) {
			ko.extenders[ruleName] = function (observable, params) {
				//params can come in a few flavors
				// 1. Just the params to be passed to the validator
				// 2. An object containing the Message to be used and the Params to pass to the validator
				// 3. A condition when the validation rule to be applied
				//
				// Example:
				// var test = ko.observable(3).extend({
				//	  max: {
				//		  message: 'This special field has a Max of {0}',
				//		  params: 2,
				//		  onlyIf: function() {
				//					  return specialField.IsVisible();
				//				  }
				//	  }
				//  )};
				//
				if (params && (params.message || params.onlyIf)) { //if it has a message or condition object, then its an object literal to use
					return kv.addRule(observable, {
						rule: ruleName,
						message: params.message,
						params: utils.isEmptyVal(params.params) ? true : params.params,
						condition: params.onlyIf
					});
				} else {
					return kv.addRule(observable, {
						rule: ruleName,
						params: params
					});
				}
			};
		},

		// loops through all kv.rules and adds them as extenders to
		// ko.extenders
		registerExtenders: function () { // root extenders optional, use 'validation' extender if would cause conflicts
			if (configuration.registerExtenders) {
				for (var ruleName in kv.rules) {
					if (kv.rules.hasOwnProperty(ruleName)) {
						if (!ko.extenders[ruleName]) {
							kv.addExtender(ruleName);
						}
					}
				}
			}
		},

		//creates a span next to the @element with the specified error class
		insertValidationMessage: function (element) {
			var span = document.createElement('SPAN');
			span.className = utils.getConfigOptions(element).errorMessageClass;
			utils.insertAfter(element, span);
			return span;
		},

		// if html-5 validation attributes have been specified, this parses
		// the attributes on @element
		parseInputValidationAttributes: function (element, valueAccessor) {
			forEach(kv.configuration.html5Attributes, function (attr) {
				if (utils.hasAttribute(element, attr)) {

					var params = element.getAttribute(attr) || true;

					if (attr === 'min' || attr === 'max')
					{
						// If we're validating based on the min and max attributes, we'll
						// need to know what the 'type' attribute is set to
						var typeAttr = element.getAttribute('type');
						if (typeof typeAttr === "undefined" || !typeAttr)
						{
							// From http://www.w3.org/TR/html-markup/input:
							//   An input element with no type attribute specified represents the
							//   same thing as an input element with its type attribute set to "text".
							typeAttr = "text";
						}
						params = {typeAttr: typeAttr, value: params};
					}

					kv.addRule(valueAccessor(), {
						rule: attr,
						params: params
					});
				}
			});

			var currentType = element.getAttribute('type');
			forEach(kv.configuration.html5InputTypes, function (type) {
				if (type === currentType) {
					kv.addRule(valueAccessor(), {
						rule: (type === 'date') ? 'dateISO' : type,
						params: true
					});
				}
			});
		},

		// writes html5 validation attributes on the element passed in
		writeInputValidationAttributes: function (element, valueAccessor) {
			var observable = valueAccessor();

			if (!observable || !observable.rules) {
				return;
			}

			var contexts = observable.rules(); // observable array

			// loop through the attributes and add the information needed
			forEach(kv.configuration.html5Attributes, function (attr) {
				var ctx = koUtils.arrayFirst(contexts, function (ctx) {
					return ctx.rule && ctx.rule.toLowerCase() === attr.toLowerCase();
				});

				if (!ctx) {
					return;
				}

				// we have a rule matching a validation attribute at this point
				// so lets add it to the element along with the params
				ko.computed({
					read: function() {
						var params = ko.unwrap(ctx.params);

						// we have to do some special things for the pattern validation
						if (ctx.rule === "pattern" && params instanceof RegExp) {
							// we need the pure string representation of the RegExpr without the //gi stuff
							params = params.source;
						}

						element.setAttribute(attr, params);
					},
					disposeWhenNodeIsRemoved: element
				});
			});

			contexts = null;
		},

		//take an existing binding handler and make it cause automatic validations
		makeBindingHandlerValidatable: function (handlerName) {
			var init = ko.bindingHandlers[handlerName].init;

			ko.bindingHandlers[handlerName].init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

				init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

				return ko.bindingHandlers['validationCore'].init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
			};
		},

		// visit an objects properties and apply validation rules from a definition
		setRules: function (target, definition) {
			var setRules = function (target, definition) {
				if (!target || !definition) { return; }

				for (var prop in definition) {
					if (!definition.hasOwnProperty(prop)) { continue; }
					var ruleDefinitions = definition[prop];

					//check the target property exists and has a value
					if (!target[prop]) { continue; }
					var targetValue = target[prop],
						unwrappedTargetValue = unwrap(targetValue),
						rules = {},
						nonRules = {};

					for (var rule in ruleDefinitions) {
						if (!ruleDefinitions.hasOwnProperty(rule)) { continue; }
						if (kv.rules[rule]) {
							rules[rule] = ruleDefinitions[rule];
						} else {
							nonRules[rule] = ruleDefinitions[rule];
						}
					}

					//apply rules
					if (ko.isObservable(targetValue)) {
						targetValue.extend(rules);
					}

					//then apply child rules
					//if it's an array, apply rules to all children
					if (unwrappedTargetValue && utils.isArray(unwrappedTargetValue)) {
						for (var i = 0; i < unwrappedTargetValue.length; i++) {
							setRules(unwrappedTargetValue[i], nonRules);
						}
						//otherwise, just apply to this property
					} else {
						setRules(unwrappedTargetValue, nonRules);
					}
				}
			};
			setRules(target, definition);
		}
	};

}());

// expose api publicly
extend(ko.validation, api);
;//Validation Rules:
// You can view and override messages or rules via:
// kv.rules[ruleName]
//
// To implement a custom Rule, simply use this template:
// kv.rules['<custom rule name>'] = {
//      validator: function (val, param) {
//          <custom logic>
//          return <true or false>;
//      },
//      message: '<custom validation message>' //optionally you can also use a '{0}' to denote a placeholder that will be replaced with your 'param'
// };
//
// Example:
// kv.rules['mustEqual'] = {
//      validator: function( val, mustEqualVal ){
//          return val === mustEqualVal;
//      },
//      message: 'This field must equal {0}'
// };
//
kv.rules = {};
kv.rules['required'] = {
	validator: function (val, required) {
		var testVal;

		if (val === undefined || val === null) {
			return !required;
		}

		testVal = val;
		if (typeof (val) === 'string') {
			if (String.prototype.trim) {
				testVal = val.trim();
			}
			else {
				testVal = val.replace(/^\s+|\s+$/g, '');
			}
		}

		if (!required) {// if they passed: { required: false }, then don't require this
			return true;
		}

		return ((testVal + '').length > 0);
	},
	message: 'This field is required.'
};

function minMaxValidatorFactory(validatorName) {
    var isMaxValidation = validatorName === "max";

    return function (val, options) {
        if (kv.utils.isEmptyVal(val)) {
            return true;
        }

        var comparisonValue, type;
        if (options.typeAttr === undefined) {
            // This validator is being called from javascript rather than
            // being bound from markup
            type = "text";
            comparisonValue = options;
        } else {
            type = options.typeAttr;
            comparisonValue = options.value;
        }

        // From http://www.w3.org/TR/2012/WD-html5-20121025/common-input-element-attributes.html#attr-input-min,
        // if the value is parseable to a number, then the minimum should be numeric
        if (!isNaN(comparisonValue) && !(comparisonValue instanceof Date)) {
            type = "number";
        }

        var regex, valMatches, comparisonValueMatches;
        switch (type.toLowerCase()) {
            case "week":
                regex = /^(\d{4})-W(\d{2})$/;
                valMatches = val.match(regex);
                if (valMatches === null) {
                    throw new Error("Invalid value for " + validatorName + " attribute for week input.  Should look like " +
                        "'2000-W33' http://www.w3.org/TR/html-markup/input.week.html#input.week.attrs.min");
                }
                comparisonValueMatches = comparisonValue.match(regex);
                // If no regex matches were found, validation fails
                if (!comparisonValueMatches) {
                    return false;
                }

                if (isMaxValidation) {
                    return (valMatches[1] < comparisonValueMatches[1]) || // older year
                        // same year, older week
                        ((valMatches[1] === comparisonValueMatches[1]) && (valMatches[2] <= comparisonValueMatches[2]));
                } else {
                    return (valMatches[1] > comparisonValueMatches[1]) || // newer year
                        // same year, newer week
                        ((valMatches[1] === comparisonValueMatches[1]) && (valMatches[2] >= comparisonValueMatches[2]));
                }
                break;

            case "month":
                regex = /^(\d{4})-(\d{2})$/;
                valMatches = val.match(regex);
                if (valMatches === null) {
                    throw new Error("Invalid value for " + validatorName + " attribute for month input.  Should look like " +
                        "'2000-03' http://www.w3.org/TR/html-markup/input.month.html#input.month.attrs.min");
                }
                comparisonValueMatches = comparisonValue.match(regex);
                // If no regex matches were found, validation fails
                if (!comparisonValueMatches) {
                    return false;
                }

                if (isMaxValidation) {
                    return ((valMatches[1] < comparisonValueMatches[1]) || // older year
                        // same year, older month
                        ((valMatches[1] === comparisonValueMatches[1]) && (valMatches[2] <= comparisonValueMatches[2])));
                } else {
                    return (valMatches[1] > comparisonValueMatches[1]) || // newer year
                        // same year, newer month
                        ((valMatches[1] === comparisonValueMatches[1]) && (valMatches[2] >= comparisonValueMatches[2]));
                }
                break;

            case "number":
            case "range":
                if (isMaxValidation) {
                    return (!isNaN(val) && parseFloat(val) <= parseFloat(comparisonValue));
                } else {
                    return (!isNaN(val) && parseFloat(val) >= parseFloat(comparisonValue));
                }
                break;

            default:
                if (isMaxValidation) {
                    return val <= comparisonValue;
                } else {
                    return val >= comparisonValue;
                }
        }
    };
}

kv.rules['min'] = {
	validator: minMaxValidatorFactory("min"),
	message: 'Please enter a value greater than or equal to {0}.'
};

kv.rules['max'] = {
	validator: minMaxValidatorFactory("max"),
	message: 'Please enter a value less than or equal to {0}.'
};

kv.rules['minLength'] = {
	validator: function (val, minLength) {
		if(kv.utils.isEmptyVal(val)) { return true; }
		var normalizedVal = kv.utils.isNumber(val) ? ('' + val) : val;
		return normalizedVal.length >= minLength;
	},
	message: 'Please enter at least {0} characters.'
};

kv.rules['maxLength'] = {
	validator: function (val, maxLength) {
		if(kv.utils.isEmptyVal(val)) { return true; }
		var normalizedVal = kv.utils.isNumber(val) ? ('' + val) : val;
		return normalizedVal.length <= maxLength;
	},
	message: 'Please enter no more than {0} characters.'
};

kv.rules['pattern'] = {
	validator: function (val, regex) {
		return kv.utils.isEmptyVal(val) || val.toString().match(regex) !== null;
	},
	message: 'Please check this value.'
};

kv.rules['step'] = {
	validator: function (val, step) {

		// in order to handle steps of .1 & .01 etc.. Modulus won't work
		// if the value is a decimal, so we have to correct for that
		if (kv.utils.isEmptyVal(val) || step === 'any') { return true; }
		var dif = (val * 100) % (step * 100);
		return Math.abs(dif) < 0.00001 || Math.abs(1 - dif) < 0.00001;
	},
	message: 'The value must increment by {0}.'
};

kv.rules['email'] = {
	validator: function (val, validate) {
		if (!validate) { return true; }

		//I think an empty email address is also a valid entry
		//if one want's to enforce entry it should be done with 'required: true'
		return kv.utils.isEmptyVal(val) || (
			// jquery validate regex - thanks Scott Gonzalez
			validate && /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(val)
		);
	},
	message: 'Please enter a proper email address.'
};

kv.rules['date'] = {
	validator: function (value, validate) {
		if (!validate) { return true; }
		return kv.utils.isEmptyVal(value) || (validate && !/Invalid|NaN/.test(new Date(value)));
	},
	message: 'Please enter a proper date.'
};

kv.rules['dateISO'] = {
	validator: function (value, validate) {
		if (!validate) { return true; }
		return kv.utils.isEmptyVal(value) || (validate && /^\d{4}[-/](?:0?[1-9]|1[012])[-/](?:0?[1-9]|[12][0-9]|3[01])$/.test(value));
	},
	message: 'Please enter a proper date.'
};

kv.rules['number'] = {
	validator: function (value, validate) {
		if (!validate) { return true; }
		return kv.utils.isEmptyVal(value) || (validate && /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value));
	},
	message: 'Please enter a number.'
};

kv.rules['digit'] = {
	validator: function (value, validate) {
		if (!validate) { return true; }
		return kv.utils.isEmptyVal(value) || (validate && /^\d+$/.test(value));
	},
	message: 'Please enter a digit.'
};

kv.rules['phoneUS'] = {
	validator: function (phoneNumber, validate) {
		if (!validate) { return true; }
		if (kv.utils.isEmptyVal(phoneNumber)) { return true; } // makes it optional, use 'required' rule if it should be required
		if (typeof (phoneNumber) !== 'string') { return false; }
		phoneNumber = phoneNumber.replace(/\s+/g, "");
		return validate && phoneNumber.length > 9 && phoneNumber.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
	},
	message: 'Please specify a valid phone number.'
};

kv.rules['equal'] = {
	validator: function (val, params) {
		var otherValue = params;
		return val === kv.utils.getValue(otherValue);
	},
	message: 'Values must equal.'
};

kv.rules['notEqual'] = {
	validator: function (val, params) {
		var otherValue = params;
		return val !== kv.utils.getValue(otherValue);
	},
	message: 'Please choose another value.'
};

//unique in collection
// options are:
//    collection: array or function returning (observable) array
//              in which the value has to be unique
//    valueAccessor: function that returns value from an object stored in collection
//              if it is null the value is compared directly
//    external: set to true when object you are validating is automatically updating collection
kv.rules['unique'] = {
	validator: function (val, options) {
		var c = kv.utils.getValue(options.collection),
			external = kv.utils.getValue(options.externalValue),
			counter = 0;

		if (!val || !c) { return true; }

		koUtils.arrayFilter(c, function (item) {
			if (val === (options.valueAccessor ? options.valueAccessor(item) : item)) { counter++; }
		});
		// if value is external even 1 same value in collection means the value is not unique
		return counter < (!!external ? 1 : 2);
	},
	message: 'Please make sure the value is unique.'
};


//now register all of these!
(function () {
	kv.registerExtenders();
}());
;// The core binding handler
// this allows us to setup any value binding that internally always
// performs the same functionality
ko.bindingHandlers['validationCore'] = (function () {

	return {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var config = kv.utils.getConfigOptions(element);
			var observable = valueAccessor();

			// parse html5 input validation attributes, optional feature
			if (config.parseInputAttributes) {
				kv.utils.async(function () { kv.parseInputValidationAttributes(element, valueAccessor); });
			}

			// if requested insert message element and apply bindings
			if (config.insertMessages && kv.utils.isValidatable(observable)) {

				// insert the <span></span>
				var validationMessageElement = kv.insertValidationMessage(element);

				// if we're told to use a template, make sure that gets rendered
				if (config.messageTemplate) {
					ko.renderTemplate(config.messageTemplate, { field: observable }, null, validationMessageElement, 'replaceNode');
				} else {
					ko.applyBindingsToNode(validationMessageElement, { validationMessage: observable });
				}
			}

			// write the html5 attributes if indicated by the config
			if (config.writeInputAttributes && kv.utils.isValidatable(observable)) {

				kv.writeInputValidationAttributes(element, valueAccessor);
			}

			// if requested, add binding to decorate element
			if (config.decorateInputElement && kv.utils.isValidatable(observable)) {
				ko.applyBindingsToNode(element, { validationElement: observable });
			}
		}
	};

}());

// override for KO's default 'value', 'checked', 'textInput' and selectedOptions bindings
kv.makeBindingHandlerValidatable("value");
kv.makeBindingHandlerValidatable("checked");
if (ko.bindingHandlers.textInput) {
	kv.makeBindingHandlerValidatable("textInput");
}
kv.makeBindingHandlerValidatable("selectedOptions");


ko.bindingHandlers['validationMessage'] = { // individual error message, if modified or post binding
	update: function (element, valueAccessor) {
		var obsv = valueAccessor(),
			config = kv.utils.getConfigOptions(element),
			val = unwrap(obsv),
			msg = null,
			isModified = false,
			isValid = false;

		if (obsv === null || typeof obsv === 'undefined') {
			throw new Error('Cannot bind validationMessage to undefined value. data-bind expression: ' +
				element.getAttribute('data-bind'));
		}

		isModified = obsv.isModified && obsv.isModified();
		isValid = obsv.isValid && obsv.isValid();

		var error = null;
		if (!config.messagesOnModified || isModified) {
			error = isValid ? null : obsv.error;
		}

		var isVisible = !config.messagesOnModified || isModified ? !isValid : false;
		var isCurrentlyVisible = element.style.display !== "none";

		if (config.allowHtmlMessages) {
			koUtils.setHtml(element, error);
		} else {
			ko.bindingHandlers.text.update(element, function () { return error; });
		}

		if (isCurrentlyVisible && !isVisible) {
			element.style.display = 'none';
		} else if (!isCurrentlyVisible && isVisible) {
			element.style.display = '';
		}
	}
};

ko.bindingHandlers['validationElement'] = {
	update: function (element, valueAccessor, allBindingsAccessor) {
		var obsv = valueAccessor(),
			config = kv.utils.getConfigOptions(element),
			val = unwrap(obsv),
			msg = null,
			isModified = false,
			isValid = false;

		if (obsv === null || typeof obsv === 'undefined') {
			throw new Error('Cannot bind validationElement to undefined value. data-bind expression: ' +
				element.getAttribute('data-bind'));
		}

		isModified = obsv.isModified && obsv.isModified();
		isValid = obsv.isValid && obsv.isValid();

		// create an evaluator function that will return something like:
		// css: { validationElement: true }
		var cssSettingsAccessor = function () {
			var css = {};

			var shouldShow = ((!config.decorateElementOnModified || isModified) ? !isValid : false);

			// css: { validationElement: false }
			css[config.errorElementClass] = shouldShow;

			return css;
		};

		//add or remove class on the element;
		ko.bindingHandlers.css.update(element, cssSettingsAccessor, allBindingsAccessor);
		if (!config.errorsAsTitle) { return; }

		ko.bindingHandlers.attr.update(element, function () {
			var
				hasModification = !config.errorsAsTitleOnModified || isModified,
				title = kv.utils.getOriginalElementTitle(element);

			if (hasModification && !isValid) {
				return { title: obsv.error, 'data-orig-title': title };
			} else if (!hasModification || isValid) {
				return { title: title, 'data-orig-title': null };
			}
		});
	}
};

// ValidationOptions:
// This binding handler allows you to override the initial config by setting any of the options for a specific element or context of elements
//
// Example:
// <div data-bind="validationOptions: { insertMessages: true, messageTemplate: 'customTemplate', errorMessageClass: 'mySpecialClass'}">
//      <input type="text" data-bind="value: someValue"/>
//      <input type="text" data-bind="value: someValue2"/>
// </div>
ko.bindingHandlers['validationOptions'] = (function () {
	return {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var options = unwrap(valueAccessor());
			if (options) {
				var newConfig = extend({}, kv.configuration);
				extend(newConfig, options);

				//store the validation options on the node so we can retrieve it later
				kv.utils.setDomData(element, newConfig);
			}
		}
	};
}());
;// Validation Extender:
// This is for creating custom validation logic on the fly
// Example:
// var test = ko.observable('something').extend{(
//      validation: {
//          validator: function(val, someOtherVal){
//              return true;
//          },
//          message: "Something must be really wrong!',
//          params: true
//      }
//  )};
ko.extenders['validation'] = function (observable, rules) { // allow single rule or array
	forEach(kv.utils.isArray(rules) ? rules : [rules], function (rule) {
		// the 'rule' being passed in here has no name to identify a core Rule,
		// so we add it as an anonymous rule
		// If the developer is wanting to use a core Rule, but use a different message see the 'addExtender' logic for examples
		kv.addAnonymousRule(observable, rule);
	});
	return observable;
};

//This is the extender that makes a Knockout Observable also 'Validatable'
//examples include:
// 1. var test = ko.observable('something').extend({validatable: true});
// this will ensure that the Observable object is setup properly to respond to rules
//
// 2. test.extend({validatable: false});
// this will remove the validation properties from the Observable object should you need to do that.
ko.extenders['validatable'] = function (observable, options) {
	if (!kv.utils.isObject(options)) {
		options = { enable: options };
	}

	if (!('enable' in options)) {
		options.enable = true;
	}

	if (options.enable && !kv.utils.isValidatable(observable)) {
		var config = kv.configuration.validate || {};
		var validationOptions = {
			throttleEvaluation : options.throttle || config.throttle
		};

		observable.error = ko.observable(null); // holds the error message, we only need one since we stop processing validators when one is invalid

		// observable.rules:
		// ObservableArray of Rule Contexts, where a Rule Context is simply the name of a rule and the params to supply to it
		//
		// Rule Context = { rule: '<rule name>', params: '<passed in params>', message: '<Override of default Message>' }
		observable.rules = ko.observableArray(); //holds the rule Contexts to use as part of validation

		//in case async validation is occurring
		observable.isValidating = ko.observable(false);

		//the true holder of whether the observable is valid or not
		observable.__valid__ = ko.observable(true);

		observable.isModified = ko.observable(false);

		// a semi-protected observable
		observable.isValid = ko.computed(observable.__valid__);

		//manually set error state
		observable.setError = function (error) {
			var previousError = observable.error.peek();
			var previousIsValid = observable.__valid__.peek();

			observable.error(error);
			observable.__valid__(false);

			if (previousError !== error && !previousIsValid) {
				// if the observable was not valid before then isValid will not mutate,
				// hence causing any grouping to not display the latest error.
				observable.isValid.notifySubscribers();
			}
		};

		//manually clear error state
		observable.clearError = function () {
			observable.error(null);
			observable.__valid__(true);
			return observable;
		};

		//subscribe to changes in the observable
		var h_change = observable.subscribe(function () {
			observable.isModified(true);
		});

		// we use a computed here to ensure that anytime a dependency changes, the
		// validation logic evaluates
		var h_obsValidationTrigger = ko.computed(extend({
			read: function () {
				var obs = observable(),
					ruleContexts = observable.rules();

				kv.validateObservable(observable);

				return true;
			}
		}, validationOptions));

		extend(h_obsValidationTrigger, validationOptions);

		observable._disposeValidation = function () {
			//first dispose of the subscriptions
			observable.isValid.dispose();
			observable.rules.removeAll();
			h_change.dispose();
			h_obsValidationTrigger.dispose();

			delete observable['rules'];
			delete observable['error'];
			delete observable['isValid'];
			delete observable['isValidating'];
			delete observable['__valid__'];
			delete observable['isModified'];
            delete observable['setError'];
            delete observable['clearError'];
            delete observable['_disposeValidation'];
		};
	} else if (options.enable === false && observable._disposeValidation) {
		observable._disposeValidation();
	}
	return observable;
};

function validateSync(observable, rule, ctx) {
	//Execute the validator and see if its valid
	if (!rule.validator(observable(), (ctx.params === undefined ? true : unwrap(ctx.params)))) { // default param is true, eg. required = true

		//not valid, so format the error message and stick it in the 'error' variable
		observable.setError(kv.formatMessage(
					ctx.message || rule.message,
					unwrap(ctx.params),
					observable));
		return false;
	} else {
		return true;
	}
}

function validateAsync(observable, rule, ctx) {
	observable.isValidating(true);

	var callBack = function (valObj) {
		var isValid = false,
			msg = '';

		if (!observable.__valid__()) {

			// since we're returning early, make sure we turn this off
			observable.isValidating(false);

			return; //if its already NOT valid, don't add to that
		}

		//we were handed back a complex object
		if (valObj['message']) {
			isValid = valObj.isValid;
			msg = valObj.message;
		} else {
			isValid = valObj;
		}

		if (!isValid) {
			//not valid, so format the error message and stick it in the 'error' variable
			observable.error(kv.formatMessage(
				msg || ctx.message || rule.message,
				unwrap(ctx.params),
				observable));
			observable.__valid__(isValid);
		}

		// tell it that we're done
		observable.isValidating(false);
	};

	kv.utils.async(function() {
	    //fire the validator and hand it the callback
        rule.validator(observable(), ctx.params === undefined ? true : unwrap(ctx.params), callBack);
	});
}

kv.validateObservable = function (observable) {
	var i = 0,
		rule, // the rule validator to execute
		ctx, // the current Rule Context for the loop
		ruleContexts = observable.rules(), //cache for iterator
		len = ruleContexts.length; //cache for iterator

	for (; i < len; i++) {

		//get the Rule Context info to give to the core Rule
		ctx = ruleContexts[i];

		// checks an 'onlyIf' condition
		if (ctx.condition && !ctx.condition()) {
			continue;
		}

		//get the core Rule to use for validation
		rule = ctx.rule ? kv.rules[ctx.rule] : ctx;

		if (rule['async'] || ctx['async']) {
			//run async validation
			validateAsync(observable, rule, ctx);

		} else {
			//run normal sync validation
			if (!validateSync(observable, rule, ctx)) {
				return false; //break out of the loop
			}
		}
	}
	//finally if we got this far, make the observable valid again!
	observable.clearError();
	return true;
};
;
var _locales = {};
var _currentLocale;

kv.defineLocale = function(name, values) {
	if (name && values) {
		_locales[name.toLowerCase()] = values;
		return values;
	}
	return null;
};

kv.locale = function(name) {
	if (name) {
		name = name.toLowerCase();

		if (_locales.hasOwnProperty(name)) {
			kv.localize(_locales[name]);
			_currentLocale = name;
		}
		else {
			throw new Error('Localization ' + name + ' has not been loaded.');
		}
	}
	return _currentLocale;
};

//quick function to override rule messages
kv.localize = function (msgTranslations) {
	var rules = kv.rules;

	//loop the properties in the object and assign the msg to the rule
	for (var ruleName in msgTranslations) {
		if (rules.hasOwnProperty(ruleName)) {
			rules[ruleName].message = msgTranslations[ruleName];
		}
	}
};

// Populate default locale (this will make en-US.js somewhat redundant)
(function() {
	var localeData = {};
	var rules = kv.rules;

	for (var ruleName in rules) {
		if (rules.hasOwnProperty(ruleName)) {
			localeData[ruleName] = rules[ruleName].message;
		}
	}
	kv.defineLocale('en-us', localeData);
})();

// No need to invoke locale because the messages are already defined along with the rules for en-US
_currentLocale = 'en-us';
;/**
 * Possible invocations:
 * 		applyBindingsWithValidation(viewModel)
 * 		applyBindingsWithValidation(viewModel, options)
 * 		applyBindingsWithValidation(viewModel, rootNode)
 *		applyBindingsWithValidation(viewModel, rootNode, options)
 */
ko.applyBindingsWithValidation = function (viewModel, rootNode, options) {
	var node = document.body,
		config;

	if (rootNode && rootNode.nodeType) {
		node = rootNode;
		config = options;
	}
	else {
		config = rootNode;
	}

	kv.init();

	if (config) {
		config = extend(extend({}, kv.configuration), config);
		kv.utils.setDomData(node, config);
	}

	ko.applyBindings(viewModel, node);
};

//override the original applyBindings so that we can ensure all new rules and what not are correctly registered
var origApplyBindings = ko.applyBindings;
ko.applyBindings = function (viewModel, rootNode) {

	kv.init();

	origApplyBindings(viewModel, rootNode);
};

ko.validatedObservable = function (initialValue, options) {
	if (!options && !kv.utils.isObject(initialValue)) {
		return ko.observable(initialValue).extend({ validatable: true });
	}

	var obsv = ko.observable(initialValue);
	obsv.errors = kv.group(kv.utils.isObject(initialValue) ? initialValue : {}, options);
	obsv.isValid = ko.observable(obsv.errors().length === 0);

	if (ko.isObservable(obsv.errors)) {
		obsv.errors.subscribe(function(errors) {
			obsv.isValid(errors.length === 0);
		});
	}
	else {
		ko.computed(obsv.errors).subscribe(function (errors) {
			obsv.isValid(errors.length === 0);
		});
	}

	obsv.subscribe(function(newValue) {
		if (!kv.utils.isObject(newValue)) {
			/*
			 * The validation group works on objects.
			 * Since the new value is a primitive (scalar, null or undefined) we need
			 * to create an empty object to pass along.
			 */
			newValue = {};
		}
		// Force the group to refresh
		obsv.errors._updateState(newValue);
		obsv.isValid(obsv.errors().length === 0);
	});

	return obsv;
};
;}));
},{"knockout":28}],28:[function(require,module,exports){
/*!
 * Knockout JavaScript library v3.4.2
 * (c) The Knockout.js team - http://knockoutjs.com/
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

(function(){
var DEBUG=true;
(function(undefined){
    // (0, eval)('this') is a robust way of getting a reference to the global object
    // For details, see http://stackoverflow.com/questions/14119988/return-this-0-evalthis/14120023#14120023
    var window = this || (0, eval)('this'),
        document = window['document'],
        navigator = window['navigator'],
        jQueryInstance = window["jQuery"],
        JSON = window["JSON"];
(function(factory) {
    // Support three module loading scenarios
    if (typeof define === 'function' && define['amd']) {
        // [1] AMD anonymous module
        define(['exports', 'require'], factory);
    } else if (typeof exports === 'object' && typeof module === 'object') {
        // [2] CommonJS/Node.js
        factory(module['exports'] || exports);  // module.exports is for Node.js
    } else {
        // [3] No module loader (plain <script> tag) - put directly in global namespace
        factory(window['ko'] = {});
    }
}(function(koExports, amdRequire){
// Internally, all KO objects are attached to koExports (even the non-exported ones whose names will be minified by the closure compiler).
// In the future, the following "ko" variable may be made distinct from "koExports" so that private objects are not externally reachable.
var ko = typeof koExports !== 'undefined' ? koExports : {};
// Google Closure Compiler helpers (used only to make the minified file smaller)
ko.exportSymbol = function(koPath, object) {
    var tokens = koPath.split(".");

    // In the future, "ko" may become distinct from "koExports" (so that non-exported objects are not reachable)
    // At that point, "target" would be set to: (typeof koExports !== "undefined" ? koExports : ko)
    var target = ko;

    for (var i = 0; i < tokens.length - 1; i++)
        target = target[tokens[i]];
    target[tokens[tokens.length - 1]] = object;
};
ko.exportProperty = function(owner, publicName, object) {
    owner[publicName] = object;
};
ko.version = "3.4.2";

ko.exportSymbol('version', ko.version);
// For any options that may affect various areas of Knockout and aren't directly associated with data binding.
ko.options = {
    'deferUpdates': false,
    'useOnlyNativeEvents': false
};

//ko.exportSymbol('options', ko.options);   // 'options' isn't minified
ko.utils = (function () {
    function objectForEach(obj, action) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                action(prop, obj[prop]);
            }
        }
    }

    function extend(target, source) {
        if (source) {
            for(var prop in source) {
                if(source.hasOwnProperty(prop)) {
                    target[prop] = source[prop];
                }
            }
        }
        return target;
    }

    function setPrototypeOf(obj, proto) {
        obj.__proto__ = proto;
        return obj;
    }

    var canSetPrototype = ({ __proto__: [] } instanceof Array);
    var canUseSymbols = !DEBUG && typeof Symbol === 'function';

    // Represent the known event types in a compact way, then at runtime transform it into a hash with event name as key (for fast lookup)
    var knownEvents = {}, knownEventTypesByEventName = {};
    var keyEventTypeName = (navigator && /Firefox\/2/i.test(navigator.userAgent)) ? 'KeyboardEvent' : 'UIEvents';
    knownEvents[keyEventTypeName] = ['keyup', 'keydown', 'keypress'];
    knownEvents['MouseEvents'] = ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
    objectForEach(knownEvents, function(eventType, knownEventsForType) {
        if (knownEventsForType.length) {
            for (var i = 0, j = knownEventsForType.length; i < j; i++)
                knownEventTypesByEventName[knownEventsForType[i]] = eventType;
        }
    });
    var eventsThatMustBeRegisteredUsingAttachEvent = { 'propertychange': true }; // Workaround for an IE9 issue - https://github.com/SteveSanderson/knockout/issues/406

    // Detect IE versions for bug workarounds (uses IE conditionals, not UA string, for robustness)
    // Note that, since IE 10 does not support conditional comments, the following logic only detects IE < 10.
    // Currently this is by design, since IE 10+ behaves correctly when treated as a standard browser.
    // If there is a future need to detect specific versions of IE10+, we will amend this.
    var ieVersion = document && (function() {
        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
        while (
            div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
            iElems[0]
        ) {}
        return version > 4 ? version : undefined;
    }());
    var isIe6 = ieVersion === 6,
        isIe7 = ieVersion === 7;

    function isClickOnCheckableElement(element, eventType) {
        if ((ko.utils.tagNameLower(element) !== "input") || !element.type) return false;
        if (eventType.toLowerCase() != "click") return false;
        var inputType = element.type;
        return (inputType == "checkbox") || (inputType == "radio");
    }

    // For details on the pattern for changing node classes
    // see: https://github.com/knockout/knockout/issues/1597
    var cssClassNameRegex = /\S+/g;

    function toggleDomNodeCssClass(node, classNames, shouldHaveClass) {
        var addOrRemoveFn;
        if (classNames) {
            if (typeof node.classList === 'object') {
                addOrRemoveFn = node.classList[shouldHaveClass ? 'add' : 'remove'];
                ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
                    addOrRemoveFn.call(node.classList, className);
                });
            } else if (typeof node.className['baseVal'] === 'string') {
                // SVG tag .classNames is an SVGAnimatedString instance
                toggleObjectClassPropertyString(node.className, 'baseVal', classNames, shouldHaveClass);
            } else {
                // node.className ought to be a string.
                toggleObjectClassPropertyString(node, 'className', classNames, shouldHaveClass);
            }
        }
    }

    function toggleObjectClassPropertyString(obj, prop, classNames, shouldHaveClass) {
        // obj/prop is either a node/'className' or a SVGAnimatedString/'baseVal'.
        var currentClassNames = obj[prop].match(cssClassNameRegex) || [];
        ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
            ko.utils.addOrRemoveItem(currentClassNames, className, shouldHaveClass);
        });
        obj[prop] = currentClassNames.join(" ");
    }

    return {
        fieldsIncludedWithJsonPost: ['authenticity_token', /^__RequestVerificationToken(_.*)?$/],

        arrayForEach: function (array, action) {
            for (var i = 0, j = array.length; i < j; i++)
                action(array[i], i);
        },

        arrayIndexOf: function (array, item) {
            if (typeof Array.prototype.indexOf == "function")
                return Array.prototype.indexOf.call(array, item);
            for (var i = 0, j = array.length; i < j; i++)
                if (array[i] === item)
                    return i;
            return -1;
        },

        arrayFirst: function (array, predicate, predicateOwner) {
            for (var i = 0, j = array.length; i < j; i++)
                if (predicate.call(predicateOwner, array[i], i))
                    return array[i];
            return null;
        },

        arrayRemoveItem: function (array, itemToRemove) {
            var index = ko.utils.arrayIndexOf(array, itemToRemove);
            if (index > 0) {
                array.splice(index, 1);
            }
            else if (index === 0) {
                array.shift();
            }
        },

        arrayGetDistinctValues: function (array) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++) {
                if (ko.utils.arrayIndexOf(result, array[i]) < 0)
                    result.push(array[i]);
            }
            return result;
        },

        arrayMap: function (array, mapping) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++)
                result.push(mapping(array[i], i));
            return result;
        },

        arrayFilter: function (array, predicate) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++)
                if (predicate(array[i], i))
                    result.push(array[i]);
            return result;
        },

        arrayPushAll: function (array, valuesToPush) {
            if (valuesToPush instanceof Array)
                array.push.apply(array, valuesToPush);
            else
                for (var i = 0, j = valuesToPush.length; i < j; i++)
                    array.push(valuesToPush[i]);
            return array;
        },

        addOrRemoveItem: function(array, value, included) {
            var existingEntryIndex = ko.utils.arrayIndexOf(ko.utils.peekObservable(array), value);
            if (existingEntryIndex < 0) {
                if (included)
                    array.push(value);
            } else {
                if (!included)
                    array.splice(existingEntryIndex, 1);
            }
        },

        canSetPrototype: canSetPrototype,

        extend: extend,

        setPrototypeOf: setPrototypeOf,

        setPrototypeOfOrExtend: canSetPrototype ? setPrototypeOf : extend,

        objectForEach: objectForEach,

        objectMap: function(source, mapping) {
            if (!source)
                return source;
            var target = {};
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = mapping(source[prop], prop, source);
                }
            }
            return target;
        },

        emptyDomNode: function (domNode) {
            while (domNode.firstChild) {
                ko.removeNode(domNode.firstChild);
            }
        },

        moveCleanedNodesToContainerElement: function(nodes) {
            // Ensure it's a real array, as we're about to reparent the nodes and
            // we don't want the underlying collection to change while we're doing that.
            var nodesArray = ko.utils.makeArray(nodes);
            var templateDocument = (nodesArray[0] && nodesArray[0].ownerDocument) || document;

            var container = templateDocument.createElement('div');
            for (var i = 0, j = nodesArray.length; i < j; i++) {
                container.appendChild(ko.cleanNode(nodesArray[i]));
            }
            return container;
        },

        cloneNodes: function (nodesArray, shouldCleanNodes) {
            for (var i = 0, j = nodesArray.length, newNodesArray = []; i < j; i++) {
                var clonedNode = nodesArray[i].cloneNode(true);
                newNodesArray.push(shouldCleanNodes ? ko.cleanNode(clonedNode) : clonedNode);
            }
            return newNodesArray;
        },

        setDomNodeChildren: function (domNode, childNodes) {
            ko.utils.emptyDomNode(domNode);
            if (childNodes) {
                for (var i = 0, j = childNodes.length; i < j; i++)
                    domNode.appendChild(childNodes[i]);
            }
        },

        replaceDomNodes: function (nodeToReplaceOrNodeArray, newNodesArray) {
            var nodesToReplaceArray = nodeToReplaceOrNodeArray.nodeType ? [nodeToReplaceOrNodeArray] : nodeToReplaceOrNodeArray;
            if (nodesToReplaceArray.length > 0) {
                var insertionPoint = nodesToReplaceArray[0];
                var parent = insertionPoint.parentNode;
                for (var i = 0, j = newNodesArray.length; i < j; i++)
                    parent.insertBefore(newNodesArray[i], insertionPoint);
                for (var i = 0, j = nodesToReplaceArray.length; i < j; i++) {
                    ko.removeNode(nodesToReplaceArray[i]);
                }
            }
        },

        fixUpContinuousNodeArray: function(continuousNodeArray, parentNode) {
            // Before acting on a set of nodes that were previously outputted by a template function, we have to reconcile
            // them against what is in the DOM right now. It may be that some of the nodes have already been removed, or that
            // new nodes might have been inserted in the middle, for example by a binding. Also, there may previously have been
            // leading comment nodes (created by rewritten string-based templates) that have since been removed during binding.
            // So, this function translates the old "map" output array into its best guess of the set of current DOM nodes.
            //
            // Rules:
            //   [A] Any leading nodes that have been removed should be ignored
            //       These most likely correspond to memoization nodes that were already removed during binding
            //       See https://github.com/knockout/knockout/pull/440
            //   [B] Any trailing nodes that have been remove should be ignored
            //       This prevents the code here from adding unrelated nodes to the array while processing rule [C]
            //       See https://github.com/knockout/knockout/pull/1903
            //   [C] We want to output a continuous series of nodes. So, ignore any nodes that have already been removed,
            //       and include any nodes that have been inserted among the previous collection

            if (continuousNodeArray.length) {
                // The parent node can be a virtual element; so get the real parent node
                parentNode = (parentNode.nodeType === 8 && parentNode.parentNode) || parentNode;

                // Rule [A]
                while (continuousNodeArray.length && continuousNodeArray[0].parentNode !== parentNode)
                    continuousNodeArray.splice(0, 1);

                // Rule [B]
                while (continuousNodeArray.length > 1 && continuousNodeArray[continuousNodeArray.length - 1].parentNode !== parentNode)
                    continuousNodeArray.length--;

                // Rule [C]
                if (continuousNodeArray.length > 1) {
                    var current = continuousNodeArray[0], last = continuousNodeArray[continuousNodeArray.length - 1];
                    // Replace with the actual new continuous node set
                    continuousNodeArray.length = 0;
                    while (current !== last) {
                        continuousNodeArray.push(current);
                        current = current.nextSibling;
                    }
                    continuousNodeArray.push(last);
                }
            }
            return continuousNodeArray;
        },

        setOptionNodeSelectionState: function (optionNode, isSelected) {
            // IE6 sometimes throws "unknown error" if you try to write to .selected directly, whereas Firefox struggles with setAttribute. Pick one based on browser.
            if (ieVersion < 7)
                optionNode.setAttribute("selected", isSelected);
            else
                optionNode.selected = isSelected;
        },

        stringTrim: function (string) {
            return string === null || string === undefined ? '' :
                string.trim ?
                    string.trim() :
                    string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
        },

        stringStartsWith: function (string, startsWith) {
            string = string || "";
            if (startsWith.length > string.length)
                return false;
            return string.substring(0, startsWith.length) === startsWith;
        },

        domNodeIsContainedBy: function (node, containedByNode) {
            if (node === containedByNode)
                return true;
            if (node.nodeType === 11)
                return false; // Fixes issue #1162 - can't use node.contains for document fragments on IE8
            if (containedByNode.contains)
                return containedByNode.contains(node.nodeType === 3 ? node.parentNode : node);
            if (containedByNode.compareDocumentPosition)
                return (containedByNode.compareDocumentPosition(node) & 16) == 16;
            while (node && node != containedByNode) {
                node = node.parentNode;
            }
            return !!node;
        },

        domNodeIsAttachedToDocument: function (node) {
            return ko.utils.domNodeIsContainedBy(node, node.ownerDocument.documentElement);
        },

        anyDomNodeIsAttachedToDocument: function(nodes) {
            return !!ko.utils.arrayFirst(nodes, ko.utils.domNodeIsAttachedToDocument);
        },

        tagNameLower: function(element) {
            // For HTML elements, tagName will always be upper case; for XHTML elements, it'll be lower case.
            // Possible future optimization: If we know it's an element from an XHTML document (not HTML),
            // we don't need to do the .toLowerCase() as it will always be lower case anyway.
            return element && element.tagName && element.tagName.toLowerCase();
        },

        catchFunctionErrors: function (delegate) {
            return ko['onError'] ? function () {
                try {
                    return delegate.apply(this, arguments);
                } catch (e) {
                    ko['onError'] && ko['onError'](e);
                    throw e;
                }
            } : delegate;
        },

        setTimeout: function (handler, timeout) {
            return setTimeout(ko.utils.catchFunctionErrors(handler), timeout);
        },

        deferError: function (error) {
            setTimeout(function () {
                ko['onError'] && ko['onError'](error);
                throw error;
            }, 0);
        },

        registerEventHandler: function (element, eventType, handler) {
            var wrappedHandler = ko.utils.catchFunctionErrors(handler);

            var mustUseAttachEvent = ieVersion && eventsThatMustBeRegisteredUsingAttachEvent[eventType];
            if (!ko.options['useOnlyNativeEvents'] && !mustUseAttachEvent && jQueryInstance) {
                jQueryInstance(element)['bind'](eventType, wrappedHandler);
            } else if (!mustUseAttachEvent && typeof element.addEventListener == "function")
                element.addEventListener(eventType, wrappedHandler, false);
            else if (typeof element.attachEvent != "undefined") {
                var attachEventHandler = function (event) { wrappedHandler.call(element, event); },
                    attachEventName = "on" + eventType;
                element.attachEvent(attachEventName, attachEventHandler);

                // IE does not dispose attachEvent handlers automatically (unlike with addEventListener)
                // so to avoid leaks, we have to remove them manually. See bug #856
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    element.detachEvent(attachEventName, attachEventHandler);
                });
            } else
                throw new Error("Browser doesn't support addEventListener or attachEvent");
        },

        triggerEvent: function (element, eventType) {
            if (!(element && element.nodeType))
                throw new Error("element must be a DOM node when calling triggerEvent");

            // For click events on checkboxes and radio buttons, jQuery toggles the element checked state *after* the
            // event handler runs instead of *before*. (This was fixed in 1.9 for checkboxes but not for radio buttons.)
            // IE doesn't change the checked state when you trigger the click event using "fireEvent".
            // In both cases, we'll use the click method instead.
            var useClickWorkaround = isClickOnCheckableElement(element, eventType);

            if (!ko.options['useOnlyNativeEvents'] && jQueryInstance && !useClickWorkaround) {
                jQueryInstance(element)['trigger'](eventType);
            } else if (typeof document.createEvent == "function") {
                if (typeof element.dispatchEvent == "function") {
                    var eventCategory = knownEventTypesByEventName[eventType] || "HTMLEvents";
                    var event = document.createEvent(eventCategory);
                    event.initEvent(eventType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, element);
                    element.dispatchEvent(event);
                }
                else
                    throw new Error("The supplied element doesn't support dispatchEvent");
            } else if (useClickWorkaround && element.click) {
                element.click();
            } else if (typeof element.fireEvent != "undefined") {
                element.fireEvent("on" + eventType);
            } else {
                throw new Error("Browser doesn't support triggering events");
            }
        },

        unwrapObservable: function (value) {
            return ko.isObservable(value) ? value() : value;
        },

        peekObservable: function (value) {
            return ko.isObservable(value) ? value.peek() : value;
        },

        toggleDomNodeCssClass: toggleDomNodeCssClass,

        setTextContent: function(element, textContent) {
            var value = ko.utils.unwrapObservable(textContent);
            if ((value === null) || (value === undefined))
                value = "";

            // We need there to be exactly one child: a text node.
            // If there are no children, more than one, or if it's not a text node,
            // we'll clear everything and create a single text node.
            var innerTextNode = ko.virtualElements.firstChild(element);
            if (!innerTextNode || innerTextNode.nodeType != 3 || ko.virtualElements.nextSibling(innerTextNode)) {
                ko.virtualElements.setDomNodeChildren(element, [element.ownerDocument.createTextNode(value)]);
            } else {
                innerTextNode.data = value;
            }

            ko.utils.forceRefresh(element);
        },

        setElementName: function(element, name) {
            element.name = name;

            // Workaround IE 6/7 issue
            // - https://github.com/SteveSanderson/knockout/issues/197
            // - http://www.matts411.com/post/setting_the_name_attribute_in_ie_dom/
            if (ieVersion <= 7) {
                try {
                    element.mergeAttributes(document.createElement("<input name='" + element.name + "'/>"), false);
                }
                catch(e) {} // For IE9 with doc mode "IE9 Standards" and browser mode "IE9 Compatibility View"
            }
        },

        forceRefresh: function(node) {
            // Workaround for an IE9 rendering bug - https://github.com/SteveSanderson/knockout/issues/209
            if (ieVersion >= 9) {
                // For text nodes and comment nodes (most likely virtual elements), we will have to refresh the container
                var elem = node.nodeType == 1 ? node : node.parentNode;
                if (elem.style)
                    elem.style.zoom = elem.style.zoom;
            }
        },

        ensureSelectElementIsRenderedCorrectly: function(selectElement) {
            // Workaround for IE9 rendering bug - it doesn't reliably display all the text in dynamically-added select boxes unless you force it to re-render by updating the width.
            // (See https://github.com/SteveSanderson/knockout/issues/312, http://stackoverflow.com/questions/5908494/select-only-shows-first-char-of-selected-option)
            // Also fixes IE7 and IE8 bug that causes selects to be zero width if enclosed by 'if' or 'with'. (See issue #839)
            if (ieVersion) {
                var originalWidth = selectElement.style.width;
                selectElement.style.width = 0;
                selectElement.style.width = originalWidth;
            }
        },

        range: function (min, max) {
            min = ko.utils.unwrapObservable(min);
            max = ko.utils.unwrapObservable(max);
            var result = [];
            for (var i = min; i <= max; i++)
                result.push(i);
            return result;
        },

        makeArray: function(arrayLikeObject) {
            var result = [];
            for (var i = 0, j = arrayLikeObject.length; i < j; i++) {
                result.push(arrayLikeObject[i]);
            };
            return result;
        },

        createSymbolOrString: function(identifier) {
            return canUseSymbols ? Symbol(identifier) : identifier;
        },

        isIe6 : isIe6,
        isIe7 : isIe7,
        ieVersion : ieVersion,

        getFormFields: function(form, fieldName) {
            var fields = ko.utils.makeArray(form.getElementsByTagName("input")).concat(ko.utils.makeArray(form.getElementsByTagName("textarea")));
            var isMatchingField = (typeof fieldName == 'string')
                ? function(field) { return field.name === fieldName }
                : function(field) { return fieldName.test(field.name) }; // Treat fieldName as regex or object containing predicate
            var matches = [];
            for (var i = fields.length - 1; i >= 0; i--) {
                if (isMatchingField(fields[i]))
                    matches.push(fields[i]);
            };
            return matches;
        },

        parseJson: function (jsonString) {
            if (typeof jsonString == "string") {
                jsonString = ko.utils.stringTrim(jsonString);
                if (jsonString) {
                    if (JSON && JSON.parse) // Use native parsing where available
                        return JSON.parse(jsonString);
                    return (new Function("return " + jsonString))(); // Fallback on less safe parsing for older browsers
                }
            }
            return null;
        },

        stringifyJson: function (data, replacer, space) {   // replacer and space are optional
            if (!JSON || !JSON.stringify)
                throw new Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
            return JSON.stringify(ko.utils.unwrapObservable(data), replacer, space);
        },

        postJson: function (urlOrForm, data, options) {
            options = options || {};
            var params = options['params'] || {};
            var includeFields = options['includeFields'] || this.fieldsIncludedWithJsonPost;
            var url = urlOrForm;

            // If we were given a form, use its 'action' URL and pick out any requested field values
            if((typeof urlOrForm == 'object') && (ko.utils.tagNameLower(urlOrForm) === "form")) {
                var originalForm = urlOrForm;
                url = originalForm.action;
                for (var i = includeFields.length - 1; i >= 0; i--) {
                    var fields = ko.utils.getFormFields(originalForm, includeFields[i]);
                    for (var j = fields.length - 1; j >= 0; j--)
                        params[fields[j].name] = fields[j].value;
                }
            }

            data = ko.utils.unwrapObservable(data);
            var form = document.createElement("form");
            form.style.display = "none";
            form.action = url;
            form.method = "post";
            for (var key in data) {
                // Since 'data' this is a model object, we include all properties including those inherited from its prototype
                var input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = ko.utils.stringifyJson(ko.utils.unwrapObservable(data[key]));
                form.appendChild(input);
            }
            objectForEach(params, function(key, value) {
                var input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });
            document.body.appendChild(form);
            options['submitter'] ? options['submitter'](form) : form.submit();
            setTimeout(function () { form.parentNode.removeChild(form); }, 0);
        }
    }
}());

ko.exportSymbol('utils', ko.utils);
ko.exportSymbol('utils.arrayForEach', ko.utils.arrayForEach);
ko.exportSymbol('utils.arrayFirst', ko.utils.arrayFirst);
ko.exportSymbol('utils.arrayFilter', ko.utils.arrayFilter);
ko.exportSymbol('utils.arrayGetDistinctValues', ko.utils.arrayGetDistinctValues);
ko.exportSymbol('utils.arrayIndexOf', ko.utils.arrayIndexOf);
ko.exportSymbol('utils.arrayMap', ko.utils.arrayMap);
ko.exportSymbol('utils.arrayPushAll', ko.utils.arrayPushAll);
ko.exportSymbol('utils.arrayRemoveItem', ko.utils.arrayRemoveItem);
ko.exportSymbol('utils.extend', ko.utils.extend);
ko.exportSymbol('utils.fieldsIncludedWithJsonPost', ko.utils.fieldsIncludedWithJsonPost);
ko.exportSymbol('utils.getFormFields', ko.utils.getFormFields);
ko.exportSymbol('utils.peekObservable', ko.utils.peekObservable);
ko.exportSymbol('utils.postJson', ko.utils.postJson);
ko.exportSymbol('utils.parseJson', ko.utils.parseJson);
ko.exportSymbol('utils.registerEventHandler', ko.utils.registerEventHandler);
ko.exportSymbol('utils.stringifyJson', ko.utils.stringifyJson);
ko.exportSymbol('utils.range', ko.utils.range);
ko.exportSymbol('utils.toggleDomNodeCssClass', ko.utils.toggleDomNodeCssClass);
ko.exportSymbol('utils.triggerEvent', ko.utils.triggerEvent);
ko.exportSymbol('utils.unwrapObservable', ko.utils.unwrapObservable);
ko.exportSymbol('utils.objectForEach', ko.utils.objectForEach);
ko.exportSymbol('utils.addOrRemoveItem', ko.utils.addOrRemoveItem);
ko.exportSymbol('utils.setTextContent', ko.utils.setTextContent);
ko.exportSymbol('unwrap', ko.utils.unwrapObservable); // Convenient shorthand, because this is used so commonly

if (!Function.prototype['bind']) {
    // Function.prototype.bind is a standard part of ECMAScript 5th Edition (December 2009, http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf)
    // In case the browser doesn't implement it natively, provide a JavaScript implementation. This implementation is based on the one in prototype.js
    Function.prototype['bind'] = function (object) {
        var originalFunction = this;
        if (arguments.length === 1) {
            return function () {
                return originalFunction.apply(object, arguments);
            };
        } else {
            var partialArgs = Array.prototype.slice.call(arguments, 1);
            return function () {
                var args = partialArgs.slice(0);
                args.push.apply(args, arguments);
                return originalFunction.apply(object, args);
            };
        }
    };
}

ko.utils.domData = new (function () {
    var uniqueId = 0;
    var dataStoreKeyExpandoPropertyName = "__ko__" + (new Date).getTime();
    var dataStore = {};

    function getAll(node, createIfNotFound) {
        var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
        var hasExistingDataStore = dataStoreKey && (dataStoreKey !== "null") && dataStore[dataStoreKey];
        if (!hasExistingDataStore) {
            if (!createIfNotFound)
                return undefined;
            dataStoreKey = node[dataStoreKeyExpandoPropertyName] = "ko" + uniqueId++;
            dataStore[dataStoreKey] = {};
        }
        return dataStore[dataStoreKey];
    }

    return {
        get: function (node, key) {
            var allDataForNode = getAll(node, false);
            return allDataForNode === undefined ? undefined : allDataForNode[key];
        },
        set: function (node, key, value) {
            if (value === undefined) {
                // Make sure we don't actually create a new domData key if we are actually deleting a value
                if (getAll(node, false) === undefined)
                    return;
            }
            var allDataForNode = getAll(node, true);
            allDataForNode[key] = value;
        },
        clear: function (node) {
            var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
            if (dataStoreKey) {
                delete dataStore[dataStoreKey];
                node[dataStoreKeyExpandoPropertyName] = null;
                return true; // Exposing "did clean" flag purely so specs can infer whether things have been cleaned up as intended
            }
            return false;
        },

        nextKey: function () {
            return (uniqueId++) + dataStoreKeyExpandoPropertyName;
        }
    };
})();

ko.exportSymbol('utils.domData', ko.utils.domData);
ko.exportSymbol('utils.domData.clear', ko.utils.domData.clear); // Exporting only so specs can clear up after themselves fully

ko.utils.domNodeDisposal = new (function () {
    var domDataKey = ko.utils.domData.nextKey();
    var cleanableNodeTypes = { 1: true, 8: true, 9: true };       // Element, Comment, Document
    var cleanableNodeTypesWithDescendants = { 1: true, 9: true }; // Element, Document

    function getDisposeCallbacksCollection(node, createIfNotFound) {
        var allDisposeCallbacks = ko.utils.domData.get(node, domDataKey);
        if ((allDisposeCallbacks === undefined) && createIfNotFound) {
            allDisposeCallbacks = [];
            ko.utils.domData.set(node, domDataKey, allDisposeCallbacks);
        }
        return allDisposeCallbacks;
    }
    function destroyCallbacksCollection(node) {
        ko.utils.domData.set(node, domDataKey, undefined);
    }

    function cleanSingleNode(node) {
        // Run all the dispose callbacks
        var callbacks = getDisposeCallbacksCollection(node, false);
        if (callbacks) {
            callbacks = callbacks.slice(0); // Clone, as the array may be modified during iteration (typically, callbacks will remove themselves)
            for (var i = 0; i < callbacks.length; i++)
                callbacks[i](node);
        }

        // Erase the DOM data
        ko.utils.domData.clear(node);

        // Perform cleanup needed by external libraries (currently only jQuery, but can be extended)
        ko.utils.domNodeDisposal["cleanExternalData"](node);

        // Clear any immediate-child comment nodes, as these wouldn't have been found by
        // node.getElementsByTagName("*") in cleanNode() (comment nodes aren't elements)
        if (cleanableNodeTypesWithDescendants[node.nodeType])
            cleanImmediateCommentTypeChildren(node);
    }

    function cleanImmediateCommentTypeChildren(nodeWithChildren) {
        var child, nextChild = nodeWithChildren.firstChild;
        while (child = nextChild) {
            nextChild = child.nextSibling;
            if (child.nodeType === 8)
                cleanSingleNode(child);
        }
    }

    return {
        addDisposeCallback : function(node, callback) {
            if (typeof callback != "function")
                throw new Error("Callback must be a function");
            getDisposeCallbacksCollection(node, true).push(callback);
        },

        removeDisposeCallback : function(node, callback) {
            var callbacksCollection = getDisposeCallbacksCollection(node, false);
            if (callbacksCollection) {
                ko.utils.arrayRemoveItem(callbacksCollection, callback);
                if (callbacksCollection.length == 0)
                    destroyCallbacksCollection(node);
            }
        },

        cleanNode : function(node) {
            // First clean this node, where applicable
            if (cleanableNodeTypes[node.nodeType]) {
                cleanSingleNode(node);

                // ... then its descendants, where applicable
                if (cleanableNodeTypesWithDescendants[node.nodeType]) {
                    // Clone the descendants list in case it changes during iteration
                    var descendants = [];
                    ko.utils.arrayPushAll(descendants, node.getElementsByTagName("*"));
                    for (var i = 0, j = descendants.length; i < j; i++)
                        cleanSingleNode(descendants[i]);
                }
            }
            return node;
        },

        removeNode : function(node) {
            ko.cleanNode(node);
            if (node.parentNode)
                node.parentNode.removeChild(node);
        },

        "cleanExternalData" : function (node) {
            // Special support for jQuery here because it's so commonly used.
            // Many jQuery plugins (including jquery.tmpl) store data using jQuery's equivalent of domData
            // so notify it to tear down any resources associated with the node & descendants here.
            if (jQueryInstance && (typeof jQueryInstance['cleanData'] == "function"))
                jQueryInstance['cleanData']([node]);
        }
    };
})();
ko.cleanNode = ko.utils.domNodeDisposal.cleanNode; // Shorthand name for convenience
ko.removeNode = ko.utils.domNodeDisposal.removeNode; // Shorthand name for convenience
ko.exportSymbol('cleanNode', ko.cleanNode);
ko.exportSymbol('removeNode', ko.removeNode);
ko.exportSymbol('utils.domNodeDisposal', ko.utils.domNodeDisposal);
ko.exportSymbol('utils.domNodeDisposal.addDisposeCallback', ko.utils.domNodeDisposal.addDisposeCallback);
ko.exportSymbol('utils.domNodeDisposal.removeDisposeCallback', ko.utils.domNodeDisposal.removeDisposeCallback);
(function () {
    var none = [0, "", ""],
        table = [1, "<table>", "</table>"],
        tbody = [2, "<table><tbody>", "</tbody></table>"],
        tr = [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        select = [1, "<select multiple='multiple'>", "</select>"],
        lookup = {
            'thead': table,
            'tbody': table,
            'tfoot': table,
            'tr': tbody,
            'td': tr,
            'th': tr,
            'option': select,
            'optgroup': select
        },

        // This is needed for old IE if you're *not* using either jQuery or innerShiv. Doesn't affect other cases.
        mayRequireCreateElementHack = ko.utils.ieVersion <= 8;

    function getWrap(tags) {
        var m = tags.match(/^<([a-z]+)[ >]/);
        return (m && lookup[m[1]]) || none;
    }

    function simpleHtmlParse(html, documentContext) {
        documentContext || (documentContext = document);
        var windowContext = documentContext['parentWindow'] || documentContext['defaultView'] || window;

        // Based on jQuery's "clean" function, but only accounting for table-related elements.
        // If you have referenced jQuery, this won't be used anyway - KO will use jQuery's "clean" function directly

        // Note that there's still an issue in IE < 9 whereby it will discard comment nodes that are the first child of
        // a descendant node. For example: "<div><!-- mycomment -->abc</div>" will get parsed as "<div>abc</div>"
        // This won't affect anyone who has referenced jQuery, and there's always the workaround of inserting a dummy node
        // (possibly a text node) in front of the comment. So, KO does not attempt to workaround this IE issue automatically at present.

        // Trim whitespace, otherwise indexOf won't work as expected
        var tags = ko.utils.stringTrim(html).toLowerCase(), div = documentContext.createElement("div"),
            wrap = getWrap(tags),
            depth = wrap[0];

        // Go to html and back, then peel off extra wrappers
        // Note that we always prefix with some dummy text, because otherwise, IE<9 will strip out leading comment nodes in descendants. Total madness.
        var markup = "ignored<div>" + wrap[1] + html + wrap[2] + "</div>";
        if (typeof windowContext['innerShiv'] == "function") {
            // Note that innerShiv is deprecated in favour of html5shiv. We should consider adding
            // support for html5shiv (except if no explicit support is needed, e.g., if html5shiv
            // somehow shims the native APIs so it just works anyway)
            div.appendChild(windowContext['innerShiv'](markup));
        } else {
            if (mayRequireCreateElementHack) {
                // The document.createElement('my-element') trick to enable custom elements in IE6-8
                // only works if we assign innerHTML on an element associated with that document.
                documentContext.appendChild(div);
            }

            div.innerHTML = markup;

            if (mayRequireCreateElementHack) {
                div.parentNode.removeChild(div);
            }
        }

        // Move to the right depth
        while (depth--)
            div = div.lastChild;

        return ko.utils.makeArray(div.lastChild.childNodes);
    }

    function jQueryHtmlParse(html, documentContext) {
        // jQuery's "parseHTML" function was introduced in jQuery 1.8.0 and is a documented public API.
        if (jQueryInstance['parseHTML']) {
            return jQueryInstance['parseHTML'](html, documentContext) || []; // Ensure we always return an array and never null
        } else {
            // For jQuery < 1.8.0, we fall back on the undocumented internal "clean" function.
            var elems = jQueryInstance['clean']([html], documentContext);

            // As of jQuery 1.7.1, jQuery parses the HTML by appending it to some dummy parent nodes held in an in-memory document fragment.
            // Unfortunately, it never clears the dummy parent nodes from the document fragment, so it leaks memory over time.
            // Fix this by finding the top-most dummy parent element, and detaching it from its owner fragment.
            if (elems && elems[0]) {
                // Find the top-most parent element that's a direct child of a document fragment
                var elem = elems[0];
                while (elem.parentNode && elem.parentNode.nodeType !== 11 /* i.e., DocumentFragment */)
                    elem = elem.parentNode;
                // ... then detach it
                if (elem.parentNode)
                    elem.parentNode.removeChild(elem);
            }

            return elems;
        }
    }

    ko.utils.parseHtmlFragment = function(html, documentContext) {
        return jQueryInstance ?
            jQueryHtmlParse(html, documentContext) :   // As below, benefit from jQuery's optimisations where possible
            simpleHtmlParse(html, documentContext);  // ... otherwise, this simple logic will do in most common cases.
    };

    ko.utils.setHtml = function(node, html) {
        ko.utils.emptyDomNode(node);

        // There's no legitimate reason to display a stringified observable without unwrapping it, so we'll unwrap it
        html = ko.utils.unwrapObservable(html);

        if ((html !== null) && (html !== undefined)) {
            if (typeof html != 'string')
                html = html.toString();

            // jQuery contains a lot of sophisticated code to parse arbitrary HTML fragments,
            // for example <tr> elements which are not normally allowed to exist on their own.
            // If you've referenced jQuery we'll use that rather than duplicating its code.
            if (jQueryInstance) {
                jQueryInstance(node)['html'](html);
            } else {
                // ... otherwise, use KO's own parsing logic.
                var parsedNodes = ko.utils.parseHtmlFragment(html, node.ownerDocument);
                for (var i = 0; i < parsedNodes.length; i++)
                    node.appendChild(parsedNodes[i]);
            }
        }
    };
})();

ko.exportSymbol('utils.parseHtmlFragment', ko.utils.parseHtmlFragment);
ko.exportSymbol('utils.setHtml', ko.utils.setHtml);

ko.memoization = (function () {
    var memos = {};

    function randomMax8HexChars() {
        return (((1 + Math.random()) * 0x100000000) | 0).toString(16).substring(1);
    }
    function generateRandomId() {
        return randomMax8HexChars() + randomMax8HexChars();
    }
    function findMemoNodes(rootNode, appendToArray) {
        if (!rootNode)
            return;
        if (rootNode.nodeType == 8) {
            var memoId = ko.memoization.parseMemoText(rootNode.nodeValue);
            if (memoId != null)
                appendToArray.push({ domNode: rootNode, memoId: memoId });
        } else if (rootNode.nodeType == 1) {
            for (var i = 0, childNodes = rootNode.childNodes, j = childNodes.length; i < j; i++)
                findMemoNodes(childNodes[i], appendToArray);
        }
    }

    return {
        memoize: function (callback) {
            if (typeof callback != "function")
                throw new Error("You can only pass a function to ko.memoization.memoize()");
            var memoId = generateRandomId();
            memos[memoId] = callback;
            return "<!--[ko_memo:" + memoId + "]-->";
        },

        unmemoize: function (memoId, callbackParams) {
            var callback = memos[memoId];
            if (callback === undefined)
                throw new Error("Couldn't find any memo with ID " + memoId + ". Perhaps it's already been unmemoized.");
            try {
                callback.apply(null, callbackParams || []);
                return true;
            }
            finally { delete memos[memoId]; }
        },

        unmemoizeDomNodeAndDescendants: function (domNode, extraCallbackParamsArray) {
            var memos = [];
            findMemoNodes(domNode, memos);
            for (var i = 0, j = memos.length; i < j; i++) {
                var node = memos[i].domNode;
                var combinedParams = [node];
                if (extraCallbackParamsArray)
                    ko.utils.arrayPushAll(combinedParams, extraCallbackParamsArray);
                ko.memoization.unmemoize(memos[i].memoId, combinedParams);
                node.nodeValue = ""; // Neuter this node so we don't try to unmemoize it again
                if (node.parentNode)
                    node.parentNode.removeChild(node); // If possible, erase it totally (not always possible - someone else might just hold a reference to it then call unmemoizeDomNodeAndDescendants again)
            }
        },

        parseMemoText: function (memoText) {
            var match = memoText.match(/^\[ko_memo\:(.*?)\]$/);
            return match ? match[1] : null;
        }
    };
})();

ko.exportSymbol('memoization', ko.memoization);
ko.exportSymbol('memoization.memoize', ko.memoization.memoize);
ko.exportSymbol('memoization.unmemoize', ko.memoization.unmemoize);
ko.exportSymbol('memoization.parseMemoText', ko.memoization.parseMemoText);
ko.exportSymbol('memoization.unmemoizeDomNodeAndDescendants', ko.memoization.unmemoizeDomNodeAndDescendants);
ko.tasks = (function () {
    var scheduler,
        taskQueue = [],
        taskQueueLength = 0,
        nextHandle = 1,
        nextIndexToProcess = 0;

    if (window['MutationObserver']) {
        // Chrome 27+, Firefox 14+, IE 11+, Opera 15+, Safari 6.1+
        // From https://github.com/petkaantonov/bluebird * Copyright (c) 2014 Petka Antonov * License: MIT
        scheduler = (function (callback) {
            var div = document.createElement("div");
            new MutationObserver(callback).observe(div, {attributes: true});
            return function () { div.classList.toggle("foo"); };
        })(scheduledProcess);
    } else if (document && "onreadystatechange" in document.createElement("script")) {
        // IE 6-10
        // From https://github.com/YuzuJS/setImmediate * Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola * License: MIT
        scheduler = function (callback) {
            var script = document.createElement("script");
            script.onreadystatechange = function () {
                script.onreadystatechange = null;
                document.documentElement.removeChild(script);
                script = null;
                callback();
            };
            document.documentElement.appendChild(script);
        };
    } else {
        scheduler = function (callback) {
            setTimeout(callback, 0);
        };
    }

    function processTasks() {
        if (taskQueueLength) {
            // Each mark represents the end of a logical group of tasks and the number of these groups is
            // limited to prevent unchecked recursion.
            var mark = taskQueueLength, countMarks = 0;

            // nextIndexToProcess keeps track of where we are in the queue; processTasks can be called recursively without issue
            for (var task; nextIndexToProcess < taskQueueLength; ) {
                if (task = taskQueue[nextIndexToProcess++]) {
                    if (nextIndexToProcess > mark) {
                        if (++countMarks >= 5000) {
                            nextIndexToProcess = taskQueueLength;   // skip all tasks remaining in the queue since any of them could be causing the recursion
                            ko.utils.deferError(Error("'Too much recursion' after processing " + countMarks + " task groups."));
                            break;
                        }
                        mark = taskQueueLength;
                    }
                    try {
                        task();
                    } catch (ex) {
                        ko.utils.deferError(ex);
                    }
                }
            }
        }
    }

    function scheduledProcess() {
        processTasks();

        // Reset the queue
        nextIndexToProcess = taskQueueLength = taskQueue.length = 0;
    }

    function scheduleTaskProcessing() {
        ko.tasks['scheduler'](scheduledProcess);
    }

    var tasks = {
        'scheduler': scheduler,     // Allow overriding the scheduler

        schedule: function (func) {
            if (!taskQueueLength) {
                scheduleTaskProcessing();
            }

            taskQueue[taskQueueLength++] = func;
            return nextHandle++;
        },

        cancel: function (handle) {
            var index = handle - (nextHandle - taskQueueLength);
            if (index >= nextIndexToProcess && index < taskQueueLength) {
                taskQueue[index] = null;
            }
        },

        // For testing only: reset the queue and return the previous queue length
        'resetForTesting': function () {
            var length = taskQueueLength - nextIndexToProcess;
            nextIndexToProcess = taskQueueLength = taskQueue.length = 0;
            return length;
        },

        runEarly: processTasks
    };

    return tasks;
})();

ko.exportSymbol('tasks', ko.tasks);
ko.exportSymbol('tasks.schedule', ko.tasks.schedule);
//ko.exportSymbol('tasks.cancel', ko.tasks.cancel);  "cancel" isn't minified
ko.exportSymbol('tasks.runEarly', ko.tasks.runEarly);
ko.extenders = {
    'throttle': function(target, timeout) {
        // Throttling means two things:

        // (1) For dependent observables, we throttle *evaluations* so that, no matter how fast its dependencies
        //     notify updates, the target doesn't re-evaluate (and hence doesn't notify) faster than a certain rate
        target['throttleEvaluation'] = timeout;

        // (2) For writable targets (observables, or writable dependent observables), we throttle *writes*
        //     so the target cannot change value synchronously or faster than a certain rate
        var writeTimeoutInstance = null;
        return ko.dependentObservable({
            'read': target,
            'write': function(value) {
                clearTimeout(writeTimeoutInstance);
                writeTimeoutInstance = ko.utils.setTimeout(function() {
                    target(value);
                }, timeout);
            }
        });
    },

    'rateLimit': function(target, options) {
        var timeout, method, limitFunction;

        if (typeof options == 'number') {
            timeout = options;
        } else {
            timeout = options['timeout'];
            method = options['method'];
        }

        // rateLimit supersedes deferred updates
        target._deferUpdates = false;

        limitFunction = method == 'notifyWhenChangesStop' ?  debounce : throttle;
        target.limit(function(callback) {
            return limitFunction(callback, timeout);
        });
    },

    'deferred': function(target, options) {
        if (options !== true) {
            throw new Error('The \'deferred\' extender only accepts the value \'true\', because it is not supported to turn deferral off once enabled.')
        }

        if (!target._deferUpdates) {
            target._deferUpdates = true;
            target.limit(function (callback) {
                var handle,
                    ignoreUpdates = false;
                return function () {
                    if (!ignoreUpdates) {
                        ko.tasks.cancel(handle);
                        handle = ko.tasks.schedule(callback);

                        try {
                            ignoreUpdates = true;
                            target['notifySubscribers'](undefined, 'dirty');
                        } finally {
                            ignoreUpdates = false;
                        }
                    }
                };
            });
        }
    },

    'notify': function(target, notifyWhen) {
        target["equalityComparer"] = notifyWhen == "always" ?
            null :  // null equalityComparer means to always notify
            valuesArePrimitiveAndEqual;
    }
};

var primitiveTypes = { 'undefined':1, 'boolean':1, 'number':1, 'string':1 };
function valuesArePrimitiveAndEqual(a, b) {
    var oldValueIsPrimitive = (a === null) || (typeof(a) in primitiveTypes);
    return oldValueIsPrimitive ? (a === b) : false;
}

function throttle(callback, timeout) {
    var timeoutInstance;
    return function () {
        if (!timeoutInstance) {
            timeoutInstance = ko.utils.setTimeout(function () {
                timeoutInstance = undefined;
                callback();
            }, timeout);
        }
    };
}

function debounce(callback, timeout) {
    var timeoutInstance;
    return function () {
        clearTimeout(timeoutInstance);
        timeoutInstance = ko.utils.setTimeout(callback, timeout);
    };
}

function applyExtenders(requestedExtenders) {
    var target = this;
    if (requestedExtenders) {
        ko.utils.objectForEach(requestedExtenders, function(key, value) {
            var extenderHandler = ko.extenders[key];
            if (typeof extenderHandler == 'function') {
                target = extenderHandler(target, value) || target;
            }
        });
    }
    return target;
}

ko.exportSymbol('extenders', ko.extenders);

ko.subscription = function (target, callback, disposeCallback) {
    this._target = target;
    this.callback = callback;
    this.disposeCallback = disposeCallback;
    this.isDisposed = false;
    ko.exportProperty(this, 'dispose', this.dispose);
};
ko.subscription.prototype.dispose = function () {
    this.isDisposed = true;
    this.disposeCallback();
};

ko.subscribable = function () {
    ko.utils.setPrototypeOfOrExtend(this, ko_subscribable_fn);
    ko_subscribable_fn.init(this);
}

var defaultEvent = "change";

// Moved out of "limit" to avoid the extra closure
function limitNotifySubscribers(value, event) {
    if (!event || event === defaultEvent) {
        this._limitChange(value);
    } else if (event === 'beforeChange') {
        this._limitBeforeChange(value);
    } else {
        this._origNotifySubscribers(value, event);
    }
}

var ko_subscribable_fn = {
    init: function(instance) {
        instance._subscriptions = { "change": [] };
        instance._versionNumber = 1;
    },

    subscribe: function (callback, callbackTarget, event) {
        var self = this;

        event = event || defaultEvent;
        var boundCallback = callbackTarget ? callback.bind(callbackTarget) : callback;

        var subscription = new ko.subscription(self, boundCallback, function () {
            ko.utils.arrayRemoveItem(self._subscriptions[event], subscription);
            if (self.afterSubscriptionRemove)
                self.afterSubscriptionRemove(event);
        });

        if (self.beforeSubscriptionAdd)
            self.beforeSubscriptionAdd(event);

        if (!self._subscriptions[event])
            self._subscriptions[event] = [];
        self._subscriptions[event].push(subscription);

        return subscription;
    },

    "notifySubscribers": function (valueToNotify, event) {
        event = event || defaultEvent;
        if (event === defaultEvent) {
            this.updateVersion();
        }
        if (this.hasSubscriptionsForEvent(event)) {
            var subs = event === defaultEvent && this._changeSubscriptions || this._subscriptions[event].slice(0);
            try {
                ko.dependencyDetection.begin(); // Begin suppressing dependency detection (by setting the top frame to undefined)
                for (var i = 0, subscription; subscription = subs[i]; ++i) {
                    // In case a subscription was disposed during the arrayForEach cycle, check
                    // for isDisposed on each subscription before invoking its callback
                    if (!subscription.isDisposed)
                        subscription.callback(valueToNotify);
                }
            } finally {
                ko.dependencyDetection.end(); // End suppressing dependency detection
            }
        }
    },

    getVersion: function () {
        return this._versionNumber;
    },

    hasChanged: function (versionToCheck) {
        return this.getVersion() !== versionToCheck;
    },

    updateVersion: function () {
        ++this._versionNumber;
    },

    limit: function(limitFunction) {
        var self = this, selfIsObservable = ko.isObservable(self),
            ignoreBeforeChange, notifyNextChange, previousValue, pendingValue, beforeChange = 'beforeChange';

        if (!self._origNotifySubscribers) {
            self._origNotifySubscribers = self["notifySubscribers"];
            self["notifySubscribers"] = limitNotifySubscribers;
        }

        var finish = limitFunction(function() {
            self._notificationIsPending = false;

            // If an observable provided a reference to itself, access it to get the latest value.
            // This allows computed observables to delay calculating their value until needed.
            if (selfIsObservable && pendingValue === self) {
                pendingValue = self._evalIfChanged ? self._evalIfChanged() : self();
            }
            var shouldNotify = notifyNextChange || self.isDifferent(previousValue, pendingValue);

            notifyNextChange = ignoreBeforeChange = false;

            if (shouldNotify) {
                self._origNotifySubscribers(previousValue = pendingValue);
            }
        });

        self._limitChange = function(value) {
            self._changeSubscriptions = self._subscriptions[defaultEvent].slice(0);
            self._notificationIsPending = ignoreBeforeChange = true;
            pendingValue = value;
            finish();
        };
        self._limitBeforeChange = function(value) {
            if (!ignoreBeforeChange) {
                previousValue = value;
                self._origNotifySubscribers(value, beforeChange);
            }
        };
        self._notifyNextChangeIfValueIsDifferent = function() {
            if (self.isDifferent(previousValue, self.peek(true /*evaluate*/))) {
                notifyNextChange = true;
            }
        };
    },

    hasSubscriptionsForEvent: function(event) {
        return this._subscriptions[event] && this._subscriptions[event].length;
    },

    getSubscriptionsCount: function (event) {
        if (event) {
            return this._subscriptions[event] && this._subscriptions[event].length || 0;
        } else {
            var total = 0;
            ko.utils.objectForEach(this._subscriptions, function(eventName, subscriptions) {
                if (eventName !== 'dirty')
                    total += subscriptions.length;
            });
            return total;
        }
    },

    isDifferent: function(oldValue, newValue) {
        return !this['equalityComparer'] || !this['equalityComparer'](oldValue, newValue);
    },

    extend: applyExtenders
};

ko.exportProperty(ko_subscribable_fn, 'subscribe', ko_subscribable_fn.subscribe);
ko.exportProperty(ko_subscribable_fn, 'extend', ko_subscribable_fn.extend);
ko.exportProperty(ko_subscribable_fn, 'getSubscriptionsCount', ko_subscribable_fn.getSubscriptionsCount);

// For browsers that support proto assignment, we overwrite the prototype of each
// observable instance. Since observables are functions, we need Function.prototype
// to still be in the prototype chain.
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(ko_subscribable_fn, Function.prototype);
}

ko.subscribable['fn'] = ko_subscribable_fn;


ko.isSubscribable = function (instance) {
    return instance != null && typeof instance.subscribe == "function" && typeof instance["notifySubscribers"] == "function";
};

ko.exportSymbol('subscribable', ko.subscribable);
ko.exportSymbol('isSubscribable', ko.isSubscribable);

ko.computedContext = ko.dependencyDetection = (function () {
    var outerFrames = [],
        currentFrame,
        lastId = 0;

    // Return a unique ID that can be assigned to an observable for dependency tracking.
    // Theoretically, you could eventually overflow the number storage size, resulting
    // in duplicate IDs. But in JavaScript, the largest exact integral value is 2^53
    // or 9,007,199,254,740,992. If you created 1,000,000 IDs per second, it would
    // take over 285 years to reach that number.
    // Reference http://blog.vjeux.com/2010/javascript/javascript-max_int-number-limits.html
    function getId() {
        return ++lastId;
    }

    function begin(options) {
        outerFrames.push(currentFrame);
        currentFrame = options;
    }

    function end() {
        currentFrame = outerFrames.pop();
    }

    return {
        begin: begin,

        end: end,

        registerDependency: function (subscribable) {
            if (currentFrame) {
                if (!ko.isSubscribable(subscribable))
                    throw new Error("Only subscribable things can act as dependencies");
                currentFrame.callback.call(currentFrame.callbackTarget, subscribable, subscribable._id || (subscribable._id = getId()));
            }
        },

        ignore: function (callback, callbackTarget, callbackArgs) {
            try {
                begin();
                return callback.apply(callbackTarget, callbackArgs || []);
            } finally {
                end();
            }
        },

        getDependenciesCount: function () {
            if (currentFrame)
                return currentFrame.computed.getDependenciesCount();
        },

        isInitial: function() {
            if (currentFrame)
                return currentFrame.isInitial;
        }
    };
})();

ko.exportSymbol('computedContext', ko.computedContext);
ko.exportSymbol('computedContext.getDependenciesCount', ko.computedContext.getDependenciesCount);
ko.exportSymbol('computedContext.isInitial', ko.computedContext.isInitial);

ko.exportSymbol('ignoreDependencies', ko.ignoreDependencies = ko.dependencyDetection.ignore);
var observableLatestValue = ko.utils.createSymbolOrString('_latestValue');

ko.observable = function (initialValue) {
    function observable() {
        if (arguments.length > 0) {
            // Write

            // Ignore writes if the value hasn't changed
            if (observable.isDifferent(observable[observableLatestValue], arguments[0])) {
                observable.valueWillMutate();
                observable[observableLatestValue] = arguments[0];
                observable.valueHasMutated();
            }
            return this; // Permits chained assignments
        }
        else {
            // Read
            ko.dependencyDetection.registerDependency(observable); // The caller only needs to be notified of changes if they did a "read" operation
            return observable[observableLatestValue];
        }
    }

    observable[observableLatestValue] = initialValue;

    // Inherit from 'subscribable'
    if (!ko.utils.canSetPrototype) {
        // 'subscribable' won't be on the prototype chain unless we put it there directly
        ko.utils.extend(observable, ko.subscribable['fn']);
    }
    ko.subscribable['fn'].init(observable);

    // Inherit from 'observable'
    ko.utils.setPrototypeOfOrExtend(observable, observableFn);

    if (ko.options['deferUpdates']) {
        ko.extenders['deferred'](observable, true);
    }

    return observable;
}

// Define prototype for observables
var observableFn = {
    'equalityComparer': valuesArePrimitiveAndEqual,
    peek: function() { return this[observableLatestValue]; },
    valueHasMutated: function () { this['notifySubscribers'](this[observableLatestValue]); },
    valueWillMutate: function () { this['notifySubscribers'](this[observableLatestValue], 'beforeChange'); }
};

// Note that for browsers that don't support proto assignment, the
// inheritance chain is created manually in the ko.observable constructor
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(observableFn, ko.subscribable['fn']);
}

var protoProperty = ko.observable.protoProperty = '__ko_proto__';
observableFn[protoProperty] = ko.observable;

ko.hasPrototype = function(instance, prototype) {
    if ((instance === null) || (instance === undefined) || (instance[protoProperty] === undefined)) return false;
    if (instance[protoProperty] === prototype) return true;
    return ko.hasPrototype(instance[protoProperty], prototype); // Walk the prototype chain
};

ko.isObservable = function (instance) {
    return ko.hasPrototype(instance, ko.observable);
}
ko.isWriteableObservable = function (instance) {
    // Observable
    if ((typeof instance == 'function') && instance[protoProperty] === ko.observable)
        return true;
    // Writeable dependent observable
    if ((typeof instance == 'function') && (instance[protoProperty] === ko.dependentObservable) && (instance.hasWriteFunction))
        return true;
    // Anything else
    return false;
}

ko.exportSymbol('observable', ko.observable);
ko.exportSymbol('isObservable', ko.isObservable);
ko.exportSymbol('isWriteableObservable', ko.isWriteableObservable);
ko.exportSymbol('isWritableObservable', ko.isWriteableObservable);
ko.exportSymbol('observable.fn', observableFn);
ko.exportProperty(observableFn, 'peek', observableFn.peek);
ko.exportProperty(observableFn, 'valueHasMutated', observableFn.valueHasMutated);
ko.exportProperty(observableFn, 'valueWillMutate', observableFn.valueWillMutate);
ko.observableArray = function (initialValues) {
    initialValues = initialValues || [];

    if (typeof initialValues != 'object' || !('length' in initialValues))
        throw new Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");

    var result = ko.observable(initialValues);
    ko.utils.setPrototypeOfOrExtend(result, ko.observableArray['fn']);
    return result.extend({'trackArrayChanges':true});
};

ko.observableArray['fn'] = {
    'remove': function (valueOrPredicate) {
        var underlyingArray = this.peek();
        var removedValues = [];
        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
        for (var i = 0; i < underlyingArray.length; i++) {
            var value = underlyingArray[i];
            if (predicate(value)) {
                if (removedValues.length === 0) {
                    this.valueWillMutate();
                }
                removedValues.push(value);
                underlyingArray.splice(i, 1);
                i--;
            }
        }
        if (removedValues.length) {
            this.valueHasMutated();
        }
        return removedValues;
    },

    'removeAll': function (arrayOfValues) {
        // If you passed zero args, we remove everything
        if (arrayOfValues === undefined) {
            var underlyingArray = this.peek();
            var allValues = underlyingArray.slice(0);
            this.valueWillMutate();
            underlyingArray.splice(0, underlyingArray.length);
            this.valueHasMutated();
            return allValues;
        }
        // If you passed an arg, we interpret it as an array of entries to remove
        if (!arrayOfValues)
            return [];
        return this['remove'](function (value) {
            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
        });
    },

    'destroy': function (valueOrPredicate) {
        var underlyingArray = this.peek();
        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
        this.valueWillMutate();
        for (var i = underlyingArray.length - 1; i >= 0; i--) {
            var value = underlyingArray[i];
            if (predicate(value))
                underlyingArray[i]["_destroy"] = true;
        }
        this.valueHasMutated();
    },

    'destroyAll': function (arrayOfValues) {
        // If you passed zero args, we destroy everything
        if (arrayOfValues === undefined)
            return this['destroy'](function() { return true });

        // If you passed an arg, we interpret it as an array of entries to destroy
        if (!arrayOfValues)
            return [];
        return this['destroy'](function (value) {
            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
        });
    },

    'indexOf': function (item) {
        var underlyingArray = this();
        return ko.utils.arrayIndexOf(underlyingArray, item);
    },

    'replace': function(oldItem, newItem) {
        var index = this['indexOf'](oldItem);
        if (index >= 0) {
            this.valueWillMutate();
            this.peek()[index] = newItem;
            this.valueHasMutated();
        }
    }
};

// Note that for browsers that don't support proto assignment, the
// inheritance chain is created manually in the ko.observableArray constructor
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(ko.observableArray['fn'], ko.observable['fn']);
}

// Populate ko.observableArray.fn with read/write functions from native arrays
// Important: Do not add any additional functions here that may reasonably be used to *read* data from the array
// because we'll eval them without causing subscriptions, so ko.computed output could end up getting stale
ko.utils.arrayForEach(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (methodName) {
    ko.observableArray['fn'][methodName] = function () {
        // Use "peek" to avoid creating a subscription in any computed that we're executing in the context of
        // (for consistency with mutating regular observables)
        var underlyingArray = this.peek();
        this.valueWillMutate();
        this.cacheDiffForKnownOperation(underlyingArray, methodName, arguments);
        var methodCallResult = underlyingArray[methodName].apply(underlyingArray, arguments);
        this.valueHasMutated();
        // The native sort and reverse methods return a reference to the array, but it makes more sense to return the observable array instead.
        return methodCallResult === underlyingArray ? this : methodCallResult;
    };
});

// Populate ko.observableArray.fn with read-only functions from native arrays
ko.utils.arrayForEach(["slice"], function (methodName) {
    ko.observableArray['fn'][methodName] = function () {
        var underlyingArray = this();
        return underlyingArray[methodName].apply(underlyingArray, arguments);
    };
});

ko.exportSymbol('observableArray', ko.observableArray);
var arrayChangeEventName = 'arrayChange';
ko.extenders['trackArrayChanges'] = function(target, options) {
    // Use the provided options--each call to trackArrayChanges overwrites the previously set options
    target.compareArrayOptions = {};
    if (options && typeof options == "object") {
        ko.utils.extend(target.compareArrayOptions, options);
    }
    target.compareArrayOptions['sparse'] = true;

    // Only modify the target observable once
    if (target.cacheDiffForKnownOperation) {
        return;
    }
    var trackingChanges = false,
        cachedDiff = null,
        arrayChangeSubscription,
        pendingNotifications = 0,
        underlyingNotifySubscribersFunction,
        underlyingBeforeSubscriptionAddFunction = target.beforeSubscriptionAdd,
        underlyingAfterSubscriptionRemoveFunction = target.afterSubscriptionRemove;

    // Watch "subscribe" calls, and for array change events, ensure change tracking is enabled
    target.beforeSubscriptionAdd = function (event) {
        if (underlyingBeforeSubscriptionAddFunction)
            underlyingBeforeSubscriptionAddFunction.call(target, event);
        if (event === arrayChangeEventName) {
            trackChanges();
        }
    };
    // Watch "dispose" calls, and for array change events, ensure change tracking is disabled when all are disposed
    target.afterSubscriptionRemove = function (event) {
        if (underlyingAfterSubscriptionRemoveFunction)
            underlyingAfterSubscriptionRemoveFunction.call(target, event);
        if (event === arrayChangeEventName && !target.hasSubscriptionsForEvent(arrayChangeEventName)) {
            if (underlyingNotifySubscribersFunction) {
                target['notifySubscribers'] = underlyingNotifySubscribersFunction;
                underlyingNotifySubscribersFunction = undefined;
            }
            arrayChangeSubscription.dispose();
            trackingChanges = false;
        }
    };

    function trackChanges() {
        // Calling 'trackChanges' multiple times is the same as calling it once
        if (trackingChanges) {
            return;
        }

        trackingChanges = true;

        // Intercept "notifySubscribers" to track how many times it was called.
        underlyingNotifySubscribersFunction = target['notifySubscribers'];
        target['notifySubscribers'] = function(valueToNotify, event) {
            if (!event || event === defaultEvent) {
                ++pendingNotifications;
            }
            return underlyingNotifySubscribersFunction.apply(this, arguments);
        };

        // Each time the array changes value, capture a clone so that on the next
        // change it's possible to produce a diff
        var previousContents = [].concat(target.peek() || []);
        cachedDiff = null;
        arrayChangeSubscription = target.subscribe(function(currentContents) {
            // Make a copy of the current contents and ensure it's an array
            currentContents = [].concat(currentContents || []);

            // Compute the diff and issue notifications, but only if someone is listening
            if (target.hasSubscriptionsForEvent(arrayChangeEventName)) {
                var changes = getChanges(previousContents, currentContents);
            }

            // Eliminate references to the old, removed items, so they can be GCed
            previousContents = currentContents;
            cachedDiff = null;
            pendingNotifications = 0;

            if (changes && changes.length) {
                target['notifySubscribers'](changes, arrayChangeEventName);
            }
        });
    }

    function getChanges(previousContents, currentContents) {
        // We try to re-use cached diffs.
        // The scenarios where pendingNotifications > 1 are when using rate-limiting or the Deferred Updates
        // plugin, which without this check would not be compatible with arrayChange notifications. Normally,
        // notifications are issued immediately so we wouldn't be queueing up more than one.
        if (!cachedDiff || pendingNotifications > 1) {
            cachedDiff = ko.utils.compareArrays(previousContents, currentContents, target.compareArrayOptions);
        }

        return cachedDiff;
    }

    target.cacheDiffForKnownOperation = function(rawArray, operationName, args) {
        // Only run if we're currently tracking changes for this observable array
        // and there aren't any pending deferred notifications.
        if (!trackingChanges || pendingNotifications) {
            return;
        }
        var diff = [],
            arrayLength = rawArray.length,
            argsLength = args.length,
            offset = 0;

        function pushDiff(status, value, index) {
            return diff[diff.length] = { 'status': status, 'value': value, 'index': index };
        }
        switch (operationName) {
            case 'push':
                offset = arrayLength;
            case 'unshift':
                for (var index = 0; index < argsLength; index++) {
                    pushDiff('added', args[index], offset + index);
                }
                break;

            case 'pop':
                offset = arrayLength - 1;
            case 'shift':
                if (arrayLength) {
                    pushDiff('deleted', rawArray[offset], offset);
                }
                break;

            case 'splice':
                // Negative start index means 'from end of array'. After that we clamp to [0...arrayLength].
                // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
                var startIndex = Math.min(Math.max(0, args[0] < 0 ? arrayLength + args[0] : args[0]), arrayLength),
                    endDeleteIndex = argsLength === 1 ? arrayLength : Math.min(startIndex + (args[1] || 0), arrayLength),
                    endAddIndex = startIndex + argsLength - 2,
                    endIndex = Math.max(endDeleteIndex, endAddIndex),
                    additions = [], deletions = [];
                for (var index = startIndex, argsIndex = 2; index < endIndex; ++index, ++argsIndex) {
                    if (index < endDeleteIndex)
                        deletions.push(pushDiff('deleted', rawArray[index], index));
                    if (index < endAddIndex)
                        additions.push(pushDiff('added', args[argsIndex], index));
                }
                ko.utils.findMovesInArrayComparison(deletions, additions);
                break;

            default:
                return;
        }
        cachedDiff = diff;
    };
};
var computedState = ko.utils.createSymbolOrString('_state');

ko.computed = ko.dependentObservable = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget, options) {
    if (typeof evaluatorFunctionOrOptions === "object") {
        // Single-parameter syntax - everything is on this "options" param
        options = evaluatorFunctionOrOptions;
    } else {
        // Multi-parameter syntax - construct the options according to the params passed
        options = options || {};
        if (evaluatorFunctionOrOptions) {
            options["read"] = evaluatorFunctionOrOptions;
        }
    }
    if (typeof options["read"] != "function")
        throw Error("Pass a function that returns the value of the ko.computed");

    var writeFunction = options["write"];
    var state = {
        latestValue: undefined,
        isStale: true,
        isDirty: true,
        isBeingEvaluated: false,
        suppressDisposalUntilDisposeWhenReturnsFalse: false,
        isDisposed: false,
        pure: false,
        isSleeping: false,
        readFunction: options["read"],
        evaluatorFunctionTarget: evaluatorFunctionTarget || options["owner"],
        disposeWhenNodeIsRemoved: options["disposeWhenNodeIsRemoved"] || options.disposeWhenNodeIsRemoved || null,
        disposeWhen: options["disposeWhen"] || options.disposeWhen,
        domNodeDisposalCallback: null,
        dependencyTracking: {},
        dependenciesCount: 0,
        evaluationTimeoutInstance: null
    };

    function computedObservable() {
        if (arguments.length > 0) {
            if (typeof writeFunction === "function") {
                // Writing a value
                writeFunction.apply(state.evaluatorFunctionTarget, arguments);
            } else {
                throw new Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
            }
            return this; // Permits chained assignments
        } else {
            // Reading the value
            ko.dependencyDetection.registerDependency(computedObservable);
            if (state.isDirty || (state.isSleeping && computedObservable.haveDependenciesChanged())) {
                computedObservable.evaluateImmediate();
            }
            return state.latestValue;
        }
    }

    computedObservable[computedState] = state;
    computedObservable.hasWriteFunction = typeof writeFunction === "function";

    // Inherit from 'subscribable'
    if (!ko.utils.canSetPrototype) {
        // 'subscribable' won't be on the prototype chain unless we put it there directly
        ko.utils.extend(computedObservable, ko.subscribable['fn']);
    }
    ko.subscribable['fn'].init(computedObservable);

    // Inherit from 'computed'
    ko.utils.setPrototypeOfOrExtend(computedObservable, computedFn);

    if (options['pure']) {
        state.pure = true;
        state.isSleeping = true;     // Starts off sleeping; will awake on the first subscription
        ko.utils.extend(computedObservable, pureComputedOverrides);
    } else if (options['deferEvaluation']) {
        ko.utils.extend(computedObservable, deferEvaluationOverrides);
    }

    if (ko.options['deferUpdates']) {
        ko.extenders['deferred'](computedObservable, true);
    }

    if (DEBUG) {
        // #1731 - Aid debugging by exposing the computed's options
        computedObservable["_options"] = options;
    }

    if (state.disposeWhenNodeIsRemoved) {
        // Since this computed is associated with a DOM node, and we don't want to dispose the computed
        // until the DOM node is *removed* from the document (as opposed to never having been in the document),
        // we'll prevent disposal until "disposeWhen" first returns false.
        state.suppressDisposalUntilDisposeWhenReturnsFalse = true;

        // disposeWhenNodeIsRemoved: true can be used to opt into the "only dispose after first false result"
        // behaviour even if there's no specific node to watch. In that case, clear the option so we don't try
        // to watch for a non-node's disposal. This technique is intended for KO's internal use only and shouldn't
        // be documented or used by application code, as it's likely to change in a future version of KO.
        if (!state.disposeWhenNodeIsRemoved.nodeType) {
            state.disposeWhenNodeIsRemoved = null;
        }
    }

    // Evaluate, unless sleeping or deferEvaluation is true
    if (!state.isSleeping && !options['deferEvaluation']) {
        computedObservable.evaluateImmediate();
    }

    // Attach a DOM node disposal callback so that the computed will be proactively disposed as soon as the node is
    // removed using ko.removeNode. But skip if isActive is false (there will never be any dependencies to dispose).
    if (state.disposeWhenNodeIsRemoved && computedObservable.isActive()) {
        ko.utils.domNodeDisposal.addDisposeCallback(state.disposeWhenNodeIsRemoved, state.domNodeDisposalCallback = function () {
            computedObservable.dispose();
        });
    }

    return computedObservable;
};

// Utility function that disposes a given dependencyTracking entry
function computedDisposeDependencyCallback(id, entryToDispose) {
    if (entryToDispose !== null && entryToDispose.dispose) {
        entryToDispose.dispose();
    }
}

// This function gets called each time a dependency is detected while evaluating a computed.
// It's factored out as a shared function to avoid creating unnecessary function instances during evaluation.
function computedBeginDependencyDetectionCallback(subscribable, id) {
    var computedObservable = this.computedObservable,
        state = computedObservable[computedState];
    if (!state.isDisposed) {
        if (this.disposalCount && this.disposalCandidates[id]) {
            // Don't want to dispose this subscription, as it's still being used
            computedObservable.addDependencyTracking(id, subscribable, this.disposalCandidates[id]);
            this.disposalCandidates[id] = null; // No need to actually delete the property - disposalCandidates is a transient object anyway
            --this.disposalCount;
        } else if (!state.dependencyTracking[id]) {
            // Brand new subscription - add it
            computedObservable.addDependencyTracking(id, subscribable, state.isSleeping ? { _target: subscribable } : computedObservable.subscribeToDependency(subscribable));
        }
        // If the observable we've accessed has a pending notification, ensure we get notified of the actual final value (bypass equality checks)
        if (subscribable._notificationIsPending) {
            subscribable._notifyNextChangeIfValueIsDifferent();
        }
    }
}

var computedFn = {
    "equalityComparer": valuesArePrimitiveAndEqual,
    getDependenciesCount: function () {
        return this[computedState].dependenciesCount;
    },
    addDependencyTracking: function (id, target, trackingObj) {
        if (this[computedState].pure && target === this) {
            throw Error("A 'pure' computed must not be called recursively");
        }

        this[computedState].dependencyTracking[id] = trackingObj;
        trackingObj._order = this[computedState].dependenciesCount++;
        trackingObj._version = target.getVersion();
    },
    haveDependenciesChanged: function () {
        var id, dependency, dependencyTracking = this[computedState].dependencyTracking;
        for (id in dependencyTracking) {
            if (dependencyTracking.hasOwnProperty(id)) {
                dependency = dependencyTracking[id];
                if ((this._evalDelayed && dependency._target._notificationIsPending) || dependency._target.hasChanged(dependency._version)) {
                    return true;
                }
            }
        }
    },
    markDirty: function () {
        // Process "dirty" events if we can handle delayed notifications
        if (this._evalDelayed && !this[computedState].isBeingEvaluated) {
            this._evalDelayed(false /*isChange*/);
        }
    },
    isActive: function () {
        var state = this[computedState];
        return state.isDirty || state.dependenciesCount > 0;
    },
    respondToChange: function () {
        // Ignore "change" events if we've already scheduled a delayed notification
        if (!this._notificationIsPending) {
            this.evaluatePossiblyAsync();
        } else if (this[computedState].isDirty) {
            this[computedState].isStale = true;
        }
    },
    subscribeToDependency: function (target) {
        if (target._deferUpdates && !this[computedState].disposeWhenNodeIsRemoved) {
            var dirtySub = target.subscribe(this.markDirty, this, 'dirty'),
                changeSub = target.subscribe(this.respondToChange, this);
            return {
                _target: target,
                dispose: function () {
                    dirtySub.dispose();
                    changeSub.dispose();
                }
            };
        } else {
            return target.subscribe(this.evaluatePossiblyAsync, this);
        }
    },
    evaluatePossiblyAsync: function () {
        var computedObservable = this,
            throttleEvaluationTimeout = computedObservable['throttleEvaluation'];
        if (throttleEvaluationTimeout && throttleEvaluationTimeout >= 0) {
            clearTimeout(this[computedState].evaluationTimeoutInstance);
            this[computedState].evaluationTimeoutInstance = ko.utils.setTimeout(function () {
                computedObservable.evaluateImmediate(true /*notifyChange*/);
            }, throttleEvaluationTimeout);
        } else if (computedObservable._evalDelayed) {
            computedObservable._evalDelayed(true /*isChange*/);
        } else {
            computedObservable.evaluateImmediate(true /*notifyChange*/);
        }
    },
    evaluateImmediate: function (notifyChange) {
        var computedObservable = this,
            state = computedObservable[computedState],
            disposeWhen = state.disposeWhen,
            changed = false;

        if (state.isBeingEvaluated) {
            // If the evaluation of a ko.computed causes side effects, it's possible that it will trigger its own re-evaluation.
            // This is not desirable (it's hard for a developer to realise a chain of dependencies might cause this, and they almost
            // certainly didn't intend infinite re-evaluations). So, for predictability, we simply prevent ko.computeds from causing
            // their own re-evaluation. Further discussion at https://github.com/SteveSanderson/knockout/pull/387
            return;
        }

        // Do not evaluate (and possibly capture new dependencies) if disposed
        if (state.isDisposed) {
            return;
        }

        if (state.disposeWhenNodeIsRemoved && !ko.utils.domNodeIsAttachedToDocument(state.disposeWhenNodeIsRemoved) || disposeWhen && disposeWhen()) {
            // See comment above about suppressDisposalUntilDisposeWhenReturnsFalse
            if (!state.suppressDisposalUntilDisposeWhenReturnsFalse) {
                computedObservable.dispose();
                return;
            }
        } else {
            // It just did return false, so we can stop suppressing now
            state.suppressDisposalUntilDisposeWhenReturnsFalse = false;
        }

        state.isBeingEvaluated = true;
        try {
            changed = this.evaluateImmediate_CallReadWithDependencyDetection(notifyChange);
        } finally {
            state.isBeingEvaluated = false;
        }

        if (!state.dependenciesCount) {
            computedObservable.dispose();
        }

        return changed;
    },
    evaluateImmediate_CallReadWithDependencyDetection: function (notifyChange) {
        // This function is really just part of the evaluateImmediate logic. You would never call it from anywhere else.
        // Factoring it out into a separate function means it can be independent of the try/catch block in evaluateImmediate,
        // which contributes to saving about 40% off the CPU overhead of computed evaluation (on V8 at least).

        var computedObservable = this,
            state = computedObservable[computedState],
            changed = false;

        // Initially, we assume that none of the subscriptions are still being used (i.e., all are candidates for disposal).
        // Then, during evaluation, we cross off any that are in fact still being used.
        var isInitial = state.pure ? undefined : !state.dependenciesCount,   // If we're evaluating when there are no previous dependencies, it must be the first time
            dependencyDetectionContext = {
                computedObservable: computedObservable,
                disposalCandidates: state.dependencyTracking,
                disposalCount: state.dependenciesCount
            };

        ko.dependencyDetection.begin({
            callbackTarget: dependencyDetectionContext,
            callback: computedBeginDependencyDetectionCallback,
            computed: computedObservable,
            isInitial: isInitial
        });

        state.dependencyTracking = {};
        state.dependenciesCount = 0;

        var newValue = this.evaluateImmediate_CallReadThenEndDependencyDetection(state, dependencyDetectionContext);

        if (computedObservable.isDifferent(state.latestValue, newValue)) {
            if (!state.isSleeping) {
                computedObservable["notifySubscribers"](state.latestValue, "beforeChange");
            }

            state.latestValue = newValue;
            if (DEBUG) computedObservable._latestValue = newValue;

            if (state.isSleeping) {
                computedObservable.updateVersion();
            } else if (notifyChange) {
                computedObservable["notifySubscribers"](state.latestValue);
            }

            changed = true;
        }

        if (isInitial) {
            computedObservable["notifySubscribers"](state.latestValue, "awake");
        }

        return changed;
    },
    evaluateImmediate_CallReadThenEndDependencyDetection: function (state, dependencyDetectionContext) {
        // This function is really part of the evaluateImmediate_CallReadWithDependencyDetection logic.
        // You'd never call it from anywhere else. Factoring it out means that evaluateImmediate_CallReadWithDependencyDetection
        // can be independent of try/finally blocks, which contributes to saving about 40% off the CPU
        // overhead of computed evaluation (on V8 at least).

        try {
            var readFunction = state.readFunction;
            return state.evaluatorFunctionTarget ? readFunction.call(state.evaluatorFunctionTarget) : readFunction();
        } finally {
            ko.dependencyDetection.end();

            // For each subscription no longer being used, remove it from the active subscriptions list and dispose it
            if (dependencyDetectionContext.disposalCount && !state.isSleeping) {
                ko.utils.objectForEach(dependencyDetectionContext.disposalCandidates, computedDisposeDependencyCallback);
            }

            state.isStale = state.isDirty = false;
        }
    },
    peek: function (evaluate) {
        // By default, peek won't re-evaluate, except while the computed is sleeping or to get the initial value when "deferEvaluation" is set.
        // Pass in true to evaluate if needed.
        var state = this[computedState];
        if ((state.isDirty && (evaluate || !state.dependenciesCount)) || (state.isSleeping && this.haveDependenciesChanged())) {
            this.evaluateImmediate();
        }
        return state.latestValue;
    },
    limit: function (limitFunction) {
        // Override the limit function with one that delays evaluation as well
        ko.subscribable['fn'].limit.call(this, limitFunction);
        this._evalIfChanged = function () {
            if (this[computedState].isStale) {
                this.evaluateImmediate();
            } else {
                this[computedState].isDirty = false;
            }
            return this[computedState].latestValue;
        };
        this._evalDelayed = function (isChange) {
            this._limitBeforeChange(this[computedState].latestValue);

            // Mark as dirty
            this[computedState].isDirty = true;
            if (isChange) {
                this[computedState].isStale = true;
            }

            // Pass the observable to the "limit" code, which will evaluate it when
            // it's time to do the notification.
            this._limitChange(this);
        };
    },
    dispose: function () {
        var state = this[computedState];
        if (!state.isSleeping && state.dependencyTracking) {
            ko.utils.objectForEach(state.dependencyTracking, function (id, dependency) {
                if (dependency.dispose)
                    dependency.dispose();
            });
        }
        if (state.disposeWhenNodeIsRemoved && state.domNodeDisposalCallback) {
            ko.utils.domNodeDisposal.removeDisposeCallback(state.disposeWhenNodeIsRemoved, state.domNodeDisposalCallback);
        }
        state.dependencyTracking = null;
        state.dependenciesCount = 0;
        state.isDisposed = true;
        state.isStale = false;
        state.isDirty = false;
        state.isSleeping = false;
        state.disposeWhenNodeIsRemoved = null;
    }
};

var pureComputedOverrides = {
    beforeSubscriptionAdd: function (event) {
        // If asleep, wake up the computed by subscribing to any dependencies.
        var computedObservable = this,
            state = computedObservable[computedState];
        if (!state.isDisposed && state.isSleeping && event == 'change') {
            state.isSleeping = false;
            if (state.isStale || computedObservable.haveDependenciesChanged()) {
                state.dependencyTracking = null;
                state.dependenciesCount = 0;
                if (computedObservable.evaluateImmediate()) {
                    computedObservable.updateVersion();
                }
            } else {
                // First put the dependencies in order
                var dependeciesOrder = [];
                ko.utils.objectForEach(state.dependencyTracking, function (id, dependency) {
                    dependeciesOrder[dependency._order] = id;
                });
                // Next, subscribe to each one
                ko.utils.arrayForEach(dependeciesOrder, function (id, order) {
                    var dependency = state.dependencyTracking[id],
                        subscription = computedObservable.subscribeToDependency(dependency._target);
                    subscription._order = order;
                    subscription._version = dependency._version;
                    state.dependencyTracking[id] = subscription;
                });
            }
            if (!state.isDisposed) {     // test since evaluating could trigger disposal
                computedObservable["notifySubscribers"](state.latestValue, "awake");
            }
        }
    },
    afterSubscriptionRemove: function (event) {
        var state = this[computedState];
        if (!state.isDisposed && event == 'change' && !this.hasSubscriptionsForEvent('change')) {
            ko.utils.objectForEach(state.dependencyTracking, function (id, dependency) {
                if (dependency.dispose) {
                    state.dependencyTracking[id] = {
                        _target: dependency._target,
                        _order: dependency._order,
                        _version: dependency._version
                    };
                    dependency.dispose();
                }
            });
            state.isSleeping = true;
            this["notifySubscribers"](undefined, "asleep");
        }
    },
    getVersion: function () {
        // Because a pure computed is not automatically updated while it is sleeping, we can't
        // simply return the version number. Instead, we check if any of the dependencies have
        // changed and conditionally re-evaluate the computed observable.
        var state = this[computedState];
        if (state.isSleeping && (state.isStale || this.haveDependenciesChanged())) {
            this.evaluateImmediate();
        }
        return ko.subscribable['fn'].getVersion.call(this);
    }
};

var deferEvaluationOverrides = {
    beforeSubscriptionAdd: function (event) {
        // This will force a computed with deferEvaluation to evaluate when the first subscription is registered.
        if (event == 'change' || event == 'beforeChange') {
            this.peek();
        }
    }
};

// Note that for browsers that don't support proto assignment, the
// inheritance chain is created manually in the ko.computed constructor
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(computedFn, ko.subscribable['fn']);
}

// Set the proto chain values for ko.hasPrototype
var protoProp = ko.observable.protoProperty; // == "__ko_proto__"
ko.computed[protoProp] = ko.observable;
computedFn[protoProp] = ko.computed;

ko.isComputed = function (instance) {
    return ko.hasPrototype(instance, ko.computed);
};

ko.isPureComputed = function (instance) {
    return ko.hasPrototype(instance, ko.computed)
        && instance[computedState] && instance[computedState].pure;
};

ko.exportSymbol('computed', ko.computed);
ko.exportSymbol('dependentObservable', ko.computed);    // export ko.dependentObservable for backwards compatibility (1.x)
ko.exportSymbol('isComputed', ko.isComputed);
ko.exportSymbol('isPureComputed', ko.isPureComputed);
ko.exportSymbol('computed.fn', computedFn);
ko.exportProperty(computedFn, 'peek', computedFn.peek);
ko.exportProperty(computedFn, 'dispose', computedFn.dispose);
ko.exportProperty(computedFn, 'isActive', computedFn.isActive);
ko.exportProperty(computedFn, 'getDependenciesCount', computedFn.getDependenciesCount);

ko.pureComputed = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget) {
    if (typeof evaluatorFunctionOrOptions === 'function') {
        return ko.computed(evaluatorFunctionOrOptions, evaluatorFunctionTarget, {'pure':true});
    } else {
        evaluatorFunctionOrOptions = ko.utils.extend({}, evaluatorFunctionOrOptions);   // make a copy of the parameter object
        evaluatorFunctionOrOptions['pure'] = true;
        return ko.computed(evaluatorFunctionOrOptions, evaluatorFunctionTarget);
    }
}
ko.exportSymbol('pureComputed', ko.pureComputed);

(function() {
    var maxNestedObservableDepth = 10; // Escape the (unlikely) pathalogical case where an observable's current value is itself (or similar reference cycle)

    ko.toJS = function(rootObject) {
        if (arguments.length == 0)
            throw new Error("When calling ko.toJS, pass the object you want to convert.");

        // We just unwrap everything at every level in the object graph
        return mapJsObjectGraph(rootObject, function(valueToMap) {
            // Loop because an observable's value might in turn be another observable wrapper
            for (var i = 0; ko.isObservable(valueToMap) && (i < maxNestedObservableDepth); i++)
                valueToMap = valueToMap();
            return valueToMap;
        });
    };

    ko.toJSON = function(rootObject, replacer, space) {     // replacer and space are optional
        var plainJavaScriptObject = ko.toJS(rootObject);
        return ko.utils.stringifyJson(plainJavaScriptObject, replacer, space);
    };

    function mapJsObjectGraph(rootObject, mapInputCallback, visitedObjects) {
        visitedObjects = visitedObjects || new objectLookup();

        rootObject = mapInputCallback(rootObject);
        var canHaveProperties = (typeof rootObject == "object") && (rootObject !== null) && (rootObject !== undefined) && (!(rootObject instanceof RegExp)) && (!(rootObject instanceof Date)) && (!(rootObject instanceof String)) && (!(rootObject instanceof Number)) && (!(rootObject instanceof Boolean));
        if (!canHaveProperties)
            return rootObject;

        var outputProperties = rootObject instanceof Array ? [] : {};
        visitedObjects.save(rootObject, outputProperties);

        visitPropertiesOrArrayEntries(rootObject, function(indexer) {
            var propertyValue = mapInputCallback(rootObject[indexer]);

            switch (typeof propertyValue) {
                case "boolean":
                case "number":
                case "string":
                case "function":
                    outputProperties[indexer] = propertyValue;
                    break;
                case "object":
                case "undefined":
                    var previouslyMappedValue = visitedObjects.get(propertyValue);
                    outputProperties[indexer] = (previouslyMappedValue !== undefined)
                        ? previouslyMappedValue
                        : mapJsObjectGraph(propertyValue, mapInputCallback, visitedObjects);
                    break;
            }
        });

        return outputProperties;
    }

    function visitPropertiesOrArrayEntries(rootObject, visitorCallback) {
        if (rootObject instanceof Array) {
            for (var i = 0; i < rootObject.length; i++)
                visitorCallback(i);

            // For arrays, also respect toJSON property for custom mappings (fixes #278)
            if (typeof rootObject['toJSON'] == 'function')
                visitorCallback('toJSON');
        } else {
            for (var propertyName in rootObject) {
                visitorCallback(propertyName);
            }
        }
    };

    function objectLookup() {
        this.keys = [];
        this.values = [];
    };

    objectLookup.prototype = {
        constructor: objectLookup,
        save: function(key, value) {
            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
            if (existingIndex >= 0)
                this.values[existingIndex] = value;
            else {
                this.keys.push(key);
                this.values.push(value);
            }
        },
        get: function(key) {
            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
            return (existingIndex >= 0) ? this.values[existingIndex] : undefined;
        }
    };
})();

ko.exportSymbol('toJS', ko.toJS);
ko.exportSymbol('toJSON', ko.toJSON);
(function () {
    var hasDomDataExpandoProperty = '__ko__hasDomDataOptionValue__';

    // Normally, SELECT elements and their OPTIONs can only take value of type 'string' (because the values
    // are stored on DOM attributes). ko.selectExtensions provides a way for SELECTs/OPTIONs to have values
    // that are arbitrary objects. This is very convenient when implementing things like cascading dropdowns.
    ko.selectExtensions = {
        readValue : function(element) {
            switch (ko.utils.tagNameLower(element)) {
                case 'option':
                    if (element[hasDomDataExpandoProperty] === true)
                        return ko.utils.domData.get(element, ko.bindingHandlers.options.optionValueDomDataKey);
                    return ko.utils.ieVersion <= 7
                        ? (element.getAttributeNode('value') && element.getAttributeNode('value').specified ? element.value : element.text)
                        : element.value;
                case 'select':
                    return element.selectedIndex >= 0 ? ko.selectExtensions.readValue(element.options[element.selectedIndex]) : undefined;
                default:
                    return element.value;
            }
        },

        writeValue: function(element, value, allowUnset) {
            switch (ko.utils.tagNameLower(element)) {
                case 'option':
                    switch(typeof value) {
                        case "string":
                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, undefined);
                            if (hasDomDataExpandoProperty in element) { // IE <= 8 throws errors if you delete non-existent properties from a DOM node
                                delete element[hasDomDataExpandoProperty];
                            }
                            element.value = value;
                            break;
                        default:
                            // Store arbitrary object using DomData
                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, value);
                            element[hasDomDataExpandoProperty] = true;

                            // Special treatment of numbers is just for backward compatibility. KO 1.2.1 wrote numerical values to element.value.
                            element.value = typeof value === "number" ? value : "";
                            break;
                    }
                    break;
                case 'select':
                    if (value === "" || value === null)       // A blank string or null value will select the caption
                        value = undefined;
                    var selection = -1;
                    for (var i = 0, n = element.options.length, optionValue; i < n; ++i) {
                        optionValue = ko.selectExtensions.readValue(element.options[i]);
                        // Include special check to handle selecting a caption with a blank string value
                        if (optionValue == value || (optionValue == "" && value === undefined)) {
                            selection = i;
                            break;
                        }
                    }
                    if (allowUnset || selection >= 0 || (value === undefined && element.size > 1)) {
                        element.selectedIndex = selection;
                    }
                    break;
                default:
                    if ((value === null) || (value === undefined))
                        value = "";
                    element.value = value;
                    break;
            }
        }
    };
})();

ko.exportSymbol('selectExtensions', ko.selectExtensions);
ko.exportSymbol('selectExtensions.readValue', ko.selectExtensions.readValue);
ko.exportSymbol('selectExtensions.writeValue', ko.selectExtensions.writeValue);
ko.expressionRewriting = (function () {
    var javaScriptReservedWords = ["true", "false", "null", "undefined"];

    // Matches something that can be assigned to--either an isolated identifier or something ending with a property accessor
    // This is designed to be simple and avoid false negatives, but could produce false positives (e.g., a+b.c).
    // This also will not properly handle nested brackets (e.g., obj1[obj2['prop']]; see #911).
    var javaScriptAssignmentTarget = /^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i;

    function getWriteableValue(expression) {
        if (ko.utils.arrayIndexOf(javaScriptReservedWords, expression) >= 0)
            return false;
        var match = expression.match(javaScriptAssignmentTarget);
        return match === null ? false : match[1] ? ('Object(' + match[1] + ')' + match[2]) : expression;
    }

    // The following regular expressions will be used to split an object-literal string into tokens

        // These two match strings, either with double quotes or single quotes
    var stringDouble = '"(?:[^"\\\\]|\\\\.)*"',
        stringSingle = "'(?:[^'\\\\]|\\\\.)*'",
        // Matches a regular expression (text enclosed by slashes), but will also match sets of divisions
        // as a regular expression (this is handled by the parsing loop below).
        stringRegexp = '/(?:[^/\\\\]|\\\\.)*/\w*',
        // These characters have special meaning to the parser and must not appear in the middle of a
        // token, except as part of a string.
        specials = ',"\'{}()/:[\\]',
        // Match text (at least two characters) that does not contain any of the above special characters,
        // although some of the special characters are allowed to start it (all but the colon and comma).
        // The text can contain spaces, but leading or trailing spaces are skipped.
        everyThingElse = '[^\\s:,/][^' + specials + ']*[^\\s' + specials + ']',
        // Match any non-space character not matched already. This will match colons and commas, since they're
        // not matched by "everyThingElse", but will also match any other single character that wasn't already
        // matched (for example: in "a: 1, b: 2", each of the non-space characters will be matched by oneNotSpace).
        oneNotSpace = '[^\\s]',

        // Create the actual regular expression by or-ing the above strings. The order is important.
        bindingToken = RegExp(stringDouble + '|' + stringSingle + '|' + stringRegexp + '|' + everyThingElse + '|' + oneNotSpace, 'g'),

        // Match end of previous token to determine whether a slash is a division or regex.
        divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/,
        keywordRegexLookBehind = {'in':1,'return':1,'typeof':1};

    function parseObjectLiteral(objectLiteralString) {
        // Trim leading and trailing spaces from the string
        var str = ko.utils.stringTrim(objectLiteralString);

        // Trim braces '{' surrounding the whole object literal
        if (str.charCodeAt(0) === 123) str = str.slice(1, -1);

        // Split into tokens
        var result = [], toks = str.match(bindingToken), key, values = [], depth = 0;

        if (toks) {
            // Append a comma so that we don't need a separate code block to deal with the last item
            toks.push(',');

            for (var i = 0, tok; tok = toks[i]; ++i) {
                var c = tok.charCodeAt(0);
                // A comma signals the end of a key/value pair if depth is zero
                if (c === 44) { // ","
                    if (depth <= 0) {
                        result.push((key && values.length) ? {key: key, value: values.join('')} : {'unknown': key || values.join('')});
                        key = depth = 0;
                        values = [];
                        continue;
                    }
                // Simply skip the colon that separates the name and value
                } else if (c === 58) { // ":"
                    if (!depth && !key && values.length === 1) {
                        key = values.pop();
                        continue;
                    }
                // A set of slashes is initially matched as a regular expression, but could be division
                } else if (c === 47 && i && tok.length > 1) {  // "/"
                    // Look at the end of the previous token to determine if the slash is actually division
                    var match = toks[i-1].match(divisionLookBehind);
                    if (match && !keywordRegexLookBehind[match[0]]) {
                        // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
                        str = str.substr(str.indexOf(tok) + 1);
                        toks = str.match(bindingToken);
                        toks.push(',');
                        i = -1;
                        // Continue with just the slash
                        tok = '/';
                    }
                // Increment depth for parentheses, braces, and brackets so that interior commas are ignored
                } else if (c === 40 || c === 123 || c === 91) { // '(', '{', '['
                    ++depth;
                } else if (c === 41 || c === 125 || c === 93) { // ')', '}', ']'
                    --depth;
                // The key will be the first token; if it's a string, trim the quotes
                } else if (!key && !values.length && (c === 34 || c === 39)) { // '"', "'"
                    tok = tok.slice(1, -1);
                }
                values.push(tok);
            }
        }
        return result;
    }

    // Two-way bindings include a write function that allow the handler to update the value even if it's not an observable.
    var twoWayBindings = {};

    function preProcessBindings(bindingsStringOrKeyValueArray, bindingOptions) {
        bindingOptions = bindingOptions || {};

        function processKeyValue(key, val) {
            var writableVal;
            function callPreprocessHook(obj) {
                return (obj && obj['preprocess']) ? (val = obj['preprocess'](val, key, processKeyValue)) : true;
            }
            if (!bindingParams) {
                if (!callPreprocessHook(ko['getBindingHandler'](key)))
                    return;

                if (twoWayBindings[key] && (writableVal = getWriteableValue(val))) {
                    // For two-way bindings, provide a write method in case the value
                    // isn't a writable observable.
                    propertyAccessorResultStrings.push("'" + key + "':function(_z){" + writableVal + "=_z}");
                }
            }
            // Values are wrapped in a function so that each value can be accessed independently
            if (makeValueAccessors) {
                val = 'function(){return ' + val + ' }';
            }
            resultStrings.push("'" + key + "':" + val);
        }

        var resultStrings = [],
            propertyAccessorResultStrings = [],
            makeValueAccessors = bindingOptions['valueAccessors'],
            bindingParams = bindingOptions['bindingParams'],
            keyValueArray = typeof bindingsStringOrKeyValueArray === "string" ?
                parseObjectLiteral(bindingsStringOrKeyValueArray) : bindingsStringOrKeyValueArray;

        ko.utils.arrayForEach(keyValueArray, function(keyValue) {
            processKeyValue(keyValue.key || keyValue['unknown'], keyValue.value);
        });

        if (propertyAccessorResultStrings.length)
            processKeyValue('_ko_property_writers', "{" + propertyAccessorResultStrings.join(",") + " }");

        return resultStrings.join(",");
    }

    return {
        bindingRewriteValidators: [],

        twoWayBindings: twoWayBindings,

        parseObjectLiteral: parseObjectLiteral,

        preProcessBindings: preProcessBindings,

        keyValueArrayContainsKey: function(keyValueArray, key) {
            for (var i = 0; i < keyValueArray.length; i++)
                if (keyValueArray[i]['key'] == key)
                    return true;
            return false;
        },

        // Internal, private KO utility for updating model properties from within bindings
        // property:            If the property being updated is (or might be) an observable, pass it here
        //                      If it turns out to be a writable observable, it will be written to directly
        // allBindings:         An object with a get method to retrieve bindings in the current execution context.
        //                      This will be searched for a '_ko_property_writers' property in case you're writing to a non-observable
        // key:                 The key identifying the property to be written. Example: for { hasFocus: myValue }, write to 'myValue' by specifying the key 'hasFocus'
        // value:               The value to be written
        // checkIfDifferent:    If true, and if the property being written is a writable observable, the value will only be written if
        //                      it is !== existing value on that writable observable
        writeValueToProperty: function(property, allBindings, key, value, checkIfDifferent) {
            if (!property || !ko.isObservable(property)) {
                var propWriters = allBindings.get('_ko_property_writers');
                if (propWriters && propWriters[key])
                    propWriters[key](value);
            } else if (ko.isWriteableObservable(property) && (!checkIfDifferent || property.peek() !== value)) {
                property(value);
            }
        }
    };
})();

ko.exportSymbol('expressionRewriting', ko.expressionRewriting);
ko.exportSymbol('expressionRewriting.bindingRewriteValidators', ko.expressionRewriting.bindingRewriteValidators);
ko.exportSymbol('expressionRewriting.parseObjectLiteral', ko.expressionRewriting.parseObjectLiteral);
ko.exportSymbol('expressionRewriting.preProcessBindings', ko.expressionRewriting.preProcessBindings);

// Making bindings explicitly declare themselves as "two way" isn't ideal in the long term (it would be better if
// all bindings could use an official 'property writer' API without needing to declare that they might). However,
// since this is not, and has never been, a public API (_ko_property_writers was never documented), it's acceptable
// as an internal implementation detail in the short term.
// For those developers who rely on _ko_property_writers in their custom bindings, we expose _twoWayBindings as an
// undocumented feature that makes it relatively easy to upgrade to KO 3.0. However, this is still not an official
// public API, and we reserve the right to remove it at any time if we create a real public property writers API.
ko.exportSymbol('expressionRewriting._twoWayBindings', ko.expressionRewriting.twoWayBindings);

// For backward compatibility, define the following aliases. (Previously, these function names were misleading because
// they referred to JSON specifically, even though they actually work with arbitrary JavaScript object literal expressions.)
ko.exportSymbol('jsonExpressionRewriting', ko.expressionRewriting);
ko.exportSymbol('jsonExpressionRewriting.insertPropertyAccessorsIntoJson', ko.expressionRewriting.preProcessBindings);
(function() {
    // "Virtual elements" is an abstraction on top of the usual DOM API which understands the notion that comment nodes
    // may be used to represent hierarchy (in addition to the DOM's natural hierarchy).
    // If you call the DOM-manipulating functions on ko.virtualElements, you will be able to read and write the state
    // of that virtual hierarchy
    //
    // The point of all this is to support containerless templates (e.g., <!-- ko foreach:someCollection -->blah<!-- /ko -->)
    // without having to scatter special cases all over the binding and templating code.

    // IE 9 cannot reliably read the "nodeValue" property of a comment node (see https://github.com/SteveSanderson/knockout/issues/186)
    // but it does give them a nonstandard alternative property called "text" that it can read reliably. Other browsers don't have that property.
    // So, use node.text where available, and node.nodeValue elsewhere
    var commentNodesHaveTextProperty = document && document.createComment("test").text === "<!--test-->";

    var startCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*ko(?:\s+([\s\S]+))?\s*-->$/ : /^\s*ko(?:\s+([\s\S]+))?\s*$/;
    var endCommentRegex =   commentNodesHaveTextProperty ? /^<!--\s*\/ko\s*-->$/ : /^\s*\/ko\s*$/;
    var htmlTagsWithOptionallyClosingChildren = { 'ul': true, 'ol': true };

    function isStartComment(node) {
        return (node.nodeType == 8) && startCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
    }

    function isEndComment(node) {
        return (node.nodeType == 8) && endCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
    }

    function getVirtualChildren(startComment, allowUnbalanced) {
        var currentNode = startComment;
        var depth = 1;
        var children = [];
        while (currentNode = currentNode.nextSibling) {
            if (isEndComment(currentNode)) {
                depth--;
                if (depth === 0)
                    return children;
            }

            children.push(currentNode);

            if (isStartComment(currentNode))
                depth++;
        }
        if (!allowUnbalanced)
            throw new Error("Cannot find closing comment tag to match: " + startComment.nodeValue);
        return null;
    }

    function getMatchingEndComment(startComment, allowUnbalanced) {
        var allVirtualChildren = getVirtualChildren(startComment, allowUnbalanced);
        if (allVirtualChildren) {
            if (allVirtualChildren.length > 0)
                return allVirtualChildren[allVirtualChildren.length - 1].nextSibling;
            return startComment.nextSibling;
        } else
            return null; // Must have no matching end comment, and allowUnbalanced is true
    }

    function getUnbalancedChildTags(node) {
        // e.g., from <div>OK</div><!-- ko blah --><span>Another</span>, returns: <!-- ko blah --><span>Another</span>
        //       from <div>OK</div><!-- /ko --><!-- /ko -->,             returns: <!-- /ko --><!-- /ko -->
        var childNode = node.firstChild, captureRemaining = null;
        if (childNode) {
            do {
                if (captureRemaining)                   // We already hit an unbalanced node and are now just scooping up all subsequent nodes
                    captureRemaining.push(childNode);
                else if (isStartComment(childNode)) {
                    var matchingEndComment = getMatchingEndComment(childNode, /* allowUnbalanced: */ true);
                    if (matchingEndComment)             // It's a balanced tag, so skip immediately to the end of this virtual set
                        childNode = matchingEndComment;
                    else
                        captureRemaining = [childNode]; // It's unbalanced, so start capturing from this point
                } else if (isEndComment(childNode)) {
                    captureRemaining = [childNode];     // It's unbalanced (if it wasn't, we'd have skipped over it already), so start capturing
                }
            } while (childNode = childNode.nextSibling);
        }
        return captureRemaining;
    }

    ko.virtualElements = {
        allowedBindings: {},

        childNodes: function(node) {
            return isStartComment(node) ? getVirtualChildren(node) : node.childNodes;
        },

        emptyNode: function(node) {
            if (!isStartComment(node))
                ko.utils.emptyDomNode(node);
            else {
                var virtualChildren = ko.virtualElements.childNodes(node);
                for (var i = 0, j = virtualChildren.length; i < j; i++)
                    ko.removeNode(virtualChildren[i]);
            }
        },

        setDomNodeChildren: function(node, childNodes) {
            if (!isStartComment(node))
                ko.utils.setDomNodeChildren(node, childNodes);
            else {
                ko.virtualElements.emptyNode(node);
                var endCommentNode = node.nextSibling; // Must be the next sibling, as we just emptied the children
                for (var i = 0, j = childNodes.length; i < j; i++)
                    endCommentNode.parentNode.insertBefore(childNodes[i], endCommentNode);
            }
        },

        prepend: function(containerNode, nodeToPrepend) {
            if (!isStartComment(containerNode)) {
                if (containerNode.firstChild)
                    containerNode.insertBefore(nodeToPrepend, containerNode.firstChild);
                else
                    containerNode.appendChild(nodeToPrepend);
            } else {
                // Start comments must always have a parent and at least one following sibling (the end comment)
                containerNode.parentNode.insertBefore(nodeToPrepend, containerNode.nextSibling);
            }
        },

        insertAfter: function(containerNode, nodeToInsert, insertAfterNode) {
            if (!insertAfterNode) {
                ko.virtualElements.prepend(containerNode, nodeToInsert);
            } else if (!isStartComment(containerNode)) {
                // Insert after insertion point
                if (insertAfterNode.nextSibling)
                    containerNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
                else
                    containerNode.appendChild(nodeToInsert);
            } else {
                // Children of start comments must always have a parent and at least one following sibling (the end comment)
                containerNode.parentNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
            }
        },

        firstChild: function(node) {
            if (!isStartComment(node))
                return node.firstChild;
            if (!node.nextSibling || isEndComment(node.nextSibling))
                return null;
            return node.nextSibling;
        },

        nextSibling: function(node) {
            if (isStartComment(node))
                node = getMatchingEndComment(node);
            if (node.nextSibling && isEndComment(node.nextSibling))
                return null;
            return node.nextSibling;
        },

        hasBindingValue: isStartComment,

        virtualNodeBindingValue: function(node) {
            var regexMatch = (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(startCommentRegex);
            return regexMatch ? regexMatch[1] : null;
        },

        normaliseVirtualElementDomStructure: function(elementVerified) {
            // Workaround for https://github.com/SteveSanderson/knockout/issues/155
            // (IE <= 8 or IE 9 quirks mode parses your HTML weirdly, treating closing </li> tags as if they don't exist, thereby moving comment nodes
            // that are direct descendants of <ul> into the preceding <li>)
            if (!htmlTagsWithOptionallyClosingChildren[ko.utils.tagNameLower(elementVerified)])
                return;

            // Scan immediate children to see if they contain unbalanced comment tags. If they do, those comment tags
            // must be intended to appear *after* that child, so move them there.
            var childNode = elementVerified.firstChild;
            if (childNode) {
                do {
                    if (childNode.nodeType === 1) {
                        var unbalancedTags = getUnbalancedChildTags(childNode);
                        if (unbalancedTags) {
                            // Fix up the DOM by moving the unbalanced tags to where they most likely were intended to be placed - *after* the child
                            var nodeToInsertBefore = childNode.nextSibling;
                            for (var i = 0; i < unbalancedTags.length; i++) {
                                if (nodeToInsertBefore)
                                    elementVerified.insertBefore(unbalancedTags[i], nodeToInsertBefore);
                                else
                                    elementVerified.appendChild(unbalancedTags[i]);
                            }
                        }
                    }
                } while (childNode = childNode.nextSibling);
            }
        }
    };
})();
ko.exportSymbol('virtualElements', ko.virtualElements);
ko.exportSymbol('virtualElements.allowedBindings', ko.virtualElements.allowedBindings);
ko.exportSymbol('virtualElements.emptyNode', ko.virtualElements.emptyNode);
//ko.exportSymbol('virtualElements.firstChild', ko.virtualElements.firstChild);     // firstChild is not minified
ko.exportSymbol('virtualElements.insertAfter', ko.virtualElements.insertAfter);
//ko.exportSymbol('virtualElements.nextSibling', ko.virtualElements.nextSibling);   // nextSibling is not minified
ko.exportSymbol('virtualElements.prepend', ko.virtualElements.prepend);
ko.exportSymbol('virtualElements.setDomNodeChildren', ko.virtualElements.setDomNodeChildren);
(function() {
    var defaultBindingAttributeName = "data-bind";

    ko.bindingProvider = function() {
        this.bindingCache = {};
    };

    ko.utils.extend(ko.bindingProvider.prototype, {
        'nodeHasBindings': function(node) {
            switch (node.nodeType) {
                case 1: // Element
                    return node.getAttribute(defaultBindingAttributeName) != null
                        || ko.components['getComponentNameForNode'](node);
                case 8: // Comment node
                    return ko.virtualElements.hasBindingValue(node);
                default: return false;
            }
        },

        'getBindings': function(node, bindingContext) {
            var bindingsString = this['getBindingsString'](node, bindingContext),
                parsedBindings = bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node) : null;
            return ko.components.addBindingsForCustomElement(parsedBindings, node, bindingContext, /* valueAccessors */ false);
        },

        'getBindingAccessors': function(node, bindingContext) {
            var bindingsString = this['getBindingsString'](node, bindingContext),
                parsedBindings = bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node, { 'valueAccessors': true }) : null;
            return ko.components.addBindingsForCustomElement(parsedBindings, node, bindingContext, /* valueAccessors */ true);
        },

        // The following function is only used internally by this default provider.
        // It's not part of the interface definition for a general binding provider.
        'getBindingsString': function(node, bindingContext) {
            switch (node.nodeType) {
                case 1: return node.getAttribute(defaultBindingAttributeName);   // Element
                case 8: return ko.virtualElements.virtualNodeBindingValue(node); // Comment node
                default: return null;
            }
        },

        // The following function is only used internally by this default provider.
        // It's not part of the interface definition for a general binding provider.
        'parseBindingsString': function(bindingsString, bindingContext, node, options) {
            try {
                var bindingFunction = createBindingsStringEvaluatorViaCache(bindingsString, this.bindingCache, options);
                return bindingFunction(bindingContext, node);
            } catch (ex) {
                ex.message = "Unable to parse bindings.\nBindings value: " + bindingsString + "\nMessage: " + ex.message;
                throw ex;
            }
        }
    });

    ko.bindingProvider['instance'] = new ko.bindingProvider();

    function createBindingsStringEvaluatorViaCache(bindingsString, cache, options) {
        var cacheKey = bindingsString + (options && options['valueAccessors'] || '');
        return cache[cacheKey]
            || (cache[cacheKey] = createBindingsStringEvaluator(bindingsString, options));
    }

    function createBindingsStringEvaluator(bindingsString, options) {
        // Build the source for a function that evaluates "expression"
        // For each scope variable, add an extra level of "with" nesting
        // Example result: with(sc1) { with(sc0) { return (expression) } }
        var rewrittenBindings = ko.expressionRewriting.preProcessBindings(bindingsString, options),
            functionBody = "with($context){with($data||{}){return{" + rewrittenBindings + "}}}";
        return new Function("$context", "$element", functionBody);
    }
})();

ko.exportSymbol('bindingProvider', ko.bindingProvider);
(function () {
    ko.bindingHandlers = {};

    // The following element types will not be recursed into during binding.
    var bindingDoesNotRecurseIntoElementTypes = {
        // Don't want bindings that operate on text nodes to mutate <script> and <textarea> contents,
        // because it's unexpected and a potential XSS issue.
        // Also bindings should not operate on <template> elements since this breaks in Internet Explorer
        // and because such elements' contents are always intended to be bound in a different context
        // from where they appear in the document.
        'script': true,
        'textarea': true,
        'template': true
    };

    // Use an overridable method for retrieving binding handlers so that a plugins may support dynamically created handlers
    ko['getBindingHandler'] = function(bindingKey) {
        return ko.bindingHandlers[bindingKey];
    };

    // The ko.bindingContext constructor is only called directly to create the root context. For child
    // contexts, use bindingContext.createChildContext or bindingContext.extend.
    ko.bindingContext = function(dataItemOrAccessor, parentContext, dataItemAlias, extendCallback, options) {

        // The binding context object includes static properties for the current, parent, and root view models.
        // If a view model is actually stored in an observable, the corresponding binding context object, and
        // any child contexts, must be updated when the view model is changed.
        function updateContext() {
            // Most of the time, the context will directly get a view model object, but if a function is given,
            // we call the function to retrieve the view model. If the function accesses any observables or returns
            // an observable, the dependency is tracked, and those observables can later cause the binding
            // context to be updated.
            var dataItemOrObservable = isFunc ? dataItemOrAccessor() : dataItemOrAccessor,
                dataItem = ko.utils.unwrapObservable(dataItemOrObservable);

            if (parentContext) {
                // When a "parent" context is given, register a dependency on the parent context. Thus whenever the
                // parent context is updated, this context will also be updated.
                if (parentContext._subscribable)
                    parentContext._subscribable();

                // Copy $root and any custom properties from the parent context
                ko.utils.extend(self, parentContext);

                // Because the above copy overwrites our own properties, we need to reset them.
                self._subscribable = subscribable;
            } else {
                self['$parents'] = [];
                self['$root'] = dataItem;

                // Export 'ko' in the binding context so it will be available in bindings and templates
                // even if 'ko' isn't exported as a global, such as when using an AMD loader.
                // See https://github.com/SteveSanderson/knockout/issues/490
                self['ko'] = ko;
            }
            self['$rawData'] = dataItemOrObservable;
            self['$data'] = dataItem;
            if (dataItemAlias)
                self[dataItemAlias] = dataItem;

            // The extendCallback function is provided when creating a child context or extending a context.
            // It handles the specific actions needed to finish setting up the binding context. Actions in this
            // function could also add dependencies to this binding context.
            if (extendCallback)
                extendCallback(self, parentContext, dataItem);

            return self['$data'];
        }
        function disposeWhen() {
            return nodes && !ko.utils.anyDomNodeIsAttachedToDocument(nodes);
        }

        var self = this,
            isFunc = typeof(dataItemOrAccessor) == "function" && !ko.isObservable(dataItemOrAccessor),
            nodes,
            subscribable;

        if (options && options['exportDependencies']) {
            // The "exportDependencies" option means that the calling code will track any dependencies and re-create
            // the binding context when they change.
            updateContext();
        } else {
            subscribable = ko.dependentObservable(updateContext, null, { disposeWhen: disposeWhen, disposeWhenNodeIsRemoved: true });

            // At this point, the binding context has been initialized, and the "subscribable" computed observable is
            // subscribed to any observables that were accessed in the process. If there is nothing to track, the
            // computed will be inactive, and we can safely throw it away. If it's active, the computed is stored in
            // the context object.
            if (subscribable.isActive()) {
                self._subscribable = subscribable;

                // Always notify because even if the model ($data) hasn't changed, other context properties might have changed
                subscribable['equalityComparer'] = null;

                // We need to be able to dispose of this computed observable when it's no longer needed. This would be
                // easy if we had a single node to watch, but binding contexts can be used by many different nodes, and
                // we cannot assume that those nodes have any relation to each other. So instead we track any node that
                // the context is attached to, and dispose the computed when all of those nodes have been cleaned.

                // Add properties to *subscribable* instead of *self* because any properties added to *self* may be overwritten on updates
                nodes = [];
                subscribable._addNode = function(node) {
                    nodes.push(node);
                    ko.utils.domNodeDisposal.addDisposeCallback(node, function(node) {
                        ko.utils.arrayRemoveItem(nodes, node);
                        if (!nodes.length) {
                            subscribable.dispose();
                            self._subscribable = subscribable = undefined;
                        }
                    });
                };
            }
        }
    }

    // Extend the binding context hierarchy with a new view model object. If the parent context is watching
    // any observables, the new child context will automatically get a dependency on the parent context.
    // But this does not mean that the $data value of the child context will also get updated. If the child
    // view model also depends on the parent view model, you must provide a function that returns the correct
    // view model on each update.
    ko.bindingContext.prototype['createChildContext'] = function (dataItemOrAccessor, dataItemAlias, extendCallback, options) {
        return new ko.bindingContext(dataItemOrAccessor, this, dataItemAlias, function(self, parentContext) {
            // Extend the context hierarchy by setting the appropriate pointers
            self['$parentContext'] = parentContext;
            self['$parent'] = parentContext['$data'];
            self['$parents'] = (parentContext['$parents'] || []).slice(0);
            self['$parents'].unshift(self['$parent']);
            if (extendCallback)
                extendCallback(self);
        }, options);
    };

    // Extend the binding context with new custom properties. This doesn't change the context hierarchy.
    // Similarly to "child" contexts, provide a function here to make sure that the correct values are set
    // when an observable view model is updated.
    ko.bindingContext.prototype['extend'] = function(properties) {
        // If the parent context references an observable view model, "_subscribable" will always be the
        // latest view model object. If not, "_subscribable" isn't set, and we can use the static "$data" value.
        return new ko.bindingContext(this._subscribable || this['$data'], this, null, function(self, parentContext) {
            // This "child" context doesn't directly track a parent observable view model,
            // so we need to manually set the $rawData value to match the parent.
            self['$rawData'] = parentContext['$rawData'];
            ko.utils.extend(self, typeof(properties) == "function" ? properties() : properties);
        });
    };

    ko.bindingContext.prototype.createStaticChildContext = function (dataItemOrAccessor, dataItemAlias) {
        return this['createChildContext'](dataItemOrAccessor, dataItemAlias, null, { "exportDependencies": true });
    };

    // Returns the valueAccesor function for a binding value
    function makeValueAccessor(value) {
        return function() {
            return value;
        };
    }

    // Returns the value of a valueAccessor function
    function evaluateValueAccessor(valueAccessor) {
        return valueAccessor();
    }

    // Given a function that returns bindings, create and return a new object that contains
    // binding value-accessors functions. Each accessor function calls the original function
    // so that it always gets the latest value and all dependencies are captured. This is used
    // by ko.applyBindingsToNode and getBindingsAndMakeAccessors.
    function makeAccessorsFromFunction(callback) {
        return ko.utils.objectMap(ko.dependencyDetection.ignore(callback), function(value, key) {
            return function() {
                return callback()[key];
            };
        });
    }

    // Given a bindings function or object, create and return a new object that contains
    // binding value-accessors functions. This is used by ko.applyBindingsToNode.
    function makeBindingAccessors(bindings, context, node) {
        if (typeof bindings === 'function') {
            return makeAccessorsFromFunction(bindings.bind(null, context, node));
        } else {
            return ko.utils.objectMap(bindings, makeValueAccessor);
        }
    }

    // This function is used if the binding provider doesn't include a getBindingAccessors function.
    // It must be called with 'this' set to the provider instance.
    function getBindingsAndMakeAccessors(node, context) {
        return makeAccessorsFromFunction(this['getBindings'].bind(this, node, context));
    }

    function validateThatBindingIsAllowedForVirtualElements(bindingName) {
        var validator = ko.virtualElements.allowedBindings[bindingName];
        if (!validator)
            throw new Error("The binding '" + bindingName + "' cannot be used with virtual elements")
    }

    function applyBindingsToDescendantsInternal (bindingContext, elementOrVirtualElement, bindingContextsMayDifferFromDomParentElement) {
        var currentChild,
            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement),
            provider = ko.bindingProvider['instance'],
            preprocessNode = provider['preprocessNode'];

        // Preprocessing allows a binding provider to mutate a node before bindings are applied to it. For example it's
        // possible to insert new siblings after it, and/or replace the node with a different one. This can be used to
        // implement custom binding syntaxes, such as {{ value }} for string interpolation, or custom element types that
        // trigger insertion of <template> contents at that point in the document.
        if (preprocessNode) {
            while (currentChild = nextInQueue) {
                nextInQueue = ko.virtualElements.nextSibling(currentChild);
                preprocessNode.call(provider, currentChild);
            }
            // Reset nextInQueue for the next loop
            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement);
        }

        while (currentChild = nextInQueue) {
            // Keep a record of the next child *before* applying bindings, in case the binding removes the current child from its position
            nextInQueue = ko.virtualElements.nextSibling(currentChild);
            applyBindingsToNodeAndDescendantsInternal(bindingContext, currentChild, bindingContextsMayDifferFromDomParentElement);
        }
    }

    function applyBindingsToNodeAndDescendantsInternal (bindingContext, nodeVerified, bindingContextMayDifferFromDomParentElement) {
        var shouldBindDescendants = true;

        // Perf optimisation: Apply bindings only if...
        // (1) We need to store the binding context on this node (because it may differ from the DOM parent node's binding context)
        //     Note that we can't store binding contexts on non-elements (e.g., text nodes), as IE doesn't allow expando properties for those
        // (2) It might have bindings (e.g., it has a data-bind attribute, or it's a marker for a containerless template)
        var isElement = (nodeVerified.nodeType === 1);
        if (isElement) // Workaround IE <= 8 HTML parsing weirdness
            ko.virtualElements.normaliseVirtualElementDomStructure(nodeVerified);

        var shouldApplyBindings = (isElement && bindingContextMayDifferFromDomParentElement)             // Case (1)
                               || ko.bindingProvider['instance']['nodeHasBindings'](nodeVerified);       // Case (2)
        if (shouldApplyBindings)
            shouldBindDescendants = applyBindingsToNodeInternal(nodeVerified, null, bindingContext, bindingContextMayDifferFromDomParentElement)['shouldBindDescendants'];

        if (shouldBindDescendants && !bindingDoesNotRecurseIntoElementTypes[ko.utils.tagNameLower(nodeVerified)]) {
            // We're recursing automatically into (real or virtual) child nodes without changing binding contexts. So,
            //  * For children of a *real* element, the binding context is certainly the same as on their DOM .parentNode,
            //    hence bindingContextsMayDifferFromDomParentElement is false
            //  * For children of a *virtual* element, we can't be sure. Evaluating .parentNode on those children may
            //    skip over any number of intermediate virtual elements, any of which might define a custom binding context,
            //    hence bindingContextsMayDifferFromDomParentElement is true
            applyBindingsToDescendantsInternal(bindingContext, nodeVerified, /* bindingContextsMayDifferFromDomParentElement: */ !isElement);
        }
    }

    var boundElementDomDataKey = ko.utils.domData.nextKey();


    function topologicalSortBindings(bindings) {
        // Depth-first sort
        var result = [],                // The list of key/handler pairs that we will return
            bindingsConsidered = {},    // A temporary record of which bindings are already in 'result'
            cyclicDependencyStack = []; // Keeps track of a depth-search so that, if there's a cycle, we know which bindings caused it
        ko.utils.objectForEach(bindings, function pushBinding(bindingKey) {
            if (!bindingsConsidered[bindingKey]) {
                var binding = ko['getBindingHandler'](bindingKey);
                if (binding) {
                    // First add dependencies (if any) of the current binding
                    if (binding['after']) {
                        cyclicDependencyStack.push(bindingKey);
                        ko.utils.arrayForEach(binding['after'], function(bindingDependencyKey) {
                            if (bindings[bindingDependencyKey]) {
                                if (ko.utils.arrayIndexOf(cyclicDependencyStack, bindingDependencyKey) !== -1) {
                                    throw Error("Cannot combine the following bindings, because they have a cyclic dependency: " + cyclicDependencyStack.join(", "));
                                } else {
                                    pushBinding(bindingDependencyKey);
                                }
                            }
                        });
                        cyclicDependencyStack.length--;
                    }
                    // Next add the current binding
                    result.push({ key: bindingKey, handler: binding });
                }
                bindingsConsidered[bindingKey] = true;
            }
        });

        return result;
    }

    function applyBindingsToNodeInternal(node, sourceBindings, bindingContext, bindingContextMayDifferFromDomParentElement) {
        // Prevent multiple applyBindings calls for the same node, except when a binding value is specified
        var alreadyBound = ko.utils.domData.get(node, boundElementDomDataKey);
        if (!sourceBindings) {
            if (alreadyBound) {
                throw Error("You cannot apply bindings multiple times to the same element.");
            }
            ko.utils.domData.set(node, boundElementDomDataKey, true);
        }

        // Optimization: Don't store the binding context on this node if it's definitely the same as on node.parentNode, because
        // we can easily recover it just by scanning up the node's ancestors in the DOM
        // (note: here, parent node means "real DOM parent" not "virtual parent", as there's no O(1) way to find the virtual parent)
        if (!alreadyBound && bindingContextMayDifferFromDomParentElement)
            ko.storedBindingContextForNode(node, bindingContext);

        // Use bindings if given, otherwise fall back on asking the bindings provider to give us some bindings
        var bindings;
        if (sourceBindings && typeof sourceBindings !== 'function') {
            bindings = sourceBindings;
        } else {
            var provider = ko.bindingProvider['instance'],
                getBindings = provider['getBindingAccessors'] || getBindingsAndMakeAccessors;

            // Get the binding from the provider within a computed observable so that we can update the bindings whenever
            // the binding context is updated or if the binding provider accesses observables.
            var bindingsUpdater = ko.dependentObservable(
                function() {
                    bindings = sourceBindings ? sourceBindings(bindingContext, node) : getBindings.call(provider, node, bindingContext);
                    // Register a dependency on the binding context to support observable view models.
                    if (bindings && bindingContext._subscribable)
                        bindingContext._subscribable();
                    return bindings;
                },
                null, { disposeWhenNodeIsRemoved: node }
            );

            if (!bindings || !bindingsUpdater.isActive())
                bindingsUpdater = null;
        }

        var bindingHandlerThatControlsDescendantBindings;
        if (bindings) {
            // Return the value accessor for a given binding. When bindings are static (won't be updated because of a binding
            // context update), just return the value accessor from the binding. Otherwise, return a function that always gets
            // the latest binding value and registers a dependency on the binding updater.
            var getValueAccessor = bindingsUpdater
                ? function(bindingKey) {
                    return function() {
                        return evaluateValueAccessor(bindingsUpdater()[bindingKey]);
                    };
                } : function(bindingKey) {
                    return bindings[bindingKey];
                };

            // Use of allBindings as a function is maintained for backwards compatibility, but its use is deprecated
            function allBindings() {
                return ko.utils.objectMap(bindingsUpdater ? bindingsUpdater() : bindings, evaluateValueAccessor);
            }
            // The following is the 3.x allBindings API
            allBindings['get'] = function(key) {
                return bindings[key] && evaluateValueAccessor(getValueAccessor(key));
            };
            allBindings['has'] = function(key) {
                return key in bindings;
            };

            // First put the bindings into the right order
            var orderedBindings = topologicalSortBindings(bindings);

            // Go through the sorted bindings, calling init and update for each
            ko.utils.arrayForEach(orderedBindings, function(bindingKeyAndHandler) {
                // Note that topologicalSortBindings has already filtered out any nonexistent binding handlers,
                // so bindingKeyAndHandler.handler will always be nonnull.
                var handlerInitFn = bindingKeyAndHandler.handler["init"],
                    handlerUpdateFn = bindingKeyAndHandler.handler["update"],
                    bindingKey = bindingKeyAndHandler.key;

                if (node.nodeType === 8) {
                    validateThatBindingIsAllowedForVirtualElements(bindingKey);
                }

                try {
                    // Run init, ignoring any dependencies
                    if (typeof handlerInitFn == "function") {
                        ko.dependencyDetection.ignore(function() {
                            var initResult = handlerInitFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);

                            // If this binding handler claims to control descendant bindings, make a note of this
                            if (initResult && initResult['controlsDescendantBindings']) {
                                if (bindingHandlerThatControlsDescendantBindings !== undefined)
                                    throw new Error("Multiple bindings (" + bindingHandlerThatControlsDescendantBindings + " and " + bindingKey + ") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");
                                bindingHandlerThatControlsDescendantBindings = bindingKey;
                            }
                        });
                    }

                    // Run update in its own computed wrapper
                    if (typeof handlerUpdateFn == "function") {
                        ko.dependentObservable(
                            function() {
                                handlerUpdateFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);
                            },
                            null,
                            { disposeWhenNodeIsRemoved: node }
                        );
                    }
                } catch (ex) {
                    ex.message = "Unable to process binding \"" + bindingKey + ": " + bindings[bindingKey] + "\"\nMessage: " + ex.message;
                    throw ex;
                }
            });
        }

        return {
            'shouldBindDescendants': bindingHandlerThatControlsDescendantBindings === undefined
        };
    };

    var storedBindingContextDomDataKey = ko.utils.domData.nextKey();
    ko.storedBindingContextForNode = function (node, bindingContext) {
        if (arguments.length == 2) {
            ko.utils.domData.set(node, storedBindingContextDomDataKey, bindingContext);
            if (bindingContext._subscribable)
                bindingContext._subscribable._addNode(node);
        } else {
            return ko.utils.domData.get(node, storedBindingContextDomDataKey);
        }
    }

    function getBindingContext(viewModelOrBindingContext) {
        return viewModelOrBindingContext && (viewModelOrBindingContext instanceof ko.bindingContext)
            ? viewModelOrBindingContext
            : new ko.bindingContext(viewModelOrBindingContext);
    }

    ko.applyBindingAccessorsToNode = function (node, bindings, viewModelOrBindingContext) {
        if (node.nodeType === 1) // If it's an element, workaround IE <= 8 HTML parsing weirdness
            ko.virtualElements.normaliseVirtualElementDomStructure(node);
        return applyBindingsToNodeInternal(node, bindings, getBindingContext(viewModelOrBindingContext), true);
    };

    ko.applyBindingsToNode = function (node, bindings, viewModelOrBindingContext) {
        var context = getBindingContext(viewModelOrBindingContext);
        return ko.applyBindingAccessorsToNode(node, makeBindingAccessors(bindings, context, node), context);
    };

    ko.applyBindingsToDescendants = function(viewModelOrBindingContext, rootNode) {
        if (rootNode.nodeType === 1 || rootNode.nodeType === 8)
            applyBindingsToDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
    };

    ko.applyBindings = function (viewModelOrBindingContext, rootNode) {
        // If jQuery is loaded after Knockout, we won't initially have access to it. So save it here.
        if (!jQueryInstance && window['jQuery']) {
            jQueryInstance = window['jQuery'];
        }

        if (rootNode && (rootNode.nodeType !== 1) && (rootNode.nodeType !== 8))
            throw new Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");
        rootNode = rootNode || window.document.body; // Make "rootNode" parameter optional

        applyBindingsToNodeAndDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
    };

    // Retrieving binding context from arbitrary nodes
    ko.contextFor = function(node) {
        // We can only do something meaningful for elements and comment nodes (in particular, not text nodes, as IE can't store domdata for them)
        switch (node.nodeType) {
            case 1:
            case 8:
                var context = ko.storedBindingContextForNode(node);
                if (context) return context;
                if (node.parentNode) return ko.contextFor(node.parentNode);
                break;
        }
        return undefined;
    };
    ko.dataFor = function(node) {
        var context = ko.contextFor(node);
        return context ? context['$data'] : undefined;
    };

    ko.exportSymbol('bindingHandlers', ko.bindingHandlers);
    ko.exportSymbol('applyBindings', ko.applyBindings);
    ko.exportSymbol('applyBindingsToDescendants', ko.applyBindingsToDescendants);
    ko.exportSymbol('applyBindingAccessorsToNode', ko.applyBindingAccessorsToNode);
    ko.exportSymbol('applyBindingsToNode', ko.applyBindingsToNode);
    ko.exportSymbol('contextFor', ko.contextFor);
    ko.exportSymbol('dataFor', ko.dataFor);
})();
(function(undefined) {
    var loadingSubscribablesCache = {}, // Tracks component loads that are currently in flight
        loadedDefinitionsCache = {};    // Tracks component loads that have already completed

    ko.components = {
        get: function(componentName, callback) {
            var cachedDefinition = getObjectOwnProperty(loadedDefinitionsCache, componentName);
            if (cachedDefinition) {
                // It's already loaded and cached. Reuse the same definition object.
                // Note that for API consistency, even cache hits complete asynchronously by default.
                // You can bypass this by putting synchronous:true on your component config.
                if (cachedDefinition.isSynchronousComponent) {
                    ko.dependencyDetection.ignore(function() { // See comment in loaderRegistryBehaviors.js for reasoning
                        callback(cachedDefinition.definition);
                    });
                } else {
                    ko.tasks.schedule(function() { callback(cachedDefinition.definition); });
                }
            } else {
                // Join the loading process that is already underway, or start a new one.
                loadComponentAndNotify(componentName, callback);
            }
        },

        clearCachedDefinition: function(componentName) {
            delete loadedDefinitionsCache[componentName];
        },

        _getFirstResultFromLoaders: getFirstResultFromLoaders
    };

    function getObjectOwnProperty(obj, propName) {
        return obj.hasOwnProperty(propName) ? obj[propName] : undefined;
    }

    function loadComponentAndNotify(componentName, callback) {
        var subscribable = getObjectOwnProperty(loadingSubscribablesCache, componentName),
            completedAsync;
        if (!subscribable) {
            // It's not started loading yet. Start loading, and when it's done, move it to loadedDefinitionsCache.
            subscribable = loadingSubscribablesCache[componentName] = new ko.subscribable();
            subscribable.subscribe(callback);

            beginLoadingComponent(componentName, function(definition, config) {
                var isSynchronousComponent = !!(config && config['synchronous']);
                loadedDefinitionsCache[componentName] = { definition: definition, isSynchronousComponent: isSynchronousComponent };
                delete loadingSubscribablesCache[componentName];

                // For API consistency, all loads complete asynchronously. However we want to avoid
                // adding an extra task schedule if it's unnecessary (i.e., the completion is already
                // async).
                //
                // You can bypass the 'always asynchronous' feature by putting the synchronous:true
                // flag on your component configuration when you register it.
                if (completedAsync || isSynchronousComponent) {
                    // Note that notifySubscribers ignores any dependencies read within the callback.
                    // See comment in loaderRegistryBehaviors.js for reasoning
                    subscribable['notifySubscribers'](definition);
                } else {
                    ko.tasks.schedule(function() {
                        subscribable['notifySubscribers'](definition);
                    });
                }
            });
            completedAsync = true;
        } else {
            subscribable.subscribe(callback);
        }
    }

    function beginLoadingComponent(componentName, callback) {
        getFirstResultFromLoaders('getConfig', [componentName], function(config) {
            if (config) {
                // We have a config, so now load its definition
                getFirstResultFromLoaders('loadComponent', [componentName, config], function(definition) {
                    callback(definition, config);
                });
            } else {
                // The component has no config - it's unknown to all the loaders.
                // Note that this is not an error (e.g., a module loading error) - that would abort the
                // process and this callback would not run. For this callback to run, all loaders must
                // have confirmed they don't know about this component.
                callback(null, null);
            }
        });
    }

    function getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders) {
        // On the first call in the stack, start with the full set of loaders
        if (!candidateLoaders) {
            candidateLoaders = ko.components['loaders'].slice(0); // Use a copy, because we'll be mutating this array
        }

        // Try the next candidate
        var currentCandidateLoader = candidateLoaders.shift();
        if (currentCandidateLoader) {
            var methodInstance = currentCandidateLoader[methodName];
            if (methodInstance) {
                var wasAborted = false,
                    synchronousReturnValue = methodInstance.apply(currentCandidateLoader, argsExceptCallback.concat(function(result) {
                        if (wasAborted) {
                            callback(null);
                        } else if (result !== null) {
                            // This candidate returned a value. Use it.
                            callback(result);
                        } else {
                            // Try the next candidate
                            getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders);
                        }
                    }));

                // Currently, loaders may not return anything synchronously. This leaves open the possibility
                // that we'll extend the API to support synchronous return values in the future. It won't be
                // a breaking change, because currently no loader is allowed to return anything except undefined.
                if (synchronousReturnValue !== undefined) {
                    wasAborted = true;

                    // Method to suppress exceptions will remain undocumented. This is only to keep
                    // KO's specs running tidily, since we can observe the loading got aborted without
                    // having exceptions cluttering up the console too.
                    if (!currentCandidateLoader['suppressLoaderExceptions']) {
                        throw new Error('Component loaders must supply values by invoking the callback, not by returning values synchronously.');
                    }
                }
            } else {
                // This candidate doesn't have the relevant handler. Synchronously move on to the next one.
                getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders);
            }
        } else {
            // No candidates returned a value
            callback(null);
        }
    }

    // Reference the loaders via string name so it's possible for developers
    // to replace the whole array by assigning to ko.components.loaders
    ko.components['loaders'] = [];

    ko.exportSymbol('components', ko.components);
    ko.exportSymbol('components.get', ko.components.get);
    ko.exportSymbol('components.clearCachedDefinition', ko.components.clearCachedDefinition);
})();
(function(undefined) {

    // The default loader is responsible for two things:
    // 1. Maintaining the default in-memory registry of component configuration objects
    //    (i.e., the thing you're writing to when you call ko.components.register(someName, ...))
    // 2. Answering requests for components by fetching configuration objects
    //    from that default in-memory registry and resolving them into standard
    //    component definition objects (of the form { createViewModel: ..., template: ... })
    // Custom loaders may override either of these facilities, i.e.,
    // 1. To supply configuration objects from some other source (e.g., conventions)
    // 2. Or, to resolve configuration objects by loading viewmodels/templates via arbitrary logic.

    var defaultConfigRegistry = {};

    ko.components.register = function(componentName, config) {
        if (!config) {
            throw new Error('Invalid configuration for ' + componentName);
        }

        if (ko.components.isRegistered(componentName)) {
            throw new Error('Component ' + componentName + ' is already registered');
        }

        defaultConfigRegistry[componentName] = config;
    };

    ko.components.isRegistered = function(componentName) {
        return defaultConfigRegistry.hasOwnProperty(componentName);
    };

    ko.components.unregister = function(componentName) {
        delete defaultConfigRegistry[componentName];
        ko.components.clearCachedDefinition(componentName);
    };

    ko.components.defaultLoader = {
        'getConfig': function(componentName, callback) {
            var result = defaultConfigRegistry.hasOwnProperty(componentName)
                ? defaultConfigRegistry[componentName]
                : null;
            callback(result);
        },

        'loadComponent': function(componentName, config, callback) {
            var errorCallback = makeErrorCallback(componentName);
            possiblyGetConfigFromAmd(errorCallback, config, function(loadedConfig) {
                resolveConfig(componentName, errorCallback, loadedConfig, callback);
            });
        },

        'loadTemplate': function(componentName, templateConfig, callback) {
            resolveTemplate(makeErrorCallback(componentName), templateConfig, callback);
        },

        'loadViewModel': function(componentName, viewModelConfig, callback) {
            resolveViewModel(makeErrorCallback(componentName), viewModelConfig, callback);
        }
    };

    var createViewModelKey = 'createViewModel';

    // Takes a config object of the form { template: ..., viewModel: ... }, and asynchronously convert it
    // into the standard component definition format:
    //    { template: <ArrayOfDomNodes>, createViewModel: function(params, componentInfo) { ... } }.
    // Since both template and viewModel may need to be resolved asynchronously, both tasks are performed
    // in parallel, and the results joined when both are ready. We don't depend on any promises infrastructure,
    // so this is implemented manually below.
    function resolveConfig(componentName, errorCallback, config, callback) {
        var result = {},
            makeCallBackWhenZero = 2,
            tryIssueCallback = function() {
                if (--makeCallBackWhenZero === 0) {
                    callback(result);
                }
            },
            templateConfig = config['template'],
            viewModelConfig = config['viewModel'];

        if (templateConfig) {
            possiblyGetConfigFromAmd(errorCallback, templateConfig, function(loadedConfig) {
                ko.components._getFirstResultFromLoaders('loadTemplate', [componentName, loadedConfig], function(resolvedTemplate) {
                    result['template'] = resolvedTemplate;
                    tryIssueCallback();
                });
            });
        } else {
            tryIssueCallback();
        }

        if (viewModelConfig) {
            possiblyGetConfigFromAmd(errorCallback, viewModelConfig, function(loadedConfig) {
                ko.components._getFirstResultFromLoaders('loadViewModel', [componentName, loadedConfig], function(resolvedViewModel) {
                    result[createViewModelKey] = resolvedViewModel;
                    tryIssueCallback();
                });
            });
        } else {
            tryIssueCallback();
        }
    }

    function resolveTemplate(errorCallback, templateConfig, callback) {
        if (typeof templateConfig === 'string') {
            // Markup - parse it
            callback(ko.utils.parseHtmlFragment(templateConfig));
        } else if (templateConfig instanceof Array) {
            // Assume already an array of DOM nodes - pass through unchanged
            callback(templateConfig);
        } else if (isDocumentFragment(templateConfig)) {
            // Document fragment - use its child nodes
            callback(ko.utils.makeArray(templateConfig.childNodes));
        } else if (templateConfig['element']) {
            var element = templateConfig['element'];
            if (isDomElement(element)) {
                // Element instance - copy its child nodes
                callback(cloneNodesFromTemplateSourceElement(element));
            } else if (typeof element === 'string') {
                // Element ID - find it, then copy its child nodes
                var elemInstance = document.getElementById(element);
                if (elemInstance) {
                    callback(cloneNodesFromTemplateSourceElement(elemInstance));
                } else {
                    errorCallback('Cannot find element with ID ' + element);
                }
            } else {
                errorCallback('Unknown element type: ' + element);
            }
        } else {
            errorCallback('Unknown template value: ' + templateConfig);
        }
    }

    function resolveViewModel(errorCallback, viewModelConfig, callback) {
        if (typeof viewModelConfig === 'function') {
            // Constructor - convert to standard factory function format
            // By design, this does *not* supply componentInfo to the constructor, as the intent is that
            // componentInfo contains non-viewmodel data (e.g., the component's element) that should only
            // be used in factory functions, not viewmodel constructors.
            callback(function (params /*, componentInfo */) {
                return new viewModelConfig(params);
            });
        } else if (typeof viewModelConfig[createViewModelKey] === 'function') {
            // Already a factory function - use it as-is
            callback(viewModelConfig[createViewModelKey]);
        } else if ('instance' in viewModelConfig) {
            // Fixed object instance - promote to createViewModel format for API consistency
            var fixedInstance = viewModelConfig['instance'];
            callback(function (params, componentInfo) {
                return fixedInstance;
            });
        } else if ('viewModel' in viewModelConfig) {
            // Resolved AMD module whose value is of the form { viewModel: ... }
            resolveViewModel(errorCallback, viewModelConfig['viewModel'], callback);
        } else {
            errorCallback('Unknown viewModel value: ' + viewModelConfig);
        }
    }

    function cloneNodesFromTemplateSourceElement(elemInstance) {
        switch (ko.utils.tagNameLower(elemInstance)) {
            case 'script':
                return ko.utils.parseHtmlFragment(elemInstance.text);
            case 'textarea':
                return ko.utils.parseHtmlFragment(elemInstance.value);
            case 'template':
                // For browsers with proper <template> element support (i.e., where the .content property
                // gives a document fragment), use that document fragment.
                if (isDocumentFragment(elemInstance.content)) {
                    return ko.utils.cloneNodes(elemInstance.content.childNodes);
                }
        }

        // Regular elements such as <div>, and <template> elements on old browsers that don't really
        // understand <template> and just treat it as a regular container
        return ko.utils.cloneNodes(elemInstance.childNodes);
    }

    function isDomElement(obj) {
        if (window['HTMLElement']) {
            return obj instanceof HTMLElement;
        } else {
            return obj && obj.tagName && obj.nodeType === 1;
        }
    }

    function isDocumentFragment(obj) {
        if (window['DocumentFragment']) {
            return obj instanceof DocumentFragment;
        } else {
            return obj && obj.nodeType === 11;
        }
    }

    function possiblyGetConfigFromAmd(errorCallback, config, callback) {
        if (typeof config['require'] === 'string') {
            // The config is the value of an AMD module
            if (amdRequire || window['require']) {
                (amdRequire || window['require'])([config['require']], callback);
            } else {
                errorCallback('Uses require, but no AMD loader is present');
            }
        } else {
            callback(config);
        }
    }

    function makeErrorCallback(componentName) {
        return function (message) {
            throw new Error('Component \'' + componentName + '\': ' + message);
        };
    }

    ko.exportSymbol('components.register', ko.components.register);
    ko.exportSymbol('components.isRegistered', ko.components.isRegistered);
    ko.exportSymbol('components.unregister', ko.components.unregister);

    // Expose the default loader so that developers can directly ask it for configuration
    // or to resolve configuration
    ko.exportSymbol('components.defaultLoader', ko.components.defaultLoader);

    // By default, the default loader is the only registered component loader
    ko.components['loaders'].push(ko.components.defaultLoader);

    // Privately expose the underlying config registry for use in old-IE shim
    ko.components._allRegisteredComponents = defaultConfigRegistry;
})();
(function (undefined) {
    // Overridable API for determining which component name applies to a given node. By overriding this,
    // you can for example map specific tagNames to components that are not preregistered.
    ko.components['getComponentNameForNode'] = function(node) {
        var tagNameLower = ko.utils.tagNameLower(node);
        if (ko.components.isRegistered(tagNameLower)) {
            // Try to determine that this node can be considered a *custom* element; see https://github.com/knockout/knockout/issues/1603
            if (tagNameLower.indexOf('-') != -1 || ('' + node) == "[object HTMLUnknownElement]" || (ko.utils.ieVersion <= 8 && node.tagName === tagNameLower)) {
                return tagNameLower;
            }
        }
    };

    ko.components.addBindingsForCustomElement = function(allBindings, node, bindingContext, valueAccessors) {
        // Determine if it's really a custom element matching a component
        if (node.nodeType === 1) {
            var componentName = ko.components['getComponentNameForNode'](node);
            if (componentName) {
                // It does represent a component, so add a component binding for it
                allBindings = allBindings || {};

                if (allBindings['component']) {
                    // Avoid silently overwriting some other 'component' binding that may already be on the element
                    throw new Error('Cannot use the "component" binding on a custom element matching a component');
                }

                var componentBindingValue = { 'name': componentName, 'params': getComponentParamsFromCustomElement(node, bindingContext) };

                allBindings['component'] = valueAccessors
                    ? function() { return componentBindingValue; }
                    : componentBindingValue;
            }
        }

        return allBindings;
    }

    var nativeBindingProviderInstance = new ko.bindingProvider();

    function getComponentParamsFromCustomElement(elem, bindingContext) {
        var paramsAttribute = elem.getAttribute('params');

        if (paramsAttribute) {
            var params = nativeBindingProviderInstance['parseBindingsString'](paramsAttribute, bindingContext, elem, { 'valueAccessors': true, 'bindingParams': true }),
                rawParamComputedValues = ko.utils.objectMap(params, function(paramValue, paramName) {
                    return ko.computed(paramValue, null, { disposeWhenNodeIsRemoved: elem });
                }),
                result = ko.utils.objectMap(rawParamComputedValues, function(paramValueComputed, paramName) {
                    var paramValue = paramValueComputed.peek();
                    // Does the evaluation of the parameter value unwrap any observables?
                    if (!paramValueComputed.isActive()) {
                        // No it doesn't, so there's no need for any computed wrapper. Just pass through the supplied value directly.
                        // Example: "someVal: firstName, age: 123" (whether or not firstName is an observable/computed)
                        return paramValue;
                    } else {
                        // Yes it does. Supply a computed property that unwraps both the outer (binding expression)
                        // level of observability, and any inner (resulting model value) level of observability.
                        // This means the component doesn't have to worry about multiple unwrapping. If the value is a
                        // writable observable, the computed will also be writable and pass the value on to the observable.
                        return ko.computed({
                            'read': function() {
                                return ko.utils.unwrapObservable(paramValueComputed());
                            },
                            'write': ko.isWriteableObservable(paramValue) && function(value) {
                                paramValueComputed()(value);
                            },
                            disposeWhenNodeIsRemoved: elem
                        });
                    }
                });

            // Give access to the raw computeds, as long as that wouldn't overwrite any custom param also called '$raw'
            // This is in case the developer wants to react to outer (binding) observability separately from inner
            // (model value) observability, or in case the model value observable has subobservables.
            if (!result.hasOwnProperty('$raw')) {
                result['$raw'] = rawParamComputedValues;
            }

            return result;
        } else {
            // For consistency, absence of a "params" attribute is treated the same as the presence of
            // any empty one. Otherwise component viewmodels need special code to check whether or not
            // 'params' or 'params.$raw' is null/undefined before reading subproperties, which is annoying.
            return { '$raw': {} };
        }
    }

    // --------------------------------------------------------------------------------
    // Compatibility code for older (pre-HTML5) IE browsers

    if (ko.utils.ieVersion < 9) {
        // Whenever you preregister a component, enable it as a custom element in the current document
        ko.components['register'] = (function(originalFunction) {
            return function(componentName) {
                document.createElement(componentName); // Allows IE<9 to parse markup containing the custom element
                return originalFunction.apply(this, arguments);
            }
        })(ko.components['register']);

        // Whenever you create a document fragment, enable all preregistered component names as custom elements
        // This is needed to make innerShiv/jQuery HTML parsing correctly handle the custom elements
        document.createDocumentFragment = (function(originalFunction) {
            return function() {
                var newDocFrag = originalFunction(),
                    allComponents = ko.components._allRegisteredComponents;
                for (var componentName in allComponents) {
                    if (allComponents.hasOwnProperty(componentName)) {
                        newDocFrag.createElement(componentName);
                    }
                }
                return newDocFrag;
            };
        })(document.createDocumentFragment);
    }
})();(function(undefined) {

    var componentLoadingOperationUniqueId = 0;

    ko.bindingHandlers['component'] = {
        'init': function(element, valueAccessor, ignored1, ignored2, bindingContext) {
            var currentViewModel,
                currentLoadingOperationId,
                disposeAssociatedComponentViewModel = function () {
                    var currentViewModelDispose = currentViewModel && currentViewModel['dispose'];
                    if (typeof currentViewModelDispose === 'function') {
                        currentViewModelDispose.call(currentViewModel);
                    }
                    currentViewModel = null;
                    // Any in-flight loading operation is no longer relevant, so make sure we ignore its completion
                    currentLoadingOperationId = null;
                },
                originalChildNodes = ko.utils.makeArray(ko.virtualElements.childNodes(element));

            ko.utils.domNodeDisposal.addDisposeCallback(element, disposeAssociatedComponentViewModel);

            ko.computed(function () {
                var value = ko.utils.unwrapObservable(valueAccessor()),
                    componentName, componentParams;

                if (typeof value === 'string') {
                    componentName = value;
                } else {
                    componentName = ko.utils.unwrapObservable(value['name']);
                    componentParams = ko.utils.unwrapObservable(value['params']);
                }

                if (!componentName) {
                    throw new Error('No component name specified');
                }

                var loadingOperationId = currentLoadingOperationId = ++componentLoadingOperationUniqueId;
                ko.components.get(componentName, function(componentDefinition) {
                    // If this is not the current load operation for this element, ignore it.
                    if (currentLoadingOperationId !== loadingOperationId) {
                        return;
                    }

                    // Clean up previous state
                    disposeAssociatedComponentViewModel();

                    // Instantiate and bind new component. Implicitly this cleans any old DOM nodes.
                    if (!componentDefinition) {
                        throw new Error('Unknown component \'' + componentName + '\'');
                    }
                    cloneTemplateIntoElement(componentName, componentDefinition, element);
                    var componentViewModel = createViewModel(componentDefinition, element, originalChildNodes, componentParams),
                        childBindingContext = bindingContext['createChildContext'](componentViewModel, /* dataItemAlias */ undefined, function(ctx) {
                            ctx['$component'] = componentViewModel;
                            ctx['$componentTemplateNodes'] = originalChildNodes;
                        });
                    currentViewModel = componentViewModel;
                    ko.applyBindingsToDescendants(childBindingContext, element);
                });
            }, null, { disposeWhenNodeIsRemoved: element });

            return { 'controlsDescendantBindings': true };
        }
    };

    ko.virtualElements.allowedBindings['component'] = true;

    function cloneTemplateIntoElement(componentName, componentDefinition, element) {
        var template = componentDefinition['template'];
        if (!template) {
            throw new Error('Component \'' + componentName + '\' has no template');
        }

        var clonedNodesArray = ko.utils.cloneNodes(template);
        ko.virtualElements.setDomNodeChildren(element, clonedNodesArray);
    }

    function createViewModel(componentDefinition, element, originalChildNodes, componentParams) {
        var componentViewModelFactory = componentDefinition['createViewModel'];
        return componentViewModelFactory
            ? componentViewModelFactory.call(componentDefinition, componentParams, { 'element': element, 'templateNodes': originalChildNodes })
            : componentParams; // Template-only component
    }

})();
var attrHtmlToJavascriptMap = { 'class': 'className', 'for': 'htmlFor' };
ko.bindingHandlers['attr'] = {
    'update': function(element, valueAccessor, allBindings) {
        var value = ko.utils.unwrapObservable(valueAccessor()) || {};
        ko.utils.objectForEach(value, function(attrName, attrValue) {
            attrValue = ko.utils.unwrapObservable(attrValue);

            // To cover cases like "attr: { checked:someProp }", we want to remove the attribute entirely
            // when someProp is a "no value"-like value (strictly null, false, or undefined)
            // (because the absence of the "checked" attr is how to mark an element as not checked, etc.)
            var toRemove = (attrValue === false) || (attrValue === null) || (attrValue === undefined);
            if (toRemove)
                element.removeAttribute(attrName);

            // In IE <= 7 and IE8 Quirks Mode, you have to use the Javascript property name instead of the
            // HTML attribute name for certain attributes. IE8 Standards Mode supports the correct behavior,
            // but instead of figuring out the mode, we'll just set the attribute through the Javascript
            // property for IE <= 8.
            if (ko.utils.ieVersion <= 8 && attrName in attrHtmlToJavascriptMap) {
                attrName = attrHtmlToJavascriptMap[attrName];
                if (toRemove)
                    element.removeAttribute(attrName);
                else
                    element[attrName] = attrValue;
            } else if (!toRemove) {
                element.setAttribute(attrName, attrValue.toString());
            }

            // Treat "name" specially - although you can think of it as an attribute, it also needs
            // special handling on older versions of IE (https://github.com/SteveSanderson/knockout/pull/333)
            // Deliberately being case-sensitive here because XHTML would regard "Name" as a different thing
            // entirely, and there's no strong reason to allow for such casing in HTML.
            if (attrName === "name") {
                ko.utils.setElementName(element, toRemove ? "" : attrValue.toString());
            }
        });
    }
};
(function() {

ko.bindingHandlers['checked'] = {
    'after': ['value', 'attr'],
    'init': function (element, valueAccessor, allBindings) {
        var checkedValue = ko.pureComputed(function() {
            // Treat "value" like "checkedValue" when it is included with "checked" binding
            if (allBindings['has']('checkedValue')) {
                return ko.utils.unwrapObservable(allBindings.get('checkedValue'));
            } else if (allBindings['has']('value')) {
                return ko.utils.unwrapObservable(allBindings.get('value'));
            }

            return element.value;
        });

        function updateModel() {
            // This updates the model value from the view value.
            // It runs in response to DOM events (click) and changes in checkedValue.
            var isChecked = element.checked,
                elemValue = useCheckedValue ? checkedValue() : isChecked;

            // When we're first setting up this computed, don't change any model state.
            if (ko.computedContext.isInitial()) {
                return;
            }

            // We can ignore unchecked radio buttons, because some other radio
            // button will be getting checked, and that one can take care of updating state.
            if (isRadio && !isChecked) {
                return;
            }

            var modelValue = ko.dependencyDetection.ignore(valueAccessor);
            if (valueIsArray) {
                var writableValue = rawValueIsNonArrayObservable ? modelValue.peek() : modelValue;
                if (oldElemValue !== elemValue) {
                    // When we're responding to the checkedValue changing, and the element is
                    // currently checked, replace the old elem value with the new elem value
                    // in the model array.
                    if (isChecked) {
                        ko.utils.addOrRemoveItem(writableValue, elemValue, true);
                        ko.utils.addOrRemoveItem(writableValue, oldElemValue, false);
                    }

                    oldElemValue = elemValue;
                } else {
                    // When we're responding to the user having checked/unchecked a checkbox,
                    // add/remove the element value to the model array.
                    ko.utils.addOrRemoveItem(writableValue, elemValue, isChecked);
                }
                if (rawValueIsNonArrayObservable && ko.isWriteableObservable(modelValue)) {
                    modelValue(writableValue);
                }
            } else {
                ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'checked', elemValue, true);
            }
        };

        function updateView() {
            // This updates the view value from the model value.
            // It runs in response to changes in the bound (checked) value.
            var modelValue = ko.utils.unwrapObservable(valueAccessor());

            if (valueIsArray) {
                // When a checkbox is bound to an array, being checked represents its value being present in that array
                element.checked = ko.utils.arrayIndexOf(modelValue, checkedValue()) >= 0;
            } else if (isCheckbox) {
                // When a checkbox is bound to any other value (not an array), being checked represents the value being trueish
                element.checked = modelValue;
            } else {
                // For radio buttons, being checked means that the radio button's value corresponds to the model value
                element.checked = (checkedValue() === modelValue);
            }
        };

        var isCheckbox = element.type == "checkbox",
            isRadio = element.type == "radio";

        // Only bind to check boxes and radio buttons
        if (!isCheckbox && !isRadio) {
            return;
        }

        var rawValue = valueAccessor(),
            valueIsArray = isCheckbox && (ko.utils.unwrapObservable(rawValue) instanceof Array),
            rawValueIsNonArrayObservable = !(valueIsArray && rawValue.push && rawValue.splice),
            oldElemValue = valueIsArray ? checkedValue() : undefined,
            useCheckedValue = isRadio || valueIsArray;

        // IE 6 won't allow radio buttons to be selected unless they have a name
        if (isRadio && !element.name)
            ko.bindingHandlers['uniqueName']['init'](element, function() { return true });

        // Set up two computeds to update the binding:

        // The first responds to changes in the checkedValue value and to element clicks
        ko.computed(updateModel, null, { disposeWhenNodeIsRemoved: element });
        ko.utils.registerEventHandler(element, "click", updateModel);

        // The second responds to changes in the model value (the one associated with the checked binding)
        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });

        rawValue = undefined;
    }
};
ko.expressionRewriting.twoWayBindings['checked'] = true;

ko.bindingHandlers['checkedValue'] = {
    'update': function (element, valueAccessor) {
        element.value = ko.utils.unwrapObservable(valueAccessor());
    }
};

})();var classesWrittenByBindingKey = '__ko__cssValue';
ko.bindingHandlers['css'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value !== null && typeof value == "object") {
            ko.utils.objectForEach(value, function(className, shouldHaveClass) {
                shouldHaveClass = ko.utils.unwrapObservable(shouldHaveClass);
                ko.utils.toggleDomNodeCssClass(element, className, shouldHaveClass);
            });
        } else {
            value = ko.utils.stringTrim(String(value || '')); // Make sure we don't try to store or set a non-string value
            ko.utils.toggleDomNodeCssClass(element, element[classesWrittenByBindingKey], false);
            element[classesWrittenByBindingKey] = value;
            ko.utils.toggleDomNodeCssClass(element, value, true);
        }
    }
};
ko.bindingHandlers['enable'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value && element.disabled)
            element.removeAttribute("disabled");
        else if ((!value) && (!element.disabled))
            element.disabled = true;
    }
};

ko.bindingHandlers['disable'] = {
    'update': function (element, valueAccessor) {
        ko.bindingHandlers['enable']['update'](element, function() { return !ko.utils.unwrapObservable(valueAccessor()) });
    }
};
// For certain common events (currently just 'click'), allow a simplified data-binding syntax
// e.g. click:handler instead of the usual full-length event:{click:handler}
function makeEventHandlerShortcut(eventName) {
    ko.bindingHandlers[eventName] = {
        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var newValueAccessor = function () {
                var result = {};
                result[eventName] = valueAccessor();
                return result;
            };
            return ko.bindingHandlers['event']['init'].call(this, element, newValueAccessor, allBindings, viewModel, bindingContext);
        }
    }
}

ko.bindingHandlers['event'] = {
    'init' : function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var eventsToHandle = valueAccessor() || {};
        ko.utils.objectForEach(eventsToHandle, function(eventName) {
            if (typeof eventName == "string") {
                ko.utils.registerEventHandler(element, eventName, function (event) {
                    var handlerReturnValue;
                    var handlerFunction = valueAccessor()[eventName];
                    if (!handlerFunction)
                        return;

                    try {
                        // Take all the event args, and prefix with the viewmodel
                        var argsForHandler = ko.utils.makeArray(arguments);
                        viewModel = bindingContext['$data'];
                        argsForHandler.unshift(viewModel);
                        handlerReturnValue = handlerFunction.apply(viewModel, argsForHandler);
                    } finally {
                        if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
                            if (event.preventDefault)
                                event.preventDefault();
                            else
                                event.returnValue = false;
                        }
                    }

                    var bubble = allBindings.get(eventName + 'Bubble') !== false;
                    if (!bubble) {
                        event.cancelBubble = true;
                        if (event.stopPropagation)
                            event.stopPropagation();
                    }
                });
            }
        });
    }
};
// "foreach: someExpression" is equivalent to "template: { foreach: someExpression }"
// "foreach: { data: someExpression, afterAdd: myfn }" is equivalent to "template: { foreach: someExpression, afterAdd: myfn }"
ko.bindingHandlers['foreach'] = {
    makeTemplateValueAccessor: function(valueAccessor) {
        return function() {
            var modelValue = valueAccessor(),
                unwrappedValue = ko.utils.peekObservable(modelValue);    // Unwrap without setting a dependency here

            // If unwrappedValue is the array, pass in the wrapped value on its own
            // The value will be unwrapped and tracked within the template binding
            // (See https://github.com/SteveSanderson/knockout/issues/523)
            if ((!unwrappedValue) || typeof unwrappedValue.length == "number")
                return { 'foreach': modelValue, 'templateEngine': ko.nativeTemplateEngine.instance };

            // If unwrappedValue.data is the array, preserve all relevant options and unwrap again value so we get updates
            ko.utils.unwrapObservable(modelValue);
            return {
                'foreach': unwrappedValue['data'],
                'as': unwrappedValue['as'],
                'includeDestroyed': unwrappedValue['includeDestroyed'],
                'afterAdd': unwrappedValue['afterAdd'],
                'beforeRemove': unwrappedValue['beforeRemove'],
                'afterRender': unwrappedValue['afterRender'],
                'beforeMove': unwrappedValue['beforeMove'],
                'afterMove': unwrappedValue['afterMove'],
                'templateEngine': ko.nativeTemplateEngine.instance
            };
        };
    },
    'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        return ko.bindingHandlers['template']['init'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor));
    },
    'update': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        return ko.bindingHandlers['template']['update'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor), allBindings, viewModel, bindingContext);
    }
};
ko.expressionRewriting.bindingRewriteValidators['foreach'] = false; // Can't rewrite control flow bindings
ko.virtualElements.allowedBindings['foreach'] = true;
var hasfocusUpdatingProperty = '__ko_hasfocusUpdating';
var hasfocusLastValue = '__ko_hasfocusLastValue';
ko.bindingHandlers['hasfocus'] = {
    'init': function(element, valueAccessor, allBindings) {
        var handleElementFocusChange = function(isFocused) {
            // Where possible, ignore which event was raised and determine focus state using activeElement,
            // as this avoids phantom focus/blur events raised when changing tabs in modern browsers.
            // However, not all KO-targeted browsers (Firefox 2) support activeElement. For those browsers,
            // prevent a loss of focus when changing tabs/windows by setting a flag that prevents hasfocus
            // from calling 'blur()' on the element when it loses focus.
            // Discussion at https://github.com/SteveSanderson/knockout/pull/352
            element[hasfocusUpdatingProperty] = true;
            var ownerDoc = element.ownerDocument;
            if ("activeElement" in ownerDoc) {
                var active;
                try {
                    active = ownerDoc.activeElement;
                } catch(e) {
                    // IE9 throws if you access activeElement during page load (see issue #703)
                    active = ownerDoc.body;
                }
                isFocused = (active === element);
            }
            var modelValue = valueAccessor();
            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'hasfocus', isFocused, true);

            //cache the latest value, so we can avoid unnecessarily calling focus/blur in the update function
            element[hasfocusLastValue] = isFocused;
            element[hasfocusUpdatingProperty] = false;
        };
        var handleElementFocusIn = handleElementFocusChange.bind(null, true);
        var handleElementFocusOut = handleElementFocusChange.bind(null, false);

        ko.utils.registerEventHandler(element, "focus", handleElementFocusIn);
        ko.utils.registerEventHandler(element, "focusin", handleElementFocusIn); // For IE
        ko.utils.registerEventHandler(element, "blur",  handleElementFocusOut);
        ko.utils.registerEventHandler(element, "focusout",  handleElementFocusOut); // For IE
    },
    'update': function(element, valueAccessor) {
        var value = !!ko.utils.unwrapObservable(valueAccessor());

        if (!element[hasfocusUpdatingProperty] && element[hasfocusLastValue] !== value) {
            value ? element.focus() : element.blur();

            // In IE, the blur method doesn't always cause the element to lose focus (for example, if the window is not in focus).
            // Setting focus to the body element does seem to be reliable in IE, but should only be used if we know that the current
            // element was focused already.
            if (!value && element[hasfocusLastValue]) {
                element.ownerDocument.body.focus();
            }

            // For IE, which doesn't reliably fire "focus" or "blur" events synchronously
            ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, value ? "focusin" : "focusout"]);
        }
    }
};
ko.expressionRewriting.twoWayBindings['hasfocus'] = true;

ko.bindingHandlers['hasFocus'] = ko.bindingHandlers['hasfocus']; // Make "hasFocus" an alias
ko.expressionRewriting.twoWayBindings['hasFocus'] = true;
ko.bindingHandlers['html'] = {
    'init': function() {
        // Prevent binding on the dynamically-injected HTML (as developers are unlikely to expect that, and it has security implications)
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor) {
        // setHtml will unwrap the value if needed
        ko.utils.setHtml(element, valueAccessor());
    }
};
// Makes a binding like with or if
function makeWithIfBinding(bindingKey, isWith, isNot, makeContextCallback) {
    ko.bindingHandlers[bindingKey] = {
        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var didDisplayOnLastUpdate,
                savedNodes;
            ko.computed(function() {
                var rawValue = valueAccessor(),
                    dataValue = ko.utils.unwrapObservable(rawValue),
                    shouldDisplay = !isNot !== !dataValue, // equivalent to isNot ? !dataValue : !!dataValue
                    isFirstRender = !savedNodes,
                    needsRefresh = isFirstRender || isWith || (shouldDisplay !== didDisplayOnLastUpdate);

                if (needsRefresh) {
                    // Save a copy of the inner nodes on the initial update, but only if we have dependencies.
                    if (isFirstRender && ko.computedContext.getDependenciesCount()) {
                        savedNodes = ko.utils.cloneNodes(ko.virtualElements.childNodes(element), true /* shouldCleanNodes */);
                    }

                    if (shouldDisplay) {
                        if (!isFirstRender) {
                            ko.virtualElements.setDomNodeChildren(element, ko.utils.cloneNodes(savedNodes));
                        }
                        ko.applyBindingsToDescendants(makeContextCallback ? makeContextCallback(bindingContext, rawValue) : bindingContext, element);
                    } else {
                        ko.virtualElements.emptyNode(element);
                    }

                    didDisplayOnLastUpdate = shouldDisplay;
                }
            }, null, { disposeWhenNodeIsRemoved: element });
            return { 'controlsDescendantBindings': true };
        }
    };
    ko.expressionRewriting.bindingRewriteValidators[bindingKey] = false; // Can't rewrite control flow bindings
    ko.virtualElements.allowedBindings[bindingKey] = true;
}

// Construct the actual binding handlers
makeWithIfBinding('if');
makeWithIfBinding('ifnot', false /* isWith */, true /* isNot */);
makeWithIfBinding('with', true /* isWith */, false /* isNot */,
    function(bindingContext, dataValue) {
        return bindingContext.createStaticChildContext(dataValue);
    }
);
var captionPlaceholder = {};
ko.bindingHandlers['options'] = {
    'init': function(element) {
        if (ko.utils.tagNameLower(element) !== "select")
            throw new Error("options binding applies only to SELECT elements");

        // Remove all existing <option>s.
        while (element.length > 0) {
            element.remove(0);
        }

        // Ensures that the binding processor doesn't try to bind the options
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor, allBindings) {
        function selectedOptions() {
            return ko.utils.arrayFilter(element.options, function (node) { return node.selected; });
        }

        var selectWasPreviouslyEmpty = element.length == 0,
            multiple = element.multiple,
            previousScrollTop = (!selectWasPreviouslyEmpty && multiple) ? element.scrollTop : null,
            unwrappedArray = ko.utils.unwrapObservable(valueAccessor()),
            valueAllowUnset = allBindings.get('valueAllowUnset') && allBindings['has']('value'),
            includeDestroyed = allBindings.get('optionsIncludeDestroyed'),
            arrayToDomNodeChildrenOptions = {},
            captionValue,
            filteredArray,
            previousSelectedValues = [];

        if (!valueAllowUnset) {
            if (multiple) {
                previousSelectedValues = ko.utils.arrayMap(selectedOptions(), ko.selectExtensions.readValue);
            } else if (element.selectedIndex >= 0) {
                previousSelectedValues.push(ko.selectExtensions.readValue(element.options[element.selectedIndex]));
            }
        }

        if (unwrappedArray) {
            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
                unwrappedArray = [unwrappedArray];

            // Filter out any entries marked as destroyed
            filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
                return includeDestroyed || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
            });

            // If caption is included, add it to the array
            if (allBindings['has']('optionsCaption')) {
                captionValue = ko.utils.unwrapObservable(allBindings.get('optionsCaption'));
                // If caption value is null or undefined, don't show a caption
                if (captionValue !== null && captionValue !== undefined) {
                    filteredArray.unshift(captionPlaceholder);
                }
            }
        } else {
            // If a falsy value is provided (e.g. null), we'll simply empty the select element
        }

        function applyToObject(object, predicate, defaultValue) {
            var predicateType = typeof predicate;
            if (predicateType == "function")    // Given a function; run it against the data value
                return predicate(object);
            else if (predicateType == "string") // Given a string; treat it as a property name on the data value
                return object[predicate];
            else                                // Given no optionsText arg; use the data value itself
                return defaultValue;
        }

        // The following functions can run at two different times:
        // The first is when the whole array is being updated directly from this binding handler.
        // The second is when an observable value for a specific array entry is updated.
        // oldOptions will be empty in the first case, but will be filled with the previously generated option in the second.
        var itemUpdate = false;
        function optionForArrayItem(arrayEntry, index, oldOptions) {
            if (oldOptions.length) {
                previousSelectedValues = !valueAllowUnset && oldOptions[0].selected ? [ ko.selectExtensions.readValue(oldOptions[0]) ] : [];
                itemUpdate = true;
            }
            var option = element.ownerDocument.createElement("option");
            if (arrayEntry === captionPlaceholder) {
                ko.utils.setTextContent(option, allBindings.get('optionsCaption'));
                ko.selectExtensions.writeValue(option, undefined);
            } else {
                // Apply a value to the option element
                var optionValue = applyToObject(arrayEntry, allBindings.get('optionsValue'), arrayEntry);
                ko.selectExtensions.writeValue(option, ko.utils.unwrapObservable(optionValue));

                // Apply some text to the option element
                var optionText = applyToObject(arrayEntry, allBindings.get('optionsText'), optionValue);
                ko.utils.setTextContent(option, optionText);
            }
            return [option];
        }

        // By using a beforeRemove callback, we delay the removal until after new items are added. This fixes a selection
        // problem in IE<=8 and Firefox. See https://github.com/knockout/knockout/issues/1208
        arrayToDomNodeChildrenOptions['beforeRemove'] =
            function (option) {
                element.removeChild(option);
            };

        function setSelectionCallback(arrayEntry, newOptions) {
            if (itemUpdate && valueAllowUnset) {
                // The model value is authoritative, so make sure its value is the one selected
                // There is no need to use dependencyDetection.ignore since setDomNodeChildrenFromArrayMapping does so already.
                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
            } else if (previousSelectedValues.length) {
                // IE6 doesn't like us to assign selection to OPTION nodes before they're added to the document.
                // That's why we first added them without selection. Now it's time to set the selection.
                var isSelected = ko.utils.arrayIndexOf(previousSelectedValues, ko.selectExtensions.readValue(newOptions[0])) >= 0;
                ko.utils.setOptionNodeSelectionState(newOptions[0], isSelected);

                // If this option was changed from being selected during a single-item update, notify the change
                if (itemUpdate && !isSelected) {
                    ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
                }
            }
        }

        var callback = setSelectionCallback;
        if (allBindings['has']('optionsAfterRender') && typeof allBindings.get('optionsAfterRender') == "function") {
            callback = function(arrayEntry, newOptions) {
                setSelectionCallback(arrayEntry, newOptions);
                ko.dependencyDetection.ignore(allBindings.get('optionsAfterRender'), null, [newOptions[0], arrayEntry !== captionPlaceholder ? arrayEntry : undefined]);
            }
        }

        ko.utils.setDomNodeChildrenFromArrayMapping(element, filteredArray, optionForArrayItem, arrayToDomNodeChildrenOptions, callback);

        ko.dependencyDetection.ignore(function () {
            if (valueAllowUnset) {
                // The model value is authoritative, so make sure its value is the one selected
                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
            } else {
                // Determine if the selection has changed as a result of updating the options list
                var selectionChanged;
                if (multiple) {
                    // For a multiple-select box, compare the new selection count to the previous one
                    // But if nothing was selected before, the selection can't have changed
                    selectionChanged = previousSelectedValues.length && selectedOptions().length < previousSelectedValues.length;
                } else {
                    // For a single-select box, compare the current value to the previous value
                    // But if nothing was selected before or nothing is selected now, just look for a change in selection
                    selectionChanged = (previousSelectedValues.length && element.selectedIndex >= 0)
                        ? (ko.selectExtensions.readValue(element.options[element.selectedIndex]) !== previousSelectedValues[0])
                        : (previousSelectedValues.length || element.selectedIndex >= 0);
                }

                // Ensure consistency between model value and selected option.
                // If the dropdown was changed so that selection is no longer the same,
                // notify the value or selectedOptions binding.
                if (selectionChanged) {
                    ko.utils.triggerEvent(element, "change");
                }
            }
        });

        // Workaround for IE bug
        ko.utils.ensureSelectElementIsRenderedCorrectly(element);

        if (previousScrollTop && Math.abs(previousScrollTop - element.scrollTop) > 20)
            element.scrollTop = previousScrollTop;
    }
};
ko.bindingHandlers['options'].optionValueDomDataKey = ko.utils.domData.nextKey();
ko.bindingHandlers['selectedOptions'] = {
    'after': ['options', 'foreach'],
    'init': function (element, valueAccessor, allBindings) {
        ko.utils.registerEventHandler(element, "change", function () {
            var value = valueAccessor(), valueToWrite = [];
            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
                if (node.selected)
                    valueToWrite.push(ko.selectExtensions.readValue(node));
            });
            ko.expressionRewriting.writeValueToProperty(value, allBindings, 'selectedOptions', valueToWrite);
        });
    },
    'update': function (element, valueAccessor) {
        if (ko.utils.tagNameLower(element) != "select")
            throw new Error("values binding applies only to SELECT elements");

        var newValue = ko.utils.unwrapObservable(valueAccessor()),
            previousScrollTop = element.scrollTop;

        if (newValue && typeof newValue.length == "number") {
            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
                var isSelected = ko.utils.arrayIndexOf(newValue, ko.selectExtensions.readValue(node)) >= 0;
                if (node.selected != isSelected) {      // This check prevents flashing of the select element in IE
                    ko.utils.setOptionNodeSelectionState(node, isSelected);
                }
            });
        }

        element.scrollTop = previousScrollTop;
    }
};
ko.expressionRewriting.twoWayBindings['selectedOptions'] = true;
ko.bindingHandlers['style'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor() || {});
        ko.utils.objectForEach(value, function(styleName, styleValue) {
            styleValue = ko.utils.unwrapObservable(styleValue);

            if (styleValue === null || styleValue === undefined || styleValue === false) {
                // Empty string removes the value, whereas null/undefined have no effect
                styleValue = "";
            }

            element.style[styleName] = styleValue;
        });
    }
};
ko.bindingHandlers['submit'] = {
    'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        if (typeof valueAccessor() != "function")
            throw new Error("The value for a submit binding must be a function");
        ko.utils.registerEventHandler(element, "submit", function (event) {
            var handlerReturnValue;
            var value = valueAccessor();
            try { handlerReturnValue = value.call(bindingContext['$data'], element); }
            finally {
                if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
                    if (event.preventDefault)
                        event.preventDefault();
                    else
                        event.returnValue = false;
                }
            }
        });
    }
};
ko.bindingHandlers['text'] = {
    'init': function() {
        // Prevent binding on the dynamically-injected text node (as developers are unlikely to expect that, and it has security implications).
        // It should also make things faster, as we no longer have to consider whether the text node might be bindable.
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor) {
        ko.utils.setTextContent(element, valueAccessor());
    }
};
ko.virtualElements.allowedBindings['text'] = true;
(function () {

if (window && window.navigator) {
    var parseVersion = function (matches) {
        if (matches) {
            return parseFloat(matches[1]);
        }
    };

    // Detect various browser versions because some old versions don't fully support the 'input' event
    var operaVersion = window.opera && window.opera.version && parseInt(window.opera.version()),
        userAgent = window.navigator.userAgent,
        safariVersion = parseVersion(userAgent.match(/^(?:(?!chrome).)*version\/([^ ]*) safari/i)),
        firefoxVersion = parseVersion(userAgent.match(/Firefox\/([^ ]*)/));
}

// IE 8 and 9 have bugs that prevent the normal events from firing when the value changes.
// But it does fire the 'selectionchange' event on many of those, presumably because the
// cursor is moving and that counts as the selection changing. The 'selectionchange' event is
// fired at the document level only and doesn't directly indicate which element changed. We
// set up just one event handler for the document and use 'activeElement' to determine which
// element was changed.
if (ko.utils.ieVersion < 10) {
    var selectionChangeRegisteredName = ko.utils.domData.nextKey(),
        selectionChangeHandlerName = ko.utils.domData.nextKey();
    var selectionChangeHandler = function(event) {
        var target = this.activeElement,
            handler = target && ko.utils.domData.get(target, selectionChangeHandlerName);
        if (handler) {
            handler(event);
        }
    };
    var registerForSelectionChangeEvent = function (element, handler) {
        var ownerDoc = element.ownerDocument;
        if (!ko.utils.domData.get(ownerDoc, selectionChangeRegisteredName)) {
            ko.utils.domData.set(ownerDoc, selectionChangeRegisteredName, true);
            ko.utils.registerEventHandler(ownerDoc, 'selectionchange', selectionChangeHandler);
        }
        ko.utils.domData.set(element, selectionChangeHandlerName, handler);
    };
}

ko.bindingHandlers['textInput'] = {
    'init': function (element, valueAccessor, allBindings) {

        var previousElementValue = element.value,
            timeoutHandle,
            elementValueBeforeEvent;

        var updateModel = function (event) {
            clearTimeout(timeoutHandle);
            elementValueBeforeEvent = timeoutHandle = undefined;

            var elementValue = element.value;
            if (previousElementValue !== elementValue) {
                // Provide a way for tests to know exactly which event was processed
                if (DEBUG && event) element['_ko_textInputProcessedEvent'] = event.type;
                previousElementValue = elementValue;
                ko.expressionRewriting.writeValueToProperty(valueAccessor(), allBindings, 'textInput', elementValue);
            }
        };

        var deferUpdateModel = function (event) {
            if (!timeoutHandle) {
                // The elementValueBeforeEvent variable is set *only* during the brief gap between an
                // event firing and the updateModel function running. This allows us to ignore model
                // updates that are from the previous state of the element, usually due to techniques
                // such as rateLimit. Such updates, if not ignored, can cause keystrokes to be lost.
                elementValueBeforeEvent = element.value;
                var handler = DEBUG ? updateModel.bind(element, {type: event.type}) : updateModel;
                timeoutHandle = ko.utils.setTimeout(handler, 4);
            }
        };

        // IE9 will mess up the DOM if you handle events synchronously which results in DOM changes (such as other bindings);
        // so we'll make sure all updates are asynchronous
        var ieUpdateModel = ko.utils.ieVersion == 9 ? deferUpdateModel : updateModel;

        var updateView = function () {
            var modelValue = ko.utils.unwrapObservable(valueAccessor());

            if (modelValue === null || modelValue === undefined) {
                modelValue = '';
            }

            if (elementValueBeforeEvent !== undefined && modelValue === elementValueBeforeEvent) {
                ko.utils.setTimeout(updateView, 4);
                return;
            }

            // Update the element only if the element and model are different. On some browsers, updating the value
            // will move the cursor to the end of the input, which would be bad while the user is typing.
            if (element.value !== modelValue) {
                previousElementValue = modelValue;  // Make sure we ignore events (propertychange) that result from updating the value
                element.value = modelValue;
            }
        };

        var onEvent = function (event, handler) {
            ko.utils.registerEventHandler(element, event, handler);
        };

        if (DEBUG && ko.bindingHandlers['textInput']['_forceUpdateOn']) {
            // Provide a way for tests to specify exactly which events are bound
            ko.utils.arrayForEach(ko.bindingHandlers['textInput']['_forceUpdateOn'], function(eventName) {
                if (eventName.slice(0,5) == 'after') {
                    onEvent(eventName.slice(5), deferUpdateModel);
                } else {
                    onEvent(eventName, updateModel);
                }
            });
        } else {
            if (ko.utils.ieVersion < 10) {
                // Internet Explorer <= 8 doesn't support the 'input' event, but does include 'propertychange' that fires whenever
                // any property of an element changes. Unlike 'input', it also fires if a property is changed from JavaScript code,
                // but that's an acceptable compromise for this binding. IE 9 does support 'input', but since it doesn't fire it
                // when using autocomplete, we'll use 'propertychange' for it also.
                onEvent('propertychange', function(event) {
                    if (event.propertyName === 'value') {
                        ieUpdateModel(event);
                    }
                });

                if (ko.utils.ieVersion == 8) {
                    // IE 8 has a bug where it fails to fire 'propertychange' on the first update following a value change from
                    // JavaScript code. It also doesn't fire if you clear the entire value. To fix this, we bind to the following
                    // events too.
                    onEvent('keyup', updateModel);      // A single keystoke
                    onEvent('keydown', updateModel);    // The first character when a key is held down
                }
                if (ko.utils.ieVersion >= 8) {
                    // Internet Explorer 9 doesn't fire the 'input' event when deleting text, including using
                    // the backspace, delete, or ctrl-x keys, clicking the 'x' to clear the input, dragging text
                    // out of the field, and cutting or deleting text using the context menu. 'selectionchange'
                    // can detect all of those except dragging text out of the field, for which we use 'dragend'.
                    // These are also needed in IE8 because of the bug described above.
                    registerForSelectionChangeEvent(element, ieUpdateModel);  // 'selectionchange' covers cut, paste, drop, delete, etc.
                    onEvent('dragend', deferUpdateModel);
                }
            } else {
                // All other supported browsers support the 'input' event, which fires whenever the content of the element is changed
                // through the user interface.
                onEvent('input', updateModel);

                if (safariVersion < 5 && ko.utils.tagNameLower(element) === "textarea") {
                    // Safari <5 doesn't fire the 'input' event for <textarea> elements (it does fire 'textInput'
                    // but only when typing). So we'll just catch as much as we can with keydown, cut, and paste.
                    onEvent('keydown', deferUpdateModel);
                    onEvent('paste', deferUpdateModel);
                    onEvent('cut', deferUpdateModel);
                } else if (operaVersion < 11) {
                    // Opera 10 doesn't always fire the 'input' event for cut, paste, undo & drop operations.
                    // We can try to catch some of those using 'keydown'.
                    onEvent('keydown', deferUpdateModel);
                } else if (firefoxVersion < 4.0) {
                    // Firefox <= 3.6 doesn't fire the 'input' event when text is filled in through autocomplete
                    onEvent('DOMAutoComplete', updateModel);

                    // Firefox <=3.5 doesn't fire the 'input' event when text is dropped into the input.
                    onEvent('dragdrop', updateModel);       // <3.5
                    onEvent('drop', updateModel);           // 3.5
                }
            }
        }

        // Bind to the change event so that we can catch programmatic updates of the value that fire this event.
        onEvent('change', updateModel);

        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });
    }
};
ko.expressionRewriting.twoWayBindings['textInput'] = true;

// textinput is an alias for textInput
ko.bindingHandlers['textinput'] = {
    // preprocess is the only way to set up a full alias
    'preprocess': function (value, name, addBinding) {
        addBinding('textInput', value);
    }
};

})();ko.bindingHandlers['uniqueName'] = {
    'init': function (element, valueAccessor) {
        if (valueAccessor()) {
            var name = "ko_unique_" + (++ko.bindingHandlers['uniqueName'].currentIndex);
            ko.utils.setElementName(element, name);
        }
    }
};
ko.bindingHandlers['uniqueName'].currentIndex = 0;
ko.bindingHandlers['value'] = {
    'after': ['options', 'foreach'],
    'init': function (element, valueAccessor, allBindings) {
        // If the value binding is placed on a radio/checkbox, then just pass through to checkedValue and quit
        if (element.tagName.toLowerCase() == "input" && (element.type == "checkbox" || element.type == "radio")) {
            ko.applyBindingAccessorsToNode(element, { 'checkedValue': valueAccessor });
            return;
        }

        // Always catch "change" event; possibly other events too if asked
        var eventsToCatch = ["change"];
        var requestedEventsToCatch = allBindings.get("valueUpdate");
        var propertyChangedFired = false;
        var elementValueBeforeEvent = null;

        if (requestedEventsToCatch) {
            if (typeof requestedEventsToCatch == "string") // Allow both individual event names, and arrays of event names
                requestedEventsToCatch = [requestedEventsToCatch];
            ko.utils.arrayPushAll(eventsToCatch, requestedEventsToCatch);
            eventsToCatch = ko.utils.arrayGetDistinctValues(eventsToCatch);
        }

        var valueUpdateHandler = function() {
            elementValueBeforeEvent = null;
            propertyChangedFired = false;
            var modelValue = valueAccessor();
            var elementValue = ko.selectExtensions.readValue(element);
            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'value', elementValue);
        }

        // Workaround for https://github.com/SteveSanderson/knockout/issues/122
        // IE doesn't fire "change" events on textboxes if the user selects a value from its autocomplete list
        var ieAutoCompleteHackNeeded = ko.utils.ieVersion && element.tagName.toLowerCase() == "input" && element.type == "text"
                                       && element.autocomplete != "off" && (!element.form || element.form.autocomplete != "off");
        if (ieAutoCompleteHackNeeded && ko.utils.arrayIndexOf(eventsToCatch, "propertychange") == -1) {
            ko.utils.registerEventHandler(element, "propertychange", function () { propertyChangedFired = true });
            ko.utils.registerEventHandler(element, "focus", function () { propertyChangedFired = false });
            ko.utils.registerEventHandler(element, "blur", function() {
                if (propertyChangedFired) {
                    valueUpdateHandler();
                }
            });
        }

        ko.utils.arrayForEach(eventsToCatch, function(eventName) {
            // The syntax "after<eventname>" means "run the handler asynchronously after the event"
            // This is useful, for example, to catch "keydown" events after the browser has updated the control
            // (otherwise, ko.selectExtensions.readValue(this) will receive the control's value *before* the key event)
            var handler = valueUpdateHandler;
            if (ko.utils.stringStartsWith(eventName, "after")) {
                handler = function() {
                    // The elementValueBeforeEvent variable is non-null *only* during the brief gap between
                    // a keyX event firing and the valueUpdateHandler running, which is scheduled to happen
                    // at the earliest asynchronous opportunity. We store this temporary information so that
                    // if, between keyX and valueUpdateHandler, the underlying model value changes separately,
                    // we can overwrite that model value change with the value the user just typed. Otherwise,
                    // techniques like rateLimit can trigger model changes at critical moments that will
                    // override the user's inputs, causing keystrokes to be lost.
                    elementValueBeforeEvent = ko.selectExtensions.readValue(element);
                    ko.utils.setTimeout(valueUpdateHandler, 0);
                };
                eventName = eventName.substring("after".length);
            }
            ko.utils.registerEventHandler(element, eventName, handler);
        });

        var updateFromModel = function () {
            var newValue = ko.utils.unwrapObservable(valueAccessor());
            var elementValue = ko.selectExtensions.readValue(element);

            if (elementValueBeforeEvent !== null && newValue === elementValueBeforeEvent) {
                ko.utils.setTimeout(updateFromModel, 0);
                return;
            }

            var valueHasChanged = (newValue !== elementValue);

            if (valueHasChanged) {
                if (ko.utils.tagNameLower(element) === "select") {
                    var allowUnset = allBindings.get('valueAllowUnset');
                    var applyValueAction = function () {
                        ko.selectExtensions.writeValue(element, newValue, allowUnset);
                    };
                    applyValueAction();

                    if (!allowUnset && newValue !== ko.selectExtensions.readValue(element)) {
                        // If you try to set a model value that can't be represented in an already-populated dropdown, reject that change,
                        // because you're not allowed to have a model value that disagrees with a visible UI selection.
                        ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
                    } else {
                        // Workaround for IE6 bug: It won't reliably apply values to SELECT nodes during the same execution thread
                        // right after you've changed the set of OPTION nodes on it. So for that node type, we'll schedule a second thread
                        // to apply the value as well.
                        ko.utils.setTimeout(applyValueAction, 0);
                    }
                } else {
                    ko.selectExtensions.writeValue(element, newValue);
                }
            }
        };

        ko.computed(updateFromModel, null, { disposeWhenNodeIsRemoved: element });
    },
    'update': function() {} // Keep for backwards compatibility with code that may have wrapped value binding
};
ko.expressionRewriting.twoWayBindings['value'] = true;
ko.bindingHandlers['visible'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var isCurrentlyVisible = !(element.style.display == "none");
        if (value && !isCurrentlyVisible)
            element.style.display = "";
        else if ((!value) && isCurrentlyVisible)
            element.style.display = "none";
    }
};
// 'click' is just a shorthand for the usual full-length event:{click:handler}
makeEventHandlerShortcut('click');
// If you want to make a custom template engine,
//
// [1] Inherit from this class (like ko.nativeTemplateEngine does)
// [2] Override 'renderTemplateSource', supplying a function with this signature:
//
//        function (templateSource, bindingContext, options) {
//            // - templateSource.text() is the text of the template you should render
//            // - bindingContext.$data is the data you should pass into the template
//            //   - you might also want to make bindingContext.$parent, bindingContext.$parents,
//            //     and bindingContext.$root available in the template too
//            // - options gives you access to any other properties set on "data-bind: { template: options }"
//            // - templateDocument is the document object of the template
//            //
//            // Return value: an array of DOM nodes
//        }
//
// [3] Override 'createJavaScriptEvaluatorBlock', supplying a function with this signature:
//
//        function (script) {
//            // Return value: Whatever syntax means "Evaluate the JavaScript statement 'script' and output the result"
//            //               For example, the jquery.tmpl template engine converts 'someScript' to '${ someScript }'
//        }
//
//     This is only necessary if you want to allow data-bind attributes to reference arbitrary template variables.
//     If you don't want to allow that, you can set the property 'allowTemplateRewriting' to false (like ko.nativeTemplateEngine does)
//     and then you don't need to override 'createJavaScriptEvaluatorBlock'.

ko.templateEngine = function () { };

ko.templateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options, templateDocument) {
    throw new Error("Override renderTemplateSource");
};

ko.templateEngine.prototype['createJavaScriptEvaluatorBlock'] = function (script) {
    throw new Error("Override createJavaScriptEvaluatorBlock");
};

ko.templateEngine.prototype['makeTemplateSource'] = function(template, templateDocument) {
    // Named template
    if (typeof template == "string") {
        templateDocument = templateDocument || document;
        var elem = templateDocument.getElementById(template);
        if (!elem)
            throw new Error("Cannot find template with ID " + template);
        return new ko.templateSources.domElement(elem);
    } else if ((template.nodeType == 1) || (template.nodeType == 8)) {
        // Anonymous template
        return new ko.templateSources.anonymousTemplate(template);
    } else
        throw new Error("Unknown template type: " + template);
};

ko.templateEngine.prototype['renderTemplate'] = function (template, bindingContext, options, templateDocument) {
    var templateSource = this['makeTemplateSource'](template, templateDocument);
    return this['renderTemplateSource'](templateSource, bindingContext, options, templateDocument);
};

ko.templateEngine.prototype['isTemplateRewritten'] = function (template, templateDocument) {
    // Skip rewriting if requested
    if (this['allowTemplateRewriting'] === false)
        return true;
    return this['makeTemplateSource'](template, templateDocument)['data']("isRewritten");
};

ko.templateEngine.prototype['rewriteTemplate'] = function (template, rewriterCallback, templateDocument) {
    var templateSource = this['makeTemplateSource'](template, templateDocument);
    var rewritten = rewriterCallback(templateSource['text']());
    templateSource['text'](rewritten);
    templateSource['data']("isRewritten", true);
};

ko.exportSymbol('templateEngine', ko.templateEngine);

ko.templateRewriting = (function () {
    var memoizeDataBindingAttributeSyntaxRegex = /(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'|[^>]*))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi;
    var memoizeVirtualContainerBindingSyntaxRegex = /<!--\s*ko\b\s*([\s\S]*?)\s*-->/g;

    function validateDataBindValuesForRewriting(keyValueArray) {
        var allValidators = ko.expressionRewriting.bindingRewriteValidators;
        for (var i = 0; i < keyValueArray.length; i++) {
            var key = keyValueArray[i]['key'];
            if (allValidators.hasOwnProperty(key)) {
                var validator = allValidators[key];

                if (typeof validator === "function") {
                    var possibleErrorMessage = validator(keyValueArray[i]['value']);
                    if (possibleErrorMessage)
                        throw new Error(possibleErrorMessage);
                } else if (!validator) {
                    throw new Error("This template engine does not support the '" + key + "' binding within its templates");
                }
            }
        }
    }

    function constructMemoizedTagReplacement(dataBindAttributeValue, tagToRetain, nodeName, templateEngine) {
        var dataBindKeyValueArray = ko.expressionRewriting.parseObjectLiteral(dataBindAttributeValue);
        validateDataBindValuesForRewriting(dataBindKeyValueArray);
        var rewrittenDataBindAttributeValue = ko.expressionRewriting.preProcessBindings(dataBindKeyValueArray, {'valueAccessors':true});

        // For no obvious reason, Opera fails to evaluate rewrittenDataBindAttributeValue unless it's wrapped in an additional
        // anonymous function, even though Opera's built-in debugger can evaluate it anyway. No other browser requires this
        // extra indirection.
        var applyBindingsToNextSiblingScript =
            "ko.__tr_ambtns(function($context,$element){return(function(){return{ " + rewrittenDataBindAttributeValue + " } })()},'" + nodeName.toLowerCase() + "')";
        return templateEngine['createJavaScriptEvaluatorBlock'](applyBindingsToNextSiblingScript) + tagToRetain;
    }

    return {
        ensureTemplateIsRewritten: function (template, templateEngine, templateDocument) {
            if (!templateEngine['isTemplateRewritten'](template, templateDocument))
                templateEngine['rewriteTemplate'](template, function (htmlString) {
                    return ko.templateRewriting.memoizeBindingAttributeSyntax(htmlString, templateEngine);
                }, templateDocument);
        },

        memoizeBindingAttributeSyntax: function (htmlString, templateEngine) {
            return htmlString.replace(memoizeDataBindingAttributeSyntaxRegex, function () {
                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[4], /* tagToRetain: */ arguments[1], /* nodeName: */ arguments[2], templateEngine);
            }).replace(memoizeVirtualContainerBindingSyntaxRegex, function() {
                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[1], /* tagToRetain: */ "<!-- ko -->", /* nodeName: */ "#comment", templateEngine);
            });
        },

        applyMemoizedBindingsToNextSibling: function (bindings, nodeName) {
            return ko.memoization.memoize(function (domNode, bindingContext) {
                var nodeToBind = domNode.nextSibling;
                if (nodeToBind && nodeToBind.nodeName.toLowerCase() === nodeName) {
                    ko.applyBindingAccessorsToNode(nodeToBind, bindings, bindingContext);
                }
            });
        }
    }
})();


// Exported only because it has to be referenced by string lookup from within rewritten template
ko.exportSymbol('__tr_ambtns', ko.templateRewriting.applyMemoizedBindingsToNextSibling);
(function() {
    // A template source represents a read/write way of accessing a template. This is to eliminate the need for template loading/saving
    // logic to be duplicated in every template engine (and means they can all work with anonymous templates, etc.)
    //
    // Two are provided by default:
    //  1. ko.templateSources.domElement       - reads/writes the text content of an arbitrary DOM element
    //  2. ko.templateSources.anonymousElement - uses ko.utils.domData to read/write text *associated* with the DOM element, but
    //                                           without reading/writing the actual element text content, since it will be overwritten
    //                                           with the rendered template output.
    // You can implement your own template source if you want to fetch/store templates somewhere other than in DOM elements.
    // Template sources need to have the following functions:
    //   text() 			- returns the template text from your storage location
    //   text(value)		- writes the supplied template text to your storage location
    //   data(key)			- reads values stored using data(key, value) - see below
    //   data(key, value)	- associates "value" with this template and the key "key". Is used to store information like "isRewritten".
    //
    // Optionally, template sources can also have the following functions:
    //   nodes()            - returns a DOM element containing the nodes of this template, where available
    //   nodes(value)       - writes the given DOM element to your storage location
    // If a DOM element is available for a given template source, template engines are encouraged to use it in preference over text()
    // for improved speed. However, all templateSources must supply text() even if they don't supply nodes().
    //
    // Once you've implemented a templateSource, make your template engine use it by subclassing whatever template engine you were
    // using and overriding "makeTemplateSource" to return an instance of your custom template source.

    ko.templateSources = {};

    // ---- ko.templateSources.domElement -----

    // template types
    var templateScript = 1,
        templateTextArea = 2,
        templateTemplate = 3,
        templateElement = 4;

    ko.templateSources.domElement = function(element) {
        this.domElement = element;

        if (element) {
            var tagNameLower = ko.utils.tagNameLower(element);
            this.templateType =
                tagNameLower === "script" ? templateScript :
                tagNameLower === "textarea" ? templateTextArea :
                    // For browsers with proper <template> element support, where the .content property gives a document fragment
                tagNameLower == "template" && element.content && element.content.nodeType === 11 ? templateTemplate :
                templateElement;
        }
    }

    ko.templateSources.domElement.prototype['text'] = function(/* valueToWrite */) {
        var elemContentsProperty = this.templateType === templateScript ? "text"
                                 : this.templateType === templateTextArea ? "value"
                                 : "innerHTML";

        if (arguments.length == 0) {
            return this.domElement[elemContentsProperty];
        } else {
            var valueToWrite = arguments[0];
            if (elemContentsProperty === "innerHTML")
                ko.utils.setHtml(this.domElement, valueToWrite);
            else
                this.domElement[elemContentsProperty] = valueToWrite;
        }
    };

    var dataDomDataPrefix = ko.utils.domData.nextKey() + "_";
    ko.templateSources.domElement.prototype['data'] = function(key /*, valueToWrite */) {
        if (arguments.length === 1) {
            return ko.utils.domData.get(this.domElement, dataDomDataPrefix + key);
        } else {
            ko.utils.domData.set(this.domElement, dataDomDataPrefix + key, arguments[1]);
        }
    };

    var templatesDomDataKey = ko.utils.domData.nextKey();
    function getTemplateDomData(element) {
        return ko.utils.domData.get(element, templatesDomDataKey) || {};
    }
    function setTemplateDomData(element, data) {
        ko.utils.domData.set(element, templatesDomDataKey, data);
    }

    ko.templateSources.domElement.prototype['nodes'] = function(/* valueToWrite */) {
        var element = this.domElement;
        if (arguments.length == 0) {
            var templateData = getTemplateDomData(element),
                containerData = templateData.containerData;
            return containerData || (
                this.templateType === templateTemplate ? element.content :
                this.templateType === templateElement ? element :
                undefined);
        } else {
            var valueToWrite = arguments[0];
            setTemplateDomData(element, {containerData: valueToWrite});
        }
    };

    // ---- ko.templateSources.anonymousTemplate -----
    // Anonymous templates are normally saved/retrieved as DOM nodes through "nodes".
    // For compatibility, you can also read "text"; it will be serialized from the nodes on demand.
    // Writing to "text" is still supported, but then the template data will not be available as DOM nodes.

    ko.templateSources.anonymousTemplate = function(element) {
        this.domElement = element;
    }
    ko.templateSources.anonymousTemplate.prototype = new ko.templateSources.domElement();
    ko.templateSources.anonymousTemplate.prototype.constructor = ko.templateSources.anonymousTemplate;
    ko.templateSources.anonymousTemplate.prototype['text'] = function(/* valueToWrite */) {
        if (arguments.length == 0) {
            var templateData = getTemplateDomData(this.domElement);
            if (templateData.textData === undefined && templateData.containerData)
                templateData.textData = templateData.containerData.innerHTML;
            return templateData.textData;
        } else {
            var valueToWrite = arguments[0];
            setTemplateDomData(this.domElement, {textData: valueToWrite});
        }
    };

    ko.exportSymbol('templateSources', ko.templateSources);
    ko.exportSymbol('templateSources.domElement', ko.templateSources.domElement);
    ko.exportSymbol('templateSources.anonymousTemplate', ko.templateSources.anonymousTemplate);
})();
(function () {
    var _templateEngine;
    ko.setTemplateEngine = function (templateEngine) {
        if ((templateEngine != undefined) && !(templateEngine instanceof ko.templateEngine))
            throw new Error("templateEngine must inherit from ko.templateEngine");
        _templateEngine = templateEngine;
    }

    function invokeForEachNodeInContinuousRange(firstNode, lastNode, action) {
        var node, nextInQueue = firstNode, firstOutOfRangeNode = ko.virtualElements.nextSibling(lastNode);
        while (nextInQueue && ((node = nextInQueue) !== firstOutOfRangeNode)) {
            nextInQueue = ko.virtualElements.nextSibling(node);
            action(node, nextInQueue);
        }
    }

    function activateBindingsOnContinuousNodeArray(continuousNodeArray, bindingContext) {
        // To be used on any nodes that have been rendered by a template and have been inserted into some parent element
        // Walks through continuousNodeArray (which *must* be continuous, i.e., an uninterrupted sequence of sibling nodes, because
        // the algorithm for walking them relies on this), and for each top-level item in the virtual-element sense,
        // (1) Does a regular "applyBindings" to associate bindingContext with this node and to activate any non-memoized bindings
        // (2) Unmemoizes any memos in the DOM subtree (e.g., to activate bindings that had been memoized during template rewriting)

        if (continuousNodeArray.length) {
            var firstNode = continuousNodeArray[0],
                lastNode = continuousNodeArray[continuousNodeArray.length - 1],
                parentNode = firstNode.parentNode,
                provider = ko.bindingProvider['instance'],
                preprocessNode = provider['preprocessNode'];

            if (preprocessNode) {
                invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node, nextNodeInRange) {
                    var nodePreviousSibling = node.previousSibling;
                    var newNodes = preprocessNode.call(provider, node);
                    if (newNodes) {
                        if (node === firstNode)
                            firstNode = newNodes[0] || nextNodeInRange;
                        if (node === lastNode)
                            lastNode = newNodes[newNodes.length - 1] || nodePreviousSibling;
                    }
                });

                // Because preprocessNode can change the nodes, including the first and last nodes, update continuousNodeArray to match.
                // We need the full set, including inner nodes, because the unmemoize step might remove the first node (and so the real
                // first node needs to be in the array).
                continuousNodeArray.length = 0;
                if (!firstNode) { // preprocessNode might have removed all the nodes, in which case there's nothing left to do
                    return;
                }
                if (firstNode === lastNode) {
                    continuousNodeArray.push(firstNode);
                } else {
                    continuousNodeArray.push(firstNode, lastNode);
                    ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
                }
            }

            // Need to applyBindings *before* unmemoziation, because unmemoization might introduce extra nodes (that we don't want to re-bind)
            // whereas a regular applyBindings won't introduce new memoized nodes
            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
                if (node.nodeType === 1 || node.nodeType === 8)
                    ko.applyBindings(bindingContext, node);
            });
            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
                if (node.nodeType === 1 || node.nodeType === 8)
                    ko.memoization.unmemoizeDomNodeAndDescendants(node, [bindingContext]);
            });

            // Make sure any changes done by applyBindings or unmemoize are reflected in the array
            ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
        }
    }

    function getFirstNodeFromPossibleArray(nodeOrNodeArray) {
        return nodeOrNodeArray.nodeType ? nodeOrNodeArray
                                        : nodeOrNodeArray.length > 0 ? nodeOrNodeArray[0]
                                        : null;
    }

    function executeTemplate(targetNodeOrNodeArray, renderMode, template, bindingContext, options) {
        options = options || {};
        var firstTargetNode = targetNodeOrNodeArray && getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
        var templateDocument = (firstTargetNode || template || {}).ownerDocument;
        var templateEngineToUse = (options['templateEngine'] || _templateEngine);
        ko.templateRewriting.ensureTemplateIsRewritten(template, templateEngineToUse, templateDocument);
        var renderedNodesArray = templateEngineToUse['renderTemplate'](template, bindingContext, options, templateDocument);

        // Loosely check result is an array of DOM nodes
        if ((typeof renderedNodesArray.length != "number") || (renderedNodesArray.length > 0 && typeof renderedNodesArray[0].nodeType != "number"))
            throw new Error("Template engine must return an array of DOM nodes");

        var haveAddedNodesToParent = false;
        switch (renderMode) {
            case "replaceChildren":
                ko.virtualElements.setDomNodeChildren(targetNodeOrNodeArray, renderedNodesArray);
                haveAddedNodesToParent = true;
                break;
            case "replaceNode":
                ko.utils.replaceDomNodes(targetNodeOrNodeArray, renderedNodesArray);
                haveAddedNodesToParent = true;
                break;
            case "ignoreTargetNode": break;
            default:
                throw new Error("Unknown renderMode: " + renderMode);
        }

        if (haveAddedNodesToParent) {
            activateBindingsOnContinuousNodeArray(renderedNodesArray, bindingContext);
            if (options['afterRender'])
                ko.dependencyDetection.ignore(options['afterRender'], null, [renderedNodesArray, bindingContext['$data']]);
        }

        return renderedNodesArray;
    }

    function resolveTemplateName(template, data, context) {
        // The template can be specified as:
        if (ko.isObservable(template)) {
            // 1. An observable, with string value
            return template();
        } else if (typeof template === 'function') {
            // 2. A function of (data, context) returning a string
            return template(data, context);
        } else {
            // 3. A string
            return template;
        }
    }

    ko.renderTemplate = function (template, dataOrBindingContext, options, targetNodeOrNodeArray, renderMode) {
        options = options || {};
        if ((options['templateEngine'] || _templateEngine) == undefined)
            throw new Error("Set a template engine before calling renderTemplate");
        renderMode = renderMode || "replaceChildren";

        if (targetNodeOrNodeArray) {
            var firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);

            var whenToDispose = function () { return (!firstTargetNode) || !ko.utils.domNodeIsAttachedToDocument(firstTargetNode); }; // Passive disposal (on next evaluation)
            var activelyDisposeWhenNodeIsRemoved = (firstTargetNode && renderMode == "replaceNode") ? firstTargetNode.parentNode : firstTargetNode;

            return ko.dependentObservable( // So the DOM is automatically updated when any dependency changes
                function () {
                    // Ensure we've got a proper binding context to work with
                    var bindingContext = (dataOrBindingContext && (dataOrBindingContext instanceof ko.bindingContext))
                        ? dataOrBindingContext
                        : new ko.bindingContext(dataOrBindingContext, null, null, null, { "exportDependencies": true });

                    var templateName = resolveTemplateName(template, bindingContext['$data'], bindingContext),
                        renderedNodesArray = executeTemplate(targetNodeOrNodeArray, renderMode, templateName, bindingContext, options);

                    if (renderMode == "replaceNode") {
                        targetNodeOrNodeArray = renderedNodesArray;
                        firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
                    }
                },
                null,
                { disposeWhen: whenToDispose, disposeWhenNodeIsRemoved: activelyDisposeWhenNodeIsRemoved }
            );
        } else {
            // We don't yet have a DOM node to evaluate, so use a memo and render the template later when there is a DOM node
            return ko.memoization.memoize(function (domNode) {
                ko.renderTemplate(template, dataOrBindingContext, options, domNode, "replaceNode");
            });
        }
    };

    ko.renderTemplateForEach = function (template, arrayOrObservableArray, options, targetNode, parentBindingContext) {
        // Since setDomNodeChildrenFromArrayMapping always calls executeTemplateForArrayItem and then
        // activateBindingsCallback for added items, we can store the binding context in the former to use in the latter.
        var arrayItemContext;

        // This will be called by setDomNodeChildrenFromArrayMapping to get the nodes to add to targetNode
        var executeTemplateForArrayItem = function (arrayValue, index) {
            // Support selecting template as a function of the data being rendered
            arrayItemContext = parentBindingContext['createChildContext'](arrayValue, options['as'], function(context) {
                context['$index'] = index;
            });

            var templateName = resolveTemplateName(template, arrayValue, arrayItemContext);
            return executeTemplate(null, "ignoreTargetNode", templateName, arrayItemContext, options);
        }

        // This will be called whenever setDomNodeChildrenFromArrayMapping has added nodes to targetNode
        var activateBindingsCallback = function(arrayValue, addedNodesArray, index) {
            activateBindingsOnContinuousNodeArray(addedNodesArray, arrayItemContext);
            if (options['afterRender'])
                options['afterRender'](addedNodesArray, arrayValue);

            // release the "cache" variable, so that it can be collected by
            // the GC when its value isn't used from within the bindings anymore.
            arrayItemContext = null;
        };

        return ko.dependentObservable(function () {
            var unwrappedArray = ko.utils.unwrapObservable(arrayOrObservableArray) || [];
            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
                unwrappedArray = [unwrappedArray];

            // Filter out any entries marked as destroyed
            var filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
                return options['includeDestroyed'] || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
            });

            // Call setDomNodeChildrenFromArrayMapping, ignoring any observables unwrapped within (most likely from a callback function).
            // If the array items are observables, though, they will be unwrapped in executeTemplateForArrayItem and managed within setDomNodeChildrenFromArrayMapping.
            ko.dependencyDetection.ignore(ko.utils.setDomNodeChildrenFromArrayMapping, null, [targetNode, filteredArray, executeTemplateForArrayItem, options, activateBindingsCallback]);

        }, null, { disposeWhenNodeIsRemoved: targetNode });
    };

    var templateComputedDomDataKey = ko.utils.domData.nextKey();
    function disposeOldComputedAndStoreNewOne(element, newComputed) {
        var oldComputed = ko.utils.domData.get(element, templateComputedDomDataKey);
        if (oldComputed && (typeof(oldComputed.dispose) == 'function'))
            oldComputed.dispose();
        ko.utils.domData.set(element, templateComputedDomDataKey, (newComputed && newComputed.isActive()) ? newComputed : undefined);
    }

    ko.bindingHandlers['template'] = {
        'init': function(element, valueAccessor) {
            // Support anonymous templates
            var bindingValue = ko.utils.unwrapObservable(valueAccessor());
            if (typeof bindingValue == "string" || bindingValue['name']) {
                // It's a named template - clear the element
                ko.virtualElements.emptyNode(element);
            } else if ('nodes' in bindingValue) {
                // We've been given an array of DOM nodes. Save them as the template source.
                // There is no known use case for the node array being an observable array (if the output
                // varies, put that behavior *into* your template - that's what templates are for), and
                // the implementation would be a mess, so assert that it's not observable.
                var nodes = bindingValue['nodes'] || [];
                if (ko.isObservable(nodes)) {
                    throw new Error('The "nodes" option must be a plain, non-observable array.');
                }
                var container = ko.utils.moveCleanedNodesToContainerElement(nodes); // This also removes the nodes from their current parent
                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
            } else {
                // It's an anonymous template - store the element contents, then clear the element
                var templateNodes = ko.virtualElements.childNodes(element),
                    container = ko.utils.moveCleanedNodesToContainerElement(templateNodes); // This also removes the nodes from their current parent
                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
            }
            return { 'controlsDescendantBindings': true };
        },
        'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor(),
                options = ko.utils.unwrapObservable(value),
                shouldDisplay = true,
                templateComputed = null,
                templateName;

            if (typeof options == "string") {
                templateName = value;
                options = {};
            } else {
                templateName = options['name'];

                // Support "if"/"ifnot" conditions
                if ('if' in options)
                    shouldDisplay = ko.utils.unwrapObservable(options['if']);
                if (shouldDisplay && 'ifnot' in options)
                    shouldDisplay = !ko.utils.unwrapObservable(options['ifnot']);
            }

            if ('foreach' in options) {
                // Render once for each data point (treating data set as empty if shouldDisplay==false)
                var dataArray = (shouldDisplay && options['foreach']) || [];
                templateComputed = ko.renderTemplateForEach(templateName || element, dataArray, options, element, bindingContext);
            } else if (!shouldDisplay) {
                ko.virtualElements.emptyNode(element);
            } else {
                // Render once for this single data point (or use the viewModel if no data was provided)
                var innerBindingContext = ('data' in options) ?
                    bindingContext.createStaticChildContext(options['data'], options['as']) :  // Given an explitit 'data' value, we create a child binding context for it
                    bindingContext;                                                        // Given no explicit 'data' value, we retain the same binding context
                templateComputed = ko.renderTemplate(templateName || element, innerBindingContext, options, element);
            }

            // It only makes sense to have a single template computed per element (otherwise which one should have its output displayed?)
            disposeOldComputedAndStoreNewOne(element, templateComputed);
        }
    };

    // Anonymous templates can't be rewritten. Give a nice error message if you try to do it.
    ko.expressionRewriting.bindingRewriteValidators['template'] = function(bindingValue) {
        var parsedBindingValue = ko.expressionRewriting.parseObjectLiteral(bindingValue);

        if ((parsedBindingValue.length == 1) && parsedBindingValue[0]['unknown'])
            return null; // It looks like a string literal, not an object literal, so treat it as a named template (which is allowed for rewriting)

        if (ko.expressionRewriting.keyValueArrayContainsKey(parsedBindingValue, "name"))
            return null; // Named templates can be rewritten, so return "no error"
        return "This template engine does not support anonymous templates nested within its templates";
    };

    ko.virtualElements.allowedBindings['template'] = true;
})();

ko.exportSymbol('setTemplateEngine', ko.setTemplateEngine);
ko.exportSymbol('renderTemplate', ko.renderTemplate);
// Go through the items that have been added and deleted and try to find matches between them.
ko.utils.findMovesInArrayComparison = function (left, right, limitFailedCompares) {
    if (left.length && right.length) {
        var failedCompares, l, r, leftItem, rightItem;
        for (failedCompares = l = 0; (!limitFailedCompares || failedCompares < limitFailedCompares) && (leftItem = left[l]); ++l) {
            for (r = 0; rightItem = right[r]; ++r) {
                if (leftItem['value'] === rightItem['value']) {
                    leftItem['moved'] = rightItem['index'];
                    rightItem['moved'] = leftItem['index'];
                    right.splice(r, 1);         // This item is marked as moved; so remove it from right list
                    failedCompares = r = 0;     // Reset failed compares count because we're checking for consecutive failures
                    break;
                }
            }
            failedCompares += r;
        }
    }
};

ko.utils.compareArrays = (function () {
    var statusNotInOld = 'added', statusNotInNew = 'deleted';

    // Simple calculation based on Levenshtein distance.
    function compareArrays(oldArray, newArray, options) {
        // For backward compatibility, if the third arg is actually a bool, interpret
        // it as the old parameter 'dontLimitMoves'. Newer code should use { dontLimitMoves: true }.
        options = (typeof options === 'boolean') ? { 'dontLimitMoves': options } : (options || {});
        oldArray = oldArray || [];
        newArray = newArray || [];

        if (oldArray.length < newArray.length)
            return compareSmallArrayToBigArray(oldArray, newArray, statusNotInOld, statusNotInNew, options);
        else
            return compareSmallArrayToBigArray(newArray, oldArray, statusNotInNew, statusNotInOld, options);
    }

    function compareSmallArrayToBigArray(smlArray, bigArray, statusNotInSml, statusNotInBig, options) {
        var myMin = Math.min,
            myMax = Math.max,
            editDistanceMatrix = [],
            smlIndex, smlIndexMax = smlArray.length,
            bigIndex, bigIndexMax = bigArray.length,
            compareRange = (bigIndexMax - smlIndexMax) || 1,
            maxDistance = smlIndexMax + bigIndexMax + 1,
            thisRow, lastRow,
            bigIndexMaxForRow, bigIndexMinForRow;

        for (smlIndex = 0; smlIndex <= smlIndexMax; smlIndex++) {
            lastRow = thisRow;
            editDistanceMatrix.push(thisRow = []);
            bigIndexMaxForRow = myMin(bigIndexMax, smlIndex + compareRange);
            bigIndexMinForRow = myMax(0, smlIndex - 1);
            for (bigIndex = bigIndexMinForRow; bigIndex <= bigIndexMaxForRow; bigIndex++) {
                if (!bigIndex)
                    thisRow[bigIndex] = smlIndex + 1;
                else if (!smlIndex)  // Top row - transform empty array into new array via additions
                    thisRow[bigIndex] = bigIndex + 1;
                else if (smlArray[smlIndex - 1] === bigArray[bigIndex - 1])
                    thisRow[bigIndex] = lastRow[bigIndex - 1];                  // copy value (no edit)
                else {
                    var northDistance = lastRow[bigIndex] || maxDistance;       // not in big (deletion)
                    var westDistance = thisRow[bigIndex - 1] || maxDistance;    // not in small (addition)
                    thisRow[bigIndex] = myMin(northDistance, westDistance) + 1;
                }
            }
        }

        var editScript = [], meMinusOne, notInSml = [], notInBig = [];
        for (smlIndex = smlIndexMax, bigIndex = bigIndexMax; smlIndex || bigIndex;) {
            meMinusOne = editDistanceMatrix[smlIndex][bigIndex] - 1;
            if (bigIndex && meMinusOne === editDistanceMatrix[smlIndex][bigIndex-1]) {
                notInSml.push(editScript[editScript.length] = {     // added
                    'status': statusNotInSml,
                    'value': bigArray[--bigIndex],
                    'index': bigIndex });
            } else if (smlIndex && meMinusOne === editDistanceMatrix[smlIndex - 1][bigIndex]) {
                notInBig.push(editScript[editScript.length] = {     // deleted
                    'status': statusNotInBig,
                    'value': smlArray[--smlIndex],
                    'index': smlIndex });
            } else {
                --bigIndex;
                --smlIndex;
                if (!options['sparse']) {
                    editScript.push({
                        'status': "retained",
                        'value': bigArray[bigIndex] });
                }
            }
        }

        // Set a limit on the number of consecutive non-matching comparisons; having it a multiple of
        // smlIndexMax keeps the time complexity of this algorithm linear.
        ko.utils.findMovesInArrayComparison(notInBig, notInSml, !options['dontLimitMoves'] && smlIndexMax * 10);

        return editScript.reverse();
    }

    return compareArrays;
})();

ko.exportSymbol('utils.compareArrays', ko.utils.compareArrays);
(function () {
    // Objective:
    // * Given an input array, a container DOM node, and a function from array elements to arrays of DOM nodes,
    //   map the array elements to arrays of DOM nodes, concatenate together all these arrays, and use them to populate the container DOM node
    // * Next time we're given the same combination of things (with the array possibly having mutated), update the container DOM node
    //   so that its children is again the concatenation of the mappings of the array elements, but don't re-map any array elements that we
    //   previously mapped - retain those nodes, and just insert/delete other ones

    // "callbackAfterAddingNodes" will be invoked after any "mapping"-generated nodes are inserted into the container node
    // You can use this, for example, to activate bindings on those nodes.

    function mapNodeAndRefreshWhenChanged(containerNode, mapping, valueToMap, callbackAfterAddingNodes, index) {
        // Map this array value inside a dependentObservable so we re-map when any dependency changes
        var mappedNodes = [];
        var dependentObservable = ko.dependentObservable(function() {
            var newMappedNodes = mapping(valueToMap, index, ko.utils.fixUpContinuousNodeArray(mappedNodes, containerNode)) || [];

            // On subsequent evaluations, just replace the previously-inserted DOM nodes
            if (mappedNodes.length > 0) {
                ko.utils.replaceDomNodes(mappedNodes, newMappedNodes);
                if (callbackAfterAddingNodes)
                    ko.dependencyDetection.ignore(callbackAfterAddingNodes, null, [valueToMap, newMappedNodes, index]);
            }

            // Replace the contents of the mappedNodes array, thereby updating the record
            // of which nodes would be deleted if valueToMap was itself later removed
            mappedNodes.length = 0;
            ko.utils.arrayPushAll(mappedNodes, newMappedNodes);
        }, null, { disposeWhenNodeIsRemoved: containerNode, disposeWhen: function() { return !ko.utils.anyDomNodeIsAttachedToDocument(mappedNodes); } });
        return { mappedNodes : mappedNodes, dependentObservable : (dependentObservable.isActive() ? dependentObservable : undefined) };
    }

    var lastMappingResultDomDataKey = ko.utils.domData.nextKey(),
        deletedItemDummyValue = ko.utils.domData.nextKey();

    ko.utils.setDomNodeChildrenFromArrayMapping = function (domNode, array, mapping, options, callbackAfterAddingNodes) {
        // Compare the provided array against the previous one
        array = array || [];
        options = options || {};
        var isFirstExecution = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) === undefined;
        var lastMappingResult = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) || [];
        var lastArray = ko.utils.arrayMap(lastMappingResult, function (x) { return x.arrayEntry; });
        var editScript = ko.utils.compareArrays(lastArray, array, options['dontLimitMoves']);

        // Build the new mapping result
        var newMappingResult = [];
        var lastMappingResultIndex = 0;
        var newMappingResultIndex = 0;

        var nodesToDelete = [];
        var itemsToProcess = [];
        var itemsForBeforeRemoveCallbacks = [];
        var itemsForMoveCallbacks = [];
        var itemsForAfterAddCallbacks = [];
        var mapData;

        function itemMovedOrRetained(editScriptIndex, oldPosition) {
            mapData = lastMappingResult[oldPosition];
            if (newMappingResultIndex !== oldPosition)
                itemsForMoveCallbacks[editScriptIndex] = mapData;
            // Since updating the index might change the nodes, do so before calling fixUpContinuousNodeArray
            mapData.indexObservable(newMappingResultIndex++);
            ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode);
            newMappingResult.push(mapData);
            itemsToProcess.push(mapData);
        }

        function callCallback(callback, items) {
            if (callback) {
                for (var i = 0, n = items.length; i < n; i++) {
                    if (items[i]) {
                        ko.utils.arrayForEach(items[i].mappedNodes, function(node) {
                            callback(node, i, items[i].arrayEntry);
                        });
                    }
                }
            }
        }

        for (var i = 0, editScriptItem, movedIndex; editScriptItem = editScript[i]; i++) {
            movedIndex = editScriptItem['moved'];
            switch (editScriptItem['status']) {
                case "deleted":
                    if (movedIndex === undefined) {
                        mapData = lastMappingResult[lastMappingResultIndex];

                        // Stop tracking changes to the mapping for these nodes
                        if (mapData.dependentObservable) {
                            mapData.dependentObservable.dispose();
                            mapData.dependentObservable = undefined;
                        }

                        // Queue these nodes for later removal
                        if (ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode).length) {
                            if (options['beforeRemove']) {
                                newMappingResult.push(mapData);
                                itemsToProcess.push(mapData);
                                if (mapData.arrayEntry === deletedItemDummyValue) {
                                    mapData = null;
                                } else {
                                    itemsForBeforeRemoveCallbacks[i] = mapData;
                                }
                            }
                            if (mapData) {
                                nodesToDelete.push.apply(nodesToDelete, mapData.mappedNodes);
                            }
                        }
                    }
                    lastMappingResultIndex++;
                    break;

                case "retained":
                    itemMovedOrRetained(i, lastMappingResultIndex++);
                    break;

                case "added":
                    if (movedIndex !== undefined) {
                        itemMovedOrRetained(i, movedIndex);
                    } else {
                        mapData = { arrayEntry: editScriptItem['value'], indexObservable: ko.observable(newMappingResultIndex++) };
                        newMappingResult.push(mapData);
                        itemsToProcess.push(mapData);
                        if (!isFirstExecution)
                            itemsForAfterAddCallbacks[i] = mapData;
                    }
                    break;
            }
        }

        // Store a copy of the array items we just considered so we can difference it next time
        ko.utils.domData.set(domNode, lastMappingResultDomDataKey, newMappingResult);

        // Call beforeMove first before any changes have been made to the DOM
        callCallback(options['beforeMove'], itemsForMoveCallbacks);

        // Next remove nodes for deleted items (or just clean if there's a beforeRemove callback)
        ko.utils.arrayForEach(nodesToDelete, options['beforeRemove'] ? ko.cleanNode : ko.removeNode);

        // Next add/reorder the remaining items (will include deleted items if there's a beforeRemove callback)
        for (var i = 0, nextNode = ko.virtualElements.firstChild(domNode), lastNode, node; mapData = itemsToProcess[i]; i++) {
            // Get nodes for newly added items
            if (!mapData.mappedNodes)
                ko.utils.extend(mapData, mapNodeAndRefreshWhenChanged(domNode, mapping, mapData.arrayEntry, callbackAfterAddingNodes, mapData.indexObservable));

            // Put nodes in the right place if they aren't there already
            for (var j = 0; node = mapData.mappedNodes[j]; nextNode = node.nextSibling, lastNode = node, j++) {
                if (node !== nextNode)
                    ko.virtualElements.insertAfter(domNode, node, lastNode);
            }

            // Run the callbacks for newly added nodes (for example, to apply bindings, etc.)
            if (!mapData.initialized && callbackAfterAddingNodes) {
                callbackAfterAddingNodes(mapData.arrayEntry, mapData.mappedNodes, mapData.indexObservable);
                mapData.initialized = true;
            }
        }

        // If there's a beforeRemove callback, call it after reordering.
        // Note that we assume that the beforeRemove callback will usually be used to remove the nodes using
        // some sort of animation, which is why we first reorder the nodes that will be removed. If the
        // callback instead removes the nodes right away, it would be more efficient to skip reordering them.
        // Perhaps we'll make that change in the future if this scenario becomes more common.
        callCallback(options['beforeRemove'], itemsForBeforeRemoveCallbacks);

        // Replace the stored values of deleted items with a dummy value. This provides two benefits: it marks this item
        // as already "removed" so we won't call beforeRemove for it again, and it ensures that the item won't match up
        // with an actual item in the array and appear as "retained" or "moved".
        for (i = 0; i < itemsForBeforeRemoveCallbacks.length; ++i) {
            if (itemsForBeforeRemoveCallbacks[i]) {
                itemsForBeforeRemoveCallbacks[i].arrayEntry = deletedItemDummyValue;
            }
        }

        // Finally call afterMove and afterAdd callbacks
        callCallback(options['afterMove'], itemsForMoveCallbacks);
        callCallback(options['afterAdd'], itemsForAfterAddCallbacks);
    }
})();

ko.exportSymbol('utils.setDomNodeChildrenFromArrayMapping', ko.utils.setDomNodeChildrenFromArrayMapping);
ko.nativeTemplateEngine = function () {
    this['allowTemplateRewriting'] = false;
}

ko.nativeTemplateEngine.prototype = new ko.templateEngine();
ko.nativeTemplateEngine.prototype.constructor = ko.nativeTemplateEngine;
ko.nativeTemplateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options, templateDocument) {
    var useNodesIfAvailable = !(ko.utils.ieVersion < 9), // IE<9 cloneNode doesn't work properly
        templateNodesFunc = useNodesIfAvailable ? templateSource['nodes'] : null,
        templateNodes = templateNodesFunc ? templateSource['nodes']() : null;

    if (templateNodes) {
        return ko.utils.makeArray(templateNodes.cloneNode(true).childNodes);
    } else {
        var templateText = templateSource['text']();
        return ko.utils.parseHtmlFragment(templateText, templateDocument);
    }
};

ko.nativeTemplateEngine.instance = new ko.nativeTemplateEngine();
ko.setTemplateEngine(ko.nativeTemplateEngine.instance);

ko.exportSymbol('nativeTemplateEngine', ko.nativeTemplateEngine);
(function() {
    ko.jqueryTmplTemplateEngine = function () {
        // Detect which version of jquery-tmpl you're using. Unfortunately jquery-tmpl
        // doesn't expose a version number, so we have to infer it.
        // Note that as of Knockout 1.3, we only support jQuery.tmpl 1.0.0pre and later,
        // which KO internally refers to as version "2", so older versions are no longer detected.
        var jQueryTmplVersion = this.jQueryTmplVersion = (function() {
            if (!jQueryInstance || !(jQueryInstance['tmpl']))
                return 0;
            // Since it exposes no official version number, we use our own numbering system. To be updated as jquery-tmpl evolves.
            try {
                if (jQueryInstance['tmpl']['tag']['tmpl']['open'].toString().indexOf('__') >= 0) {
                    // Since 1.0.0pre, custom tags should append markup to an array called "__"
                    return 2; // Final version of jquery.tmpl
                }
            } catch(ex) { /* Apparently not the version we were looking for */ }

            return 1; // Any older version that we don't support
        })();

        function ensureHasReferencedJQueryTemplates() {
            if (jQueryTmplVersion < 2)
                throw new Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");
        }

        function executeTemplate(compiledTemplate, data, jQueryTemplateOptions) {
            return jQueryInstance['tmpl'](compiledTemplate, data, jQueryTemplateOptions);
        }

        this['renderTemplateSource'] = function(templateSource, bindingContext, options, templateDocument) {
            templateDocument = templateDocument || document;
            options = options || {};
            ensureHasReferencedJQueryTemplates();

            // Ensure we have stored a precompiled version of this template (don't want to reparse on every render)
            var precompiled = templateSource['data']('precompiled');
            if (!precompiled) {
                var templateText = templateSource['text']() || "";
                // Wrap in "with($whatever.koBindingContext) { ... }"
                templateText = "{{ko_with $item.koBindingContext}}" + templateText + "{{/ko_with}}";

                precompiled = jQueryInstance['template'](null, templateText);
                templateSource['data']('precompiled', precompiled);
            }

            var data = [bindingContext['$data']]; // Prewrap the data in an array to stop jquery.tmpl from trying to unwrap any arrays
            var jQueryTemplateOptions = jQueryInstance['extend']({ 'koBindingContext': bindingContext }, options['templateOptions']);

            var resultNodes = executeTemplate(precompiled, data, jQueryTemplateOptions);
            resultNodes['appendTo'](templateDocument.createElement("div")); // Using "appendTo" forces jQuery/jQuery.tmpl to perform necessary cleanup work

            jQueryInstance['fragments'] = {}; // Clear jQuery's fragment cache to avoid a memory leak after a large number of template renders
            return resultNodes;
        };

        this['createJavaScriptEvaluatorBlock'] = function(script) {
            return "{{ko_code ((function() { return " + script + " })()) }}";
        };

        this['addTemplate'] = function(templateName, templateMarkup) {
            document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
        };

        if (jQueryTmplVersion > 0) {
            jQueryInstance['tmpl']['tag']['ko_code'] = {
                open: "__.push($1 || '');"
            };
            jQueryInstance['tmpl']['tag']['ko_with'] = {
                open: "with($1) {",
                close: "} "
            };
        }
    };

    ko.jqueryTmplTemplateEngine.prototype = new ko.templateEngine();
    ko.jqueryTmplTemplateEngine.prototype.constructor = ko.jqueryTmplTemplateEngine;

    // Use this one by default *only if jquery.tmpl is referenced*
    var jqueryTmplTemplateEngineInstance = new ko.jqueryTmplTemplateEngine();
    if (jqueryTmplTemplateEngineInstance.jQueryTmplVersion > 0)
        ko.setTemplateEngine(jqueryTmplTemplateEngineInstance);

    ko.exportSymbol('jqueryTmplTemplateEngine', ko.jqueryTmplTemplateEngine);
})();
}));
}());
})();

},{}],29:[function(require,module,exports){
module.exports = require('cssify');

},{"cssify":5}],30:[function(require,module,exports){
'use strict';

// modified from https://github.com/es-shims/es5-shim
var has = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var slice = Array.prototype.slice;
var isArgs = require('./isArguments');
var isEnumerable = Object.prototype.propertyIsEnumerable;
var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
var dontEnums = [
	'toString',
	'toLocaleString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'constructor'
];
var equalsConstructorPrototype = function (o) {
	var ctor = o.constructor;
	return ctor && ctor.prototype === o;
};
var excludedKeys = {
	$console: true,
	$external: true,
	$frame: true,
	$frameElement: true,
	$frames: true,
	$innerHeight: true,
	$innerWidth: true,
	$outerHeight: true,
	$outerWidth: true,
	$pageXOffset: true,
	$pageYOffset: true,
	$parent: true,
	$scrollLeft: true,
	$scrollTop: true,
	$scrollX: true,
	$scrollY: true,
	$self: true,
	$webkitIndexedDB: true,
	$webkitStorageInfo: true,
	$window: true
};
var hasAutomationEqualityBug = (function () {
	/* global window */
	if (typeof window === 'undefined') { return false; }
	for (var k in window) {
		try {
			if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
				try {
					equalsConstructorPrototype(window[k]);
				} catch (e) {
					return true;
				}
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (o) {
	/* global window */
	if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
		return equalsConstructorPrototype(o);
	}
	try {
		return equalsConstructorPrototype(o);
	} catch (e) {
		return false;
	}
};

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object';
	var isFunction = toStr.call(object) === '[object Function]';
	var isArguments = isArgs(object);
	var isString = isObject && toStr.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
				theKeys.push(dontEnums[k]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			return (Object.keys(arguments) || '').length === 2;
		}(1, 2));
		if (!keysWorksWithArguments) {
			var originalKeys = Object.keys;
			Object.keys = function keys(object) {
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				} else {
					return originalKeys(object);
				}
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./isArguments":31}],31:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],32:[function(require,module,exports){
(function () {

  if(typeof window.SAILPLAY === 'undefined'){
    console.log('Can\'t find main SAILPLAY module');
    return;
  }

  var sp = window.SAILPLAY;

  var JSONP = sp.jsonp;

  var _actions_config = false;

  sp.actions = {};

  sp.actions.config = function(){
    return _actions_config;
  };

  //ACTIONS SECTION

  //LOAD ACTIONS LIST
  sp.on('load.actions.list', function () {
    if(sp.config() == {}){
      alert('Please init SailPlay HUB first!');
      return;
    }
    var params = {
      auth_hash: sp.config().auth_hash
    };

    JSONP.get(sp.config().DOMAIN + sp.config().urls.actions.load, params, function (res) {
      //      console.dir(res);
      if (res.status == 'ok') {
        _actions_config = res.data;
        sp.send('load.actions.list.success', res.data);
      } else {
        sp.send('load.actions.list.error', res);
      }
    });
  });

  //LOAD ACTIONS LIST
  sp.on('load.actions.custom.list', function () {
    if(sp.config() == {}){
      alert('Please init SailPlay HUB first!');
      return;
    }
    var params = {
      auth_hash: sp.config().auth_hash
    };

    JSONP.get(sp.config().DOMAIN + sp.config().urls.actions.custom.list, params, function (res) {
      //      console.dir(res);
      if (res.status == 'ok') {
        sp.send('load.actions.custom.list.success', res.actions);
      } else {
        sp.send('load.actions.custom.list.error', res);
      }
    });
  });

  sp.on('set.actions.list', function (actions) {
    _actions_config = actions;
  });

  //PERFORM ACTION

  sp.actions.parse = function(dom, action){

    if(!sp.is_dom(dom)) {
      console.error('sp.actions.parse() need DOM element as first parameter');
      return;
    }

    if(!action) {
      console.error('sp.actions.parse() need Action object as second parameter');
      return;
    }

    if(!_actions_config.connectedAccounts && !action.force) {

      console.error('sp.actions.parse() must execute after event load.actions.list.success');
      return;

    }

    if(!action.socialType){

      //console.dir(action);
      dom.addEventListener('click', function(){
        sp.send('actions.perform', action);
      });

      return;

    }

    if(sp.config().platform === 'mobile' && action.socialType){

      dom.addEventListener('click', function(){
        sp.send('actions.perform', action);
      });

    }

    else {

      parse_frame();

    }

    function parse_frame(){
      var styles = dom.getAttribute('data-styles');
      var text = dom.getAttribute('data-text');

      var action_frame = document.createElement('IFRAME');
      action_frame.style.border = 'none';
      action_frame.style.width = '150px';
      action_frame.style.height = '30px';
      action_frame.style.background = 'transparent';
      action_frame.style.overflow = 'hidden';
      action_frame.setAttribute('scrolling', 'no');

      var account_connected = action.force ? true : (_actions_config.connectedAccounts[action.socialType] || false);

      action_frame.className = [ 'sailplay_action_frame', (action.socialType || ''),  (action.action || ''), (account_connected ? 'account_connected' : '')].join(' ');

      function EncodeQueryData(data)
      {
        var ret = [];
        for (var d in data)
          ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
        return ret.join("&");
      }

      var frame_params = {
        auth_hash: sp.config().auth_hash,
        socialType: action.socialType,
        action: action.action,
        link: action.shortLink,
        pic: (action.pic || _actions_config.partnerCustomPic || sp.config().partner.logo),
        msg: (action.msg || _actions_config.messages[action.action] || sp.config().partner.name),
        account_connected: account_connected,
        force: action.force
      };

      if(action['_actionId']) frame_params._actionId = action._actionId;
      if(styles) frame_params.styles = styles;
      if(text) frame_params.text = text;

      if (action.action == 'purchase') {
        frame_params.purchasePublicKey = _actions_config.purchasePublicKey;
      }

      if (action.action == 'badge') {
        frame_params.badgeId= action.badgeId;
      }

      action_frame.src = sp.config().DOMAIN + '/js-api/' + sp.config().partner.id + '/actions/social-widget/v2/?' + EncodeQueryData(frame_params);
      dom.innerHTML = '';
      dom.appendChild(action_frame);

      action_frame.onload = function() {
        sp.send('actions.parse.success', action);
      };

      //gp speciefied config

    }



  };

  sp.on('actions.parse', function (actions) {

    if(sp.config() == {}){
      return;
    }

    if(actions && Array.isArray(actions)) {
      Actions.social_init(actions);
    }
    else {
      sp.send('actions.parse.error', { message: 'Actions list needed' });
    }

  });

  // SOCIAL GOOGLE PLUS CHANGE HEIGHT
  sp.on('actions.social.gp.like.mouseenter', function(){
    var elms = document.querySelectorAll('iframe[iframe-action-gp-like], iframe.gp.like');
    var originWidth,
      w,
      h = 500;
    for(var i = 0, len = elms.length; i < len; i++){
      elms[i].removeAttribute("style");
      originWidth = elms[i].parentNode. offsetWidth;
      w = +originWidth + 70;
      elms[i].style.cssText = 'width: ' + w + 'px !important;height: ' + h + 'px !important;margin-left: -35px !important;z-index: 10 !important;';
      elms[i].parentNode.style.setProperty ("overflow", "visible", "important");
    }
  });

  sp.on('actions.social.gp.like.mouseleave', function(){
    var elms = document.querySelectorAll('iframe[iframe-action-gp-like], iframe.gp.like');
    var w = 150,
      h = 27;
    for(var i = 0, len = elms.length; i < len; i++){
      elms[i].removeAttribute("style");
      elms[i].style.cssText = 'width: ' + w + 'px !important;height: ' + h + 'px !important;margin-left: auto !important;';
      elms[i].parentNode.style.setProperty ("overflow", "hidden", "important");
    }
  });

  var Actions = {};

  Actions.social_init = function(actions){

    var social_buttons = document.querySelectorAll('[data-sp-action]');

    for(var i = 0; i < social_buttons.length; i+=1) {

      (function(){
        var btn = social_buttons[i];
        var action_id = Number(btn.getAttribute('data-sp-action'));
        var action = sp.find_by_properties((actions || _actions_config.actions), { _actionId: action_id })[0];
        sp.actions.parse(btn, action);
      }());

    }

  };

  //actions v1 section

  Actions.openSocialRegNeedPopup = function (action) {
    var w;
    if (action.socialType == 'vk')
      w = Actions.popupWindow(_actions_config.social.vk.authUrl, 'social_reg', 840, 400);
    else
      w = Actions.popupWindow(_actions_config.social[action.socialType].authUrl, 'social_reg');

    var checkPopupInterval = setInterval(function () {
      if (w == null || w.closed) {
        sp.send('actions.social.connect.complete');
        clearInterval(checkPopupInterval);
      }
    }, 100);

  };

  Actions.popupWindow = function (url, title, w, h) {
    var width, height, left, top;
    if (w !== undefined && h !== undefined) {
      width = w;
      height = h;
      left = (screen.width / 2) - (w / 2);
      top = (screen.height / 2) - (h / 2);
    } else {
      width = screen.width / 2;
      height = screen.height / 2;
      left = width - (width / 2);
      top = height - (height / 2);
    }

    return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);

  };

  Actions.share = function (action) {

    var frameUrl = sp.config().DOMAIN + '/js-api/' + sp.config().partner.id + '/actions/social-widget/?auth_hash=' + sp.config().auth_hash;
    frameUrl += '&socialType=' + action.socialType + '&action=' + action.action + '&link=' + action.shortLink + '&pic=' + (_actions_config.partnerCustomPic ? _actions_config.partnerCustomPic : sp.config().partner.logo);

    frameUrl += '&msg=' + _actions_config.messages[action.action];
    frameUrl += '&_actionId=' + action['_actionId'];

    if (action.action == 'purchase') {
      frameUrl += '&purchasePublicKey=' + _actions_config.purchasePublicKey;
    }

    var socialFrame = Actions.popupWindow(frameUrl, 'social_action', 200, 210);
    var checkPopupInterval = setInterval(function () {
      if (socialFrame == null || socialFrame.closed) {
        sp.send('actions.perform.complete', action);
        clearInterval(checkPopupInterval);
      }
    }, 200);

  };

  Actions.perform = function(action){

    if(sp.config().platform === 'mobile') {

      end_share(action);
      return;

    }

    sp.send('actions.perform.start', action);

    if (action.socialType && _actions_config.connectedAccounts) {
      if (!_actions_config.connectedAccounts[action.socialType]) {
        Actions.openSocialRegNeedPopup(action);
      } else {
        Actions.share(action);
      }
    }
    else if(!action.socialType){
      var frameUrl = sp.config().DOMAIN + '/popup/' + sp.config().partner.id + '/widgets/custom/' + action.type  + '/?auth_hash=' + sp.config().auth_hash;
      frameUrl += '&lang=' + sp.config().lang;
      frameUrl += '&from_sdk=0';
      var actionFrame = Actions.popupWindow(frameUrl, 'SailPlay', 600, 400);
      var checkPopupInterval = setInterval(function () {
        if (actionFrame == null || actionFrame.closed) {
          sp.send('actions.perform.complete', action);
          clearInterval(checkPopupInterval);
        }
      }, 200);
    }

  };

  sp.on('actions.perform', function (action, callback) {
    if(sp.config() == {}){
      return;
    }
    if (sp.config().auth_hash) {
      Actions.perform(action, callback);
    } else {
      sp.send('actions.perform.auth.error', action);
    }
  });

  function repair_pic_url(url){
    console.log(url);
    if(/^((http|https|ftp):\/\/)/.test(url)){
      return url;
    }
    if(url.indexOf('//') === 0){
      return window.location.protocol + url;
    }
    else {
      return sp.config().DOMAIN + url;
    }
  }

  function end_share(action){

    var handle_params = {
      partner_id: sp.config().partner.id,
      social_type: action.socialType,
      action: action.action,
      purchase_public_key: _actions_config.purchasePublicKey || '',
      badge_id: action.badgeId || '',
      auth_hash: sp.config().auth_hash,
      platform: sp.config().platform
    };

    sp.jsonp.get(sp.config().DOMAIN + sp.config().urls.actions.handle_social_action, handle_params,

      function(res){
        sp.send('actions.perform.success', { response: res, action: action });
      },
      function(res){
        sp.send('actions.perform.error', { error: res, action: action });
      })

  }


}());

},{}],33:[function(require,module,exports){
(function () {

  var last_scroll = 0;
  function disableScroll() {
    last_scroll = document.body.scrollTop;
    window.document.body.style.top = -last_scroll + 'px';
    window.document.body.className += ' noscroll'
  }

  function enableScroll() {
    window.document.body.className = window.document.body.className.replace(' noscroll', '')
    window.document.body.style.top = 0;    
    window.scrollTo(0, last_scroll)
  }  

  var SAILPLAY = (function () {

    //methods that not supported in old browsers
    if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0)
          from += len;

        for (; from < len; from++) {
          if (from in this &&
            this[from] === elt)
            return from;
        }
        return -1;
      };
    }

    var cookies = {
      createCookie: function (name, value, days) {
        var expires;
        if (days) {
          var date = new Date();
          date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
          expires = "; expires=" + date.toGMTString();
        }
        else expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
      },
      readCookie: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
      },
      eraseCookie: function (name) {
        cookies.createCookie(name, "", -1);
      }
    };

    //simple jsonp service
    var JSONP = {
      currentScript: null,
      get: function (url, data, success, error) {
        var src = url + (url.indexOf("?") + 1 ? "&" : "?");
        var head = document.getElementsByTagName("head")[0];
        var newScript = document.createElement("script");
        var params = [];

        data = data || {};

        //auth_hash checking
        if (!_config.auth_hash) {
          delete data.auth_hash;
        }

        window.JSONP_CALLBACK = window.JSONP_CALLBACK || {};

        var callback_name = 'sailplay_' + new Date().getTime() + Math.random().toString().replace('.', '');

        var jsonpTimeout = setTimeout(function () {
          try {
            head.removeChild(newScript);
          }
          catch (err) {
          }
          delete window.JSONP_CALLBACK[callback_name];
        }, 10000);

        window.JSONP_CALLBACK[callback_name] = function (data) {
          clearTimeout(jsonpTimeout);
          try {
            head.removeChild(newScript);
          }
          catch (err) {
          }
          delete window.JSONP_CALLBACK[callback_name];
          success && success(data);
        };

        data["callback"] = 'JSONP_CALLBACK.' + callback_name;
        if (_config.dep_id) data.dep_id = _config.dep_id;

        for (var param_name in data) {
          params.push(param_name + "=" + encodeURIComponent(data[param_name]));
        }
        src += params.join("&");

        newScript.type = "text/javascript";
        newScript.src = src;
        newScript.onerror = function (ex) {
          try {
            head.removeChild(newScript);
          }
          catch (err) {
          }
          delete window.JSONP_CALLBACK[callback_name];
          error && error(ex);
        };

        head.insertBefore(newScript, head.firstChild);
      },
      success: null
    };

    var sp = {};

    //observer pattern
    var _handlers = {};

    sp.on = function (event, handler) {
      if (typeof (_handlers[event]) == "undefined")
        _handlers[event] = [];
      _handlers[event].push(handler);
    };

    sp.send = function (event, data, callback) {
      if (_handlers[event]) {
        for (var i = 0; i < _handlers[event].length; i++) {
          _handlers[event][i](data, callback);
        }
      }
    };

    //private config
    var _config = {};
    var _remote_login_init = false;

    function initError() {
      alert('Please init SailPlay HUB first!');
    }

    function remoteLogin(opts) {

      var frame;
      disableScroll();
      opts = opts || {};

      if (opts.node && opts.node.nodeType == 1 && opts.node.tagName == 'IFRAME') {
        frame = opts.node;
      }
      else {
        frame = document.createElement('IFRAME');
        frame.style.border = 'none';
        frame.style.position = 'fixed';
        frame.style.top = '0';
        frame.style.left = '0';
        frame.style.bottom = '0';
        frame.style.right = '0';
        frame.style.width = '410px';
        frame.style.height = '510px';
        frame.created = true;
        frame.style.background = 'transparent';
        frame.style.margin = 'auto';
        frame.style.zIndex = '100000';
        document.body.appendChild(frame);

      }

      var frame_id = frame.id || 'sailplay_login_frame_' + new Date().getTime();

      frame.name = frame_id;
      frame.id = frame_id;

      function onMessage(messageEvent) {

        var data = {};

        var _domain = _config.DOMAIN.indexOf('http:') != -1 || _config.DOMAIN.indexOf('https:') != -1 ? _config.DOMAIN : 'http:' + _config.DOMAIN;

        if (messageEvent.origin == _domain) {
          try {
            data = JSON.parse(messageEvent.data);
          }
          catch (e) {

          }
        }
        if (data.name == 'login.success') {
          sp.send('login.do', data.auth_hash);
          return;
        }
        if (data.name == 'login.cancel') {
          sp.send('login.cancel');
          cancelLogin();
          enableScroll();          
          return;
        }
        if (data.name == 'login.check') {
          if (data.auth_hash == 'None') {
            sp.send('logout');
          }
          else {
            cancelLogin();
            enableScroll();            
            sp.send('login.do', data.auth_hash, data)
          }
          return;
        }
        if (data.name == 'logout.success') {
          _config.auth_hash = '';
          sp.send('logout.success');
        }

      }

      function cancelLogin() {
        if (frame.created) {
          document.body.removeChild(frame);
          window.removeEventListener("message", onMessage, false);
          _remote_login_init = false;
        }
      }

      var params = {};
      params.partner_id = _config.partner.id;
      params.dep_id = _config.dep_id || '';
      params.background = opts.background || '';
      params.partner_info = opts.partner_info || 0;
      if(opts.reg_match_email_oid) {
        params.reg_match_email_oid = opts.reg_match_email_oid;
      }
      if(opts.css_link) {
        params.css_link = opts.css_link;
      }
      if (opts.lang) {
        params.lang = opts.lang;
      }
      params.disabled_options = opts.disabled_options || '';
      params.texts = JSON.stringify(opts.texts || '');


      var params_string = [];

      var src = _config.DOMAIN + '/users/auth-page/?';
      for (var param_name in params) {
        params_string.push(param_name + "=" + encodeURIComponent(params[param_name]));
      }
      src += params_string.join("&");

      frame.setAttribute('src', src);

      if (!_remote_login_init) {
        window.addEventListener("message", onMessage, false);
        _remote_login_init = true;
      }

    }

    //init function
    sp.on('init', function (params) {
      if (!params) {
        alert('SailPlay: provide required parameters');
      }
      if (!params.partner_id) {
        alert('SailPlay: provide partner_id');
        return;
      }
      JSONP.get((params.domain || 'http://sailplay.ru') + '/js-api/' + params.partner_id + '/config/', {
        lang: params.lang || 'ru',
        dep_id: (params.dep_id || '')
      }, function (response) {
        if (response && response.status == 'ok') {

          _config = response.config;
          _config.DOMAIN = (params.domain || 'http://sailplay.ru');
          _config.dep_id = params.dep_id || '';
          _config.env.staticUrl = params.static_url || _config.env.staticUrl;
          _config.social_networks = ['fb', 'vk', 'tw', 'gp', 'ok'];
          _config.platform = params.platform || 'desktop';

          //postmessage events init
          //1. bind action events
          function onActionMessage(messageEvent) {
            var data = {};
            if (messageEvent.origin == _config.DOMAIN) {
              try {
                data = JSON.parse(messageEvent.data);
              }
              catch (e) {

              }

              switch (data && data.name) {
                case 'actions.perform.success':
                  sp.send('actions.perform.success', data);
                  break;
                case 'actions.perform.error':
                  sp.send('actions.perform.error', data);
                  break;
                case 'actions.social.connect.complete':
                  sp.send('actions.social.connect.complete', data);
                  break;
                case 'actions.social.connect.success':
                  sp.send('actions.social.connect.success', data);
                  break;
                case 'actions.social.connect.error':
                  sp.send('actions.social.connect.error', data);
                  break;
                case 'friend_invite_cookie':
                  break;
                case 'actions.social.gp.like.mouseenter':
                  sp.send('actions.social.gp.like.mouseenter');
                  break;
                case 'actions.social.gp.like.mouseleave':
                  sp.send('actions.social.gp.like.mouseleave');
                  break;
              }

            }
          }

          window.addEventListener("message", onActionMessage, false);

          //2. recieve ref_hash info
          // _config.ref_hash = sp.url_params().ref_hash || '';
          //var cookie_frame = document.createElement('IFRAME');
          //cookie_frame.style.width = 0;
          //cookie_frame.style.height = 0;
          //cookie_frame.style.top = '-10000px';
          //cookie_frame.style.left = '-10000px';
          //cookie_frame.src = _config.DOMAIN + '/js-api/' + _config.partner.id + '/actions/social-widget/v2/';
          //document.body.appendChild(cookie_frame);
          //cookie_frame.onload = function(){
          //  document.body.removeChild(cookie_frame);
          //};

          sp.send('init.success', _config);
          //        console.dir(_config);
        } else {
          sp.send('init.error', response);
          alert('SailPlay: app load failed!');
        }
      });

    });

    sp.on('login.remote', function (options) {
      remoteLogin(options);
    });

    //////////////////
    //bind hub events
    sp.on('language.set', function (lang) {
      if (_config == {}) {
        initError();
        return;
      }
      if (typeof lang == 'string') {
        JSONP.get(_config.DOMAIN + '/js-api/' + _config.partner.id + '/config/', {lang: lang}, function (response) {
          if (response && response.status == 'ok') {
            _config.lang = response.config.lang;
            sp.send('language.set.success', _config.lang);
            //        console.dir(_config);
          } else {
            sp.send('language.set.error', response);
          }
        });
      }
    });

    //////////////////
    //bind api events

    //LOGIN & LOGOUT
    sp.on('login.do', function (auth_hash) {
      _config.auth_hash = auth_hash;
//    cookies.createCookie('sp_auth_hash', _config.auth_hash);
      var params = {
        auth_hash: _config.auth_hash
      };
      JSONP.get(_config.DOMAIN + _config.urls.users.info, params, function (res) {
        //      console.dir(res);
        if (res.status == 'ok') {
          sp.send('login.success', res.user);
        } else {
          _config.auth_hash = '';
//        cookies.eraseCookie('sp_auth_hash');
          sp.send('login.error', res);
        }
      });
    });

    sp.on('login', function (auth_hash) {

      if (_config == {}) {
        initError();
        return;
      }

      sp.send('login.do', auth_hash);

    });

    sp.on('logout', function () {
      if (_config == {}) {
        initError();
        return;
      }
      var req = document.createElement('iframe');
      req.width = 0;
      req.height = 0;
      req.style.border = 'none';
      req.src = _config.DOMAIN + '/users/logout/';
      document.body.appendChild(req);
      req.onload = function () {
        document.body.removeChild(req);
        _config.auth_hash = '';
        cookies.eraseCookie('sp_auth_hash');
        sp.send('logout.success');
      };


    });

    //USER INFO
    sp.on('load.user.info', function (p, callback) {
      if (_config == {}) {
        initError();
        return;
      }
      var params = {
        user_status: 1,
        badges: 1,
        last_badge: 1
      };
      if (p && p.purchases) {
        params.purchases = p.purchases;
      }
      if (p && p.all) {
        params.all = p.all;
      }
      if (p && p.user) {
        for (var param in p.user) {
          params[param] = p.user[param];
        }
      }
      else {
        params.auth_hash = _config.auth_hash;
      }
      JSONP.get(_config.DOMAIN + _config.urls.users.info, params, function (res) {
        callback && callback(res);
        if (res.status == 'ok') {
          sp.send('load.user.info.success', res);
        } else {
          sp.send('load.user.info.error', res);
        }
      });
    });

    sp.on('users.update', function (params, callback) {

      if (_config == {}) {
        initError();
        return;
      }

      params = params || {};

      if (_config.auth_hash) {
        params.auth_hash = _config.auth_hash;
      }

      JSONP.get(_config.DOMAIN + '/js-api/' + _config.partner.id + '/users/update/', params, function (res) {

        callback && callback(res);

        if (res.status === 'ok') {
          sp.send('users.update.success', res);
        }
        else {
          sp.send('users.update.error', res);
        }
      });

    });

    //user feedback
    sp.on('users.feedback', function (params, callback) {

      if (_config == {}) {
        initError();
        return;
      }

      params = params || {};

      if (_config.auth_hash) {
        params.auth_hash = _config.auth_hash;
      }
      else {
        sp.send('auth.error');
        return;
      }

      JSONP.get(_config.DOMAIN + _config.urls.users.feedback, params, function (res) {

        callback && callback(res);

        if (res.status === 'ok') {
          sp.send('users.feedback.success', res);
        }
        else {
          sp.send('users.feedback.error', res);
        }
      });

    });

    //USER HISTORY
    sp.on('load.user.history', function (params) {
      if (_config == {}) {
        initError();
        return;
      }

      params = params || {};

      if (_config.auth_hash) {
        params.auth_hash = _config.auth_hash;
      }

      JSONP.get(_config.DOMAIN + _config.urls.users.history, params, function (res) {
        //      console.dir(res);
        if (res.status == 'ok') {
          sp.send('load.user.history.success', res.history);
        } else {
          sp.send('load.user.history.error', res);
        }
      });
    });

    //GIFTS GET INFO
    sp.on('gifts.get', function (giftId) {
      if (_config == {}) {
        initError();
        return;
      }
      var params = {
        gift_id: giftId,
        auth_hash: _config.auth_hash
      };
      JSONP.get(_config.DOMAIN + _config.urls.gifts.get, params, function (res) {
        //      console.dir(res);
        if (res.status == 'ok') {
          sp.send('gifts.get.success', res.gift);
        } else {
          sp.send('gifts.get.error', res);
        }
      });
    });

    //GIFTS LIST
    sp.on('load.gifts.list', function (params) {

      if (_config == {}) {
        initError();
        return;
      }

      params = params || {};

      if (_config.auth_hash) {
        params.auth_hash = _config.auth_hash;
      }

      params.lang = params.lang || _config.lang || 'ru';

      JSONP.get(_config.DOMAIN + _config.urls.gifts.list, params, function (res) {
        //      console.dir(res);
        if (res.status == 'ok') {
          sp.send('load.gifts.list.success', res.gifts);
        } else {
          sp.send('load.gifts.list.error', res);
        }
      });
    });

    //GIFT CATEGORIES
    sp.on('load.gifts.categories', function (params) {

      if (_config == {}) {
        initError();
        return;
      }

      params = params || {};

      JSONP.get(_config.DOMAIN + _config.urls.gifts.categories_list, params, function (res) {
        if (res.status == 'ok') {
          sp.send('load.gifts.categories.success', res.categories);
        } else {
          sp.send('load.gifts.categories.error', res);
        }
      });

    });

    //GET GIFT
    function forceCompleteGiftPurchase(giftPurchase, opts) {
      var params = {
        gift_public_key: giftPurchase.gift_public_key,
        auth_hash: _config.auth_hash
      };
      if (opts && opts.no_user_sms) {
        params.no_user_sms = opts.no_user_sms;
      }
      JSONP.get(_config.DOMAIN + _config.urls.gifts.purchase.force_confirm, params, function (res) {
        if (res.status == 'ok') {
          sp.send('gift.purchase.force_complete.success', res);
        } else {
          sp.send('gift.purchase.force_complete.error', res);
        }
        //      console.dir(res);
      });
    }

    //CREATE GIFT PURCHASE V1
    sp.on('gifts.purchase', function (p) {
      if (_config == {}) {
        initError();
        return;
      }
      var gift = p.gift || {};
      if (!_config.auth_hash) {
        sp.send('gifts.purchase.auth.error', gift);
      } else {
        var params = {
          gift_id: gift.id,
          dep_id: _config.dep_id || _config.partner.depId || '',
          auth_hash: _config.auth_hash
        };
        JSONP.get(_config.DOMAIN + _config.urls.gifts.purchase.purchase, params, function (res) {
          if (res.status == 'ok') {
            sp.send('gifts.purchase.success', res);
            if (res.is_completed) {
              var requestedPurchase = res;
              if (!requestedPurchase.request_to_partner_url) {
                forceCompleteGiftPurchase(requestedPurchase, p.options);
              } else {
                var reqGiftPurchase = {
                  gift_public_key: requestedPurchase['gift_public_key'],
                  gift_sku: requestedPurchase['gift_sku'],
                  auth_hash: _config.auth_hash
                };
                if (requestedPurchase['user_phone']) {
                  reqGiftPurchase['user_phone'] = requestedPurchase['user_phone'];
                }
                if (requestedPurchase['email']) {
                  reqGiftPurchase['email'] = requestedPurchase['email'];
                }
                JSONP.get(requestedPurchase.request_to_partner_url, reqGiftPurchase, function (res) {
                  sp.send('gifts.purchase.partner_request.success', res);
                }, function (res) {
                  sp.send('gifts.purchase.partner_request.error', res);
                  forceCompleteGiftPurchase(requestedPurchase, p.options);
                });
              }
            }
          } else {
            sp.send('gift.purchase.error', res);
          }
          //        console.dir(res);
        });
      }
    });

    //BADGES LIST
    sp.on('load.badges.list', function (p) {
      if (_config == {}) {
        initError();
        return;
      }
      var params = {
        auth_hash: _config.auth_hash,
        lang: p && p.lang || _config.lang || 'ru'
      };
      if(p){
        if(p.include_rules) {
          params.include_rules = 1;
        }
      }
      JSONP.get(_config.DOMAIN + _config.urls.badges.list, params, function (res) {

        //      console.dir(res);
        if (res.status == 'ok') {

          function create_badge_actions(badge) {
            if (badge && badge.is_received) {

              badge.actions = {};

              for (var sn in _config.social_networks) {

                badge.actions[_config.social_networks[sn]] = {

                  socialType: _config.social_networks[sn],
                  action: 'badge',
                  shortLink: window.location.href,
                  pic: badge.thumbs.url_250x250,
                  badgeId: badge.id,
                  msg: badge.share_msg

                };

              }
            }
          }

          for (var ch in res.multilevel_badges) {

            var multi_line = res.multilevel_badges[ch];

            for (var b in multi_line) {

              create_badge_actions(multi_line[b]);

            }

          }

          for (var olb in res.one_level_badges) {

            create_badge_actions(res.one_level_badges[olb]);

          }

          sp.send('load.badges.list.success', res);
        } else {
          sp.send('load.badges.list.error', res);
        }
      });
    });

    //PROMO-CODES SECTION
    sp.on('promocodes.apply', function (promocode) {
      if (_config == {}) {
        initError();
        return;
      }
      promocode.auth_hash = _config.auth_hash;
      if (_config.auth_hash) {
        JSONP.get(_config.DOMAIN + _config.urls.promocodes.apply, promocode, function (res) {
          if (res.status == 'ok') {
            sp.send('promocodes.apply.success', res);
          } else {
            sp.send('promocodes.apply.error', res);
          }
        });
      } else {
        sp.send('promocodes.apply.auth.error', action);
      }
    });

    // user update
    sp.on("user.update", function (params) {
      if (_config == {}) {
        initError();
        return;
      }
      JSONP.get(_config.DOMAIN + "/js-api/" + _config.partner.id + "/users/update/", params, function (res) {
        if (res.status == 'ok') {
          sp.send('user.update.success', res);
        } else {
          sp.send('user.update.error', res);
        }
      })
    });

    //TAGS SECTIONS
    sp.on('tags.add', function (data, callback) {
      if (_config == {}) {
        initError();
        return;
      }
      if (_config.auth_hash || data.user) {
        var tagsObj = {
          tags: data.tags && data.tags.join(',') || []
        };
        if (data.user) {
          for (var p in data.user) {
            tagsObj[p] = data.user[p];
          }
        }
        else {
          tagsObj.auth_hash = _config.auth_hash;
        }
        JSONP.get(_config.DOMAIN + _config.urls.tags.add, tagsObj, function (res) {
          callback && callback(res);
          if (res.status == 'ok') {
            sp.send('tags.add.success', res);
          } else {
            sp.send('tags.add.error', res);
          }
        });
      } else {
        SAILPLAY.send('tags.add.auth.error', data);
      }
    });

    sp.on('tags.delete', function (data, callback) {
      if (_config == {}) {
        initError();
        return;
      }
      if (_config.auth_hash || data.user) {
        var tagsObj = {
          tags: data.tags && data.tags.join(',') || []
        };
        if (data.user) {
          for (var p in data.user) {
            tagsObj[p] = data.user[p];
          }
        }
        else {
          tagsObj.auth_hash = _config.auth_hash;
        }
        JSONP.get(_config.DOMAIN + _config.urls.tags.delete, tagsObj, function (res) {
          callback && callback(res);
          if (res.status == 'ok') {
            sp.send('tags.delete.success', res);
          } else {
            sp.send('tags.delete.error', res);
          }
        });
      } else {
        SAILPLAY.send('tags.delete.auth.error', data);
      }
    });

    // tag exist
    sp.on("tags.exist", function (data, callback) {
      if (_config == {}) {
        initError();
        return;
      }
      if (_config.auth_hash || data.user) {
        var obj = {
          tags: JSON.stringify(data.tags)
        };
        if (data.user) {
          for (var p in data.user) {
            obj[p] = data.user[p];
          }
        }
        else {
          obj.auth_hash = _config.auth_hash;
        }
        obj.lang = data.lang || _config.lang || 'ru';
        JSONP.get(_config.DOMAIN + _config.urls.tags.exist, obj, function (res) {
          if (res.status == 'ok') {
            sp.send('tags.exist.success', res);
          } else {
            sp.send('tags.exist.error', res);
          }
          callback && callback(res);
        });
      } else {
        sp.send('tags.exist.auth.error', data);
      }

    });

    /**
     * Add variables to user
     * @object data {custom_vars:{}, user: {}}
     * @function callback
     */
    sp.on('vars.add', function (data, callback) {

      if (_config == {}) {
        initError();
        return;
      }

      if (_config.auth_hash || data.user) {

        var obj = data.custom_vars;

        if (data.user)
          for (var p in data.user) obj[p] = data.user[p];
        else
          obj.auth_hash = _config.auth_hash;

        obj.lang = data.lang || _config.lang || 'ru';

        JSONP.get(_config.DOMAIN + _config.urls.users.custom_variables.add, obj, function (res) {
          if (res.status == 'ok')
            sp.send('vars.add.success', res);
          else
            sp.send('vars.add.error', res);
          callback && callback(res);
        });

      } else {
        sp.send('vars.add.auth.error', data);
      }

    });

    /**
     * Get user variables
     * @object data {names: [], user: {}}
     * @function callback
     */
    sp.on("vars.batch", function (data, callback) {

      if (_config == {}) {
        initError();
        return;
      }

      if (_config.auth_hash || data.user) {

        var obj = {
          names: JSON.stringify(data.names)
        };

        if (data.user)
          for (var p in data.user) obj[p] = data.user[p];
        else
          obj.auth_hash = _config.auth_hash;

        obj.lang = data.lang || _config.lang || 'ru';

        JSONP.get(_config.DOMAIN + _config.urls.users.custom_variables.batch_get, obj, function (res) {
          if (res.status == 'ok')
            sp.send('vars.batch.success', res);
          else
            sp.send('vars.batch.error', res);
          callback && callback(res);
        });

      } else {
        sp.send('vars.batch.auth.error', data);
      }

    });

    //LEADERBOARD SECTION
    sp.on('leaderboard.load', function () {
      if (_config == {}) {
        initError();
        return;
      }
      var tagsObj = {
        auth_hash: _config.auth_hash
      };
      JSONP.get(_config.DOMAIN + _config.urls.leaderboard.data, tagsObj, function (res) {
        if (res.status == 'ok') {
          sp.send('leaderboard.load.success', res.data);
        } else {
          sp.send('leaderboard.load.error', res);
        }
      });
    });

    //REVIEWS SECTION
    sp.on('load.reviews.list', function (data) {
      if (_config == {}) {
        initError();
        return;
      }

      var req_data = {};

      if (data) {
        req_data.page = data.page || 1
      }

      JSONP.get(_config.DOMAIN + _config.urls.reviews.list, req_data, function (res) {
        if (res.status == 'ok') {
          sp.send('load.reviews.list.success', {page: res.page, pages: res.pages, reviews: res.reviews});
        } else {
          sp.send('load.reviews.list.error', res);
        }
      });
    });

    sp.on('reviews.add', function (data) {
      if (_config == {}) {
        initError();
        return;
      }
      var req_data = {
        auth_hash: _config.auth_hash,
        rating: data.rating || '',
        review: data.review || ''
      };
      JSONP.get(_config.DOMAIN + _config.urls.reviews.add, req_data, function (res) {
        if (res.status == 'ok') {
          sp.send('reviews.add.success', res);
        } else {
          sp.send('reviews.add.error', res);
        }
      });
    });

    sp.on('purchases.add', function (data) {
      if (_config == {}) {
        initError();
        return;
      }
      var req_data = {
        auth_hash: _config.auth_hash,
        price: data.price || '',
        order_num: data.order_num || ''
      };
      JSONP.get(_config.DOMAIN + _config.urls.purchase, req_data, function (res) {
        if (res.status == 'ok') {
          sp.send('purchases.add.success', res);
        } else {
          sp.send('purchases.add.error', res);
        }
      });
    });

    sp.on('magic.config', function (name) {
      if (_config == {}) {
        initError();
        return;
      }
      JSONP.get(_config.DOMAIN + _config.urls.loyalty_page_config_by_name, { name: name || 'default' }, function (res) {
        if (res.status == 'ok') {
          sp.send('magic.config.success', res);
        } else {
          sp.send('magic.config.error', res);
        }
      });
    });

    //utils
    sp.config = function () {
      return _config;
    };

    sp.find_by_properties = function (arr, props) {
      var filtered_arr = [];
      for (var i = 0; i < arr.length; i += 1) {
        var seeked = arr[i];
        var good = true;
        for (var p in props) {
          if (props[p] != seeked[p]) {
            good = false;
          }
        }
        if (good) filtered_arr.push(seeked);
      }
      return filtered_arr;
    };

    sp.jsonp = JSONP;

    sp.cookies = cookies;

    sp.is_dom = function (obj) {
      //Returns true if it is a DOM node

      function isNode(o) {
        return (
          typeof Node === "object" ? o instanceof Node :
          o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
        );
      }

      //Returns true if it is a DOM element
      function isElement(o) {
        return (
          typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
          o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
        );
      }

      return isNode(obj) || isElement(obj);

    };

    sp.url_params = function () {
      // This function is anonymous, is executed immediately and
      // the return value is assigned to QueryString!
      var query_string = {};
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        var uri_component = pair && pair[1] ? pair[1].replace(/%([^\d].)/, "%25$1") : '';
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
          query_string[pair[0]] = decodeURIComponent(uri_component);
          // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
          query_string[pair[0]] = [query_string[pair[0]], decodeURIComponent(uri_component)];
          // If third or later entry with this name
        } else {
          query_string[pair[0]].push(decodeURIComponent(uri_component));
        }
      }
      return query_string;
    };

    return sp;

  }());

  if(typeof window !== 'undefined') window.SAILPLAY = SAILPLAY;
  if(typeof module !== 'undefined') module.exports = SAILPLAY;
  if(typeof exports !== 'undefined') exports = SAILPLAY;

}());

},{}],34:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],35:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=function(e){return function(u){var t=this;this.achiv=_knockout2.default.observableArray([]),this.update=function(e){e||(e=t.config),_sailplayHub2.default.send("load.badges.list",{lang:"ru"})},_sailplayHub2.default.on("load.badges.list.success",function(e){e.multilevel_badges.forEach(function(e){"Участник"!=e[0].name&&t.achiv(e)})}),e.subscribe("init",function(e){t.config=e,t.update(e)})}};var _knockout=require("knockout"),_knockout2=_interopRequireDefault(_knockout),_sailplayHub=require("sailplay-hub"),_sailplayHub2=_interopRequireDefault(_sailplayHub);

},{"knockout":28,"sailplay-hub":33}],36:[function(require,module,exports){
"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=function(t){return function(e){var u=this;this.gifts=_knockout2.default.observableArray([]),this.userPoints=_knockout2.default.observable(),this.getNoun=function(t,e,u,o){return t=Math.abs(parseInt(t)),(t%=100)>=5&&t<=20?o:(t%=10,1==t?e:t>=2&&t<=4?u:o)},t.subscribe("user_points",function(t){u.userPoints(t())}),this.popupVm={opened:_knockout2.default.observable(!1),width:_knockout2.default.observable("363px"),gift:_knockout2.default.observable(),points:this.userPoints,gift_purchase:function(e){_sailplayHub2.default.send("gifts.purchase",{gift:e}),_sailplayHub2.default.on("gifts.purchase.success",function(e){u.popupVm.opened(!1),document.body.className=document.body.className.replace(" no_scrol",""),"ok"==e.status&&setTimeout(function(){t.publish(null,"profile_update"),t.publish(null,"history_update")},500)})},openGift:function(t){document.body.className+=" no_scrol",u.popupVm.gift(t),u.popupVm.opened(!0)}},t.subscribe("init",function(t){u.config=t,_sailplayHub2.default.jsonp.get(t.DOMAIN+t.urls.gifts.list,{auth_hash:t.auth_hash,lang:"ru"},function(t){u.gifts(t.gifts)})})}};var _knockout=require("knockout"),_knockout2=_interopRequireDefault(_knockout),_sailplayHub=require("sailplay-hub"),_sailplayHub2=_interopRequireDefault(_sailplayHub);

},{"knockout":28,"sailplay-hub":33}],37:[function(require,module,exports){
"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}function pad(t,e){for(var u=t+"";u.length<e;)u="0"+u;return u}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=function(t){return function(e){var u=this;this.history=_knockout2.default.observableArray([]),this.next_status_point=_knockout2.default.observable(),this.purchases_sum=_knockout2.default.observable(),this.formatDate=function(t){var e=new Date(t);return pad(e.getDate(),2)+"."+pad(e.getMonth()+1,2)+"."+e.getFullYear()},this.checkPoints=function(t){return parseInt(t)>0?"+"+formatLargeNumber(t):formatLargeNumber(t)},this.update=function(t){t||(t=u.config),_sailplayHub2.default.jsonp.get(t.DOMAIN+t.urls.users.history,{auth_hash:t.auth_hash},function(t){t.history&&u.history(t.history.map(function(t){return t.data_text=_knockout2.default.observable(),t.details_opened=_knockout2.default.observable(!1),t}))})},t.subscribe("user_purchases_sum",function(t){u.purchases_sum(t())}),t.subscribe("next-status",function(t){u.next_status_point(t)}),t.subscribe("init",function(t){u.config=t,u.update(t)}),t.subscribe("history_update",this.update),this.popupVm={opened:_knockout2.default.observable(!1),history:this.history,pages:_knockout2.default.computed(function(){return Math.ceil(u.history().length/6)}),setPage:function(t){u.popupVm.current_page(t())},nextPage:function(){u.popupVm.current_page(u.popupVm.current_page()+1)},getPurchaseDetails:function(t){var e=t.details_opened();t.details_opened(!e),t.data_text()||_sailplayHub2.default.jsonp.get(u.config.DOMAIN+"/js-api/1649/purchases/get",{auth_hash:u.config.auth_hash,id:t.id},function(e){t.data_text(e)})},formatDate:this.formatDate,checkPoints:this.checkPoints,width:_knockout2.default.observable("650px"),current_page:_knockout2.default.observable(0),openHistory:function(){document.body.className+=" no_scrol",u.popupVm.current_page(0),u.popupVm.opened(!0)}}}};var _knockout=require("knockout"),_knockout2=_interopRequireDefault(_knockout),_sailplayHub=require("sailplay-hub"),_sailplayHub2=_interopRequireDefault(_sailplayHub);

},{"knockout":28,"sailplay-hub":33}],38:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function arr_diff(e,a){for(var t=[],s=[],r=0;r<e.length;r++)t[e[r]]=!0;for(var r=0;r<a.length;r++)t[a[r]]?delete t[a[r]]:t[a[r]]=!0;for(var n in t)s.push(n);return s}Object.defineProperty(exports,"__esModule",{value:!0});var _extends=Object.assign||function(e){for(var a=1;a<arguments.length;a++){var t=arguments[a];for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&(e[s]=t[s])}return e};exports.default=function(e){return function(a){var t=this;this.data=_knockout2.default.observable(),this.games_tags=["Хоккей","Футбол","Фигурное катание","Легкая атлетика","Беговые лыжи","Единоборства"],this.for_who_tags=["Покупаю: Себе","Покупаю: Ребенку","Покупаю: В подарок"],this.training_tags=["Тренировка: 1 раз в неделю или реже","Тренировка: 2-3 раза в неделю","Тренировка: 4-5 раз в неделю","Тренировка: 6 и более раз в неделю"],this.email_verified=["Подтверждение контактных данных"],this.registration=["Пользователь заполнил профиль"],this.is_register=_knockout2.default.observable(!1),this.vars=["city","address","child_birthdate","game_other"],this.tooltip_opened=_knockout2.default.observable(!1),this.tooltipOpen=function(){t.tooltip_opened(!0)},this.tooltipClose=function(){t.tooltip_opened(!1)},this.update=function(a){a||(a=t.config),_sailplayHub2.default.jsonp.get(a.DOMAIN+a.urls.users.info,{auth_hash:a.auth_hash,all:1,purchases:1},function(s){var r=_knockout2.default.mapping.fromJS(s);if(["first_name","last_name","middle_name"].map(function(e){r.user[e].extend({required:!0,minLength:3})}),r.user.birth_date()){r.user.birth_disabled=_knockout2.default.observable(!0);var n=r.user.birth_date();r.user.birth_day=_knockout2.default.observable(n.split("-")[2]).extend({required:!0,min:1,max:31,pattern:{message:"wrong",params:"^[0-9]{1,2}$"}}),r.user.birth_month=_knockout2.default.observable(t.popupVm.months().find(function(e){return e&&e.index==n.split("-")[1]})).extend({required:!0}),r.user.birth_year=_knockout2.default.observable(n.split("-")[0]).extend({required:!0,min:1863,pattern:{message:"wrong",params:"^[0-9]{4}$"}})}else r.user.birth_day=_knockout2.default.observable().extend({required:!0,min:1,max:31,pattern:{message:"wrong",params:"^[0-9]{1,2}$"}}),r.user.birth_month=_knockout2.default.observable().extend({required:!0}),r.user.birth_year=_knockout2.default.observable().extend({required:!0,min:1863,pattern:{message:"wrong",params:"^[0-9]{4}$"}});t.data(r),e.publish(r.user_points.confirmed,"user_points"),e.publish(r.purchases.sum,"user_purchases_sum"),_sailplayHub2.default.jsonp.get(a.DOMAIN+a.urls.users.custom_variables.batch_get,{names:JSON.stringify(t.vars),auth_hash:a.auth_hash},function(e){e.vars.length&&_knockout2.default.utils.arrayForEach(e.vars,function(e){"child_birthdate"==e.name?(t.data().user.child_bday(e.value.split("-")[2]),t.data().user.child_bmonth(t.popupVm.months().find(function(a){return a&&a.index==e.value.split("-")[1]})),t.data().user.child_byear(e.value.split("-")[0])):t.data().user[e.name]&&t.data().user[e.name](e.value)})});for(var o=[].concat(t.training_tags,t.games_tags,t.for_who_tags,t.registration,t.email_verified),i=[];o.length;)i.push(o.pop()),10!=i.length&&o.length||(_sailplayHub2.default.jsonp.get(a.DOMAIN+a.urls.tags.exist,{auth_hash:a.auth_hash,tags:JSON.stringify(i)},function(a){t.registration.forEach(function(s){var r=a.tags.find(function(e){return e.exist&&e.name==s});r&&!t.is_register()&&(t.is_register(!0),e.publish(null,"profile_filled")),r||setTimeout(function(){t.is_register()||t.popupVm.openProfile()},500)}),t.email_verified.forEach(function(t){a.tags.find(function(e){return e.exist&&e.name==t})&&e.publish(null,"email_verified")}),t.training_tags.forEach(function(e){a.tags.find(function(a){return a.exist&&a.name==e})&&t.data().user.training(e)}),t.for_who_tags.forEach(function(e){a.tags.find(function(a){return a.exist&&a.name==e})&&t.popupVm.for_who.push(e)}),t.games_tags.forEach(function(e){a.tags.find(function(a){return a.exist&&a.name==e})&&(t.data().user.active_games?t.data().user.active_games.push(e):t.data().user.active_games=[e])})}),i=[])})},e.subscribe("init",function(e){t.config=e,t.update(e)}),e.subscribe("profile_update",this.update),this.popupVm={opened:_knockout2.default.observable(!1),months:_knockout2.default.observableArray([void 0,{index:1,name:"Январь"},{index:2,name:"Февраль"},{index:3,name:"Март"},{index:4,name:"Апрель"},{index:5,name:"Май"},{index:6,name:"Июнь"},{index:7,name:"Июль"},{index:8,name:"Август"},{index:9,name:"Сентябрь"},{index:10,name:"Октябрь"},{index:11,name:"Ноябрь"},{index:12,name:"Декабрь"}]),step:_knockout2.default.observable(1),games:this.games_tags,is_register:_knockout2.default.observable(!1),is_profile:!0,active_games:_knockout2.default.observableArray([]),for_who:_knockout2.default.observableArray(),getField:function(e,a){return t.data()?(t.data().user[e]||(t.data().user[e]=a?_knockout2.default.observableArray():_knockout2.default.observable()),"child_bday"==e&&t.data().user[e].extend({min:1,max:31,pattern:{message:"wrong",params:"^[0-9]{1,2}$"}}),"child_byear"==e&&t.data().user[e].extend({min:1863,pattern:{message:"wrong",params:"^[0-9]{4}$"}}),"city"==e&&t.data().user[e].extend({required:!0}),"address"==e&&t.data().user[e].extend({required:!0}),t.data().user[e]):""},width:_knockout2.default.observable("356px"),openProfile:function(){document.body.className+=" no_scrol",t.popupVm.step(1),t.popupVm.width("356px"),t.data().user.active_games&&t.data().user.active_games.length&&t.popupVm.active_games(t.data().user.active_games),t.is_register()&&(e.publish(null,"profile_filled"),t.popupVm.is_register(!0)),t.popupVm.opened(!0)},back:function(){t.popupVm.step(t.popupVm.step()-1),t.popupVm.width("356px")},check_step_2_for_reg:function(){var e=_knockout2.default.toJS(t.data().user),a=!0;return t.popupVm.active_games().length||e.game_other?document.getElementsByClassName("check_sports")[0].className=document.getElementsByClassName("check_sports")[0].className.replace(" error",""):(document.getElementsByClassName("check_sports")[0].className+=" error",a=!1),t.popupVm.for_who&&t.popupVm.for_who().length?document.getElementsByClassName("for_who")[0].className=document.getElementsByClassName("for_who")[0].className.replace(" error",""):(document.getElementsByClassName("for_who")[0].className+=" error",a=!1),t.popupVm.for_who&&-1!==t.popupVm.for_who().indexOf(t.for_who_tags[0])&&(e.training||(document.getElementsByClassName("child_bday")[0].className=document.getElementsByClassName("child_bday")[0].className.replace(" error",""),document.getElementsByClassName("child_bmonth")[0].className=document.getElementsByClassName("child_bmonth")[0].className.replace(" error",""),document.getElementsByClassName("child_byear")[0].className=document.getElementsByClassName("child_byear")[0].className.replace(" error",""),document.getElementsByClassName("check_training")[0].className+=" error",a=!1)),t.popupVm.for_who&&-1!==t.popupVm.for_who().indexOf(t.for_who_tags[1])&&(document.getElementsByClassName("check_training")[0].className=document.getElementsByClassName("check_training")[0].className.replace(" error",""),t.data().user.child_bday()&&/^[0-9]{1,2}$/.test(t.data().user.child_bday())?document.getElementsByClassName("child_bday")[0].className=document.getElementsByClassName("child_bday")[0].className.replace(" error",""):(document.getElementsByClassName("child_bday")[0].className+=" error",a=!1),t.data().user.child_bmonth()?document.getElementsByClassName("child_bmonth")[0].className=document.getElementsByClassName("child_bmonth")[0].className.replace(" error",""):(document.getElementsByClassName("child_bmonth")[0].className+=" error",a=!1),t.data().user.child_byear()&&/^[0-9]{4}$/.test(t.data().user.child_byear())?document.getElementsByClassName("child_byear")[0].className=document.getElementsByClassName("child_byear")[0].className.replace(" error",""):(document.getElementsByClassName("child_byear")[0].className+=" error",a=!1)),a},next:function(){if(1==t.popupVm.step()){if(!t.data().user.first_name.isValid())return;if(!t.data().user.last_name.isValid())return;if(!t.data().user.middle_name.isValid())return;if(!t.data().user.birth_day.isValid())return;if(!t.data().user.birth_month.isValid())return;if(!t.data().user.birth_year.isValid())return}2!=t.popupVm.step()||t.popupVm.check_step_2_for_reg()?t.popupVm.step(t.popupVm.step()+1):t.popupVm.step(t.popupVm.step()+2),2==t.popupVm.step()?t.popupVm.width("650px"):t.popupVm.width("356px")},finish:function(a){var s=_knockout2.default.toJS(t.data().user),r={auth_hash:t.config.auth_hash},n=_extends({},r),o=_extends({},r);n=_extends({},n,{firstName:s.first_name,lastName:s.last_name,middleName:s.middle_name}),s.birth_day&&s.birth_month&&s.birth_year&&(n.birthDate=s.birth_year+"-"+s.birth_month.index+"-"+s.birth_day),s.child_bday&&s.child_bmonth&&s.child_byear&&(o.child_birthdate=s.child_byear+"-"+s.child_bmonth.index+"-"+s.child_bday);var i=[].concat(t.popupVm.for_who(),s.training,t.popupVm.active_games()),u=[].concat(t.training_tags,t.games_tags,t.for_who_tags),l=arr_diff(i,u);t.popupVm.check_step_2_for_reg()?(i.push(t.registration),t.is_register(!0),e.publish(null,"profile_filled"),setTimeout(function(){e.publish(null,"profile_update"),e.publish(null,"history_update"),e.publish(null,"actions_update")},5e3)):t.is_register(!1);for(var d=_extends({},r,{lang:"ru",tags:i.join(",")||[]}),m=[];l.length;)m.push(l.pop()),10!=m.length&&l.length||(_sailplayHub2.default.jsonp.get(t.config.DOMAIN+t.config.urls.tags.delete,{auth_hash:t.config.auth_hash,lang:"ru",tags:m.join(",")||[]}),m=[]);t.vars.forEach(function(e){s[e]&&(o[e]=s[e])}),_sailplayHub2.default.jsonp.get(t.config.DOMAIN+"/js-api/"+t.config.partner.id+"/users/update/",n),_sailplayHub2.default.jsonp.get(t.config.DOMAIN+t.config.urls.users.custom_variables.add,o),_sailplayHub2.default.jsonp.get(t.config.DOMAIN+t.config.urls.tags.add,d),t.is_register()&&(t.popupVm.opened(!1),document.body.className=document.body.className.replace(/no_scrol/g,""),document.querySelectorAll(".error").forEach(function(e){e.classList.remove("error")})),a&&(t.popupVm.opened(!1),document.body.className=document.body.className.replace(/no_scrol/g,""))}},e.subscribe("open_profile",this.popupVm.openProfile)}};var _knockout=require("knockout"),_knockout2=_interopRequireDefault(_knockout),_sailplayHub=require("sailplay-hub"),_sailplayHub2=_interopRequireDefault(_sailplayHub);

},{"knockout":28,"sailplay-hub":33}],39:[function(require,module,exports){
"use strict";function _interopRequireDefault(i){return i&&i.__esModule?i:{default:i}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=function(i){return function(e){var t=this;this.actions=_knockout2.default.observableArray([]),this.profile_not_filled=_knockout2.default.observable(!0),this.email_not_verified=_knockout2.default.observable(!0),this.isAction=function(i,e){return i.action?i.action==e:i.type==e},this.perform=function(i){_sailplayHub2.default.send("actions.perform",i)},this.openProfile=function(){i.publish(null,"open_profile")},this.verifyEmail=function(){location.href="/personal/#settings"},_sailplayHub2.default.on("actions.perform.complete",function(e){setTimeout(function(){i.publish(t.config,"init")},500)}),i.subscribe("profile_filled",function(){t.profile_not_filled(!1)}),i.subscribe("email_verified",function(){t.email_not_verified(!1)}),i.subscribe("actions_update",function(){_sailplayHub2.default.send("load.actions.list"),_sailplayHub2.default.on("load.actions.list.success",function(i){t.actions(i.actions)})}),i.subscribe("init",function(i){t.config=i,_sailplayHub2.default.send("load.actions.list"),_sailplayHub2.default.on("load.actions.list.success",function(i){t.actions(i.actions)})})}};var _knockout=require("knockout"),_knockout2=_interopRequireDefault(_knockout),_sailplayHub=require("sailplay-hub"),_sailplayHub2=_interopRequireDefault(_sailplayHub);require("sailplay-hub-actions");

},{"knockout":28,"sailplay-hub":33,"sailplay-hub-actions":32}],40:[function(require,module,exports){
"use strict";function _interopRequireDefault(n){return n&&n.__esModule?n:{default:n}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=function(n){return function(e){var t=this;this.setCookie=function(n,e,t){var s=new Date;s.setDate(s.getDate()+t);var p=escape(e)+"; expires="+s.toUTCString();document.cookie=n+"="+p},this.getCookie=function(n){var e=document.cookie,t=e.indexOf(" "+n+"=");if(-1==t&&(t=e.indexOf(n+"=")),-1==t)e=null;else{t=e.indexOf("=",t)+1;var s=e.indexOf(";",t);-1==s&&(s=e.length),e=unescape(e.substring(t,s))}return e},this.renew_messages=['<p>\n                Вы – легенда! С суммой покупок более 400 000 рублей для Вас открыта уникальная возможность заказа экипировки от мировых брендов по индивидуальным параметрам.                \n            </p>\n            <p>&nbsp;</p>            \n            <p>\n                Ваша персональная скидка увеличена до 15%*. Мы продолжаем начислять Вам по 2%* бонусов с каждого чека, которыми можно оплачивать до 100% своих покупок. Дополнительно, Вам на карту теперь возвращаются 100% стоимости услуг сервиса. Мы будем рады подарить Вам 3 000 бонусов в день рождения.\n            </p>\n            <p>&nbsp;</p>            \n            <p style="font-size: 12px">\n                * за исключением категории «беговые лыжи», на которую предоставляется скидка 10% и начисляется бонус 1%\n            </p>','<p>\n                Круг избранных очень мал. Теперь Вы в нем. Золотая медаль Ваша. С суммой покупок больше 200 000 рублей вы достигли статуса «Чемпион». Одна ступень отделяет вас от финала.\n            </p>\n            <p>&nbsp;</p>\n            <p>                \n                Ваша именная PRO-карта будет доставлена в любой удобный Вам розничный магазин СпортДепо, или по указанному Вами адресу. Ваша персональная скидка увеличена до 12%*. Но это ещё не всё! Теперь Вы можете оплачивать бонусами 100% своих покупок и услуги сервиса. Мы продолжаем начислять Вам по 2%* бонусов с каждого чека. В день рождения мы подарим Вам 2 000 бонусов.\n            </p>\n            <p>&nbsp;</p>            \n            <p style="font-size: 12px">\n                * за исключением категории «беговые лыжи», на которую предоставляется скидка 7% и начисляется бонус 1%\n            </p>','<p>\n                Поздравляем – вы достигли статуса «Вице-Чемпион»! Серебряная медаль Ваша! С суммой покупок свыше 90 000 рублей Ваша персональная скидка увеличена до 10%*. Но это ещё не всё! Мы продолжаем начислять Вам по 2%* бонусов и теперь Вы можете ими оплачивать до 50% стоимости своих покупок и услуг сервиса. В день рождения мы начислим Вам 1 000 бонусов в подарок.\n            </p>\n            <p>&nbsp;</p>            \n            <p style="font-size: 12px">\n                * за исключением категории «беговые лыжи», на которую предоставляется скидка 5% и начисляется бонус 1%\n            </p>','<p>\n                Мы рады, что Вы с нами! С суммой покупок 50 000 рублей Вы достигли статуса «Призёр» - получите свою первую медаль! Ваша персональная скидка 5%*. Но это ещё не всё! Мы продолжаем начислять Вам по 3%* бонусов на карту с каждой покупки. 1 бонус = 1 рубль. Теперь бонусами Вы можете оплатить до 30% стоимости своих покупок и услуг сервиса. В день рождения Вы получите 500 бонусов в подарок.\n            </p>\n            <p>&nbsp;</p>            \n            <p style="font-size: 12px">\n                * за исключением категории «беговые лыжи», на которую предоставляется скидка 3% и начисляется бонус 1%\n            </p>\n            ','<p>\n                Добро пожаловать в команду! Весь наш персонал – профессиональные спортсмены. Подберём экипировку с учетом Ваших индивидуальных потребностей. Этот сертификат и 300 бонусов в подарок на первую покупку!\n            </p>\n            <p>&nbsp;</p>                        \n            <p>\n                С каждой покупки на Вашу карту будут начисляться бонусы в объёме 5% * от суммы чека - используйте их для оплаты дальнейших покупок. 1 бонус = 1 рубль. Бонусами можно оплатить до 20% стоимости покупок.\n            </p>\n            <p>&nbsp;</p>                        \n            <p>            \n                Вам, как участнику программы лояльности, открывается доступ к привилегиям:\n            </p>\n            <ul>\n                <li>значительная выгода при покупке товаров</li>\n                <li>полезные информационные сервисы</li>\n                <li>300 бонусов в подарок на день рождения</li>\n                <li>выгодные условия по сервису и ремонту инвентаря</li>\n            </ul>\n            <p>&nbsp;</p>            \n            <p>\n                Список привилегий постоянно расширяется.\n            </p>\n            <p>\n                С каждой покупки на Вашу командную карту начисляются бонусы в объёме 5%* от суммы чека. 1 бонус = 1 рубль. Бонусами можно оплатить до 20% стоимости покупок.\n            </p>\n            <p>&nbsp;</p>            \n            <p style="font-size: 12px">* за исключением категории «беговые лыжи», на которую начисляется бонус 3%</p>'],this.messages=['<p>\n                С суммой покупок более 400 000 рублей Вы достигните статуса «Легенда». Для Вас откроется уникальная возможность заказа экипировки от мировых брендов по индивидуальным параметрам.\n                Ваша персональная скидка будет увеличена до 15%*. Мы продолжим начислять Вам по 2%* бонусов с каждого чека, которыми можно оплачивать до 100% своих покупок. Дополнительно, Вам на карту будут возвращаться 100% стоимости услуг сервиса.\n            </p>\n            <p>&nbsp;</p>            \n            <p style="font-size: 12px">\n                * за исключением категории «беговые лыжи», на которую предоставляется скидка 10% и начисляется бонус 1%\n            </p>','<p>\n                Круг избранных очень мал. Золотая медаль и титул «Чемпион» будут присвоены Вам при сумме покупок свыше 200 000 рублей.\n            </p>\n            <p>&nbsp;</p>\n            <p>                \n                Ваша именная PRO-карта будет изготовлена и доставлена в любой удобный Вам розничный магазин СпортДепо, или по указанному Вами адресу. Ваша персональная скидка будет увеличена до 12%*. Теперь Вы сможете оплачивать бонусами 100% своих покупок и услуги сервиса. Мы продолжим начислять Вам по 2%* бонусов с каждого чека.\n            </p>\n            <p>&nbsp;</p>            \n            <p style="font-size: 12px">\n                * за исключением категории «беговые лыжи», на которую предоставляется скидка 7% и начисляется бонус 1%\n            </p>','<p>\n                Когда сумма Ваших покупок превысит 90 000 рублей, Вы достигните статуса «Вице-Чемпион» и получите серебряную медаль. Ваша персональная скидка будет увеличена до 10%*. Но это ещё не всё! Мы продолжим начислять Вам по 2%* бонусов и Вы сможете ими оплачивать до 50% стоимости своих покупок и услуг сервиса.\n            </p>\n            <p>&nbsp;</p>            \n            <p style="font-size: 12px">\n                * за исключением категории «беговые лыжи», на которую предоставляется скидка 5% и начисляется бонус 1%\n            </p>','<p>\n                С суммой покупок 50 000 рублей Вы достигнете статуса «Призёр» и получите свою первую медаль! Ваша персональная скидка составит 5%*. Но это ещё не всё! Мы продолжим начислять Вам по 3%* бонусов на карту с каждой покупки. 1 бонус = 1 рубль. Теперь бонусами Вы сможете оплачивать до 30% стоимости своих покупок и услуг сервиса.\n            </p>\n            <p>&nbsp;</p>            \n            <p style="font-size: 12px">\n                * за исключением категории «беговые лыжи», на которую предоставляется скидка 3% и начисляется бонус 1%\n            </p>\n            ','<p>\n                При регистрации в программе Вы получаете статус «Участник» , который открывает доступ к привилегиям: \n            </p>\n            <ul>\n                <li>значительная выгода при покупке товаров</li>\n                <li>полезные информационные сервисы</li>\n                <li>300 бонусов в подарок на день рождения</li>\n                <li>выгодные условия по сервису и ремонту инвентаря</li>\n            </ul>\n            <p>&nbsp;</p>            \n            <p>\n                Список привилегий постоянно расширяется.\n            </p>\n            <p>\n                С каждой покупки на Вашу командную карту начисляются бонусы в объёме 5%* от суммы чека. 1 бонус = 1 рубль. Бонусами можно оплатить до 20% стоимости покупок.\n            </p>\n            <p>&nbsp;</p>            \n            <p style="font-size: 12px">* за исключением категории «беговые лыжи», на которую начисляется бонус 3%</p>'],this.nextStatusPoint=[4e5,2e5,9e4,5e4,0],this.statuses=_knockout2.default.observableArray([]),this.firstActive=_knockout2.default.observable(-1),this.isActive=function(e,s){return-1==t.firstActive()&&e.is_received&&(t.getCookie("last_status")&&t.getCookie("last_status")!=s()&&t.popupVm.openStatus(t.statuses()[s()],s,!0),t.setCookie("last_status",s()),t.firstActive(s()),n.publish(t.nextStatusPoint[s()-1>0?s()-1:0],"next-status")),t.firstActive()==s()},this.update=function(n){n||(n=t.config),t.alreadyActive=!1,_sailplayHub2.default.send("load.badges.list",{lang:"ru"})},_sailplayHub2.default.on("load.badges.list.success",function(e){_sailplayHub2.default.jsonp.get(t.config.DOMAIN+t.config.urls.tags.exist,{auth_hash:t.config.auth_hash,tags:JSON.stringify(["Участник","Призер","Вице-чемпион","Чемпион","Легенда"])},function(s){var p=s.tags.reverse(),i=!1;e.multilevel_badges.forEach(function(e){var s=[].concat(e),o=[].concat(e);"Участник"==e[0].name&&(p.forEach(function(e,s){e.exist&!i&&(t.getCookie("last_status")&&t.getCookie("last_status")!=s&&t.popupVm.openStatus(o.reverse()[s],function(){return s},!0),t.setCookie("last_status",s),t.firstActive(s),n.publish(t.nextStatusPoint[s-1>0?s-1:0],"next-status"),i=!0)}),t.statuses(s.reverse()))})})}),this.popupVm={messages:this.messages,renew_messages:this.renew_messages,index:_knockout2.default.observable(),status:_knockout2.default.observable(),renew:_knockout2.default.observable(!1),opened:_knockout2.default.observable(!1),width:_knockout2.default.observable("660px"),openStatus:function(n,e,s){document.body.className+=" no_scrol",t.popupVm.status(n),t.popupVm.renew(s||!1),t.popupVm.index(e()),t.popupVm.opened(!0)}},n.subscribe("init",function(n){t.config=n,t.update(n)})}};var _knockout=require("knockout"),_knockout2=_interopRequireDefault(_knockout),_sailplayHub=require("sailplay-hub"),_sailplayHub2=_interopRequireDefault(_sailplayHub);

},{"knockout":28,"sailplay-hub":33}],41:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=function(){return function(e){var t=this;this.tabs=_knockout2.default.observableArray(e.tabs),this.currentTabIndex=_knockout2.default.observable(0),this.setTab=function(e){t.currentTabIndex(e())}}};var _knockout=require("knockout"),_knockout2=_interopRequireDefault(_knockout);

},{"knockout":28}],42:[function(require,module,exports){
var _=require("underscore");module.exports={koAchiv:function(a){var n="";Array.prototype.join;return n+='\n    \x3c!-- ko foreach: achiv --\x3e\n    <span class="bns_achiv_item" data-bind="css: { act:  is_received }, attr: { title: descr }">\n        <img data-bind="attr: { src: thumbs.url_250x250 }" alt="">\n        <span data-bind="text: name"></span>\n    </span>\n    \x3c!-- /ko --\x3e\n'}};
},{"underscore":34}],43:[function(require,module,exports){
var _=require("underscore");module.exports={koGifts:function(n){var t="";Array.prototype.join;return t+='\n    \x3c!-- ko foreach: gifts --\x3e\n    <div class="bns_gift_item">\n        <div class="bns_gift_item_img">\n            <img data-bind="attr: { src: thumbs.url_250x250 }" alt="">\n        </div>\n        <span class="bns_gift_item_name" data-bind="text: name"></span>\n        <span class="bns_gift_item_bal">\n            <span class="bns_gift_item_bal_num" data-bind="text: points"></span>\n            <span class="bns_gift_item_bal_text" data-bind="text: $parent.getNoun(points, \'балл\', \'балла\', \'баллов\')"></span>\n        </span>\n        <a href="#" data-bind="click: $parent.popupVm.openGift.bind($data, $data)"class="bns_gift_item_linck">Получить</a>\n    </div>\n    \x3c!-- /ko --\x3e\n    <div data-bind="component: {\n        name: \'ko-popup\', \n        params: { data: popupVm }\n        }">\n        <h3 class="bns_gift_popup_header">Получение подарка</h3>\n        <div class="bns_gift_popup">\n            <img data-bind="attr: { src: gift() && gift().thumbs.url_250x250 }" alt="">\n            <div>\n                <p>Название: <span data-bind="text: gift() && gift().name"></span></p>\n                <p>Стоимость: <span class="bns_gift_popup_points" data-bind="text: gift() && gift().points"></span> баллов</p>                \n            </div>\n            <a href="javascript:void(0)" data-bind="visible: gift() && points() >= gift().points, click: gift_purchase.bind($data, gift())" class="bns_gift_popup_btn">Получить</a>\n            <a data-bind="visible: gift() && points() < gift().points" class="bns_gift_popup_btn disabled">Не хватает баллов</a>            \n        </div>\n    </div>\n'}};
},{"underscore":34}],44:[function(require,module,exports){
var _=require("underscore");module.exports={koHistory:function(n){var a="";Array.prototype.join;return a+='\n    <div class="bns_info_hist_container" data-bind="foreach: history().slice(0, 3)">\n        <div class="bns_info_hist_item">\n            <span class="bns_date" data-bind="text: $parent.formatDate(action_date)"></span>\n                \x3c!-- ko if: action == \'badge\' --\x3e\n                \x3c!-- ko if: $data.points_delta --\x3e\n                <span class="bns_name">Получена награда</span>      \n                \x3c!-- /ko --\x3e\n                \x3c!-- ko if: !$data.points_delta --\x3e\n                <span class="bns_name">Получен статус</span>      \n                \x3c!-- /ko --\x3e\n                \x3c!-- /ko --\x3e\n                \x3c!-- ko if: action == \'gift_purchase\' --\x3e\n                <span class="bns_name">Получен подарок</span>\n                \x3c!-- /ko --\x3e\n                \x3c!-- ko if: action == \'sharing\' --\x3e\n                \x3c!-- ko if: social_action == \'partner_page\' --\x3e\n                <span class="bns_name">Рассказал о нас в ВК</span>                            \n                \x3c!-- /ko --\x3e\n                \x3c!-- ko if: social_action == \'like\' --\x3e\n                <span class="bns_name">Вступил в нашу группу</span>                            \n                \x3c!-- /ko --\x3e           \n                \x3c!-- ko if: social_action == \'purchase\' --\x3e\n                <span class="bns_name">Поделился покупкой в ВК</span>                            \n                \x3c!-- /ko --\x3e   \n                \x3c!-- /ko --\x3e\n                \x3c!-- ko if: action == \'purchase\' --\x3e\n                <span class="bns_name" data-bind="text: name"></span>  \n                \x3c!-- /ko --\x3e\n                \x3c!-- ko if: action == \'extra\' --\x3e\n                <span class="bns_name" data-bind="text: name"></span>  \n                \x3c!-- /ko --\x3e\n            <span class="bns_point"><span data-bind="text: $data.points_delta && formatLargeNumber($parent.checkPoints(points_delta)) || \'-\'"></span></span>\n        </div>\n    </div>\n    <a href="#" data-bind="click: popupVm.openHistory, visible: history().length > 0" class="bns_open_hist">Вся история</a>\n    <div data-bind="visible: (next_status_point() - purchases_sum() * 1) > 0" class="bns_info_bon_bal" style="float: left; width: 100%; margin-top: 6px;">\n        <span class="bns_info_bal_num" style="font-size: 18px; margin: 0; color: #00a6e1; font-style: italic" data-bind="text: formatLargeNumber(next_status_point() - purchases_sum())"></span>\n        <span class="bns_info_bal_text" style="font-size: 16px; color: #ccc; font-weight: 300">р. до следующего статуса</span>\n    </div>\n    \n    <div data-bind="component: {\n        name: \'ko-popup\', \n        params: { data: popupVm }\n        }">\n        <h3>Вся история</h3>\n        <table class="bns_hist_table">\n            <tbody data-bind="foreach: history().slice(current_page() * 6, (current_page() * 6) + 6)">\n                <tr>\n                    <td>\n                        <span data-bind="text: $parent.formatDate(action_date)"></span>\n                    </td>\n                    <td>\n                        \x3c!-- ko if: action == \'badge\' --\x3e\n                            \x3c!-- ko if: $data.points_delta --\x3e\n                            <span><b>Получена награда</b></span>      \n                            <span class="bns_hist_gift_name blue"><b data-bind="text: name"></b></span>                                                                      \n                            \x3c!-- /ko --\x3e\n                            \x3c!-- ko if: !$data.points_delta --\x3e\n                            <span><b>Получен статус</b></span>      \n                            <span class="bns_hist_gift_name blue"><b data-bind="text: name"></b></span>                                \n                            \x3c!-- /ko --\x3e\n                        \x3c!-- /ko --\x3e\n                        \x3c!-- ko if: action == \'gift_purchase\' --\x3e\n                        <span><b>Получен подарок </b></span>\n                        <span class="bns_hist_gift_name blue"><b data-bind="text: name"></b></span>                                                        \n                        \x3c!-- /ko --\x3e\n                        \x3c!-- ko if: action == \'sharing\' --\x3e\n                            \x3c!-- ko if: social_action == \'partner_page\' --\x3e\n                            <span><b>Рассказал о нас в ВК</b></span>                            \n                            \x3c!-- /ko --\x3e\n                            \x3c!-- ko if: social_action == \'like\' --\x3e\n                            <span><b>Вступил в нашу группу</b></span>                            \n                            \x3c!-- /ko --\x3e           \n                            \x3c!-- ko if: social_action == \'purchase\' --\x3e\n                            <span><b>Поделился покупкой в ВК</b></span>                            \n                            \x3c!-- /ko --\x3e   \n                        \x3c!-- /ko --\x3e\n                        \x3c!-- ko if: action == \'purchase\' --\x3e\n                        <span><b data-bind="text: name"></b></span>  \n                        <span class="bns_hist_gift_name blue">\n                            <a class="bns_hist_gift_link" href="javascript:void(0)" data-bind="click: $parent.getPurchaseDetails"><b data-bind="text: formatLargeNumber(price)" style="display: inline; padding-left: 0; padding-right: 0"></b> рублей</a>                            \n                            <div class="bns_hist_purchase_detail" data-bind="visible: details_opened, foreach: data_text() && data_text().cart.cart.positions">\n                                <hr>                                \n                                <div class="p_name" data-bind="text: product.name"></div>\n                                <div>\n                                    кол-во: <span data-bind="text: quantity && parseFloat(quantity).toFixed(2)"></span>\n                                    цена: <span data-bind="text: formatLargeNumber(price)"></span>\n                                    бонусов <span data-bind="visible: points > 0">начислено: </span><span data-bind="text: formatLargeNumber(points)"></span><span data-bind="visible: discount_points"> списано: <span data-bind="text: discount_points"></span></span>\n                                </div>\n                            </div>\n                        </span>                                                                                        \n                        \x3c!-- /ko --\x3e\n                        \x3c!-- ko if: action == \'extra\' --\x3e\n                        <span><b data-bind="text: name"></b></span>  \n                        \x3c!-- /ko --\x3e                        \n                    </td>\n                    <td>\n                        \x3c!-- ko if: $data.debited_points_delta > 0 --\x3e<span data-bind="text: $data.debited_points_delta && \'-\' + formatLargeNumber($data.debited_points_delta)" style="color:red; display: inline"></span>&nbsp;\x3c!-- /ko --\x3e<span data-bind="text: $data.points_delta && formatLargeNumber($parent.checkPoints(points_delta)) || \'-\'" style="display: inline"></span>\n                    </td>\n                </tr>\n            </tbody>\n        </table>\n        <div class="bns_hist_pager" data-bind="foreach: ko.utils.range(1, pages)">\n            <a href="#" data-bind="click: $parent.setPage.bind($data, $index), text: $index() + 1, css: { act: $parent.current_page() == $index() }"></a>\n        </div>\n        <a href="#" class="bns_hist_next" data-bind="click: nextPage, visible: current_page() < (pages() - 1)">Следующая страница</a>\n        </div>\n'}};
},{"underscore":34}],45:[function(require,module,exports){
var _=require("underscore");module.exports={koProfile:function(n){var e="";Array.prototype.join;return e+='\n    <span class="bns_info_name">\n        <span data-bind="text: data() && (data().user.first_name() || \'Неизвестный\')"></span>\n        <span data-bind="text: data() && data().user.last_name"></span>\n    </span>\n    <a href="#" class="bns_edit_profile" data-bind="click: popupVm.openProfile">Редактировать профиль</a>\n    <div class="bns_info_bon_bal" id="bonuses"  data-bind="event: { mouseover: tooltipOpen, mouseout: tooltipClose }">\n        <span class="bns_info_bal_num" data-bind="text: data() && formatLargeNumber(data().user_points.confirmed)"></span>\n        <span class="bns_info_bal_text">бонусных<br>баллов</span>\n    </div>\n    <div class="bns_info_bon_bal">\n        <span class="bns_info_bal_num" style="font-size: 18px; margin: 0" data-bind="text: data() && formatLargeNumber(data().user_points.unconfirmed)"></span>\n        <span class="bns_info_bal_text" style="font-size: 16px; color: #ccc; font-weight: 300">неподтвержденных баллов</span>\n    </div>            \n\n    <div data-bind="component: {\n        name: \'ko-popup\', \n        params: { data: popupVm }\n        }">\n        <h3 data-bind="visible: !is_register()">Регистрация</h3>\n        <h3 data-bind="visible: is_register()">Редактирование профиля<br><br></h3>\n        <span class="bns_reg_gift" data-bind="visible: !is_register()">\n            Получите 500 баллов,<br>пройдя быструю регистрацию\n        </span>\n        \x3c!--\n            <div class="bns_reg_step">\n                <div class="bns_reg_step_item act"></div>\n                <div class="bns_reg_step_item"></div>\n            </div>\n        --\x3e\n        <div class="bns_reg_step_block bns_reg_step1" data-bind="css: { act: step() == 1 }">\n            <div class="bns_input_block">\n                <input type="text" placeholder="Фамилия" data-bind="\n                    value: getField(\'last_name\'), \n                    css: { error: getField(\'last_name\').isValid && !getField(\'last_name\').isValid() } ">\n            </div>\n            <div class="bns_input_block">\n                <input type="text" placeholder="Имя" data-bind="value: getField(\'first_name\'), \n                    css: { error: getField(\'first_name\').isValid && !getField(\'first_name\').isValid() } ">\n            </div>\n            <div class="bns_input_block">\n                <input type="text" placeholder="Отчество" data-bind="value: getField(\'middle_name\'), \n                    css: { error: getField(\'middle_name\').isValid && !getField(\'middle_name\').isValid() } ">\n            </div>\n            <div class="bns_input_block bns_input_block_date">\n                <label>День рождения</label>\n                <input type="number" min="1" class="bns_input_block_d" placeholder="День" data-bind="value: getField(\'birth_day\'), \n                    css: { \n                        disabled: getField(\'birth_disabled\'),\n                        error: getField(\'birth_day\').isValid && !getField(\'birth_day\').isValid() \n                    }">\n                <div class="select-style bns_input_block_m" data-bind="\n                    css: { \n                        disabled: getField(\'birth_disabled\'),\n                        selected: getField(\'birth_month\') && getField(\'birth_month\')() && getField(\'birth_month\')().index > -1,\n                        error: getField(\'birth_month\').isValid && !getField(\'birth_month\').isValid()               \n                    }">\n                    <select data-bind="\n                        options: months,\n                        optionsText: function(item) {\n                            return item && item.name || \'\'\n                        },\n                        value: getField(\'birth_month\')\n                    "></select>\n                </div>\n                <input type="number" min="1900" class="bns_input_block_y" placeholder="Год" data-bind="value: getField(\'birth_year\'), \n                    css: { \n                        error: getField(\'birth_year\').isValid && !getField(\'birth_year\').isValid(),\n                        disabled: getField(\'birth_disabled\')\n                    }">\n            </div>\n            <div class="bns_input_block">\n                <input type="text" placeholder="Город" data-bind="value: getField(\'city\')">\n            </div>\n            <div class="bns_input_block">\n                <input type="text" placeholder="Адрес" data-bind="value: getField(\'address\')">\n            </div>\n            <div class="bns_input_block">\n                <a href="#" class="bns_btn" data-bind="click: next">Далее</a>\n            </div>\n        </div>\n        <div class="bns_reg_step_block bns_reg_step2" data-bind="css: { act: step() == 2 }">\n            <div class="bns_input_block">\n                <label class="check_sports">Какими видами спорта вы занимаетесь? </label>\n                <br><br><br>\n                \x3c!-- ko foreach: games --\x3e\n                <div class="bns_checkbox">\n                    <input type="checkbox" data-bind="value: $data, checked: $parent.active_games, attr: { id: \'id\' + $index() }">\n                    <label data-bind="attr: { for: \'id\' + $index() }, text: $data"></label>\n                </div>\n                \x3c!-- /ko --\x3e\n                <input type="text" placeholder="Свой вариант" data-bind="value: getField(\'game_other\')">\n            </div>\n            <div class="bns_input_block">\n                <br><br>\n                <label class="for_who">Вы покупаете</label>\n                <br><br><br>\n                <div class="bns_checkbox">\n                    <input type="checkbox" id="rad5" value="Покупаю: Себе" data-bind="checked: for_who">\n                    <label for="rad5">Себе</label>\n                </div>\n                <div class="bns_checkbox">\n                    <input type="checkbox" id="rad6" value="Покупаю: Ребенку" data-bind="checked: for_who">\n                    <label for="rad6">Ребенку</label>\n                </div>\n                <div class="bns_checkbox">\n                    <input type="checkbox" id="rad7" value="Покупаю: В подарок" data-bind="checked: for_who">\n                    <label for="rad7">В подарок</label>\n                </div>\n            </div>\n            <div class="bns_input_block bns_input_block_date">\n                <br><br>                \n                <label>День рождения ребенка</label>\n                <br><br><br>\n                <input type="number" min="1" class="child_bday bns_input_block_d" placeholder="День" data-bind="value: getField(\'child_bday\')">\n                <div class="select-style bns_input_block_m child_bmonth" data-bind="\n                    css: { selected: getField(\'child_bmonth\') && getField(\'child_bmonth\')() && getField(\'child_bmonth\')().index > -1 }">\n                    <select data-bind="\n                        options: months,\n                        optionsText: function(item) {\n                            return item && item.name || \'\'\n                        },\n                        value: getField(\'child_bmonth\')\n                    "></select>\n                </div>                    \n                <input type="number" min="1900" class="bns_input_block_y child_byear" placeholder="Год" data-bind="value: getField(\'child_byear\')">\n            </div>\n            <div class="bns_input_block">\n                <br><br>                \n                <label class="check_training">Сколько времени в неделю вы уделяете тренировкам? </label>\n                <br><br><br>\n                <div class="bns_checkbox bns_checkbox_big">\n                    <input type="radio" name="rad1" id="rad1" value="Тренировка: 1 раз в неделю или реже" data-bind="checked: getField(\'training\')">\n                    <label for="rad1">1 раз в неделю или реже</label>\n                </div>\n                <div class="bns_checkbox bns_checkbox_big">\n                    <input type="radio" name="rad1" id="rad2" value="Тренировка: 2-3 раза в неделю" data-bind="checked: getField(\'training\')">\n                    <label for="rad2">2-3 раза в неделю</label>\n                </div>\n                <div class="bns_checkbox bns_checkbox_big">\n                    <input type="radio" name="rad1" id="rad3" value="Тренировка: 4-5 раз в неделю" data-bind="checked: getField(\'training\')">\n                    <label for="rad3">4-5 раз в неделю</label>\n                </div>\n                <div class="bns_checkbox bns_checkbox_big">\n                    <input type="radio" name="rad1" id="rad4" value="Тренировка: 6 и более раз в неделю" data-bind="checked: getField(\'training\')">\n                    <label for="rad4">6 и более раз в неделю</label>\n                </div>\n            </div>\n            <div class="bns_input_block bns_input_block_cent">\n                <a href="#" class="bns_btn left" data-bind="click: back">Назад</a>                \n                <a href="#" class="bns_btn right" data-bind="click: is_register() ? finish : next, text: is_register() ? \'Сохранить\' : \'Далее\'">Далее</a>\n            </div>\n        </div>\n        <div class="bns_reg_step_block bns_reg_step3" data-bind="css: { act: step() == 3 }">\n            <div class="bns_text_block">\n                Благодарим за вступление в команду СпортДепо!\n                <br><br>\n                Бонусы будут начислены в течение\n                5 минут после регистрации и\n                действительны в течение 90 дней\n                с момента начисления\n            </div>\n            <div class="bns_input_block">\n                <a href="#" class="bns_btn" data-bind="click: finish.bind($data, true)">Завершить</a>\n            </div>\n        </div>\n        <div class="bns_reg_step_block bns_reg_step4" data-bind="css: { act: step() == 4 }">\n            <div class="bns_text_block">\n                Не все поля заполнены, баллы за заполнение профиля будут начислены после заполнения всех необходимых полей\n            </div>\n            <div class="bns_input_block">\n                <a href="#" class="bns_btn" data-bind="click: finish.bind($data, true)">Завершить</a>\n            </div>\n        </div>\n    </div>\n'}};
},{"underscore":34}],46:[function(require,module,exports){
var _=require("underscore");module.exports={koQuest:function(n){var s="";Array.prototype.join;return s+='\n    <div class="bns_qust_item" data-bind="click: openProfile, visible: profile_not_filled">\n        <div class="bns_qust_item_left">\n\n            <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n                viewBox="0 0 45.4 45.4" style="width: 45px;" xml:space="preserve">\n\n                <path d="M-637.6,552.8h2.7c0,0,0.8-0.1,1.2-0.5c0.4-0.4,0.4-1.2,0.4-1.2s-0.1-3.7,1.6-4.2\n                        c1.7-0.5,3.8,3.5,6.1,5.1c1.7,1.2,3,0.9,3,0.9l6.1-0.1c0,0,3.2-0.2,1.7-2.7c-0.1-0.2-0.9-1.9-4.5-5.3c-3.8-3.6-3.3-3,1.3-9.1\n                        c2.8-3.7,3.9-6,3.6-7c-0.3-0.9-2.4-0.7-2.4-0.7l-6.9,0c0,0-0.5-0.1-0.9,0.2c-0.4,0.2-0.6,0.7-0.6,0.7s-1.1,2.9-2.5,5.4\n                        c-3.1,5.2-4.3,5.5-4.8,5.2c-1.2-0.8-0.9-3-0.9-4.6c0-5,0.8-7.1-1.5-7.7c-0.7-0.2-1.3-0.3-3.2-0.3c-2.5,0-4.5,0-5.7,0.6\n                        c-0.8,0.4-1.4,1.2-1,1.3c0.5,0.1,1.5,0.3,2,1c0.7,1,0.7,3.1,0.7,3.1s0.4,5.9-0.9,6.7c-0.9,0.5-2.2-0.5-4.9-5.2\n                        c-1.4-2.4-2.5-5.1-2.5-5.1s-0.2-0.5-0.6-0.8c-0.4-0.3-1.1-0.4-1.1-0.4l-6.5,0c0,0-1,0-1.3,0.5c-0.3,0.4,0,1.2,0,1.2s5.1,12,10.9,18\n                        C-643.6,553.2-637.6,552.8-637.6,552.8L-637.6,552.8z" />\n                <path d="M22.7,0C10.2,0,0,10.2,0,22.7s10.2,22.7,22.7,22.7c12.5,0,22.7-10.2,22.7-22.7S35.2,0,22.7,0z\n                        M33.5,16L22.7,32c-0.2,0.3-0.5-0.4-0.9,0.6h0c-0.4,0-0.7-0.3-0.9-0.6l-8.1-10.6c-0.3-0.4-0.3-1.1,0-1.5c0.4-0.4,1-0.5,1.4-0.3\n                        l7.5,6l10-11.2c0.4-0.4,1.1-0.4,1.5,0C33.8,14.8,33.8,15.5,33.5,16z" />\n            </svg>\n        </div>\n        <div class="bns_qust_item_right">\n\n            <span class="bns_qust_item_right_name">Заполни профиль</span>\n\n            <span class="bns_qust_item_right_bal">\n                <span class="bns_qust_item_right_bal_num">500</span>\n            <span class="bns_qust_item_right_bal_text">баллов</span>\n            </span>\n            <a href="#" class="bns_qust_item_right_btn">Выполнить</a>\n        </div>\n    </div>\n    <div class="bns_qust_item" data-bind="click: verifyEmail, visible: email_not_verified">\n        <div class="bns_qust_item_left">\n\n            <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n                viewBox="0 0 45.4 45.4" style="width: 45px;" xml:space="preserve">\n\n                <path d="M-637.6,552.8h2.7c0,0,0.8-0.1,1.2-0.5c0.4-0.4,0.4-1.2,0.4-1.2s-0.1-3.7,1.6-4.2\n                        c1.7-0.5,3.8,3.5,6.1,5.1c1.7,1.2,3,0.9,3,0.9l6.1-0.1c0,0,3.2-0.2,1.7-2.7c-0.1-0.2-0.9-1.9-4.5-5.3c-3.8-3.6-3.3-3,1.3-9.1\n                        c2.8-3.7,3.9-6,3.6-7c-0.3-0.9-2.4-0.7-2.4-0.7l-6.9,0c0,0-0.5-0.1-0.9,0.2c-0.4,0.2-0.6,0.7-0.6,0.7s-1.1,2.9-2.5,5.4\n                        c-3.1,5.2-4.3,5.5-4.8,5.2c-1.2-0.8-0.9-3-0.9-4.6c0-5,0.8-7.1-1.5-7.7c-0.7-0.2-1.3-0.3-3.2-0.3c-2.5,0-4.5,0-5.7,0.6\n                        c-0.8,0.4-1.4,1.2-1,1.3c0.5,0.1,1.5,0.3,2,1c0.7,1,0.7,3.1,0.7,3.1s0.4,5.9-0.9,6.7c-0.9,0.5-2.2-0.5-4.9-5.2\n                        c-1.4-2.4-2.5-5.1-2.5-5.1s-0.2-0.5-0.6-0.8c-0.4-0.3-1.1-0.4-1.1-0.4l-6.5,0c0,0-1,0-1.3,0.5c-0.3,0.4,0,1.2,0,1.2s5.1,12,10.9,18\n                        C-643.6,553.2-637.6,552.8-637.6,552.8L-637.6,552.8z" />\n                <path d="M22.7,0C10.2,0,0,10.2,0,22.7s10.2,22.7,22.7,22.7c12.5,0,22.7-10.2,22.7-22.7S35.2,0,22.7,0z\n                        M33.5,16L22.7,32c-0.2,0.3-0.5-0.4-0.9,0.6h0c-0.4,0-0.7-0.3-0.9-0.6l-8.1-10.6c-0.3-0.4-0.3-1.1,0-1.5c0.4-0.4,1-0.5,1.4-0.3\n                        l7.5,6l10-11.2c0.4-0.4,1.1-0.4,1.5,0C33.8,14.8,33.8,15.5,33.5,16z" />\n            </svg>\n        </div>\n        <div class="bns_qust_item_right">\n\n            <span class="bns_qust_item_right_name">Подтверди свой email</span>\n\n            <span class="bns_qust_item_right_bal">\n                <span class="bns_qust_item_right_bal_num">200</span>\n            <span class="bns_qust_item_right_bal_text">баллов</span>\n            </span>\n            <a href="/personal/#settings" class="bns_qust_item_right_btn">Выполнить</a>\n        </div>\n    </div>    \n    \x3c!-- ko foreach: actions --\x3e\n    <div class="bns_qust_item" data-bind="click: $parent.perform.bind($data, $data)">\n        <div class="bns_qust_item_left">\n            \x3c!-- ko if: $parent.isAction($data, \'partner_page\') || $parent.isAction($data, \'like\') || $parent.isAction($data, \'purchase\')--\x3e\n            <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n                viewBox="0 0 45.8 26.1" style="width: 46px;" xml:space="preserve">\n                <defs>\n                    <filter id="white-glow">\n                        <feFlood result="flood" flood-color="#ffffff" flood-opacity="0.6"></feFlood>\n                        <feComposite in="flood" result="mask" in2="SourceGraphic" operator="in"></feComposite>\n                        <feMorphology in="mask" result="dilated" operator="dilate" radius="1"></feMorphology>\n                        <feGaussianBlur in="dilated" result="blurred" stdDeviation="4"></feGaussianBlur>\n                        <feMerge>\n                            <feMergeNode in="blurred"></feMergeNode>\n                            <feMergeNode in="SourceGraphic"></feMergeNode>\n                        </feMerge>\n                    </filter>\n                </defs>\n                <path d="M22.4,26h2.7c0,0,0.8-0.1,1.2-0.5c0.4-0.4,0.4-1.2,0.4-1.2s-0.1-3.7,1.6-4.2\n                                c1.7-0.5,3.8,3.5,6.1,5.1c1.7,1.2,3,0.9,3,0.9l6.1-0.1c0,0,3.2-0.2,1.7-2.7c-0.1-0.2-0.9-1.9-4.5-5.3c-3.8-3.6-3.3-3,1.3-9.1\n                                c2.8-3.7,3.9-6,3.6-7c-0.3-0.9-2.4-0.7-2.4-0.7l-6.9,0c0,0-0.5-0.1-0.9,0.2c-0.4,0.2-0.6,0.7-0.6,0.7S33.8,5,32.4,7.5\n                                c-3.1,5.2-4.3,5.5-4.8,5.2c-1.2-0.8-0.9-3-0.9-4.6c0-5,0.8-7.1-1.5-7.7C24.5,0.1,23.9,0,22,0c-2.5,0-4.5,0-5.7,0.6\n                                c-0.8,0.4-1.4,1.2-1,1.3c0.5,0.1,1.5,0.3,2,1C18,3.9,18,6,18,6s0.4,5.9-0.9,6.7c-0.9,0.5-2.2-0.5-4.9-5.2C10.7,5,9.7,2.3,9.7,2.3\n                                S9.5,1.8,9.1,1.6C8.6,1.3,8,1.2,8,1.2l-6.5,0c0,0-1,0-1.3,0.5c-0.3,0.4,0,1.2,0,1.2s5.1,12,10.9,18C16.4,26.4,22.4,26,22.4,26\n                                L22.4,26z" />\n            </svg>\n            \x3c!-- /ko --\x3e\n            \x3c!-- ko if: $parent.isAction($data, \'fillProfile\') --\x3e\n            <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n                viewBox="0 0 45.4 45.4" style="width: 45px;" xml:space="preserve">\n\n                <path d="M-637.6,552.8h2.7c0,0,0.8-0.1,1.2-0.5c0.4-0.4,0.4-1.2,0.4-1.2s-0.1-3.7,1.6-4.2\n                                c1.7-0.5,3.8,3.5,6.1,5.1c1.7,1.2,3,0.9,3,0.9l6.1-0.1c0,0,3.2-0.2,1.7-2.7c-0.1-0.2-0.9-1.9-4.5-5.3c-3.8-3.6-3.3-3,1.3-9.1\n                                c2.8-3.7,3.9-6,3.6-7c-0.3-0.9-2.4-0.7-2.4-0.7l-6.9,0c0,0-0.5-0.1-0.9,0.2c-0.4,0.2-0.6,0.7-0.6,0.7s-1.1,2.9-2.5,5.4\n                                c-3.1,5.2-4.3,5.5-4.8,5.2c-1.2-0.8-0.9-3-0.9-4.6c0-5,0.8-7.1-1.5-7.7c-0.7-0.2-1.3-0.3-3.2-0.3c-2.5,0-4.5,0-5.7,0.6\n                                c-0.8,0.4-1.4,1.2-1,1.3c0.5,0.1,1.5,0.3,2,1c0.7,1,0.7,3.1,0.7,3.1s0.4,5.9-0.9,6.7c-0.9,0.5-2.2-0.5-4.9-5.2\n                                c-1.4-2.4-2.5-5.1-2.5-5.1s-0.2-0.5-0.6-0.8c-0.4-0.3-1.1-0.4-1.1-0.4l-6.5,0c0,0-1,0-1.3,0.5c-0.3,0.4,0,1.2,0,1.2s5.1,12,10.9,18\n                                C-643.6,553.2-637.6,552.8-637.6,552.8L-637.6,552.8z" />\n                <path d="M22.7,0C10.2,0,0,10.2,0,22.7s10.2,22.7,22.7,22.7c12.5,0,22.7-10.2,22.7-22.7S35.2,0,22.7,0z\n                                M33.5,16L22.7,32c-0.2,0.3-0.5-0.4-0.9,0.6h0c-0.4,0-0.7-0.3-0.9-0.6l-8.1-10.6c-0.3-0.4-0.3-1.1,0-1.5c0.4-0.4,1-0.5,1.4-0.3\n                                l7.5,6l10-11.2c0.4-0.4,1.1-0.4,1.5,0C33.8,14.8,33.8,15.5,33.5,16z" />\n            </svg>\n            \x3c!-- /ko --\x3e\n            \x3c!-- ko if: $parent.isAction($data, \'inviteFriend\') --\x3e\n            <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n                viewBox="0 0 40 53.9" xml:space="preserve">\n                <g id="XMLID_45_">\n                    <path d="M40,38.3l-4.5,6.4h-3.3c0-0.2,0-0.4,0-0.6c0-6.8-5.5-12.3-12.3-12.3c-6.8,0-12.3,5.5-12.3,12.3\n                                    c0,0.2,0,0.4,0,0.6H4.6L0,38.3c0-5.7,11.9-10.9,15.1-11.4c1-0.1,1-2.8,1-2.8s-2.9-2.8-3.5-6.7c-1.7,0-2.7-4.1-1.1-5.5\n                                    C11.4,10.3,9.3,0,20,0c10.7,0,8.6,10.3,8.5,11.8c1.7,1.4,0.7,5.5-1.1,5.5C26.9,21.2,24,24,24,24s0,0.7,0.1,1.4\n                                    c0.1,0.7,0.4,1.4,0.9,1.5C28.1,27.4,40,32.6,40,38.3z" />\n                    <g>\n                        <path d="M20,34.2c-5.4,0-9.8,4.4-9.8,9.8c0,0.2,0,0.4,0,0.6c0.3,5.1,4.6,9.2,9.8,9.2\n                                        c5.2,0,9.5-4.1,9.8-9.2c0-0.2,0-0.4,0-0.6C29.9,38.6,25.4,34.2,20,34.2z M24.4,45.2h-3.2v3.2c0,0.3-0.2,0.5-0.5,0.5h-1.3\n                                        c-0.3,0-0.5-0.3-0.5-0.5v-3.2h-3.2c-0.3,0-0.5-0.2-0.5-0.5c0,0,0,0,0,0v-1.3c0-0.3,0.3-0.5,0.5-0.5h3.2v-3.2\n                                        c0-0.3,0.2-0.6,0.5-0.6h1.3c0.3,0,0.5,0.3,0.5,0.6v3.2h3.2c0.3,0,0.6,0.2,0.6,0.5v1.3c0,0,0,0,0,0C24.9,45,24.7,45.2,24.4,45.2z"\n                        />\n                    </g>\n                </g>\n            </svg>\n            \x3c!-- /ko --\x3e\n            \x3c!-- ko if: $parent.isAction($data, \'purchase_never\') || $parent.isAction($data, \'like_never\') --\x3e\n            <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n                viewBox="0 0 38.9 44.9" xml:space="preserve">\n\n                <path d="M-518.7,673.2h2.7c0,0,0.8-0.1,1.2-0.5c0.4-0.4,0.4-1.2,0.4-1.2s-0.1-3.7,1.6-4.2\n                                c1.7-0.5,3.8,3.5,6.1,5.1c1.7,1.2,3,0.9,3,0.9l6.1-0.1c0,0,3.2-0.2,1.7-2.7c-0.1-0.2-0.9-1.9-4.5-5.3c-3.8-3.6-3.3-3,1.3-9.1\n                                c2.8-3.7,3.9-6,3.6-7c-0.3-0.9-2.4-0.7-2.4-0.7l-6.9,0c0,0-0.5-0.1-0.9,0.2c-0.4,0.2-0.6,0.7-0.6,0.7s-1.1,2.9-2.5,5.4\n                                c-3.1,5.2-4.3,5.5-4.8,5.2c-1.2-0.8-0.9-3-0.9-4.6c0-5,0.8-7.1-1.5-7.7c-0.7-0.2-1.3-0.3-3.2-0.3c-2.5,0-4.5,0-5.7,0.6\n                                c-0.8,0.4-1.4,1.2-1,1.3c0.5,0.1,1.5,0.3,2,1c0.7,1,0.7,3.1,0.7,3.1s0.4,5.9-0.9,6.7c-0.9,0.5-2.2-0.5-4.9-5.2\n                                c-1.4-2.4-2.5-5.1-2.5-5.1s-0.2-0.5-0.6-0.8c-0.4-0.3-1.1-0.4-1.1-0.4l-6.5,0c0,0-1,0-1.3,0.5c-0.3,0.4,0,1.2,0,1.2s5.1,12,10.9,18\n                                C-524.8,673.6-518.7,673.2-518.7,673.2L-518.7,673.2z" />\n                <path d="M141.5,120.4c-12.5,0-22.7,10.2-22.7,22.7s10.2,22.7,22.7,22.7c12.5,0,22.7-10.2,22.7-22.7\n                                S154,120.4,141.5,120.4z M152.3,136.3l-10.8,16c-0.2,0.3-0.5-0.4-0.9,0.6h0c-0.4,0-0.7-0.3-0.9-0.6l-8.1-10.6\n                                c-0.3-0.4-0.3-1.1,0-1.5c0.4-0.4,1-0.5,1.4-0.3l7.5,6l10-11.2c0.4-0.4,1.1-0.4,1.5,0C152.6,135.2,152.6,135.8,152.3,136.3z"\n                />\n                <g id="XMLID_45_">\n                    <path d="M-44.6,145.8l-4.5,6.4h-3.3c0-0.2,0-0.4,0-0.6c0-6.8-5.5-12.3-12.3-12.3\n                                    c-6.8,0-12.3,5.5-12.3,12.3c0,0.2,0,0.4,0,0.6h-3.2l-4.6-6.4c0-5.7,11.9-10.9,15.1-11.4c1-0.1,1-2.8,1-2.8s-2.9-2.8-3.5-6.7\n                                    c-1.7,0-2.7-4.1-1.1-5.5c-0.1-1.5-2.2-11.8,8.5-11.8c10.7,0,8.6,10.3,8.5,11.8c1.7,1.4,0.7,5.5-1.1,5.5c-0.6,3.8-3.5,6.7-3.5,6.7\n                                    s0,0.7,0.1,1.4c0.1,0.7,0.4,1.4,0.9,1.5C-56.5,135-44.6,140.1-44.6,145.8z" />\n                    <g id="XMLID_46_">\n                        <path d="M-64.7,141.8c-5.4,0-9.8,4.4-9.8,9.8c0,0.2,0,0.4,0,0.6c0.3,5.1,4.6,9.2,9.8,9.2\n                                        c5.2,0,9.5-4.1,9.8-9.2c0-0.2,0-0.4,0-0.6C-54.8,146.2-59.2,141.8-64.7,141.8z M-60.3,152.8h-3.2v3.2c0,0.3-0.2,0.5-0.5,0.5h-1.3\n                                        c-0.3,0-0.5-0.3-0.5-0.5v-3.2H-69c-0.3,0-0.5-0.2-0.5-0.5c0,0,0,0,0,0V151c0-0.3,0.3-0.5,0.5-0.5h3.2v-3.2c0-0.3,0.2-0.6,0.5-0.6\n                                        h1.3c0.3,0,0.5,0.3,0.5,0.6v3.2h3.2c0.3,0,0.6,0.2,0.6,0.5v1.3c0,0,0,0,0,0C-59.7,152.6-60,152.8-60.3,152.8z"\n                        />\n                    </g>\n                </g>\n                <path d="M32.5,0H6.4C2.9,0,0,2.9,0,6.4v25.8c0,3.5,2.9,6.4,6.4,6.4h26.1c0.1,0,0.1,0,0.2,0l6.3,6.3V32.3\n                                v-7.1V6.4C38.9,2.9,36,0,32.5,0z" />\n            </svg>\n            \x3c!-- /ko --\x3e\n        </div>\n        <div class="bns_qust_item_right">\n            <span class="bns_qust_item_right_name" data-bind="visible: $parent.isAction($data, \'partner_page\')">Рассказать о нас в ВК</span>\n            <span class="bns_qust_item_right_name" data-bind="visible: $parent.isAction($data, \'fillProfile\')">Заполнить профиль</span>\n            <span class="bns_qust_item_right_name" data-bind="visible: $parent.isAction($data, \'inviteFriend\')">Пригласить своего друга</span>\n            <span class="bns_qust_item_right_name" data-bind="visible: $parent.isAction($data, \'purchase\')">Рассказать о своей покупке</span>\n            <span class="bns_qust_item_right_name" data-bind="visible: $parent.isAction($data, \'like\')">Вступить в группу</span>\n\n            <span class="bns_qust_item_right_bal">\n                <span class="bns_qust_item_right_bal_num" data-bind="text: points"></span>\n            <span class="bns_qust_item_right_bal_text">баллов</span>\n            </span>\n            <a href="#" class="bns_qust_item_right_btn">Выполнить</a>\n        </div>\n    </div>\n    \x3c!-- /ko --\x3e\n'}};
},{"underscore":34}],47:[function(require,module,exports){
var _=require("underscore");module.exports={koStatus:function(n){var t="";Array.prototype.join;return t+='\n    <div class="bns_info_mount" data-bind="foreach: statuses">\n        <div class="bns_info_mount_item" data-bind="css: { act: $parent.isActive($data, $index) }">\n            <img data-bind="attr: { src: thumbs.url_250x250 }" width="70" height="73" alt="">\n            <div class="bns_info_mount_item_info">\n                <span class="bns_info_mount_item_name" data-bind="text: name"></span>\n                <span class="bns_info_mount_item_text" data-bind="text: descr"></span>\n                <a href="#" class="bns_info_mount_item_linck" data-bind="click: $parent.popupVm.openStatus.bind($data, $data, $index, false)">Подробнее</a>\n            </div>\n        </div>\n    </div>\n    <div data-bind="component: {\n    name: \'ko-popup\', \n    params: { data: popupVm }\n    }">\n        <div class="bns_over_info_left">\n            <img class="status_popup_msg" data-bind="attr: { src: status() && status().thumbs.url_250x250 }" width="173" height="177" alt="">\n        </div>\n        <div class="bns_over_info_right" data-bind="visible: renew() == false, html: messages[index()]"></div>\n        <div class="bns_over_info_right" data-bind="visible: renew() == true, html: renew_messages[index()]"></div>        \n    </div>\n'}};
},{"underscore":34}],48:[function(require,module,exports){
var _=require("underscore");module.exports={koTabs:function(a){var n="";Array.prototype.join;return n+='\n    <div class="bns_tab_top">\n        <div class="bns_tab_top_menu" data-bind="foreach: tabs">\n            <a href="javascript:void(0)" data-bind="click: $parent.setTab.bind($data, $index) ,text: name, css: { act: $parent.currentTabIndex() == $index() }"></a>\n        </div>\n        <span class="bns_tab_top_description" data-bind="text: tabs()[currentTabIndex()].description"></span>\n    </div>\n    <span data-bind="template: { nodes: $componentTemplateNodes, data: $data }"></span>       \n'}};
},{"underscore":34}],49:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var a=0;a<t.length;a++){var i=t[a];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,a,i){return a&&e(t.prototype,a),i&&e(t,i),t}}();require("./less/main.less");var _main=require("./templates/main.html"),_main2=_interopRequireDefault(_main),_components=require("./templates/components.html"),_components2=_interopRequireDefault(_components),_sailplayHub=require("sailplay-hub"),_sailplayHub2=_interopRequireDefault(_sailplayHub),_profileTemplate=require("./components/templates/profile.template.html"),_profileTemplate2=_interopRequireDefault(_profileTemplate),_historyTemplate=require("./components/templates/history.template.html"),_historyTemplate2=_interopRequireDefault(_historyTemplate),_tabsTemplate=require("./components/templates/tabs.template.html"),_tabsTemplate2=_interopRequireDefault(_tabsTemplate),_questTemplate=require("./components/templates/quest.template.html"),_questTemplate2=_interopRequireDefault(_questTemplate),_giftsTemplate=require("./components/templates/gifts.template.html"),_giftsTemplate2=_interopRequireDefault(_giftsTemplate),_achivTemplate=require("./components/templates/achiv.template.html"),_achivTemplate2=_interopRequireDefault(_achivTemplate),_statusTemplate=require("./components/templates/status.template.html"),_statusTemplate2=_interopRequireDefault(_statusTemplate),_profile=require("./components/profile.js"),_profile2=_interopRequireDefault(_profile),_history=require("./components/history.js"),_history2=_interopRequireDefault(_history),_tabs=require("./components/tabs.js"),_tabs2=_interopRequireDefault(_tabs),_quest=require("./components/quest.js"),_quest2=_interopRequireDefault(_quest),_gifts=require("./components/gifts.js"),_gifts2=_interopRequireDefault(_gifts),_achiv=require("./components/achiv.js"),_achiv2=_interopRequireDefault(_achiv),_status=require("./components/status.js"),_status2=_interopRequireDefault(_status),_knockout=require("knockout"),_knockout2=_interopRequireDefault(_knockout);require("knockout-mapping"),require("knockout.validation"),require("array.prototype.find").shim(),"forEach"in Array.prototype||(Array.prototype.forEach=function(e,t){for(var a=0,i=this.length;a<i;a++)a in this&&e.call(t,this[a],a,this)}),"forEach"in NodeList.prototype||(NodeList.prototype.forEach=function(e,t){for(var a=0,i=this.length;a<i;a++)a in this&&e.call(t,this[a],a,this)});var messager=function(){var e=new _knockout2.default.subscribable;return{subscribe:function(t,a){e.subscribe(a,null,t)},publish:function(t,a){e.notifySubscribers(t,a)}}}();window.formatLargeNumber=function(e){return"function"==typeof e?e().toString().replace(/\B(?=(\d{3})+(?!\d))/g," "):e.toString().replace(/\B(?=(\d{3})+(?!\d))/g," ")};var register=_knockout2.default.components.register;register("ko-slider",{viewModel:function(e){this.slides=e.slides,this.currentSlide=_knockout2.default.observable(0)},template:_components2.default.koSlider()}),register("ko-popup",{viewModel:function(e){var t=this;this.data=e.data,this.closeOnOverlay=function(e,a){return/bns_overlay/.test(a.target.className)&&(t.data.opened(!1),document.body.className=document.body.className.replace(/ no_scrol/g,"")),!0},this.closePopup=function(){t.data.opened(!1),document.body.className=document.body.className.replace(/ no_scrol/g,"")}},template:_components2.default.koPopup()}),register("ko-tabs",{viewModel:(0,_tabs2.default)(messager),template:_tabsTemplate2.default.koTabs()}),register("ko-quest",{viewModel:(0,_quest2.default)(messager),template:_questTemplate2.default.koQuest()}),register("ko-profile",{viewModel:(0,_profile2.default)(messager),template:_profileTemplate2.default.koProfile()}),register("ko-history",{viewModel:(0,_history2.default)(messager),template:_historyTemplate2.default.koHistory()}),register("ko-gifts",{viewModel:(0,_gifts2.default)(messager),template:_giftsTemplate2.default.koGifts()}),register("ko-achiv",{viewModel:(0,_achiv2.default)(messager),template:_achivTemplate2.default.koAchiv()}),register("ko-status",{viewModel:(0,_status2.default)(messager),template:_statusTemplate2.default.koStatus()}),_knockout2.default.bindingHandlers.cssVisible={update:function(e,t){var a=t();_knockout2.default.unwrap(a)?e.className+=" show":e.className=e.className.replace(" show","")}};var SailplaySportDepot=function(){function e(t,a){var i=this;_classCallCheck(this,e),this.vm={landing:_knockout2.default.observable(!1),toggle_landing:function(){i.vm.landing(!i.vm.landing())}},this.auth_hash=a.auth_hash,this.options=a.options,this.vm.slider_items=a.slider_items,t.innerHTML=_main2.default.index(),_knockout2.default.applyBindings(this.vm,t),this.init()}return _createClass(e,[{key:"init",value:function(){var e=this;_sailplayHub2.default.send("init",this.options),_sailplayHub2.default.on("init.success",function(t){e.config=t,e.config.auth_hash=e.auth_hash,messager.publish(t,"init")})}}]),e}();!function(e){e.SailPlay=function(e,t){new SailplaySportDepot(e,t)}}(window);

},{"./components/achiv.js":35,"./components/gifts.js":36,"./components/history.js":37,"./components/profile.js":38,"./components/quest.js":39,"./components/status.js":40,"./components/tabs.js":41,"./components/templates/achiv.template.html":42,"./components/templates/gifts.template.html":43,"./components/templates/history.template.html":44,"./components/templates/profile.template.html":45,"./components/templates/quest.template.html":46,"./components/templates/status.template.html":47,"./components/templates/tabs.template.html":48,"./less/main.less":50,"./templates/components.html":51,"./templates/main.html":52,"array.prototype.find":2,"knockout":28,"knockout-mapping":26,"knockout.validation":27,"sailplay-hub":33}],50:[function(require,module,exports){
var css="@import url('https://fonts.googleapis.com/css?family=Exo+2:300,400,700,700i&subset=cyrillic');\nbody {\n  margin: 0;\n  font-family: 'Exo 2', sans-serif;\n}\n.disabled {\n  pointer-events: 'none';\n  opacity: .5;\n}\n.bns_inner_block {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0px 25px;\n  max-width: 1000px;\n  margin: auto;\n}\n.bns_tab_main {\n  float: left;\n  width: 100%;\n  padding-bottom: 80px;\n}\n.bns_tab_top {\n  float: left;\n  width: 100%;\n  border-bottom: 1px solid #dbdad9;\n}\n.bns_tab_top .bns_tab_top_menu {\n  float: left;\n}\n.bns_tab_top .bns_tab_top_menu a {\n  font-size: 16px;\n  color: #000000;\n  text-decoration: none;\n  line-height: 46px;\n  padding: 0px 15px;\n  display: inline-block;\n  position: relative;\n}\n.bns_tab_top .bns_tab_top_menu a.act {\n  color: #00a6e1;\n  font-weight: bold;\n}\n.bns_tab_top .bns_tab_top_menu a.act:after {\n  width: 100%;\n  height: 3px;\n  display: block;\n  position: absolute;\n  left: 0;\n  bottom: -2px;\n  content: '';\n  background-color: #00a6e1;\n}\n.bns_tab_top .bns_tab_top_description {\n  float: right;\n  line-height: 20px;\n  font-size: 16px;\n  color: #999897;\n  font-weight: 300;\n  padding: 13px 0;\n}\n.bns_tab {\n  float: left;\n  width: 100%;\n}\n.bns_text_block {\n  float: left;\n  width: 100%;\n  margin-top: 30px;\n}\n.bns_text_block h2 {\n  color: #00a6e1;\n  font-weight: bold;\n  float: left;\n  width: 100%;\n  margin-bottom: 15px;\n  margin-top: 0;\n}\n.bns_text_block p {\n  margin: 0px;\n  float: left;\n  width: 100%;\n  color: #000000;\n  font-size: 16px;\n  font-weight: 300;\n  line-height: 24px;\n}\n.bns_text_block ul {\n  list-style: none;\n  float: left;\n  width: 100%;\n  padding-left: 0;\n  margin-bottom: 0px;\n  margin-top: 0px;\n}\n.bns_text_block ul li {\n  margin-left: 0px;\n  padding-left: 18px;\n  position: relative;\n  font-size: 16px;\n  font-weight: 300;\n  padding-top: 4px;\n  padding-bottom: 4px;\n}\n.bns_text_block ul li:before {\n  display: block;\n  width: 10px;\n  height: 10px;\n  border-radius: 10px;\n  background-color: #d4d4d4;\n  content: '';\n  position: absolute;\n  left: 0;\n  top: 9px;\n}\n.bns_text_block hr {\n  color: #d4d4d4;\n  /*для IE */\n  background-color: #d4d4d4;\n  /*для Firefox, Opera, Safari*/\n  border: 0px none;\n  height: 1px;\n  /* высота 1px IE, Firefox, Opera, Safari */\n  clear: both;\n  /* для очистки, если тег идет после float елемента */\n  margin-top: 15px;\n  float: left;\n  width: 100%;\n}\n.bns_text_block .bns_cake_block {\n  float: left;\n  width: 100%;\n  margin-top: 40px;\n  margin-bottom: 50px;\n}\n.bns_text_block .bns_cake_block .bns_cake_item {\n  float: left;\n  width: 33.3%;\n  box-sizing: border-box;\n  border-right: 1px solid #d4d4d4;\n  text-align: center;\n}\n.bns_text_block .bns_cake_block .bns_cake_item:nth-child(3) {\n  border-right: 0;\n}\n.bns_text_block .bns_cake_block .bns_cake_item .bns_cake_item_img {\n  float: left;\n  width: 100%;\n  position: relative;\n  height: 180px;\n}\n.bns_text_block .bns_cake_block .bns_cake_item .bns_cake_item_img:before {\n  height: 100%;\n  content: '';\n  display: inline-block;\n  vertical-align: bottom;\n}\n.bns_text_block .bns_cake_block .bns_cake_item .bns_cake_item_img img {\n  vertical-align: bottom;\n}\n.bns_text_block .bns_cake_block .bns_cake_item .bns_cake_bal {\n  float: left;\n  width: 100%;\n  text-align: center;\n  font-size: 16px;\n  color: #00a6e1;\n  font-weight: bold;\n  margin-top: 20px;\n  margin-bottom: 5px;\n}\n.bns_text_block .bns_cake_block .bns_cake_item .bns_cake_name {\n  float: left;\n  width: 100%;\n  text-align: center;\n  color: #000000;\n  font-size: 16px;\n  font-weight: 300;\n  margin-bottom: 5px;\n}\n#sailplayLoyaltyPage {\n  overflow: hidden;\n  position: relative;\n}\n.left {\n  float: left !important;\n  width: 45% !important;\n}\n.status_popup_msg {\n  margin-top: -7px;\n  margin-left: -30px;\n}\n.right {\n  width: 45% !important;\n  float: right !important;\n}\n.bns_gift_popup_header {\n  text-align: center;\n}\n.bns_gift_popup {\n  text-align: center;\n}\n.bns_gift_popup_btn {\n  float: left;\n  width: 100%;\n  line-height: 42px;\n  max-width: 296px;\n  margin-top: 10px;\n  background: #007bc6;\n  background: -moz-linear-gradient(left, #007bc6 0%, #00a3d7 100%);\n  background: -webkit-linear-gradient(left, #007bc6 0%, #00a3d7 100%);\n  background: linear-gradient(to right, #007bc6 0%, #00a3d7 100%);\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#007bc6', endColorstr='#00a3d7', GradientType=1);\n  text-decoration: none;\n  color: #fff;\n  font-weight: bold;\n  font-size: 16px;\n  border-radius: 6px;\n  text-align: center;\n}\n.bns_gift_popup_points {\n  color: #00a6e1;\n}\n.select-style {\n  margin: 0;\n  overflow: hidden;\n  padding: 0px 8px;\n  box-sizing: border-box;\n  border-radius: 6px;\n  border: 1px solid #c2c1c0;\n  height: 43px;\n  color: #000;\n  float: left;\n  width: 110px;\n  margin-right: 10px;\n  font-size: 16px;\n  font-weight: 300;\n  max-width: 296px;\n  position: relative;\n}\n.select-style.selected:before {\n  display: none;\n}\n.select-style:before {\n  top: 10px;\n  pointer-events: none;\n  content: 'Месяц';\n  display: block;\n  position: absolute;\n  color: darkgray;\n}\n.select-style select {\n  padding: 0 8px;\n  line-height: 42px;\n  width: 130%;\n  font-size: 16px;\n  border: none;\n  box-shadow: none;\n  background-color: transparent;\n  background-image: none;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n}\n.select-style select:focus {\n  outline: none;\n}\n.bns_overlay {\n  position: fixed;\n  width: 100%;\n  height: 100%;\n  background-color: rgba(0, 166, 225, 0.87);\n  text-align: center;\n  left: -9999px;\n  top: 0;\n  opacity: 0;\n  z-index: 11111;\n  overflow-y: auto;\n  transition: opacity 0.2s ease-out;\n}\n.bns_overlay.show {\n  left: 0;\n  opacity: 1;\n  transition: left 0s linear, opacity 0.2s ease-out;\n  position: absolute;\n}\n.bns_overlay.show .bns_overlay_iner {\n  transform: translateY(0);\n  opacity: 1;\n}\n.bns_overlay:before {\n  content: '';\n  display: inline-block;\n  height: 100%;\n  vertical-align: middle;\n}\n.bns_overlay.js_over_hist .bns_overlay_iner {\n  width: 488px;\n}\n.bns_overlay.js_over_reg .bns_overlay_iner {\n  width: 356px;\n}\n.bns_overlay.js_over_reg.js_over_reg_big .bns_overlay_iner {\n  width: 650px;\n}\n.bns_overlay.js_over_info .bns_overlay_iner {\n  width: 660px;\n}\n.bns_overlay .bns_overlay_iner {\n  width: 464px;\n  background-color: #ffffff;\n  padding: 35px 30px;\n  box-sizing: border-box;\n  display: inline-block;\n  vertical-align: middle;\n  text-align: left;\n  position: relative;\n  border-radius: 10px;\n  transform: translateY(-50px);\n  opacity: 0;\n  transition: transform 0.5s ease-out, opacity 0.5s ease-out;\n}\n.bns_overlay .bns_overlay_iner h3 {\n  font-size: 20px;\n  float: left;\n  width: 100%;\n  margin: 0;\n  color: #000;\n  font-weight: bold;\n}\n.bns_overlay .bns_overlay_iner h4 {\n  font-size: 12px;\n  float: left;\n  width: 100%;\n  margin: 0;\n  margin-top: 8px;\n  color: #484848;\n}\n.bns_overlay .bns_overlay_iner .bns_over_info_left {\n  float: left;\n  width: 260px;\n  text-align: center;\n}\n.bns_overlay .bns_overlay_iner .bns_over_info_right {\n  float: left;\n  width: 340px;\n}\n.bns_overlay .bns_overlay_iner .bns_over_info_right h2 {\n  float: left;\n  width: 100%;\n  font-size: 20px;\n  color: #000;\n  font-weight: bold;\n  margin-top: 0;\n}\n.bns_overlay .bns_overlay_iner .bns_over_info_right p {\n  font-size: 16px;\n  color: #000000;\n  float: left;\n  width: 100%;\n  margin: 0px;\n}\n.bns_overlay .bns_overlay_iner .bns_over_info_right ul {\n  list-style: none;\n  float: left;\n  width: 100%;\n  padding-left: 0;\n  margin-bottom: 0;\n}\n.bns_overlay .bns_overlay_iner .bns_over_info_right ul li {\n  margin-left: 0px;\n  padding-left: 10px;\n  position: relative;\n}\n.bns_overlay .bns_overlay_iner .bns_over_info_right ul li:before {\n  display: block;\n  width: 4px;\n  height: 4px;\n  border-radius: 4px;\n  background-color: #000;\n  content: '';\n  position: absolute;\n  left: 0;\n  top: 9px;\n}\n.bns_overlay .bns_overlay_iner .bns_close {\n  position: absolute;\n  right: 10px;\n  top: 12px;\n  background-image: url(\"src/img/close.png\");\n  display: block;\n  width: 11px;\n  height: 12px;\n}\n.bns_overlay .bns_hist_table {\n  float: left;\n  width: 100%;\n  margin-top: 5px;\n}\n.bns_overlay .bns_hist_table td {\n  vertical-align: text-top;\n  padding: 10px 11px;\n  border-bottom: 1px solid #c9c9c9;\n}\n.bns_overlay .bns_hist_table td:nth-child(1) {\n  color: #bdbdbd;\n  font-size: 16px;\n  line-height: 19px;\n  padding-right: 0px;\n  padding-left: 0px;\n  white-space: nowrap;\n  font-weight: 300;\n}\n.bns_overlay .bns_hist_table td:nth-child(2) {\n  color: #000000;\n  font-size: 16px;\n  line-height: 19px;\n  position: relative;\n  padding-left: 0px;\n  width: 420px;\n  font-weight: 300;\n}\n.bns_overlay .bns_hist_table span.blue {\n  display: block;\n  position: relative;\n  z-index: 1;\n  font-size: 13px;\n  color: #00a6e1;\n}\n.bns_overlay .bns_hist_table td:nth-child(2) span:first-child {\n  color: #000000;\n}\n.bns_overlay .bns_hist_table td:nth-child(2) span b {\n  background-color: #fff;\n  padding-right: 15px;\n  padding-left: 11px;\n  font-weight: 300;\n  display: block;\n}\n.bns_overlay .bns_hist_table td:nth-child(3) {\n  color: #00a6e1;\n  font-size: 16px;\n  text-align: right;\n  line-height: 19px;\n  font-weight: 300;\n}\n.bns_overlay .bns_hist_table td:nth-child(3) span {\n  display: block;\n  white-space: nowrap;\n  font-size: 16px;\n}\n.bns_overlay .bns_hist_pager {\n  float: left;\n  font-size: 16px;\n  margin-top: 22px;\n  font-weight: 300;\n}\n.bns_overlay .bns_hist_pager a {\n  text-decoration: none;\n  color: #484848;\n  margin-right: 4px;\n  line-height: 24px;\n  display: inline-block;\n  padding: 0px 7px;\n  position: relative;\n}\n.bns_overlay .bns_hist_pager a:before {\n  position: absolute;\n  left: 0;\n  top: 0;\n  border-radius: 3px;\n  width: 100%;\n  height: 100%;\n  border: 1px solid transparent;\n  content: '';\n  display: block;\n  -moz-transform: skewX(-8deg);\n  -webkit-transform: skewX(-8deg);\n  -o-transform: skewX(-8deg);\n  -ms-transform: skewX(-8deg);\n  transform: skewX(-8deg);\n}\n.bns_overlay .bns_hist_pager a.act:before {\n  border: 1px solid #dbdad9;\n}\n.bns_overlay .bns_hist_next {\n  float: right;\n  line-height: 26px;\n  color: #bdbdbd;\n  font-weight: 300;\n  text-decoration: none;\n  margin-top: 22px;\n}\n.bns_overlay .bns_reg_gift {\n  float: left;\n  width: 100%;\n  box-sizing: border-box;\n  padding-left: 51px;\n  min-height: 38px;\n  background-image: url(\"src/img/reg_gift.png\");\n  background-repeat: no-repeat;\n  background-position: left center;\n  color: #000000;\n  font-size: 16px;\n  font-weight: 300;\n  margin-top: 25px;\n  margin-bottom: 22px;\n}\n.bns_overlay .bns_reg_gift.fin {\n  background-image: url(\"src/img/reg_gift_fin.png\");\n  line-height: 38px;\n}\n.bns_overlay .bns_text_block {\n  font-size: 16px;\n  color: #000;\n  font-weight: 300;\n  float: left;\n  width: 100%;\n  line-height: 20px;\n  margin-bottom: 30px;\n}\n.bns_overlay .bns_reg_step {\n  float: left;\n  width: 92%;\n  margin-left: 4%;\n  height: 26px;\n  position: relative;\n  margin-bottom: 25px;\n}\n.bns_overlay .bns_reg_step:after {\n  width: 100%;\n  top: 14px;\n  left: 0;\n  height: 1px;\n  background-color: #c0d5db;\n  display: block;\n  content: '';\n  position: absolute;\n}\n.bns_overlay .bns_reg_step .bns_reg_step_item {\n  width: 20px;\n  height: 20px;\n  border-radius: 20px;\n  background-color: #c0d5db;\n  position: absolute;\n  top: 0px;\n  margin-left: -14px;\n  border: 4px solid #fff;\n  z-index: 1;\n}\n.bns_overlay .bns_reg_step .bns_reg_step_item.act {\n  background-color: #00a6e1;\n}\n.bns_overlay .bns_reg_step .bns_reg_step_item:nth-child(1) {\n  left: 0;\n}\n.bns_overlay .bns_reg_step .bns_reg_step_item:nth-child(2) {\n  left: 33.3%;\n}\n.bns_overlay .bns_reg_step .bns_reg_step_item:nth-child(3) {\n  left: 66.6%;\n}\n.bns_overlay .bns_reg_step .bns_reg_step_item:nth-child(4) {\n  left: 100%;\n}\n.bns_overlay .bns_reg_step_block {\n  float: left;\n  width: 100%;\n  display: none;\n}\n.bns_overlay .bns_reg_step_block.act {\n  display: block;\n}\n.bns_overlay .bns_input_block {\n  float: left;\n  width: 100%;\n  margin-bottom: 10px;\n}\n.bns_overlay .bns_input_block.bns_input_block_cent {\n  text-align: center;\n}\n.bns_overlay .bns_input_block.bns_input_block_cent .bns_btn {\n  display: inline-block;\n  float: none;\n}\n.bns_overlay .bns_input_block label {\n  color: #000000;\n  font-size: 16px;\n  font-weight: 300;\n  float: left;\n  width: 100%;\n  margin-bottom: 3px;\n}\n.bns_overlay .bns_input_block .select-style.error {\n  border-color: red;\n}\n.bns_overlay .bns_input_block label.error {\n  color: red;\n}\n.bns_overlay .bns_input_block input[type=\"text\"],\n.bns_overlay .bns_input_block input[type=\"number\"] {\n  float: left;\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0px 12px;\n  border-radius: 6px;\n  border: 1px solid #c2c1c0;\n  height: 43px;\n  color: #000;\n  font-size: 16px;\n  font-weight: 300;\n  max-width: 296px;\n}\n.bns_overlay .bns_input_block input[type=\"text\"].error,\n.bns_overlay .bns_input_block input[type=\"number\"].error {\n  border-color: red;\n}\n.bns_overlay .bns_input_block input[type=\"text\"].bns_input_block_d,\n.bns_overlay .bns_input_block input[type=\"number\"].bns_input_block_d {\n  width: 83px;\n  margin-right: 10px;\n}\n.bns_overlay .bns_input_block input[type=\"text\"].bns_input_block_m,\n.bns_overlay .bns_input_block input[type=\"number\"].bns_input_block_m {\n  width: 110px;\n  margin-right: 10px;\n}\n.bns_overlay .bns_input_block input[type=\"text\"].bns_input_block_y,\n.bns_overlay .bns_input_block input[type=\"number\"].bns_input_block_y {\n  width: 83px;\n}\n.bns_overlay .bns_input_block .bns_checkbox {\n  float: left;\n  width: 180px;\n  margin-top: 8px;\n  margin-bottom: 8px;\n}\n.bns_overlay .bns_input_block .bns_checkbox.bns_checkbox_big {\n  width: 275px;\n}\n.bns_overlay .bns_input_block .bns_checkbox input {\n  display: none;\n}\n.bns_overlay .bns_input_block .bns_checkbox input:checked + label:before {\n  background-image: url(\"src/img/gal.png\");\n  background-repeat: no-repeat;\n  background-position: center center;\n  background-color: #00a6e1;\n  border: 1px solid #00a6e1;\n}\n.bns_overlay .bns_input_block .bns_checkbox label {\n  box-sizing: border-box;\n  padding-left: 34px;\n  width: 100%;\n  color: #000000;\n  font-size: 16px;\n  font-weight: 300;\n  line-height: 22px;\n  position: relative;\n  margin-bottom: 8px;\n}\n.bns_overlay .bns_input_block .bns_checkbox label:before {\n  content: '';\n  display: block;\n  width: 20px;\n  height: 20px;\n  border-radius: 4px;\n  border: 1px solid #c2c1c0;\n  position: absolute;\n  left: 0;\n  top: 50%;\n  margin-top: -11px;\n}\n.bns_overlay .bns_input_block .bns_btn {\n  float: left;\n  width: 100%;\n  line-height: 42px;\n  max-width: 296px;\n  margin-top: 10px;\n  /* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#007bc6+0,00a3d7+100 */\n  background: #007bc6;\n  /* Old browsers */\n  background: -moz-linear-gradient(left, #007bc6 0%, #00a3d7 100%);\n  /* FF3.6-15 */\n  background: -webkit-linear-gradient(left, #007bc6 0%, #00a3d7 100%);\n  /* Chrome10-25,Safari5.1-6 */\n  background: linear-gradient(to right, #007bc6 0%, #00a3d7 100%);\n  /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#007bc6', endColorstr='#00a3d7', GradientType=1);\n  /* IE6-9 */\n  text-decoration: none;\n  color: #fff;\n  font-weight: bold;\n  font-size: 16px;\n  border-radius: 6px;\n  text-align: center;\n}\n.bns_top {\n  float: left;\n  width: 100%;\n  cursor: pointer;\n  border-radius: 8px;\n  background-image: url(\"src/img/top_bg.png\");\n  -webkit-background-size: cover;\n  background-size: cover;\n  margin-top: 10px;\n}\n.bns_top .bns_top_head {\n  float: left;\n  width: 190px;\n  color: #ffffff;\n  font-size: 20px;\n  font-weight: bold;\n  line-height: 24px;\n  margin-left: 30px;\n  margin-top: 28px;\n  margin-bottom: 30px;\n}\n.bns_top .bns_top_item {\n  float: left;\n  margin-top: 20px;\n  margin-right: 40px;\n}\n.bns_top .bns_top_item:last-child {\n  margin-right: 0;\n}\n.bns_top .bns_top_item img {\n  float: left;\n  margin-right: 10px;\n}\n.bns_top .bns_top_item span {\n  margin-top: 8px;\n  color: #ffffff;\n  float: left;\n  font-size: 14px;\n}\n.bns_info {\n  float: left;\n  width: 100%;\n  margin-top: 50px;\n}\n.bns_info .bns_info_left {\n  float: left;\n  width: 590px;\n}\n.bns_info .bns_info_left .bns_info_text {\n  float: left;\n  width: 49%;\n  position: static;\n}\n.bns_info .bns_info_left .bns_info_text + .bns_info_delimeter_container {\n  float: left;\n}\n.bns_info .bns_info_left .bns_info_text + .bns_info_delimeter_container .bns_info_delimeter {\n  position: absolute;\n  content: '';\n  display: block;\n  width: 1px;\n  background-color: #c9c9c9;\n  height: 144px;\n  -moz-transform: skewX(-7deg);\n  -webkit-transform: skewX(-7deg);\n  -o-transform: skewX(-7deg);\n  -ms-transform: skewX(-7deg);\n  transform: skewX(-7deg);\n}\n.bns_info .bns_info_left .bns_info_text .bns_info_name {\n  float: left;\n  width: 100%;\n  font-size: 20px;\n  color: #000000;\n  font-weight: bold;\n  margin-top: -12px;\n}\n.bns_info .bns_info_left .bns_info_text .bns_info_bon_bal {\n  float: left;\n  width: 100%;\n}\n.bns_info .bns_info_left .bns_info_text .bns_info_bon_bal:before {\n  height: 100%;\n  display: inline-block;\n  vertical-align: middle;\n}\n.bns_info .bns_info_left .bns_info_text .bns_info_bon_bal .bns_info_bal_num {\n  font-size: 70px;\n  color: #00a6e1;\n  font-weight: bold;\n  font-style: italic;\n  vertical-align: middle;\n  display: inline-block;\n  margin-right: 15px;\n}\n.bns_info .bns_info_left .bns_info_text .bns_info_bon_bal .bns_info_bal_text {\n  font-size: 15px;\n  color: #00a6e1;\n  vertical-align: middle;\n  display: inline-block;\n}\n.bns_info .bns_info_left .bns_info_text .bns_edit_profile {\n  float: left;\n  width: 100%;\n  color: #00a6e1;\n  font-size: 16px;\n  font-weight: 300;\n  margin-top: 6px;\n}\n.bns_info .bns_info_left .bns_info_hist {\n  float: right;\n  width: 46%;\n  margin-top: 5px;\n}\n.bns_info .bns_info_left .bns_info_hist_container {\n  height: 93px;\n  overflow: hidden;\n  margin-top: -12px;\n  border-bottom: 1px solid #ccc;\n}\n.bns_info .bns_info_left .bns_info_hist .bns_info_hist_item {\n  float: left;\n  width: 100%;\n  margin-bottom: 12px;\n}\n.bns_info .bns_info_left .bns_info_hist .bns_info_hist_item .bns_date {\n  float: left;\n  width: 83px;\n  font-size: 16px;\n  color: #bdbdbd;\n  font-weight: 300;\n}\n.bns_info .bns_info_left .bns_info_hist .bns_info_hist_item .bns_name {\n  float: left;\n  width: 120px;\n  margin-right: 10px;\n  font-size: 16px;\n  color: #000;\n  font-weight: 300;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.bns_info .bns_info_left .bns_info_hist .bns_info_hist_item .bns_point {\n  float: right;\n  font-size: 16px;\n  color: #00a6e1;\n  font-weight: 300;\n}\n.bns_info .bns_info_left .bns_info_hist .bns_open_hist {\n  float: left;\n  font-size: 16px;\n  color: #00a6e1;\n  font-weight: 300;\n  margin-top: 10px;\n}\n.bns_info .bns_info_left .bns_info_slide {\n  float: left;\n  width: 100%;\n  position: relative;\n  max-width: 560px;\n  margin-top: 50px;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_info_slide_item {\n  width: 100%;\n  height: 335px;\n  -webkit-background-size: cover;\n  background-size: cover;\n  border-radius: 8px;\n  border: 1px solid #c2c1c0;\n  top: 0;\n  left: -9999px;\n  position: absolute;\n  overflow: hidden;\n  z-index: 99;\n  transition: opacity .8s linear, left 0s linear .8s;\n  opacity: 0;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_info_slide_item.show {\n  opacity: 1;\n  position: relative;\n  transition: opacity .8s linear, left 0s linear;\n  left: 0;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_info_slide_item.show .bns_info_slide_text {\n  transform: translateY(0);\n  opacity: 1;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_info_slide_item.show .bns_info_slide_head {\n  transform: translateX(0);\n  opacity: 1;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_info_slide_item .bns_info_slide_head {\n  float: left;\n  max-width: 320px;\n  padding: 11px 30px;\n  transform: translateX(-400px);\n  opacity: 0;\n  transition: opacity 1s ease-out, transform 0.8s ease-out;\n  box-sizing: border-box;\n  position: relative;\n  font-size: 16px;\n  color: #ffffff;\n  font-weight: 300;\n  margin-top: 35px;\n  overflow: hidden;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_info_slide_item .bns_info_slide_head:before {\n  width: 100%;\n  height: 100%;\n  background-color: #00a6e1;\n  content: '';\n  display: block;\n  position: absolute;\n  left: -10px;\n  top: 0;\n  z-index: -1;\n  -moz-transform: skewX(-15deg);\n  -webkit-transform: skewX(-15deg);\n  -o-transform: skewX(-15deg);\n  -ms-transform: skewX(-15deg);\n  transform: skewX(-15deg);\n}\n.bns_info .bns_info_left .bns_info_slide .bns_info_slide_item .bns_info_slide_text {\n  float: left;\n  width: 100%;\n  box-sizing: border-box;\n  transform: translateY(-150px);\n  opacity: 0;\n  transition: opacity 0.8s ease-out, transform 0.8s ease-out;\n  font-size: 22px;\n  font-weight: bold;\n  color: #000000;\n  padding: 0px 30px;\n  margin-top: 28px;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_info_slide_item .bns_info_slide_linck {\n  float: left;\n  margin-left: 30px;\n  line-height: 44px;\n  padding: 0px 28px;\n  color: #000000;\n  font-size: 14px;\n  font-weight: 300;\n  display: inline-block;\n  text-decoration: none;\n  position: relative;\n  margin-top: 30px;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_info_slide_item .bns_info_slide_linck:before {\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n  border-radius: 4px;\n  -moz-transform: skewX(-15deg);\n  -webkit-transform: skewX(-15deg);\n  -o-transform: skewX(-15deg);\n  -ms-transform: skewX(-15deg);\n  transform: skewX(-15deg);\n  content: '';\n  display: block;\n  box-sizing: border-box;\n  border: 1px solid #c2c1c0;\n  background: white;\n  position: absolute;\n  z-index: -1;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_info_slide_item .bns_info_slide_linck:hover {\n  color: #fff;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_info_slide_item .bns_info_slide_linck:hover:before {\n  background-color: #00a6e1;\n  border: 1px solid #00a6e1;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_slide_pager {\n  position: absolute;\n  left: 30px;\n  bottom: 16px;\n  z-index: 10000;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_slide_pager span {\n  content: '';\n  width: 11px;\n  height: 11px;\n  display: inline-block;\n  margin-right: 6px;\n  background-color: #d1d0cf;\n  border-radius: 11px;\n  text-indent: -99999px;\n}\n.bns_info .bns_info_left .bns_info_slide .bns_slide_pager span.active {\n  background-color: #00a6e1;\n}\n.bns_info .bns_info_right {\n  float: right;\n  width: 360px;\n}\n.bns_info .bns_info_right .bns_info_mount {\n  width: 360px;\n  height: 540px;\n  background-image: url(\"src/img/mount_mask.png\");\n  background-color: #e5e5e5;\n  background-position: left top;\n  margin-top: -16px;\n  box-sizing: border-box;\n  padding-top: 22px;\n  position: relative;\n  z-index: 1;\n  overflow: hidden;\n}\n.bns_info .bns_info_right .bns_info_mount:before {\n  width: 100%;\n  height: 100%;\n  position: absolute;\n  left: 0;\n  top: 0px;\n  display: block;\n  background-image: url(\"src/img/mount_mask.png\");\n  background-position: left top;\n  content: '';\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item {\n  float: left;\n  width: 100%;\n  box-sizing: border-box;\n  padding-left: 127px;\n  height: 100px;\n  border-top: 1px solid transparent;\n  position: relative;\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item:before {\n  content: '';\n  height: 100%;\n  display: inline-block;\n  vertical-align: middle;\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item:nth-child(1) img {\n  margin-left: 10px;\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item.act:after {\n  width: 100%;\n  height: 164px;\n  position: absolute;\n  left: 0;\n  top: 50%;\n  margin-top: -87px;\n  display: block;\n  z-index: -1;\n  background-image: url(\"src/img/mount_act_bg.png\");\n  content: '';\n  -webkit-background-size: cover;\n  background-size: cover;\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item.act .bns_info_mount_item_name,\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item.act .bns_info_mount_item_text {\n  color: #00a6e1 !important;\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item.act img {\n  vertical-align: middle;\n  -webkit-filter: grayscale(0%);\n  -moz-filter: grayscale(0%);\n  -ms-filter: grayscale(0%);\n  -o-filter: grayscale(0%);\n  filter: grayscale(0%);\n  filter: grayscale(0);\n  /* Firefox 4+ */\n  filter: none;\n  /* IE 6-9 */\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item img {\n  vertical-align: middle;\n  -webkit-filter: grayscale(100%);\n  -moz-filter: grayscale(100%);\n  -ms-filter: grayscale(100%);\n  -o-filter: grayscale(100%);\n  filter: grayscale(100%);\n  filter: grayscale(1);\n  /* Firefox 4+ */\n  filter: gray;\n  /* IE 6-9 */\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item:hover .bns_info_mount_item_name,\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item:hover .bns_info_mount_item_text {\n  opacity: 0;\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item:hover .bns_info_mount_item_info a {\n  opacity: 1;\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item .bns_info_mount_item_info {\n  width: 135px;\n  float: right;\n  margin-right: 10px;\n  margin-top: 27px;\n  position: relative;\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item .bns_info_mount_item_info .bns_info_mount_item_name {\n  float: left;\n  width: 100%;\n  text-shadow: 0 0 10px #000000;\n  font-size: 17px;\n  color: #fff;\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item .bns_info_mount_item_info .bns_info_mount_item_text {\n  float: left;\n  width: 100%;\n  text-shadow: 0 0 10px #000000;\n  font-size: 15px;\n  color: #fff;\n}\n.bns_info .bns_info_right .bns_info_mount .bns_info_mount_item .bns_info_mount_item_info a {\n  opacity: 0;\n  line-height: 44px;\n  border-radius: 4px;\n  background-color: #00a6e1;\n  color: #fff;\n  font-size: 15px;\n  font-weight: 300;\n  width: 132px;\n  text-align: center;\n  text-decoration: none;\n  display: inline-block;\n  position: absolute;\n  right: 0;\n  top: 50%;\n  margin-top: -22px;\n}\n.bns_tab_qust {\n  margin-top: 25px;\n}\n.bns_tab_qust .bns_qust_item {\n  float: left;\n  width: 23%;\n  margin-left: 1%;\n  margin-right: 1%;\n  position: relative;\n  margin-bottom: 20px;\n}\n.bns_tab_qust .bns_qust_item:before {\n  content: '';\n  position: absolute;\n  z-index: 0;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  border: 1px solid #dbdad9;\n  border-radius: 6px;\n  -moz-transform: skewX(-6deg);\n  -webkit-transform: skewX(-6deg);\n  -o-transform: skewX(-6deg);\n  -ms-transform: skewX(-6deg);\n  transform: skewX(-6deg);\n}\n.bns_tab_qust .bns_qust_item:hover {\n  cursor: pointer;\n}\n.bns_tab_qust .bns_qust_item:hover:before {\n  /* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#007bc6+0,00a3d7+100 */\n  background: #007bc6;\n  /* Old browsers */\n  background: -moz-linear-gradient(left, #007bc6 0%, #00a3d7 100%);\n  /* FF3.6-15 */\n  background: -webkit-linear-gradient(left, #007bc6 0%, #00a3d7 100%);\n  /* Chrome10-25,Safari5.1-6 */\n  background: linear-gradient(to right, #007bc6 0%, #00a3d7 100%);\n  /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#007bc6', endColorstr='#00a3d7', GradientType=1);\n  /* IE6-9 */\n}\n.bns_tab_qust .bns_qust_item:hover .bns_qust_item_right .bns_qust_item_right_name,\n.bns_tab_qust .bns_qust_item:hover .bns_qust_item_right .bns_qust_item_right_bal {\n  opacity: 0;\n}\n.bns_tab_qust .bns_qust_item:hover .bns_qust_item_right .bns_qust_item_right_btn {\n  display: block;\n}\n.bns_tab_qust .bns_qust_item:hover .bns_qust_item_left svg {\n  position: relative;\n  filter: url(#white-glow);\n}\n.bns_tab_qust .bns_qust_item:hover .bns_qust_item_left svg path,\n.bns_tab_qust .bns_qust_item:hover .bns_qust_item_left svg g {\n  fill: #fff;\n}\n.bns_tab_qust .bns_qust_item .bns_qust_item_left {\n  float: left;\n  height: 100px;\n  width: 40%;\n  text-align: center;\n}\n.bns_tab_qust .bns_qust_item .bns_qust_item_left:before {\n  height: 100%;\n  display: inline-block;\n  vertical-align: middle;\n  content: '';\n}\n.bns_tab_qust .bns_qust_item .bns_qust_item_left svg {\n  width: 40px;\n  vertical-align: middle;\n}\n.bns_tab_qust .bns_qust_item .bns_qust_item_left svg path,\n.bns_tab_qust .bns_qust_item .bns_qust_item_left svg g {\n  fill: #CCCBCA;\n}\n.bns_tab_qust .bns_qust_item .bns_qust_item_right {\n  float: left;\n  box-sizing: border-box;\n  width: 60%;\n  padding-right: 10px;\n  position: relative;\n  height: 100px;\n}\n.bns_tab_qust .bns_qust_item .bns_qust_item_right .bns_qust_item_right_name {\n  float: left;\n  width: 100%;\n  color: #000000;\n  font-weight: 300;\n  font-size: 16px;\n  margin-top: 20px;\n}\n.bns_tab_qust .bns_qust_item .bns_qust_item_right .bns_qust_item_right_bal {\n  float: left;\n  width: 100%;\n  color: #00a6e1;\n  font-weight: bold;\n  font-size: 16px;\n  margin-top: 4px;\n}\n.bns_tab_qust .bns_qust_item .bns_qust_item_right .bns_qust_item_right_btn {\n  display: none;\n  color: #fff;\n  font-size: 14px;\n  font-weight: bold;\n  position: absolute;\n  line-height: 20px;\n  top: 50%;\n  left: 0;\n  width: 100%;\n  margin-top: -10px;\n  text-align: center;\n  text-decoration: none;\n}\n.disabled {\n  pointer-events: none;\n  opacity: .7;\n}\n.bns_hist_gift_link {\n  color: #00a6e1;\n  text-decoration: none;\n  border-bottom: 1px dashed #00a6e1;\n  margin-left: 11px;\n}\n.bns_hist_purchase_detail {\n  margin-left: 11px;\n  color: black !important;\n}\n.bns_hist_purchase_detail span,\n.bns_hist_purchase_detail .p_name {\n  color: #00a6e1 !important;\n}\n.bns_tab_gift {\n  margin-top: 25px;\n}\n.bns_tab_gift .bns_gift_item {\n  float: left;\n  width: 23%;\n  margin-left: 1%;\n  margin-right: 1%;\n  height: 275px;\n  position: relative;\n  margin-bottom: 20px;\n}\n.bns_tab_gift .bns_gift_item:before {\n  content: '';\n  position: absolute;\n  z-index: -1;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  border: 1px solid #dbdad9;\n  border-radius: 8px;\n  -moz-transform: skewX(-2deg);\n  -webkit-transform: skewX(-2deg);\n  -o-transform: skewX(-2deg);\n  -ms-transform: skewX(-2deg);\n  transform: skewX(-2deg);\n}\n.bns_tab_gift .bns_gift_item:hover:before {\n  /* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#007bc6+0,00a3d7+100 */\n  background: #007bc6;\n  /* Old browsers */\n  background: -moz-linear-gradient(left, #007bc6 0%, #00a3d7 100%);\n  /* FF3.6-15 */\n  background: -webkit-linear-gradient(left, #007bc6 0%, #00a3d7 100%);\n  /* Chrome10-25,Safari5.1-6 */\n  background: linear-gradient(to right, #007bc6 0%, #00a3d7 100%);\n  /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#007bc6', endColorstr='#00a3d7', GradientType=1);\n  /* IE6-9 */\n}\n.bns_tab_gift .bns_gift_item:hover .bns_gift_item_name {\n  opacity: 0;\n}\n.bns_tab_gift .bns_gift_item:hover .bns_gift_item_bal {\n  opacity: 0;\n}\n.bns_tab_gift .bns_gift_item:hover .bns_gift_item_linck {\n  opacity: 1;\n}\n.bns_tab_gift .bns_gift_item .bns_gift_item_img {\n  float: left;\n  width: 100%;\n  text-align: center;\n  height: 204px;\n}\n.bns_tab_gift .bns_gift_item .bns_gift_item_img:before {\n  height: 100%;\n  display: inline-block;\n  vertical-align: middle;\n  content: '';\n}\n.bns_tab_gift .bns_gift_item .bns_gift_item_img img {\n  vertical-align: middle;\n  max-width: 80%;\n  height: auto;\n}\n.bns_tab_gift .bns_gift_item .bns_gift_item_name {\n  float: left;\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0px 20px;\n  color: #000;\n  font-size: 14px;\n  font-weight: 300;\n  margin-top: 6px;\n}\n.bns_tab_gift .bns_gift_item .bns_gift_item_bal {\n  float: left;\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0px 20px;\n  color: #007bc6;\n  font-size: 14px;\n  font-weight: bold;\n  margin-top: 10px;\n}\n.bns_tab_gift .bns_gift_item .bns_gift_item_linck {\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  text-decoration: none;\n  line-height: 40px;\n  color: #fff;\n  font-weight: bold;\n  width: 120px;\n  border-radius: 4px;\n  position: absolute;\n  left: 50%;\n  margin-left: -60px;\n  bottom: 22px;\n  display: inline-block;\n  opacity: 0;\n  text-align: center;\n}\n.tooltip {\n  padding: 5px;\n  background: white;\n  display: block;\n  position: absolute;\n  top: -28px;\n  left: 10px;\n  z-index: 1000;\n  border-radius: 5px;\n  border: 1px solid rgba(0, 0, 0, 0.1);\n  box-shadow: 2px 2px 18px -7px black;\n}\n.bns_tab_achiv {\n  margin-top: 25px;\n}\n.bns_tab_achiv .bns_achiv_item {\n  float: left;\n  width: 19%;\n  margin-left: 0.5%;\n  margin-right: 0.5%;\n  text-align: center;\n  position: relative;\n  display: inline-block;\n  height: 215px;\n  border: 1px solid #dbdad9;\n  border-radius: 6px;\n  box-sizing: border-box;\n  margin-bottom: 20px;\n}\n.bns_tab_achiv .bns_achiv_item.act img {\n  -webkit-filter: grayscale(0%);\n  -moz-filter: grayscale(0%);\n  -ms-filter: grayscale(0%);\n  -o-filter: grayscale(0%);\n  filter: grayscale(0%);\n  filter: grayscale(0);\n  /* Firefox 4+ */\n  filter: none;\n  /* IE 6-9 */\n}\n.bns_tab_achiv .bns_achiv_item img {\n  width: 171px;\n  height: 161px;\n  margin-top: 5px;\n  -webkit-filter: grayscale(100%);\n  -moz-filter: grayscale(100%);\n  -ms-filter: grayscale(100%);\n  -o-filter: grayscale(100%);\n  filter: grayscale(100%);\n  filter: grayscale(1);\n  /* Firefox 4+ */\n  filter: gray;\n  /* IE 6-9 */\n}\n.bns_tab_achiv .bns_achiv_item span {\n  position: absolute;\n  left: 0;\n  width: 100%;\n  text-align: center;\n  bottom: 17px;\n  color: #000;\n  font-size: 16px;\n  font-weight: 300;\n}\n@media screen and (max-width: 1000px) {\n  .bns_top {\n    padding-bottom: 30px;\n  }\n  .bns_top .bns_top_head {\n    margin-bottom: 0px;\n    width: 100%;\n    margin-left: 0;\n    padding-left: 30px;\n    box-sizing: border-box;\n  }\n  .bns_top .bns_top_item {\n    width: 50%;\n    box-sizing: border-box;\n    margin-right: 0;\n    padding-right: 30px;\n    padding-left: 30px;\n    margin-top: 20px;\n    margin-bottom: 5px;\n  }\n  .bns_info {\n    text-align: center;\n  }\n  .bns_info .bns_info_left {\n    width: 100%;\n    text-align: left;\n  }\n  .bns_info .bns_info_left .bns_info_slide {\n    max-width: 1000px;\n  }\n  .bns_info .bns_info_left .bns_info_hist {\n    width: 37% ;\n  }\n  .bns_info .bns_info_right {\n    float: none;\n    display: inline-block;\n    margin: auto;\n    margin-top: 30px;\n  }\n}\n@media screen and (max-width: 900px) {\n  .bns_tab_qust .bns_qust_item {\n    width: 48%;\n  }\n  .bns_tab_gift {\n    text-align: center;\n  }\n  .bns_tab_gift .bns_gift_item {\n    float: none;\n    text-align: left;\n    width: 210px;\n    display: inline-block;\n  }\n  .bns_tab_achiv {\n    text-align: center;\n  }\n  .bns_tab_achiv .bns_achiv_item {\n    float: none;\n    width: 220px;\n    display: inline-block;\n    overflow: hidden;\n  }\n  .bns_tab_top {\n    margin-bottom: 30px;\n    position: relative;\n  }\n  .bns_tab_top .bns_tab_top_description {\n    left: 0;\n    top: 42px;\n    width: 100%;\n    text-align: center;\n    position: absolute;\n  }\n}\n@media screen and (max-width: 750px) {\n  .bns_overlay .bns_overlay_iner {\n    width: 95% !important;\n  }\n  .bns_overlay .bns_input_block input[type=\"text\"].bns_input_block_m,\n  .bns_overlay .bns_input_block input[type=\"number\"].bns_input_block_m {\n    width: 60px;\n    padding: 0px 9px;\n  }\n  .bns_overlay .bns_input_block input[type=\"text\"].bns_input_block_d,\n  .bns_overlay .bns_input_block input[type=\"nubmer\"].bns_input_block_d {\n    width: 80px;\n    padding: 0px 9px;\n  }\n  .bns_overlay .bns_overlay_iner .bns_over_info_left {\n    width: 100%;\n  }\n  .bns_overlay .bns_overlay_iner .bns_over_info_right {\n    width: 100%;\n  }\n  .bns_info .bns_info_left .bns_info_hist {\n    width: 44%;\n  }\n  .bns_info .bns_info_left .bns_info_text {\n    width: 100%;\n  }\n  .bns_info .bns_info_left .bns_info_text:before {\n    display: none;\n  }\n  .bns_info .bns_info_left .bns_info_hist {\n    width: 100%;\n    float: left;\n    margin-top: 20px;\n  }\n  .bns_top {\n    text-align: center;\n  }\n  .bns_top .bns_top_head {\n    padding-left: 0;\n    text-align: center;\n  }\n  .bns_top .bns_top_item {\n    text-align: left;\n    width: 250px;\n    display: inline-block;\n    float: none;\n    padding: 0;\n  }\n  .bns_overlay .bns_hist_table td:nth-child(1) {\n    display: none;\n  }\n  .bns_overlay .bns_hist_table td:nth-child(2) span b {\n    padding-left: 0;\n  }\n}\n@media screen and (max-width: 640px) {\n  .bns_overlay .bns_overlay_iner {\n    padding: 15px;\n    width: 90%;\n  }\n  .bns_text_block .bns_cake_block .bns_cake_item {\n    border: 0px;\n    width: 100%;\n    margin-bottom: 30px;\n  }\n  .bns_text_block .bns_cake_block .bns_cake_item .bns_cake_item_img {\n    height: auto;\n  }\n}\n@media screen and (max-width: 500px) {\n  .bns_info .bns_info_right {\n    width: 290px;\n  }\n  .bns_inner_block {\n    padding: 0px 10px;\n  }\n  .bns_tab_top .bns_tab_top_menu {\n    width: 100%;\n    text-align: center;\n  }\n  .bns_tab_top .bns_tab_top_menu a {\n    float: none;\n    padding: 0px 11px;\n  }\n  .bns_info .bns_info_right .bns_info_mount {\n    width: 290px;\n    margin-right: 0;\n    float: left;\n  }\n  .bns_info .bns_info_right .bns_info_mount .bns_info_mount_item {\n    padding-left: 80px;\n  }\n  .bns_info .bns_info_right .bns_info_mount .bns_info_mount_item:nth-child(1) img {\n    margin-left: 0px;\n    width: 47px;\n  }\n  .bns_info .bns_info_right .bns_info_mount .bns_info_mount_item img {\n    width: 60px;\n    height: auto;\n  }\n  .bns_tab_qust {\n    text-align: center;\n  }\n  .bns_tab_qust .bns_qust_item {\n    text-align: left;\n    width: 210px;\n    float: none;\n    display: inline-block;\n  }\n}\n"
;require("lessify")(css),module.exports=css;
},{"lessify":29}],51:[function(require,module,exports){
var _=require("underscore");module.exports={koSlider:function(a){var n="";Array.prototype.join;return n+='\n    <div class="bns_slide_pager" data-bind="foreach: ko.utils.range(1, slides.length), cssVisible: ">\n        <span data-bind="css: { active: $parent.currentSlide() == $data - 1 },\n                                click: function(data, event) { $parent.currentSlide($data - 1) }\n                        ">*</span>\n    </div>\n    \x3c!-- ko foreach: slides, beforeAdd: add --\x3e\n    <div class="bns_info_slide_item" data-bind="style: { backgroundImage: \'url(\' + image + \')\' }, \n                                                cssVisible: $parent.currentSlide() == $index()">\n        <span class="bns_info_slide_head" data-bind="html: header_html"></span>\n        <span class="bns_info_slide_text" data-bind="html: description_html, style: { color: $data.description_color || \'black\' }"></span>\n        <a href="" class="bns_info_slide_linck" data-bind="text: link_text, attr: { href: link_href }"></a>\n        </div>\n        \x3c!-- /ko --\x3e\n'},koPopup:function(a){var n="";Array.prototype.join;return n+='\n    <div class="bns_overlay" data-bind="css: { show: data.opened }, click: closeOnOverlay">\n        <div class="bns_overlay_iner" data-bind="style: { width: data.width }">\n            <a href="#" class="bns_close" data-bind="visible: !data.is_profile || data.is_register(), click: closePopup"></a>     \n            <span data-bind="template: { nodes: $componentTemplateNodes, data: data }"></span>       \n        </div>\n    </div>\n'}};
},{"underscore":34}],52:[function(require,module,exports){
var _=require("underscore");module.exports={index:function(n){var s="";Array.prototype.join;return s+='\n    <div class="overlay"></div>\n    <div class="bns_inner_block">\n        <div class="bns_top" data-bind="click: toggle_landing">\n            <span class="bns_top_head">\n                Бонусная программа\n            </span>\n            <div class="bns_top_item">\n                <img src="src/img/top_ic1.png" alt="">\n                <span>Получайте бонусы<br>\n                    за покупки в магазинах<br>\n                    и на сайте СпортDепо</span>\n            </div>\n            <div class="bns_top_item">\n                <img src="src/img/top_ic2.png" alt="">\n                <span>Получайте<br>\n                    персональные<br>\n                    предложения</span>\n            </div>\n            <div class="bns_top_item">\n                <img src="src/img/top_ic3.png" alt="">\n                <span>Тратьте бонусы<br>\n                    на оплату покупок:<br>\n                    1 бонус = 1 рубль</span>\n            </div>\n        </div>\n\n        <div class="bns_text_block" data-bind="visible: landing()">\n            <h2>Программа лояльности</h2>\n            <p>\n                Программа лояльности СпортDепо – это накопительная бонусная система, позволяющая ее участникам совершать выгодные покупки в магазинах и на сайте www.sportdepo.ru и пользоваться дополнительными сервисами и привилегиями. \u2028\n            </p>\n            <hr>\n            <h2>Как стать участником программы</h2>\n            <p>\n                Чтобы стать участником программы лояльности СпортDепо, необходимо получить и активировать карту в любом магазине розничной сети, или пройти регистрацию на сайте.\n            </p>\n            <hr>\n            <h2>Привилегии по командной карте</h2>\n            <p>\n                С каждой покупки в любом розничном магазине СпортDепо и на сайте на Вашу карту начисляются  бонусы - используйте их для оплаты дальнейших покупок. \n            </p>\n            <p style="margin-left: 1.1em">\n                1 бонус = 1 рубль. \n            </p>\n            <p>Но это далеко не всё:</p>\n            <ul>\n                <li>Выполняйте задания, участвуйте в акциях – получайте больше баллов.</li>\n                <li>Покупайте больше и переходите на новый уровень.</li>\n                <li>Получайте индивидуальные скидки и спецпредложения.</li>\n                <li>Пользуйтесь профессиональным сервисом на особенных условиях.</li>\n\t            <li>Получайте баллы в подарок на Ваш день рождения.</li>                \n            </ul>\n            <div class="bns_cake_block">\n                <div class="bns_cake_item">\n                    <div class="bns_cake_item_img">\n                        <img src="src/img/tort1.png" alt="">\n                    </div>\n                    <span class="bns_cake_bal">\n                       <span class="bns_cake_bal_num">\n                        300\n                       </span>\n                    <span class="bns_cake_bal_text">\n                        бонусов\n                       </span>\n                    </span>\n                    <span class="bns_cake_name">\n                       участнику<br>программы<br>лояльности\n                   </span>\n                </div>\n                <div class="bns_cake_item">\n                    <div class="bns_cake_item_img">\n                        <img src="src/img/tort2.png" alt="">\n                    </div>\n                    <span class="bns_cake_bal">\n                       <span class="bns_cake_bal_num">\n                        1000\n                       </span>\n                    <span class="bns_cake_bal_text">\n                        бонусов\n                       </span>\n                    </span>\n                    <span class="bns_cake_name">\n                       обладателю титула<br>"Вице-Чемпион"\n                   </span>\n                </div>\n                <div class="bns_cake_item">\n                    <div class="bns_cake_item_img">\n                        <img src="src/img/tort3.png" alt="">\n                    </div>\n                    <span class="bns_cake_bal">\n                       <span class="bns_cake_bal_num">\n                        2000\n                       </span>\n                    <span class="bns_cake_bal_text">\n                        бонусов\n                       </span>\n                    </span>\n                    <span class="bns_cake_name">\n                       обладателю титула<br>"Чемпион"\n                   </span>\n                </div>\n            </div>\n        </div>\n\n        <div data-bind="visible: !landing()">\n            <div class="bns_info">\n                <div class="bns_info_left">\n                    <div class="bns_info_container">\n                        <div class="bns_info_text" data-bind="component: \'ko-profile\'"></div>\n                        <div class="bns_info_delimeter_container">\n                            <div class="bns_info_delimeter"></div>\n                        </div>\n                        <div class="bns_info_hist" data-bind="component: \'ko-history\'"></div>\n                    </div>\n                    <div class="bns_info_slide" data-bind="component: {\n                        name: \'ko-slider\',\n                        params: { slides: slider_items }\n                    }"></div>\n            </div>\n            <div class="bns_info_right" style="float: right" data-bind="component: \'ko-status\'"></div>\n        </div>\n\n        <div class="btn_tab_main" data-bind="component: {\n                name: \'ko-tabs\',\n                params: { tabs: [\n                    {id: \'tab_qust\', description: \'За выполнение заданий вы получите баллы\', name: \'Задания\'},\n                ]}\n                }">\n\n            \x3c!--{id: \'tab_achiv\', description: \'Полученные вами награды\', name: \'Награды\'}--\x3e\n            \x3c!--{id: \'tab_gift\', description: \'Потратьте ваши накопленные баллы на подарки\', name: \'Подарки\'},--\x3e\n            <div class="bns_tab bns_tab_qust" data-bind="visible: tabs()[currentTabIndex()].id == \'tab_qust\', component: \'ko-quest\'"></div>\n            \x3c!--<div class="bns_tab bns_tab_gift" data-bind="visible: tabs()[currentTabIndex()].id == \'tab_gift\', component: \'ko-gifts\'"></div> --\x3e\n            \x3c!--<div class="bns_tab bns_tab_achiv" data-bind="visible: tabs()[currentTabIndex()].id == \'tab_achiv\', component: \'ko-achiv\'"></div>                       --\x3e\n        </div>\n    </div>\n'}};
},{"underscore":34}]},{},[49]);
