import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "./@floating-ui/react-dom+[...].mjs";
//#region node_modules/flairup/dist/esm/index.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function asArray(v) {
	return [].concat(v);
}
function isPsuedoSelector(selector) {
	return selector.startsWith(":");
}
function isStyleCondition(selector) {
	return isString(selector) && (selector === "*" || selector.length > 1 && ":>~.+*".includes(selector.slice(0, 1)) || isImmediatePostcondition(selector));
}
function isValidProperty(property, value) {
	return (isString(value) || typeof value === "number") && !isCssVariables(property) && !isPsuedoSelector(property) && !isMediaQuery(property);
}
function isMediaQuery(selector) {
	return selector.startsWith("@media");
}
function isDirectClass(selector) {
	return selector === ".";
}
function isCssVariables(selector) {
	return selector === "--";
}
function isString(value) {
	return value + "" === value;
}
function isImmediatePostcondition(value) {
	return isString(value) && (value.startsWith("&") || isPsuedoSelector(value));
}
function joinTruthy(arr, delimiter = "") {
	return arr.filter(Boolean).join(delimiter);
}
function stableHash(prefix, seed) {
	let hash = 0;
	if (seed.length === 0) return hash.toString();
	for (let i = 0; i < seed.length; i++) {
		const char = seed.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return `${prefix ?? "cl"}_${hash.toString(36)}`;
}
function handlePropertyValue(property, value) {
	if (property === "content") return `"${value}"`;
	return value;
}
function camelCaseToDash(str) {
	return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function joinedProperty(property, value) {
	return `${property}:${value}`;
}
function toClass(str) {
	return str ? `.${str}` : "";
}
function appendString(base, line) {
	return base ? `${base}
${line}` : line;
}
var Rule = class _Rule {
	constructor(sheet, property, value, selector) {
		this.sheet = sheet;
		this.property = property;
		this.value = value;
		this.selector = selector;
		this.property = property;
		this.value = value;
		this.joined = joinedProperty(property, value);
		const joinedConditions = this.selector.preconditions.concat(this.selector.postconditions);
		this.hash = this.selector.hasConditions ? this.selector.scopeClassName : stableHash(this.sheet.name, this.joined);
		this.key = joinTruthy([
			this.joined,
			joinedConditions,
			this.hash
		]);
	}
	toString() {
		let selectors = mergeSelectors(this.selector.preconditions, { right: this.hash });
		selectors = mergeSelectors(this.selector.postconditions, { left: selectors });
		return `${selectors} {${_Rule.genRule(this.property, this.value)}}`;
	}
	static genRule(property, value) {
		return joinedProperty(camelCaseToDash(property), handlePropertyValue(property, value)) + ";";
	}
};
function mergeSelectors(selectors, { left = "", right = "" } = {}) {
	return joinTruthy([selectors.reduce((selectors2, current) => {
		if (isPsuedoSelector(current)) return selectors2 + current;
		if (isImmediatePostcondition(current)) return selectors2 + current.slice(1);
		return joinTruthy([selectors2, current], " ");
	}, left), toClass(right)], " ");
}
var Selector = class _Selector {
	constructor(sheet, scopeName = null, { preconditions, postconditions } = {}) {
		this.sheet = sheet;
		this.preconditions = [];
		this.scopeClassName = null;
		this.scopeName = null;
		this.postconditions = [];
		this.preconditions = preconditions ? asArray(preconditions) : [];
		this.postconditions = postconditions ? asArray(postconditions) : [];
		this.setScope(scopeName);
	}
	setScope(scopeName) {
		if (!scopeName) return this;
		if (!this.scopeClassName) {
			this.scopeName = scopeName;
			this.scopeClassName = stableHash(this.sheet.name, scopeName + this.sheet.count);
		}
		return this;
	}
	get hasConditions() {
		return this.preconditions.length > 0 || this.postconditions.length > 0;
	}
	addScope(scopeName) {
		return new _Selector(this.sheet, scopeName, {
			preconditions: this.preconditions,
			postconditions: this.postconditions
		});
	}
	addPrecondition(precondition) {
		return new _Selector(this.sheet, this.scopeClassName, {
			postconditions: this.postconditions,
			preconditions: this.preconditions.concat(precondition)
		});
	}
	addPostcondition(postcondition) {
		return new _Selector(this.sheet, this.scopeClassName, {
			preconditions: this.preconditions,
			postconditions: this.postconditions.concat(postcondition)
		});
	}
	createRule(property, value) {
		return new Rule(this.sheet, property, value, this);
	}
};
var Sheet = class {
	constructor(name, rootNode) {
		this.name = name;
		this.rootNode = rootNode;
		this.storedStyles = {};
		this.storedClasses = {};
		this.style = "";
		this.count = 0;
		this.id = `flairup-${name}`;
		this.styleTag = this.createStyleTag();
	}
	getStyle() {
		return this.style;
	}
	append(css) {
		this.style = appendString(this.style, css);
	}
	apply() {
		this.count++;
		if (!this.styleTag) return;
		this.styleTag.innerHTML = this.style;
	}
	isApplied() {
		return !!this.styleTag;
	}
	createStyleTag() {
		if (typeof document === "undefined" || this.isApplied() || this.rootNode === null) return this.styleTag;
		const styleTag = document.createElement("style");
		styleTag.type = "text/css";
		styleTag.id = this.id;
		(this.rootNode ?? document.head).appendChild(styleTag);
		return styleTag;
	}
	addRule(rule) {
		const storedClass = this.storedClasses[rule.key];
		if (isString(storedClass)) return storedClass;
		this.storedClasses[rule.key] = rule.hash;
		this.storedStyles[rule.hash] = [rule.property, rule.value];
		this.append(rule.toString());
		return rule.hash;
	}
};
function forIn(obj, fn) {
	for (const key in obj) fn(key.trim(), obj[key]);
}
function cx(...args) {
	return joinTruthy(args.reduce((classes2, arg) => {
		if (arg instanceof Set) classes2.push(...arg);
		else if (typeof arg === "string") classes2.push(arg);
		else if (Array.isArray(arg)) classes2.push(cx(...arg));
		else if (typeof arg === "object") Object.entries(arg).forEach(([key, value]) => {
			if (value) classes2.push(key);
		});
		return classes2;
	}, []), " ").trim();
}
function createSheet(name, rootNode) {
	const sheet = new Sheet(name, rootNode);
	return {
		create,
		getStyle: sheet.getStyle.bind(sheet),
		isApplied: sheet.isApplied.bind(sheet)
	};
	function create(styles) {
		const scopedStyles = {};
		iteratePreconditions(sheet, styles, new Selector(sheet)).forEach(([scopeName, styles2, selector]) => {
			iterateStyles(sheet, styles2, selector).forEach((className) => {
				addScopedStyle(scopeName, className);
			});
		});
		sheet.apply();
		return scopedStyles;
		function addScopedStyle(name2, className) {
			scopedStyles[name2] = scopedStyles[name2] ?? /* @__PURE__ */ new Set();
			scopedStyles[name2].add(className);
		}
	}
}
function iteratePreconditions(sheet, styles, selector) {
	const output = [];
	forIn(styles, (key, value) => {
		if (isStyleCondition(key)) return iteratePreconditions(sheet, value, selector.addPrecondition(key)).forEach((item) => output.push(item));
		output.push([
			key,
			styles[key],
			selector.addScope(key)
		]);
	});
	return output;
}
function iterateStyles(sheet, styles, selector) {
	const output = /* @__PURE__ */ new Set();
	forIn(styles, (property, value) => {
		let res = [];
		if (isStyleCondition(property)) res = iterateStyles(sheet, value, selector.addPostcondition(property));
		else if (isDirectClass(property)) res = asArray(value);
		else if (isMediaQuery(property)) res = handleMediaQuery(sheet, value, property, selector);
		else if (isCssVariables(property)) res = cssVariablesBlock(sheet, value, selector);
		else if (isValidProperty(property, value)) {
			const rule = selector.createRule(property, value);
			sheet.addRule(rule);
			output.add(rule.hash);
		}
		return addEachClass(res, output);
	});
	return output;
}
function addEachClass(list, to) {
	list.forEach((className) => to.add(className));
	return to;
}
function cssVariablesBlock(sheet, styles, selector) {
	const classes = /* @__PURE__ */ new Set();
	const chunkRows = [];
	forIn(styles, (property, value) => {
		if (isValidProperty(property, value)) {
			chunkRows.push(Rule.genRule(property, value));
			return;
		}
		addEachClass(iterateStyles(sheet, value ?? {}, selector), classes);
	});
	if (!selector.scopeClassName) return classes;
	if (chunkRows.length) {
		const output = chunkRows.join(" ");
		sheet.append(`${mergeSelectors(selector.preconditions, { right: selector.scopeClassName })} {${output}}`);
	}
	classes.add(selector.scopeClassName);
	return classes;
}
function handleMediaQuery(sheet, styles, mediaQuery, selector) {
	sheet.append(mediaQuery + " {");
	const output = iterateStyles(sheet, styles, selector);
	sheet.append("}");
	return output;
}
//#endregion
//#region node_modules/emoji-picker-react/dist/emoji-picker-react.esm.js
function _arrayLikeToArray(r, a) {
	(null == a || a > r.length) && (a = r.length);
	for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	return n;
}
function _createForOfIteratorHelperLoose(r, e) {
	var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	if (t) return (t = t.call(r)).next.bind(t);
	if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
		t && (r = t);
		var o = 0;
		return function() {
			return o >= r.length ? { done: !0 } : {
				done: !1,
				value: r[o++]
			};
		};
	}
	throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _extends() {
	return _extends = Object.assign ? Object.assign.bind() : function(n) {
		for (var e = 1; e < arguments.length; e++) {
			var t = arguments[e];
			for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
		}
		return n;
	}, _extends.apply(null, arguments);
}
function _inheritsLoose(t, o) {
	t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
}
function _objectWithoutPropertiesLoose(r, e) {
	if (null == r) return {};
	var t = {};
	for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
		if (-1 !== e.indexOf(n)) continue;
		t[n] = r[n];
	}
	return t;
}
function _setPrototypeOf(t, e) {
	return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t, e) {
		return t.__proto__ = e, t;
	}, _setPrototypeOf(t, e);
}
function _unsupportedIterableToArray(r, a) {
	if (r) {
		if ("string" == typeof r) return _arrayLikeToArray(r, a);
		var t = {}.toString.call(r).slice(8, -1);
		return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
	}
}
var ClassNames;
(function(ClassNames) {
	ClassNames["hiddenOnSearch"] = "epr-hidden-on-search";
	ClassNames["searchActive"] = "epr-search-active";
	ClassNames["hidden"] = "epr-hidden";
	ClassNames["visible"] = "epr-visible";
	ClassNames["active"] = "epr-active";
	ClassNames["emoji"] = "epr-emoji";
	ClassNames["category"] = "epr-emoji-category";
	ClassNames["label"] = "epr-emoji-category-label";
	ClassNames["categoryContent"] = "epr-emoji-category-content";
	ClassNames["emojiHasVariations"] = "epr-emoji-has-variations";
	ClassNames["scrollBody"] = "epr-body";
	ClassNames["emojiList"] = "epr-emoji-list";
	ClassNames["external"] = "__EmojiPicker__";
	ClassNames["emojiPicker"] = "EmojiPickerReact";
	ClassNames["open"] = "epr-open";
	ClassNames["vertical"] = "epr-vertical";
	ClassNames["horizontal"] = "epr-horizontal";
	ClassNames["variationPicker"] = "epr-emoji-variation-picker";
	ClassNames["darkTheme"] = "epr-dark-theme";
	ClassNames["autoTheme"] = "epr-auto-theme";
})(ClassNames || (ClassNames = {}));
function asSelectors() {
	for (var _len = arguments.length, classNames = new Array(_len), _key = 0; _key < _len; _key++) classNames[_key] = arguments[_key];
	return classNames.map(function(c) {
		return "." + c;
	}).join("");
}
var stylesheet = /*#__PURE__*/ createSheet("epr", null);
var hidden = {
	display: "none",
	opacity: "0",
	pointerEvents: "none",
	visibility: "hidden",
	overflow: "hidden"
};
var commonStyles = /*#__PURE__*/ stylesheet.create({ hidden: /*#__PURE__*/ _extends({ ".": ClassNames.hidden }, hidden) });
var PickerStyleTag = /*#__PURE__*/ (0, import_react.memo)(function PickerStyleTag(_ref) {
	var nonce = _ref.nonce;
	return (0, import_react.createElement)("style", {
		nonce,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: stylesheet.getStyle() }
	});
});
var commonInteractionStyles = /*#__PURE__*/ stylesheet.create({
	".epr-main": {
		":has(input:not(:placeholder-shown))": {
			categoryBtn: { ":hover": {
				opacity: "1",
				backgroundPositionY: "var(--epr-category-navigation-button-size)"
			} },
			hiddenOnSearch: /*#__PURE__*/ _extends({ ".": ClassNames.hiddenOnSearch }, hidden)
		},
		":has(input:placeholder-shown)": { visibleOnSearchOnly: hidden }
	},
	hiddenOnReactions: { transition: "all 0.5s ease-in-out" },
	".epr-reactions": { hiddenOnReactions: {
		height: "0px",
		width: "0px",
		opacity: "0",
		pointerEvents: "none",
		overflow: "hidden"
	} },
	".EmojiPickerReact:not(.epr-search-active)": {
		categoryBtn: {
			":hover": {
				opacity: "1",
				backgroundPositionY: "var(--epr-category-navigation-button-size)"
			},
			"&.epr-active": {
				opacity: "1",
				backgroundPositionY: "var(--epr-category-navigation-button-size)"
			}
		},
		visibleOnSearchOnly: /*#__PURE__*/ _extends({ ".": "epr-visible-on-search-only" }, hidden)
	}
});
function darkMode(key, value) {
	var _eprDarkTheme, _eprAutoTheme;
	return {
		".epr-dark-theme": (_eprDarkTheme = {}, _eprDarkTheme[key] = value, _eprDarkTheme),
		".epr-auto-theme": (_eprAutoTheme = {}, _eprAutoTheme[key] = { "@media (prefers-color-scheme: dark)": value }, _eprAutoTheme)
	};
}
function compareConfig(prev, next) {
	var _prev$customEmojis, _next$customEmojis;
	var prevCustomEmojis = (_prev$customEmojis = prev.customEmojis) != null ? _prev$customEmojis : [];
	var nextCustomEmojis = (_next$customEmojis = next.customEmojis) != null ? _next$customEmojis : [];
	return prev.open === next.open && prev.emojiVersion === next.emojiVersion && prev.reactionsDefaultOpen === next.reactionsDefaultOpen && prev.searchPlaceHolder === next.searchPlaceHolder && prev.searchPlaceholder === next.searchPlaceholder && prev.searchClearButtonLabel === next.searchClearButtonLabel && prev.defaultSkinTone === next.defaultSkinTone && prev.skinTonesDisabled === next.skinTonesDisabled && prev.autoFocusSearch === next.autoFocusSearch && prev.emojiStyle === next.emojiStyle && prev.theme === next.theme && prev.suggestedEmojisMode === next.suggestedEmojisMode && prev.lazyLoadEmojis === next.lazyLoadEmojis && prev.className === next.className && prev.height === next.height && prev.width === next.width && prev.style === next.style && prev.searchDisabled === next.searchDisabled && prev.skinTonePickerLocation === next.skinTonePickerLocation && prevCustomEmojis.length === nextCustomEmojis.length && prev.emojiData === next.emojiData;
}
var DEFAULT_REACTIONS = [
	"1f44d",
	"2764-fe0f",
	"1f603",
	"1f622",
	"1f64f",
	"1f44e",
	"1f621"
];
var SuggestionMode;
(function(SuggestionMode) {
	SuggestionMode["RECENT"] = "recent";
	SuggestionMode["FREQUENT"] = "frequent";
})(SuggestionMode || (SuggestionMode = {}));
var EmojiStyle;
(function(EmojiStyle) {
	EmojiStyle["NATIVE"] = "native";
	EmojiStyle["APPLE"] = "apple";
	EmojiStyle["TWITTER"] = "twitter";
	EmojiStyle["GOOGLE"] = "google";
	EmojiStyle["FACEBOOK"] = "facebook";
})(EmojiStyle || (EmojiStyle = {}));
var Theme;
(function(Theme) {
	Theme["DARK"] = "dark";
	Theme["LIGHT"] = "light";
	Theme["AUTO"] = "auto";
})(Theme || (Theme = {}));
var SkinTones;
(function(SkinTones) {
	SkinTones["NEUTRAL"] = "neutral";
	SkinTones["LIGHT"] = "1f3fb";
	SkinTones["MEDIUM_LIGHT"] = "1f3fc";
	SkinTones["MEDIUM"] = "1f3fd";
	SkinTones["MEDIUM_DARK"] = "1f3fe";
	SkinTones["DARK"] = "1f3ff";
})(SkinTones || (SkinTones = {}));
var Categories;
(function(Categories) {
	Categories["SUGGESTED"] = "suggested";
	Categories["CUSTOM"] = "custom";
	Categories["SMILEYS_PEOPLE"] = "smileys_people";
	Categories["ANIMALS_NATURE"] = "animals_nature";
	Categories["FOOD_DRINK"] = "food_drink";
	Categories["TRAVEL_PLACES"] = "travel_places";
	Categories["ACTIVITIES"] = "activities";
	Categories["OBJECTS"] = "objects";
	Categories["SYMBOLS"] = "symbols";
	Categories["FLAGS"] = "flags";
})(Categories || (Categories = {}));
var SkinTonePickerLocation;
(function(SkinTonePickerLocation) {
	SkinTonePickerLocation["SEARCH"] = "SEARCH";
	SkinTonePickerLocation["PREVIEW"] = "PREVIEW";
})(SkinTonePickerLocation || (SkinTonePickerLocation = {}));
var CDN_URL_APPLE = "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/";
var CDN_URL_FACEBOOK = "https://cdn.jsdelivr.net/npm/emoji-datasource-facebook/img/facebook/64/";
var CDN_URL_TWITTER = "https://cdn.jsdelivr.net/npm/emoji-datasource-twitter/img/twitter/64/";
var CDN_URL_GOOGLE = "https://cdn.jsdelivr.net/npm/emoji-datasource-google/img/google/64/";
function cdnUrl(emojiStyle) {
	switch (emojiStyle) {
		case EmojiStyle.TWITTER: return CDN_URL_TWITTER;
		case EmojiStyle.GOOGLE: return CDN_URL_GOOGLE;
		case EmojiStyle.FACEBOOK: return CDN_URL_FACEBOOK;
		case EmojiStyle.APPLE:
		default: return CDN_URL_APPLE;
	}
}
var skinToneVariations = [
	SkinTones.NEUTRAL,
	SkinTones.LIGHT,
	SkinTones.MEDIUM_LIGHT,
	SkinTones.MEDIUM,
	SkinTones.MEDIUM_DARK,
	SkinTones.DARK
];
var skinTonesNamed = /*#__PURE__*/ Object.entries(SkinTones).reduce(function(acc, _ref) {
	var key = _ref[0], value = _ref[1];
	acc[value] = key;
	return acc;
}, {});
var skinTonesMapped = /*#__PURE__*/ skinToneVariations.reduce(function(mapped, skinTone) {
	var _Object$assign;
	return Object.assign(mapped, (_Object$assign = {}, _Object$assign[skinTone] = skinTone, _Object$assign));
}, {});
var EmojiProperties;
(function(EmojiProperties) {
	EmojiProperties["name"] = "n";
	EmojiProperties["unified"] = "u";
	EmojiProperties["variations"] = "v";
	EmojiProperties["added_in"] = "a";
	EmojiProperties["imgUrl"] = "imgUrl";
})(EmojiProperties || (EmojiProperties = {}));
function emojiNames(emoji) {
	var _emoji$EmojiPropertie;
	return (_emoji$EmojiPropertie = emoji[EmojiProperties.name]) != null ? _emoji$EmojiPropertie : [];
}
function addedIn(emoji) {
	return parseFloat(emoji[EmojiProperties.added_in] || "0");
}
function emojiName(emoji) {
	if (!emoji) return "";
	var names = emojiNames(emoji);
	return names[names.length - 1];
}
function unifiedWithoutSkinTone(unified) {
	var splat = unified.split("-");
	if (skinTonesMapped[splat.splice(1, 1)[0]]) return splat.join("-");
	return unified;
}
function emojiUnified(emoji, skinTone) {
	var _emojiVariationUnifie;
	var unified = emoji[EmojiProperties.unified];
	if (!skinTone || !emojiHasVariations(emoji)) return unified;
	return (_emojiVariationUnifie = emojiVariationUnified(emoji, skinTone)) != null ? _emojiVariationUnifie : unified;
}
function emojiUrlByUnified(unified, emojiStyle) {
	return "" + cdnUrl(emojiStyle) + unified + ".png";
}
function emojiVariations(emoji) {
	var _emoji$EmojiPropertie2;
	return (_emoji$EmojiPropertie2 = emoji[EmojiProperties.variations]) != null ? _emoji$EmojiPropertie2 : [];
}
function emojiHasVariations(emoji) {
	return emojiVariations(emoji).length > 0;
}
function emojiVariationUnified(emoji, skinTone) {
	return skinTone ? emojiVariations(emoji).find(function(variation) {
		return variation.includes(skinTone);
	}) : emojiUnified(emoji);
}
function activeVariationFromUnified(unified) {
	var suspectedSkinTone = unified.split("-")[1];
	return Object.keys(skinTonesMapped).includes(suspectedSkinTone) ? suspectedSkinTone : null;
}
var _configByCategory;
var categoriesOrdered = [
	Categories.SUGGESTED,
	Categories.CUSTOM,
	Categories.SMILEYS_PEOPLE,
	Categories.ANIMALS_NATURE,
	Categories.FOOD_DRINK,
	Categories.TRAVEL_PLACES,
	Categories.ACTIVITIES,
	Categories.OBJECTS,
	Categories.SYMBOLS,
	Categories.FLAGS
];
var SuggestedRecent = {
	name: "Recently Used",
	category: Categories.SUGGESTED
};
var configByCategory = (_configByCategory = {}, _configByCategory[Categories.SUGGESTED] = {
	category: Categories.SUGGESTED,
	name: "Frequently Used"
}, _configByCategory[Categories.CUSTOM] = {
	category: Categories.CUSTOM,
	name: "Custom Emojis"
}, _configByCategory[Categories.SMILEYS_PEOPLE] = {
	category: Categories.SMILEYS_PEOPLE,
	name: "Smileys & People"
}, _configByCategory[Categories.ANIMALS_NATURE] = {
	category: Categories.ANIMALS_NATURE,
	name: "Animals & Nature"
}, _configByCategory[Categories.FOOD_DRINK] = {
	category: Categories.FOOD_DRINK,
	name: "Food & Drink"
}, _configByCategory[Categories.TRAVEL_PLACES] = {
	category: Categories.TRAVEL_PLACES,
	name: "Travel & Places"
}, _configByCategory[Categories.ACTIVITIES] = {
	category: Categories.ACTIVITIES,
	name: "Activities"
}, _configByCategory[Categories.OBJECTS] = {
	category: Categories.OBJECTS,
	name: "Objects"
}, _configByCategory[Categories.SYMBOLS] = {
	category: Categories.SYMBOLS,
	name: "Symbols"
}, _configByCategory[Categories.FLAGS] = {
	category: Categories.FLAGS,
	name: "Flags"
}, _configByCategory);
function baseCategoriesConfig(modifiers) {
	return categoriesOrdered.map(function(category) {
		return _extends({}, configByCategory[category], modifiers && modifiers[category] && modifiers[category]);
	});
}
function categoryFromCategoryConfig(category) {
	return category.category;
}
function categoryNameFromCategoryConfig(category) {
	return category.name;
}
function mergeCategoriesConfig(userCategoriesConfig, modifiers, emojiData) {
	var _userCategoriesConfig;
	if (userCategoriesConfig === void 0) userCategoriesConfig = [];
	if (modifiers === void 0) modifiers = {};
	var extra = function() {
		var fromData = emojiData != null && emojiData.categories ? Object.fromEntries(Object.entries(emojiData.categories).filter(function(_ref) {
			return !!_ref[1];
		})) : {};
		if (modifiers.suggestionMode === SuggestionMode.RECENT) {
			var _emojiData$categories;
			var recentConfig = emojiData == null ? void 0 : (_emojiData$categories = emojiData.categories) == null ? void 0 : _emojiData$categories["suggested_recent"];
			fromData[Categories.SUGGESTED] = recentConfig ? {
				category: Categories.SUGGESTED,
				name: recentConfig.name
			} : SuggestedRecent;
		}
		return fromData;
	}();
	var base = baseCategoriesConfig(extra);
	if (!((_userCategoriesConfig = userCategoriesConfig) != null && _userCategoriesConfig.length)) return base;
	return userCategoriesConfig.map(function(category) {
		if (typeof category === "string") return getBaseConfigByCategory(category, extra[category]);
		return _extends({}, getBaseConfigByCategory(category.category, extra[category.category]), category);
	});
}
function getBaseConfigByCategory(category, modifier) {
	if (modifier === void 0) modifier = {};
	return Object.assign(configByCategory[category], modifier);
}
var KNOWN_FAILING_EMOJIS = [
	"2640-fe0f",
	"2642-fe0f",
	"2695-fe0f"
];
var DEFAULT_SEARCH_PLACEHOLDER = "Search";
var DEFAULT_SEARCH_CLEAR_BUTTON_LABEL = "Clear";
var SEARCH_RESULTS_NO_RESULTS_FOUND = "No results found";
var SEARCH_RESULTS_SUFFIX = " found. Use up and down arrow keys to navigate.";
var SEARCH_RESULTS_ONE_RESULT_FOUND = "1 result" + SEARCH_RESULTS_SUFFIX;
var SEARCH_RESULTS_MULTIPLE_RESULTS_FOUND = "%n results" + SEARCH_RESULTS_SUFFIX;
function mergeConfig(userConfig) {
	var _userConfig$emojiData, _userConfig$emojiData2, _userConfig$emojiData3, _userConfig$previewCo, _userConfig$previewCo2;
	if (userConfig === void 0) userConfig = {};
	var base = basePickerConfig();
	var localizedMood = (_userConfig$emojiData = userConfig.emojiData) == null ? void 0 : (_userConfig$emojiData2 = _userConfig$emojiData.categories) == null ? void 0 : (_userConfig$emojiData3 = _userConfig$emojiData2.preview_mood) == null ? void 0 : _userConfig$emojiData3.name;
	var previewConfig = _extends({}, base.previewConfig, localizedMood && !((_userConfig$previewCo = userConfig.previewConfig) != null && _userConfig$previewCo.defaultCaption) ? { defaultCaption: localizedMood } : {}, (_userConfig$previewCo2 = userConfig.previewConfig) != null ? _userConfig$previewCo2 : {});
	var config = Object.assign(base, userConfig);
	var categories = mergeCategoriesConfig(userConfig.categories, { suggestionMode: config.suggestedEmojisMode }, userConfig.emojiData);
	config.hiddenEmojis.forEach(function(emoji) {
		config.unicodeToHide.add(emoji);
	});
	var skinTonePickerLocation = config.searchDisabled ? SkinTonePickerLocation.PREVIEW : config.skinTonePickerLocation;
	return _extends({}, config, {
		categories,
		previewConfig,
		skinTonePickerLocation
	});
}
function basePickerConfig() {
	return {
		autoFocusSearch: true,
		categories: baseCategoriesConfig(),
		className: "",
		customEmojis: [],
		defaultSkinTone: SkinTones.NEUTRAL,
		emojiStyle: EmojiStyle.APPLE,
		emojiVersion: null,
		getEmojiUrl: emojiUrlByUnified,
		height: 450,
		lazyLoadEmojis: false,
		previewConfig: _extends({}, basePreviewConfig),
		searchDisabled: false,
		searchPlaceHolder: DEFAULT_SEARCH_PLACEHOLDER,
		searchPlaceholder: DEFAULT_SEARCH_PLACEHOLDER,
		searchClearButtonLabel: DEFAULT_SEARCH_CLEAR_BUTTON_LABEL,
		skinTonePickerLocation: SkinTonePickerLocation.SEARCH,
		skinTonesDisabled: false,
		style: {},
		suggestedEmojisMode: SuggestionMode.FREQUENT,
		theme: Theme.LIGHT,
		unicodeToHide: new Set(KNOWN_FAILING_EMOJIS),
		width: 350,
		reactionsDefaultOpen: false,
		reactions: DEFAULT_REACTIONS,
		open: true,
		allowExpandReactions: true,
		hiddenEmojis: [],
		emojiData: void 0,
		categoryIcons: {},
		nonce: void 0
	};
}
var basePreviewConfig = {
	defaultEmoji: "1f60a",
	defaultCaption: "What's your mood?",
	showPreview: true
};
var _excluded = ["children"];
var ConfigContext = /*#__PURE__*/ (0, import_react.createContext)(/*#__PURE__*/ basePickerConfig());
function PickerConfigProvider(_ref) {
	var children = _ref.children;
	var mergedConfig = useSetConfig(_objectWithoutPropertiesLoose(_ref, _excluded));
	return (0, import_react.createElement)(ConfigContext.Provider, { value: mergedConfig }, children);
}
function useSetConfig(config) {
	var _config$customEmojis;
	var _React$useState = (0, import_react.useState)(function() {
		return mergeConfig(config);
	}), mergedConfig = _React$useState[0], setMergedConfig = _React$useState[1];
	(0, import_react.useEffect)(function() {
		if (compareConfig(mergedConfig, config)) return;
		setMergedConfig(mergeConfig(config));
	}, [
		(_config$customEmojis = config.customEmojis) == null ? void 0 : _config$customEmojis.length,
		config.open,
		config.emojiVersion,
		config.reactionsDefaultOpen,
		config.searchPlaceHolder,
		config.searchPlaceholder,
		config.searchClearButtonLabel,
		config.defaultSkinTone,
		config.skinTonesDisabled,
		config.autoFocusSearch,
		config.emojiStyle,
		config.theme,
		config.suggestedEmojisMode,
		config.lazyLoadEmojis,
		config.className,
		config.height,
		config.width,
		config.searchDisabled,
		config.skinTonePickerLocation,
		config.allowExpandReactions,
		config.emojiData
	]);
	return mergedConfig;
}
function usePickerConfig() {
	return (0, import_react.useContext)(ConfigContext);
}
function useDebouncedState(initialValue, delay) {
	if (delay === void 0) delay = 0;
	var _useState = (0, import_react.useState)(initialValue), state = _useState[0], setState = _useState[1];
	var timer = (0, import_react.useRef)(null);
	function debouncedSetState(value) {
		return new Promise(function(resolve) {
			var _window;
			if (timer.current) clearTimeout(timer.current);
			timer.current = (_window = window) == null ? void 0 : _window.setTimeout(function() {
				setState(value);
				resolve(value);
			}, delay);
		});
	}
	return [state, debouncedSetState];
}
var defaultEmojiData = {
	categories: {
		smileys_people: {
			category: "smileys_people",
			name: "people & body"
		},
		animals_nature: {
			category: "animals_nature",
			name: "animals & nature"
		},
		food_drink: {
			category: "food_drink",
			name: "food & drink"
		},
		travel_places: {
			category: "travel_places",
			name: "travel & places"
		},
		activities: {
			category: "activities",
			name: "activities"
		},
		objects: {
			category: "objects",
			name: "objects"
		},
		symbols: {
			category: "symbols",
			name: "symbols"
		},
		flags: {
			category: "flags",
			name: "flags"
		},
		suggested: {
			category: "suggested",
			name: "Frequently Used"
		},
		custom: {
			category: "custom",
			name: "Custom Emojis"
		},
		suggested_recent: {
			category: "suggested",
			name: "Recently Used"
		},
		preview_mood: {
			category: "preview_mood",
			name: "What's your mood?"
		}
	},
	emojis: {
		custom: [],
		smileys_people: [
			{
				n: [
					"face",
					"grin",
					"nice",
					"happy",
					"laugh",
					"smile",
					"teeth",
					"cheery",
					"smiling",
					"cheerful",
					"grinning",
					"grinning face"
				],
				u: "1f600",
				a: "1"
			},
			{
				n: [
					"big",
					"yay",
					"eyes",
					"face",
					"grin",
					"open",
					"happy",
					"mouth",
					"smile",
					"teeth",
					"awesome",
					"smiling",
					"grinning",
					"grinning face with big eyes"
				],
				u: "1f603",
				a: "0.6"
			},
			{
				n: [
					"eye",
					"lol",
					"eyes",
					"face",
					"grin",
					"open",
					"happy",
					"laugh",
					"mouth",
					"smile",
					"smiling",
					"grinning",
					"grinning face with smiling eyes"
				],
				u: "1f604",
				a: "0.6"
			},
			{
				n: [
					"eye",
					"eyes",
					"face",
					"grin",
					"nice",
					"happy",
					"smile",
					"teeth",
					"beaming",
					"smiling",
					"grinning",
					"beaming face with smiling eyes"
				],
				u: "1f601",
				a: "0.6"
			},
			{
				n: [
					"lol",
					"eyes",
					"face",
					"haha",
					"open",
					"rofl",
					"happy",
					"laugh",
					"mouth",
					"smile",
					"closed",
					"hahaha",
					"smiling",
					"grinning",
					"squinting",
					"grinning squinting face"
				],
				u: "1f606",
				a: "0.6"
			},
			{
				n: [
					"cold",
					"face",
					"open",
					"mouth",
					"smile",
					"sweat",
					"stress",
					"excited",
					"nervous",
					"smiling",
					"dejected",
					"grinning",
					"stressed",
					"grinning face with sweat"
				],
				u: "1f605",
				a: "0.6"
			},
			{
				n: [
					"joy",
					"lol",
					"face",
					"haha",
					"hehe",
					"lmao",
					"rofl",
					"tear",
					"floor",
					"funny",
					"happy",
					"laugh",
					"crying",
					"roflmao",
					"rolling",
					"hilarious",
					"rolling on the floor laughing"
				],
				u: "1f923",
				a: "3"
			},
			{
				n: [
					"joy",
					"lol",
					"face",
					"haha",
					"hehe",
					"lmao",
					"rofl",
					"tear",
					"feels",
					"funny",
					"happy",
					"laugh",
					"crying",
					"roflmao",
					"hilarious",
					"face with tears of joy"
				],
				u: "1f602",
				a: "0.6"
			},
			{
				n: [
					"face",
					"happy",
					"smile",
					"smiling",
					"slightly",
					"slightly smiling face"
				],
				u: "1f642",
				a: "1"
			},
			{
				n: [
					"face",
					"hehe",
					"smile",
					"upside down",
					"upside down face"
				],
				u: "1f643",
				a: "1"
			},
			{
				n: [
					"hot",
					"lol",
					"face",
					"haha",
					"heat",
					"melt",
					"liquid",
					"melting",
					"sarcasm",
					"dissolve",
					"disappear",
					"sarcastic",
					"embarrassed",
					"melting face"
				],
				u: "1fae0",
				a: "14"
			},
			{
				n: [
					"face",
					"sexy",
					"wink",
					"flirt",
					"slide",
					"tease",
					"winks",
					"winking",
					"winking face",
					"heartbreaker"
				],
				u: "1f609",
				a: "0.6"
			},
			{
				n: [
					"eye",
					"eyes",
					"face",
					"glad",
					"blush",
					"smile",
					"smiling",
					"satisfied",
					"smiling face with smiling eyes"
				],
				u: "1f60a",
				a: "0.6"
			},
			{
				n: [
					"face",
					"halo",
					"tale",
					"angel",
					"fairy",
					"happy",
					"smile",
					"angels",
					"spirit",
					"angelic",
					"blessed",
					"fantasy",
					"smiling",
					"innocent",
					"peaceful",
					"fairytale",
					"smiling face with halo"
				],
				u: "1f607",
				a: "1"
			},
			{
				n: [
					"3",
					"ily",
					"you",
					"face",
					"love",
					"adore",
					"crush",
					"heart",
					"smile",
					"hearts",
					"romance",
					"smiling",
					"smiling face with hearts"
				],
				u: "1f970",
				a: "11"
			},
			{
				n: [
					"143",
					"bae",
					"eye",
					"ily",
					"face",
					"love",
					"xoxo",
					"feels",
					"smile",
					"hearts",
					"kisses",
					"romance",
					"romantic",
					"heart eyes",
					"smiling face with heart eyes"
				],
				u: "1f60d",
				a: "0.6"
			},
			{
				n: [
					"wow",
					"eyes",
					"face",
					"star",
					"smile",
					"excited",
					"grinning",
					"star struck",
					"starry eyed"
				],
				u: "1f929",
				a: "5"
			},
			{
				n: [
					"bae",
					"ily",
					"you",
					"face",
					"kiss",
					"love",
					"miss",
					"muah",
					"xoxo",
					"flirt",
					"heart",
					"lover",
					"adorbs",
					"smooch",
					"blowing",
					"romantic",
					"face blowing a kiss"
				],
				u: "1f618",
				a: "0.6"
			},
			{
				n: [
					"143",
					"ily",
					"you",
					"date",
					"face",
					"kiss",
					"love",
					"xoxo",
					"flirt",
					"dating",
					"smooch",
					"smooches",
					"kissing face"
				],
				u: "1f617",
				a: "1"
			},
			{
				n: [
					"face",
					"happy",
					"smile",
					"relaxed",
					"smiling",
					"outlined",
					"smiling face"
				],
				u: "263a-fe0f",
				a: "0.6"
			},
			{
				n: [
					"143",
					"bae",
					"eye",
					"ily",
					"date",
					"eyes",
					"face",
					"xoxo",
					"blush",
					"flirt",
					"closed",
					"dating",
					"kisses",
					"kissing",
					"smooches",
					"kissing face with closed eyes"
				],
				u: "1f61a",
				a: "0.6"
			},
			{
				n: [
					"143",
					"eye",
					"ily",
					"date",
					"eyes",
					"face",
					"kiss",
					"love",
					"flirt",
					"night",
					"smile",
					"closed",
					"dating",
					"kisses",
					"kissing",
					"smiling",
					"kissing face with smiling eyes"
				],
				u: "1f619",
				a: "1"
			},
			{
				n: [
					"joy",
					"face",
					"glad",
					"pain",
					"tear",
					"happy",
					"proud",
					"smile",
					"smiley",
					"smiling",
					"touched",
					"grateful",
					"relieved",
					"smiling face with tear"
				],
				u: "1f972",
				a: "13"
			},
			{
				n: [
					"um",
					"eat",
					"yum",
					"face",
					"food",
					"full",
					"savor",
					"smile",
					"tasty",
					"yummy",
					"hungry",
					"smiling",
					"delicious",
					"face savoring food"
				],
				u: "1f60b",
				a: "0.6"
			},
			{
				n: [
					"cool",
					"face",
					"nice",
					"party",
					"sweet",
					"tongue",
					"awesome",
					"stuck out",
					"face with tongue"
				],
				u: "1f61b",
				a: "1"
			},
			{
				n: [
					"eye",
					"epic",
					"face",
					"joke",
					"wink",
					"yolo",
					"crazy",
					"funny",
					"loopy",
					"nutty",
					"party",
					"wacky",
					"tongue",
					"weirdo",
					"winking",
					"stuck out",
					"winking face with tongue"
				],
				u: "1f61c",
				a: "0.6"
			},
			{
				n: [
					"eye",
					"eyes",
					"face",
					"zany",
					"crazy",
					"goofy",
					"large",
					"small",
					"zany face"
				],
				u: "1f92a",
				a: "5"
			},
			{
				n: [
					"eye",
					"omg",
					"eyes",
					"face",
					"yolo",
					"gross",
					"taste",
					"closed",
					"tongue",
					"horrible",
					"whatever",
					"squinting",
					"stuck out",
					"squinting face with tongue"
				],
				u: "1f61d",
				a: "0.6"
			},
			{
				n: [
					"face",
					"paid",
					"money",
					"mouth",
					"money mouth",
					"money mouth face"
				],
				u: "1f911",
				a: "1"
			},
			{
				n: [
					"hug",
					"face",
					"open",
					"hands",
					"hugging",
					"smiling",
					"smiling face with open hands"
				],
				u: "1f917",
				a: "1"
			},
			{
				n: [
					"face",
					"hand",
					"oops",
					"mouth",
					"shock",
					"giggle",
					"secret",
					"sudden",
					"whoops",
					"giggling",
					"surprise",
					"realization",
					"face with hand over mouth"
				],
				u: "1f92d",
				a: "5"
			},
			{
				n: [
					"awe",
					"omg",
					"eyes",
					"face",
					"gasp",
					"hand",
					"open",
					"over",
					"mouth",
					"quiet",
					"shock",
					"scared",
					"surprise",
					"amazement",
					"disbelief",
					"embarrass",
					"face with open eyes and hand over mouth"
				],
				u: "1fae2",
				a: "14"
			},
			{
				n: [
					"eye",
					"shy",
					"face",
					"hide",
					"peek",
					"peep",
					"stare",
					"hiding",
					"scared",
					"peeking",
					"embarrass",
					"captivated",
					"face with peeking eye"
				],
				u: "1fae3",
				a: "14"
			},
			{
				n: [
					"shh",
					"face",
					"quiet",
					"shush",
					"shushing",
					"shushing face"
				],
				u: "1f92b",
				a: "5"
			},
			{
				n: [
					"hmm",
					"chin",
					"face",
					"ponder",
					"consider",
					"thinking",
					"pondering",
					"wondering",
					"thinking face"
				],
				u: "1f914",
				a: "1"
			},
			{
				n: [
					"ok",
					"sir",
					"yes",
					"face",
					"good",
					"luck",
					"ma’am",
					"salute",
					"troops",
					"respect",
					"saluting",
					"saluting face"
				],
				u: "1fae1",
				a: "14"
			},
			{
				n: [
					"zip",
					"face",
					"keep",
					"shut",
					"mouth",
					"quiet",
					"secret",
					"zipper",
					"zipper mouth",
					"zipper mouth face"
				],
				u: "1f910",
				a: "1"
			},
			{
				n: [
					"hmm",
					"face",
					"mild",
					"what",
					"emoji",
					"raised",
					"eyebrow",
					"skeptic",
					"distrust",
					"surprise",
					"disbelief",
					"skeptical",
					"skepticism",
					"disapproval",
					"face with raised eyebrow"
				],
				u: "1f928",
				a: "5"
			},
			{
				n: [
					"oh",
					"meh",
					"face",
					"fine",
					"blank",
					"shade",
					"awkward",
					"deadpan",
					"jealous",
					"neutral",
					"unhappy",
					"straight",
					"unamused",
					"whatever",
					"unimpressed",
					"neutral face",
					"expressionless"
				],
				u: "1f610",
				a: "0.7"
			},
			{
				n: [
					"oh",
					"uh",
					"meh",
					"not",
					"omg",
					"dead",
					"face",
					"fine",
					"awkward",
					"jealous",
					"unhappy",
					"straight",
					"whatever",
					"unimpressed",
					"inexpressive",
					"expressionless",
					"expressionless face"
				],
				u: "1f611",
				a: "1"
			},
			{
				n: [
					"face",
					"mute",
					"blank",
					"mouth",
					"quiet",
					"secret",
					"silent",
					"awkward",
					"silence",
					"mouthless",
					"speechless",
					"expressionless",
					"face without mouth"
				],
				u: "1f636",
				a: "1"
			},
			{
				n: [
					"meh",
					"wtv",
					"face",
					"hide",
					"line",
					"dotted",
					"hidden",
					"whatever",
					"depressed",
					"disappear",
					"introvert",
					"invisible",
					"dotted line face"
				],
				u: "1fae5",
				a: "14"
			},
			{
				n: [
					"fog",
					"face",
					"head",
					"clouds",
					"absentminded",
					"face in clouds"
				],
				u: "1f636-200d-1f32b-fe0f",
				a: "13.1"
			},
			{
				n: [
					"sly",
					"boss",
					"face",
					"leer",
					"smug",
					"swag",
					"flirt",
					"homie",
					"shade",
					"slick",
					"smirk",
					"suave",
					"dapper",
					"kidding",
					"snicker",
					"suspicious",
					"smirking face"
				],
				u: "1f60f",
				a: "0.6"
			},
			{
				n: [
					"...",
					"jel",
					"smh",
					"ugh",
					"uhh",
					"face",
					"fine",
					"bored",
					"jelly",
					"weird",
					"pissed",
					"jealous",
					"unhappy",
					"unamused",
					"whatever",
					"unamused face"
				],
				u: "1f612",
				a: "0.6"
			},
			{
				n: [
					"ugh",
					"eyes",
					"face",
					"shade",
					"eyeroll",
					"rolling",
					"whatever",
					"face with rolling eyes"
				],
				u: "1f644",
				a: "1"
			},
			{
				n: [
					"awk",
					"face",
					"smile",
					"awkward",
					"dentist",
					"grimace",
					"smiling",
					"grinning",
					"grimacing",
					"grimacing face"
				],
				u: "1f62c",
				a: "1"
			},
			{
				n: [
					"blow",
					"face",
					"gasp",
					"sigh",
					"groan",
					"smoke",
					"exhale",
					"relief",
					"smiley",
					"blowing",
					"whisper",
					"whistle",
					"exhaling",
					"exhausted",
					"face exhaling"
				],
				u: "1f62e-200d-1f4a8",
				a: "13.1"
			},
			{
				n: [
					"lie",
					"face",
					"liar",
					"lying",
					"pinocchio",
					"lying face"
				],
				u: "1f925",
				a: "3"
			},
			{
				n: [
					"omg",
					"wow",
					"daze",
					"face",
					"whoa",
					"crazy",
					"panic",
					"shock",
					"shaking",
					"vibrate",
					"surprise",
					"earthquake",
					"shaking face"
				],
				u: "1fae8",
				a: "15"
			},
			{
				n: [
					"no",
					"head",
					"shake",
					"shaking",
					"horizontally",
					"head shaking horizontally"
				],
				u: "1f642-200d-2194-fe0f",
				a: "15.1"
			},
			{
				n: [
					"nod",
					"yes",
					"head",
					"shaking",
					"vertically",
					"head shaking vertically"
				],
				u: "1f642-200d-2195-fe0f",
				a: "15.1"
			},
			{
				n: [
					"zen",
					"calm",
					"face",
					"peace",
					"relief",
					"relieved",
					"relieved face"
				],
				u: "1f60c",
				a: "0.6"
			},
			{
				n: [
					"sad",
					"died",
					"face",
					"lost",
					"awful",
					"bored",
					"sucks",
					"losing",
					"pensive",
					"dejected",
					"pensive face",
					"disappointed"
				],
				u: "1f614",
				a: "0.6"
			},
			{
				n: [
					"sad",
					"face",
					"good",
					"night",
					"sleep",
					"tired",
					"crying",
					"sleepy",
					"sleeping",
					"sleepy face"
				],
				u: "1f62a",
				a: "0.6"
			},
			{
				n: [
					"face",
					"drooling",
					"drooling face"
				],
				u: "1f924",
				a: "3"
			},
			{
				n: [
					"bed",
					"nap",
					"zzz",
					"face",
					"good",
					"yawn",
					"night",
					"sleep",
					"tired",
					"bedtime",
					"sleeping",
					"whatever",
					"goodnight",
					"sleeping face"
				],
				u: "1f634",
				a: "1"
			},
			{
				n: [
					"bags",
					"eyes",
					"face",
					"late",
					"bored",
					"tired",
					"weary",
					"sleepy",
					"fatigued",
					"exhausted",
					"face with bags under eyes"
				],
				u: "1fae9",
				a: "16"
			},
			{
				n: [
					"dr",
					"cold",
					"face",
					"mask",
					"sick",
					"germs",
					"doctor",
					"dentist",
					"medical",
					"medicine",
					"dermatologist",
					"face with medical mask"
				],
				u: "1f637",
				a: "0.6"
			},
			{
				n: [
					"ill",
					"face",
					"sick",
					"thermometer",
					"face with thermometer"
				],
				u: "1f912",
				a: "1"
			},
			{
				n: [
					"face",
					"hurt",
					"ouch",
					"injury",
					"bandage",
					"head bandage",
					"face with head bandage"
				],
				u: "1f915",
				a: "1"
			},
			{
				n: [
					"face",
					"sick",
					"gross",
					"nasty",
					"vomit",
					"nauseated",
					"nauseated face"
				],
				u: "1f922",
				a: "3"
			},
			{
				n: [
					"ew",
					"up",
					"barf",
					"face",
					"puke",
					"sick",
					"spew",
					"gross",
					"throw",
					"vomit",
					"vomiting",
					"face vomiting"
				],
				u: "1f92e",
				a: "5"
			},
			{
				n: [
					"flu",
					"face",
					"sick",
					"fever",
					"sneeze",
					"sneezing",
					"gesundheit",
					"sneezing face"
				],
				u: "1f927",
				a: "3"
			},
			{
				n: [
					"hot",
					"face",
					"heat",
					"dying",
					"stroke",
					"tongue",
					"panting",
					"hot face",
					"feverish",
					"sweating",
					"red faced"
				],
				u: "1f975",
				a: "11"
			},
			{
				n: [
					"blue",
					"cold",
					"face",
					"teeth",
					"icicles",
					"subzero",
					"freezing",
					"cold face",
					"frostbite",
					"blue faced"
				],
				u: "1f976",
				a: "11"
			},
			{
				n: [
					"eyes",
					"face",
					"wavy",
					"dizzy",
					"drunk",
					"mouth",
					"tipsy",
					"woozy",
					"uneven",
					"woozy face",
					"intoxicated"
				],
				u: "1f974",
				a: "11"
			},
			{
				n: [
					"out",
					"dead",
					"eyes",
					"face",
					"sick",
					"dizzy",
					"feels",
					"tired",
					"knocked",
					"crossed out",
					"face with crossed out eyes"
				],
				u: "1f635",
				a: "0.6"
			},
			{
				n: [
					"omg",
					"eyes",
					"face",
					"whoa",
					"woah",
					"dizzy",
					"woozy",
					"smiley",
					"spiral",
					"trouble",
					"confused",
					"hypnotized",
					"face with spiral eyes"
				],
				u: "1f635-200d-1f4ab",
				a: "13.1"
			},
			{
				n: [
					"no",
					"way",
					"head",
					"mind",
					"blown",
					"explode",
					"shocked",
					"exploding",
					"mindblown",
					"exploding head"
				],
				u: "1f92f",
				a: "5"
			},
			{
				n: [
					"hat",
					"face",
					"cowboy",
					"cowgirl",
					"cowboy hat face"
				],
				u: "1f920",
				a: "3"
			},
			{
				n: [
					"hat",
					"bday",
					"face",
					"horn",
					"happy",
					"party",
					"hooray",
					"excited",
					"birthday",
					"partying",
					"celebrate",
					"celebration",
					"partying face"
				],
				u: "1f973",
				a: "11"
			},
			{
				n: [
					"spy",
					"face",
					"nose",
					"tash",
					"tache",
					"person",
					"eyebrow",
					"glasses",
					"disguise",
					"mustache",
					"incognito",
					"moustache",
					"disguised face"
				],
				u: "1f978",
				a: "13"
			},
			{
				n: [
					"bro",
					"rad",
					"win",
					"cool",
					"face",
					"slay",
					"swag",
					"beach",
					"smile",
					"style",
					"bright",
					"shades",
					"awesome",
					"relaxed",
					"chilling",
					"sunglasses",
					"smiling face with sunglasses"
				],
				u: "1f60e",
				a: "1"
			},
			{
				n: [
					"face",
					"geek",
					"nerd",
					"smart",
					"brainy",
					"clever",
					"expert",
					"gifted",
					"glasses",
					"nerd face",
					"intelligent"
				],
				u: "1f913",
				a: "1"
			},
			{
				n: [
					"face",
					"rich",
					"fancy",
					"classy",
					"stuffy",
					"monocle",
					"wealthy",
					"face with monocle"
				],
				u: "1f9d0",
				a: "5"
			},
			{
				n: [
					"hm",
					"meh",
					"not",
					"sad",
					"face",
					"sure",
					"dunno",
					"frown",
					"sorry",
					"confused",
					"befuddled",
					"confusing",
					"confused face"
				],
				u: "1f615",
				a: "1"
			},
			{
				n: [
					"meh",
					"wtv",
					"face",
					"doubt",
					"mouth",
					"unsure",
					"confused",
					"diagonal",
					"doubtful",
					"whatever",
					"confusion",
					"skeptical",
					"frustrated",
					"frustration",
					"disappointed",
					"face with diagonal mouth"
				],
				u: "1fae4",
				a: "14"
			},
			{
				n: [
					"sad",
					"face",
					"worry",
					"nerves",
					"stress",
					"anxious",
					"nervous",
					"worried",
					"stressed",
					"surprised",
					"butterflies",
					"worried face"
				],
				u: "1f61f",
				a: "1"
			},
			{
				n: [
					"sad",
					"face",
					"frown",
					"frowning",
					"slightly",
					"slightly frowning face"
				],
				u: "1f641",
				a: "1"
			},
			{
				n: [
					"sad",
					"face",
					"frown",
					"frowning",
					"frowning face"
				],
				u: "2639-fe0f",
				a: "0.7"
			},
			{
				n: [
					"omg",
					"wow",
					"you",
					"face",
					"open",
					"whoa",
					"mouth",
					"forgot",
					"unreal",
					"believe",
					"shocked",
					"sympathy",
					"surprised",
					"unbelievable",
					"face with open mouth"
				],
				u: "1f62e",
				a: "1"
			},
			{
				n: [
					"omg",
					"epic",
					"face",
					"whoa",
					"woah",
					"hushed",
					"stunned",
					"surprised",
					"hushed face"
				],
				u: "1f62f",
				a: "1"
			},
			{
				n: [
					"no",
					"omg",
					"way",
					"cost",
					"face",
					"shocked",
					"totally",
					"astonished",
					"astonished face"
				],
				u: "1f632",
				a: "0.6"
			},
			{
				n: [
					"hot",
					"wow",
					"dead",
					"face",
					"geez",
					"heat",
					"jeez",
					"what",
					"crazy",
					"dazed",
					"amazed",
					"awkward",
					"flushed",
					"disbelief",
					"impressed",
					"embarrassed",
					"flushed face"
				],
				u: "1f633",
				a: "0.6"
			},
			{
				n: [
					"big",
					"not",
					"sad",
					"why",
					"eyes",
					"face",
					"mercy",
					"puppy",
					"please",
					"pretty",
					"begging",
					"pleading",
					"pleading face"
				],
				u: "1f97a",
				a: "11"
			},
			{
				n: [
					"aww",
					"cry",
					"joy",
					"sad",
					"back",
					"face",
					"proud",
					"tears",
					"please",
					"resist",
					"holding",
					"feelings",
					"grateful",
					"gratitude",
					"admiration",
					"embarrassed",
					"face holding back tears"
				],
				u: "1f979",
				a: "14"
			},
			{
				n: [
					"wow",
					"face",
					"open",
					"what",
					"frown",
					"guard",
					"mouth",
					"scary",
					"caught",
					"scared",
					"frowning",
					"surprise",
					"frowning face with open mouth"
				],
				u: "1f626",
				a: "1"
			},
			{
				n: [
					"wow",
					"face",
					"what",
					"scary",
					"forgot",
					"scared",
					"unhappy",
					"stressed",
					"surprise",
					"anguished",
					"anguished face"
				],
				u: "1f627",
				a: "1"
			},
			{
				n: [
					"face",
					"fear",
					"blame",
					"afraid",
					"scared",
					"anxious",
					"fearful",
					"worried",
					"fearful face"
				],
				u: "1f628",
				a: "0.6"
			},
			{
				n: [
					"eek",
					"blue",
					"cold",
					"face",
					"open",
					"mouth",
					"sweat",
					"yikes",
					"rushed",
					"scared",
					"anxious",
					"nervous",
					"anxious face with sweat"
				],
				u: "1f630",
				a: "0.6"
			},
			{
				n: [
					"not",
					"sad",
					"call",
					"face",
					"time",
					"whew",
					"close",
					"sweat",
					"anxious",
					"relieved",
					"complicated",
					"disappointed",
					"sad but relieved face"
				],
				u: "1f625",
				a: "0.6"
			},
			{
				n: [
					"cry",
					"sad",
					"face",
					"miss",
					"tear",
					"awful",
					"feels",
					"crying",
					"triste",
					"unhappy",
					"crying face"
				],
				u: "1f622",
				a: "0.6"
			},
			{
				n: [
					"cry",
					"sad",
					"sob",
					"face",
					"tear",
					"tears",
					"crying",
					"loudly",
					"bawling",
					"unhappy",
					"loudly crying face"
				],
				u: "1f62d",
				a: "0.6"
			},
			{
				n: [
					"epic",
					"face",
					"fear",
					"woah",
					"munch",
					"scared",
					"scream",
					"fearful",
					"shocked",
					"screamer",
					"screaming",
					"surprised",
					"face screaming in fear"
				],
				u: "1f631",
				a: "0.6"
			},
			{
				n: [
					"mad",
					"sad",
					"face",
					"feels",
					"cringe",
					"annoyed",
					"confused",
					"confounded",
					"distraught",
					"frustrated",
					"confounded face"
				],
				u: "1f616",
				a: "0.6"
			},
			{
				n: [
					"face",
					"focus",
					"headache",
					"persevere",
					"concentrate",
					"persevering",
					"concentration",
					"persevering face"
				],
				u: "1f623",
				a: "0.6"
			},
			{
				n: [
					"sad",
					"face",
					"fail",
					"awful",
					"blame",
					"losing",
					"unhappy",
					"dejected",
					"disappointed",
					"disappointed face"
				],
				u: "1f61e",
				a: "0.6"
			},
			{
				n: [
					"sad",
					"cold",
					"face",
					"close",
					"feels",
					"sweat",
					"yikes",
					"scared",
					"nervous",
					"downcast",
					"headache",
					"downcast face with sweat"
				],
				u: "1f613",
				a: "0.6"
			},
			{
				n: [
					"mad",
					"sad",
					"face",
					"fail",
					"nooo",
					"feels",
					"tired",
					"weary",
					"crying",
					"hungry",
					"sleepy",
					"unhappy",
					"weary face"
				],
				u: "1f629",
				a: "0.6"
			},
			{
				n: [
					"nap",
					"sad",
					"cost",
					"face",
					"feels",
					"tired",
					"sneeze",
					"tired face"
				],
				u: "1f62b",
				a: "0.6"
			},
			{
				n: [
					"nap",
					"zzz",
					"face",
					"yawn",
					"bored",
					"night",
					"sleep",
					"tired",
					"sleepy",
					"bedtime",
					"yawning",
					"whatever",
					"goodnight",
					"yawning face"
				],
				u: "1f971",
				a: "12"
			},
			{
				n: [
					"mad",
					"won",
					"face",
					"fume",
					"fury",
					"nose",
					"anger",
					"angry",
					"feels",
					"steam",
					"fuming",
					"furious",
					"triumph",
					"unhappy",
					"face with steam from nose"
				],
				u: "1f624",
				a: "0.6"
			},
			{
				n: [
					"mad",
					"red",
					"face",
					"rage",
					"anger",
					"angry",
					"feels",
					"shade",
					"upset",
					"enraged",
					"pouting",
					"unhappy",
					"maddening",
					"enraged face"
				],
				u: "1f621",
				a: "0.6"
			},
			{
				n: [
					"mad",
					"face",
					"rage",
					"anger",
					"angry",
					"blame",
					"feels",
					"shade",
					"upset",
					"unhappy",
					"maddening",
					"angry face",
					"frustrated"
				],
				u: "1f620",
				a: "0.6"
			},
			{
				n: [
					"mad",
					"face",
					"mouth",
					"censor",
					"pissed",
					"cursing",
					"cussing",
					"symbols",
					"swearing",
					"face with symbols on mouth"
				],
				u: "1f92c",
				a: "5"
			},
			{
				n: [
					"evil",
					"face",
					"tale",
					"demon",
					"devil",
					"fairy",
					"horns",
					"shade",
					"smile",
					"purple",
					"fantasy",
					"smiling",
					"fairytale",
					"smiling face with horns"
				],
				u: "1f608",
				a: "1"
			},
			{
				n: [
					"imp",
					"evil",
					"face",
					"tale",
					"angry",
					"demon",
					"devil",
					"fairy",
					"horns",
					"shade",
					"purple",
					"fantasy",
					"fairytale",
					"mischievous",
					"angry face with horns"
				],
				u: "1f47f",
				a: "0.6"
			},
			{
				n: [
					"i’m",
					"body",
					"dead",
					"face",
					"lmao",
					"tale",
					"yolo",
					"skull",
					"death",
					"fairy",
					"monster",
					"fairytale"
				],
				u: "1f480",
				a: "0.6"
			},
			{
				n: [
					"bone",
					"dead",
					"face",
					"death",
					"skull",
					"monster",
					"crossbones",
					"skull and crossbones"
				],
				u: "2620-fe0f",
				a: "1"
			},
			{
				n: [
					"bs",
					"doo",
					"fml",
					"poo",
					"smh",
					"dung",
					"face",
					"pile",
					"poop",
					"turd",
					"comic",
					"stink",
					"smelly",
					"stinks",
					"stinky",
					"monster",
					"pile of poo"
				],
				u: "1f4a9",
				a: "0.6"
			},
			{
				n: [
					"face",
					"clown",
					"clown face"
				],
				u: "1f921",
				a: "3"
			},
			{
				n: [
					"ogre",
					"face",
					"mask",
					"tale",
					"devil",
					"fairy",
					"scary",
					"fantasy",
					"monster",
					"creature",
					"fairytale"
				],
				u: "1f479",
				a: "0.6"
			},
			{
				n: [
					"face",
					"mask",
					"mean",
					"tale",
					"angry",
					"fairy",
					"goblin",
					"fantasy",
					"monster",
					"creature",
					"fairytale"
				],
				u: "1f47a",
				a: "0.6"
			},
			{
				n: [
					"boo",
					"face",
					"tale",
					"ghost",
					"fairy",
					"scary",
					"silly",
					"excited",
					"fantasy",
					"monster",
					"creature",
					"haunting",
					"fairytale",
					"halloween"
				],
				u: "1f47b",
				a: "0.6"
			},
			{
				n: [
					"ufo",
					"face",
					"tale",
					"alien",
					"fairy",
					"space",
					"fantasy",
					"monster",
					"creature",
					"fairytale",
					"extraterrestrial"
				],
				u: "1f47d",
				a: "0.6"
			},
			{
				n: [
					"ufo",
					"face",
					"game",
					"tale",
					"alien",
					"fairy",
					"gamer",
					"games",
					"space",
					"fantasy",
					"monster",
					"creature",
					"fairytale",
					"pixelated",
					"alien monster",
					"extraterrestrial"
				],
				u: "1f47e",
				a: "0.6"
			},
			{
				n: [
					"face",
					"robot",
					"monster"
				],
				u: "1f916",
				a: "1"
			},
			{
				n: [
					"cat",
					"face",
					"open",
					"mouth",
					"smile",
					"animal",
					"smiling",
					"grinning",
					"grinning cat"
				],
				u: "1f63a",
				a: "0.6"
			},
			{
				n: [
					"cat",
					"eye",
					"eyes",
					"face",
					"grin",
					"smile",
					"animal",
					"smiling",
					"grinning",
					"grinning cat with smiling eyes"
				],
				u: "1f638",
				a: "0.6"
			},
			{
				n: [
					"cat",
					"joy",
					"lol",
					"face",
					"tear",
					"laugh",
					"tears",
					"animal",
					"laughing",
					"cat with tears of joy"
				],
				u: "1f639",
				a: "0.6"
			},
			{
				n: [
					"cat",
					"eye",
					"face",
					"love",
					"heart",
					"smile",
					"animal",
					"smiling",
					"heart eyes",
					"smiling cat with heart eyes"
				],
				u: "1f63b",
				a: "0.6"
			},
			{
				n: [
					"cat",
					"wry",
					"face",
					"smile",
					"animal",
					"ironic",
					"cat with wry smile"
				],
				u: "1f63c",
				a: "0.6"
			},
			{
				n: [
					"cat",
					"eye",
					"eyes",
					"face",
					"kiss",
					"animal",
					"closed",
					"kissing",
					"kissing cat"
				],
				u: "1f63d",
				a: "0.6"
			},
			{
				n: [
					"oh",
					"cat",
					"face",
					"weary",
					"animal",
					"weary cat",
					"surprised"
				],
				u: "1f640",
				a: "0.6"
			},
			{
				n: [
					"cat",
					"cry",
					"sad",
					"face",
					"tear",
					"animal",
					"crying",
					"crying cat"
				],
				u: "1f63f",
				a: "0.6"
			},
			{
				n: [
					"cat",
					"face",
					"animal",
					"pouting",
					"pouting cat"
				],
				u: "1f63e",
				a: "0.6"
			},
			{
				n: [
					"no",
					"omg",
					"smh",
					"evil",
					"face",
					"hide",
					"watch",
					"forgot",
					"monkey",
					"scared",
					"secret",
					"gesture",
					"forbidden",
					"prohibited",
					"embarrassed",
					"see no evil monkey"
				],
				u: "1f648",
				a: "0.6"
			},
			{
				n: [
					"no",
					"not",
					"shh",
					"tmi",
					"ears",
					"evil",
					"face",
					"hear",
					"animal",
					"listen",
					"monkey",
					"secret",
					"gesture",
					"forbidden",
					"prohibited",
					"hear no evil monkey"
				],
				u: "1f649",
				a: "0.6"
			},
			{
				n: [
					"no",
					"not",
					"evil",
					"face",
					"oops",
					"quiet",
					"speak",
					"animal",
					"monkey",
					"secret",
					"gesture",
					"stealth",
					"forbidden",
					"prohibited",
					"speak no evil monkey"
				],
				u: "1f64a",
				a: "0.6"
			},
			{
				n: [
					"love",
					"mail",
					"heart",
					"letter",
					"romance",
					"valentine",
					"love letter"
				],
				u: "1f48c",
				a: "0.6"
			},
			{
				n: [
					"143",
					"ily",
					"date",
					"love",
					"arrow",
					"cupid",
					"heart",
					"adorbs",
					"emotion",
					"romance",
					"valentine",
					"heart with arrow"
				],
				u: "1f498",
				a: "0.6"
			},
			{
				n: [
					"143",
					"ily",
					"xoxo",
					"heart",
					"kisses",
					"ribbon",
					"emotion",
					"valentine",
					"anniversary",
					"heart with ribbon"
				],
				u: "1f49d",
				a: "0.6"
			},
			{
				n: [
					"143",
					"ily",
					"good",
					"xoxo",
					"heart",
					"night",
					"kisses",
					"emotion",
					"excited",
					"morning",
					"sparkle",
					"sparkling",
					"sparkling heart"
				],
				u: "1f496",
				a: "0.6"
			},
			{
				n: [
					"143",
					"ily",
					"muah",
					"xoxo",
					"heart",
					"pulse",
					"kisses",
					"emotion",
					"excited",
					"growing",
					"nervous",
					"heartpulse",
					"growing heart"
				],
				u: "1f497",
				a: "0.6"
			},
			{
				n: [
					"143",
					"ily",
					"love",
					"heart",
					"pulse",
					"cardio",
					"beating",
					"emotion",
					"heartbeat",
					"pulsating",
					"beating heart"
				],
				u: "1f493",
				a: "0.6"
			},
			{
				n: [
					"143",
					"heart",
					"adorbs",
					"hearts",
					"emotion",
					"revolving",
					"anniversary",
					"revolving hearts"
				],
				u: "1f49e",
				a: "0.6"
			},
			{
				n: [
					"143",
					"ily",
					"two",
					"date",
					"love",
					"xoxo",
					"heart",
					"dating",
					"hearts",
					"kisses",
					"loving",
					"emotion",
					"two hearts",
					"anniversary"
				],
				u: "1f495",
				a: "0.6"
			},
			{
				n: [
					"143",
					"heart",
					"white",
					"hearth",
					"purple",
					"emotion",
					"decoration",
					"heart decoration"
				],
				u: "1f49f",
				a: "0.6"
			},
			{
				n: [
					"mark",
					"heart",
					"heavy",
					"exclamation",
					"punctuation",
					"heart exclamation"
				],
				u: "2763-fe0f",
				a: "1"
			},
			{
				n: [
					"sad",
					"break",
					"heart",
					"broken",
					"lonely",
					"crushed",
					"emotion",
					"heartbroken",
					"broken heart"
				],
				u: "1f494",
				a: "0.6"
			},
			{
				n: [
					"burn",
					"fire",
					"love",
					"lust",
					"heart",
					"sacred",
					"heart on fire"
				],
				u: "2764-fe0f-200d-1f525",
				a: "13.1"
			},
			{
				n: [
					"well",
					"heart",
					"mending",
					"healthier",
					"improving",
					"recovering",
					"recuperating",
					"mending heart"
				],
				u: "2764-fe0f-200d-1fa79",
				a: "13.1"
			},
			{
				n: [
					"red",
					"love",
					"heart",
					"emotion",
					"red heart"
				],
				u: "2764-fe0f",
				a: "0.6"
			},
			{
				n: [
					"143",
					"ily",
					"cute",
					"like",
					"love",
					"pink",
					"heart",
					"sweet",
					"emotion",
					"special",
					"adorable",
					"pink heart"
				],
				u: "1fa77",
				a: "15"
			},
			{
				n: [
					"143",
					"heart",
					"orange",
					"orange heart"
				],
				u: "1f9e1",
				a: "5"
			},
			{
				n: [
					"143",
					"ily",
					"love",
					"heart",
					"yellow",
					"cardiac",
					"emotion",
					"yellow heart"
				],
				u: "1f49b",
				a: "0.6"
			},
			{
				n: [
					"143",
					"ily",
					"love",
					"green",
					"heart",
					"emotion",
					"romantic",
					"green heart"
				],
				u: "1f49a",
				a: "0.6"
			},
			{
				n: [
					"143",
					"ily",
					"blue",
					"love",
					"heart",
					"emotion",
					"romance",
					"blue heart"
				],
				u: "1f499",
				a: "0.6"
			},
			{
				n: [
					"143",
					"ily",
					"sky",
					"blue",
					"cute",
					"cyan",
					"like",
					"love",
					"teal",
					"heart",
					"light",
					"emotion",
					"special",
					"light blue heart"
				],
				u: "1fa75",
				a: "15"
			},
			{
				n: [
					"143",
					"ily",
					"love",
					"heart",
					"purple",
					"bestest",
					"emotion",
					"purple heart"
				],
				u: "1f49c",
				a: "0.6"
			},
			{
				n: [
					"143",
					"brown",
					"heart",
					"brown heart"
				],
				u: "1f90e",
				a: "12"
			},
			{
				n: [
					"evil",
					"black",
					"heart",
					"wicked",
					"black heart"
				],
				u: "1f5a4",
				a: "3"
			},
			{
				n: [
					"143",
					"ily",
					"gray",
					"grey",
					"love",
					"heart",
					"slate",
					"silver",
					"emotion",
					"special",
					"grey heart"
				],
				u: "1fa76",
				a: "15"
			},
			{
				n: [
					"143",
					"heart",
					"white",
					"white heart"
				],
				u: "1f90d",
				a: "12"
			},
			{
				n: [
					"kiss",
					"lips",
					"mark",
					"sexy",
					"heart",
					"dating",
					"emotion",
					"kissing",
					"romance",
					"kiss mark"
				],
				u: "1f48b",
				a: "0.6"
			},
			{
				n: [
					"a+",
					"100",
					"yup",
					"full",
					"keep",
					"true",
					"agree",
					"fleek",
					"point",
					"score",
					"truth",
					"clearly",
					"hundred",
					"perfect",
					"faithful",
					"definitely",
					"hundred points"
				],
				u: "1f4af",
				a: "0.6"
			},
			{
				n: [
					"mad",
					"anger",
					"angry",
					"comic",
					"upset",
					"symbol",
					"anger symbol"
				],
				u: "1f4a2",
				a: "0.6"
			},
			{
				n: [
					"bomb",
					"boom",
					"comic",
					"collide",
					"explode",
					"collision"
				],
				u: "1f4a5",
				a: "0.6"
			},
			{
				n: [
					"star",
					"dizzy",
					"comic",
					"stars",
					"shining",
					"shooting"
				],
				u: "1f4ab",
				a: "0.6"
			},
			{
				n: [
					"wet",
					"drip",
					"work",
					"comic",
					"drops",
					"sweat",
					"water",
					"squirt",
					"droplet",
					"workout",
					"droplets",
					"splashing",
					"sweat droplets"
				],
				u: "1f4a6",
				a: "0.6"
			},
			{
				n: [
					"go",
					"away",
					"dash",
					"fart",
					"fast",
					"gone",
					"cloud",
					"comic",
					"gotta",
					"smoke",
					"dashing",
					"running",
					"dashing away"
				],
				u: "1f4a8",
				a: "0.6"
			},
			{
				n: ["hole"],
				u: "1f573-fe0f",
				a: "0.7"
			},
			{
				n: [
					"sms",
					"talk",
					"text",
					"comic",
					"bubble",
					"dialog",
					"speech",
					"typing",
					"balloon",
					"message",
					"speech balloon"
				],
				u: "1f4ac",
				a: "0.6"
			},
			{
				n: [
					"eye",
					"bubble",
					"speech",
					"balloon",
					"witness",
					"eye in speech bubble"
				],
				u: "1f441-fe0f-200d-1f5e8-fe0f",
				a: "2"
			},
			{
				n: [
					"left",
					"bubble",
					"dialog",
					"speech",
					"balloon",
					"left speech bubble"
				],
				u: "1f5e8-fe0f",
				a: "2"
			},
			{
				n: [
					"mad",
					"anger",
					"angry",
					"right",
					"bubble",
					"balloon",
					"right anger bubble"
				],
				u: "1f5ef-fe0f",
				a: "0.7"
			},
			{
				n: [
					"idea",
					"cloud",
					"comic",
					"dream",
					"think",
					"bubble",
					"invent",
					"wonder",
					"balloon",
					"cartoon",
					"realize",
					"daydream",
					"thoughts",
					"decisions",
					"invention",
					"thought balloon"
				],
				u: "1f4ad",
				a: "1"
			},
			{
				n: [
					"ZZZ",
					"zzz",
					"good",
					"comic",
					"night",
					"sleep",
					"tired",
					"sleepy",
					"sleeping",
					"goodnight"
				],
				u: "1f4a4",
				a: "0.6"
			},
			{
				n: [
					"hi",
					"yo",
					"bye",
					"cya",
					"g2g",
					"gtg",
					"hey",
					"you",
					"hand",
					"ttfn",
					"ttyl",
					"wave",
					"hello",
					"later",
					"outtie",
					"greetings",
					"waving hand"
				],
				u: "1f44b",
				v: [
					"1f44b-1f3fb",
					"1f44b-1f3fc",
					"1f44b-1f3fd",
					"1f44b-1f3fe",
					"1f44b-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"back",
					"hand",
					"raised",
					"backhand",
					"raised back of hand"
				],
				u: "1f91a",
				v: [
					"1f91a-1f3fb",
					"1f91a-1f3fc",
					"1f91a-1f3fd",
					"1f91a-1f3fe",
					"1f91a-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"hand",
					"stop",
					"finger",
					"raised",
					"fingers",
					"splayed",
					"hand with fingers splayed"
				],
				u: "1f590-fe0f",
				v: [
					"1f590-1f3fb",
					"1f590-1f3fc",
					"1f590-1f3fd",
					"1f590-1f3fe",
					"1f590-1f3ff"
				],
				a: "0.7"
			},
			{
				n: [
					"5",
					"five",
					"hand",
					"high",
					"stop",
					"raised",
					"raised hand"
				],
				u: "270b",
				v: [
					"270b-1f3fb",
					"270b-1f3fc",
					"270b-1f3fd",
					"270b-1f3fe",
					"270b-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"hand",
					"hands",
					"finger",
					"salute",
					"vulcan",
					"vulcan salute"
				],
				u: "1f596",
				v: [
					"1f596-1f3fb",
					"1f596-1f3fc",
					"1f596-1f3fd",
					"1f596-1f3fe",
					"1f596-1f3ff"
				],
				a: "1"
			},
			{
				n: [
					"hand",
					"hold",
					"reach",
					"right",
					"shake",
					"handshake",
					"rightward",
					"rightwards",
					"rightwards hand"
				],
				u: "1faf1",
				v: [
					"1faf1-1f3fb",
					"1faf1-1f3fc",
					"1faf1-1f3fd",
					"1faf1-1f3fe",
					"1faf1-1f3ff"
				],
				a: "14"
			},
			{
				n: [
					"hand",
					"hold",
					"left",
					"reach",
					"shake",
					"leftward",
					"handshake",
					"leftwards",
					"leftwards hand"
				],
				u: "1faf2",
				v: [
					"1faf2-1f3fb",
					"1faf2-1f3fc",
					"1faf2-1f3fd",
					"1faf2-1f3fe",
					"1faf2-1f3ff"
				],
				a: "14"
			},
			{
				n: [
					"up",
					"down",
					"drop",
					"hand",
					"palm",
					"pick",
					"shoo",
					"dismiss",
					"dropped",
					"palm down hand"
				],
				u: "1faf3",
				v: [
					"1faf3-1f3fb",
					"1faf3-1f3fc",
					"1faf3-1f3fd",
					"1faf3-1f3fe",
					"1faf3-1f3ff"
				],
				a: "14"
			},
			{
				n: [
					"me",
					"come",
					"hand",
					"hold",
					"know",
					"lift",
					"palm",
					"tell",
					"catch",
					"offer",
					"beckon",
					"palm up hand"
				],
				u: "1faf4",
				v: [
					"1faf4-1f3fb",
					"1faf4-1f3fc",
					"1faf4-1f3fd",
					"1faf4-1f3fe",
					"1faf4-1f3ff"
				],
				a: "14"
			},
			{
				n: [
					"five",
					"halt",
					"hand",
					"high",
					"hold",
					"push",
					"slap",
					"stop",
					"wait",
					"block",
					"pause",
					"refuse",
					"pushing",
					"leftward",
					"leftwards",
					"leftwards pushing hand"
				],
				u: "1faf7",
				v: [
					"1faf7-1f3fb",
					"1faf7-1f3fc",
					"1faf7-1f3fd",
					"1faf7-1f3fe",
					"1faf7-1f3ff"
				],
				a: "15"
			},
			{
				n: [
					"five",
					"halt",
					"hand",
					"high",
					"hold",
					"push",
					"slap",
					"stop",
					"wait",
					"block",
					"pause",
					"refuse",
					"pushing",
					"rightward",
					"rightwards",
					"rightwards pushing hand"
				],
				u: "1faf8",
				v: [
					"1faf8-1f3fb",
					"1faf8-1f3fc",
					"1faf8-1f3fd",
					"1faf8-1f3fe",
					"1faf8-1f3ff"
				],
				a: "15"
			},
			{
				n: [
					"ok",
					"bet",
					"got",
					"rad",
					"dope",
					"hand",
					"okay",
					"sure",
					"fleek",
					"fosho",
					"legit",
					"pinch",
					"sweet",
					"three",
					"gotcha",
					"OK hand",
					"awesome"
				],
				u: "1f44c",
				v: [
					"1f44c-1f3fb",
					"1f44c-1f3fc",
					"1f44c-1f3fd",
					"1f44c-1f3fe",
					"1f44c-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"huh",
					"ugh",
					"zip",
					"hand",
					"hold",
					"what",
					"relax",
					"fingers",
					"gesture",
					"pinched",
					"patience",
					"sarcastic",
					"interrogation",
					"pinched fingers"
				],
				u: "1f90c",
				v: [
					"1f90c-1f3fb",
					"1f90c-1f3fc",
					"1f90c-1f3fd",
					"1f90c-1f3fe",
					"1f90c-1f3ff"
				],
				a: "13"
			},
			{
				n: [
					"bit",
					"hand",
					"sort",
					"small",
					"amount",
					"little",
					"fingers",
					"pinching",
					"pinching hand"
				],
				u: "1f90f",
				v: [
					"1f90f-1f3fb",
					"1f90f-1f3fc",
					"1f90f-1f3fd",
					"1f90f-1f3fe",
					"1f90f-1f3ff"
				],
				a: "12"
			},
			{
				n: [
					"v",
					"hand",
					"peace",
					"victory",
					"victory hand"
				],
				u: "270c-fe0f",
				v: [
					"270c-1f3fb",
					"270c-1f3fc",
					"270c-1f3fd",
					"270c-1f3fe",
					"270c-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"hand",
					"luck",
					"cross",
					"finger",
					"crossed",
					"fingers",
					"crossed fingers"
				],
				u: "1f91e",
				v: [
					"1f91e-1f3fb",
					"1f91e-1f3fc",
					"1f91e-1f3fd",
					"1f91e-1f3fe",
					"1f91e-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"<3",
					"hand",
					"love",
					"snap",
					"heart",
					"index",
					"money",
					"thumb",
					"finger",
					"crossed",
					"expensive",
					"hand with index finger and thumb crossed"
				],
				u: "1faf0",
				v: [
					"1faf0-1f3fb",
					"1faf0-1f3fc",
					"1faf0-1f3fd",
					"1faf0-1f3fe",
					"1faf0-1f3ff"
				],
				a: "14"
			},
			{
				n: [
					"ily",
					"you",
					"hand",
					"love",
					"three",
					"fingers",
					"gesture",
					"love you",
					"love you gesture"
				],
				u: "1f91f",
				v: [
					"1f91f-1f3fb",
					"1f91f-1f3fc",
					"1f91f-1f3fd",
					"1f91f-1f3fe",
					"1f91f-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"hand",
					"sign",
					"horns",
					"finger",
					"rock on",
					"sign of the horns"
				],
				u: "1f918",
				v: [
					"1f918-1f3fb",
					"1f918-1f3fc",
					"1f918-1f3fd",
					"1f918-1f3fe",
					"1f918-1f3ff"
				],
				a: "1"
			},
			{
				n: [
					"me",
					"call",
					"hand",
					"hang",
					"loose",
					"shaka",
					"call me hand"
				],
				u: "1f919",
				v: [
					"1f919-1f3fb",
					"1f919-1f3fc",
					"1f919-1f3fd",
					"1f919-1f3fe",
					"1f919-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"hand",
					"left",
					"index",
					"point",
					"finger",
					"backhand",
					"pointing",
					"backhand index pointing left"
				],
				u: "1f448",
				v: [
					"1f448-1f3fb",
					"1f448-1f3fc",
					"1f448-1f3fd",
					"1f448-1f3fe",
					"1f448-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"hand",
					"index",
					"point",
					"right",
					"finger",
					"backhand",
					"pointing",
					"backhand index pointing right"
				],
				u: "1f449",
				v: [
					"1f449-1f3fb",
					"1f449-1f3fc",
					"1f449-1f3fd",
					"1f449-1f3fe",
					"1f449-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"up",
					"hand",
					"index",
					"point",
					"finger",
					"backhand",
					"pointing",
					"backhand index pointing up"
				],
				u: "1f446",
				v: [
					"1f446-1f3fb",
					"1f446-1f3fc",
					"1f446-1f3fd",
					"1f446-1f3fe",
					"1f446-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"hand",
					"finger",
					"middle",
					"middle finger"
				],
				u: "1f595",
				v: [
					"1f595-1f3fb",
					"1f595-1f3fc",
					"1f595-1f3fd",
					"1f595-1f3fe",
					"1f595-1f3ff"
				],
				a: "1"
			},
			{
				n: [
					"down",
					"hand",
					"index",
					"point",
					"finger",
					"backhand",
					"pointing",
					"backhand index pointing down"
				],
				u: "1f447",
				v: [
					"1f447-1f3fb",
					"1f447-1f3fc",
					"1f447-1f3fd",
					"1f447-1f3fe",
					"1f447-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"up",
					"hand",
					"this",
					"index",
					"point",
					"finger",
					"pointing",
					"index pointing up"
				],
				u: "261d-fe0f",
				v: [
					"261d-1f3fb",
					"261d-1f3fc",
					"261d-1f3fd",
					"261d-1f3fe",
					"261d-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"at",
					"you",
					"hand",
					"poke",
					"index",
					"finger",
					"viewer",
					"pointing",
					"index pointing at the viewer"
				],
				u: "1faf5",
				v: [
					"1faf5-1f3fb",
					"1faf5-1f3fc",
					"1faf5-1f3fd",
					"1faf5-1f3fe",
					"1faf5-1f3ff"
				],
				a: "14"
			},
			{
				n: [
					"+1",
					"up",
					"yes",
					"good",
					"hand",
					"like",
					"thumb",
					"thumbs up"
				],
				u: "1f44d",
				v: [
					"1f44d-1f3fb",
					"1f44d-1f3fc",
					"1f44d-1f3fd",
					"1f44d-1f3fe",
					"1f44d-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					" 1",
					"no",
					"bad",
					"down",
					"good",
					"hand",
					"nope",
					"thumb",
					"thumbs",
					"dislike",
					"thumbs down"
				],
				u: "1f44e",
				v: [
					"1f44e-1f3fb",
					"1f44e-1f3fc",
					"1f44e-1f3fd",
					"1f44e-1f3fe",
					"1f44e-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"fist",
					"hand",
					"punch",
					"raised",
					"clenched",
					"solidarity",
					"raised fist"
				],
				u: "270a",
				v: [
					"270a-1f3fb",
					"270a-1f3fc",
					"270a-1f3fd",
					"270a-1f3fe",
					"270a-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"bro",
					"boom",
					"bruh",
					"bump",
					"fist",
					"hand",
					"rock",
					"ttyl",
					"agree",
					"pound",
					"punch",
					"correct",
					"knuckle",
					"clenched",
					"oncoming",
					"absolutely",
					"oncoming fist"
				],
				u: "1f44a",
				v: [
					"1f44a-1f3fb",
					"1f44a-1f3fc",
					"1f44a-1f3fd",
					"1f44a-1f3fe",
					"1f44a-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"fist",
					"leftwards",
					"left facing",
					"left facing fist"
				],
				u: "1f91b",
				v: [
					"1f91b-1f3fb",
					"1f91b-1f3fc",
					"1f91b-1f3fd",
					"1f91b-1f3fe",
					"1f91b-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"fist",
					"rightwards",
					"right facing",
					"right facing fist"
				],
				u: "1f91c",
				v: [
					"1f91c-1f3fb",
					"1f91c-1f3fc",
					"1f91c-1f3fd",
					"1f91c-1f3fe",
					"1f91c-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"job",
					"yay",
					"clap",
					"good",
					"hand",
					"nice",
					"well",
					"great",
					"homie",
					"prayed",
					"awesome",
					"excited",
					"applause",
					"approval",
					"congrats",
					"clapping hands",
					"congratulations"
				],
				u: "1f44f",
				v: [
					"1f44f-1f3fb",
					"1f44f-1f3fc",
					"1f44f-1f3fd",
					"1f44f-1f3fe",
					"1f44f-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"hand",
					"hands",
					"hooray",
					"praise",
					"raised",
					"gesture",
					"raising",
					"celebration",
					"raising hands"
				],
				u: "1f64c",
				v: [
					"1f64c-1f3fb",
					"1f64c-1f3fc",
					"1f64c-1f3fd",
					"1f64c-1f3fe",
					"1f64c-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"<3",
					"you",
					"love",
					"hands",
					"heart",
					"heart hands"
				],
				u: "1faf6",
				v: [
					"1faf6-1f3fb",
					"1faf6-1f3fc",
					"1faf6-1f3fd",
					"1faf6-1f3fe",
					"1faf6-1f3ff"
				],
				a: "14"
			},
			{
				n: [
					"hug",
					"hand",
					"jazz",
					"open",
					"hands",
					"swerve",
					"open hands"
				],
				u: "1f450",
				v: [
					"1f450-1f3fb",
					"1f450-1f3fc",
					"1f450-1f3fd",
					"1f450-1f3fe",
					"1f450-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"up",
					"dua",
					"pray",
					"wish",
					"hands",
					"palms",
					"cupped",
					"prayer",
					"together",
					"palms up together"
				],
				u: "1f932",
				v: [
					"1f932-1f3fb",
					"1f932-1f3fc",
					"1f932-1f3fd",
					"1f932-1f3fe",
					"1f932-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"deal",
					"hand",
					"shake",
					"meeting",
					"handshake",
					"agreement"
				],
				u: "1f91d",
				v: [
					"1f91d-1f3fb",
					"1f91d-1f3fc",
					"1f91d-1f3fd",
					"1f91d-1f3fe",
					"1f91d-1f3ff",
					"1faf1-1f3fb-200d-1faf2-1f3fc",
					"1faf1-1f3fb-200d-1faf2-1f3fd",
					"1faf1-1f3fb-200d-1faf2-1f3fe",
					"1faf1-1f3fb-200d-1faf2-1f3ff",
					"1faf1-1f3fc-200d-1faf2-1f3fb",
					"1faf1-1f3fc-200d-1faf2-1f3fd",
					"1faf1-1f3fc-200d-1faf2-1f3fe",
					"1faf1-1f3fc-200d-1faf2-1f3ff",
					"1faf1-1f3fd-200d-1faf2-1f3fb",
					"1faf1-1f3fd-200d-1faf2-1f3fc",
					"1faf1-1f3fd-200d-1faf2-1f3fe",
					"1faf1-1f3fd-200d-1faf2-1f3ff",
					"1faf1-1f3fe-200d-1faf2-1f3fb",
					"1faf1-1f3fe-200d-1faf2-1f3fc",
					"1faf1-1f3fe-200d-1faf2-1f3fd",
					"1faf1-1f3fe-200d-1faf2-1f3ff",
					"1faf1-1f3ff-200d-1faf2-1f3fb",
					"1faf1-1f3ff-200d-1faf2-1f3fc",
					"1faf1-1f3ff-200d-1faf2-1f3fd",
					"1faf1-1f3ff-200d-1faf2-1f3fe"
				],
				a: "3"
			},
			{
				n: [
					"ask",
					"beg",
					"bow",
					"thx",
					"cmon",
					"five",
					"hand",
					"high",
					"pray",
					"folded",
					"please",
					"thanks",
					"blessed",
					"gesture",
					"appreciate",
					"folded hands"
				],
				u: "1f64f",
				v: [
					"1f64f-1f3fb",
					"1f64f-1f3fc",
					"1f64f-1f3fd",
					"1f64f-1f3fe",
					"1f64f-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"hand",
					"write",
					"writing",
					"writing hand"
				],
				u: "270d-fe0f",
				v: [
					"270d-1f3fb",
					"270d-1f3fc",
					"270d-1f3fd",
					"270d-1f3fe",
					"270d-1f3ff"
				],
				a: "0.7"
			},
			{
				n: [
					"care",
					"done",
					"nail",
					"bored",
					"makeup",
					"polish",
					"manicure",
					"whatever",
					"cosmetics",
					"nail polish"
				],
				u: "1f485",
				v: [
					"1f485-1f3fb",
					"1f485-1f3fc",
					"1f485-1f3fd",
					"1f485-1f3fe",
					"1f485-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"phone",
					"selfie",
					"camera"
				],
				u: "1f933",
				v: [
					"1f933-1f3fb",
					"1f933-1f3fc",
					"1f933-1f3fd",
					"1f933-1f3fe",
					"1f933-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"arm",
					"bro",
					"gym",
					"flex",
					"beast",
					"bench",
					"curls",
					"gains",
					"press",
					"biceps",
					"jacked",
					"muscle",
					"ripped",
					"strong",
					"weightlift",
					"bodybuilder",
					"flexed biceps"
				],
				u: "1f4aa",
				v: [
					"1f4aa-1f3fb",
					"1f4aa-1f3fc",
					"1f4aa-1f3fd",
					"1f4aa-1f3fe",
					"1f4aa-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"arm",
					"mechanical",
					"prosthetic",
					"accessibility",
					"mechanical arm"
				],
				u: "1f9be",
				a: "12"
			},
			{
				n: [
					"leg",
					"mechanical",
					"prosthetic",
					"accessibility",
					"mechanical leg"
				],
				u: "1f9bf",
				a: "12"
			},
			{
				n: [
					"leg",
					"bent",
					"foot",
					"kick",
					"knee",
					"limb"
				],
				u: "1f9b5",
				v: [
					"1f9b5-1f3fb",
					"1f9b5-1f3fc",
					"1f9b5-1f3fd",
					"1f9b5-1f3fe",
					"1f9b5-1f3ff"
				],
				a: "11"
			},
			{
				n: [
					"foot",
					"feet",
					"kick",
					"ankle",
					"stomp"
				],
				u: "1f9b6",
				v: [
					"1f9b6-1f3fb",
					"1f9b6-1f3fc",
					"1f9b6-1f3fd",
					"1f9b6-1f3fe",
					"1f9b6-1f3ff"
				],
				a: "11"
			},
			{
				n: [
					"ear",
					"body",
					"ears",
					"hear",
					"sound",
					"listen",
					"hearing",
					"listening"
				],
				u: "1f442",
				v: [
					"1f442-1f3fb",
					"1f442-1f3fc",
					"1f442-1f3fd",
					"1f442-1f3fe",
					"1f442-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"aid",
					"ear",
					"hard",
					"hearing",
					"accessibility",
					"ear with hearing aid"
				],
				u: "1f9bb",
				v: [
					"1f9bb-1f3fb",
					"1f9bb-1f3fc",
					"1f9bb-1f3fd",
					"1f9bb-1f3fe",
					"1f9bb-1f3ff"
				],
				a: "12"
			},
			{
				n: [
					"nose",
					"body",
					"odor",
					"noses",
					"nosey",
					"smell",
					"smells"
				],
				u: "1f443",
				v: [
					"1f443-1f3fb",
					"1f443-1f3fc",
					"1f443-1f3fd",
					"1f443-1f3fe",
					"1f443-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"brain",
					"smart",
					"intelligent"
				],
				u: "1f9e0",
				a: "5"
			},
			{
				n: [
					"red",
					"beat",
					"real",
					"heart",
					"organ",
					"pulse",
					"heartbeat",
					"anatomical",
					"cardiology",
					"anatomical heart"
				],
				u: "1fac0",
				a: "13"
			},
			{
				n: [
					"lung",
					"lungs",
					"organ",
					"breath",
					"breathe",
					"exhalation",
					"inhalation",
					"respiration"
				],
				u: "1fac1",
				a: "13"
			},
			{
				n: [
					"tooth",
					"teeth",
					"white",
					"pearly",
					"dentist"
				],
				u: "1f9b7",
				a: "11"
			},
			{
				n: [
					"dog",
					"bone",
					"bones",
					"skeleton",
					"wishbone"
				],
				u: "1f9b4",
				a: "11"
			},
			{
				n: [
					"eye",
					"omg",
					"see",
					"eyes",
					"body",
					"face",
					"look",
					"peep",
					"googly",
					"seeing",
					"looking"
				],
				u: "1f440",
				a: "0.6"
			},
			{
				n: [
					"1",
					"eye",
					"one",
					"body"
				],
				u: "1f441-fe0f",
				a: "0.7"
			},
			{
				n: [
					"body",
					"lick",
					"slurp",
					"tongue"
				],
				u: "1f445",
				a: "0.6"
			},
			{
				n: [
					"body",
					"kiss",
					"lips",
					"mouth",
					"beauty",
					"kissing",
					"lipstick"
				],
				u: "1f444",
				a: "0.6"
			},
			{
				n: [
					"lip",
					"bite",
					"fear",
					"kiss",
					"sexy",
					"flirt",
					"worry",
					"biting",
					"anxious",
					"nervous",
					"worried",
					"flirting",
					"lipstick",
					"biting lip",
					"uncomfortable"
				],
				u: "1fae6",
				a: "14"
			},
			{
				n: [
					"goo",
					"baby",
					"young",
					"babies",
					"infant",
					"newborn",
					"children",
					"pregnant"
				],
				u: "1f476",
				v: [
					"1f476-1f3fb",
					"1f476-1f3fc",
					"1f476-1f3fd",
					"1f476-1f3fe",
					"1f476-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"kid",
					"child",
					"young",
					"younger",
					"grandchild",
					"bright eyed"
				],
				u: "1f9d2",
				v: [
					"1f9d2-1f3fb",
					"1f9d2-1f3fc",
					"1f9d2-1f3fd",
					"1f9d2-1f3fe",
					"1f9d2-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"boy",
					"kid",
					"son",
					"child",
					"young",
					"younger",
					"grandson",
					"bright eyed"
				],
				u: "1f466",
				v: [
					"1f466-1f3fb",
					"1f466-1f3fc",
					"1f466-1f3fd",
					"1f466-1f3fe",
					"1f466-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"kid",
					"girl",
					"child",
					"virgo",
					"young",
					"zodiac",
					"younger",
					"daughter",
					"bright eyed",
					"granddaughter"
				],
				u: "1f467",
				v: [
					"1f467-1f3fb",
					"1f467-1f3fc",
					"1f467-1f3fd",
					"1f467-1f3fe",
					"1f467-1f3ff"
				],
				a: "0.6"
			},
			{
				n: ["adult", "person"],
				u: "1f9d1",
				v: [
					"1f9d1-1f3fb",
					"1f9d1-1f3fc",
					"1f9d1-1f3fd",
					"1f9d1-1f3fe",
					"1f9d1-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"blond",
					"human",
					"person",
					"blond haired",
					"person: blond hair"
				],
				u: "1f471",
				v: [
					"1f471-1f3fb",
					"1f471-1f3fc",
					"1f471-1f3fd",
					"1f471-1f3fe",
					"1f471-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"bro",
					"adult"
				],
				u: "1f468",
				v: [
					"1f468-1f3fb",
					"1f468-1f3fc",
					"1f468-1f3fd",
					"1f468-1f3fe",
					"1f468-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"beard",
					"person",
					"bearded",
					"whiskers",
					"person: beard"
				],
				u: "1f9d4",
				v: [
					"1f9d4-1f3fb",
					"1f9d4-1f3fc",
					"1f9d4-1f3fd",
					"1f9d4-1f3fe",
					"1f9d4-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"man",
					"beard",
					"bearded",
					"whiskers",
					"man: beard"
				],
				u: "1f9d4-200d-2642-fe0f",
				v: [
					"1f9d4-1f3fb-200d-2642-fe0f",
					"1f9d4-1f3fc-200d-2642-fe0f",
					"1f9d4-1f3fd-200d-2642-fe0f",
					"1f9d4-1f3fe-200d-2642-fe0f",
					"1f9d4-1f3ff-200d-2642-fe0f"
				],
				a: "13.1"
			},
			{
				n: [
					"beard",
					"woman",
					"bearded",
					"whiskers",
					"woman: beard"
				],
				u: "1f9d4-200d-2640-fe0f",
				v: [
					"1f9d4-1f3fb-200d-2640-fe0f",
					"1f9d4-1f3fc-200d-2640-fe0f",
					"1f9d4-1f3fd-200d-2640-fe0f",
					"1f9d4-1f3fe-200d-2640-fe0f",
					"1f9d4-1f3ff-200d-2640-fe0f"
				],
				a: "13.1"
			},
			{
				n: [
					"bro",
					"man",
					"adult",
					"red hair",
					"man: red hair"
				],
				u: "1f468-200d-1f9b0",
				v: [
					"1f468-1f3fb-200d-1f9b0",
					"1f468-1f3fc-200d-1f9b0",
					"1f468-1f3fd-200d-1f9b0",
					"1f468-1f3fe-200d-1f9b0",
					"1f468-1f3ff-200d-1f9b0"
				],
				a: "11"
			},
			{
				n: [
					"bro",
					"man",
					"adult",
					"curly hair",
					"man: curly hair"
				],
				u: "1f468-200d-1f9b1",
				v: [
					"1f468-1f3fb-200d-1f9b1",
					"1f468-1f3fc-200d-1f9b1",
					"1f468-1f3fd-200d-1f9b1",
					"1f468-1f3fe-200d-1f9b1",
					"1f468-1f3ff-200d-1f9b1"
				],
				a: "11"
			},
			{
				n: [
					"bro",
					"man",
					"adult",
					"white hair",
					"man: white hair"
				],
				u: "1f468-200d-1f9b3",
				v: [
					"1f468-1f3fb-200d-1f9b3",
					"1f468-1f3fc-200d-1f9b3",
					"1f468-1f3fd-200d-1f9b3",
					"1f468-1f3fe-200d-1f9b3",
					"1f468-1f3ff-200d-1f9b3"
				],
				a: "11"
			},
			{
				n: [
					"bro",
					"man",
					"bald",
					"adult",
					"man: bald"
				],
				u: "1f468-200d-1f9b2",
				v: [
					"1f468-1f3fb-200d-1f9b2",
					"1f468-1f3fc-200d-1f9b2",
					"1f468-1f3fd-200d-1f9b2",
					"1f468-1f3fe-200d-1f9b2",
					"1f468-1f3ff-200d-1f9b2"
				],
				a: "11"
			},
			{
				n: [
					"lady",
					"woman",
					"adult"
				],
				u: "1f469",
				v: [
					"1f469-1f3fb",
					"1f469-1f3fc",
					"1f469-1f3fd",
					"1f469-1f3fe",
					"1f469-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"lady",
					"adult",
					"woman",
					"red hair",
					"woman: red hair"
				],
				u: "1f469-200d-1f9b0",
				v: [
					"1f469-1f3fb-200d-1f9b0",
					"1f469-1f3fc-200d-1f9b0",
					"1f469-1f3fd-200d-1f9b0",
					"1f469-1f3fe-200d-1f9b0",
					"1f469-1f3ff-200d-1f9b0"
				],
				a: "11"
			},
			{
				n: [
					"adult",
					"person",
					"red hair",
					"person: red hair"
				],
				u: "1f9d1-200d-1f9b0",
				v: [
					"1f9d1-1f3fb-200d-1f9b0",
					"1f9d1-1f3fc-200d-1f9b0",
					"1f9d1-1f3fd-200d-1f9b0",
					"1f9d1-1f3fe-200d-1f9b0",
					"1f9d1-1f3ff-200d-1f9b0"
				],
				a: "12.1"
			},
			{
				n: [
					"lady",
					"adult",
					"woman",
					"curly hair",
					"woman: curly hair"
				],
				u: "1f469-200d-1f9b1",
				v: [
					"1f469-1f3fb-200d-1f9b1",
					"1f469-1f3fc-200d-1f9b1",
					"1f469-1f3fd-200d-1f9b1",
					"1f469-1f3fe-200d-1f9b1",
					"1f469-1f3ff-200d-1f9b1"
				],
				a: "11"
			},
			{
				n: [
					"adult",
					"person",
					"curly hair",
					"person: curly hair"
				],
				u: "1f9d1-200d-1f9b1",
				v: [
					"1f9d1-1f3fb-200d-1f9b1",
					"1f9d1-1f3fc-200d-1f9b1",
					"1f9d1-1f3fd-200d-1f9b1",
					"1f9d1-1f3fe-200d-1f9b1",
					"1f9d1-1f3ff-200d-1f9b1"
				],
				a: "12.1"
			},
			{
				n: [
					"lady",
					"adult",
					"woman",
					"white hair",
					"woman: white hair"
				],
				u: "1f469-200d-1f9b3",
				v: [
					"1f469-1f3fb-200d-1f9b3",
					"1f469-1f3fc-200d-1f9b3",
					"1f469-1f3fd-200d-1f9b3",
					"1f469-1f3fe-200d-1f9b3",
					"1f469-1f3ff-200d-1f9b3"
				],
				a: "11"
			},
			{
				n: [
					"adult",
					"person",
					"white hair",
					"person: white hair"
				],
				u: "1f9d1-200d-1f9b3",
				v: [
					"1f9d1-1f3fb-200d-1f9b3",
					"1f9d1-1f3fc-200d-1f9b3",
					"1f9d1-1f3fd-200d-1f9b3",
					"1f9d1-1f3fe-200d-1f9b3",
					"1f9d1-1f3ff-200d-1f9b3"
				],
				a: "12.1"
			},
			{
				n: [
					"bald",
					"lady",
					"adult",
					"woman",
					"woman: bald"
				],
				u: "1f469-200d-1f9b2",
				v: [
					"1f469-1f3fb-200d-1f9b2",
					"1f469-1f3fc-200d-1f9b2",
					"1f469-1f3fd-200d-1f9b2",
					"1f469-1f3fe-200d-1f9b2",
					"1f469-1f3ff-200d-1f9b2"
				],
				a: "11"
			},
			{
				n: [
					"bald",
					"adult",
					"person",
					"person: bald"
				],
				u: "1f9d1-200d-1f9b2",
				v: [
					"1f9d1-1f3fb-200d-1f9b2",
					"1f9d1-1f3fc-200d-1f9b2",
					"1f9d1-1f3fd-200d-1f9b2",
					"1f9d1-1f3fe-200d-1f9b2",
					"1f9d1-1f3ff-200d-1f9b2"
				],
				a: "12.1"
			},
			{
				n: [
					"hair",
					"blond",
					"woman",
					"blonde",
					"blond haired",
					"woman: blond hair"
				],
				u: "1f471-200d-2640-fe0f",
				v: [
					"1f471-1f3fb-200d-2640-fe0f",
					"1f471-1f3fc-200d-2640-fe0f",
					"1f471-1f3fd-200d-2640-fe0f",
					"1f471-1f3fe-200d-2640-fe0f",
					"1f471-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"man",
					"hair",
					"blond",
					"blond haired",
					"man: blond hair"
				],
				u: "1f471-200d-2642-fe0f",
				v: [
					"1f471-1f3fb-200d-2642-fe0f",
					"1f471-1f3fc-200d-2642-fe0f",
					"1f471-1f3fd-200d-2642-fe0f",
					"1f471-1f3fe-200d-2642-fe0f",
					"1f471-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"old",
					"wise",
					"adult",
					"person",
					"elderly",
					"grandparent",
					"older person"
				],
				u: "1f9d3",
				v: [
					"1f9d3-1f3fb",
					"1f9d3-1f3fc",
					"1f9d3-1f3fd",
					"1f9d3-1f3fe",
					"1f9d3-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"man",
					"old",
					"bald",
					"wise",
					"adult",
					"gramps",
					"old man",
					"elderly",
					"grandpa",
					"grandfather"
				],
				u: "1f474",
				v: [
					"1f474-1f3fb",
					"1f474-1f3fc",
					"1f474-1f3fd",
					"1f474-1f3fe",
					"1f474-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"old",
					"lady",
					"wise",
					"adult",
					"woman",
					"granny",
					"elderly",
					"grandma",
					"old woman",
					"grandmother"
				],
				u: "1f475",
				v: [
					"1f475-1f3fb",
					"1f475-1f3fc",
					"1f475-1f3fd",
					"1f475-1f3fe",
					"1f475-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"frown",
					"upset",
					"person",
					"annoyed",
					"gesture",
					"frowning",
					"disturbed",
					"irritated",
					"frustrated",
					"disgruntled",
					"disappointed",
					"person frowning"
				],
				u: "1f64d",
				v: [
					"1f64d-1f3fb",
					"1f64d-1f3fc",
					"1f64d-1f3fd",
					"1f64d-1f3fe",
					"1f64d-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"frown",
					"upset",
					"annoyed",
					"gesture",
					"frowning",
					"disturbed",
					"irritated",
					"frustrated",
					"disgruntled",
					"man frowning",
					"disappointed"
				],
				u: "1f64d-200d-2642-fe0f",
				v: [
					"1f64d-1f3fb-200d-2642-fe0f",
					"1f64d-1f3fc-200d-2642-fe0f",
					"1f64d-1f3fd-200d-2642-fe0f",
					"1f64d-1f3fe-200d-2642-fe0f",
					"1f64d-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"frown",
					"upset",
					"woman",
					"annoyed",
					"gesture",
					"frowning",
					"disturbed",
					"irritated",
					"frustrated",
					"disgruntled",
					"disappointed",
					"woman frowning"
				],
				u: "1f64d-200d-2640-fe0f",
				v: [
					"1f64d-1f3fb-200d-2640-fe0f",
					"1f64d-1f3fc-200d-2640-fe0f",
					"1f64d-1f3fd-200d-2640-fe0f",
					"1f64d-1f3fe-200d-2640-fe0f",
					"1f64d-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"sulk",
					"frown",
					"scowl",
					"upset",
					"whine",
					"person",
					"grimace",
					"pouting",
					"downtrodden",
					"disappointed",
					"person pouting"
				],
				u: "1f64e",
				v: [
					"1f64e-1f3fb",
					"1f64e-1f3fc",
					"1f64e-1f3fd",
					"1f64e-1f3fe",
					"1f64e-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"sulk",
					"frown",
					"scowl",
					"upset",
					"whine",
					"grimace",
					"pouting",
					"man pouting",
					"downtrodden",
					"disappointed"
				],
				u: "1f64e-200d-2642-fe0f",
				v: [
					"1f64e-1f3fb-200d-2642-fe0f",
					"1f64e-1f3fc-200d-2642-fe0f",
					"1f64e-1f3fd-200d-2642-fe0f",
					"1f64e-1f3fe-200d-2642-fe0f",
					"1f64e-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"sulk",
					"frown",
					"scowl",
					"upset",
					"whine",
					"woman",
					"grimace",
					"pouting",
					"downtrodden",
					"disappointed",
					"woman pouting"
				],
				u: "1f64e-200d-2640-fe0f",
				v: [
					"1f64e-1f3fb-200d-2640-fe0f",
					"1f64e-1f3fc-200d-2640-fe0f",
					"1f64e-1f3fd-200d-2640-fe0f",
					"1f64e-1f3fe-200d-2640-fe0f",
					"1f64e-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"no",
					"not",
					"hand",
					"person",
					"gesture",
					"prohibit",
					"forbidden",
					"person gesturing NO"
				],
				u: "1f645",
				v: [
					"1f645-1f3fb",
					"1f645-1f3fc",
					"1f645-1f3fd",
					"1f645-1f3fe",
					"1f645-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"no",
					"man",
					"not",
					"hand",
					"gesture",
					"prohibit",
					"forbidden",
					"man gesturing NO"
				],
				u: "1f645-200d-2642-fe0f",
				v: [
					"1f645-1f3fb-200d-2642-fe0f",
					"1f645-1f3fc-200d-2642-fe0f",
					"1f645-1f3fd-200d-2642-fe0f",
					"1f645-1f3fe-200d-2642-fe0f",
					"1f645-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"no",
					"not",
					"hand",
					"woman",
					"gesture",
					"prohibit",
					"forbidden",
					"woman gesturing NO"
				],
				u: "1f645-200d-2640-fe0f",
				v: [
					"1f645-1f3fb-200d-2640-fe0f",
					"1f645-1f3fc-200d-2640-fe0f",
					"1f645-1f3fd-200d-2640-fe0f",
					"1f645-1f3fe-200d-2640-fe0f",
					"1f645-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"ok",
					"omg",
					"hand",
					"person",
					"gesture",
					"exercise",
					"gesturing",
					"person gesturing OK"
				],
				u: "1f646",
				v: [
					"1f646-1f3fb",
					"1f646-1f3fc",
					"1f646-1f3fd",
					"1f646-1f3fe",
					"1f646-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"ok",
					"man",
					"omg",
					"hand",
					"gesture",
					"exercise",
					"gesturing",
					"man gesturing OK"
				],
				u: "1f646-200d-2642-fe0f",
				v: [
					"1f646-1f3fb-200d-2642-fe0f",
					"1f646-1f3fc-200d-2642-fe0f",
					"1f646-1f3fd-200d-2642-fe0f",
					"1f646-1f3fe-200d-2642-fe0f",
					"1f646-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"ok",
					"omg",
					"hand",
					"woman",
					"gesture",
					"exercise",
					"gesturing",
					"woman gesturing OK"
				],
				u: "1f646-200d-2640-fe0f",
				v: [
					"1f646-1f3fb-200d-2640-fe0f",
					"1f646-1f3fc-200d-2640-fe0f",
					"1f646-1f3fd-200d-2640-fe0f",
					"1f646-1f3fe-200d-2640-fe0f",
					"1f646-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"flip",
					"hand",
					"fetch",
					"flick",
					"sassy",
					"gossip",
					"person",
					"sarcasm",
					"tipping",
					"whatever",
					"sarcastic",
					"seriously",
					"person tipping hand"
				],
				u: "1f481",
				v: [
					"1f481-1f3fb",
					"1f481-1f3fc",
					"1f481-1f3fd",
					"1f481-1f3fe",
					"1f481-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"flip",
					"hand",
					"fetch",
					"flick",
					"sassy",
					"gossip",
					"sarcasm",
					"tipping",
					"whatever",
					"sarcastic",
					"seriously",
					"man tipping hand"
				],
				u: "1f481-200d-2642-fe0f",
				v: [
					"1f481-1f3fb-200d-2642-fe0f",
					"1f481-1f3fc-200d-2642-fe0f",
					"1f481-1f3fd-200d-2642-fe0f",
					"1f481-1f3fe-200d-2642-fe0f",
					"1f481-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"flip",
					"hand",
					"fetch",
					"flick",
					"sassy",
					"woman",
					"gossip",
					"sarcasm",
					"tipping",
					"whatever",
					"sarcastic",
					"seriously",
					"woman tipping hand"
				],
				u: "1f481-200d-2640-fe0f",
				v: [
					"1f481-1f3fb-200d-2640-fe0f",
					"1f481-1f3fc-200d-2640-fe0f",
					"1f481-1f3fd-200d-2640-fe0f",
					"1f481-1f3fe-200d-2640-fe0f",
					"1f481-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"me",
					"hand",
					"here",
					"know",
					"pick",
					"raise",
					"person",
					"gesture",
					"raising",
					"question",
					"person raising hand"
				],
				u: "1f64b",
				v: [
					"1f64b-1f3fb",
					"1f64b-1f3fc",
					"1f64b-1f3fd",
					"1f64b-1f3fe",
					"1f64b-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"me",
					"man",
					"hand",
					"here",
					"know",
					"pick",
					"raise",
					"gesture",
					"raising",
					"question",
					"man raising hand"
				],
				u: "1f64b-200d-2642-fe0f",
				v: [
					"1f64b-1f3fb-200d-2642-fe0f",
					"1f64b-1f3fc-200d-2642-fe0f",
					"1f64b-1f3fd-200d-2642-fe0f",
					"1f64b-1f3fe-200d-2642-fe0f",
					"1f64b-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"me",
					"hand",
					"here",
					"know",
					"pick",
					"raise",
					"woman",
					"gesture",
					"raising",
					"question",
					"woman raising hand"
				],
				u: "1f64b-200d-2640-fe0f",
				v: [
					"1f64b-1f3fb-200d-2640-fe0f",
					"1f64b-1f3fc-200d-2640-fe0f",
					"1f64b-1f3fd-200d-2640-fe0f",
					"1f64b-1f3fe-200d-2640-fe0f",
					"1f64b-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"ear",
					"deaf",
					"hear",
					"person",
					"gesture",
					"deaf person",
					"accessibility"
				],
				u: "1f9cf",
				v: [
					"1f9cf-1f3fb",
					"1f9cf-1f3fc",
					"1f9cf-1f3fd",
					"1f9cf-1f3fe",
					"1f9cf-1f3ff"
				],
				a: "12"
			},
			{
				n: [
					"ear",
					"man",
					"deaf",
					"hear",
					"gesture",
					"deaf man",
					"accessibility"
				],
				u: "1f9cf-200d-2642-fe0f",
				v: [
					"1f9cf-1f3fb-200d-2642-fe0f",
					"1f9cf-1f3fc-200d-2642-fe0f",
					"1f9cf-1f3fd-200d-2642-fe0f",
					"1f9cf-1f3fe-200d-2642-fe0f",
					"1f9cf-1f3ff-200d-2642-fe0f"
				],
				a: "12"
			},
			{
				n: [
					"ear",
					"deaf",
					"hear",
					"woman",
					"gesture",
					"deaf woman",
					"accessibility"
				],
				u: "1f9cf-200d-2640-fe0f",
				v: [
					"1f9cf-1f3fb-200d-2640-fe0f",
					"1f9cf-1f3fc-200d-2640-fe0f",
					"1f9cf-1f3fd-200d-2640-fe0f",
					"1f9cf-1f3fe-200d-2640-fe0f",
					"1f9cf-1f3ff-200d-2640-fe0f"
				],
				a: "12"
			},
			{
				n: [
					"ask",
					"beg",
					"bow",
					"pity",
					"favor",
					"sorry",
					"bowing",
					"person",
					"regret",
					"apology",
					"forgive",
					"gesture",
					"meditate",
					"meditation",
					"person bowing"
				],
				u: "1f647",
				v: [
					"1f647-1f3fb",
					"1f647-1f3fc",
					"1f647-1f3fd",
					"1f647-1f3fe",
					"1f647-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"ask",
					"beg",
					"bow",
					"man",
					"pity",
					"favor",
					"sorry",
					"bowing",
					"regret",
					"apology",
					"forgive",
					"gesture",
					"meditate",
					"man bowing",
					"meditation"
				],
				u: "1f647-200d-2642-fe0f",
				v: [
					"1f647-1f3fb-200d-2642-fe0f",
					"1f647-1f3fc-200d-2642-fe0f",
					"1f647-1f3fd-200d-2642-fe0f",
					"1f647-1f3fe-200d-2642-fe0f",
					"1f647-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"ask",
					"beg",
					"bow",
					"pity",
					"favor",
					"sorry",
					"woman",
					"bowing",
					"regret",
					"apology",
					"forgive",
					"gesture",
					"meditate",
					"meditation",
					"woman bowing"
				],
				u: "1f647-200d-2640-fe0f",
				v: [
					"1f647-1f3fb-200d-2640-fe0f",
					"1f647-1f3fc-200d-2640-fe0f",
					"1f647-1f3fd-200d-2640-fe0f",
					"1f647-1f3fe-200d-2640-fe0f",
					"1f647-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"no",
					"oh",
					"not",
					"omg",
					"smh",
					"again",
					"shock",
					"person",
					"bewilder",
					"facepalm",
					"disbelief",
					"exasperation",
					"person facepalming"
				],
				u: "1f926",
				v: [
					"1f926-1f3fb",
					"1f926-1f3fc",
					"1f926-1f3fd",
					"1f926-1f3fe",
					"1f926-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"no",
					"oh",
					"man",
					"not",
					"omg",
					"smh",
					"again",
					"shock",
					"bewilder",
					"facepalm",
					"disbelief",
					"exasperation",
					"man facepalming"
				],
				u: "1f926-200d-2642-fe0f",
				v: [
					"1f926-1f3fb-200d-2642-fe0f",
					"1f926-1f3fc-200d-2642-fe0f",
					"1f926-1f3fd-200d-2642-fe0f",
					"1f926-1f3fe-200d-2642-fe0f",
					"1f926-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"no",
					"oh",
					"not",
					"omg",
					"smh",
					"again",
					"shock",
					"woman",
					"bewilder",
					"facepalm",
					"disbelief",
					"exasperation",
					"woman facepalming"
				],
				u: "1f926-200d-2640-fe0f",
				v: [
					"1f926-1f3fb-200d-2640-fe0f",
					"1f926-1f3fc-200d-2640-fe0f",
					"1f926-1f3fd-200d-2640-fe0f",
					"1f926-1f3fe-200d-2640-fe0f",
					"1f926-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"idk",
					"who",
					"doubt",
					"dunno",
					"guess",
					"knows",
					"maybe",
					"shrug",
					"person",
					"whatever",
					"ignorance",
					"shrugging",
					"indifference",
					"person shrugging"
				],
				u: "1f937",
				v: [
					"1f937-1f3fb",
					"1f937-1f3fc",
					"1f937-1f3fd",
					"1f937-1f3fe",
					"1f937-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"idk",
					"man",
					"who",
					"doubt",
					"dunno",
					"guess",
					"knows",
					"maybe",
					"shrug",
					"whatever",
					"ignorance",
					"shrugging",
					"indifference",
					"man shrugging"
				],
				u: "1f937-200d-2642-fe0f",
				v: [
					"1f937-1f3fb-200d-2642-fe0f",
					"1f937-1f3fc-200d-2642-fe0f",
					"1f937-1f3fd-200d-2642-fe0f",
					"1f937-1f3fe-200d-2642-fe0f",
					"1f937-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"idk",
					"who",
					"doubt",
					"dunno",
					"guess",
					"knows",
					"maybe",
					"shrug",
					"woman",
					"whatever",
					"ignorance",
					"shrugging",
					"indifference",
					"woman shrugging"
				],
				u: "1f937-200d-2640-fe0f",
				v: [
					"1f937-1f3fb-200d-2640-fe0f",
					"1f937-1f3fc-200d-2640-fe0f",
					"1f937-1f3fd-200d-2640-fe0f",
					"1f937-1f3fe-200d-2640-fe0f",
					"1f937-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"nurse",
					"doctor",
					"health",
					"worker",
					"therapist",
					"healthcare",
					"health worker"
				],
				u: "1f9d1-200d-2695-fe0f",
				v: [
					"1f9d1-1f3fb-200d-2695-fe0f",
					"1f9d1-1f3fc-200d-2695-fe0f",
					"1f9d1-1f3fd-200d-2695-fe0f",
					"1f9d1-1f3fe-200d-2695-fe0f",
					"1f9d1-1f3ff-200d-2695-fe0f"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"nurse",
					"doctor",
					"health",
					"worker",
					"therapist",
					"healthcare",
					"man health worker"
				],
				u: "1f468-200d-2695-fe0f",
				v: [
					"1f468-1f3fb-200d-2695-fe0f",
					"1f468-1f3fc-200d-2695-fe0f",
					"1f468-1f3fd-200d-2695-fe0f",
					"1f468-1f3fe-200d-2695-fe0f",
					"1f468-1f3ff-200d-2695-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"nurse",
					"woman",
					"doctor",
					"health",
					"worker",
					"therapist",
					"healthcare",
					"woman health worker"
				],
				u: "1f469-200d-2695-fe0f",
				v: [
					"1f469-1f3fb-200d-2695-fe0f",
					"1f469-1f3fc-200d-2695-fe0f",
					"1f469-1f3fd-200d-2695-fe0f",
					"1f469-1f3fe-200d-2695-fe0f",
					"1f469-1f3ff-200d-2695-fe0f"
				],
				a: "4"
			},
			{
				n: ["student", "graduate"],
				u: "1f9d1-200d-1f393",
				v: [
					"1f9d1-1f3fb-200d-1f393",
					"1f9d1-1f3fc-200d-1f393",
					"1f9d1-1f3fd-200d-1f393",
					"1f9d1-1f3fe-200d-1f393",
					"1f9d1-1f3ff-200d-1f393"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"student",
					"graduate",
					"man student"
				],
				u: "1f468-200d-1f393",
				v: [
					"1f468-1f3fb-200d-1f393",
					"1f468-1f3fc-200d-1f393",
					"1f468-1f3fd-200d-1f393",
					"1f468-1f3fe-200d-1f393",
					"1f468-1f3ff-200d-1f393"
				],
				a: "4"
			},
			{
				n: [
					"woman",
					"student",
					"graduate",
					"woman student"
				],
				u: "1f469-200d-1f393",
				v: [
					"1f469-1f3fb-200d-1f393",
					"1f469-1f3fc-200d-1f393",
					"1f469-1f3fd-200d-1f393",
					"1f469-1f3fe-200d-1f393",
					"1f469-1f3ff-200d-1f393"
				],
				a: "4"
			},
			{
				n: [
					"teacher",
					"lecturer",
					"professor",
					"instructor"
				],
				u: "1f9d1-200d-1f3eb",
				v: [
					"1f9d1-1f3fb-200d-1f3eb",
					"1f9d1-1f3fc-200d-1f3eb",
					"1f9d1-1f3fd-200d-1f3eb",
					"1f9d1-1f3fe-200d-1f3eb",
					"1f9d1-1f3ff-200d-1f3eb"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"teacher",
					"lecturer",
					"professor",
					"instructor",
					"man teacher"
				],
				u: "1f468-200d-1f3eb",
				v: [
					"1f468-1f3fb-200d-1f3eb",
					"1f468-1f3fc-200d-1f3eb",
					"1f468-1f3fd-200d-1f3eb",
					"1f468-1f3fe-200d-1f3eb",
					"1f468-1f3ff-200d-1f3eb"
				],
				a: "4"
			},
			{
				n: [
					"woman",
					"teacher",
					"lecturer",
					"professor",
					"instructor",
					"woman teacher"
				],
				u: "1f469-200d-1f3eb",
				v: [
					"1f469-1f3fb-200d-1f3eb",
					"1f469-1f3fc-200d-1f3eb",
					"1f469-1f3fd-200d-1f3eb",
					"1f469-1f3fe-200d-1f3eb",
					"1f469-1f3ff-200d-1f3eb"
				],
				a: "4"
			},
			{
				n: [
					"law",
					"judge",
					"scales",
					"justice"
				],
				u: "1f9d1-200d-2696-fe0f",
				v: [
					"1f9d1-1f3fb-200d-2696-fe0f",
					"1f9d1-1f3fc-200d-2696-fe0f",
					"1f9d1-1f3fd-200d-2696-fe0f",
					"1f9d1-1f3fe-200d-2696-fe0f",
					"1f9d1-1f3ff-200d-2696-fe0f"
				],
				a: "12.1"
			},
			{
				n: [
					"law",
					"man",
					"judge",
					"scales",
					"justice",
					"man judge"
				],
				u: "1f468-200d-2696-fe0f",
				v: [
					"1f468-1f3fb-200d-2696-fe0f",
					"1f468-1f3fc-200d-2696-fe0f",
					"1f468-1f3fd-200d-2696-fe0f",
					"1f468-1f3fe-200d-2696-fe0f",
					"1f468-1f3ff-200d-2696-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"law",
					"judge",
					"woman",
					"scales",
					"justice",
					"woman judge"
				],
				u: "1f469-200d-2696-fe0f",
				v: [
					"1f469-1f3fb-200d-2696-fe0f",
					"1f469-1f3fc-200d-2696-fe0f",
					"1f469-1f3fd-200d-2696-fe0f",
					"1f469-1f3fe-200d-2696-fe0f",
					"1f469-1f3ff-200d-2696-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"farmer",
					"rancher",
					"gardener"
				],
				u: "1f9d1-200d-1f33e",
				v: [
					"1f9d1-1f3fb-200d-1f33e",
					"1f9d1-1f3fc-200d-1f33e",
					"1f9d1-1f3fd-200d-1f33e",
					"1f9d1-1f3fe-200d-1f33e",
					"1f9d1-1f3ff-200d-1f33e"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"farmer",
					"rancher",
					"gardener",
					"man farmer"
				],
				u: "1f468-200d-1f33e",
				v: [
					"1f468-1f3fb-200d-1f33e",
					"1f468-1f3fc-200d-1f33e",
					"1f468-1f3fd-200d-1f33e",
					"1f468-1f3fe-200d-1f33e",
					"1f468-1f3ff-200d-1f33e"
				],
				a: "4"
			},
			{
				n: [
					"woman",
					"farmer",
					"rancher",
					"gardener",
					"woman farmer"
				],
				u: "1f469-200d-1f33e",
				v: [
					"1f469-1f3fb-200d-1f33e",
					"1f469-1f3fc-200d-1f33e",
					"1f469-1f3fd-200d-1f33e",
					"1f469-1f3fe-200d-1f33e",
					"1f469-1f3ff-200d-1f33e"
				],
				a: "4"
			},
			{
				n: ["cook", "chef"],
				u: "1f9d1-200d-1f373",
				v: [
					"1f9d1-1f3fb-200d-1f373",
					"1f9d1-1f3fc-200d-1f373",
					"1f9d1-1f3fd-200d-1f373",
					"1f9d1-1f3fe-200d-1f373",
					"1f9d1-1f3ff-200d-1f373"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"chef",
					"cook",
					"man cook"
				],
				u: "1f468-200d-1f373",
				v: [
					"1f468-1f3fb-200d-1f373",
					"1f468-1f3fc-200d-1f373",
					"1f468-1f3fd-200d-1f373",
					"1f468-1f3fe-200d-1f373",
					"1f468-1f3ff-200d-1f373"
				],
				a: "4"
			},
			{
				n: [
					"chef",
					"cook",
					"woman",
					"woman cook"
				],
				u: "1f469-200d-1f373",
				v: [
					"1f469-1f3fb-200d-1f373",
					"1f469-1f3fc-200d-1f373",
					"1f469-1f3fd-200d-1f373",
					"1f469-1f3fe-200d-1f373",
					"1f469-1f3ff-200d-1f373"
				],
				a: "4"
			},
			{
				n: [
					"plumber",
					"mechanic",
					"electrician",
					"tradesperson"
				],
				u: "1f9d1-200d-1f527",
				v: [
					"1f9d1-1f3fb-200d-1f527",
					"1f9d1-1f3fc-200d-1f527",
					"1f9d1-1f3fd-200d-1f527",
					"1f9d1-1f3fe-200d-1f527",
					"1f9d1-1f3ff-200d-1f527"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"plumber",
					"mechanic",
					"electrician",
					"man mechanic",
					"tradesperson"
				],
				u: "1f468-200d-1f527",
				v: [
					"1f468-1f3fb-200d-1f527",
					"1f468-1f3fc-200d-1f527",
					"1f468-1f3fd-200d-1f527",
					"1f468-1f3fe-200d-1f527",
					"1f468-1f3ff-200d-1f527"
				],
				a: "4"
			},
			{
				n: [
					"woman",
					"plumber",
					"mechanic",
					"electrician",
					"tradesperson",
					"woman mechanic"
				],
				u: "1f469-200d-1f527",
				v: [
					"1f469-1f3fb-200d-1f527",
					"1f469-1f3fc-200d-1f527",
					"1f469-1f3fd-200d-1f527",
					"1f469-1f3fe-200d-1f527",
					"1f469-1f3ff-200d-1f527"
				],
				a: "4"
			},
			{
				n: [
					"worker",
					"factory",
					"assembly",
					"industrial",
					"factory worker"
				],
				u: "1f9d1-200d-1f3ed",
				v: [
					"1f9d1-1f3fb-200d-1f3ed",
					"1f9d1-1f3fc-200d-1f3ed",
					"1f9d1-1f3fd-200d-1f3ed",
					"1f9d1-1f3fe-200d-1f3ed",
					"1f9d1-1f3ff-200d-1f3ed"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"worker",
					"factory",
					"assembly",
					"industrial",
					"man factory worker"
				],
				u: "1f468-200d-1f3ed",
				v: [
					"1f468-1f3fb-200d-1f3ed",
					"1f468-1f3fc-200d-1f3ed",
					"1f468-1f3fd-200d-1f3ed",
					"1f468-1f3fe-200d-1f3ed",
					"1f468-1f3ff-200d-1f3ed"
				],
				a: "4"
			},
			{
				n: [
					"woman",
					"worker",
					"factory",
					"assembly",
					"industrial",
					"woman factory worker"
				],
				u: "1f469-200d-1f3ed",
				v: [
					"1f469-1f3fb-200d-1f3ed",
					"1f469-1f3fc-200d-1f3ed",
					"1f469-1f3fd-200d-1f3ed",
					"1f469-1f3fe-200d-1f3ed",
					"1f469-1f3ff-200d-1f3ed"
				],
				a: "4"
			},
			{
				n: [
					"office",
					"worker",
					"manager",
					"business",
					"architect",
					"white collar",
					"office worker"
				],
				u: "1f9d1-200d-1f4bc",
				v: [
					"1f9d1-1f3fb-200d-1f4bc",
					"1f9d1-1f3fc-200d-1f4bc",
					"1f9d1-1f3fd-200d-1f4bc",
					"1f9d1-1f3fe-200d-1f4bc",
					"1f9d1-1f3ff-200d-1f4bc"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"office",
					"worker",
					"manager",
					"business",
					"architect",
					"white collar",
					"man office worker"
				],
				u: "1f468-200d-1f4bc",
				v: [
					"1f468-1f3fb-200d-1f4bc",
					"1f468-1f3fc-200d-1f4bc",
					"1f468-1f3fd-200d-1f4bc",
					"1f468-1f3fe-200d-1f4bc",
					"1f468-1f3ff-200d-1f4bc"
				],
				a: "4"
			},
			{
				n: [
					"woman",
					"office",
					"worker",
					"manager",
					"business",
					"architect",
					"white collar",
					"woman office worker"
				],
				u: "1f469-200d-1f4bc",
				v: [
					"1f469-1f3fb-200d-1f4bc",
					"1f469-1f3fc-200d-1f4bc",
					"1f469-1f3fd-200d-1f4bc",
					"1f469-1f3fe-200d-1f4bc",
					"1f469-1f3ff-200d-1f4bc"
				],
				a: "4"
			},
			{
				n: [
					"chemist",
					"engineer",
					"scientist",
					"biologist",
					"physicist",
					"mathematician"
				],
				u: "1f9d1-200d-1f52c",
				v: [
					"1f9d1-1f3fb-200d-1f52c",
					"1f9d1-1f3fc-200d-1f52c",
					"1f9d1-1f3fd-200d-1f52c",
					"1f9d1-1f3fe-200d-1f52c",
					"1f9d1-1f3ff-200d-1f52c"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"chemist",
					"engineer",
					"biologist",
					"physicist",
					"scientist",
					"man scientist",
					"mathematician"
				],
				u: "1f468-200d-1f52c",
				v: [
					"1f468-1f3fb-200d-1f52c",
					"1f468-1f3fc-200d-1f52c",
					"1f468-1f3fd-200d-1f52c",
					"1f468-1f3fe-200d-1f52c",
					"1f468-1f3ff-200d-1f52c"
				],
				a: "4"
			},
			{
				n: [
					"woman",
					"chemist",
					"engineer",
					"biologist",
					"physicist",
					"scientist",
					"mathematician",
					"woman scientist"
				],
				u: "1f469-200d-1f52c",
				v: [
					"1f469-1f3fb-200d-1f52c",
					"1f469-1f3fc-200d-1f52c",
					"1f469-1f3fd-200d-1f52c",
					"1f469-1f3fe-200d-1f52c",
					"1f469-1f3ff-200d-1f52c"
				],
				a: "4"
			},
			{
				n: [
					"coder",
					"computer",
					"inventor",
					"software",
					"developer",
					"technologist"
				],
				u: "1f9d1-200d-1f4bb",
				v: [
					"1f9d1-1f3fb-200d-1f4bb",
					"1f9d1-1f3fc-200d-1f4bb",
					"1f9d1-1f3fd-200d-1f4bb",
					"1f9d1-1f3fe-200d-1f4bb",
					"1f9d1-1f3ff-200d-1f4bb"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"coder",
					"computer",
					"inventor",
					"software",
					"developer",
					"technologist",
					"man technologist"
				],
				u: "1f468-200d-1f4bb",
				v: [
					"1f468-1f3fb-200d-1f4bb",
					"1f468-1f3fc-200d-1f4bb",
					"1f468-1f3fd-200d-1f4bb",
					"1f468-1f3fe-200d-1f4bb",
					"1f468-1f3ff-200d-1f4bb"
				],
				a: "4"
			},
			{
				n: [
					"coder",
					"woman",
					"computer",
					"inventor",
					"software",
					"developer",
					"technologist",
					"woman technologist"
				],
				u: "1f469-200d-1f4bb",
				v: [
					"1f469-1f3fb-200d-1f4bb",
					"1f469-1f3fc-200d-1f4bb",
					"1f469-1f3fd-200d-1f4bb",
					"1f469-1f3fe-200d-1f4bb",
					"1f469-1f3ff-200d-1f4bb"
				],
				a: "4"
			},
			{
				n: [
					"rock",
					"star",
					"actor",
					"singer",
					"rockstar",
					"entertainer"
				],
				u: "1f9d1-200d-1f3a4",
				v: [
					"1f9d1-1f3fb-200d-1f3a4",
					"1f9d1-1f3fc-200d-1f3a4",
					"1f9d1-1f3fd-200d-1f3a4",
					"1f9d1-1f3fe-200d-1f3a4",
					"1f9d1-1f3ff-200d-1f3a4"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"rock",
					"star",
					"actor",
					"singer",
					"rockstar",
					"man singer",
					"entertainer"
				],
				u: "1f468-200d-1f3a4",
				v: [
					"1f468-1f3fb-200d-1f3a4",
					"1f468-1f3fc-200d-1f3a4",
					"1f468-1f3fd-200d-1f3a4",
					"1f468-1f3fe-200d-1f3a4",
					"1f468-1f3ff-200d-1f3a4"
				],
				a: "4"
			},
			{
				n: [
					"rock",
					"star",
					"actor",
					"woman",
					"singer",
					"rockstar",
					"entertainer",
					"woman singer"
				],
				u: "1f469-200d-1f3a4",
				v: [
					"1f469-1f3fb-200d-1f3a4",
					"1f469-1f3fc-200d-1f3a4",
					"1f469-1f3fd-200d-1f3a4",
					"1f469-1f3fe-200d-1f3a4",
					"1f469-1f3ff-200d-1f3a4"
				],
				a: "4"
			},
			{
				n: ["artist", "palette"],
				u: "1f9d1-200d-1f3a8",
				v: [
					"1f9d1-1f3fb-200d-1f3a8",
					"1f9d1-1f3fc-200d-1f3a8",
					"1f9d1-1f3fd-200d-1f3a8",
					"1f9d1-1f3fe-200d-1f3a8",
					"1f9d1-1f3ff-200d-1f3a8"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"artist",
					"palette",
					"man artist"
				],
				u: "1f468-200d-1f3a8",
				v: [
					"1f468-1f3fb-200d-1f3a8",
					"1f468-1f3fc-200d-1f3a8",
					"1f468-1f3fd-200d-1f3a8",
					"1f468-1f3fe-200d-1f3a8",
					"1f468-1f3ff-200d-1f3a8"
				],
				a: "4"
			},
			{
				n: [
					"woman",
					"artist",
					"palette",
					"woman artist"
				],
				u: "1f469-200d-1f3a8",
				v: [
					"1f469-1f3fb-200d-1f3a8",
					"1f469-1f3fc-200d-1f3a8",
					"1f469-1f3fd-200d-1f3a8",
					"1f469-1f3fe-200d-1f3a8",
					"1f469-1f3ff-200d-1f3a8"
				],
				a: "4"
			},
			{
				n: ["pilot", "plane"],
				u: "1f9d1-200d-2708-fe0f",
				v: [
					"1f9d1-1f3fb-200d-2708-fe0f",
					"1f9d1-1f3fc-200d-2708-fe0f",
					"1f9d1-1f3fd-200d-2708-fe0f",
					"1f9d1-1f3fe-200d-2708-fe0f",
					"1f9d1-1f3ff-200d-2708-fe0f"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"pilot",
					"plane",
					"man pilot"
				],
				u: "1f468-200d-2708-fe0f",
				v: [
					"1f468-1f3fb-200d-2708-fe0f",
					"1f468-1f3fc-200d-2708-fe0f",
					"1f468-1f3fd-200d-2708-fe0f",
					"1f468-1f3fe-200d-2708-fe0f",
					"1f468-1f3ff-200d-2708-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"pilot",
					"plane",
					"woman",
					"woman pilot"
				],
				u: "1f469-200d-2708-fe0f",
				v: [
					"1f469-1f3fb-200d-2708-fe0f",
					"1f469-1f3fc-200d-2708-fe0f",
					"1f469-1f3fd-200d-2708-fe0f",
					"1f469-1f3fe-200d-2708-fe0f",
					"1f469-1f3ff-200d-2708-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"space",
					"rocket",
					"astronaut"
				],
				u: "1f9d1-200d-1f680",
				v: [
					"1f9d1-1f3fb-200d-1f680",
					"1f9d1-1f3fc-200d-1f680",
					"1f9d1-1f3fd-200d-1f680",
					"1f9d1-1f3fe-200d-1f680",
					"1f9d1-1f3ff-200d-1f680"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"space",
					"rocket",
					"astronaut",
					"man astronaut"
				],
				u: "1f468-200d-1f680",
				v: [
					"1f468-1f3fb-200d-1f680",
					"1f468-1f3fc-200d-1f680",
					"1f468-1f3fd-200d-1f680",
					"1f468-1f3fe-200d-1f680",
					"1f468-1f3ff-200d-1f680"
				],
				a: "4"
			},
			{
				n: [
					"space",
					"woman",
					"rocket",
					"astronaut",
					"woman astronaut"
				],
				u: "1f469-200d-1f680",
				v: [
					"1f469-1f3fb-200d-1f680",
					"1f469-1f3fc-200d-1f680",
					"1f469-1f3fd-200d-1f680",
					"1f469-1f3fe-200d-1f680",
					"1f469-1f3ff-200d-1f680"
				],
				a: "4"
			},
			{
				n: [
					"fire",
					"firetruck",
					"firefighter"
				],
				u: "1f9d1-200d-1f692",
				v: [
					"1f9d1-1f3fb-200d-1f692",
					"1f9d1-1f3fc-200d-1f692",
					"1f9d1-1f3fd-200d-1f692",
					"1f9d1-1f3fe-200d-1f692",
					"1f9d1-1f3ff-200d-1f692"
				],
				a: "12.1"
			},
			{
				n: [
					"man",
					"fire",
					"firetruck",
					"firefighter",
					"man firefighter"
				],
				u: "1f468-200d-1f692",
				v: [
					"1f468-1f3fb-200d-1f692",
					"1f468-1f3fc-200d-1f692",
					"1f468-1f3fd-200d-1f692",
					"1f468-1f3fe-200d-1f692",
					"1f468-1f3ff-200d-1f692"
				],
				a: "4"
			},
			{
				n: [
					"fire",
					"woman",
					"firetruck",
					"firefighter",
					"woman firefighter"
				],
				u: "1f469-200d-1f692",
				v: [
					"1f469-1f3fb-200d-1f692",
					"1f469-1f3fc-200d-1f692",
					"1f469-1f3fd-200d-1f692",
					"1f469-1f3fe-200d-1f692",
					"1f469-1f3ff-200d-1f692"
				],
				a: "4"
			},
			{
				n: [
					"cop",
					"law",
					"over",
					"arrest",
					"police",
					"pulled",
					"officer",
					"citation",
					"apprehend",
					"undercover",
					"police officer"
				],
				u: "1f46e",
				v: [
					"1f46e-1f3fb",
					"1f46e-1f3fc",
					"1f46e-1f3fd",
					"1f46e-1f3fe",
					"1f46e-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"cop",
					"law",
					"man",
					"over",
					"arrest",
					"police",
					"pulled",
					"officer",
					"citation",
					"apprehend",
					"undercover",
					"man police officer"
				],
				u: "1f46e-200d-2642-fe0f",
				v: [
					"1f46e-1f3fb-200d-2642-fe0f",
					"1f46e-1f3fc-200d-2642-fe0f",
					"1f46e-1f3fd-200d-2642-fe0f",
					"1f46e-1f3fe-200d-2642-fe0f",
					"1f46e-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"cop",
					"law",
					"over",
					"woman",
					"arrest",
					"police",
					"pulled",
					"officer",
					"citation",
					"apprehend",
					"undercover",
					"woman police officer"
				],
				u: "1f46e-200d-2640-fe0f",
				v: [
					"1f46e-1f3fb-200d-2640-fe0f",
					"1f46e-1f3fc-200d-2640-fe0f",
					"1f46e-1f3fd-200d-2640-fe0f",
					"1f46e-1f3fe-200d-2640-fe0f",
					"1f46e-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"spy",
					"sleuth",
					"detective"
				],
				u: "1f575-fe0f",
				v: [
					"1f575-1f3fb",
					"1f575-1f3fc",
					"1f575-1f3fd",
					"1f575-1f3fe",
					"1f575-1f3ff"
				],
				a: "0.7"
			},
			{
				n: [
					"man",
					"spy",
					"sleuth",
					"detective",
					"man detective"
				],
				u: "1f575-fe0f-200d-2642-fe0f",
				v: [
					"1f575-1f3fb-200d-2642-fe0f",
					"1f575-1f3fc-200d-2642-fe0f",
					"1f575-1f3fd-200d-2642-fe0f",
					"1f575-1f3fe-200d-2642-fe0f",
					"1f575-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"spy",
					"woman",
					"sleuth",
					"detective",
					"woman detective"
				],
				u: "1f575-fe0f-200d-2640-fe0f",
				v: [
					"1f575-1f3fb-200d-2640-fe0f",
					"1f575-1f3fc-200d-2640-fe0f",
					"1f575-1f3fd-200d-2640-fe0f",
					"1f575-1f3fe-200d-2640-fe0f",
					"1f575-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"guard",
					"helmet",
					"london",
					"palace",
					"buckingham"
				],
				u: "1f482",
				v: [
					"1f482-1f3fb",
					"1f482-1f3fc",
					"1f482-1f3fd",
					"1f482-1f3fe",
					"1f482-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"guard",
					"helmet",
					"london",
					"palace",
					"man guard",
					"buckingham"
				],
				u: "1f482-200d-2642-fe0f",
				v: [
					"1f482-1f3fb-200d-2642-fe0f",
					"1f482-1f3fc-200d-2642-fe0f",
					"1f482-1f3fd-200d-2642-fe0f",
					"1f482-1f3fe-200d-2642-fe0f",
					"1f482-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"guard",
					"woman",
					"helmet",
					"london",
					"palace",
					"buckingham",
					"woman guard"
				],
				u: "1f482-200d-2640-fe0f",
				v: [
					"1f482-1f3fb-200d-2640-fe0f",
					"1f482-1f3fc-200d-2640-fe0f",
					"1f482-1f3fd-200d-2640-fe0f",
					"1f482-1f3fe-200d-2640-fe0f",
					"1f482-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"sly",
					"war",
					"ninja",
					"fight",
					"hidden",
					"person",
					"secret",
					"skills",
					"fighter",
					"soldier",
					"stealth",
					"assassin"
				],
				u: "1f977",
				v: [
					"1f977-1f3fb",
					"1f977-1f3fc",
					"1f977-1f3fd",
					"1f977-1f3fe",
					"1f977-1f3ff"
				],
				a: "13"
			},
			{
				n: [
					"fix",
					"hat",
					"man",
					"work",
					"build",
					"person",
					"repair",
					"worker",
					"hardhat",
					"rebuild",
					"remodel",
					"construction",
					"construction worker"
				],
				u: "1f477",
				v: [
					"1f477-1f3fb",
					"1f477-1f3fc",
					"1f477-1f3fd",
					"1f477-1f3fe",
					"1f477-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"fix",
					"hat",
					"man",
					"work",
					"build",
					"repair",
					"worker",
					"hardhat",
					"rebuild",
					"remodel",
					"construction",
					"man construction worker"
				],
				u: "1f477-200d-2642-fe0f",
				v: [
					"1f477-1f3fb-200d-2642-fe0f",
					"1f477-1f3fc-200d-2642-fe0f",
					"1f477-1f3fd-200d-2642-fe0f",
					"1f477-1f3fe-200d-2642-fe0f",
					"1f477-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"fix",
					"hat",
					"man",
					"work",
					"build",
					"woman",
					"repair",
					"worker",
					"hardhat",
					"rebuild",
					"remodel",
					"construction",
					"woman construction worker"
				],
				u: "1f477-200d-2640-fe0f",
				v: [
					"1f477-1f3fb-200d-2640-fe0f",
					"1f477-1f3fc-200d-2640-fe0f",
					"1f477-1f3fd-200d-2640-fe0f",
					"1f477-1f3fe-200d-2640-fe0f",
					"1f477-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"crown",
					"noble",
					"regal",
					"royal",
					"person",
					"monarch",
					"royalty",
					"person with crown"
				],
				u: "1fac5",
				v: [
					"1fac5-1f3fb",
					"1fac5-1f3fc",
					"1fac5-1f3fd",
					"1fac5-1f3fe",
					"1fac5-1f3ff"
				],
				a: "14"
			},
			{
				n: [
					"king",
					"tale",
					"crown",
					"fairy",
					"royal",
					"prince",
					"fantasy",
					"royalty",
					"fairytale"
				],
				u: "1f934",
				v: [
					"1f934-1f3fb",
					"1f934-1f3fc",
					"1f934-1f3fd",
					"1f934-1f3fe",
					"1f934-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"tale",
					"crown",
					"fairy",
					"queen",
					"royal",
					"fantasy",
					"royalty",
					"princess",
					"fairytale"
				],
				u: "1f478",
				v: [
					"1f478-1f3fb",
					"1f478-1f3fc",
					"1f478-1f3fd",
					"1f478-1f3fe",
					"1f478-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"person",
					"turban",
					"wearing",
					"person wearing turban"
				],
				u: "1f473",
				v: [
					"1f473-1f3fb",
					"1f473-1f3fc",
					"1f473-1f3fd",
					"1f473-1f3fe",
					"1f473-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"turban",
					"wearing",
					"man wearing turban"
				],
				u: "1f473-200d-2642-fe0f",
				v: [
					"1f473-1f3fb-200d-2642-fe0f",
					"1f473-1f3fc-200d-2642-fe0f",
					"1f473-1f3fd-200d-2642-fe0f",
					"1f473-1f3fe-200d-2642-fe0f",
					"1f473-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"woman",
					"turban",
					"wearing",
					"woman wearing turban"
				],
				u: "1f473-200d-2640-fe0f",
				v: [
					"1f473-1f3fb-200d-2640-fe0f",
					"1f473-1f3fc-200d-2640-fe0f",
					"1f473-1f3fd-200d-2640-fe0f",
					"1f473-1f3fe-200d-2640-fe0f",
					"1f473-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"pi",
					"cap",
					"gua",
					"hat",
					"mao",
					"guapi",
					"person",
					"chinese",
					"skullcap",
					"person with skullcap"
				],
				u: "1f472",
				v: [
					"1f472-1f3fb",
					"1f472-1f3fc",
					"1f472-1f3fd",
					"1f472-1f3fe",
					"1f472-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"head",
					"hijab",
					"woman",
					"tichel",
					"bandana",
					"kerchief",
					"mantilla",
					"headscarf",
					"woman with headscarf"
				],
				u: "1f9d5",
				v: [
					"1f9d5-1f3fb",
					"1f9d5-1f3fc",
					"1f9d5-1f3fd",
					"1f9d5-1f3fe",
					"1f9d5-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"formal",
					"person",
					"tuxedo",
					"wedding",
					"person in tuxedo"
				],
				u: "1f935",
				v: [
					"1f935-1f3fb",
					"1f935-1f3fc",
					"1f935-1f3fd",
					"1f935-1f3fe",
					"1f935-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"man",
					"groom",
					"formal",
					"tuxedo",
					"wedding",
					"man in tuxedo"
				],
				u: "1f935-200d-2642-fe0f",
				v: [
					"1f935-1f3fb-200d-2642-fe0f",
					"1f935-1f3fc-200d-2642-fe0f",
					"1f935-1f3fd-200d-2642-fe0f",
					"1f935-1f3fe-200d-2642-fe0f",
					"1f935-1f3ff-200d-2642-fe0f"
				],
				a: "13"
			},
			{
				n: [
					"woman",
					"formal",
					"tuxedo",
					"wedding",
					"woman in tuxedo"
				],
				u: "1f935-200d-2640-fe0f",
				v: [
					"1f935-1f3fb-200d-2640-fe0f",
					"1f935-1f3fc-200d-2640-fe0f",
					"1f935-1f3fd-200d-2640-fe0f",
					"1f935-1f3fe-200d-2640-fe0f",
					"1f935-1f3ff-200d-2640-fe0f"
				],
				a: "13"
			},
			{
				n: [
					"veil",
					"person",
					"wedding",
					"person with veil"
				],
				u: "1f470",
				v: [
					"1f470-1f3fb",
					"1f470-1f3fc",
					"1f470-1f3fd",
					"1f470-1f3fe",
					"1f470-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"veil",
					"wedding",
					"man with veil"
				],
				u: "1f470-200d-2642-fe0f",
				v: [
					"1f470-1f3fb-200d-2642-fe0f",
					"1f470-1f3fc-200d-2642-fe0f",
					"1f470-1f3fd-200d-2642-fe0f",
					"1f470-1f3fe-200d-2642-fe0f",
					"1f470-1f3ff-200d-2642-fe0f"
				],
				a: "13"
			},
			{
				n: [
					"veil",
					"bride",
					"woman",
					"wedding",
					"woman with veil"
				],
				u: "1f470-200d-2640-fe0f",
				v: [
					"1f470-1f3fb-200d-2640-fe0f",
					"1f470-1f3fc-200d-2640-fe0f",
					"1f470-1f3fd-200d-2640-fe0f",
					"1f470-1f3fe-200d-2640-fe0f",
					"1f470-1f3ff-200d-2640-fe0f"
				],
				a: "13"
			},
			{
				n: [
					"woman",
					"pregnant",
					"pregnant woman"
				],
				u: "1f930",
				v: [
					"1f930-1f3fb",
					"1f930-1f3fc",
					"1f930-1f3fd",
					"1f930-1f3fe",
					"1f930-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"man",
					"full",
					"belly",
					"bloated",
					"overeat",
					"pregnant",
					"pregnant man"
				],
				u: "1fac3",
				v: [
					"1fac3-1f3fb",
					"1fac3-1f3fc",
					"1fac3-1f3fd",
					"1fac3-1f3fe",
					"1fac3-1f3ff"
				],
				a: "14"
			},
			{
				n: [
					"full",
					"belly",
					"person",
					"bloated",
					"overeat",
					"stuffed",
					"pregnant",
					"pregnant person"
				],
				u: "1fac4",
				v: [
					"1fac4-1f3fb",
					"1fac4-1f3fc",
					"1fac4-1f3fd",
					"1fac4-1f3fe",
					"1fac4-1f3ff"
				],
				a: "14"
			},
			{
				n: [
					"mom",
					"baby",
					"woman",
					"breast",
					"mother",
					"feeding",
					"nursing",
					"breast feeding"
				],
				u: "1f931",
				v: [
					"1f931-1f3fb",
					"1f931-1f3fc",
					"1f931-1f3fd",
					"1f931-1f3fe",
					"1f931-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"mom",
					"baby",
					"feed",
					"nanny",
					"woman",
					"mother",
					"feeding",
					"newborn",
					"nursing",
					"woman feeding baby"
				],
				u: "1f469-200d-1f37c",
				v: [
					"1f469-1f3fb-200d-1f37c",
					"1f469-1f3fc-200d-1f37c",
					"1f469-1f3fd-200d-1f37c",
					"1f469-1f3fe-200d-1f37c",
					"1f469-1f3ff-200d-1f37c"
				],
				a: "13"
			},
			{
				n: [
					"dad",
					"man",
					"baby",
					"feed",
					"nanny",
					"father",
					"feeding",
					"newborn",
					"nursing",
					"man feeding baby"
				],
				u: "1f468-200d-1f37c",
				v: [
					"1f468-1f3fb-200d-1f37c",
					"1f468-1f3fc-200d-1f37c",
					"1f468-1f3fd-200d-1f37c",
					"1f468-1f3fe-200d-1f37c",
					"1f468-1f3ff-200d-1f37c"
				],
				a: "13"
			},
			{
				n: [
					"baby",
					"feed",
					"nanny",
					"parent",
					"feeding",
					"newborn",
					"nursing",
					"person feeding baby"
				],
				u: "1f9d1-200d-1f37c",
				v: [
					"1f9d1-1f3fb-200d-1f37c",
					"1f9d1-1f3fc-200d-1f37c",
					"1f9d1-1f3fd-200d-1f37c",
					"1f9d1-1f3fe-200d-1f37c",
					"1f9d1-1f3ff-200d-1f37c"
				],
				a: "13"
			},
			{
				n: [
					"baby",
					"face",
					"tale",
					"angel",
					"fairy",
					"church",
					"fantasy",
					"fairytale",
					"baby angel"
				],
				u: "1f47c",
				v: [
					"1f47c-1f3fb",
					"1f47c-1f3fc",
					"1f47c-1f3fd",
					"1f47c-1f3fe",
					"1f47c-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"tale",
					"xmas",
					"claus",
					"fairy",
					"merry",
					"santa",
					"father",
					"fantasy",
					"holiday",
					"christmas",
					"Santa Claus",
					"celebration"
				],
				u: "1f385",
				v: [
					"1f385-1f3fb",
					"1f385-1f3fc",
					"1f385-1f3fd",
					"1f385-1f3fe",
					"1f385-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"mrs",
					"tale",
					"xmas",
					"claus",
					"fairy",
					"merry",
					"santa",
					"mother",
					"fantasy",
					"holiday",
					"christmas",
					"Mrs. Claus",
					"celebration"
				],
				u: "1f936",
				v: [
					"1f936-1f3fb",
					"1f936-1f3fc",
					"1f936-1f3fd",
					"1f936-1f3fe",
					"1f936-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"mx",
					"tale",
					"xmas",
					"claus",
					"fairy",
					"merry",
					"santa",
					"fantasy",
					"holiday",
					"Mx Claus",
					"christmas",
					"celebration"
				],
				u: "1f9d1-200d-1f384",
				v: [
					"1f9d1-1f3fb-200d-1f384",
					"1f9d1-1f3fc-200d-1f384",
					"1f9d1-1f3fd-200d-1f384",
					"1f9d1-1f3fe-200d-1f384",
					"1f9d1-1f3ff-200d-1f384"
				],
				a: "13"
			},
			{
				n: [
					"good",
					"hero",
					"superhero",
					"superpower"
				],
				u: "1f9b8",
				v: [
					"1f9b8-1f3fb",
					"1f9b8-1f3fc",
					"1f9b8-1f3fd",
					"1f9b8-1f3fe",
					"1f9b8-1f3ff"
				],
				a: "11"
			},
			{
				n: [
					"man",
					"good",
					"hero",
					"superhero",
					"superpower",
					"man superhero"
				],
				u: "1f9b8-200d-2642-fe0f",
				v: [
					"1f9b8-1f3fb-200d-2642-fe0f",
					"1f9b8-1f3fc-200d-2642-fe0f",
					"1f9b8-1f3fd-200d-2642-fe0f",
					"1f9b8-1f3fe-200d-2642-fe0f",
					"1f9b8-1f3ff-200d-2642-fe0f"
				],
				a: "11"
			},
			{
				n: [
					"good",
					"hero",
					"woman",
					"heroine",
					"superhero",
					"superpower",
					"woman superhero"
				],
				u: "1f9b8-200d-2640-fe0f",
				v: [
					"1f9b8-1f3fb-200d-2640-fe0f",
					"1f9b8-1f3fc-200d-2640-fe0f",
					"1f9b8-1f3fd-200d-2640-fe0f",
					"1f9b8-1f3fe-200d-2640-fe0f",
					"1f9b8-1f3ff-200d-2640-fe0f"
				],
				a: "11"
			},
			{
				n: [
					"bad",
					"evil",
					"villain",
					"criminal",
					"superpower",
					"supervillain"
				],
				u: "1f9b9",
				v: [
					"1f9b9-1f3fb",
					"1f9b9-1f3fc",
					"1f9b9-1f3fd",
					"1f9b9-1f3fe",
					"1f9b9-1f3ff"
				],
				a: "11"
			},
			{
				n: [
					"bad",
					"man",
					"evil",
					"villain",
					"criminal",
					"superpower",
					"supervillain",
					"man supervillain"
				],
				u: "1f9b9-200d-2642-fe0f",
				v: [
					"1f9b9-1f3fb-200d-2642-fe0f",
					"1f9b9-1f3fc-200d-2642-fe0f",
					"1f9b9-1f3fd-200d-2642-fe0f",
					"1f9b9-1f3fe-200d-2642-fe0f",
					"1f9b9-1f3ff-200d-2642-fe0f"
				],
				a: "11"
			},
			{
				n: [
					"bad",
					"evil",
					"woman",
					"villain",
					"criminal",
					"superpower",
					"supervillain",
					"woman supervillain"
				],
				u: "1f9b9-200d-2640-fe0f",
				v: [
					"1f9b9-1f3fb-200d-2640-fe0f",
					"1f9b9-1f3fc-200d-2640-fe0f",
					"1f9b9-1f3fd-200d-2640-fe0f",
					"1f9b9-1f3fe-200d-2640-fe0f",
					"1f9b9-1f3ff-200d-2640-fe0f"
				],
				a: "11"
			},
			{
				n: [
					"mage",
					"play",
					"magic",
					"spell",
					"witch",
					"summon",
					"wizard",
					"fantasy",
					"sorcery",
					"sorcerer",
					"sorceress"
				],
				u: "1f9d9",
				v: [
					"1f9d9-1f3fb",
					"1f9d9-1f3fc",
					"1f9d9-1f3fd",
					"1f9d9-1f3fe",
					"1f9d9-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"man",
					"mage",
					"play",
					"magic",
					"spell",
					"witch",
					"summon",
					"wizard",
					"fantasy",
					"sorcery",
					"man mage",
					"sorcerer",
					"sorceress"
				],
				u: "1f9d9-200d-2642-fe0f",
				v: [
					"1f9d9-1f3fb-200d-2642-fe0f",
					"1f9d9-1f3fc-200d-2642-fe0f",
					"1f9d9-1f3fd-200d-2642-fe0f",
					"1f9d9-1f3fe-200d-2642-fe0f",
					"1f9d9-1f3ff-200d-2642-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"mage",
					"play",
					"magic",
					"spell",
					"witch",
					"woman",
					"summon",
					"wizard",
					"fantasy",
					"sorcery",
					"sorcerer",
					"sorceress",
					"woman mage"
				],
				u: "1f9d9-200d-2640-fe0f",
				v: [
					"1f9d9-1f3fb-200d-2640-fe0f",
					"1f9d9-1f3fc-200d-2640-fe0f",
					"1f9d9-1f3fd-200d-2640-fe0f",
					"1f9d9-1f3fe-200d-2640-fe0f",
					"1f9d9-1f3ff-200d-2640-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"myth",
					"tale",
					"fairy",
					"pixie",
					"wings",
					"person",
					"fantasy",
					"fairytale"
				],
				u: "1f9da",
				v: [
					"1f9da-1f3fb",
					"1f9da-1f3fc",
					"1f9da-1f3fd",
					"1f9da-1f3fe",
					"1f9da-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"man",
					"myth",
					"puck",
					"tale",
					"fairy",
					"pixie",
					"wings",
					"oberon",
					"person",
					"fantasy",
					"man fairy",
					"fairytale"
				],
				u: "1f9da-200d-2642-fe0f",
				v: [
					"1f9da-1f3fb-200d-2642-fe0f",
					"1f9da-1f3fc-200d-2642-fe0f",
					"1f9da-1f3fd-200d-2642-fe0f",
					"1f9da-1f3fe-200d-2642-fe0f",
					"1f9da-1f3ff-200d-2642-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"myth",
					"tale",
					"fairy",
					"pixie",
					"wings",
					"woman",
					"person",
					"fantasy",
					"titania",
					"fairytale",
					"woman fairy"
				],
				u: "1f9da-200d-2640-fe0f",
				v: [
					"1f9da-1f3fb-200d-2640-fe0f",
					"1f9da-1f3fc-200d-2640-fe0f",
					"1f9da-1f3fd-200d-2640-fe0f",
					"1f9da-1f3fe-200d-2640-fe0f",
					"1f9da-1f3ff-200d-2640-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"blood",
					"fangs",
					"scary",
					"teeth",
					"undead",
					"vampire",
					"dracula",
					"halloween",
					"supernatural"
				],
				u: "1f9db",
				v: [
					"1f9db-1f3fb",
					"1f9db-1f3fc",
					"1f9db-1f3fd",
					"1f9db-1f3fe",
					"1f9db-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"man",
					"blood",
					"fangs",
					"scary",
					"teeth",
					"undead",
					"vampire",
					"halloween",
					"man vampire",
					"supernatural"
				],
				u: "1f9db-200d-2642-fe0f",
				v: [
					"1f9db-1f3fb-200d-2642-fe0f",
					"1f9db-1f3fc-200d-2642-fe0f",
					"1f9db-1f3fd-200d-2642-fe0f",
					"1f9db-1f3fe-200d-2642-fe0f",
					"1f9db-1f3ff-200d-2642-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"blood",
					"fangs",
					"scary",
					"teeth",
					"woman",
					"undead",
					"vampire",
					"halloween",
					"supernatural",
					"woman vampire"
				],
				u: "1f9db-200d-2640-fe0f",
				v: [
					"1f9db-1f3fb-200d-2640-fe0f",
					"1f9db-1f3fc-200d-2640-fe0f",
					"1f9db-1f3fd-200d-2640-fe0f",
					"1f9db-1f3fe-200d-2640-fe0f",
					"1f9db-1f3ff-200d-2640-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"sea",
					"ocean",
					"siren",
					"trident",
					"creature",
					"folklore",
					"merperson",
					"fairytale"
				],
				u: "1f9dc",
				v: [
					"1f9dc-1f3fb",
					"1f9dc-1f3fc",
					"1f9dc-1f3fd",
					"1f9dc-1f3fe",
					"1f9dc-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"sea",
					"ocean",
					"siren",
					"merman",
					"triton",
					"neptune",
					"trident",
					"creature",
					"folklore",
					"poseidon",
					"fairytale"
				],
				u: "1f9dc-200d-2642-fe0f",
				v: [
					"1f9dc-1f3fb-200d-2642-fe0f",
					"1f9dc-1f3fc-200d-2642-fe0f",
					"1f9dc-1f3fd-200d-2642-fe0f",
					"1f9dc-1f3fe-200d-2642-fe0f",
					"1f9dc-1f3ff-200d-2642-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"sea",
					"ocean",
					"siren",
					"mermaid",
					"trident",
					"creature",
					"folklore",
					"merwoman",
					"fairytale"
				],
				u: "1f9dc-200d-2640-fe0f",
				v: [
					"1f9dc-1f3fb-200d-2640-fe0f",
					"1f9dc-1f3fc-200d-2640-fe0f",
					"1f9dc-1f3fd-200d-2640-fe0f",
					"1f9dc-1f3fe-200d-2640-fe0f",
					"1f9dc-1f3ff-200d-2640-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"elf",
					"myth",
					"elves",
					"magic",
					"fantasy",
					"magical",
					"folklore",
					"enchantment"
				],
				u: "1f9dd",
				v: [
					"1f9dd-1f3fb",
					"1f9dd-1f3fc",
					"1f9dd-1f3fd",
					"1f9dd-1f3fe",
					"1f9dd-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"elf",
					"man",
					"myth",
					"elves",
					"magic",
					"man elf",
					"fantasy",
					"magical",
					"folklore",
					"enchantment"
				],
				u: "1f9dd-200d-2642-fe0f",
				v: [
					"1f9dd-1f3fb-200d-2642-fe0f",
					"1f9dd-1f3fc-200d-2642-fe0f",
					"1f9dd-1f3fd-200d-2642-fe0f",
					"1f9dd-1f3fe-200d-2642-fe0f",
					"1f9dd-1f3ff-200d-2642-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"elf",
					"myth",
					"elves",
					"magic",
					"woman",
					"fantasy",
					"magical",
					"folklore",
					"woman elf",
					"enchantment"
				],
				u: "1f9dd-200d-2640-fe0f",
				v: [
					"1f9dd-1f3fb-200d-2640-fe0f",
					"1f9dd-1f3fc-200d-2640-fe0f",
					"1f9dd-1f3fd-200d-2640-fe0f",
					"1f9dd-1f3fe-200d-2640-fe0f",
					"1f9dd-1f3ff-200d-2640-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"rub",
					"jinn",
					"lamp",
					"myth",
					"genie",
					"djinn",
					"wishes",
					"fantasy"
				],
				u: "1f9de",
				a: "5"
			},
			{
				n: [
					"man",
					"rub",
					"jinn",
					"lamp",
					"myth",
					"djinn",
					"genie",
					"wishes",
					"fantasy",
					"man genie"
				],
				u: "1f9de-200d-2642-fe0f",
				a: "5"
			},
			{
				n: [
					"rub",
					"jinn",
					"lamp",
					"myth",
					"djinn",
					"genie",
					"woman",
					"wishes",
					"fantasy",
					"woman genie"
				],
				u: "1f9de-200d-2640-fe0f",
				a: "5"
			},
			{
				n: [
					"dead",
					"scary",
					"zombie",
					"horror",
					"undead",
					"walking",
					"halloween",
					"apocalypse"
				],
				u: "1f9df",
				a: "5"
			},
			{
				n: [
					"man",
					"dead",
					"scary",
					"horror",
					"undead",
					"zombie",
					"walking",
					"halloween",
					"man zombie",
					"apocalypse"
				],
				u: "1f9df-200d-2642-fe0f",
				a: "5"
			},
			{
				n: [
					"dead",
					"scary",
					"woman",
					"horror",
					"undead",
					"zombie",
					"walking",
					"halloween",
					"apocalypse",
					"woman zombie"
				],
				u: "1f9df-200d-2640-fe0f",
				a: "5"
			},
			{
				n: [
					"tale",
					"troll",
					"fairy",
					"fantasy",
					"monster",
					"trolling"
				],
				u: "1f9cc",
				a: "14"
			},
			{
				n: [
					"spa",
					"face",
					"relax",
					"salon",
					"person",
					"soothe",
					"getting",
					"massage",
					"tension",
					"therapy",
					"headache",
					"relaxing",
					"treatment",
					"person getting massage"
				],
				u: "1f486",
				v: [
					"1f486-1f3fb",
					"1f486-1f3fc",
					"1f486-1f3fd",
					"1f486-1f3fe",
					"1f486-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"spa",
					"face",
					"relax",
					"salon",
					"soothe",
					"getting",
					"massage",
					"tension",
					"therapy",
					"headache",
					"relaxing",
					"treatment",
					"man getting massage"
				],
				u: "1f486-200d-2642-fe0f",
				v: [
					"1f486-1f3fb-200d-2642-fe0f",
					"1f486-1f3fc-200d-2642-fe0f",
					"1f486-1f3fd-200d-2642-fe0f",
					"1f486-1f3fe-200d-2642-fe0f",
					"1f486-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"spa",
					"face",
					"relax",
					"salon",
					"woman",
					"soothe",
					"getting",
					"massage",
					"tension",
					"therapy",
					"headache",
					"relaxing",
					"treatment",
					"woman getting massage"
				],
				u: "1f486-200d-2640-fe0f",
				v: [
					"1f486-1f3fb-200d-2640-fe0f",
					"1f486-1f3fc-200d-2640-fe0f",
					"1f486-1f3fd-200d-2640-fe0f",
					"1f486-1f3fe-200d-2640-fe0f",
					"1f486-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"cut",
					"chop",
					"hair",
					"groom",
					"style",
					"barber",
					"beauty",
					"parlor",
					"person",
					"shears",
					"haircut",
					"cosmetology",
					"person getting haircut"
				],
				u: "1f487",
				v: [
					"1f487-1f3fb",
					"1f487-1f3fc",
					"1f487-1f3fd",
					"1f487-1f3fe",
					"1f487-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"cut",
					"man",
					"chop",
					"hair",
					"groom",
					"style",
					"barber",
					"beauty",
					"parlor",
					"person",
					"shears",
					"haircut",
					"cosmetology",
					"man getting haircut"
				],
				u: "1f487-200d-2642-fe0f",
				v: [
					"1f487-1f3fb-200d-2642-fe0f",
					"1f487-1f3fc-200d-2642-fe0f",
					"1f487-1f3fd-200d-2642-fe0f",
					"1f487-1f3fe-200d-2642-fe0f",
					"1f487-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"cut",
					"chop",
					"hair",
					"groom",
					"style",
					"woman",
					"barber",
					"beauty",
					"parlor",
					"person",
					"shears",
					"haircut",
					"cosmetology",
					"woman getting haircut"
				],
				u: "1f487-200d-2640-fe0f",
				v: [
					"1f487-1f3fb-200d-2640-fe0f",
					"1f487-1f3fc-200d-2640-fe0f",
					"1f487-1f3fd-200d-2640-fe0f",
					"1f487-1f3fe-200d-2640-fe0f",
					"1f487-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"man",
					"gait",
					"hike",
					"pace",
					"walk",
					"amble",
					"person",
					"stride",
					"stroll",
					"walking",
					"pedestrian",
					"person walking"
				],
				u: "1f6b6",
				v: [
					"1f6b6-1f3fb",
					"1f6b6-1f3fc",
					"1f6b6-1f3fd",
					"1f6b6-1f3fe",
					"1f6b6-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"gait",
					"hike",
					"pace",
					"walk",
					"amble",
					"stride",
					"stroll",
					"walking",
					"pedestrian",
					"man walking"
				],
				u: "1f6b6-200d-2642-fe0f",
				v: [
					"1f6b6-1f3fb-200d-2642-fe0f",
					"1f6b6-1f3fc-200d-2642-fe0f",
					"1f6b6-1f3fd-200d-2642-fe0f",
					"1f6b6-1f3fe-200d-2642-fe0f",
					"1f6b6-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"man",
					"gait",
					"hike",
					"pace",
					"walk",
					"amble",
					"woman",
					"stride",
					"stroll",
					"walking",
					"pedestrian",
					"woman walking"
				],
				u: "1f6b6-200d-2640-fe0f",
				v: [
					"1f6b6-1f3fb-200d-2640-fe0f",
					"1f6b6-1f3fc-200d-2640-fe0f",
					"1f6b6-1f3fd-200d-2640-fe0f",
					"1f6b6-1f3fe-200d-2640-fe0f",
					"1f6b6-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"man",
					"gait",
					"hike",
					"pace",
					"walk",
					"amble",
					"right",
					"facing",
					"person",
					"stride",
					"stroll",
					"walking",
					"pedestrian",
					"person walking: facing right"
				],
				u: "1f6b6-200d-27a1-fe0f",
				v: [
					"1f6b6-1f3fb-200d-27a1-fe0f",
					"1f6b6-1f3fc-200d-27a1-fe0f",
					"1f6b6-1f3fd-200d-27a1-fe0f",
					"1f6b6-1f3fe-200d-27a1-fe0f",
					"1f6b6-1f3ff-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"man",
					"gait",
					"hike",
					"pace",
					"walk",
					"amble",
					"right",
					"woman",
					"facing",
					"stride",
					"stroll",
					"walking",
					"pedestrian",
					"woman walking: facing right"
				],
				u: "1f6b6-200d-2640-fe0f-200d-27a1-fe0f",
				v: [
					"1f6b6-1f3fb-200d-2640-fe0f-200d-27a1-fe0f",
					"1f6b6-1f3fc-200d-2640-fe0f-200d-27a1-fe0f",
					"1f6b6-1f3fd-200d-2640-fe0f-200d-27a1-fe0f",
					"1f6b6-1f3fe-200d-2640-fe0f-200d-27a1-fe0f",
					"1f6b6-1f3ff-200d-2640-fe0f-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"man",
					"gait",
					"hike",
					"pace",
					"walk",
					"amble",
					"right",
					"facing",
					"stride",
					"stroll",
					"walking",
					"pedestrian",
					"man walking: facing right"
				],
				u: "1f6b6-200d-2642-fe0f-200d-27a1-fe0f",
				v: [
					"1f6b6-1f3fb-200d-2642-fe0f-200d-27a1-fe0f",
					"1f6b6-1f3fc-200d-2642-fe0f-200d-27a1-fe0f",
					"1f6b6-1f3fd-200d-2642-fe0f-200d-27a1-fe0f",
					"1f6b6-1f3fe-200d-2642-fe0f-200d-27a1-fe0f",
					"1f6b6-1f3ff-200d-2642-fe0f-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"stand",
					"person",
					"standing",
					"person standing"
				],
				u: "1f9cd",
				v: [
					"1f9cd-1f3fb",
					"1f9cd-1f3fc",
					"1f9cd-1f3fd",
					"1f9cd-1f3fe",
					"1f9cd-1f3ff"
				],
				a: "12"
			},
			{
				n: [
					"man",
					"stand",
					"standing",
					"man standing"
				],
				u: "1f9cd-200d-2642-fe0f",
				v: [
					"1f9cd-1f3fb-200d-2642-fe0f",
					"1f9cd-1f3fc-200d-2642-fe0f",
					"1f9cd-1f3fd-200d-2642-fe0f",
					"1f9cd-1f3fe-200d-2642-fe0f",
					"1f9cd-1f3ff-200d-2642-fe0f"
				],
				a: "12"
			},
			{
				n: [
					"stand",
					"woman",
					"standing",
					"woman standing"
				],
				u: "1f9cd-200d-2640-fe0f",
				v: [
					"1f9cd-1f3fb-200d-2640-fe0f",
					"1f9cd-1f3fc-200d-2640-fe0f",
					"1f9cd-1f3fd-200d-2640-fe0f",
					"1f9cd-1f3fe-200d-2640-fe0f",
					"1f9cd-1f3ff-200d-2640-fe0f"
				],
				a: "12"
			},
			{
				n: [
					"kneel",
					"knees",
					"person",
					"kneeling",
					"person kneeling"
				],
				u: "1f9ce",
				v: [
					"1f9ce-1f3fb",
					"1f9ce-1f3fc",
					"1f9ce-1f3fd",
					"1f9ce-1f3fe",
					"1f9ce-1f3ff"
				],
				a: "12"
			},
			{
				n: [
					"man",
					"kneel",
					"knees",
					"kneeling",
					"man kneeling"
				],
				u: "1f9ce-200d-2642-fe0f",
				v: [
					"1f9ce-1f3fb-200d-2642-fe0f",
					"1f9ce-1f3fc-200d-2642-fe0f",
					"1f9ce-1f3fd-200d-2642-fe0f",
					"1f9ce-1f3fe-200d-2642-fe0f",
					"1f9ce-1f3ff-200d-2642-fe0f"
				],
				a: "12"
			},
			{
				n: [
					"kneel",
					"knees",
					"woman",
					"kneeling",
					"woman kneeling"
				],
				u: "1f9ce-200d-2640-fe0f",
				v: [
					"1f9ce-1f3fb-200d-2640-fe0f",
					"1f9ce-1f3fc-200d-2640-fe0f",
					"1f9ce-1f3fd-200d-2640-fe0f",
					"1f9ce-1f3fe-200d-2640-fe0f",
					"1f9ce-1f3ff-200d-2640-fe0f"
				],
				a: "12"
			},
			{
				n: [
					"kneel",
					"knees",
					"right",
					"facing",
					"person",
					"kneeling",
					"person kneeling: facing right"
				],
				u: "1f9ce-200d-27a1-fe0f",
				v: [
					"1f9ce-1f3fb-200d-27a1-fe0f",
					"1f9ce-1f3fc-200d-27a1-fe0f",
					"1f9ce-1f3fd-200d-27a1-fe0f",
					"1f9ce-1f3fe-200d-27a1-fe0f",
					"1f9ce-1f3ff-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"kneel",
					"knees",
					"right",
					"woman",
					"facing",
					"kneeling",
					"woman kneeling: facing right"
				],
				u: "1f9ce-200d-2640-fe0f-200d-27a1-fe0f",
				v: [
					"1f9ce-1f3fb-200d-2640-fe0f-200d-27a1-fe0f",
					"1f9ce-1f3fc-200d-2640-fe0f-200d-27a1-fe0f",
					"1f9ce-1f3fd-200d-2640-fe0f-200d-27a1-fe0f",
					"1f9ce-1f3fe-200d-2640-fe0f-200d-27a1-fe0f",
					"1f9ce-1f3ff-200d-2640-fe0f-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"man",
					"kneel",
					"knees",
					"right",
					"facing",
					"kneeling",
					"man kneeling: facing right"
				],
				u: "1f9ce-200d-2642-fe0f-200d-27a1-fe0f",
				v: [
					"1f9ce-1f3fb-200d-2642-fe0f-200d-27a1-fe0f",
					"1f9ce-1f3fc-200d-2642-fe0f-200d-27a1-fe0f",
					"1f9ce-1f3fd-200d-2642-fe0f-200d-27a1-fe0f",
					"1f9ce-1f3fe-200d-2642-fe0f-200d-27a1-fe0f",
					"1f9ce-1f3ff-200d-2642-fe0f-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"cane",
					"blind",
					"white",
					"person",
					"probing",
					"accessibility",
					"person with white cane"
				],
				u: "1f9d1-200d-1f9af",
				v: [
					"1f9d1-1f3fb-200d-1f9af",
					"1f9d1-1f3fc-200d-1f9af",
					"1f9d1-1f3fd-200d-1f9af",
					"1f9d1-1f3fe-200d-1f9af",
					"1f9d1-1f3ff-200d-1f9af"
				],
				a: "12.1"
			},
			{
				n: [
					"cane",
					"blind",
					"right",
					"white",
					"facing",
					"person",
					"probing",
					"accessibility",
					"person with white cane: facing right"
				],
				u: "1f9d1-200d-1f9af-200d-27a1-fe0f",
				v: [
					"1f9d1-1f3fb-200d-1f9af-200d-27a1-fe0f",
					"1f9d1-1f3fc-200d-1f9af-200d-27a1-fe0f",
					"1f9d1-1f3fd-200d-1f9af-200d-27a1-fe0f",
					"1f9d1-1f3fe-200d-1f9af-200d-27a1-fe0f",
					"1f9d1-1f3ff-200d-1f9af-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"man",
					"cane",
					"blind",
					"white",
					"probing",
					"accessibility",
					"man with white cane"
				],
				u: "1f468-200d-1f9af",
				v: [
					"1f468-1f3fb-200d-1f9af",
					"1f468-1f3fc-200d-1f9af",
					"1f468-1f3fd-200d-1f9af",
					"1f468-1f3fe-200d-1f9af",
					"1f468-1f3ff-200d-1f9af"
				],
				a: "12"
			},
			{
				n: [
					"man",
					"cane",
					"blind",
					"right",
					"white",
					"facing",
					"probing",
					"accessibility",
					"man with white cane: facing right"
				],
				u: "1f468-200d-1f9af-200d-27a1-fe0f",
				v: [
					"1f468-1f3fb-200d-1f9af-200d-27a1-fe0f",
					"1f468-1f3fc-200d-1f9af-200d-27a1-fe0f",
					"1f468-1f3fd-200d-1f9af-200d-27a1-fe0f",
					"1f468-1f3fe-200d-1f9af-200d-27a1-fe0f",
					"1f468-1f3ff-200d-1f9af-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"cane",
					"blind",
					"white",
					"woman",
					"probing",
					"accessibility",
					"woman with white cane"
				],
				u: "1f469-200d-1f9af",
				v: [
					"1f469-1f3fb-200d-1f9af",
					"1f469-1f3fc-200d-1f9af",
					"1f469-1f3fd-200d-1f9af",
					"1f469-1f3fe-200d-1f9af",
					"1f469-1f3ff-200d-1f9af"
				],
				a: "12"
			},
			{
				n: [
					"cane",
					"blind",
					"right",
					"white",
					"woman",
					"facing",
					"probing",
					"accessibility",
					"woman with white cane: facing right"
				],
				u: "1f469-200d-1f9af-200d-27a1-fe0f",
				v: [
					"1f469-1f3fb-200d-1f9af-200d-27a1-fe0f",
					"1f469-1f3fc-200d-1f9af-200d-27a1-fe0f",
					"1f469-1f3fd-200d-1f9af-200d-27a1-fe0f",
					"1f469-1f3fe-200d-1f9af-200d-27a1-fe0f",
					"1f469-1f3ff-200d-1f9af-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"person",
					"motorized",
					"wheelchair",
					"accessibility",
					"person in motorized wheelchair"
				],
				u: "1f9d1-200d-1f9bc",
				v: [
					"1f9d1-1f3fb-200d-1f9bc",
					"1f9d1-1f3fc-200d-1f9bc",
					"1f9d1-1f3fd-200d-1f9bc",
					"1f9d1-1f3fe-200d-1f9bc",
					"1f9d1-1f3ff-200d-1f9bc"
				],
				a: "12.1"
			},
			{
				n: [
					"right",
					"facing",
					"person",
					"motorized",
					"wheelchair",
					"accessibility",
					"person in motorized wheelchair: facing right"
				],
				u: "1f9d1-200d-1f9bc-200d-27a1-fe0f",
				v: [
					"1f9d1-1f3fb-200d-1f9bc-200d-27a1-fe0f",
					"1f9d1-1f3fc-200d-1f9bc-200d-27a1-fe0f",
					"1f9d1-1f3fd-200d-1f9bc-200d-27a1-fe0f",
					"1f9d1-1f3fe-200d-1f9bc-200d-27a1-fe0f",
					"1f9d1-1f3ff-200d-1f9bc-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"man",
					"motorized",
					"wheelchair",
					"accessibility",
					"man in motorized wheelchair"
				],
				u: "1f468-200d-1f9bc",
				v: [
					"1f468-1f3fb-200d-1f9bc",
					"1f468-1f3fc-200d-1f9bc",
					"1f468-1f3fd-200d-1f9bc",
					"1f468-1f3fe-200d-1f9bc",
					"1f468-1f3ff-200d-1f9bc"
				],
				a: "12"
			},
			{
				n: [
					"man",
					"right",
					"facing",
					"motorized",
					"wheelchair",
					"accessibility",
					"man in motorized wheelchair: facing right"
				],
				u: "1f468-200d-1f9bc-200d-27a1-fe0f",
				v: [
					"1f468-1f3fb-200d-1f9bc-200d-27a1-fe0f",
					"1f468-1f3fc-200d-1f9bc-200d-27a1-fe0f",
					"1f468-1f3fd-200d-1f9bc-200d-27a1-fe0f",
					"1f468-1f3fe-200d-1f9bc-200d-27a1-fe0f",
					"1f468-1f3ff-200d-1f9bc-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"woman",
					"motorized",
					"wheelchair",
					"accessibility",
					"woman in motorized wheelchair"
				],
				u: "1f469-200d-1f9bc",
				v: [
					"1f469-1f3fb-200d-1f9bc",
					"1f469-1f3fc-200d-1f9bc",
					"1f469-1f3fd-200d-1f9bc",
					"1f469-1f3fe-200d-1f9bc",
					"1f469-1f3ff-200d-1f9bc"
				],
				a: "12"
			},
			{
				n: [
					"right",
					"woman",
					"facing",
					"motorized",
					"wheelchair",
					"accessibility",
					"woman in motorized wheelchair: facing right"
				],
				u: "1f469-200d-1f9bc-200d-27a1-fe0f",
				v: [
					"1f469-1f3fb-200d-1f9bc-200d-27a1-fe0f",
					"1f469-1f3fc-200d-1f9bc-200d-27a1-fe0f",
					"1f469-1f3fd-200d-1f9bc-200d-27a1-fe0f",
					"1f469-1f3fe-200d-1f9bc-200d-27a1-fe0f",
					"1f469-1f3ff-200d-1f9bc-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"manual",
					"person",
					"wheelchair",
					"accessibility",
					"person in manual wheelchair"
				],
				u: "1f9d1-200d-1f9bd",
				v: [
					"1f9d1-1f3fb-200d-1f9bd",
					"1f9d1-1f3fc-200d-1f9bd",
					"1f9d1-1f3fd-200d-1f9bd",
					"1f9d1-1f3fe-200d-1f9bd",
					"1f9d1-1f3ff-200d-1f9bd"
				],
				a: "12.1"
			},
			{
				n: [
					"right",
					"facing",
					"manual",
					"person",
					"wheelchair",
					"accessibility",
					"person in manual wheelchair: facing right"
				],
				u: "1f9d1-200d-1f9bd-200d-27a1-fe0f",
				v: [
					"1f9d1-1f3fb-200d-1f9bd-200d-27a1-fe0f",
					"1f9d1-1f3fc-200d-1f9bd-200d-27a1-fe0f",
					"1f9d1-1f3fd-200d-1f9bd-200d-27a1-fe0f",
					"1f9d1-1f3fe-200d-1f9bd-200d-27a1-fe0f",
					"1f9d1-1f3ff-200d-1f9bd-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"man",
					"manual",
					"wheelchair",
					"accessibility",
					"man in manual wheelchair"
				],
				u: "1f468-200d-1f9bd",
				v: [
					"1f468-1f3fb-200d-1f9bd",
					"1f468-1f3fc-200d-1f9bd",
					"1f468-1f3fd-200d-1f9bd",
					"1f468-1f3fe-200d-1f9bd",
					"1f468-1f3ff-200d-1f9bd"
				],
				a: "12"
			},
			{
				n: [
					"man",
					"right",
					"facing",
					"manual",
					"wheelchair",
					"accessibility",
					"man in manual wheelchair: facing right"
				],
				u: "1f468-200d-1f9bd-200d-27a1-fe0f",
				v: [
					"1f468-1f3fb-200d-1f9bd-200d-27a1-fe0f",
					"1f468-1f3fc-200d-1f9bd-200d-27a1-fe0f",
					"1f468-1f3fd-200d-1f9bd-200d-27a1-fe0f",
					"1f468-1f3fe-200d-1f9bd-200d-27a1-fe0f",
					"1f468-1f3ff-200d-1f9bd-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"woman",
					"manual",
					"wheelchair",
					"accessibility",
					"woman in manual wheelchair"
				],
				u: "1f469-200d-1f9bd",
				v: [
					"1f469-1f3fb-200d-1f9bd",
					"1f469-1f3fc-200d-1f9bd",
					"1f469-1f3fd-200d-1f9bd",
					"1f469-1f3fe-200d-1f9bd",
					"1f469-1f3ff-200d-1f9bd"
				],
				a: "12"
			},
			{
				n: [
					"right",
					"woman",
					"facing",
					"manual",
					"wheelchair",
					"accessibility",
					"woman in manual wheelchair: facing right"
				],
				u: "1f469-200d-1f9bd-200d-27a1-fe0f",
				v: [
					"1f469-1f3fb-200d-1f9bd-200d-27a1-fe0f",
					"1f469-1f3fc-200d-1f9bd-200d-27a1-fe0f",
					"1f469-1f3fd-200d-1f9bd-200d-27a1-fe0f",
					"1f469-1f3fe-200d-1f9bd-200d-27a1-fe0f",
					"1f469-1f3ff-200d-1f9bd-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"run",
					"fast",
					"move",
					"race",
					"rush",
					"hurry",
					"quick",
					"speed",
					"person",
					"racing",
					"marathon",
					"person running"
				],
				u: "1f3c3",
				v: [
					"1f3c3-1f3fb",
					"1f3c3-1f3fc",
					"1f3c3-1f3fd",
					"1f3c3-1f3fe",
					"1f3c3-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"run",
					"fast",
					"move",
					"race",
					"rush",
					"hurry",
					"quick",
					"speed",
					"racing",
					"marathon",
					"man running"
				],
				u: "1f3c3-200d-2642-fe0f",
				v: [
					"1f3c3-1f3fb-200d-2642-fe0f",
					"1f3c3-1f3fc-200d-2642-fe0f",
					"1f3c3-1f3fd-200d-2642-fe0f",
					"1f3c3-1f3fe-200d-2642-fe0f",
					"1f3c3-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"run",
					"fast",
					"move",
					"race",
					"rush",
					"hurry",
					"quick",
					"speed",
					"woman",
					"racing",
					"marathon",
					"woman running"
				],
				u: "1f3c3-200d-2640-fe0f",
				v: [
					"1f3c3-1f3fb-200d-2640-fe0f",
					"1f3c3-1f3fc-200d-2640-fe0f",
					"1f3c3-1f3fd-200d-2640-fe0f",
					"1f3c3-1f3fe-200d-2640-fe0f",
					"1f3c3-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"run",
					"fast",
					"move",
					"race",
					"rush",
					"hurry",
					"quick",
					"right",
					"speed",
					"facing",
					"person",
					"racing",
					"marathon",
					"person running: facing right"
				],
				u: "1f3c3-200d-27a1-fe0f",
				v: [
					"1f3c3-1f3fb-200d-27a1-fe0f",
					"1f3c3-1f3fc-200d-27a1-fe0f",
					"1f3c3-1f3fd-200d-27a1-fe0f",
					"1f3c3-1f3fe-200d-27a1-fe0f",
					"1f3c3-1f3ff-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"run",
					"fast",
					"move",
					"race",
					"rush",
					"hurry",
					"quick",
					"right",
					"speed",
					"woman",
					"facing",
					"racing",
					"marathon",
					"woman running: facing right"
				],
				u: "1f3c3-200d-2640-fe0f-200d-27a1-fe0f",
				v: [
					"1f3c3-1f3fb-200d-2640-fe0f-200d-27a1-fe0f",
					"1f3c3-1f3fc-200d-2640-fe0f-200d-27a1-fe0f",
					"1f3c3-1f3fd-200d-2640-fe0f-200d-27a1-fe0f",
					"1f3c3-1f3fe-200d-2640-fe0f-200d-27a1-fe0f",
					"1f3c3-1f3ff-200d-2640-fe0f-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"man",
					"run",
					"fast",
					"move",
					"race",
					"rush",
					"hurry",
					"quick",
					"right",
					"speed",
					"facing",
					"racing",
					"marathon",
					"man running: facing right"
				],
				u: "1f3c3-200d-2642-fe0f-200d-27a1-fe0f",
				v: [
					"1f3c3-1f3fb-200d-2642-fe0f-200d-27a1-fe0f",
					"1f3c3-1f3fc-200d-2642-fe0f-200d-27a1-fe0f",
					"1f3c3-1f3fd-200d-2642-fe0f-200d-27a1-fe0f",
					"1f3c3-1f3fe-200d-2642-fe0f-200d-27a1-fe0f",
					"1f3c3-1f3ff-200d-2642-fe0f-200d-27a1-fe0f"
				],
				a: "15.1"
			},
			{
				n: [
					"dance",
					"flair",
					"let’s",
					"salsa",
					"tango",
					"woman",
					"dancer",
					"groove",
					"dancing",
					"elegant",
					"festive",
					"flamenco",
					"woman dancing"
				],
				u: "1f483",
				v: [
					"1f483-1f3fb",
					"1f483-1f3fc",
					"1f483-1f3fd",
					"1f483-1f3fe",
					"1f483-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"dance",
					"flair",
					"let’s",
					"salsa",
					"tango",
					"dancer",
					"groove",
					"dancing",
					"elegant",
					"festive",
					"flamenco",
					"man dancing"
				],
				u: "1f57a",
				v: [
					"1f57a-1f3fb",
					"1f57a-1f3fc",
					"1f57a-1f3fd",
					"1f57a-1f3fe",
					"1f57a-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"suit",
					"person",
					"business",
					"levitating",
					"person in suit levitating"
				],
				u: "1f574-fe0f",
				v: [
					"1f574-1f3fb",
					"1f574-1f3fc",
					"1f574-1f3fd",
					"1f574-1f3fe",
					"1f574-1f3ff"
				],
				a: "0.7"
			},
			{
				n: [
					"bff",
					"ear",
					"pair",
					"twin",
					"bunny",
					"party",
					"bestie",
					"dancer",
					"double",
					"people",
					"partying",
					"soulmate",
					"twinsies",
					"identical",
					"counterpart",
					"people with bunny ears"
				],
				u: "1f46f",
				v: [
					"1f46f-1f3fb",
					"1f46f-1f3fc",
					"1f46f-1f3fd",
					"1f46f-1f3fe",
					"1f46f-1f3ff",
					"1f9d1-1f3fb-200d-1f430-200d-1f9d1-1f3fc",
					"1f9d1-1f3fb-200d-1f430-200d-1f9d1-1f3fd",
					"1f9d1-1f3fb-200d-1f430-200d-1f9d1-1f3fe",
					"1f9d1-1f3fb-200d-1f430-200d-1f9d1-1f3ff",
					"1f9d1-1f3fc-200d-1f430-200d-1f9d1-1f3fb",
					"1f9d1-1f3fc-200d-1f430-200d-1f9d1-1f3fd",
					"1f9d1-1f3fc-200d-1f430-200d-1f9d1-1f3fe",
					"1f9d1-1f3fc-200d-1f430-200d-1f9d1-1f3ff",
					"1f9d1-1f3fd-200d-1f430-200d-1f9d1-1f3fb",
					"1f9d1-1f3fd-200d-1f430-200d-1f9d1-1f3fc",
					"1f9d1-1f3fd-200d-1f430-200d-1f9d1-1f3fe",
					"1f9d1-1f3fd-200d-1f430-200d-1f9d1-1f3ff",
					"1f9d1-1f3fe-200d-1f430-200d-1f9d1-1f3fb",
					"1f9d1-1f3fe-200d-1f430-200d-1f9d1-1f3fc",
					"1f9d1-1f3fe-200d-1f430-200d-1f9d1-1f3fd",
					"1f9d1-1f3fe-200d-1f430-200d-1f9d1-1f3ff",
					"1f9d1-1f3ff-200d-1f430-200d-1f9d1-1f3fb",
					"1f9d1-1f3ff-200d-1f430-200d-1f9d1-1f3fc",
					"1f9d1-1f3ff-200d-1f430-200d-1f9d1-1f3fd",
					"1f9d1-1f3ff-200d-1f430-200d-1f9d1-1f3fe"
				],
				a: "0.6"
			},
			{
				n: [
					"bff",
					"ear",
					"men",
					"pair",
					"twin",
					"bunny",
					"party",
					"bestie",
					"dancer",
					"double",
					"people",
					"partying",
					"soulmate",
					"twinsies",
					"identical",
					"counterpart",
					"men with bunny ears"
				],
				u: "1f46f-200d-2642-fe0f",
				v: [
					"1f468-1f3fb-200d-1f430-200d-1f468-1f3fc",
					"1f468-1f3fb-200d-1f430-200d-1f468-1f3fd",
					"1f468-1f3fb-200d-1f430-200d-1f468-1f3fe",
					"1f468-1f3fb-200d-1f430-200d-1f468-1f3ff",
					"1f468-1f3fc-200d-1f430-200d-1f468-1f3fb",
					"1f468-1f3fc-200d-1f430-200d-1f468-1f3fd",
					"1f468-1f3fc-200d-1f430-200d-1f468-1f3fe",
					"1f468-1f3fc-200d-1f430-200d-1f468-1f3ff",
					"1f468-1f3fd-200d-1f430-200d-1f468-1f3fb",
					"1f468-1f3fd-200d-1f430-200d-1f468-1f3fc",
					"1f468-1f3fd-200d-1f430-200d-1f468-1f3fe",
					"1f468-1f3fd-200d-1f430-200d-1f468-1f3ff",
					"1f468-1f3fe-200d-1f430-200d-1f468-1f3fb",
					"1f468-1f3fe-200d-1f430-200d-1f468-1f3fc",
					"1f468-1f3fe-200d-1f430-200d-1f468-1f3fd",
					"1f468-1f3fe-200d-1f430-200d-1f468-1f3ff",
					"1f468-1f3ff-200d-1f430-200d-1f468-1f3fb",
					"1f468-1f3ff-200d-1f430-200d-1f468-1f3fc",
					"1f468-1f3ff-200d-1f430-200d-1f468-1f3fd",
					"1f468-1f3ff-200d-1f430-200d-1f468-1f3fe",
					"1f46f-1f3fb-200d-2642-fe0f",
					"1f46f-1f3fc-200d-2642-fe0f",
					"1f46f-1f3fd-200d-2642-fe0f",
					"1f46f-1f3fe-200d-2642-fe0f",
					"1f46f-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"bff",
					"ear",
					"pair",
					"twin",
					"bunny",
					"party",
					"women",
					"bestie",
					"dancer",
					"double",
					"people",
					"partying",
					"soulmate",
					"twinsies",
					"identical",
					"counterpart",
					"women with bunny ears"
				],
				u: "1f46f-200d-2640-fe0f",
				v: [
					"1f469-1f3fb-200d-1f430-200d-1f469-1f3fc",
					"1f469-1f3fb-200d-1f430-200d-1f469-1f3fd",
					"1f469-1f3fb-200d-1f430-200d-1f469-1f3fe",
					"1f469-1f3fb-200d-1f430-200d-1f469-1f3ff",
					"1f469-1f3fc-200d-1f430-200d-1f469-1f3fb",
					"1f469-1f3fc-200d-1f430-200d-1f469-1f3fd",
					"1f469-1f3fc-200d-1f430-200d-1f469-1f3fe",
					"1f469-1f3fc-200d-1f430-200d-1f469-1f3ff",
					"1f469-1f3fd-200d-1f430-200d-1f469-1f3fb",
					"1f469-1f3fd-200d-1f430-200d-1f469-1f3fc",
					"1f469-1f3fd-200d-1f430-200d-1f469-1f3fe",
					"1f469-1f3fd-200d-1f430-200d-1f469-1f3ff",
					"1f469-1f3fe-200d-1f430-200d-1f469-1f3fb",
					"1f469-1f3fe-200d-1f430-200d-1f469-1f3fc",
					"1f469-1f3fe-200d-1f430-200d-1f469-1f3fd",
					"1f469-1f3fe-200d-1f430-200d-1f469-1f3ff",
					"1f469-1f3ff-200d-1f430-200d-1f469-1f3fb",
					"1f469-1f3ff-200d-1f430-200d-1f469-1f3fc",
					"1f469-1f3ff-200d-1f430-200d-1f469-1f3fd",
					"1f469-1f3ff-200d-1f430-200d-1f469-1f3fe",
					"1f46f-1f3fb-200d-2640-fe0f",
					"1f46f-1f3fc-200d-2640-fe0f",
					"1f46f-1f3fd-200d-2640-fe0f",
					"1f46f-1f3fe-200d-2640-fe0f",
					"1f46f-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"day",
					"spa",
					"room",
					"relax",
					"sauna",
					"steam",
					"pamper",
					"person",
					"unwind",
					"luxurious",
					"steambath",
					"person in steamy room"
				],
				u: "1f9d6",
				v: [
					"1f9d6-1f3fb",
					"1f9d6-1f3fc",
					"1f9d6-1f3fd",
					"1f9d6-1f3fe",
					"1f9d6-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"day",
					"man",
					"spa",
					"room",
					"relax",
					"sauna",
					"steam",
					"pamper",
					"unwind",
					"luxurious",
					"steambath",
					"man in steamy room"
				],
				u: "1f9d6-200d-2642-fe0f",
				v: [
					"1f9d6-1f3fb-200d-2642-fe0f",
					"1f9d6-1f3fc-200d-2642-fe0f",
					"1f9d6-1f3fd-200d-2642-fe0f",
					"1f9d6-1f3fe-200d-2642-fe0f",
					"1f9d6-1f3ff-200d-2642-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"day",
					"spa",
					"room",
					"relax",
					"sauna",
					"steam",
					"woman",
					"pamper",
					"unwind",
					"luxurious",
					"steambath",
					"woman in steamy room"
				],
				u: "1f9d6-200d-2640-fe0f",
				v: [
					"1f9d6-1f3fb-200d-2640-fe0f",
					"1f9d6-1f3fc-200d-2640-fe0f",
					"1f9d6-1f3fd-200d-2640-fe0f",
					"1f9d6-1f3fe-200d-2640-fe0f",
					"1f9d6-1f3ff-200d-2640-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"up",
					"rock",
					"climb",
					"scale",
					"person",
					"climber",
					"climbing",
					"mountain",
					"person climbing"
				],
				u: "1f9d7",
				v: [
					"1f9d7-1f3fb",
					"1f9d7-1f3fc",
					"1f9d7-1f3fd",
					"1f9d7-1f3fe",
					"1f9d7-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"up",
					"man",
					"rock",
					"climb",
					"scale",
					"climber",
					"climbing",
					"mountain",
					"man climbing"
				],
				u: "1f9d7-200d-2642-fe0f",
				v: [
					"1f9d7-1f3fb-200d-2642-fe0f",
					"1f9d7-1f3fc-200d-2642-fe0f",
					"1f9d7-1f3fd-200d-2642-fe0f",
					"1f9d7-1f3fe-200d-2642-fe0f",
					"1f9d7-1f3ff-200d-2642-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"up",
					"rock",
					"climb",
					"scale",
					"woman",
					"climber",
					"climbing",
					"mountain",
					"woman climbing"
				],
				u: "1f9d7-200d-2640-fe0f",
				v: [
					"1f9d7-1f3fb-200d-2640-fe0f",
					"1f9d7-1f3fc-200d-2640-fe0f",
					"1f9d7-1f3fd-200d-2640-fe0f",
					"1f9d7-1f3fe-200d-2640-fe0f",
					"1f9d7-1f3ff-200d-2640-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"sword",
					"fencer",
					"person",
					"fencing",
					"person fencing"
				],
				u: "1f93a",
				a: "3"
			},
			{
				n: [
					"horse",
					"sport",
					"jockey",
					"racing",
					"riding",
					"racehorse",
					"horse racing"
				],
				u: "1f3c7",
				v: [
					"1f3c7-1f3fb",
					"1f3c7-1f3fc",
					"1f3c7-1f3fd",
					"1f3c7-1f3fe",
					"1f3c7-1f3ff"
				],
				a: "1"
			},
			{
				n: [
					"ski",
					"snow",
					"skier"
				],
				u: "26f7-fe0f",
				a: "0.7"
			},
			{
				n: [
					"ski",
					"snow",
					"sport",
					"snowboard",
					"snowboarder"
				],
				u: "1f3c2",
				v: [
					"1f3c2-1f3fb",
					"1f3c2-1f3fc",
					"1f3c2-1f3fd",
					"1f3c2-1f3fe",
					"1f3c2-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"pga",
					"tee",
					"ball",
					"golf",
					"putt",
					"caddy",
					"green",
					"range",
					"birdie",
					"person",
					"driving",
					"golfing",
					"person golfing"
				],
				u: "1f3cc-fe0f",
				v: [
					"1f3cc-1f3fb",
					"1f3cc-1f3fc",
					"1f3cc-1f3fd",
					"1f3cc-1f3fe",
					"1f3cc-1f3ff"
				],
				a: "0.7"
			},
			{
				n: [
					"man",
					"pga",
					"tee",
					"ball",
					"golf",
					"putt",
					"caddy",
					"green",
					"range",
					"birdie",
					"driving",
					"golfing",
					"man golfing"
				],
				u: "1f3cc-fe0f-200d-2642-fe0f",
				v: [
					"1f3cc-1f3fb-200d-2642-fe0f",
					"1f3cc-1f3fc-200d-2642-fe0f",
					"1f3cc-1f3fd-200d-2642-fe0f",
					"1f3cc-1f3fe-200d-2642-fe0f",
					"1f3cc-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"pga",
					"tee",
					"ball",
					"golf",
					"putt",
					"caddy",
					"green",
					"range",
					"woman",
					"birdie",
					"driving",
					"golfing",
					"woman golfing"
				],
				u: "1f3cc-fe0f-200d-2640-fe0f",
				v: [
					"1f3cc-1f3fb-200d-2640-fe0f",
					"1f3cc-1f3fc-200d-2640-fe0f",
					"1f3cc-1f3fd-200d-2640-fe0f",
					"1f3cc-1f3fe-200d-2640-fe0f",
					"1f3cc-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"surf",
					"beach",
					"ocean",
					"sport",
					"swell",
					"waves",
					"person",
					"surfer",
					"surfing",
					"person surfing"
				],
				u: "1f3c4",
				v: [
					"1f3c4-1f3fb",
					"1f3c4-1f3fc",
					"1f3c4-1f3fd",
					"1f3c4-1f3fe",
					"1f3c4-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"surf",
					"beach",
					"ocean",
					"sport",
					"swell",
					"waves",
					"surfer",
					"surfing",
					"man surfing"
				],
				u: "1f3c4-200d-2642-fe0f",
				v: [
					"1f3c4-1f3fb-200d-2642-fe0f",
					"1f3c4-1f3fc-200d-2642-fe0f",
					"1f3c4-1f3fd-200d-2642-fe0f",
					"1f3c4-1f3fe-200d-2642-fe0f",
					"1f3c4-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"surf",
					"beach",
					"ocean",
					"sport",
					"swell",
					"waves",
					"person",
					"surfer",
					"surfing",
					"woman surfing"
				],
				u: "1f3c4-200d-2640-fe0f",
				v: [
					"1f3c4-1f3fb-200d-2640-fe0f",
					"1f3c4-1f3fc-200d-2640-fe0f",
					"1f3c4-1f3fd-200d-2640-fe0f",
					"1f3c4-1f3fe-200d-2640-fe0f",
					"1f3c4-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"oar",
					"row",
					"boat",
					"lake",
					"raft",
					"canoe",
					"river",
					"cruise",
					"paddle",
					"person",
					"rowing",
					"fishing",
					"rowboat",
					"person rowing boat"
				],
				u: "1f6a3",
				v: [
					"1f6a3-1f3fb",
					"1f6a3-1f3fc",
					"1f6a3-1f3fd",
					"1f6a3-1f3fe",
					"1f6a3-1f3ff"
				],
				a: "1"
			},
			{
				n: [
					"man",
					"oar",
					"row",
					"boat",
					"lake",
					"raft",
					"canoe",
					"river",
					"cruise",
					"paddle",
					"rowing",
					"fishing",
					"rowboat",
					"man rowing boat"
				],
				u: "1f6a3-200d-2642-fe0f",
				v: [
					"1f6a3-1f3fb-200d-2642-fe0f",
					"1f6a3-1f3fc-200d-2642-fe0f",
					"1f6a3-1f3fd-200d-2642-fe0f",
					"1f6a3-1f3fe-200d-2642-fe0f",
					"1f6a3-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"oar",
					"row",
					"boat",
					"lake",
					"raft",
					"canoe",
					"river",
					"woman",
					"cruise",
					"paddle",
					"rowing",
					"fishing",
					"rowboat",
					"woman rowing boat"
				],
				u: "1f6a3-200d-2640-fe0f",
				v: [
					"1f6a3-1f3fb-200d-2640-fe0f",
					"1f6a3-1f3fc-200d-2640-fe0f",
					"1f6a3-1f3fd-200d-2640-fe0f",
					"1f6a3-1f3fe-200d-2640-fe0f",
					"1f6a3-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"swim",
					"sport",
					"person",
					"swimmer",
					"swimming",
					"freestyle",
					"triathlon",
					"person swimming"
				],
				u: "1f3ca",
				v: [
					"1f3ca-1f3fb",
					"1f3ca-1f3fc",
					"1f3ca-1f3fd",
					"1f3ca-1f3fe",
					"1f3ca-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"man",
					"swim",
					"sport",
					"swimmer",
					"swimming",
					"freestyle",
					"triathlon",
					"man swimming"
				],
				u: "1f3ca-200d-2642-fe0f",
				v: [
					"1f3ca-1f3fb-200d-2642-fe0f",
					"1f3ca-1f3fc-200d-2642-fe0f",
					"1f3ca-1f3fd-200d-2642-fe0f",
					"1f3ca-1f3fe-200d-2642-fe0f",
					"1f3ca-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"man",
					"swim",
					"sport",
					"swimmer",
					"swimming",
					"freestyle",
					"triathlon",
					"woman swimming"
				],
				u: "1f3ca-200d-2640-fe0f",
				v: [
					"1f3ca-1f3fb-200d-2640-fe0f",
					"1f3ca-1f3fc-200d-2640-fe0f",
					"1f3ca-1f3fd-200d-2640-fe0f",
					"1f3ca-1f3fe-200d-2640-fe0f",
					"1f3ca-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"net",
					"ball",
					"throw",
					"person",
					"player",
					"dribble",
					"athletic",
					"bouncing",
					"basketball",
					"championship",
					"person bouncing ball"
				],
				u: "26f9-fe0f",
				v: [
					"26f9-1f3fb",
					"26f9-1f3fc",
					"26f9-1f3fd",
					"26f9-1f3fe",
					"26f9-1f3ff"
				],
				a: "0.7"
			},
			{
				n: [
					"man",
					"net",
					"ball",
					"throw",
					"player",
					"dribble",
					"athletic",
					"bouncing",
					"basketball",
					"championship",
					"man bouncing ball"
				],
				u: "26f9-fe0f-200d-2642-fe0f",
				v: [
					"26f9-1f3fb-200d-2642-fe0f",
					"26f9-1f3fc-200d-2642-fe0f",
					"26f9-1f3fd-200d-2642-fe0f",
					"26f9-1f3fe-200d-2642-fe0f",
					"26f9-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"net",
					"ball",
					"throw",
					"woman",
					"player",
					"dribble",
					"athletic",
					"bouncing",
					"basketball",
					"championship",
					"woman bouncing ball"
				],
				u: "26f9-fe0f-200d-2640-fe0f",
				v: [
					"26f9-1f3fb-200d-2640-fe0f",
					"26f9-1f3fc-200d-2640-fe0f",
					"26f9-1f3fd-200d-2640-fe0f",
					"26f9-1f3fe-200d-2640-fe0f",
					"26f9-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"lifter",
					"person",
					"weight",
					"barbell",
					"lifting",
					"weights",
					"workout",
					"deadlift",
					"bodybuilder",
					"powerlifting",
					"weightlifter",
					"person lifting weights"
				],
				u: "1f3cb-fe0f",
				v: [
					"1f3cb-1f3fb",
					"1f3cb-1f3fc",
					"1f3cb-1f3fd",
					"1f3cb-1f3fe",
					"1f3cb-1f3ff"
				],
				a: "0.7"
			},
			{
				n: [
					"man",
					"lifter",
					"weight",
					"barbell",
					"lifting",
					"weights",
					"workout",
					"deadlift",
					"bodybuilder",
					"powerlifting",
					"weightlifter",
					"man lifting weights"
				],
				u: "1f3cb-fe0f-200d-2642-fe0f",
				v: [
					"1f3cb-1f3fb-200d-2642-fe0f",
					"1f3cb-1f3fc-200d-2642-fe0f",
					"1f3cb-1f3fd-200d-2642-fe0f",
					"1f3cb-1f3fe-200d-2642-fe0f",
					"1f3cb-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"woman",
					"lifter",
					"weight",
					"barbell",
					"lifting",
					"weights",
					"workout",
					"deadlift",
					"bodybuilder",
					"powerlifting",
					"weightlifter",
					"woman lifting weights"
				],
				u: "1f3cb-fe0f-200d-2640-fe0f",
				v: [
					"1f3cb-1f3fb-200d-2640-fe0f",
					"1f3cb-1f3fc-200d-2640-fe0f",
					"1f3cb-1f3fd-200d-2640-fe0f",
					"1f3cb-1f3fe-200d-2640-fe0f",
					"1f3cb-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"bike",
					"cycle",
					"sport",
					"biking",
					"person",
					"riding",
					"bicycle",
					"cyclist",
					"bicyclist",
					"person biking"
				],
				u: "1f6b4",
				v: [
					"1f6b4-1f3fb",
					"1f6b4-1f3fc",
					"1f6b4-1f3fd",
					"1f6b4-1f3fe",
					"1f6b4-1f3ff"
				],
				a: "1"
			},
			{
				n: [
					"man",
					"bike",
					"cycle",
					"sport",
					"biking",
					"riding",
					"bicycle",
					"cyclist",
					"bicyclist",
					"man biking"
				],
				u: "1f6b4-200d-2642-fe0f",
				v: [
					"1f6b4-1f3fb-200d-2642-fe0f",
					"1f6b4-1f3fc-200d-2642-fe0f",
					"1f6b4-1f3fd-200d-2642-fe0f",
					"1f6b4-1f3fe-200d-2642-fe0f",
					"1f6b4-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"bike",
					"cycle",
					"sport",
					"woman",
					"biking",
					"riding",
					"bicycle",
					"cyclist",
					"bicyclist",
					"woman biking"
				],
				u: "1f6b4-200d-2640-fe0f",
				v: [
					"1f6b4-1f3fb-200d-2640-fe0f",
					"1f6b4-1f3fc-200d-2640-fe0f",
					"1f6b4-1f3fd-200d-2640-fe0f",
					"1f6b4-1f3fe-200d-2640-fe0f",
					"1f6b4-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"bike",
					"cycle",
					"sport",
					"biking",
					"person",
					"riding",
					"bicycle",
					"cyclist",
					"mountain",
					"bicyclist",
					"person mountain biking"
				],
				u: "1f6b5",
				v: [
					"1f6b5-1f3fb",
					"1f6b5-1f3fc",
					"1f6b5-1f3fd",
					"1f6b5-1f3fe",
					"1f6b5-1f3ff"
				],
				a: "1"
			},
			{
				n: [
					"man",
					"bike",
					"cycle",
					"sport",
					"biking",
					"riding",
					"bicycle",
					"cyclist",
					"mountain",
					"bicyclist",
					"man mountain biking"
				],
				u: "1f6b5-200d-2642-fe0f",
				v: [
					"1f6b5-1f3fb-200d-2642-fe0f",
					"1f6b5-1f3fc-200d-2642-fe0f",
					"1f6b5-1f3fd-200d-2642-fe0f",
					"1f6b5-1f3fe-200d-2642-fe0f",
					"1f6b5-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"bike",
					"cycle",
					"sport",
					"woman",
					"biking",
					"riding",
					"bicycle",
					"cyclist",
					"mountain",
					"bicyclist",
					"woman mountain biking"
				],
				u: "1f6b5-200d-2640-fe0f",
				v: [
					"1f6b5-1f3fb-200d-2640-fe0f",
					"1f6b5-1f3fc-200d-2640-fe0f",
					"1f6b5-1f3fd-200d-2640-fe0f",
					"1f6b5-1f3fe-200d-2640-fe0f",
					"1f6b5-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"flip",
					"happy",
					"active",
					"person",
					"excited",
					"cartwheel",
					"gymnastics",
					"somersault",
					"cartwheeling",
					"person cartwheeling"
				],
				u: "1f938",
				v: [
					"1f938-1f3fb",
					"1f938-1f3fc",
					"1f938-1f3fd",
					"1f938-1f3fe",
					"1f938-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"man",
					"flip",
					"happy",
					"active",
					"excited",
					"cartwheel",
					"gymnastics",
					"somersault",
					"cartwheeling",
					"man cartwheeling"
				],
				u: "1f938-200d-2642-fe0f",
				v: [
					"1f938-1f3fb-200d-2642-fe0f",
					"1f938-1f3fc-200d-2642-fe0f",
					"1f938-1f3fd-200d-2642-fe0f",
					"1f938-1f3fe-200d-2642-fe0f",
					"1f938-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"flip",
					"happy",
					"woman",
					"active",
					"excited",
					"cartwheel",
					"gymnastics",
					"somersault",
					"cartwheeling",
					"woman cartwheeling"
				],
				u: "1f938-200d-2640-fe0f",
				v: [
					"1f938-1f3fb-200d-2640-fe0f",
					"1f938-1f3fc-200d-2640-fe0f",
					"1f938-1f3fd-200d-2640-fe0f",
					"1f938-1f3fe-200d-2640-fe0f",
					"1f938-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"duel",
					"ring",
					"combat",
					"people",
					"grapple",
					"wrestle",
					"wrestling",
					"tournament",
					"people wrestling"
				],
				u: "1f93c",
				v: [
					"1f93c-1f3fb",
					"1f93c-1f3fc",
					"1f93c-1f3fd",
					"1f93c-1f3fe",
					"1f93c-1f3ff",
					"1f9d1-1f3fb-200d-1faef-200d-1f9d1-1f3fc",
					"1f9d1-1f3fb-200d-1faef-200d-1f9d1-1f3fd",
					"1f9d1-1f3fb-200d-1faef-200d-1f9d1-1f3fe",
					"1f9d1-1f3fb-200d-1faef-200d-1f9d1-1f3ff",
					"1f9d1-1f3fc-200d-1faef-200d-1f9d1-1f3fb",
					"1f9d1-1f3fc-200d-1faef-200d-1f9d1-1f3fd",
					"1f9d1-1f3fc-200d-1faef-200d-1f9d1-1f3fe",
					"1f9d1-1f3fc-200d-1faef-200d-1f9d1-1f3ff",
					"1f9d1-1f3fd-200d-1faef-200d-1f9d1-1f3fb",
					"1f9d1-1f3fd-200d-1faef-200d-1f9d1-1f3fc",
					"1f9d1-1f3fd-200d-1faef-200d-1f9d1-1f3fe",
					"1f9d1-1f3fd-200d-1faef-200d-1f9d1-1f3ff",
					"1f9d1-1f3fe-200d-1faef-200d-1f9d1-1f3fb",
					"1f9d1-1f3fe-200d-1faef-200d-1f9d1-1f3fc",
					"1f9d1-1f3fe-200d-1faef-200d-1f9d1-1f3fd",
					"1f9d1-1f3fe-200d-1faef-200d-1f9d1-1f3ff",
					"1f9d1-1f3ff-200d-1faef-200d-1f9d1-1f3fb",
					"1f9d1-1f3ff-200d-1faef-200d-1f9d1-1f3fc",
					"1f9d1-1f3ff-200d-1faef-200d-1f9d1-1f3fd",
					"1f9d1-1f3ff-200d-1faef-200d-1f9d1-1f3fe"
				],
				a: "3"
			},
			{
				n: [
					"men",
					"duel",
					"ring",
					"combat",
					"grapple",
					"wrestle",
					"wrestling",
					"tournament",
					"men wrestling"
				],
				u: "1f93c-200d-2642-fe0f",
				v: [
					"1f468-1f3fb-200d-1faef-200d-1f468-1f3fc",
					"1f468-1f3fb-200d-1faef-200d-1f468-1f3fd",
					"1f468-1f3fb-200d-1faef-200d-1f468-1f3fe",
					"1f468-1f3fb-200d-1faef-200d-1f468-1f3ff",
					"1f468-1f3fc-200d-1faef-200d-1f468-1f3fb",
					"1f468-1f3fc-200d-1faef-200d-1f468-1f3fd",
					"1f468-1f3fc-200d-1faef-200d-1f468-1f3fe",
					"1f468-1f3fc-200d-1faef-200d-1f468-1f3ff",
					"1f468-1f3fd-200d-1faef-200d-1f468-1f3fb",
					"1f468-1f3fd-200d-1faef-200d-1f468-1f3fc",
					"1f468-1f3fd-200d-1faef-200d-1f468-1f3fe",
					"1f468-1f3fd-200d-1faef-200d-1f468-1f3ff",
					"1f468-1f3fe-200d-1faef-200d-1f468-1f3fb",
					"1f468-1f3fe-200d-1faef-200d-1f468-1f3fc",
					"1f468-1f3fe-200d-1faef-200d-1f468-1f3fd",
					"1f468-1f3fe-200d-1faef-200d-1f468-1f3ff",
					"1f468-1f3ff-200d-1faef-200d-1f468-1f3fb",
					"1f468-1f3ff-200d-1faef-200d-1f468-1f3fc",
					"1f468-1f3ff-200d-1faef-200d-1f468-1f3fd",
					"1f468-1f3ff-200d-1faef-200d-1f468-1f3fe",
					"1f93c-1f3fb-200d-2642-fe0f",
					"1f93c-1f3fc-200d-2642-fe0f",
					"1f93c-1f3fd-200d-2642-fe0f",
					"1f93c-1f3fe-200d-2642-fe0f",
					"1f93c-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"duel",
					"ring",
					"women",
					"combat",
					"grapple",
					"wrestle",
					"wrestling",
					"tournament",
					"women wrestling"
				],
				u: "1f93c-200d-2640-fe0f",
				v: [
					"1f469-1f3fb-200d-1faef-200d-1f469-1f3fc",
					"1f469-1f3fb-200d-1faef-200d-1f469-1f3fd",
					"1f469-1f3fb-200d-1faef-200d-1f469-1f3fe",
					"1f469-1f3fb-200d-1faef-200d-1f469-1f3ff",
					"1f469-1f3fc-200d-1faef-200d-1f469-1f3fb",
					"1f469-1f3fc-200d-1faef-200d-1f469-1f3fd",
					"1f469-1f3fc-200d-1faef-200d-1f469-1f3fe",
					"1f469-1f3fc-200d-1faef-200d-1f469-1f3ff",
					"1f469-1f3fd-200d-1faef-200d-1f469-1f3fb",
					"1f469-1f3fd-200d-1faef-200d-1f469-1f3fc",
					"1f469-1f3fd-200d-1faef-200d-1f469-1f3fe",
					"1f469-1f3fd-200d-1faef-200d-1f469-1f3ff",
					"1f469-1f3fe-200d-1faef-200d-1f469-1f3fb",
					"1f469-1f3fe-200d-1faef-200d-1f469-1f3fc",
					"1f469-1f3fe-200d-1faef-200d-1f469-1f3fd",
					"1f469-1f3fe-200d-1faef-200d-1f469-1f3ff",
					"1f469-1f3ff-200d-1faef-200d-1f469-1f3fb",
					"1f469-1f3ff-200d-1faef-200d-1f469-1f3fc",
					"1f469-1f3ff-200d-1faef-200d-1f469-1f3fd",
					"1f469-1f3ff-200d-1faef-200d-1f469-1f3fe",
					"1f93c-1f3fb-200d-2640-fe0f",
					"1f93c-1f3fc-200d-2640-fe0f",
					"1f93c-1f3fd-200d-2640-fe0f",
					"1f93c-1f3fe-200d-2640-fe0f",
					"1f93c-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"polo",
					"sport",
					"water",
					"person",
					"playing",
					"swimming",
					"waterpolo",
					"person playing water polo"
				],
				u: "1f93d",
				v: [
					"1f93d-1f3fb",
					"1f93d-1f3fc",
					"1f93d-1f3fd",
					"1f93d-1f3fe",
					"1f93d-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"man",
					"polo",
					"sport",
					"water",
					"playing",
					"swimming",
					"waterpolo",
					"man playing water polo"
				],
				u: "1f93d-200d-2642-fe0f",
				v: [
					"1f93d-1f3fb-200d-2642-fe0f",
					"1f93d-1f3fc-200d-2642-fe0f",
					"1f93d-1f3fd-200d-2642-fe0f",
					"1f93d-1f3fe-200d-2642-fe0f",
					"1f93d-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"polo",
					"sport",
					"water",
					"woman",
					"playing",
					"swimming",
					"waterpolo",
					"woman playing water polo"
				],
				u: "1f93d-200d-2640-fe0f",
				v: [
					"1f93d-1f3fb-200d-2640-fe0f",
					"1f93d-1f3fc-200d-2640-fe0f",
					"1f93d-1f3fd-200d-2640-fe0f",
					"1f93d-1f3fe-200d-2640-fe0f",
					"1f93d-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"lob",
					"ball",
					"hurl",
					"toss",
					"catch",
					"chuck",
					"pitch",
					"sport",
					"throw",
					"person",
					"playing",
					"handball",
					"athletics",
					"person playing handball"
				],
				u: "1f93e",
				v: [
					"1f93e-1f3fb",
					"1f93e-1f3fc",
					"1f93e-1f3fd",
					"1f93e-1f3fe",
					"1f93e-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"lob",
					"man",
					"ball",
					"hurl",
					"toss",
					"catch",
					"chuck",
					"pitch",
					"sport",
					"throw",
					"playing",
					"handball",
					"athletics",
					"man playing handball"
				],
				u: "1f93e-200d-2642-fe0f",
				v: [
					"1f93e-1f3fb-200d-2642-fe0f",
					"1f93e-1f3fc-200d-2642-fe0f",
					"1f93e-1f3fd-200d-2642-fe0f",
					"1f93e-1f3fe-200d-2642-fe0f",
					"1f93e-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"lob",
					"ball",
					"hurl",
					"toss",
					"catch",
					"chuck",
					"pitch",
					"sport",
					"throw",
					"woman",
					"playing",
					"handball",
					"athletics",
					"woman playing handball"
				],
				u: "1f93e-200d-2640-fe0f",
				v: [
					"1f93e-1f3fb-200d-2640-fe0f",
					"1f93e-1f3fc-200d-2640-fe0f",
					"1f93e-1f3fd-200d-2640-fe0f",
					"1f93e-1f3fe-200d-2640-fe0f",
					"1f93e-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"act",
					"skill",
					"handle",
					"juggle",
					"manage",
					"person",
					"balance",
					"juggling",
					"balancing",
					"multitask",
					"person juggling"
				],
				u: "1f939",
				v: [
					"1f939-1f3fb",
					"1f939-1f3fc",
					"1f939-1f3fd",
					"1f939-1f3fe",
					"1f939-1f3ff"
				],
				a: "3"
			},
			{
				n: [
					"act",
					"man",
					"skill",
					"handle",
					"juggle",
					"manage",
					"balance",
					"juggling",
					"balancing",
					"multitask",
					"man juggling"
				],
				u: "1f939-200d-2642-fe0f",
				v: [
					"1f939-1f3fb-200d-2642-fe0f",
					"1f939-1f3fc-200d-2642-fe0f",
					"1f939-1f3fd-200d-2642-fe0f",
					"1f939-1f3fe-200d-2642-fe0f",
					"1f939-1f3ff-200d-2642-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"act",
					"skill",
					"woman",
					"handle",
					"juggle",
					"manage",
					"balance",
					"juggling",
					"balancing",
					"multitask",
					"woman juggling"
				],
				u: "1f939-200d-2640-fe0f",
				v: [
					"1f939-1f3fb-200d-2640-fe0f",
					"1f939-1f3fc-200d-2640-fe0f",
					"1f939-1f3fd-200d-2640-fe0f",
					"1f939-1f3fe-200d-2640-fe0f",
					"1f939-1f3ff-200d-2640-fe0f"
				],
				a: "4"
			},
			{
				n: [
					"zen",
					"legs",
					"yoga",
					"yogi",
					"cross",
					"lotus",
					"peace",
					"relax",
					"legged",
					"person",
					"position",
					"serenity",
					"meditation",
					"person in lotus position"
				],
				u: "1f9d8",
				v: [
					"1f9d8-1f3fb",
					"1f9d8-1f3fc",
					"1f9d8-1f3fd",
					"1f9d8-1f3fe",
					"1f9d8-1f3ff"
				],
				a: "5"
			},
			{
				n: [
					"man",
					"zen",
					"legs",
					"yoga",
					"yogi",
					"cross",
					"lotus",
					"peace",
					"relax",
					"legged",
					"position",
					"serenity",
					"meditation",
					"man in lotus position"
				],
				u: "1f9d8-200d-2642-fe0f",
				v: [
					"1f9d8-1f3fb-200d-2642-fe0f",
					"1f9d8-1f3fc-200d-2642-fe0f",
					"1f9d8-1f3fd-200d-2642-fe0f",
					"1f9d8-1f3fe-200d-2642-fe0f",
					"1f9d8-1f3ff-200d-2642-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"zen",
					"legs",
					"yoga",
					"yogi",
					"cross",
					"lotus",
					"peace",
					"relax",
					"woman",
					"legged",
					"position",
					"serenity",
					"meditation",
					"woman in lotus position"
				],
				u: "1f9d8-200d-2640-fe0f",
				v: [
					"1f9d8-1f3fb-200d-2640-fe0f",
					"1f9d8-1f3fc-200d-2640-fe0f",
					"1f9d8-1f3fd-200d-2640-fe0f",
					"1f9d8-1f3fe-200d-2640-fe0f",
					"1f9d8-1f3ff-200d-2640-fe0f"
				],
				a: "5"
			},
			{
				n: [
					"tub",
					"bath",
					"person",
					"taking",
					"bathtub",
					"person taking bath"
				],
				u: "1f6c0",
				v: [
					"1f6c0-1f3fb",
					"1f6c0-1f3fc",
					"1f6c0-1f3fd",
					"1f6c0-1f3fe",
					"1f6c0-1f3ff"
				],
				a: "0.6"
			},
			{
				n: [
					"bed",
					"nap",
					"zzz",
					"good",
					"hotel",
					"night",
					"sleep",
					"tired",
					"person",
					"bedtime",
					"goodnight",
					"person in bed"
				],
				u: "1f6cc",
				v: [
					"1f6cc-1f3fb",
					"1f6cc-1f3fc",
					"1f6cc-1f3fd",
					"1f6cc-1f3fe",
					"1f6cc-1f3ff"
				],
				a: "1"
			},
			{
				n: [
					"bae",
					"bff",
					"hand",
					"hold",
					"flirt",
					"twins",
					"bestie",
					"couple",
					"dating",
					"people",
					"friends",
					"people holding hands"
				],
				u: "1f9d1-200d-1f91d-200d-1f9d1",
				v: [
					"1f9d1-1f3fb-200d-1f91d-200d-1f9d1-1f3fb",
					"1f9d1-1f3fb-200d-1f91d-200d-1f9d1-1f3fc",
					"1f9d1-1f3fb-200d-1f91d-200d-1f9d1-1f3fd",
					"1f9d1-1f3fb-200d-1f91d-200d-1f9d1-1f3fe",
					"1f9d1-1f3fb-200d-1f91d-200d-1f9d1-1f3ff",
					"1f9d1-1f3fc-200d-1f91d-200d-1f9d1-1f3fb",
					"1f9d1-1f3fc-200d-1f91d-200d-1f9d1-1f3fc",
					"1f9d1-1f3fc-200d-1f91d-200d-1f9d1-1f3fd",
					"1f9d1-1f3fc-200d-1f91d-200d-1f9d1-1f3fe",
					"1f9d1-1f3fc-200d-1f91d-200d-1f9d1-1f3ff",
					"1f9d1-1f3fd-200d-1f91d-200d-1f9d1-1f3fb",
					"1f9d1-1f3fd-200d-1f91d-200d-1f9d1-1f3fc",
					"1f9d1-1f3fd-200d-1f91d-200d-1f9d1-1f3fd",
					"1f9d1-1f3fd-200d-1f91d-200d-1f9d1-1f3fe",
					"1f9d1-1f3fd-200d-1f91d-200d-1f9d1-1f3ff",
					"1f9d1-1f3fe-200d-1f91d-200d-1f9d1-1f3fb",
					"1f9d1-1f3fe-200d-1f91d-200d-1f9d1-1f3fc",
					"1f9d1-1f3fe-200d-1f91d-200d-1f9d1-1f3fd",
					"1f9d1-1f3fe-200d-1f91d-200d-1f9d1-1f3fe",
					"1f9d1-1f3fe-200d-1f91d-200d-1f9d1-1f3ff",
					"1f9d1-1f3ff-200d-1f91d-200d-1f9d1-1f3fb",
					"1f9d1-1f3ff-200d-1f91d-200d-1f9d1-1f3fc",
					"1f9d1-1f3ff-200d-1f91d-200d-1f9d1-1f3fd",
					"1f9d1-1f3ff-200d-1f91d-200d-1f9d1-1f3fe",
					"1f9d1-1f3ff-200d-1f91d-200d-1f9d1-1f3ff"
				],
				a: "12"
			},
			{
				n: [
					"bae",
					"bff",
					"hand",
					"hold",
					"flirt",
					"girls",
					"twins",
					"women",
					"bestie",
					"couple",
					"dating",
					"friends",
					"sisters",
					"women holding hands"
				],
				u: "1f46d",
				v: [
					"1f46d-1f3fb",
					"1f46d-1f3fc",
					"1f46d-1f3fd",
					"1f46d-1f3fe",
					"1f46d-1f3ff",
					"1f469-1f3fb-200d-1f91d-200d-1f469-1f3fc",
					"1f469-1f3fb-200d-1f91d-200d-1f469-1f3fd",
					"1f469-1f3fb-200d-1f91d-200d-1f469-1f3fe",
					"1f469-1f3fb-200d-1f91d-200d-1f469-1f3ff",
					"1f469-1f3fc-200d-1f91d-200d-1f469-1f3fb",
					"1f469-1f3fc-200d-1f91d-200d-1f469-1f3fd",
					"1f469-1f3fc-200d-1f91d-200d-1f469-1f3fe",
					"1f469-1f3fc-200d-1f91d-200d-1f469-1f3ff",
					"1f469-1f3fd-200d-1f91d-200d-1f469-1f3fb",
					"1f469-1f3fd-200d-1f91d-200d-1f469-1f3fc",
					"1f469-1f3fd-200d-1f91d-200d-1f469-1f3fe",
					"1f469-1f3fd-200d-1f91d-200d-1f469-1f3ff",
					"1f469-1f3fe-200d-1f91d-200d-1f469-1f3fb",
					"1f469-1f3fe-200d-1f91d-200d-1f469-1f3fc",
					"1f469-1f3fe-200d-1f91d-200d-1f469-1f3fd",
					"1f469-1f3fe-200d-1f91d-200d-1f469-1f3ff",
					"1f469-1f3ff-200d-1f91d-200d-1f469-1f3fb",
					"1f469-1f3ff-200d-1f91d-200d-1f469-1f3fc",
					"1f469-1f3ff-200d-1f91d-200d-1f469-1f3fd",
					"1f469-1f3ff-200d-1f91d-200d-1f469-1f3fe"
				],
				a: "1"
			},
			{
				n: [
					"bae",
					"bff",
					"man",
					"hand",
					"hold",
					"flirt",
					"twins",
					"woman",
					"bestie",
					"couple",
					"dating",
					"friends",
					"woman and man holding hands"
				],
				u: "1f46b",
				v: [
					"1f46b-1f3fb",
					"1f46b-1f3fc",
					"1f46b-1f3fd",
					"1f46b-1f3fe",
					"1f46b-1f3ff",
					"1f469-1f3fb-200d-1f91d-200d-1f468-1f3fc",
					"1f469-1f3fb-200d-1f91d-200d-1f468-1f3fd",
					"1f469-1f3fb-200d-1f91d-200d-1f468-1f3fe",
					"1f469-1f3fb-200d-1f91d-200d-1f468-1f3ff",
					"1f469-1f3fc-200d-1f91d-200d-1f468-1f3fb",
					"1f469-1f3fc-200d-1f91d-200d-1f468-1f3fd",
					"1f469-1f3fc-200d-1f91d-200d-1f468-1f3fe",
					"1f469-1f3fc-200d-1f91d-200d-1f468-1f3ff",
					"1f469-1f3fd-200d-1f91d-200d-1f468-1f3fb",
					"1f469-1f3fd-200d-1f91d-200d-1f468-1f3fc",
					"1f469-1f3fd-200d-1f91d-200d-1f468-1f3fe",
					"1f469-1f3fd-200d-1f91d-200d-1f468-1f3ff",
					"1f469-1f3fe-200d-1f91d-200d-1f468-1f3fb",
					"1f469-1f3fe-200d-1f91d-200d-1f468-1f3fc",
					"1f469-1f3fe-200d-1f91d-200d-1f468-1f3fd",
					"1f469-1f3fe-200d-1f91d-200d-1f468-1f3ff",
					"1f469-1f3ff-200d-1f91d-200d-1f468-1f3fb",
					"1f469-1f3ff-200d-1f91d-200d-1f468-1f3fc",
					"1f469-1f3ff-200d-1f91d-200d-1f468-1f3fd",
					"1f469-1f3ff-200d-1f91d-200d-1f468-1f3fe"
				],
				a: "0.6"
			},
			{
				n: [
					"bae",
					"bff",
					"men",
					"boys",
					"hand",
					"hold",
					"flirt",
					"twins",
					"bestie",
					"couple",
					"dating",
					"friends",
					"brothers",
					"men holding hands"
				],
				u: "1f46c",
				v: [
					"1f46c-1f3fb",
					"1f46c-1f3fc",
					"1f46c-1f3fd",
					"1f46c-1f3fe",
					"1f46c-1f3ff",
					"1f468-1f3fb-200d-1f91d-200d-1f468-1f3fc",
					"1f468-1f3fb-200d-1f91d-200d-1f468-1f3fd",
					"1f468-1f3fb-200d-1f91d-200d-1f468-1f3fe",
					"1f468-1f3fb-200d-1f91d-200d-1f468-1f3ff",
					"1f468-1f3fc-200d-1f91d-200d-1f468-1f3fb",
					"1f468-1f3fc-200d-1f91d-200d-1f468-1f3fd",
					"1f468-1f3fc-200d-1f91d-200d-1f468-1f3fe",
					"1f468-1f3fc-200d-1f91d-200d-1f468-1f3ff",
					"1f468-1f3fd-200d-1f91d-200d-1f468-1f3fb",
					"1f468-1f3fd-200d-1f91d-200d-1f468-1f3fc",
					"1f468-1f3fd-200d-1f91d-200d-1f468-1f3fe",
					"1f468-1f3fd-200d-1f91d-200d-1f468-1f3ff",
					"1f468-1f3fe-200d-1f91d-200d-1f468-1f3fb",
					"1f468-1f3fe-200d-1f91d-200d-1f468-1f3fc",
					"1f468-1f3fe-200d-1f91d-200d-1f468-1f3fd",
					"1f468-1f3fe-200d-1f91d-200d-1f468-1f3ff",
					"1f468-1f3ff-200d-1f91d-200d-1f468-1f3fb",
					"1f468-1f3ff-200d-1f91d-200d-1f468-1f3fc",
					"1f468-1f3ff-200d-1f91d-200d-1f468-1f3fd",
					"1f468-1f3ff-200d-1f91d-200d-1f468-1f3fe"
				],
				a: "1"
			},
			{
				n: [
					"bae",
					"kiss",
					"babe",
					"date",
					"love",
					"mwah",
					"xoxo",
					"heart",
					"couple",
					"dating",
					"person",
					"romance",
					"together",
					"anniversary"
				],
				u: "1f48f",
				v: [
					"1f48f-1f3fb",
					"1f48f-1f3fc",
					"1f48f-1f3fd",
					"1f48f-1f3fe",
					"1f48f-1f3ff",
					"1f9d1-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fc",
					"1f9d1-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fd",
					"1f9d1-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fe",
					"1f9d1-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3ff",
					"1f9d1-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fb",
					"1f9d1-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fd",
					"1f9d1-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fe",
					"1f9d1-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3ff",
					"1f9d1-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fb",
					"1f9d1-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fc",
					"1f9d1-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fe",
					"1f9d1-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3ff",
					"1f9d1-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fb",
					"1f9d1-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fc",
					"1f9d1-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fd",
					"1f9d1-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3ff",
					"1f9d1-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fb",
					"1f9d1-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fc",
					"1f9d1-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fd",
					"1f9d1-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f9d1-1f3fe"
				],
				a: "0.6"
			},
			{
				n: [
					"bae",
					"man",
					"babe",
					"date",
					"kiss",
					"love",
					"mwah",
					"xoxo",
					"heart",
					"woman",
					"couple",
					"dating",
					"person",
					"romance",
					"together",
					"anniversary",
					"kiss: woman, man"
				],
				u: "1f469-200d-2764-fe0f-200d-1f48b-200d-1f468",
				v: [
					"1f469-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fb",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fc",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fd",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fe",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3ff",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fb",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fc",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fd",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fe",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3ff",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fb",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fc",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fd",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fe",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3ff",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fb",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fc",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fd",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fe",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3ff",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fb",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fc",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fd",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fe",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3ff"
				],
				a: "2"
			},
			{
				n: [
					"bae",
					"man",
					"babe",
					"date",
					"kiss",
					"love",
					"mwah",
					"xoxo",
					"heart",
					"couple",
					"dating",
					"person",
					"romance",
					"together",
					"anniversary",
					"kiss: man, man"
				],
				u: "1f468-200d-2764-fe0f-200d-1f48b-200d-1f468",
				v: [
					"1f468-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fb",
					"1f468-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fc",
					"1f468-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fd",
					"1f468-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fe",
					"1f468-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3ff",
					"1f468-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fb",
					"1f468-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fc",
					"1f468-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fd",
					"1f468-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fe",
					"1f468-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3ff",
					"1f468-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fb",
					"1f468-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fc",
					"1f468-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fd",
					"1f468-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fe",
					"1f468-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3ff",
					"1f468-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fb",
					"1f468-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fc",
					"1f468-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fd",
					"1f468-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fe",
					"1f468-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3ff",
					"1f468-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fb",
					"1f468-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fc",
					"1f468-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fd",
					"1f468-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3fe",
					"1f468-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f468-1f3ff"
				],
				a: "2"
			},
			{
				n: [
					"bae",
					"babe",
					"date",
					"kiss",
					"love",
					"mwah",
					"xoxo",
					"heart",
					"woman",
					"couple",
					"dating",
					"person",
					"romance",
					"together",
					"anniversary",
					"kiss: woman, woman"
				],
				u: "1f469-200d-2764-fe0f-200d-1f48b-200d-1f469",
				v: [
					"1f469-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fb",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fc",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fd",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fe",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3ff",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fb",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fc",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fd",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fe",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3ff",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fb",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fc",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fd",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fe",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3ff",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fb",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fc",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fd",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fe",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3ff",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fb",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fc",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fd",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3fe",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f48b-200d-1f469-1f3ff"
				],
				a: "2"
			},
			{
				n: [
					"bae",
					"you",
					"babe",
					"kiss",
					"love",
					"heart",
					"couple",
					"dating",
					"person",
					"romance",
					"together",
					"anniversary",
					"relationship",
					"couple with heart"
				],
				u: "1f491",
				v: [
					"1f491-1f3fb",
					"1f491-1f3fc",
					"1f491-1f3fd",
					"1f491-1f3fe",
					"1f491-1f3ff",
					"1f9d1-1f3fb-200d-2764-fe0f-200d-1f9d1-1f3fc",
					"1f9d1-1f3fb-200d-2764-fe0f-200d-1f9d1-1f3fd",
					"1f9d1-1f3fb-200d-2764-fe0f-200d-1f9d1-1f3fe",
					"1f9d1-1f3fb-200d-2764-fe0f-200d-1f9d1-1f3ff",
					"1f9d1-1f3fc-200d-2764-fe0f-200d-1f9d1-1f3fb",
					"1f9d1-1f3fc-200d-2764-fe0f-200d-1f9d1-1f3fd",
					"1f9d1-1f3fc-200d-2764-fe0f-200d-1f9d1-1f3fe",
					"1f9d1-1f3fc-200d-2764-fe0f-200d-1f9d1-1f3ff",
					"1f9d1-1f3fd-200d-2764-fe0f-200d-1f9d1-1f3fb",
					"1f9d1-1f3fd-200d-2764-fe0f-200d-1f9d1-1f3fc",
					"1f9d1-1f3fd-200d-2764-fe0f-200d-1f9d1-1f3fe",
					"1f9d1-1f3fd-200d-2764-fe0f-200d-1f9d1-1f3ff",
					"1f9d1-1f3fe-200d-2764-fe0f-200d-1f9d1-1f3fb",
					"1f9d1-1f3fe-200d-2764-fe0f-200d-1f9d1-1f3fc",
					"1f9d1-1f3fe-200d-2764-fe0f-200d-1f9d1-1f3fd",
					"1f9d1-1f3fe-200d-2764-fe0f-200d-1f9d1-1f3ff",
					"1f9d1-1f3ff-200d-2764-fe0f-200d-1f9d1-1f3fb",
					"1f9d1-1f3ff-200d-2764-fe0f-200d-1f9d1-1f3fc",
					"1f9d1-1f3ff-200d-2764-fe0f-200d-1f9d1-1f3fd",
					"1f9d1-1f3ff-200d-2764-fe0f-200d-1f9d1-1f3fe"
				],
				a: "0.6"
			},
			{
				n: [
					"bae",
					"man",
					"you",
					"babe",
					"kiss",
					"love",
					"heart",
					"woman",
					"couple",
					"dating",
					"person",
					"romance",
					"together",
					"anniversary",
					"relationship",
					"couple with heart: woman, man"
				],
				u: "1f469-200d-2764-fe0f-200d-1f468",
				v: [
					"1f469-1f3fb-200d-2764-fe0f-200d-1f468-1f3fb",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f468-1f3fc",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f468-1f3fd",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f468-1f3fe",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f468-1f3ff",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f468-1f3fb",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f468-1f3fc",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f468-1f3fd",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f468-1f3fe",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f468-1f3ff",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f468-1f3fb",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f468-1f3fc",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f468-1f3fd",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f468-1f3fe",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f468-1f3ff",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f468-1f3fb",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f468-1f3fc",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f468-1f3fd",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f468-1f3fe",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f468-1f3ff",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f468-1f3fb",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f468-1f3fc",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f468-1f3fd",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f468-1f3fe",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f468-1f3ff"
				],
				a: "2"
			},
			{
				n: [
					"bae",
					"man",
					"you",
					"babe",
					"kiss",
					"love",
					"heart",
					"couple",
					"dating",
					"person",
					"romance",
					"together",
					"anniversary",
					"relationship",
					"couple with heart: man, man"
				],
				u: "1f468-200d-2764-fe0f-200d-1f468",
				v: [
					"1f468-1f3fb-200d-2764-fe0f-200d-1f468-1f3fb",
					"1f468-1f3fb-200d-2764-fe0f-200d-1f468-1f3fc",
					"1f468-1f3fb-200d-2764-fe0f-200d-1f468-1f3fd",
					"1f468-1f3fb-200d-2764-fe0f-200d-1f468-1f3fe",
					"1f468-1f3fb-200d-2764-fe0f-200d-1f468-1f3ff",
					"1f468-1f3fc-200d-2764-fe0f-200d-1f468-1f3fb",
					"1f468-1f3fc-200d-2764-fe0f-200d-1f468-1f3fc",
					"1f468-1f3fc-200d-2764-fe0f-200d-1f468-1f3fd",
					"1f468-1f3fc-200d-2764-fe0f-200d-1f468-1f3fe",
					"1f468-1f3fc-200d-2764-fe0f-200d-1f468-1f3ff",
					"1f468-1f3fd-200d-2764-fe0f-200d-1f468-1f3fb",
					"1f468-1f3fd-200d-2764-fe0f-200d-1f468-1f3fc",
					"1f468-1f3fd-200d-2764-fe0f-200d-1f468-1f3fd",
					"1f468-1f3fd-200d-2764-fe0f-200d-1f468-1f3fe",
					"1f468-1f3fd-200d-2764-fe0f-200d-1f468-1f3ff",
					"1f468-1f3fe-200d-2764-fe0f-200d-1f468-1f3fb",
					"1f468-1f3fe-200d-2764-fe0f-200d-1f468-1f3fc",
					"1f468-1f3fe-200d-2764-fe0f-200d-1f468-1f3fd",
					"1f468-1f3fe-200d-2764-fe0f-200d-1f468-1f3fe",
					"1f468-1f3fe-200d-2764-fe0f-200d-1f468-1f3ff",
					"1f468-1f3ff-200d-2764-fe0f-200d-1f468-1f3fb",
					"1f468-1f3ff-200d-2764-fe0f-200d-1f468-1f3fc",
					"1f468-1f3ff-200d-2764-fe0f-200d-1f468-1f3fd",
					"1f468-1f3ff-200d-2764-fe0f-200d-1f468-1f3fe",
					"1f468-1f3ff-200d-2764-fe0f-200d-1f468-1f3ff"
				],
				a: "2"
			},
			{
				n: [
					"bae",
					"you",
					"babe",
					"kiss",
					"love",
					"heart",
					"woman",
					"couple",
					"dating",
					"person",
					"romance",
					"together",
					"anniversary",
					"relationship",
					"couple with heart: woman, woman"
				],
				u: "1f469-200d-2764-fe0f-200d-1f469",
				v: [
					"1f469-1f3fb-200d-2764-fe0f-200d-1f469-1f3fb",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f469-1f3fc",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f469-1f3fd",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f469-1f3fe",
					"1f469-1f3fb-200d-2764-fe0f-200d-1f469-1f3ff",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f469-1f3fb",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f469-1f3fc",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f469-1f3fd",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f469-1f3fe",
					"1f469-1f3fc-200d-2764-fe0f-200d-1f469-1f3ff",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f469-1f3fb",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f469-1f3fc",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f469-1f3fd",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f469-1f3fe",
					"1f469-1f3fd-200d-2764-fe0f-200d-1f469-1f3ff",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f469-1f3fb",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f469-1f3fc",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f469-1f3fd",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f469-1f3fe",
					"1f469-1f3fe-200d-2764-fe0f-200d-1f469-1f3ff",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f469-1f3fb",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f469-1f3fc",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f469-1f3fd",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f469-1f3fe",
					"1f469-1f3ff-200d-2764-fe0f-200d-1f469-1f3ff"
				],
				a: "2"
			},
			{
				n: [
					"boy",
					"man",
					"child",
					"woman",
					"family",
					"family: man, woman, boy"
				],
				u: "1f468-200d-1f469-200d-1f466",
				a: "2"
			},
			{
				n: [
					"man",
					"girl",
					"child",
					"woman",
					"family",
					"family: man, woman, girl"
				],
				u: "1f468-200d-1f469-200d-1f467",
				a: "2"
			},
			{
				n: [
					"boy",
					"man",
					"girl",
					"child",
					"woman",
					"family",
					"family: man, woman, girl, boy"
				],
				u: "1f468-200d-1f469-200d-1f467-200d-1f466",
				a: "2"
			},
			{
				n: [
					"boy",
					"man",
					"child",
					"woman",
					"family",
					"family: man, woman, boy, boy"
				],
				u: "1f468-200d-1f469-200d-1f466-200d-1f466",
				a: "2"
			},
			{
				n: [
					"man",
					"girl",
					"child",
					"woman",
					"family",
					"family: man, woman, girl, girl"
				],
				u: "1f468-200d-1f469-200d-1f467-200d-1f467",
				a: "2"
			},
			{
				n: [
					"boy",
					"man",
					"child",
					"family",
					"family: man, man, boy"
				],
				u: "1f468-200d-1f468-200d-1f466",
				a: "2"
			},
			{
				n: [
					"man",
					"girl",
					"child",
					"family",
					"family: man, man, girl"
				],
				u: "1f468-200d-1f468-200d-1f467",
				a: "2"
			},
			{
				n: [
					"boy",
					"man",
					"girl",
					"child",
					"family",
					"family: man, man, girl, boy"
				],
				u: "1f468-200d-1f468-200d-1f467-200d-1f466",
				a: "2"
			},
			{
				n: [
					"boy",
					"man",
					"child",
					"family",
					"family: man, man, boy, boy"
				],
				u: "1f468-200d-1f468-200d-1f466-200d-1f466",
				a: "2"
			},
			{
				n: [
					"man",
					"girl",
					"child",
					"family",
					"family: man, man, girl, girl"
				],
				u: "1f468-200d-1f468-200d-1f467-200d-1f467",
				a: "2"
			},
			{
				n: [
					"boy",
					"child",
					"woman",
					"family",
					"family: woman, woman, boy"
				],
				u: "1f469-200d-1f469-200d-1f466",
				a: "2"
			},
			{
				n: [
					"girl",
					"child",
					"woman",
					"family",
					"family: woman, woman, girl"
				],
				u: "1f469-200d-1f469-200d-1f467",
				a: "2"
			},
			{
				n: [
					"boy",
					"girl",
					"child",
					"woman",
					"family",
					"family: woman, woman, girl, boy"
				],
				u: "1f469-200d-1f469-200d-1f467-200d-1f466",
				a: "2"
			},
			{
				n: [
					"boy",
					"child",
					"woman",
					"family",
					"family: woman, woman, boy, boy"
				],
				u: "1f469-200d-1f469-200d-1f466-200d-1f466",
				a: "2"
			},
			{
				n: [
					"girl",
					"child",
					"woman",
					"family",
					"family: woman, woman, girl, girl"
				],
				u: "1f469-200d-1f469-200d-1f467-200d-1f467",
				a: "2"
			},
			{
				n: [
					"boy",
					"man",
					"child",
					"family",
					"family: man, boy"
				],
				u: "1f468-200d-1f466",
				a: "4"
			},
			{
				n: [
					"boy",
					"man",
					"child",
					"family",
					"family: man, boy, boy"
				],
				u: "1f468-200d-1f466-200d-1f466",
				a: "4"
			},
			{
				n: [
					"man",
					"girl",
					"child",
					"family",
					"family: man, girl"
				],
				u: "1f468-200d-1f467",
				a: "4"
			},
			{
				n: [
					"boy",
					"man",
					"girl",
					"child",
					"family",
					"family: man, girl, boy"
				],
				u: "1f468-200d-1f467-200d-1f466",
				a: "4"
			},
			{
				n: [
					"man",
					"girl",
					"child",
					"family",
					"family: man, girl, girl"
				],
				u: "1f468-200d-1f467-200d-1f467",
				a: "4"
			},
			{
				n: [
					"boy",
					"child",
					"woman",
					"family",
					"family: woman, boy"
				],
				u: "1f469-200d-1f466",
				a: "4"
			},
			{
				n: [
					"boy",
					"child",
					"woman",
					"family",
					"family: woman, boy, boy"
				],
				u: "1f469-200d-1f466-200d-1f466",
				a: "4"
			},
			{
				n: [
					"girl",
					"child",
					"woman",
					"family",
					"family: woman, girl"
				],
				u: "1f469-200d-1f467",
				a: "4"
			},
			{
				n: [
					"boy",
					"girl",
					"child",
					"woman",
					"family",
					"family: woman, girl, boy"
				],
				u: "1f469-200d-1f467-200d-1f466",
				a: "4"
			},
			{
				n: [
					"girl",
					"child",
					"woman",
					"family",
					"family: woman, girl, girl"
				],
				u: "1f469-200d-1f467-200d-1f467",
				a: "4"
			},
			{
				n: [
					"face",
					"head",
					"speak",
					"speaking",
					"silhouette",
					"speaking head"
				],
				u: "1f5e3-fe0f",
				a: "0.7"
			},
			{
				n: [
					"bust",
					"shadow",
					"mysterious",
					"silhouette",
					"bust in silhouette"
				],
				u: "1f464",
				a: "0.6"
			},
			{
				n: [
					"bff",
					"bust",
					"busts",
					"friend",
					"people",
					"friends",
					"everyone",
					"silhouette",
					"busts in silhouette"
				],
				u: "1f465",
				a: "1"
			},
			{
				n: [
					"hug",
					"love",
					"hello",
					"people",
					"thanks",
					"comfort",
					"embrace",
					"goodbye",
					"hugging",
					"farewell",
					"friendship",
					"people hugging"
				],
				u: "1fac2",
				a: "13"
			},
			{
				n: ["child", "family"],
				u: "1f46a",
				a: "0.6"
			},
			{
				n: [
					"adult",
					"child",
					"family",
					"family: adult, adult, child"
				],
				u: "1f9d1-200d-1f9d1-200d-1f9d2",
				a: "15.1"
			},
			{
				n: [
					"adult",
					"child",
					"family",
					"family: adult, adult, child, child"
				],
				u: "1f9d1-200d-1f9d1-200d-1f9d2-200d-1f9d2",
				a: "15.1"
			},
			{
				n: [
					"adult",
					"child",
					"family",
					"family: adult, child"
				],
				u: "1f9d1-200d-1f9d2",
				a: "15.1"
			},
			{
				n: [
					"adult",
					"child",
					"family",
					"family: adult, child, child"
				],
				u: "1f9d1-200d-1f9d2-200d-1f9d2",
				a: "15.1"
			},
			{
				n: [
					"omw",
					"walk",
					"print",
					"barefoot",
					"clothing",
					"footprint",
					"footprints"
				],
				u: "1f463",
				a: "0.6"
			},
			{
				n: [
					"clue",
					"crime",
					"print",
					"trace",
					"safety",
					"mystery",
					"identity",
					"detective",
					"forensics",
					"fingerprint"
				],
				u: "1fac6",
				a: "16"
			}
		],
		animals_nature: [
			{
				n: [
					"face",
					"animal",
					"banana",
					"monkey",
					"monkey face"
				],
				u: "1f435",
				a: "0.6"
			},
			{
				n: [
					"monkey",
					"animal",
					"banana"
				],
				u: "1f412",
				a: "0.6"
			},
			{
				n: ["animal", "gorilla"],
				u: "1f98d",
				a: "3"
			},
			{
				n: [
					"ape",
					"animal",
					"monkey",
					"orangutan"
				],
				u: "1f9a7",
				a: "12"
			},
			{
				n: [
					"dog",
					"pet",
					"face",
					"puppy",
					"adorbs",
					"animal",
					"puppies",
					"dog face"
				],
				u: "1f436",
				a: "0.6"
			},
			{
				n: [
					"dog",
					"pet",
					"dogs",
					"animal",
					"animals"
				],
				u: "1f415",
				a: "0.7"
			},
			{
				n: [
					"dog",
					"blind",
					"guide",
					"animal",
					"guide dog",
					"accessibility"
				],
				u: "1f9ae",
				a: "12"
			},
			{
				n: [
					"dog",
					"animal",
					"service",
					"assistance",
					"service dog",
					"accessibility"
				],
				u: "1f415-200d-1f9ba",
				a: "12"
			},
			{
				n: [
					"dog",
					"poodle",
					"animal",
					"fluffy"
				],
				u: "1f429",
				a: "0.6"
			},
			{
				n: [
					"wolf",
					"face",
					"animal"
				],
				u: "1f43a",
				a: "0.6"
			},
			{
				n: [
					"fox",
					"face",
					"animal"
				],
				u: "1f98a",
				a: "3"
			},
			{
				n: [
					"sly",
					"animal",
					"raccoon",
					"curious"
				],
				u: "1f99d",
				a: "11"
			},
			{
				n: [
					"cat",
					"pet",
					"face",
					"kitty",
					"animal",
					"kitten",
					"cat face"
				],
				u: "1f431",
				a: "0.6"
			},
			{
				n: [
					"cat",
					"pet",
					"cats",
					"animal",
					"kitten",
					"animals"
				],
				u: "1f408",
				a: "0.7"
			},
			{
				n: [
					"cat",
					"meow",
					"black",
					"animal",
					"feline",
					"unlucky",
					"black cat",
					"halloween"
				],
				u: "1f408-200d-2b1b",
				a: "13"
			},
			{
				n: [
					"leo",
					"lion",
					"face",
					"mane",
					"rawr",
					"roar",
					"alpha",
					"order",
					"animal",
					"safari",
					"strong",
					"zodiac"
				],
				u: "1f981",
				a: "1"
			},
			{
				n: [
					"big",
					"cat",
					"face",
					"tiger",
					"animal",
					"predator",
					"tiger face"
				],
				u: "1f42f",
				a: "0.6"
			},
			{
				n: [
					"big",
					"cat",
					"zoo",
					"tiger",
					"animal",
					"predator"
				],
				u: "1f405",
				a: "1"
			},
			{
				n: [
					"big",
					"cat",
					"zoo",
					"animal",
					"leopard",
					"predator"
				],
				u: "1f406",
				a: "1"
			},
			{
				n: [
					"face",
					"farm",
					"horse",
					"animal",
					"equine",
					"horses",
					"dressage",
					"horse face"
				],
				u: "1f434",
				a: "0.6"
			},
			{
				n: [
					"elk",
					"moose",
					"alces",
					"animal",
					"mammal",
					"antlers"
				],
				u: "1face",
				a: "15"
			},
			{
				n: [
					"ass",
					"mule",
					"burro",
					"hinny",
					"donkey",
					"animal",
					"mammal",
					"stubborn"
				],
				u: "1facf",
				a: "15"
			},
			{
				n: [
					"farm",
					"horse",
					"animal",
					"racing",
					"racehorse",
					"equestrian"
				],
				u: "1f40e",
				a: "0.6"
			},
			{
				n: ["face", "unicorn"],
				u: "1f984",
				a: "1"
			},
			{
				n: [
					"zebra",
					"animal",
					"stripe"
				],
				u: "1f993",
				a: "5"
			},
			{
				n: ["deer", "animal"],
				u: "1f98c",
				a: "3"
			},
			{
				n: [
					"herd",
					"bison",
					"animal",
					"wisent",
					"buffalo"
				],
				u: "1f9ac",
				a: "13"
			},
			{
				n: [
					"cow",
					"moo",
					"face",
					"farm",
					"milk",
					"animal",
					"cow face"
				],
				u: "1f42e",
				a: "0.6"
			},
			{
				n: [
					"ox",
					"bull",
					"farm",
					"animal",
					"taurus",
					"zodiac",
					"animals"
				],
				u: "1f402",
				a: "1"
			},
			{
				n: [
					"zoo",
					"water",
					"animal",
					"buffalo",
					"water buffalo"
				],
				u: "1f403",
				a: "1"
			},
			{
				n: [
					"cow",
					"moo",
					"farm",
					"milk",
					"animal",
					"animals"
				],
				u: "1f404",
				a: "1"
			},
			{
				n: [
					"pig",
					"face",
					"farm",
					"pork",
					"bacon",
					"animal",
					"pig face"
				],
				u: "1f437",
				a: "0.6"
			},
			{
				n: [
					"pig",
					"sow",
					"farm",
					"pork",
					"bacon",
					"animal"
				],
				u: "1f416",
				a: "1"
			},
			{
				n: [
					"pig",
					"boar",
					"animal"
				],
				u: "1f417",
				a: "0.6"
			},
			{
				n: [
					"pig",
					"face",
					"farm",
					"nose",
					"smell",
					"snout",
					"animal",
					"pig nose"
				],
				u: "1f43d",
				a: "0.6"
			},
			{
				n: [
					"ram",
					"zoo",
					"male",
					"aries",
					"horns",
					"sheep",
					"animal",
					"zodiac"
				],
				u: "1f40f",
				a: "1"
			},
			{
				n: [
					"ewe",
					"baa",
					"farm",
					"lamb",
					"wool",
					"sheep",
					"animal",
					"female",
					"fluffy"
				],
				u: "1f411",
				a: "0.6"
			},
			{
				n: [
					"goat",
					"farm",
					"milk",
					"animal",
					"zodiac",
					"capricorn"
				],
				u: "1f410",
				a: "1"
			},
			{
				n: [
					"one",
					"hump",
					"camel",
					"animal",
					"desert",
					"dromedary"
				],
				u: "1f42a",
				a: "1"
			},
			{
				n: [
					"two",
					"hump",
					"camel",
					"animal",
					"desert",
					"bactrian",
					"two hump",
					"two hump camel"
				],
				u: "1f42b",
				a: "0.6"
			},
			{
				n: [
					"wool",
					"llama",
					"alpaca",
					"animal",
					"vicuña",
					"guanaco"
				],
				u: "1f999",
				a: "11"
			},
			{
				n: [
					"spots",
					"animal",
					"giraffe"
				],
				u: "1f992",
				a: "5"
			},
			{
				n: ["animal", "elephant"],
				u: "1f418",
				a: "0.6"
			},
			{
				n: [
					"tusk",
					"large",
					"wooly",
					"animal",
					"mammoth",
					"extinction"
				],
				u: "1f9a3",
				a: "13"
			},
			{
				n: ["animal", "rhinoceros"],
				u: "1f98f",
				a: "3"
			},
			{
				n: [
					"hippo",
					"animal",
					"hippopotamus"
				],
				u: "1f99b",
				a: "11"
			},
			{
				n: [
					"face",
					"mouse",
					"animal",
					"mouse face"
				],
				u: "1f42d",
				a: "0.6"
			},
			{
				n: [
					"mouse",
					"animal",
					"animals"
				],
				u: "1f401",
				a: "1"
			},
			{
				n: ["rat", "animal"],
				u: "1f400",
				a: "1"
			},
			{
				n: [
					"pet",
					"face",
					"animal",
					"hamster"
				],
				u: "1f439",
				a: "0.6"
			},
			{
				n: [
					"pet",
					"face",
					"bunny",
					"animal",
					"rabbit",
					"rabbit face"
				],
				u: "1f430",
				a: "0.6"
			},
			{
				n: [
					"pet",
					"bunny",
					"rabbit",
					"animal"
				],
				u: "1f407",
				a: "1"
			},
			{
				n: [
					"animal",
					"chipmunk",
					"squirrel"
				],
				u: "1f43f-fe0f",
				a: "0.7"
			},
			{
				n: [
					"dam",
					"teeth",
					"beaver",
					"animal"
				],
				u: "1f9ab",
				a: "13"
			},
			{
				n: [
					"spiny",
					"animal",
					"hedgehog"
				],
				u: "1f994",
				a: "5"
			},
			{
				n: [
					"bat",
					"animal",
					"vampire"
				],
				u: "1f987",
				a: "3"
			},
			{
				n: [
					"bear",
					"face",
					"growl",
					"honey",
					"animal",
					"grizzly"
				],
				u: "1f43b",
				a: "0.6"
			},
			{
				n: [
					"bear",
					"polar",
					"white",
					"animal",
					"arctic",
					"polar bear"
				],
				u: "1f43b-200d-2744-fe0f",
				a: "13"
			},
			{
				n: [
					"bear",
					"down",
					"face",
					"koala",
					"under",
					"animal",
					"australia",
					"marsupial"
				],
				u: "1f428",
				a: "0.6"
			},
			{
				n: [
					"face",
					"panda",
					"animal",
					"bamboo"
				],
				u: "1f43c",
				a: "0.6"
			},
			{
				n: [
					"lazy",
					"slow",
					"sloth"
				],
				u: "1f9a5",
				a: "12"
			},
			{
				n: [
					"otter",
					"animal",
					"fishing",
					"playful"
				],
				u: "1f9a6",
				a: "12"
			},
			{
				n: [
					"skunk",
					"stink",
					"animal"
				],
				u: "1f9a8",
				a: "12"
			},
			{
				n: [
					"joey",
					"jump",
					"animal",
					"kangaroo",
					"marsupial"
				],
				u: "1f998",
				a: "11"
			},
			{
				n: [
					"honey",
					"badger",
					"animal",
					"pester"
				],
				u: "1f9a1",
				a: "11"
			},
			{
				n: [
					"paw",
					"feet",
					"paws",
					"print",
					"prints",
					"paw prints"
				],
				u: "1f43e",
				a: "0.6"
			},
			{
				n: [
					"bird",
					"turkey",
					"gobble",
					"thanksgiving"
				],
				u: "1f983",
				a: "1"
			},
			{
				n: [
					"bird",
					"animal",
					"chicken",
					"ornithology"
				],
				u: "1f414",
				a: "0.6"
			},
			{
				n: [
					"bird",
					"animal",
					"rooster",
					"ornithology"
				],
				u: "1f413",
				a: "1"
			},
			{
				n: [
					"egg",
					"baby",
					"bird",
					"chick",
					"animal",
					"hatching",
					"hatching chick"
				],
				u: "1f423",
				a: "0.6"
			},
			{
				n: [
					"baby",
					"bird",
					"chick",
					"animal",
					"baby chick",
					"ornithology"
				],
				u: "1f424",
				a: "0.6"
			},
			{
				n: [
					"baby",
					"bird",
					"chick",
					"animal",
					"newborn",
					"ornithology",
					"front facing",
					"front facing baby chick"
				],
				u: "1f425",
				a: "0.6"
			},
			{
				n: [
					"bird",
					"animal",
					"ornithology"
				],
				u: "1f426",
				a: "0.6"
			},
			{
				n: [
					"bird",
					"animal",
					"penguin",
					"antarctica",
					"ornithology"
				],
				u: "1f427",
				a: "0.6"
			},
			{
				n: [
					"fly",
					"dove",
					"bird",
					"peace",
					"ornithology"
				],
				u: "1f54a-fe0f",
				a: "0.7"
			},
			{
				n: [
					"bird",
					"eagle",
					"animal",
					"ornithology"
				],
				u: "1f985",
				a: "3"
			},
			{
				n: [
					"duck",
					"bird",
					"animal",
					"ornithology"
				],
				u: "1f986",
				a: "3"
			},
			{
				n: [
					"swan",
					"bird",
					"ugly",
					"animal",
					"cygnet",
					"duckling",
					"ornithology"
				],
				u: "1f9a2",
				a: "11"
			},
			{
				n: [
					"owl",
					"bird",
					"wise",
					"animal",
					"ornithology"
				],
				u: "1f989",
				a: "3"
			},
			{
				n: [
					"dodo",
					"bird",
					"large",
					"animal",
					"extinction",
					"ornithology"
				],
				u: "1f9a4",
				a: "13"
			},
			{
				n: [
					"bird",
					"light",
					"flight",
					"feather",
					"plumage"
				],
				u: "1fab6",
				a: "13"
			},
			{
				n: [
					"bird",
					"animal",
					"flamingo",
					"tropical",
					"flamboyant",
					"ornithology"
				],
				u: "1f9a9",
				a: "12"
			},
			{
				n: [
					"bird",
					"proud",
					"animal",
					"peahen",
					"pretty",
					"peacock",
					"colorful",
					"ornithology",
					"ostentatious"
				],
				u: "1f99a",
				a: "11"
			},
			{
				n: [
					"bird",
					"talk",
					"parrot",
					"animal",
					"pirate",
					"ornithology"
				],
				u: "1f99c",
				a: "11"
			},
			{
				n: [
					"fly",
					"wing",
					"bird",
					"soar",
					"ascend",
					"flying",
					"angelic",
					"aviation",
					"heavenly",
					"mythology"
				],
				u: "1fabd",
				a: "15"
			},
			{
				n: [
					"caw",
					"beak",
					"bird",
					"crow",
					"rook",
					"black",
					"raven",
					"animal",
					"corvid",
					"black bird",
					"ornithology"
				],
				u: "1f426-200d-2b1b",
				a: "15"
			},
			{
				n: [
					"bird",
					"duck",
					"fowl",
					"honk",
					"goose",
					"flock",
					"geese",
					"silly",
					"animal",
					"gaggle",
					"gander",
					"ornithology"
				],
				u: "1fabf",
				a: "15"
			},
			{
				n: [
					"rise",
					"glory",
					"ascend",
					"emerge",
					"revive",
					"phoenix",
					"fantasy",
					"rebirth",
					"renewal",
					"revival",
					"firebird",
					"immortal",
					"reinvent",
					"ascension",
					"transform",
					"reincarnation"
				],
				u: "1f426-200d-1f525",
				a: "15.1"
			},
			{
				n: [
					"frog",
					"face",
					"animal"
				],
				u: "1f438",
				a: "0.6"
			},
			{
				n: [
					"zoo",
					"animal",
					"crocodile"
				],
				u: "1f40a",
				a: "1"
			},
			{
				n: [
					"turtle",
					"animal",
					"terrapin",
					"tortoise"
				],
				u: "1f422",
				a: "0.6"
			},
			{
				n: [
					"lizard",
					"animal",
					"reptile"
				],
				u: "1f98e",
				a: "3"
			},
			{
				n: [
					"snake",
					"animal",
					"bearer",
					"zodiac",
					"serpent",
					"ophiuchus"
				],
				u: "1f40d",
				a: "0.6"
			},
			{
				n: [
					"face",
					"tale",
					"fairy",
					"animal",
					"dragon",
					"fairytale",
					"dragon face"
				],
				u: "1f432",
				a: "0.6"
			},
			{
				n: [
					"tale",
					"fairy",
					"dragon",
					"animal",
					"knights",
					"fairytale"
				],
				u: "1f409",
				a: "1"
			},
			{
				n: [
					"sauropod",
					"dinosaur",
					"diplodocus",
					"brontosaurus",
					"brachiosaurus"
				],
				u: "1f995",
				a: "5"
			},
			{
				n: [
					"t",
					"rex",
					"T Rex",
					"t rex",
					"dinosaur",
					"tyrannosaurus"
				],
				u: "1f996",
				a: "5"
			},
			{
				n: [
					"face",
					"beach",
					"ocean",
					"whale",
					"animal",
					"spouting",
					"spouting whale"
				],
				u: "1f433",
				a: "0.6"
			},
			{
				n: [
					"whale",
					"beach",
					"ocean",
					"animal"
				],
				u: "1f40b",
				a: "1"
			},
			{
				n: [
					"beach",
					"ocean",
					"animal",
					"dolphin",
					"flipper"
				],
				u: "1f42c",
				a: "0.6"
			},
			{
				n: [
					"sea",
					"seal",
					"lion",
					"ocean",
					"animal"
				],
				u: "1f9ad",
				a: "13"
			},
			{
				n: [
					"fish",
					"animal",
					"dinner",
					"fishes",
					"pisces",
					"zodiac",
					"fishing"
				],
				u: "1f41f",
				a: "0.6"
			},
			{
				n: [
					"fish",
					"animal",
					"fishes",
					"tropical",
					"tropical fish"
				],
				u: "1f420",
				a: "0.6"
			},
			{
				n: [
					"fish",
					"animal",
					"blowfish"
				],
				u: "1f421",
				a: "0.6"
			},
			{
				n: [
					"fish",
					"shark",
					"animal"
				],
				u: "1f988",
				a: "3"
			},
			{
				n: [
					"ocean",
					"animal",
					"octopus",
					"creature"
				],
				u: "1f419",
				a: "0.6"
			},
			{
				n: [
					"sea",
					"beach",
					"conch",
					"shell",
					"animal",
					"spiral",
					"spiral shell"
				],
				u: "1f41a",
				a: "0.6"
			},
			{
				n: [
					"sea",
					"reef",
					"coral",
					"ocean",
					"change",
					"climate"
				],
				u: "1fab8",
				a: "14"
			},
			{
				n: [
					"sea",
					"burn",
					"life",
					"ouch",
					"jelly",
					"ocean",
					"sting",
					"animal",
					"marine",
					"stinger",
					"aquarium",
					"plankton",
					"jellyfish",
					"tentacles",
					"invertebrate"
				],
				u: "1fabc",
				a: "15"
			},
			{
				n: [
					"crab",
					"cancer",
					"zodiac"
				],
				u: "1f980",
				a: "1"
			},
			{
				n: [
					"claws",
					"animal",
					"bisque",
					"lobster",
					"seafood"
				],
				u: "1f99e",
				a: "11"
			},
			{
				n: [
					"food",
					"small",
					"shrimp",
					"shellfish"
				],
				u: "1f990",
				a: "3"
			},
			{
				n: [
					"food",
					"squid",
					"animal",
					"mollusk"
				],
				u: "1f991",
				a: "3"
			},
			{
				n: [
					"pearl",
					"oyster",
					"diving"
				],
				u: "1f9aa",
				a: "12"
			},
			{
				n: [
					"slug",
					"snail",
					"animal",
					"garden",
					"nature",
					"escargot"
				],
				u: "1f40c",
				a: "0.6"
			},
			{
				n: [
					"insect",
					"pretty",
					"butterfly"
				],
				u: "1f98b",
				a: "3"
			},
			{
				n: [
					"bug",
					"animal",
					"garden",
					"insect"
				],
				u: "1f41b",
				a: "0.6"
			},
			{
				n: [
					"ant",
					"animal",
					"garden",
					"insect"
				],
				u: "1f41c",
				a: "0.6"
			},
			{
				n: [
					"bee",
					"honey",
					"animal",
					"insect",
					"nature",
					"spring",
					"honeybee",
					"bumblebee"
				],
				u: "1f41d",
				a: "0.6"
			},
			{
				n: [
					"bug",
					"beetle",
					"animal",
					"insect"
				],
				u: "1fab2",
				a: "13"
			},
			{
				n: [
					"lady",
					"animal",
					"beetle",
					"garden",
					"insect",
					"nature",
					"ladybug",
					"ladybird",
					"lady beetle"
				],
				u: "1f41e",
				a: "0.6"
			},
			{
				n: [
					"bug",
					"animal",
					"insect",
					"cricket",
					"orthoptera",
					"grasshopper"
				],
				u: "1f997",
				a: "5"
			},
			{
				n: [
					"pest",
					"roach",
					"animal",
					"insect",
					"cockroach"
				],
				u: "1fab3",
				a: "13"
			},
			{
				n: [
					"spider",
					"animal",
					"insect"
				],
				u: "1f577-fe0f",
				a: "0.7"
			},
			{
				n: [
					"web",
					"spider",
					"spider web"
				],
				u: "1f578-fe0f",
				a: "0.7"
			},
			{
				n: [
					"zodiac",
					"scorpio",
					"scorpion",
					"scorpius"
				],
				u: "1f982",
				a: "1"
			},
			{
				n: [
					"bite",
					"pest",
					"fever",
					"virus",
					"insect",
					"disease",
					"malaria",
					"mosquito"
				],
				u: "1f99f",
				a: "11"
			},
			{
				n: [
					"fly",
					"pest",
					"animal",
					"insect",
					"maggot",
					"disease",
					"rotting"
				],
				u: "1fab0",
				a: "13"
			},
			{
				n: [
					"worm",
					"animal",
					"annelid",
					"parasite",
					"earthworm"
				],
				u: "1fab1",
				a: "13"
			},
			{
				n: [
					"virus",
					"amoeba",
					"microbe",
					"science",
					"bacteria"
				],
				u: "1f9a0",
				a: "11"
			},
			{
				n: [
					"date",
					"love",
					"plant",
					"flower",
					"bouquet",
					"romance",
					"birthday",
					"anniversary"
				],
				u: "1f490",
				a: "0.6"
			},
			{
				n: [
					"plant",
					"cherry",
					"flower",
					"spring",
					"blossom",
					"springtime",
					"cherry blossom"
				],
				u: "1f338",
				a: "0.6"
			},
			{
				n: [
					"white",
					"flower",
					"white flower"
				],
				u: "1f4ae",
				a: "0.6"
			},
			{
				n: [
					"calm",
					"lotus",
					"peace",
					"beauty",
					"flower",
					"purity",
					"buddhism",
					"hinduism",
					"serenity"
				],
				u: "1fab7",
				a: "14"
			},
			{
				n: ["plant", "rosette"],
				u: "1f3f5-fe0f",
				a: "0.7"
			},
			{
				n: [
					"red",
					"rose",
					"love",
					"plant",
					"beauty",
					"flower",
					"elegant",
					"valentine"
				],
				u: "1f339",
				a: "0.6"
			},
			{
				n: [
					"dying",
					"flower",
					"wilted",
					"wilted flower"
				],
				u: "1f940",
				a: "3"
			},
			{
				n: [
					"plant",
					"flower",
					"hibiscus"
				],
				u: "1f33a",
				a: "0.6"
			},
			{
				n: [
					"sun",
					"plant",
					"flower",
					"outdoors",
					"sunflower"
				],
				u: "1f33b",
				a: "0.6"
			},
			{
				n: [
					"plant",
					"flower",
					"blossom",
					"buttercup",
					"dandelion"
				],
				u: "1f33c",
				a: "0.6"
			},
			{
				n: [
					"tulip",
					"plant",
					"flower",
					"growth",
					"blossom"
				],
				u: "1f337",
				a: "0.6"
			},
			{
				n: [
					"bloom",
					"lilac",
					"plant",
					"shrub",
					"flower",
					"indigo",
					"lupine",
					"purple",
					"spring",
					"violet",
					"hyacinth",
					"lavender",
					"bluebonnet",
					"snapdragon"
				],
				u: "1fabb",
				a: "15"
			},
			{
				n: [
					"plant",
					"young",
					"sprout",
					"sapling",
					"seedling"
				],
				u: "1f331",
				a: "0.6"
			},
			{
				n: [
					"pot",
					"grow",
					"decor",
					"house",
					"plant",
					"potted",
					"nurturing",
					"potted plant"
				],
				u: "1fab4",
				a: "13"
			},
			{
				n: [
					"pine",
					"tree",
					"forest",
					"christmas",
					"evergreen",
					"evergreen tree"
				],
				u: "1f332",
				a: "1"
			},
			{
				n: [
					"tree",
					"green",
					"forest",
					"habitat",
					"shedding",
					"deciduous",
					"deciduous tree"
				],
				u: "1f333",
				a: "1"
			},
			{
				n: [
					"palm",
					"tree",
					"beach",
					"plant",
					"tropical",
					"palm tree"
				],
				u: "1f334",
				a: "0.6"
			},
			{
				n: [
					"plant",
					"cactus",
					"desert",
					"nature",
					"drought"
				],
				u: "1f335",
				a: "0.6"
			},
			{
				n: [
					"ear",
					"rice",
					"grain",
					"plant",
					"sheaf",
					"grains",
					"sheaf of rice"
				],
				u: "1f33e",
				a: "0.6"
			},
			{
				n: [
					"herb",
					"leaf",
					"plant"
				],
				u: "1f33f",
				a: "0.6"
			},
			{
				n: [
					"irish",
					"plant",
					"shamrock"
				],
				u: "2618-fe0f",
				a: "1"
			},
			{
				n: [
					"4",
					"four",
					"leaf",
					"irish",
					"lucky",
					"plant",
					"clover",
					"four leaf",
					"four leaf clover"
				],
				u: "1f340",
				a: "0.6"
			},
			{
				n: [
					"leaf",
					"maple",
					"falling",
					"maple leaf"
				],
				u: "1f341",
				a: "0.6"
			},
			{
				n: [
					"fall",
					"leaf",
					"autumn",
					"fallen",
					"falling",
					"fallen leaf"
				],
				u: "1f342",
				a: "0.6"
			},
			{
				n: [
					"blow",
					"leaf",
					"wind",
					"flutter",
					"fluttering",
					"leaf fluttering in wind"
				],
				u: "1f343",
				a: "0.6"
			},
			{
				n: [
					"home",
					"nest",
					"empty",
					"branch",
					"nesting",
					"empty nest"
				],
				u: "1fab9",
				a: "14"
			},
			{
				n: [
					"egg",
					"bird",
					"eggs",
					"nest",
					"branch",
					"nesting",
					"nest with eggs"
				],
				u: "1faba",
				a: "14"
			},
			{
				n: [
					"fungus",
					"mushroom",
					"toadstool"
				],
				u: "1f344",
				a: "0.6"
			},
			{
				n: [
					"bare",
					"dead",
					"tree",
					"wood",
					"trunk",
					"barren",
					"winter",
					"drought",
					"branches",
					"leafless",
					"leafless tree"
				],
				u: "1fabe",
				a: "16"
			}
		],
		food_drink: [
			{
				n: [
					"fruit",
					"grape",
					"grapes",
					"dionysus"
				],
				u: "1f347",
				a: "0.6"
			},
			{
				n: [
					"melon",
					"fruit",
					"cantaloupe"
				],
				u: "1f348",
				a: "0.6"
			},
			{
				n: ["fruit", "watermelon"],
				u: "1f349",
				a: "0.6"
			},
			{
				n: [
					"c",
					"fruit",
					"citrus",
					"orange",
					"vitamin",
					"tangerine",
					"nectarine"
				],
				u: "1f34a",
				a: "0.6"
			},
			{
				n: [
					"sour",
					"lemon",
					"fruit",
					"citrus"
				],
				u: "1f34b",
				a: "1"
			},
			{
				n: [
					"key",
					"lime",
					"sour",
					"zest",
					"fruit",
					"salsa",
					"tangy",
					"citrus",
					"mojito",
					"acidity",
					"garnish",
					"tequila",
					"cocktail",
					"tropical",
					"margarita",
					"refreshing"
				],
				u: "1f34b-200d-1f7e9",
				a: "15.1"
			},
			{
				n: [
					"fruit",
					"banana",
					"potassium"
				],
				u: "1f34c",
				a: "0.6"
			},
			{
				n: [
					"pina",
					"fruit",
					"colada",
					"tropical",
					"pineapple"
				],
				u: "1f34d",
				a: "0.6"
			},
			{
				n: [
					"food",
					"mango",
					"fruit",
					"tropical"
				],
				u: "1f96d",
				a: "11"
			},
			{
				n: [
					"red",
					"diet",
					"food",
					"ripe",
					"apple",
					"fruit",
					"health",
					"red apple"
				],
				u: "1f34e",
				a: "0.6"
			},
			{
				n: [
					"apple",
					"fruit",
					"green",
					"green apple"
				],
				u: "1f34f",
				a: "0.6"
			},
			{
				n: ["pear", "fruit"],
				u: "1f350",
				a: "1"
			},
			{
				n: ["peach", "fruit"],
				u: "1f351",
				a: "0.6"
			},
			{
				n: [
					"red",
					"fruit",
					"cherry",
					"berries",
					"cherries"
				],
				u: "1f352",
				a: "0.6"
			},
			{
				n: [
					"berry",
					"fruit",
					"strawberry"
				],
				u: "1f353",
				a: "0.6"
			},
			{
				n: [
					"blue",
					"food",
					"berry",
					"fruit",
					"berries",
					"bilberry",
					"blueberry",
					"blueberries"
				],
				u: "1fad0",
				a: "13"
			},
			{
				n: [
					"food",
					"kiwi",
					"fruit",
					"kiwi fruit"
				],
				u: "1f95d",
				a: "3"
			},
			{
				n: [
					"food",
					"fruit",
					"tomato",
					"vegetable"
				],
				u: "1f345",
				a: "0.6"
			},
			{
				n: ["food", "olive"],
				u: "1fad2",
				a: "13"
			},
			{
				n: [
					"palm",
					"piña",
					"colada",
					"coconut"
				],
				u: "1f965",
				a: "5"
			},
			{
				n: [
					"food",
					"fruit",
					"avocado"
				],
				u: "1f951",
				a: "3"
			},
			{
				n: [
					"eggplant",
					"aubergine",
					"vegetable"
				],
				u: "1f346",
				a: "0.6"
			},
			{
				n: [
					"food",
					"potato",
					"vegetable"
				],
				u: "1f954",
				a: "3"
			},
			{
				n: [
					"food",
					"carrot",
					"vegetable"
				],
				u: "1f955",
				a: "3"
			},
			{
				n: [
					"ear",
					"corn",
					"farm",
					"maze",
					"crops",
					"maize",
					"ear of corn"
				],
				u: "1f33d",
				a: "0.6"
			},
			{
				n: [
					"hot",
					"pepper",
					"hot pepper"
				],
				u: "1f336-fe0f",
				a: "0.7"
			},
			{
				n: [
					"bell",
					"food",
					"pepper",
					"capsicum",
					"vegetable",
					"bell pepper"
				],
				u: "1fad1",
				a: "13"
			},
			{
				n: [
					"food",
					"pickle",
					"cucumber",
					"vegetable"
				],
				u: "1f952",
				a: "3"
			},
			{
				n: [
					"bok",
					"choy",
					"kale",
					"green",
					"leafy",
					"salad",
					"burgers",
					"cabbage",
					"lettuce",
					"leafy green"
				],
				u: "1f96c",
				a: "11"
			},
			{
				n: [
					"wild",
					"cabbage",
					"broccoli"
				],
				u: "1f966",
				a: "5"
			},
			{
				n: ["garlic", "flavoring"],
				u: "1f9c4",
				a: "12"
			},
			{
				n: ["onion", "flavoring"],
				u: "1f9c5",
				a: "12"
			},
			{
				n: [
					"nut",
					"food",
					"peanut",
					"peanuts",
					"vegetable"
				],
				u: "1f95c",
				a: "3"
			},
			{
				n: [
					"food",
					"beans",
					"small",
					"kidney",
					"legume"
				],
				u: "1fad8",
				a: "14"
			},
			{
				n: [
					"plant",
					"almond",
					"chestnut"
				],
				u: "1f330",
				a: "0.6"
			},
			{
				n: [
					"beer",
					"herb",
					"root",
					"spice",
					"ginger",
					"health",
					"natural",
					"ginger root"
				],
				u: "1fada",
				a: "15"
			},
			{
				n: [
					"pea",
					"pod",
					"beans",
					"legume",
					"veggie",
					"pea pod",
					"edamame",
					"soybean",
					"beanstalk",
					"vegetable"
				],
				u: "1fadb",
				a: "15"
			},
			{
				n: [
					"food",
					"fungi",
					"pizza",
					"spore",
					"fungus",
					"nature",
					"shroom",
					"sprout",
					"veggie",
					"truffle",
					"mushroom",
					"shiitake",
					"toppings",
					"vegetable",
					"portobello",
					"vegetarian",
					"brown mushroom"
				],
				u: "1f344-200d-1f7eb",
				a: "15.1"
			},
			{
				n: [
					"beet",
					"food",
					"root",
					"salad",
					"garden",
					"radish",
					"turnip",
					"vegetable",
					"vegetarian",
					"root vegetable"
				],
				u: "1fadc",
				a: "16"
			},
			{
				n: [
					"food",
					"loaf",
					"bread",
					"carbs",
					"grain",
					"toast",
					"wheat",
					"restaurant"
				],
				u: "1f35e",
				a: "0.6"
			},
			{
				n: [
					"food",
					"roll",
					"bread",
					"french",
					"crescent",
					"croissant",
					"breakfast"
				],
				u: "1f950",
				a: "3"
			},
			{
				n: [
					"food",
					"bread",
					"french",
					"baguette",
					"baguette bread"
				],
				u: "1f956",
				a: "3"
			},
			{
				n: [
					"food",
					"naan",
					"pita",
					"arepa",
					"bread",
					"lavash",
					"gordita",
					"flatbread"
				],
				u: "1fad3",
				a: "13"
			},
			{
				n: [
					"pretzel",
					"twisted",
					"convoluted"
				],
				u: "1f968",
				a: "5"
			},
			{
				n: [
					"bagel",
					"bread",
					"bakery",
					"schmear",
					"breakfast"
				],
				u: "1f96f",
				a: "11"
			},
			{
				n: [
					"food",
					"crêpe",
					"hotcake",
					"pancake",
					"pancakes",
					"breakfast"
				],
				u: "1f95e",
				a: "3"
			},
			{
				n: [
					"iron",
					"waffle",
					"breakfast",
					"indecisive"
				],
				u: "1f9c7",
				a: "12"
			},
			{
				n: [
					"wedge",
					"cheese",
					"cheese wedge"
				],
				u: "1f9c0",
				a: "1"
			},
			{
				n: [
					"bone",
					"meat",
					"meat on bone"
				],
				u: "1f356",
				a: "0.6"
			},
			{
				n: [
					"leg",
					"bone",
					"hungry",
					"turkey",
					"chicken",
					"poultry",
					"drumstick",
					"poultry leg"
				],
				u: "1f357",
				a: "0.6"
			},
			{
				n: [
					"cut",
					"red",
					"chop",
					"meat",
					"steak",
					"lambchop",
					"porkchop",
					"cut of meat"
				],
				u: "1f969",
				a: "5"
			},
			{
				n: [
					"food",
					"meat",
					"bacon",
					"breakfast"
				],
				u: "1f953",
				a: "3"
			},
			{
				n: [
					"eat",
					"fast",
					"food",
					"burger",
					"hungry",
					"hamburger"
				],
				u: "1f354",
				a: "0.6"
			},
			{
				n: [
					"fast",
					"food",
					"fries",
					"french",
					"french fries"
				],
				u: "1f35f",
				a: "0.6"
			},
			{
				n: [
					"food",
					"pizza",
					"slice",
					"cheese",
					"hungry",
					"pepperoni"
				],
				u: "1f355",
				a: "0.6"
			},
			{
				n: [
					"dog",
					"hot",
					"hotdog",
					"hot dog",
					"sausage",
					"frankfurter"
				],
				u: "1f32d",
				a: "1"
			},
			{
				n: ["bread", "sandwich"],
				u: "1f96a",
				a: "5"
			},
			{
				n: ["taco", "mexican"],
				u: "1f32e",
				a: "1"
			},
			{
				n: [
					"wrap",
					"burrito",
					"mexican"
				],
				u: "1f32f",
				a: "1"
			},
			{
				n: [
					"food",
					"tamale",
					"mexican",
					"pamonha",
					"wrapped"
				],
				u: "1fad4",
				a: "13"
			},
			{
				n: [
					"food",
					"gyro",
					"kebab",
					"falafel",
					"stuffed",
					"flatbread",
					"stuffed flatbread"
				],
				u: "1f959",
				a: "3"
			},
			{
				n: [
					"falafel",
					"chickpea",
					"meatball"
				],
				u: "1f9c6",
				a: "12"
			},
			{
				n: [
					"egg",
					"food",
					"breakfast"
				],
				u: "1f95a",
				a: "3"
			},
			{
				n: [
					"up",
					"egg",
					"fry",
					"pan",
					"easy",
					"over",
					"side",
					"sunny",
					"frying",
					"cooking",
					"breakfast",
					"restaurant"
				],
				u: "1f373",
				a: "0.6"
			},
			{
				n: [
					"pan",
					"food",
					"paella",
					"shallow",
					"casserole",
					"shallow pan of food"
				],
				u: "1f958",
				a: "3"
			},
			{
				n: [
					"pot",
					"food",
					"soup",
					"stew",
					"pot of food"
				],
				u: "1f372",
				a: "0.6"
			},
			{
				n: [
					"pot",
					"ski",
					"food",
					"fondue",
					"cheese",
					"melted",
					"chocolate"
				],
				u: "1fad5",
				a: "13"
			},
			{
				n: [
					"bowl",
					"spoon",
					"cereal",
					"congee",
					"oatmeal",
					"porridge",
					"breakfast",
					"bowl with spoon"
				],
				u: "1f963",
				a: "5"
			},
			{
				n: [
					"food",
					"green",
					"salad",
					"green salad"
				],
				u: "1f957",
				a: "3"
			},
			{
				n: [
					"pop",
					"corn",
					"movie",
					"popcorn"
				],
				u: "1f37f",
				a: "1"
			},
			{
				n: ["dairy", "butter"],
				u: "1f9c8",
				a: "12"
			},
			{
				n: [
					"mad",
					"salt",
					"salty",
					"taste",
					"upset",
					"flavor",
					"shaker",
					"condiment"
				],
				u: "1f9c2",
				a: "11"
			},
			{
				n: [
					"can",
					"food",
					"canned",
					"canned food"
				],
				u: "1f96b",
				a: "5"
			},
			{
				n: [
					"box",
					"food",
					"bento",
					"bento box"
				],
				u: "1f371",
				a: "0.6"
			},
			{
				n: [
					"food",
					"rice",
					"cracker",
					"rice cracker"
				],
				u: "1f358",
				a: "0.6"
			},
			{
				n: [
					"ball",
					"food",
					"rice",
					"japanese",
					"rice ball"
				],
				u: "1f359",
				a: "0.6"
			},
			{
				n: [
					"food",
					"rice",
					"cooked",
					"cooked rice"
				],
				u: "1f35a",
				a: "0.6"
			},
			{
				n: [
					"food",
					"rice",
					"curry",
					"curry rice"
				],
				u: "1f35b",
				a: "0.6"
			},
			{
				n: [
					"pho",
					"bowl",
					"food",
					"soup",
					"ramen",
					"noodle",
					"steaming",
					"chopsticks",
					"steaming bowl"
				],
				u: "1f35c",
				a: "0.6"
			},
			{
				n: [
					"food",
					"pasta",
					"spaghetti",
					"meatballs",
					"restaurant"
				],
				u: "1f35d",
				a: "0.6"
			},
			{
				n: [
					"food",
					"sweet",
					"potato",
					"roasted",
					"roasted sweet potato"
				],
				u: "1f360",
				a: "0.6"
			},
			{
				n: [
					"oden",
					"food",
					"kebab",
					"stick",
					"skewer",
					"seafood",
					"restaurant"
				],
				u: "1f362",
				a: "0.6"
			},
			{
				n: ["food", "sushi"],
				u: "1f363",
				a: "0.6"
			},
			{
				n: [
					"fried",
					"prawn",
					"shrimp",
					"tempura",
					"fried shrimp"
				],
				u: "1f364",
				a: "0.6"
			},
			{
				n: [
					"cake",
					"fish",
					"food",
					"swirl",
					"pastry",
					"restaurant",
					"fish cake with swirl"
				],
				u: "1f365",
				a: "0.6"
			},
			{
				n: [
					"cake",
					"moon",
					"autumn",
					"yuèbǐng",
					"festival",
					"moon cake"
				],
				u: "1f96e",
				a: "11"
			},
			{
				n: [
					"dango",
					"stick",
					"sweet",
					"skewer",
					"dessert",
					"japanese"
				],
				u: "1f361",
				a: "0.6"
			},
			{
				n: [
					"gyōza",
					"jiaozi",
					"pierogi",
					"dumpling",
					"empanada",
					"potsticker"
				],
				u: "1f95f",
				a: "5"
			},
			{
				n: [
					"cookie",
					"fortune",
					"prophecy",
					"fortune cookie"
				],
				u: "1f960",
				a: "5"
			},
			{
				n: [
					"box",
					"food",
					"pail",
					"oyster",
					"takeout",
					"delivery",
					"chopsticks",
					"takeout box"
				],
				u: "1f961",
				a: "5"
			},
			{
				n: [
					"ice",
					"food",
					"soft",
					"cream",
					"serve",
					"sweet",
					"dessert",
					"icecream",
					"restaurant",
					"soft ice cream"
				],
				u: "1f366",
				a: "0.6"
			},
			{
				n: [
					"ice",
					"sweet",
					"shaved",
					"dessert",
					"shaved ice",
					"restaurant"
				],
				u: "1f367",
				a: "0.6"
			},
			{
				n: [
					"ice",
					"food",
					"cream",
					"sweet",
					"dessert",
					"ice cream",
					"restaurant"
				],
				u: "1f368",
				a: "0.6"
			},
			{
				n: [
					"food",
					"donut",
					"sweet",
					"dessert",
					"doughnut",
					"breakfast"
				],
				u: "1f369",
				a: "0.6"
			},
			{
				n: [
					"chip",
					"sweet",
					"cookie",
					"dessert",
					"chocolate"
				],
				u: "1f36a",
				a: "0.6"
			},
			{
				n: [
					"bday",
					"cake",
					"happy",
					"sweet",
					"pastry",
					"dessert",
					"birthday",
					"celebration",
					"birthday cake"
				],
				u: "1f382",
				a: "0.6"
			},
			{
				n: [
					"cake",
					"slice",
					"sweet",
					"pastry",
					"dessert",
					"shortcake"
				],
				u: "1f370",
				a: "0.6"
			},
			{
				n: [
					"sugar",
					"sweet",
					"treat",
					"bakery",
					"cupcake",
					"dessert",
					"sprinkles"
				],
				u: "1f9c1",
				a: "11"
			},
			{
				n: [
					"pie",
					"meat",
					"apple",
					"fruit",
					"slice",
					"pastry",
					"filling",
					"pumpkin"
				],
				u: "1f967",
				a: "5"
			},
			{
				n: [
					"bar",
					"candy",
					"sweet",
					"tooth",
					"dessert",
					"chocolate",
					"halloween",
					"chocolate bar"
				],
				u: "1f36b",
				a: "0.6"
			},
			{
				n: [
					"candy",
					"sweet",
					"tooth",
					"dessert",
					"wrapper",
					"cavities",
					"halloween",
					"restaurant"
				],
				u: "1f36c",
				a: "0.6"
			},
			{
				n: [
					"food",
					"candy",
					"sweet",
					"dessert",
					"lollipop",
					"restaurant"
				],
				u: "1f36d",
				a: "0.6"
			},
			{
				n: [
					"sweet",
					"custard",
					"dessert",
					"pudding"
				],
				u: "1f36e",
				a: "0.6"
			},
			{
				n: [
					"jar",
					"pot",
					"bear",
					"food",
					"honey",
					"sweet",
					"barrel",
					"honeypot",
					"honey pot"
				],
				u: "1f36f",
				a: "0.6"
			},
			{
				n: [
					"baby",
					"born",
					"milk",
					"birth",
					"drink",
					"babies",
					"bottle",
					"infant",
					"newborn",
					"baby bottle"
				],
				u: "1f37c",
				a: "1"
			},
			{
				n: [
					"milk",
					"drink",
					"glass",
					"glass of milk"
				],
				u: "1f95b",
				a: "3"
			},
			{
				n: [
					"hot",
					"tea",
					"cafe",
					"chai",
					"drink",
					"coffee",
					"morning",
					"beverage",
					"caffeine",
					"steaming",
					"hot beverage"
				],
				u: "2615",
				a: "0.6"
			},
			{
				n: [
					"pot",
					"tea",
					"brew",
					"food",
					"drink",
					"teapot"
				],
				u: "1fad6",
				a: "13"
			},
			{
				n: [
					"cup",
					"tea",
					"drink",
					"handle",
					"oolong",
					"teacup",
					"beverage",
					"teacup without handle"
				],
				u: "1f375",
				a: "0.6"
			},
			{
				n: [
					"bar",
					"cup",
					"sake",
					"drink",
					"bottle",
					"beverage",
					"restaurant"
				],
				u: "1f376",
				a: "0.6"
			},
			{
				n: [
					"bar",
					"cork",
					"drink",
					"bottle",
					"popping",
					"bottle with popping cork"
				],
				u: "1f37e",
				a: "1"
			},
			{
				n: [
					"bar",
					"club",
					"wine",
					"booze",
					"drink",
					"glass",
					"drinks",
					"alcohol",
					"beverage",
					"drinking",
					"wine glass",
					"restaurant"
				],
				u: "1f377",
				a: "0.6"
			},
			{
				n: [
					"bar",
					"mad",
					"men",
					"club",
					"booze",
					"drink",
					"glass",
					"drinks",
					"alcohol",
					"martini",
					"cocktail",
					"drinking",
					"cocktail glass"
				],
				u: "1f378",
				a: "0.6"
			},
			{
				n: [
					"bar",
					"mai",
					"tai",
					"club",
					"booze",
					"drink",
					"drunk",
					"party",
					"drinks",
					"alcohol",
					"tropics",
					"cocktail",
					"drinking",
					"tropical",
					"tropical drink"
				],
				u: "1f379",
				a: "0.6"
			},
			{
				n: [
					"ale",
					"bar",
					"mug",
					"beer",
					"pint",
					"booze",
					"drink",
					"stein",
					"drinks",
					"summer",
					"alcohol",
					"beer mug",
					"drinking",
					"octoberfest",
					"oktoberfest"
				],
				u: "1f37a",
				a: "0.6"
			},
			{
				n: [
					"bar",
					"beer",
					"mugs",
					"booze",
					"clink",
					"cheers",
					"drinks",
					"alcohol",
					"bottoms",
					"clinking",
					"drinking",
					"clinking beer mugs"
				],
				u: "1f37b",
				a: "0.6"
			},
			{
				n: [
					"clink",
					"drink",
					"glass",
					"glasses",
					"clinking",
					"celebrate",
					"clinking glasses"
				],
				u: "1f942",
				a: "3"
			},
			{
				n: [
					"shot",
					"glass",
					"liquor",
					"scotch",
					"whisky",
					"tumbler",
					"whiskey",
					"tumbler glass"
				],
				u: "1f943",
				a: "3"
			},
			{
				n: [
					"oops",
					"pour",
					"drink",
					"empty",
					"glass",
					"spill",
					"water",
					"liquid",
					"pouring",
					"accident",
					"pouring liquid"
				],
				u: "1fad7",
				a: "14"
			},
			{
				n: [
					"cup",
					"malt",
					"soda",
					"soft",
					"drink",
					"juice",
					"straw",
					"water",
					"cup with straw"
				],
				u: "1f964",
				a: "5"
			},
			{
				n: [
					"tea",
					"boba",
					"food",
					"milk",
					"pearl",
					"bubble",
					"bubble tea"
				],
				u: "1f9cb",
				a: "13"
			},
			{
				n: [
					"box",
					"juice",
					"straw",
					"sweet",
					"beverage",
					"beverage box"
				],
				u: "1f9c3",
				a: "12"
			},
			{
				n: ["mate", "drink"],
				u: "1f9c9",
				a: "12"
			},
			{
				n: [
					"ice",
					"cold",
					"cube",
					"iceberg"
				],
				u: "1f9ca",
				a: "12"
			},
			{
				n: [
					"hashi",
					"kuaizi",
					"jeotgarak",
					"chopsticks"
				],
				u: "1f962",
				a: "5"
			},
			{
				n: [
					"eat",
					"fork",
					"knife",
					"plate",
					"dinner",
					"cooking",
					"fork and knife with plate"
				],
				u: "1f37d-fe0f",
				a: "0.7"
			},
			{
				n: [
					"eat",
					"yum",
					"feed",
					"food",
					"fork",
					"knife",
					"lunch",
					"yummy",
					"breaky",
					"dinner",
					"hungry",
					"cooking",
					"cutlery",
					"breakfast",
					"delicious",
					"restaurant",
					"fork and knife"
				],
				u: "1f374",
				a: "0.6"
			},
			{
				n: [
					"eat",
					"spoon",
					"tableware"
				],
				u: "1f944",
				a: "3"
			},
			{
				n: [
					"chef",
					"tool",
					"hocho",
					"knife",
					"weapon",
					"cooking",
					"kitchen",
					"kitchen knife"
				],
				u: "1f52a",
				a: "0.6"
			},
			{
				n: [
					"jar",
					"empty",
					"sauce",
					"store",
					"nothing",
					"condiment",
					"container"
				],
				u: "1fad9",
				a: "14"
			},
			{
				n: [
					"jug",
					"tool",
					"drink",
					"weapon",
					"zodiac",
					"amphora",
					"cooking",
					"aquarius"
				],
				u: "1f3fa",
				a: "1"
			}
		],
		travel_places: [
			{
				n: [
					"earth",
					"globe",
					"world",
					"africa",
					"europe",
					"showing",
					"europe africa",
					"globe showing Europe Africa"
				],
				u: "1f30d",
				a: "0.7"
			},
			{
				n: [
					"earth",
					"globe",
					"world",
					"showing",
					"americas",
					"globe showing Americas"
				],
				u: "1f30e",
				a: "0.7"
			},
			{
				n: [
					"asia",
					"earth",
					"globe",
					"world",
					"showing",
					"australia",
					"asia australia",
					"globe showing Asia Australia"
				],
				u: "1f30f",
				a: "0.6"
			},
			{
				n: [
					"web",
					"earth",
					"globe",
					"world",
					"internet",
					"meridians",
					"worldwide",
					"globe with meridians"
				],
				u: "1f310",
				a: "1"
			},
			{
				n: [
					"map",
					"world",
					"world map"
				],
				u: "1f5fa-fe0f",
				a: "0.7"
			},
			{
				n: [
					"map",
					"japan",
					"map of Japan"
				],
				u: "1f5fe",
				a: "0.6"
			},
			{
				n: [
					"compass",
					"magnetic",
					"direction",
					"navigation",
					"orienteering"
				],
				u: "1f9ed",
				a: "11"
			},
			{
				n: [
					"cold",
					"snow",
					"mountain",
					"snow capped",
					"snow capped mountain"
				],
				u: "1f3d4-fe0f",
				a: "0.7"
			},
			{
				n: ["mountain"],
				u: "26f0-fe0f",
				a: "0.7"
			},
			{
				n: [
					"nature",
					"volcano",
					"eruption",
					"mountain"
				],
				u: "1f30b",
				a: "0.6"
			},
			{
				n: [
					"fuji",
					"mount",
					"nature",
					"mountain",
					"mount fuji"
				],
				u: "1f5fb",
				a: "0.6"
			},
			{
				n: ["camping"],
				u: "1f3d5-fe0f",
				a: "0.7"
			},
			{
				n: [
					"beach",
					"umbrella",
					"beach with umbrella"
				],
				u: "1f3d6-fe0f",
				a: "0.7"
			},
			{
				n: ["desert"],
				u: "1f3dc-fe0f",
				a: "0.7"
			},
			{
				n: [
					"desert",
					"island",
					"desert island"
				],
				u: "1f3dd-fe0f",
				a: "0.7"
			},
			{
				n: [
					"park",
					"national",
					"national park"
				],
				u: "1f3de-fe0f",
				a: "0.7"
			},
			{
				n: ["stadium"],
				u: "1f3df-fe0f",
				a: "0.7"
			},
			{
				n: [
					"building",
					"classical",
					"classical building"
				],
				u: "1f3db-fe0f",
				a: "0.7"
			},
			{
				n: [
					"crane",
					"building",
					"construction",
					"building construction"
				],
				u: "1f3d7-fe0f",
				a: "0.7"
			},
			{
				n: [
					"clay",
					"wall",
					"brick",
					"bricks",
					"mortar"
				],
				u: "1f9f1",
				a: "11"
			},
			{
				n: [
					"rock",
					"heavy",
					"solid",
					"stone",
					"tough",
					"boulder"
				],
				u: "1faa8",
				a: "13"
			},
			{
				n: [
					"log",
					"wood",
					"lumber",
					"timber"
				],
				u: "1fab5",
				a: "13"
			},
			{
				n: [
					"hut",
					"home",
					"yurt",
					"house",
					"shelter",
					"roundhouse"
				],
				u: "1f6d6",
				a: "13"
			},
			{
				n: ["house", "houses"],
				u: "1f3d8-fe0f",
				a: "0.7"
			},
			{
				n: [
					"home",
					"house",
					"derelict",
					"derelict house"
				],
				u: "1f3da-fe0f",
				a: "0.7"
			},
			{
				n: [
					"home",
					"house",
					"heart",
					"ranch",
					"where",
					"settle",
					"simple",
					"country",
					"building",
					"suburban",
					"suburbia"
				],
				u: "1f3e0",
				a: "0.6"
			},
			{
				n: [
					"home",
					"heart",
					"house",
					"ranch",
					"where",
					"garden",
					"settle",
					"simple",
					"country",
					"building",
					"suburban",
					"suburbia",
					"house with garden"
				],
				u: "1f3e1",
				a: "0.6"
			},
			{
				n: [
					"job",
					"city",
					"office",
					"cubical",
					"building",
					"office building"
				],
				u: "1f3e2",
				a: "0.6"
			},
			{
				n: [
					"post",
					"office",
					"building",
					"japanese",
					"Japanese post office"
				],
				u: "1f3e3",
				a: "0.6"
			},
			{
				n: [
					"post",
					"office",
					"building",
					"european",
					"post office"
				],
				u: "1f3e4",
				a: "1"
			},
			{
				n: [
					"doctor",
					"hospital",
					"building",
					"medicine"
				],
				u: "1f3e5",
				a: "0.6"
			},
			{
				n: ["bank", "building"],
				u: "1f3e6",
				a: "0.6"
			},
			{
				n: ["hotel", "building"],
				u: "1f3e8",
				a: "0.6"
			},
			{
				n: [
					"love",
					"hotel",
					"building",
					"love hotel"
				],
				u: "1f3e9",
				a: "0.6"
			},
			{
				n: [
					"24",
					"hours",
					"store",
					"building",
					"convenience",
					"convenience store"
				],
				u: "1f3ea",
				a: "0.6"
			},
			{
				n: ["school", "building"],
				u: "1f3eb",
				a: "0.6"
			},
			{
				n: [
					"store",
					"building",
					"department",
					"department store"
				],
				u: "1f3ec",
				a: "0.6"
			},
			{
				n: ["factory", "building"],
				u: "1f3ed",
				a: "0.6"
			},
			{
				n: [
					"castle",
					"building",
					"japanese",
					"Japanese castle"
				],
				u: "1f3ef",
				a: "0.6"
			},
			{
				n: [
					"castle",
					"building",
					"european"
				],
				u: "1f3f0",
				a: "0.6"
			},
			{
				n: [
					"chapel",
					"wedding",
					"hitched",
					"romance",
					"nuptials"
				],
				u: "1f492",
				a: "0.6"
			},
			{
				n: [
					"tokyo",
					"tower",
					"Tokyo tower"
				],
				u: "1f5fc",
				a: "0.6"
			},
			{
				n: [
					"ny",
					"new",
					"nyc",
					"york",
					"statue",
					"liberty",
					"Statue of Liberty"
				],
				u: "1f5fd",
				a: "0.6"
			},
			{
				n: [
					"bless",
					"cross",
					"church",
					"chapel",
					"religion",
					"christian"
				],
				u: "26ea",
				a: "0.6"
			},
			{
				n: [
					"islam",
					"mosque",
					"masjid",
					"muslim",
					"religion"
				],
				u: "1f54c",
				a: "1"
			},
			{
				n: [
					"hindu",
					"temple",
					"hindu temple"
				],
				u: "1f6d5",
				a: "12"
			},
			{
				n: [
					"jew",
					"jewish",
					"temple",
					"judaism",
					"religion",
					"synagogue"
				],
				u: "1f54d",
				a: "1"
			},
			{
				n: [
					"shinto",
					"shrine",
					"religion",
					"shinto shrine"
				],
				u: "26e9-fe0f",
				a: "0.7"
			},
			{
				n: [
					"hajj",
					"kaaba",
					"islam",
					"umrah",
					"muslim",
					"religion"
				],
				u: "1f54b",
				a: "1"
			},
			{
				n: ["fountain"],
				u: "26f2",
				a: "0.6"
			},
			{
				n: ["tent", "camping"],
				u: "26fa",
				a: "0.6"
			},
			{
				n: ["fog", "foggy"],
				u: "1f301",
				a: "0.6"
			},
			{
				n: [
					"star",
					"night",
					"stars",
					"night with stars"
				],
				u: "1f303",
				a: "0.6"
			},
			{
				n: ["city", "cityscape"],
				u: "1f3d9-fe0f",
				a: "0.7"
			},
			{
				n: [
					"sun",
					"over",
					"morning",
					"sunrise",
					"mountains",
					"sunrise over mountains"
				],
				u: "1f304",
				a: "0.6"
			},
			{
				n: [
					"sun",
					"nature",
					"sunrise",
					"morning"
				],
				u: "1f305",
				a: "0.6"
			},
			{
				n: [
					"at",
					"sun",
					"city",
					"dusk",
					"sunset",
					"evening",
					"building",
					"cityscape",
					"landscape",
					"cityscape at dusk"
				],
				u: "1f306",
				a: "0.6"
			},
			{
				n: [
					"sun",
					"dusk",
					"sunset",
					"building"
				],
				u: "1f307",
				a: "0.6"
			},
			{
				n: [
					"at",
					"night",
					"bridge",
					"bridge at night"
				],
				u: "1f309",
				a: "0.6"
			},
			{
				n: [
					"hot",
					"springs",
					"steaming",
					"hotsprings",
					"hot springs"
				],
				u: "2668-fe0f",
				a: "0.6"
			},
			{
				n: [
					"horse",
					"carousel",
					"entertainment",
					"carousel horse"
				],
				u: "1f3a0",
				a: "0.6"
			},
			{
				n: [
					"park",
					"play",
					"slide",
					"theme",
					"playing",
					"sliding",
					"amusement",
					"playground",
					"playground slide"
				],
				u: "1f6dd",
				a: "14"
			},
			{
				n: [
					"park",
					"theme",
					"wheel",
					"ferris",
					"amusement",
					"ferris wheel"
				],
				u: "1f3a1",
				a: "0.6"
			},
			{
				n: [
					"park",
					"theme",
					"roller",
					"coaster",
					"amusement",
					"roller coaster"
				],
				u: "1f3a2",
				a: "0.6"
			},
			{
				n: [
					"cut",
					"pole",
					"fresh",
					"shave",
					"barber",
					"haircut",
					"barber pole"
				],
				u: "1f488",
				a: "0.6"
			},
			{
				n: [
					"tent",
					"circus",
					"circus tent"
				],
				u: "1f3aa",
				a: "0.6"
			},
			{
				n: [
					"steam",
					"train",
					"engine",
					"trains",
					"travel",
					"caboose",
					"railway",
					"locomotive"
				],
				u: "1f682",
				a: "1"
			},
			{
				n: [
					"car",
					"tram",
					"train",
					"travel",
					"railway",
					"electric",
					"trolleybus",
					"railway car"
				],
				u: "1f683",
				a: "0.6"
			},
			{
				n: [
					"speed",
					"train",
					"railway",
					"high speed",
					"shinkansen",
					"high speed train"
				],
				u: "1f684",
				a: "0.6"
			},
			{
				n: [
					"nose",
					"speed",
					"train",
					"bullet",
					"travel",
					"railway",
					"high speed",
					"shinkansen",
					"bullet train"
				],
				u: "1f685",
				a: "0.6"
			},
			{
				n: [
					"choo",
					"train",
					"arrived",
					"railway"
				],
				u: "1f686",
				a: "1"
			},
			{
				n: [
					"metro",
					"subway",
					"travel"
				],
				u: "1f687",
				a: "0.6"
			},
			{
				n: [
					"rail",
					"light",
					"arrived",
					"railway",
					"monorail",
					"light rail"
				],
				u: "1f688",
				a: "1"
			},
			{
				n: [
					"train",
					"station",
					"railway"
				],
				u: "1f689",
				a: "0.6"
			},
			{
				n: ["tram", "trolleybus"],
				u: "1f68a",
				a: "1"
			},
			{
				n: ["vehicle", "monorail"],
				u: "1f69d",
				a: "1"
			},
			{
				n: [
					"car",
					"trip",
					"railway",
					"mountain",
					"mountain railway"
				],
				u: "1f69e",
				a: "1"
			},
			{
				n: [
					"bus",
					"car",
					"tram",
					"trolley",
					"tram car",
					"trolleybus"
				],
				u: "1f68b",
				a: "1"
			},
			{
				n: [
					"bus",
					"school",
					"vehicle"
				],
				u: "1f68c",
				a: "0.6"
			},
			{
				n: [
					"bus",
					"cars",
					"oncoming",
					"oncoming bus"
				],
				u: "1f68d",
				a: "0.7"
			},
			{
				n: [
					"bus",
					"tram",
					"trolley",
					"trolleybus"
				],
				u: "1f68e",
				a: "1"
			},
			{
				n: [
					"bus",
					"van",
					"drive",
					"minibus",
					"vehicle"
				],
				u: "1f690",
				a: "1"
			},
			{
				n: [
					"vehicle",
					"ambulance",
					"emergency"
				],
				u: "1f691",
				a: "0.6"
			},
			{
				n: [
					"fire",
					"truck",
					"engine",
					"fire engine"
				],
				u: "1f692",
				a: "0.6"
			},
			{
				n: [
					"5–0",
					"car",
					"cops",
					"patrol",
					"police",
					"police car"
				],
				u: "1f693",
				a: "0.6"
			},
			{
				n: [
					"car",
					"police",
					"oncoming",
					"oncoming police car"
				],
				u: "1f694",
				a: "0.7"
			},
			{
				n: [
					"cab",
					"car",
					"taxi",
					"drive",
					"cabbie",
					"yellow",
					"vehicle"
				],
				u: "1f695",
				a: "0.6"
			},
			{
				n: [
					"cab",
					"cars",
					"hail",
					"taxi",
					"drove",
					"cabbie",
					"yellow",
					"oncoming",
					"oncoming taxi"
				],
				u: "1f696",
				a: "1"
			},
			{
				n: [
					"car",
					"driving",
					"vehicle",
					"automobile"
				],
				u: "1f697",
				a: "0.6"
			},
			{
				n: [
					"car",
					"cars",
					"drove",
					"vehicle",
					"oncoming",
					"automobile",
					"oncoming automobile"
				],
				u: "1f698",
				a: "0.7"
			},
			{
				n: [
					"car",
					"drive",
					"sport",
					"utility",
					"vehicle",
					"recreational",
					"sportutility",
					"sport utility vehicle"
				],
				u: "1f699",
				a: "0.6"
			},
			{
				n: [
					"car",
					"truck",
					"pickup",
					"flatbed",
					"pick up",
					"automobile",
					"pickup truck",
					"transportation"
				],
				u: "1f6fb",
				a: "13"
			},
			{
				n: [
					"car",
					"drive",
					"truck",
					"vehicle",
					"delivery",
					"delivery truck"
				],
				u: "1f69a",
				a: "0.6"
			},
			{
				n: [
					"car",
					"move",
					"semi",
					"drive",
					"lorry",
					"truck",
					"vehicle",
					"articulated",
					"articulated lorry"
				],
				u: "1f69b",
				a: "1"
			},
			{
				n: ["tractor", "vehicle"],
				u: "1f69c",
				a: "1"
			},
			{
				n: [
					"car",
					"zoom",
					"racing",
					"racing car"
				],
				u: "1f3ce-fe0f",
				a: "0.7"
			},
			{
				n: ["racing", "motorcycle"],
				u: "1f3cd-fe0f",
				a: "0.7"
			},
			{
				n: [
					"motor",
					"scooter",
					"motor scooter"
				],
				u: "1f6f5",
				a: "3"
			},
			{
				n: [
					"manual",
					"wheelchair",
					"accessibility",
					"manual wheelchair"
				],
				u: "1f9bd",
				a: "12"
			},
			{
				n: [
					"motorized",
					"wheelchair",
					"accessibility",
					"motorized wheelchair"
				],
				u: "1f9bc",
				a: "12"
			},
			{
				n: [
					"tuk",
					"auto",
					"rickshaw",
					"auto rickshaw"
				],
				u: "1f6fa",
				a: "12"
			},
			{
				n: [
					"bike",
					"gang",
					"ride",
					"spin",
					"class",
					"cycle",
					"bicycle",
					"cycling",
					"cyclist",
					"spinning"
				],
				u: "1f6b2",
				a: "0.6"
			},
			{
				n: [
					"kick",
					"scooter",
					"kick scooter"
				],
				u: "1f6f4",
				a: "3"
			},
			{
				n: [
					"board",
					"skate",
					"skater",
					"wheels",
					"skateboard"
				],
				u: "1f6f9",
				a: "11"
			},
			{
				n: [
					"skate",
					"sport",
					"blades",
					"roller",
					"skates",
					"roller skate"
				],
				u: "1f6fc",
				a: "13"
			},
			{
				n: [
					"bus",
					"stop",
					"busstop",
					"bus stop"
				],
				u: "1f68f",
				a: "0.6"
			},
			{
				n: [
					"road",
					"highway",
					"motorway"
				],
				u: "1f6e3-fe0f",
				a: "0.7"
			},
			{
				n: [
					"track",
					"train",
					"railway",
					"railway track"
				],
				u: "1f6e4-fe0f",
				a: "0.7"
			},
			{
				n: [
					"oil",
					"drum",
					"oil drum"
				],
				u: "1f6e2-fe0f",
				a: "0.7"
			},
			{
				n: [
					"gas",
					"fuel",
					"pump",
					"diesel",
					"station",
					"fuelpump",
					"gasoline",
					"fuel pump"
				],
				u: "26fd",
				a: "0.6"
			},
			{
				n: [
					"car",
					"tire",
					"turn",
					"wheel",
					"circle",
					"vehicle"
				],
				u: "1f6de",
				a: "14"
			},
			{
				n: [
					"car",
					"alarm",
					"alert",
					"light",
					"siren",
					"beacon",
					"police",
					"emergency",
					"revolving",
					"police car light"
				],
				u: "1f6a8",
				a: "0.6"
			},
			{
				n: [
					"stop",
					"light",
					"signal",
					"traffic",
					"stoplight",
					"horizontal",
					"intersection",
					"horizontal traffic light"
				],
				u: "1f6a5",
				a: "0.6"
			},
			{
				n: [
					"stop",
					"drove",
					"light",
					"signal",
					"traffic",
					"vertical",
					"stoplight",
					"intersection",
					"vertical traffic light"
				],
				u: "1f6a6",
				a: "1"
			},
			{
				n: [
					"sign",
					"stop",
					"stop sign",
					"octagonal"
				],
				u: "1f6d1",
				a: "3"
			},
			{
				n: ["barrier", "construction"],
				u: "1f6a7",
				a: "0.6"
			},
			{
				n: [
					"ship",
					"tool",
					"anchor"
				],
				u: "2693",
				a: "0.6"
			},
			{
				n: [
					"buoy",
					"life",
					"ring",
					"save",
					"swim",
					"float",
					"saver",
					"rescue",
					"safety",
					"ring buoy",
					"lifesaver",
					"preserver"
				],
				u: "1f6df",
				a: "14"
			},
			{
				n: [
					"sea",
					"boat",
					"yacht",
					"resort",
					"sailing",
					"sailboat"
				],
				u: "26f5",
				a: "0.6"
			},
			{
				n: ["boat", "canoe"],
				u: "1f6f6",
				a: "3"
			},
			{
				n: [
					"boat",
					"lake",
					"luxury",
					"summer",
					"travel",
					"speedboat",
					"billionaire",
					"millionaire"
				],
				u: "1f6a4",
				a: "0.6"
			},
			{
				n: [
					"ship",
					"passenger",
					"passenger ship"
				],
				u: "1f6f3-fe0f",
				a: "0.7"
			},
			{
				n: [
					"boat",
					"ferry",
					"passenger"
				],
				u: "26f4-fe0f",
				a: "0.7"
			},
			{
				n: [
					"boat",
					"motor",
					"motorboat",
					"motor boat"
				],
				u: "1f6e5-fe0f",
				a: "0.7"
			},
			{
				n: [
					"ship",
					"boat",
					"travel",
					"passenger"
				],
				u: "1f6a2",
				a: "0.6"
			},
			{
				n: [
					"fly",
					"jet",
					"plane",
					"flying",
					"travel",
					"airplane",
					"aeroplane"
				],
				u: "2708-fe0f",
				a: "0.6"
			},
			{
				n: [
					"plane",
					"small",
					"airplane",
					"aeroplane",
					"small airplane"
				],
				u: "1f6e9-fe0f",
				a: "0.7"
			},
			{
				n: [
					"plane",
					"airplane",
					"check in",
					"aeroplane",
					"departure",
					"departures",
					"airplane departure"
				],
				u: "1f6eb",
				a: "1"
			},
			{
				n: [
					"plane",
					"arrival",
					"landing",
					"airplane",
					"arrivals",
					"arriving",
					"aeroplane",
					"airplane arrival"
				],
				u: "1f6ec",
				a: "1"
			},
			{
				n: [
					"skydive",
					"parasail",
					"parachute",
					"hang glide"
				],
				u: "1fa82",
				a: "12"
			},
			{
				n: ["seat", "chair"],
				u: "1f4ba",
				a: "0.6"
			},
			{
				n: [
					"copter",
					"travel",
					"vehicle",
					"helicopter",
					"roflcopter"
				],
				u: "1f681",
				a: "1"
			},
			{
				n: [
					"railway",
					"suspension",
					"suspension railway"
				],
				u: "1f69f",
				a: "1"
			},
			{
				n: [
					"ski",
					"lift",
					"cable",
					"gondola",
					"cableway",
					"mountain",
					"mountain cableway"
				],
				u: "1f6a0",
				a: "1"
			},
			{
				n: [
					"car",
					"cable",
					"aerial",
					"gondola",
					"ropeway",
					"tramway",
					"aerial tramway"
				],
				u: "1f6a1",
				a: "1"
			},
			{
				n: ["space", "satellite"],
				u: "1f6f0-fe0f",
				a: "0.7"
			},
			{
				n: [
					"space",
					"rocket",
					"launch",
					"travel",
					"rockets"
				],
				u: "1f680",
				a: "0.6"
			},
			{
				n: [
					"ufo",
					"extra",
					"aliens",
					"flying",
					"saucer",
					"terrestrial",
					"flying saucer"
				],
				u: "1f6f8",
				a: "5"
			},
			{
				n: [
					"bell",
					"hotel",
					"bellhop",
					"bellhop bell"
				],
				u: "1f6ce-fe0f",
				a: "0.7"
			},
			{
				n: [
					"bag",
					"roller",
					"travel",
					"luggage",
					"packing",
					"suitcase"
				],
				u: "1f9f3",
				a: "11"
			},
			{
				n: [
					"done",
					"sand",
					"time",
					"timer",
					"hourglass",
					"hourglass done"
				],
				u: "231b",
				a: "0.6"
			},
			{
				n: [
					"not",
					"done",
					"sand",
					"yolo",
					"hours",
					"timer",
					"flowing",
					"waiting",
					"hourglass",
					"hourglass not done"
				],
				u: "23f3",
				a: "0.6"
			},
			{
				n: [
					"time",
					"watch",
					"clock"
				],
				u: "231a",
				a: "0.6"
			},
			{
				n: [
					"hrs",
					"late",
					"time",
					"alarm",
					"clock",
					"hours",
					"waiting",
					"alarm clock"
				],
				u: "23f0",
				a: "0.6"
			},
			{
				n: [
					"time",
					"clock",
					"stopwatch"
				],
				u: "23f1-fe0f",
				a: "1"
			},
			{
				n: [
					"clock",
					"timer",
					"timer clock"
				],
				u: "23f2-fe0f",
				a: "1"
			},
			{
				n: [
					"time",
					"clock",
					"mantelpiece",
					"mantelpiece clock"
				],
				u: "1f570-fe0f",
				a: "0.7"
			},
			{
				n: [
					"12",
					"time",
					"12:00",
					"clock",
					"twelve",
					"o’clock",
					"twelve o’clock"
				],
				u: "1f55b",
				a: "0.6"
			},
			{
				n: [
					"12",
					"30",
					"time",
					"12:30",
					"clock",
					"thirty",
					"twelve",
					"twelve thirty"
				],
				u: "1f567",
				a: "0.7"
			},
			{
				n: [
					"1",
					"one",
					"1:00",
					"time",
					"clock",
					"o’clock",
					"one o’clock"
				],
				u: "1f550",
				a: "0.6"
			},
			{
				n: [
					"1",
					"30",
					"one",
					"1:30",
					"time",
					"clock",
					"thirty",
					"one thirty"
				],
				u: "1f55c",
				a: "0.7"
			},
			{
				n: [
					"2",
					"two",
					"2:00",
					"time",
					"clock",
					"o’clock",
					"two o’clock"
				],
				u: "1f551",
				a: "0.6"
			},
			{
				n: [
					"2",
					"30",
					"two",
					"2:30",
					"time",
					"clock",
					"thirty",
					"two thirty"
				],
				u: "1f55d",
				a: "0.7"
			},
			{
				n: [
					"3",
					"3:00",
					"time",
					"clock",
					"three",
					"o’clock",
					"three o’clock"
				],
				u: "1f552",
				a: "0.6"
			},
			{
				n: [
					"3",
					"30",
					"3:30",
					"time",
					"clock",
					"three",
					"thirty",
					"three thirty"
				],
				u: "1f55e",
				a: "0.7"
			},
			{
				n: [
					"4",
					"4:00",
					"four",
					"time",
					"clock",
					"o’clock",
					"four o’clock"
				],
				u: "1f553",
				a: "0.6"
			},
			{
				n: [
					"4",
					"30",
					"4:30",
					"four",
					"time",
					"clock",
					"thirty",
					"four thirty"
				],
				u: "1f55f",
				a: "0.7"
			},
			{
				n: [
					"5",
					"5:00",
					"five",
					"time",
					"clock",
					"o’clock",
					"five o’clock"
				],
				u: "1f554",
				a: "0.6"
			},
			{
				n: [
					"5",
					"30",
					"5:30",
					"five",
					"time",
					"clock",
					"thirty",
					"five thirty"
				],
				u: "1f560",
				a: "0.7"
			},
			{
				n: [
					"6",
					"six",
					"6:00",
					"time",
					"clock",
					"o’clock",
					"six o’clock"
				],
				u: "1f555",
				a: "0.6"
			},
			{
				n: [
					"6",
					"30",
					"six",
					"6:30",
					"clock",
					"thirty",
					"six thirty"
				],
				u: "1f561",
				a: "0.7"
			},
			{
				n: [
					"0",
					"7",
					"7:00",
					"clock",
					"seven",
					"o’clock",
					"seven o’clock"
				],
				u: "1f556",
				a: "0.6"
			},
			{
				n: [
					"7",
					"30",
					"7:30",
					"clock",
					"seven",
					"thirty",
					"seven thirty"
				],
				u: "1f562",
				a: "0.7"
			},
			{
				n: [
					"8",
					"8:00",
					"time",
					"clock",
					"eight",
					"o’clock",
					"eight o’clock"
				],
				u: "1f557",
				a: "0.6"
			},
			{
				n: [
					"8",
					"30",
					"8:30",
					"time",
					"clock",
					"eight",
					"thirty",
					"eight thirty"
				],
				u: "1f563",
				a: "0.7"
			},
			{
				n: [
					"9",
					"9:00",
					"nine",
					"time",
					"clock",
					"o’clock",
					"nine o’clock"
				],
				u: "1f558",
				a: "0.6"
			},
			{
				n: [
					"9",
					"30",
					"9:30",
					"nine",
					"time",
					"clock",
					"thirty",
					"nine thirty"
				],
				u: "1f564",
				a: "0.7"
			},
			{
				n: [
					"0",
					"10",
					"ten",
					"10:00",
					"clock",
					"o’clock",
					"ten o’clock"
				],
				u: "1f559",
				a: "0.6"
			},
			{
				n: [
					"10",
					"30",
					"ten",
					"time",
					"10:30",
					"clock",
					"thirty",
					"ten thirty"
				],
				u: "1f565",
				a: "0.7"
			},
			{
				n: [
					"11",
					"time",
					"11:00",
					"clock",
					"eleven",
					"o’clock",
					"eleven o’clock"
				],
				u: "1f55a",
				a: "0.6"
			},
			{
				n: [
					"11",
					"30",
					"time",
					"11:30",
					"clock",
					"eleven",
					"thirty",
					"eleven thirty"
				],
				u: "1f566",
				a: "0.7"
			},
			{
				n: [
					"new",
					"dark",
					"moon",
					"space",
					"new moon"
				],
				u: "1f311",
				a: "0.6"
			},
			{
				n: [
					"moon",
					"space",
					"dreams",
					"waxing",
					"crescent",
					"waxing crescent moon"
				],
				u: "1f312",
				a: "1"
			},
			{
				n: [
					"moon",
					"first",
					"space",
					"quarter",
					"first quarter moon"
				],
				u: "1f313",
				a: "0.6"
			},
			{
				n: [
					"moon",
					"space",
					"waxing",
					"gibbous",
					"waxing gibbous moon"
				],
				u: "1f314",
				a: "0.6"
			},
			{
				n: [
					"full",
					"moon",
					"space",
					"full moon"
				],
				u: "1f315",
				a: "0.6"
			},
			{
				n: [
					"moon",
					"space",
					"waning",
					"gibbous",
					"waning gibbous moon"
				],
				u: "1f316",
				a: "1"
			},
			{
				n: [
					"last",
					"moon",
					"space",
					"quarter",
					"last quarter moon"
				],
				u: "1f317",
				a: "1"
			},
			{
				n: [
					"moon",
					"space",
					"waning",
					"crescent",
					"waning crescent moon"
				],
				u: "1f318",
				a: "1"
			},
			{
				n: [
					"moon",
					"space",
					"ramadan",
					"crescent",
					"crescent moon"
				],
				u: "1f319",
				a: "0.6"
			},
			{
				n: [
					"new",
					"face",
					"moon",
					"space",
					"new moon face"
				],
				u: "1f31a",
				a: "1"
			},
			{
				n: [
					"face",
					"moon",
					"first",
					"space",
					"quarter",
					"first quarter moon face"
				],
				u: "1f31b",
				a: "0.6"
			},
			{
				n: [
					"face",
					"last",
					"moon",
					"dreams",
					"quarter",
					"last quarter moon face"
				],
				u: "1f31c",
				a: "0.7"
			},
			{
				n: ["weather", "thermometer"],
				u: "1f321-fe0f",
				a: "0.7"
			},
			{
				n: [
					"sun",
					"rays",
					"space",
					"sunny",
					"bright",
					"weather"
				],
				u: "2600-fe0f",
				a: "0.6"
			},
			{
				n: [
					"face",
					"full",
					"moon",
					"bright",
					"full moon face"
				],
				u: "1f31d",
				a: "1"
			},
			{
				n: [
					"day",
					"sun",
					"face",
					"heat",
					"beach",
					"shine",
					"sunny",
					"bright",
					"weather",
					"sunshine",
					"sun with face"
				],
				u: "1f31e",
				a: "1"
			},
			{
				n: [
					"planet",
					"ringed",
					"saturn",
					"saturnine",
					"ringed planet"
				],
				u: "1fa90",
				a: "12"
			},
			{
				n: [
					"star",
					"stars",
					"white",
					"medium",
					"astronomy"
				],
				u: "2b50",
				a: "0.6"
			},
			{
				n: [
					"win",
					"glow",
					"star",
					"night",
					"glowing",
					"shining",
					"sparkle",
					"glittery",
					"glowing star"
				],
				u: "1f31f",
				a: "0.6"
			},
			{
				n: [
					"star",
					"night",
					"space",
					"falling",
					"shooting",
					"shooting star"
				],
				u: "1f320",
				a: "0.6"
			},
			{
				n: [
					"way",
					"milky",
					"space",
					"milky way"
				],
				u: "1f30c",
				a: "0.6"
			},
			{
				n: ["cloud", "weather"],
				u: "2601-fe0f",
				a: "0.6"
			},
			{
				n: [
					"sun",
					"cloud",
					"behind",
					"cloudy",
					"weather",
					"sun behind cloud"
				],
				u: "26c5",
				a: "0.6"
			},
			{
				n: [
					"rain",
					"cloud",
					"thunder",
					"lightning",
					"thunderstorm",
					"cloud with lightning and rain"
				],
				u: "26c8-fe0f",
				a: "0.7"
			},
			{
				n: [
					"sun",
					"cloud",
					"behind",
					"weather",
					"sun behind small cloud"
				],
				u: "1f324-fe0f",
				a: "0.7"
			},
			{
				n: [
					"sun",
					"cloud",
					"behind",
					"weather",
					"sun behind large cloud"
				],
				u: "1f325-fe0f",
				a: "0.7"
			},
			{
				n: [
					"sun",
					"rain",
					"cloud",
					"behind",
					"weather",
					"sun behind rain cloud"
				],
				u: "1f326-fe0f",
				a: "0.7"
			},
			{
				n: [
					"rain",
					"cloud",
					"weather",
					"cloud with rain"
				],
				u: "1f327-fe0f",
				a: "0.7"
			},
			{
				n: [
					"cold",
					"snow",
					"cloud",
					"weather",
					"cloud with snow"
				],
				u: "1f328-fe0f",
				a: "0.7"
			},
			{
				n: [
					"cloud",
					"weather",
					"lightning",
					"cloud with lightning"
				],
				u: "1f329-fe0f",
				a: "0.7"
			},
			{
				n: [
					"cloud",
					"tornado",
					"weather",
					"whirlwind"
				],
				u: "1f32a-fe0f",
				a: "0.7"
			},
			{
				n: [
					"fog",
					"cloud",
					"weather"
				],
				u: "1f32b-fe0f",
				a: "0.7"
			},
			{
				n: [
					"blow",
					"face",
					"wind",
					"cloud",
					"wind face"
				],
				u: "1f32c-fe0f",
				a: "0.7"
			},
			{
				n: [
					"dizzy",
					"cyclone",
					"twister",
					"typhoon",
					"weather",
					"hurricane"
				],
				u: "1f300",
				a: "0.6"
			},
			{
				n: [
					"gay",
					"glbt",
					"lgbt",
					"rain",
					"glbtq",
					"lgbtq",
					"pride",
					"queer",
					"trans",
					"nature",
					"rainbow",
					"lesbian",
					"lgbtqia",
					"weather",
					"genderqueer",
					"transgender"
				],
				u: "1f308",
				a: "0.6"
			},
			{
				n: [
					"rain",
					"closed",
					"clothing",
					"umbrella",
					"closed umbrella"
				],
				u: "1f302",
				a: "0.6"
			},
			{
				n: [
					"rain",
					"umbrella",
					"clothing"
				],
				u: "2602-fe0f",
				a: "0.7"
			},
			{
				n: [
					"drop",
					"rain",
					"drops",
					"weather",
					"clothing",
					"umbrella",
					"umbrella with rain drops"
				],
				u: "2614",
				a: "0.6"
			},
			{
				n: [
					"sun",
					"rain",
					"ground",
					"umbrella",
					"umbrella on ground"
				],
				u: "26f1-fe0f",
				a: "0.7"
			},
			{
				n: [
					"zap",
					"high",
					"danger",
					"nature",
					"thunder",
					"voltage",
					"electric",
					"lightning",
					"electricity",
					"thunderbolt",
					"high voltage"
				],
				u: "26a1",
				a: "0.6"
			},
			{
				n: [
					"cold",
					"snow",
					"weather",
					"snowflake"
				],
				u: "2744-fe0f",
				a: "0.6"
			},
			{
				n: [
					"man",
					"cold",
					"snow",
					"snowman"
				],
				u: "2603-fe0f",
				a: "0.7"
			},
			{
				n: [
					"man",
					"cold",
					"snow",
					"snowman",
					"snowman without snow"
				],
				u: "26c4",
				a: "0.6"
			},
			{
				n: ["comet", "space"],
				u: "2604-fe0f",
				a: "1"
			},
			{
				n: [
					"af",
					"hot",
					"lit",
					"fire",
					"burn",
					"tool",
					"flame",
					"litaf"
				],
				u: "1f525",
				a: "0.6"
			},
			{
				n: [
					"sad",
					"cold",
					"drop",
					"tear",
					"comic",
					"sweat",
					"water",
					"nature",
					"droplet",
					"weather"
				],
				u: "1f4a7",
				a: "0.6"
			},
			{
				n: [
					"surf",
					"wave",
					"ocean",
					"water",
					"nature",
					"surfer",
					"surfing",
					"water wave"
				],
				u: "1f30a",
				a: "0.6"
			}
		],
		activities: [
			{
				n: [
					"jack",
					"lantern",
					"pumpkin",
					"halloween",
					"celebration",
					"jack o lantern"
				],
				u: "1f383",
				a: "0.6"
			},
			{
				n: [
					"tree",
					"christmas",
					"celebration",
					"Christmas tree"
				],
				u: "1f384",
				a: "0.6"
			},
			{
				n: [
					"boom",
					"yolo",
					"fireworks",
					"celebration",
					"entertainment"
				],
				u: "1f386",
				a: "0.6"
			},
			{
				n: [
					"boom",
					"sparkle",
					"sparkler",
					"fireworks",
					"celebration"
				],
				u: "1f387",
				a: "0.6"
			},
			{
				n: [
					"pop",
					"fire",
					"light",
					"spark",
					"popping",
					"dynamite",
					"explosive",
					"fireworks",
					"firecracker"
				],
				u: "1f9e8",
				a: "11"
			},
			{
				n: [
					"*",
					"star",
					"magic",
					"sparkle",
					"sparkles"
				],
				u: "2728",
				a: "0.6"
			},
			{
				n: [
					"balloon",
					"birthday",
					"celebrate",
					"celebration"
				],
				u: "1f388",
				a: "0.6"
			},
			{
				n: [
					"tada",
					"party",
					"hooray",
					"popper",
					"woohoo",
					"awesome",
					"excited",
					"birthday",
					"celebrate",
					"celebration",
					"party popper"
				],
				u: "1f389",
				a: "0.6"
			},
			{
				n: [
					"ball",
					"party",
					"woohoo",
					"confetti",
					"celebrate",
					"celebration",
					"confetti ball"
				],
				u: "1f38a",
				a: "0.6"
			},
			{
				n: [
					"tree",
					"banner",
					"japanese",
					"tanabata",
					"celebration",
					"tanabata tree"
				],
				u: "1f38b",
				a: "0.6"
			},
			{
				n: [
					"pine",
					"plant",
					"bamboo",
					"japanese",
					"decoration",
					"celebration",
					"pine decoration"
				],
				u: "1f38d",
				a: "0.6"
			},
			{
				n: [
					"doll",
					"dolls",
					"festival",
					"japanese",
					"celebration",
					"Japanese dolls"
				],
				u: "1f38e",
				a: "0.6"
			},
			{
				n: [
					"carp",
					"streamer",
					"celebration",
					"carp streamer"
				],
				u: "1f38f",
				a: "0.6"
			},
			{
				n: [
					"bell",
					"wind",
					"chime",
					"wind chime",
					"celebration"
				],
				u: "1f390",
				a: "0.6"
			},
			{
				n: [
					"moon",
					"viewing",
					"ceremony",
					"celebration",
					"moon viewing ceremony"
				],
				u: "1f391",
				a: "0.6"
			},
			{
				n: [
					"lai",
					"red",
					"see",
					"gift",
					"good",
					"luck",
					"money",
					"hóngbāo",
					"envelope",
					"red envelope"
				],
				u: "1f9e7",
				a: "11"
			},
			{
				n: ["ribbon", "celebration"],
				u: "1f380",
				a: "0.6"
			},
			{
				n: [
					"bow",
					"box",
					"gift",
					"present",
					"wrapped",
					"birthday",
					"surprise",
					"christmas",
					"celebration",
					"wrapped gift"
				],
				u: "1f381",
				a: "0.6"
			},
			{
				n: [
					"ribbon",
					"reminder",
					"celebration",
					"reminder ribbon"
				],
				u: "1f397-fe0f",
				a: "0.7"
			},
			{
				n: [
					"ticket",
					"tickets",
					"admission",
					"admission tickets"
				],
				u: "1f39f-fe0f",
				a: "0.7"
			},
			{
				n: [
					"stub",
					"ticket",
					"admission"
				],
				u: "1f3ab",
				a: "0.6"
			},
			{
				n: [
					"award",
					"medal",
					"military",
					"celebration",
					"military medal"
				],
				u: "1f396-fe0f",
				a: "0.7"
			},
			{
				n: [
					"win",
					"slay",
					"prize",
					"sport",
					"trophy",
					"champs",
					"victory",
					"winning",
					"champion"
				],
				u: "1f3c6",
				a: "0.6"
			},
			{
				n: [
					"gold",
					"award",
					"medal",
					"sports",
					"winner",
					"sports medal"
				],
				u: "1f3c5",
				a: "1"
			},
			{
				n: [
					"1st",
					"gold",
					"first",
					"medal",
					"place",
					"1st place medal"
				],
				u: "1f947",
				a: "3"
			},
			{
				n: [
					"2nd",
					"medal",
					"place",
					"second",
					"silver",
					"2nd place medal"
				],
				u: "1f948",
				a: "3"
			},
			{
				n: [
					"3rd",
					"medal",
					"place",
					"third",
					"bronze",
					"3rd place medal"
				],
				u: "1f949",
				a: "3"
			},
			{
				n: [
					"ball",
					"sport",
					"futbol",
					"soccer",
					"football",
					"soccer ball"
				],
				u: "26bd",
				a: "0.6"
			},
			{
				n: [
					"ball",
					"sport",
					"baseball"
				],
				u: "26be",
				a: "0.6"
			},
			{
				n: [
					"ball",
					"glove",
					"sports",
					"softball",
					"underarm"
				],
				u: "1f94e",
				a: "11"
			},
			{
				n: [
					"ball",
					"hoop",
					"sport",
					"basketball"
				],
				u: "1f3c0",
				a: "0.6"
			},
			{
				n: [
					"ball",
					"game",
					"volleyball"
				],
				u: "1f3d0",
				a: "1"
			},
			{
				n: [
					"ball",
					"bowl",
					"sport",
					"super",
					"american",
					"football",
					"american football"
				],
				u: "1f3c8",
				a: "0.6"
			},
			{
				n: [
					"ball",
					"rugby",
					"sport",
					"football",
					"rugby football"
				],
				u: "1f3c9",
				a: "1"
			},
			{
				n: [
					"ball",
					"sport",
					"tennis",
					"racquet"
				],
				u: "1f3be",
				a: "0.6"
			},
			{
				n: [
					"disc",
					"flying",
					"ultimate",
					"flying disc"
				],
				u: "1f94f",
				a: "11"
			},
			{
				n: [
					"ball",
					"game",
					"sport",
					"strike",
					"bowling"
				],
				u: "1f3b3",
				a: "0.6"
			},
			{
				n: [
					"bat",
					"ball",
					"game",
					"cricket",
					"cricket game"
				],
				u: "1f3cf",
				a: "1"
			},
			{
				n: [
					"ball",
					"game",
					"field",
					"stick",
					"hockey",
					"field hockey"
				],
				u: "1f3d1",
				a: "1"
			},
			{
				n: [
					"ice",
					"game",
					"puck",
					"stick",
					"hockey",
					"ice hockey"
				],
				u: "1f3d2",
				a: "1"
			},
			{
				n: [
					"ball",
					"goal",
					"stick",
					"sports",
					"lacrosse"
				],
				u: "1f94d",
				a: "11"
			},
			{
				n: [
					"bat",
					"ball",
					"game",
					"ping",
					"pong",
					"table",
					"paddle",
					"tennis",
					"pingpong",
					"ping pong"
				],
				u: "1f3d3",
				a: "1"
			},
			{
				n: [
					"game",
					"birdie",
					"racquet",
					"badminton",
					"shuttlecock"
				],
				u: "1f3f8",
				a: "1"
			},
			{
				n: [
					"glove",
					"boxing",
					"boxing glove"
				],
				u: "1f94a",
				a: "3"
			},
			{
				n: [
					"arts",
					"judo",
					"karate",
					"martial",
					"uniform",
					"taekwondo",
					"martial arts uniform"
				],
				u: "1f94b",
				a: "3"
			},
			{
				n: [
					"net",
					"goal",
					"goal net"
				],
				u: "1f945",
				a: "3"
			},
			{
				n: [
					"flag",
					"golf",
					"hole",
					"sport",
					"flag in hole"
				],
				u: "26f3",
				a: "0.6"
			},
			{
				n: [
					"ice",
					"skate",
					"skating",
					"ice skate"
				],
				u: "26f8-fe0f",
				a: "0.7"
			},
			{
				n: [
					"fish",
					"pole",
					"sport",
					"fishing",
					"fishing pole",
					"entertainment"
				],
				u: "1f3a3",
				a: "0.6"
			},
			{
				n: [
					"mask",
					"scuba",
					"diving",
					"snorkeling",
					"diving mask"
				],
				u: "1f93f",
				a: "12"
			},
			{
				n: [
					"sash",
					"shirt",
					"running",
					"athletics",
					"running shirt"
				],
				u: "1f3bd",
				a: "0.6"
			},
			{
				n: [
					"ski",
					"skis",
					"snow",
					"sport"
				],
				u: "1f3bf",
				a: "0.6"
			},
			{
				n: [
					"sled",
					"luge",
					"snow",
					"sledge",
					"sleigh",
					"toboggan"
				],
				u: "1f6f7",
				a: "5"
			},
			{
				n: [
					"game",
					"rock",
					"stone",
					"curling",
					"curling stone"
				],
				u: "1f94c",
				a: "5"
			},
			{
				n: [
					"hit",
					"bull",
					"dart",
					"game",
					"direct",
					"target",
					"bullseye",
					"entertainment"
				],
				u: "1f3af",
				a: "0.6"
			},
			{
				n: [
					"toy",
					"yo yo",
					"fluctuate"
				],
				u: "1fa80",
				a: "12"
			},
			{
				n: [
					"fly",
					"kite",
					"soar"
				],
				u: "1fa81",
				a: "12"
			},
			{
				n: [
					"gun",
					"tool",
					"water",
					"pistol",
					"weapon",
					"handgun",
					"revolver",
					"water pistol"
				],
				u: "1f52b",
				a: "0.6"
			},
			{
				n: [
					"8",
					"ball",
					"game",
					"pool",
					"8ball",
					"eight",
					"billiard",
					"pool 8 ball"
				],
				u: "1f3b1",
				a: "0.6"
			},
			{
				n: [
					"ball",
					"tale",
					"tool",
					"fairy",
					"magic",
					"future",
					"crystal",
					"fantasy",
					"fortune",
					"fairytale",
					"crystal ball"
				],
				u: "1f52e",
				a: "0.6"
			},
			{
				n: [
					"wand",
					"magic",
					"witch",
					"wizard",
					"magician",
					"magic wand"
				],
				u: "1fa84",
				a: "13"
			},
			{
				n: [
					"game",
					"video",
					"video game",
					"controller",
					"entertainment"
				],
				u: "1f3ae",
				a: "0.6"
			},
			{
				n: [
					"game",
					"video",
					"joystick",
					"videogame"
				],
				u: "1f579-fe0f",
				a: "0.7"
			},
			{
				n: [
					"game",
					"slot",
					"slots",
					"casino",
					"gamble",
					"machine",
					"gambling",
					"slot machine"
				],
				u: "1f3b0",
				a: "0.6"
			},
			{
				n: [
					"die",
					"dice",
					"game",
					"game die",
					"entertainment"
				],
				u: "1f3b2",
				a: "0.6"
			},
			{
				n: [
					"clue",
					"piece",
					"jigsaw",
					"puzzle",
					"puzzle piece",
					"interlocking"
				],
				u: "1f9e9",
				a: "11"
			},
			{
				n: [
					"toy",
					"bear",
					"plush",
					"teddy",
					"stuffed",
					"plaything",
					"teddy bear"
				],
				u: "1f9f8",
				a: "11"
			},
			{
				n: [
					"de",
					"mayo",
					"candy",
					"cinco",
					"party",
					"piñata",
					"pinada",
					"pinata",
					"festive",
					"celebrate",
					"celebration"
				],
				u: "1fa85",
				a: "13"
			},
			{
				n: [
					"ball",
					"dance",
					"disco",
					"party",
					"mirror",
					"glitter",
					"mirror ball"
				],
				u: "1faa9",
				a: "14"
			},
			{
				n: [
					"doll",
					"dolls",
					"russia",
					"nesting",
					"babushka",
					"babooshka",
					"baboushka",
					"matryoshka",
					"nesting dolls"
				],
				u: "1fa86",
				a: "13"
			},
			{
				n: [
					"card",
					"game",
					"suit",
					"spade",
					"spade suit"
				],
				u: "2660-fe0f",
				a: "0.6"
			},
			{
				n: [
					"card",
					"game",
					"suit",
					"heart",
					"hearts",
					"emotion",
					"heart suit"
				],
				u: "2665-fe0f",
				a: "0.6"
			},
			{
				n: [
					"card",
					"game",
					"suit",
					"diamond",
					"diamond suit"
				],
				u: "2666-fe0f",
				a: "0.6"
			},
			{
				n: [
					"card",
					"club",
					"game",
					"suit",
					"clubs",
					"club suit"
				],
				u: "2663-fe0f",
				a: "0.6"
			},
			{
				n: [
					"dupe",
					"pawn",
					"chess",
					"chess pawn",
					"expendable"
				],
				u: "265f-fe0f",
				a: "11"
			},
			{
				n: [
					"card",
					"game",
					"joker",
					"wildcard"
				],
				u: "1f0cf",
				a: "0.6"
			},
			{
				n: [
					"red",
					"game",
					"dragon",
					"mahjong",
					"mahjong red dragon"
				],
				u: "1f004",
				a: "0.6"
			},
			{
				n: [
					"card",
					"game",
					"cards",
					"flower",
					"playing",
					"japanese",
					"flower playing cards"
				],
				u: "1f3b4",
				a: "0.6"
			},
			{
				n: [
					"art",
					"arts",
					"mask",
					"actor",
					"actress",
					"theater",
					"theatre",
					"thespian",
					"performing",
					"entertainment",
					"performing arts"
				],
				u: "1f3ad",
				a: "0.6"
			},
			{
				n: [
					"art",
					"frame",
					"framed",
					"museum",
					"picture",
					"painting",
					"framed picture"
				],
				u: "1f5bc-fe0f",
				a: "0.7"
			},
			{
				n: [
					"art",
					"arty",
					"artsy",
					"artist",
					"museum",
					"painter",
					"palette",
					"colorful",
					"creative",
					"painting",
					"entertainment",
					"artist palette"
				],
				u: "1f3a8",
				a: "0.6"
			},
			{
				n: [
					"spool",
					"thread",
					"needle",
					"sewing",
					"string"
				],
				u: "1f9f5",
				a: "11"
			},
			{
				n: [
					"sew",
					"needle",
					"sewing",
					"thread",
					"sutures",
					"stitches",
					"tailoring",
					"embroidery",
					"sewing needle"
				],
				u: "1faa1",
				a: "13"
			},
			{
				n: [
					"yarn",
					"ball",
					"knit",
					"crochet"
				],
				u: "1f9f6",
				a: "11"
			},
			{
				n: [
					"tie",
					"knot",
					"cord",
					"rope",
					"twine",
					"twist",
					"tangled"
				],
				u: "1faa2",
				a: "13"
			}
		],
		objects: [
			{
				n: [
					"eye",
					"glasses",
					"eyewear",
					"clothing",
					"eyeglasses"
				],
				u: "1f453",
				a: "0.6"
			},
			{
				n: [
					"eye",
					"dark",
					"eyewear",
					"glasses",
					"sunglasses"
				],
				u: "1f576-fe0f",
				a: "0.7"
			},
			{
				n: [
					"eye",
					"dive",
					"scuba",
					"goggles",
					"welding",
					"swimming",
					"protection"
				],
				u: "1f97d",
				a: "11"
			},
			{
				n: [
					"dr",
					"lab",
					"coat",
					"white",
					"doctor",
					"jacket",
					"clothes",
					"lab coat",
					"scientist",
					"experiment"
				],
				u: "1f97c",
				a: "11"
			},
			{
				n: [
					"vest",
					"safety",
					"emergency",
					"safety vest"
				],
				u: "1f9ba",
				a: "12"
			},
			{
				n: [
					"tie",
					"shirt",
					"necktie",
					"serious",
					"clothing",
					"employed"
				],
				u: "1f454",
				a: "0.6"
			},
			{
				n: [
					"blue",
					"shirt",
					"casual",
					"collar",
					"tshirt",
					"t shirt",
					"clothes",
					"dressed",
					"weekend",
					"clothing",
					"shopping"
				],
				u: "1f455",
				a: "0.6"
			},
			{
				n: [
					"blue",
					"jeans",
					"denim",
					"pants",
					"casual",
					"clothes",
					"dressed",
					"weekend",
					"clothing",
					"shopping",
					"trousers"
				],
				u: "1f456",
				a: "0.6"
			},
			{
				n: [
					"up",
					"cold",
					"neck",
					"scarf",
					"bundle"
				],
				u: "1f9e3",
				a: "5"
			},
			{
				n: ["hand", "gloves"],
				u: "1f9e4",
				a: "5"
			},
			{
				n: [
					"up",
					"brr",
					"coat",
					"cold",
					"bundle",
					"jacket"
				],
				u: "1f9e5",
				a: "5"
			},
			{
				n: ["socks", "stocking"],
				u: "1f9e6",
				a: "5"
			},
			{
				n: [
					"dress",
					"fancy",
					"clothes",
					"dressed",
					"clothing",
					"shopping"
				],
				u: "1f457",
				a: "0.6"
			},
			{
				n: [
					"kimono",
					"clothing",
					"comfortable"
				],
				u: "1f458",
				a: "0.6"
			},
			{
				n: [
					"sari",
					"dress",
					"clothing"
				],
				u: "1f97b",
				a: "12"
			},
			{
				n: [
					"suit",
					"bathing",
					"swimsuit",
					"one piece",
					"one piece swimsuit"
				],
				u: "1fa71",
				a: "12"
			},
			{
				n: [
					"suit",
					"briefs",
					"bathing",
					"swimsuit",
					"one piece",
					"underwear"
				],
				u: "1fa72",
				a: "12"
			},
			{
				n: [
					"suit",
					"pants",
					"shorts",
					"bathing",
					"swimsuit",
					"underwear"
				],
				u: "1fa73",
				a: "12"
			},
			{
				n: [
					"pool",
					"suit",
					"swim",
					"beach",
					"bikini",
					"bathing",
					"clothing"
				],
				u: "1f459",
				a: "0.6"
			},
			{
				n: [
					"lady",
					"dress",
					"shirt",
					"woman",
					"blouse",
					"collar",
					"clothes",
					"dressed",
					"woman’s",
					"clothing",
					"shopping",
					"woman’s clothes"
				],
				u: "1f45a",
				a: "0.6"
			},
			{
				n: [
					"fan",
					"hot",
					"shy",
					"clap",
					"cool",
					"hand",
					"clack",
					"dance",
					"flirt",
					"cooling",
					"flutter",
					"folding",
					"folding hand fan"
				],
				u: "1faad",
				a: "15"
			},
			{
				n: [
					"coin",
					"purse",
					"dress",
					"fancy",
					"clothes",
					"handbag",
					"clothing",
					"shopping"
				],
				u: "1f45b",
				a: "0.6"
			},
			{
				n: [
					"bag",
					"lady",
					"dress",
					"purse",
					"handbag",
					"clothes",
					"clothing",
					"shopping"
				],
				u: "1f45c",
				a: "0.6"
			},
			{
				n: [
					"bag",
					"dress",
					"pouch",
					"purse",
					"clutch",
					"clothes",
					"handbag",
					"clothing",
					"clutch bag"
				],
				u: "1f45d",
				a: "0.6"
			},
			{
				n: [
					"bag",
					"bags",
					"hotel",
					"shopping",
					"shopping bags"
				],
				u: "1f6cd-fe0f",
				a: "0.7"
			},
			{
				n: [
					"bag",
					"school",
					"bookbag",
					"satchel",
					"backpack",
					"rucksack",
					"education",
					"backpacking"
				],
				u: "1f392",
				a: "0.6"
			},
			{
				n: [
					"flip",
					"flop",
					"shoe",
					"zōri",
					"beach",
					"thong",
					"sandal",
					"thongs",
					"sandals",
					"thong sandal"
				],
				u: "1fa74",
				a: "13"
			},
			{
				n: [
					"man",
					"feet",
					"foot",
					"kick",
					"shoe",
					"brown",
					"man’s",
					"shoes",
					"clothes",
					"clothing",
					"shopping",
					"man’s shoe"
				],
				u: "1f45e",
				a: "0.6"
			},
			{
				n: [
					"fast",
					"kick",
					"shoe",
					"shoes",
					"tennis",
					"clothes",
					"running",
					"sneaker",
					"athletic",
					"clothing",
					"shopping",
					"running shoe"
				],
				u: "1f45f",
				a: "0.6"
			},
			{
				n: [
					"boot",
					"shoe",
					"brown",
					"hiking",
					"camping",
					"outdoors",
					"hiking boot",
					"backpacking"
				],
				u: "1f97e",
				a: "11"
			},
			{
				n: [
					"flat",
					"shoe",
					"comfy",
					"flats",
					"ballet",
					"slip on",
					"slipper",
					"flat shoe"
				],
				u: "1f97f",
				a: "11"
			},
			{
				n: [
					"heel",
					"shoe",
					"dress",
					"heels",
					"shoes",
					"woman",
					"clothes",
					"fashion",
					"clothing",
					"shopping",
					"stiletto",
					"high heeled",
					"high heeled shoe"
				],
				u: "1f460",
				a: "0.6"
			},
			{
				n: [
					"shoe",
					"woman",
					"sandal",
					"woman’s",
					"clothing",
					"woman’s sandal"
				],
				u: "1f461",
				a: "0.6"
			},
			{
				n: [
					"dance",
					"shoes",
					"ballet",
					"ballet shoes"
				],
				u: "1fa70",
				a: "12"
			},
			{
				n: [
					"boot",
					"shoe",
					"dress",
					"shoes",
					"woman",
					"clothes",
					"woman’s",
					"clothing",
					"shopping",
					"woman’s boot"
				],
				u: "1f462",
				a: "0.6"
			},
			{
				n: [
					"afro",
					"comb",
					"hair",
					"pick",
					"groom",
					"hair pick"
				],
				u: "1faae",
				a: "15"
			},
			{
				n: [
					"win",
					"king",
					"crown",
					"queen",
					"royal",
					"family",
					"royalty",
					"clothing",
					"medieval"
				],
				u: "1f451",
				a: "0.6"
			},
			{
				n: [
					"hat",
					"hats",
					"party",
					"woman",
					"garden",
					"clothes",
					"woman’s",
					"clothing",
					"woman’s hat"
				],
				u: "1f452",
				a: "0.6"
			},
			{
				n: [
					"hat",
					"top",
					"fancy",
					"magic",
					"formal",
					"tophat",
					"top hat",
					"clothes",
					"clothing"
				],
				u: "1f3a9",
				a: "0.6"
			},
			{
				n: [
					"cap",
					"hat",
					"scholar",
					"clothing",
					"education",
					"graduation",
					"celebration",
					"graduation cap"
				],
				u: "1f393",
				a: "0.6"
			},
			{
				n: [
					"cap",
					"dad",
					"hat",
					"bent",
					"billed",
					"baseball",
					"billed cap"
				],
				u: "1f9e2",
				a: "5"
			},
			{
				n: [
					"war",
					"army",
					"helmet",
					"soldier",
					"warrior",
					"military",
					"military helmet"
				],
				u: "1fa96",
				a: "13"
			},
			{
				n: [
					"aid",
					"hat",
					"face",
					"cross",
					"helmet",
					"rescue",
					"worker’s",
					"rescue worker’s helmet"
				],
				u: "26d1-fe0f",
				a: "0.7"
			},
			{
				n: [
					"beads",
					"prayer",
					"clothing",
					"necklace",
					"religion",
					"prayer beads"
				],
				u: "1f4ff",
				a: "1"
			},
			{
				n: [
					"date",
					"makeup",
					"lipstick",
					"cosmetics"
				],
				u: "1f484",
				a: "0.6"
			},
			{
				n: [
					"ring",
					"shiny",
					"diamond",
					"engaged",
					"married",
					"romance",
					"wedding",
					"sparkling",
					"engagement"
				],
				u: "1f48d",
				a: "0.6"
			},
			{
				n: [
					"gem",
					"jewel",
					"money",
					"stone",
					"diamond",
					"romance",
					"wedding",
					"gem stone",
					"engagement"
				],
				u: "1f48e",
				a: "0.6"
			},
			{
				n: [
					"mute",
					"muted",
					"quiet",
					"sound",
					"silent",
					"speaker",
					"muted speaker"
				],
				u: "1f507",
				a: "1"
			},
			{
				n: [
					"low",
					"soft",
					"sound",
					"volume",
					"speaker",
					"speaker low volume"
				],
				u: "1f508",
				a: "0.7"
			},
			{
				n: [
					"sound",
					"medium",
					"volume",
					"speaker",
					"speaker medium volume"
				],
				u: "1f509",
				a: "1"
			},
			{
				n: [
					"high",
					"loud",
					"music",
					"sound",
					"volume",
					"speaker",
					"speaker high volume"
				],
				u: "1f50a",
				a: "0.6"
			},
			{
				n: [
					"loud",
					"sound",
					"public",
					"address",
					"loudspeaker",
					"communication"
				],
				u: "1f4e2",
				a: "0.6"
			},
			{
				n: [
					"sound",
					"cheering",
					"megaphone"
				],
				u: "1f4e3",
				a: "0.6"
			},
			{
				n: [
					"horn",
					"post",
					"postal",
					"postal horn"
				],
				u: "1f4ef",
				a: "1"
			},
			{
				n: [
					"bell",
					"break",
					"sound",
					"church"
				],
				u: "1f514",
				a: "0.6"
			},
			{
				n: [
					"no",
					"not",
					"bell",
					"mute",
					"quiet",
					"slash",
					"sound",
					"silent",
					"forbidden",
					"prohibited",
					"bell with slash"
				],
				u: "1f515",
				a: "1"
			},
			{
				n: [
					"note",
					"music",
					"score",
					"musical",
					"musical score"
				],
				u: "1f3bc",
				a: "0.6"
			},
			{
				n: [
					"note",
					"music",
					"sound",
					"musical",
					"musical note"
				],
				u: "1f3b5",
				a: "0.6"
			},
			{
				n: [
					"note",
					"music",
					"notes",
					"sound",
					"musical",
					"musical notes"
				],
				u: "1f3b6",
				a: "0.6"
			},
			{
				n: [
					"mic",
					"music",
					"studio",
					"microphone",
					"studio microphone"
				],
				u: "1f399-fe0f",
				a: "0.7"
			},
			{
				n: [
					"level",
					"music",
					"slider",
					"level slider"
				],
				u: "1f39a-fe0f",
				a: "0.7"
			},
			{
				n: [
					"knobs",
					"music",
					"control",
					"control knobs"
				],
				u: "1f39b-fe0f",
				a: "0.7"
			},
			{
				n: [
					"mic",
					"sing",
					"music",
					"sound",
					"karaoke",
					"microphone"
				],
				u: "1f3a4",
				a: "0.6"
			},
			{
				n: [
					"sound",
					"earbud",
					"headphone"
				],
				u: "1f3a7",
				a: "0.6"
			},
			{
				n: [
					"tbt",
					"radio",
					"video",
					"entertainment"
				],
				u: "1f4fb",
				a: "0.6"
			},
			{
				n: [
					"sax",
					"music",
					"saxophone",
					"instrument"
				],
				u: "1f3b7",
				a: "0.6"
			},
			{
				n: [
					"music",
					"trumpet",
					"instrument"
				],
				u: "1f3ba",
				a: "0.6"
			},
			{
				n: [
					"box",
					"music",
					"squeeze",
					"accordion",
					"concertina",
					"instrument",
					"squeezebox"
				],
				u: "1fa97",
				a: "13"
			},
			{
				n: [
					"music",
					"strat",
					"guitar",
					"instrument"
				],
				u: "1f3b8",
				a: "0.6"
			},
			{
				n: [
					"music",
					"piano",
					"musical",
					"keyboard",
					"instrument",
					"musical keyboard"
				],
				u: "1f3b9",
				a: "0.6"
			},
			{
				n: [
					"music",
					"violin",
					"instrument"
				],
				u: "1f3bb",
				a: "0.6"
			},
			{
				n: [
					"banjo",
					"music",
					"stringed"
				],
				u: "1fa95",
				a: "12"
			},
			{
				n: [
					"drum",
					"music",
					"drumsticks"
				],
				u: "1f941",
				a: "3"
			},
			{
				n: [
					"beat",
					"drum",
					"long",
					"conga",
					"rhythm",
					"long drum",
					"instrument"
				],
				u: "1fa98",
				a: "13"
			},
			{
				n: [
					"cha",
					"dance",
					"music",
					"party",
					"shake",
					"rattle",
					"shaker",
					"maracas",
					"instrument",
					"percussion"
				],
				u: "1fa87",
				a: "15"
			},
			{
				n: [
					"band",
					"fife",
					"pipe",
					"flute",
					"music",
					"piccolo",
					"flautist",
					"marching",
					"recorder",
					"woodwind",
					"orchestra",
					"instrument"
				],
				u: "1fa88",
				a: "15"
			},
			{
				n: [
					"harp",
					"love",
					"cupid",
					"music",
					"orchestra",
					"instrument"
				],
				u: "1fa89",
				a: "16"
			},
			{
				n: [
					"cell",
					"phone",
					"mobile",
					"telephone",
					"mobile phone",
					"communication"
				],
				u: "1f4f1",
				a: "0.6"
			},
			{
				n: [
					"call",
					"cell",
					"arrow",
					"build",
					"phone",
					"mobile",
					"receive",
					"telephone",
					"communication",
					"mobile phone with arrow"
				],
				u: "1f4f2",
				a: "0.6"
			},
			{
				n: ["phone", "telephone"],
				u: "260e-fe0f",
				a: "0.6"
			},
			{
				n: [
					"voip",
					"phone",
					"receiver",
					"telephone",
					"communication",
					"telephone receiver"
				],
				u: "1f4de",
				a: "0.6"
			},
			{
				n: ["pager", "communication"],
				u: "1f4df",
				a: "0.6"
			},
			{
				n: [
					"fax",
					"machine",
					"fax machine",
					"communication"
				],
				u: "1f4e0",
				a: "0.6"
			},
			{
				n: ["battery"],
				u: "1f50b",
				a: "0.6"
			},
			{
				n: [
					"low",
					"power",
					"energy",
					"battery",
					"drained",
					"electronic",
					"low battery"
				],
				u: "1faab",
				a: "14"
			},
			{
				n: [
					"plug",
					"electric",
					"electricity",
					"electric plug"
				],
				u: "1f50c",
				a: "0.6"
			},
			{
				n: [
					"pc",
					"laptop",
					"office",
					"computer",
					"personal"
				],
				u: "1f4bb",
				a: "0.6"
			},
			{
				n: [
					"desktop",
					"monitor",
					"computer",
					"desktop computer"
				],
				u: "1f5a5-fe0f",
				a: "0.7"
			},
			{
				n: ["printer", "computer"],
				u: "1f5a8-fe0f",
				a: "0.7"
			},
			{
				n: ["keyboard", "computer"],
				u: "2328-fe0f",
				a: "1"
			},
			{
				n: [
					"mouse",
					"computer",
					"computer mouse"
				],
				u: "1f5b1-fe0f",
				a: "0.7"
			},
			{
				n: ["computer", "trackball"],
				u: "1f5b2-fe0f",
				a: "0.7"
			},
			{
				n: [
					"disk",
					"optical",
					"computer",
					"minidisk",
					"computer disk"
				],
				u: "1f4bd",
				a: "0.6"
			},
			{
				n: [
					"disk",
					"floppy",
					"computer",
					"floppy disk"
				],
				u: "1f4be",
				a: "0.6"
			},
			{
				n: [
					"cd",
					"dvd",
					"disk",
					"blu ray",
					"optical",
					"computer",
					"optical disk"
				],
				u: "1f4bf",
				a: "0.6"
			},
			{
				n: [
					"cd",
					"dvd",
					"disk",
					"blu ray",
					"optical",
					"computer"
				],
				u: "1f4c0",
				a: "0.6"
			},
			{
				n: [
					"abacus",
					"calculator",
					"calculation"
				],
				u: "1f9ee",
				a: "11"
			},
			{
				n: [
					"film",
					"movie",
					"camera",
					"cinema",
					"record",
					"bollywood",
					"hollywood",
					"movie camera"
				],
				u: "1f3a5",
				a: "0.6"
			},
			{
				n: [
					"film",
					"movie",
					"cinema",
					"frames",
					"film frames"
				],
				u: "1f39e-fe0f",
				a: "0.7"
			},
			{
				n: [
					"film",
					"movie",
					"video",
					"cinema",
					"projector",
					"film projector"
				],
				u: "1f4fd-fe0f",
				a: "0.7"
			},
			{
				n: [
					"board",
					"movie",
					"action",
					"clapper",
					"clapper board"
				],
				u: "1f3ac",
				a: "0.6"
			},
			{
				n: [
					"tv",
					"video",
					"television"
				],
				u: "1f4fa",
				a: "0.6"
			},
			{
				n: [
					"tbt",
					"snap",
					"trip",
					"photo",
					"video",
					"camera",
					"selfie"
				],
				u: "1f4f7",
				a: "0.6"
			},
			{
				n: [
					"flash",
					"video",
					"camera",
					"camera with flash"
				],
				u: "1f4f8",
				a: "1"
			},
			{
				n: [
					"tbt",
					"video",
					"camera",
					"camcorder",
					"video camera"
				],
				u: "1f4f9",
				a: "0.6"
			},
			{
				n: [
					"old",
					"vcr",
					"vhs",
					"tape",
					"video",
					"school",
					"videocassette"
				],
				u: "1f4fc",
				a: "0.6"
			},
			{
				n: [
					"lab",
					"left",
					"tool",
					"glass",
					"search",
					"tilted",
					"science",
					"magnifying",
					"left pointing",
					"magnifying glass tilted left"
				],
				u: "1f50d",
				a: "0.6"
			},
			{
				n: [
					"lab",
					"tool",
					"glass",
					"right",
					"search",
					"tilted",
					"contact",
					"science",
					"magnifying",
					"right pointing",
					"magnifying glass tilted right"
				],
				u: "1f50e",
				a: "0.6"
			},
			{
				n: ["light", "candle"],
				u: "1f56f-fe0f",
				a: "0.7"
			},
			{
				n: [
					"bulb",
					"idea",
					"comic",
					"light",
					"electric",
					"light bulb"
				],
				u: "1f4a1",
				a: "0.6"
			},
			{
				n: [
					"tool",
					"light",
					"torch",
					"electric",
					"flashlight"
				],
				u: "1f526",
				a: "0.6"
			},
			{
				n: [
					"bar",
					"red",
					"light",
					"paper",
					"lantern",
					"restaurant",
					"red paper lantern"
				],
				u: "1f3ee",
				a: "0.6"
			},
			{
				n: [
					"oil",
					"diya",
					"lamp",
					"light",
					"diya lamp"
				],
				u: "1fa94",
				a: "12"
			},
			{
				n: [
					"book",
					"cover",
					"school",
					"writing",
					"notebook",
					"decorated",
					"education",
					"decorative",
					"notebook with decorative cover"
				],
				u: "1f4d4",
				a: "0.6"
			},
			{
				n: [
					"book",
					"closed",
					"education",
					"closed book"
				],
				u: "1f4d5",
				a: "0.6"
			},
			{
				n: [
					"book",
					"open",
					"novels",
					"fantasy",
					"library",
					"reading",
					"open book",
					"education",
					"knowledge"
				],
				u: "1f4d6",
				a: "0.6"
			},
			{
				n: [
					"book",
					"green",
					"fantasy",
					"library",
					"reading",
					"education",
					"green book"
				],
				u: "1f4d7",
				a: "0.6"
			},
			{
				n: [
					"blue",
					"book",
					"fantasy",
					"library",
					"reading",
					"blue book",
					"education"
				],
				u: "1f4d8",
				a: "0.6"
			},
			{
				n: [
					"book",
					"orange",
					"fantasy",
					"library",
					"reading",
					"education",
					"orange book"
				],
				u: "1f4d9",
				a: "0.6"
			},
			{
				n: [
					"book",
					"books",
					"study",
					"novels",
					"school",
					"fantasy",
					"library",
					"reading",
					"education",
					"knowledge"
				],
				u: "1f4da",
				a: "0.6"
			},
			{
				n: ["notebook"],
				u: "1f4d3",
				a: "0.6"
			},
			{
				n: ["ledger", "notebook"],
				u: "1f4d2",
				a: "0.6"
			},
			{
				n: [
					"curl",
					"page",
					"paper",
					"document",
					"page with curl"
				],
				u: "1f4c3",
				a: "0.6"
			},
			{
				n: ["paper", "scroll"],
				u: "1f4dc",
				a: "0.6"
			},
			{
				n: [
					"up",
					"page",
					"paper",
					"facing",
					"document",
					"page facing up"
				],
				u: "1f4c4",
				a: "0.6"
			},
			{
				n: [
					"news",
					"paper",
					"newspaper",
					"communication"
				],
				u: "1f4f0",
				a: "0.6"
			},
			{
				n: [
					"news",
					"paper",
					"rolled",
					"newspaper",
					"rolled up",
					"rolled up newspaper"
				],
				u: "1f5de-fe0f",
				a: "0.7"
			},
			{
				n: [
					"mark",
					"tabs",
					"marker",
					"bookmark",
					"bookmark tabs"
				],
				u: "1f4d1",
				a: "0.6"
			},
			{
				n: ["mark", "bookmark"],
				u: "1f516",
				a: "0.6"
			},
			{
				n: ["tag", "label"],
				u: "1f3f7-fe0f",
				a: "0.7"
			},
			{
				n: [
					"coin",
					"euro",
					"gold",
					"rich",
					"metal",
					"money",
					"dollar",
					"silver",
					"treasure"
				],
				u: "1fa99",
				a: "13"
			},
			{
				n: [
					"bag",
					"bet",
					"pot",
					"win",
					"bank",
					"cash",
					"cost",
					"gold",
					"paid",
					"rich",
					"money",
					"dollar",
					"paying",
					"billion",
					"million",
					"moneybag",
					"money bag"
				],
				u: "1f4b0",
				a: "0.6"
			},
			{
				n: [
					"yen",
					"bank",
					"bill",
					"note",
					"money",
					"banknote",
					"currency",
					"yen banknote"
				],
				u: "1f4b4",
				a: "0.6"
			},
			{
				n: [
					"bank",
					"bill",
					"note",
					"money",
					"dollar",
					"banknote",
					"currency",
					"dollar banknote"
				],
				u: "1f4b5",
				a: "0.6"
			},
			{
				n: [
					"100",
					"bank",
					"bill",
					"euro",
					"note",
					"rich",
					"money",
					"banknote",
					"currency",
					"euro banknote"
				],
				u: "1f4b6",
				a: "1"
			},
			{
				n: [
					"bank",
					"bill",
					"cash",
					"note",
					"money",
					"pound",
					"pounds",
					"billion",
					"banknote",
					"currency",
					"pound banknote"
				],
				u: "1f4b7",
				a: "1"
			},
			{
				n: [
					"fly",
					"pay",
					"bank",
					"bill",
					"cash",
					"note",
					"money",
					"wings",
					"dollar",
					"billion",
					"million",
					"banknote",
					"money with wings"
				],
				u: "1f4b8",
				a: "0.6"
			},
			{
				n: [
					"pay",
					"bank",
					"card",
					"cash",
					"money",
					"charge",
					"credit",
					"credit card"
				],
				u: "1f4b3",
				a: "0.6"
			},
			{
				n: [
					"proof",
					"receipt",
					"invoice",
					"evidence",
					"accounting",
					"bookkeeping"
				],
				u: "1f9fe",
				a: "11"
			},
			{
				n: [
					"yen",
					"bank",
					"rise",
					"chart",
					"graph",
					"money",
					"trend",
					"growth",
					"market",
					"upward",
					"currency",
					"increasing",
					"chart increasing with yen"
				],
				u: "1f4b9",
				a: "0.6"
			},
			{
				n: [
					"email",
					"e mail",
					"letter",
					"envelope"
				],
				u: "2709-fe0f",
				a: "0.6"
			},
			{
				n: [
					"mail",
					"email",
					"e mail",
					"letter"
				],
				u: "1f4e7",
				a: "0.6"
			},
			{
				n: [
					"mail",
					"sent",
					"email",
					"e mail",
					"letter",
					"receive",
					"envelope",
					"incoming",
					"delivering",
					"incoming envelope"
				],
				u: "1f4e8",
				a: "0.6"
			},
			{
				n: [
					"down",
					"mail",
					"send",
					"sent",
					"arrow",
					"email",
					"e mail",
					"letter",
					"envelope",
					"outgoing",
					"communication",
					"envelope with arrow"
				],
				u: "1f4e9",
				a: "0.6"
			},
			{
				n: [
					"box",
					"mail",
					"sent",
					"tray",
					"email",
					"letter",
					"outbox",
					"outbox tray"
				],
				u: "1f4e4",
				a: "0.6"
			},
			{
				n: [
					"box",
					"mail",
					"tray",
					"zero",
					"email",
					"inbox",
					"letter",
					"receive",
					"inbox tray"
				],
				u: "1f4e5",
				a: "0.6"
			},
			{
				n: [
					"box",
					"parcel",
					"package",
					"delivery",
					"shipping",
					"communication"
				],
				u: "1f4e6",
				a: "0.6"
			},
			{
				n: [
					"flag",
					"mail",
					"closed",
					"raised",
					"mailbox",
					"postbox",
					"communication",
					"closed mailbox with raised flag"
				],
				u: "1f4eb",
				a: "0.6"
			},
			{
				n: [
					"flag",
					"mail",
					"closed",
					"lowered",
					"mailbox",
					"postbox",
					"closed mailbox with lowered flag"
				],
				u: "1f4ea",
				a: "0.6"
			},
			{
				n: [
					"flag",
					"mail",
					"open",
					"raised",
					"mailbox",
					"postbox",
					"open mailbox with raised flag"
				],
				u: "1f4ec",
				a: "0.7"
			},
			{
				n: [
					"flag",
					"mail",
					"open",
					"lowered",
					"mailbox",
					"postbox",
					"open mailbox with lowered flag"
				],
				u: "1f4ed",
				a: "0.7"
			},
			{
				n: [
					"mail",
					"postbox",
					"mailbox"
				],
				u: "1f4ee",
				a: "0.6"
			},
			{
				n: [
					"box",
					"ballot",
					"ballot box with ballot"
				],
				u: "1f5f3-fe0f",
				a: "0.7"
			},
			{
				n: ["pencil"],
				u: "270f-fe0f",
				a: "0.6"
			},
			{
				n: [
					"nib",
					"pen",
					"black",
					"black nib"
				],
				u: "2712-fe0f",
				a: "0.6"
			},
			{
				n: [
					"pen",
					"fountain",
					"fountain pen"
				],
				u: "1f58b-fe0f",
				a: "0.7"
			},
			{
				n: ["pen", "ballpoint"],
				u: "1f58a-fe0f",
				a: "0.7"
			},
			{
				n: ["painting", "paintbrush"],
				u: "1f58c-fe0f",
				a: "0.7"
			},
			{
				n: ["crayon"],
				u: "1f58d-fe0f",
				a: "0.7"
			},
			{
				n: [
					"memo",
					"media",
					"notes",
					"pencil",
					"communication"
				],
				u: "1f4dd",
				a: "0.6"
			},
			{
				n: ["office", "briefcase"],
				u: "1f4bc",
				a: "0.6"
			},
			{
				n: [
					"file",
					"folder",
					"file folder"
				],
				u: "1f4c1",
				a: "0.6"
			},
			{
				n: [
					"file",
					"open",
					"folder",
					"open file folder"
				],
				u: "1f4c2",
				a: "0.6"
			},
			{
				n: [
					"card",
					"index",
					"dividers",
					"card index dividers"
				],
				u: "1f5c2-fe0f",
				a: "0.7"
			},
			{
				n: ["date", "calendar"],
				u: "1f4c5",
				a: "0.6"
			},
			{
				n: [
					"calendar",
					"tear off",
					"tear off calendar"
				],
				u: "1f4c6",
				a: "0.6"
			},
			{
				n: [
					"pad",
					"note",
					"spiral",
					"notepad",
					"spiral notepad"
				],
				u: "1f5d2-fe0f",
				a: "0.7"
			},
			{
				n: [
					"pad",
					"spiral",
					"calendar",
					"spiral calendar"
				],
				u: "1f5d3-fe0f",
				a: "0.7"
			},
			{
				n: [
					"old",
					"card",
					"index",
					"school",
					"rolodex",
					"card index"
				],
				u: "1f4c7",
				a: "0.6"
			},
			{
				n: [
					"up",
					"data",
					"chart",
					"graph",
					"right",
					"trend",
					"growth",
					"upward",
					"increasing",
					"chart increasing"
				],
				u: "1f4c8",
				a: "0.6"
			},
			{
				n: [
					"data",
					"down",
					"chart",
					"graph",
					"trend",
					"downward",
					"negative",
					"decreasing",
					"chart decreasing"
				],
				u: "1f4c9",
				a: "0.6"
			},
			{
				n: [
					"bar",
					"data",
					"chart",
					"graph",
					"bar chart"
				],
				u: "1f4ca",
				a: "0.6"
			},
			{
				n: [
					"do",
					"list",
					"notes",
					"clipboard"
				],
				u: "1f4cb",
				a: "0.6"
			},
			{
				n: [
					"pin",
					"pushpin",
					"collage"
				],
				u: "1f4cc",
				a: "0.6"
			},
			{
				n: [
					"map",
					"pin",
					"round",
					"pushpin",
					"location",
					"round pushpin"
				],
				u: "1f4cd",
				a: "0.6"
			},
			{
				n: ["paperclip"],
				u: "1f4ce",
				a: "0.6"
			},
			{
				n: [
					"link",
					"linked",
					"paperclip",
					"paperclips",
					"linked paperclips"
				],
				u: "1f587-fe0f",
				a: "0.7"
			},
			{
				n: [
					"edge",
					"math",
					"angle",
					"ruler",
					"straight",
					"straightedge",
					"straight ruler"
				],
				u: "1f4cf",
				a: "0.6"
			},
			{
				n: [
					"set",
					"math",
					"rule",
					"angle",
					"ruler",
					"slide",
					"triangle",
					"triangular",
					"triangular ruler"
				],
				u: "1f4d0",
				a: "0.6"
			},
			{
				n: [
					"cut",
					"tool",
					"paper",
					"cutting",
					"scissors"
				],
				u: "2702-fe0f",
				a: "0.6"
			},
			{
				n: [
					"box",
					"card",
					"file",
					"card file box"
				],
				u: "1f5c3-fe0f",
				a: "0.7"
			},
			{
				n: [
					"file",
					"paper",
					"filing",
					"cabinet",
					"file cabinet"
				],
				u: "1f5c4-fe0f",
				a: "0.7"
			},
			{
				n: [
					"can",
					"trash",
					"waste",
					"garbage",
					"wastebasket"
				],
				u: "1f5d1-fe0f",
				a: "0.7"
			},
			{
				n: [
					"lock",
					"locked",
					"closed",
					"private"
				],
				u: "1f512",
				a: "0.6"
			},
			{
				n: [
					"lock",
					"open",
					"unlock",
					"cracked",
					"unlocked"
				],
				u: "1f513",
				a: "0.6"
			},
			{
				n: [
					"ink",
					"nib",
					"pen",
					"lock",
					"locked",
					"privacy",
					"locked with pen"
				],
				u: "1f50f",
				a: "0.6"
			},
			{
				n: [
					"key",
					"bike",
					"lock",
					"closed",
					"locked",
					"secure",
					"locked with key"
				],
				u: "1f510",
				a: "0.6"
			},
			{
				n: [
					"key",
					"keys",
					"lock",
					"major",
					"unlock",
					"password"
				],
				u: "1f511",
				a: "0.6"
			},
			{
				n: [
					"key",
					"old",
					"clue",
					"lock",
					"old key"
				],
				u: "1f5dd-fe0f",
				a: "0.7"
			},
			{
				n: [
					"home",
					"tool",
					"hammer",
					"repairs",
					"improvement"
				],
				u: "1f528",
				a: "0.6"
			},
			{
				n: [
					"ax",
					"axe",
					"chop",
					"wood",
					"split",
					"hatchet"
				],
				u: "1fa93",
				a: "12"
			},
			{
				n: [
					"pick",
					"tool",
					"hammer",
					"mining"
				],
				u: "26cf-fe0f",
				a: "0.7"
			},
			{
				n: [
					"pick",
					"tool",
					"hammer",
					"hammer and pick"
				],
				u: "2692-fe0f",
				a: "1"
			},
			{
				n: [
					"tool",
					"hammer",
					"wrench",
					"spanner",
					"hammer and wrench"
				],
				u: "1f6e0-fe0f",
				a: "0.7"
			},
			{
				n: [
					"knife",
					"dagger",
					"weapon"
				],
				u: "1f5e1-fe0f",
				a: "0.7"
			},
			{
				n: [
					"swords",
					"weapon",
					"crossed",
					"crossed swords"
				],
				u: "2694-fe0f",
				a: "1"
			},
			{
				n: [
					"hot",
					"bomb",
					"boom",
					"comic",
					"dangerous",
					"explosion"
				],
				u: "1f4a3",
				a: "0.6"
			},
			{
				n: [
					"weapon",
					"rebound",
					"boomerang",
					"repercussion"
				],
				u: "1fa83",
				a: "13"
			},
			{
				n: [
					"bow",
					"tool",
					"arrow",
					"archer",
					"weapon",
					"zodiac",
					"archery",
					"sagittarius",
					"bow and arrow"
				],
				u: "1f3f9",
				a: "1"
			},
			{
				n: ["shield", "weapon"],
				u: "1f6e1-fe0f",
				a: "0.7"
			},
			{
				n: [
					"cut",
					"saw",
					"tool",
					"trim",
					"lumber",
					"carpenter",
					"carpentry",
					"carpentry saw"
				],
				u: "1fa9a",
				a: "13"
			},
			{
				n: [
					"home",
					"tool",
					"wrench",
					"spanner",
					"improvement"
				],
				u: "1f527",
				a: "0.6"
			},
			{
				n: [
					"tool",
					"handy",
					"screw",
					"flathead",
					"screwdriver"
				],
				u: "1fa9b",
				a: "13"
			},
			{
				n: [
					"nut",
					"bolt",
					"home",
					"tool",
					"improvement",
					"nut and bolt"
				],
				u: "1f529",
				a: "0.6"
			},
			{
				n: [
					"cog",
					"gear",
					"tool",
					"cogwheel"
				],
				u: "2699-fe0f",
				a: "1"
			},
			{
				n: [
					"tool",
					"vice",
					"clamp",
					"compress"
				],
				u: "1f5dc-fe0f",
				a: "0.7"
			},
			{
				n: [
					"tool",
					"libra",
					"scale",
					"scales",
					"weight",
					"zodiac",
					"balance",
					"justice",
					"balance scale"
				],
				u: "2696-fe0f",
				a: "1"
			},
			{
				n: [
					"cane",
					"blind",
					"white",
					"probing",
					"white cane",
					"accessibility"
				],
				u: "1f9af",
				a: "12"
			},
			{
				n: ["link", "links"],
				u: "1f517",
				a: "0.6"
			},
			{
				n: [
					"break",
					"chain",
					"cuffs",
					"broken",
					"freedom",
					"breaking",
					"broken chain"
				],
				u: "26d3-fe0f-200d-1f4a5",
				a: "15.1"
			},
			{
				n: ["chain", "chains"],
				u: "26d3-fe0f",
				a: "0.7"
			},
			{
				n: [
					"hook",
					"catch",
					"crook",
					"curve",
					"point",
					"ensnare",
					"selling"
				],
				u: "1fa9d",
				a: "13"
			},
			{
				n: [
					"box",
					"red",
					"tool",
					"chest",
					"toolbox",
					"mechanic"
				],
				u: "1f9f0",
				a: "11"
			},
			{
				n: [
					"u",
					"shape",
					"magnet",
					"magnetic",
					"negative",
					"positive",
					"horseshoe",
					"attraction"
				],
				u: "1f9f2",
				a: "11"
			},
			{
				n: [
					"rung",
					"step",
					"climb",
					"ladder"
				],
				u: "1fa9c",
				a: "13"
			},
			{
				n: [
					"dig",
					"bury",
					"hole",
					"snow",
					"plant",
					"scoop",
					"spade",
					"shovel",
					"garden"
				],
				u: "1fa8f",
				a: "16"
			},
			{
				n: [
					"tool",
					"alembic",
					"chemistry"
				],
				u: "2697-fe0f",
				a: "1"
			},
			{
				n: [
					"lab",
					"test",
					"tube",
					"chemist",
					"science",
					"test tube",
					"chemistry",
					"experiment"
				],
				u: "1f9ea",
				a: "11"
			},
			{
				n: [
					"lab",
					"dish",
					"petri",
					"biology",
					"culture",
					"bacteria",
					"biologist",
					"petri dish"
				],
				u: "1f9eb",
				a: "11"
			},
			{
				n: [
					"dna",
					"gene",
					"life",
					"genetics",
					"biologist",
					"evolution"
				],
				u: "1f9ec",
				a: "11"
			},
			{
				n: [
					"lab",
					"tool",
					"science",
					"microscope",
					"experiment"
				],
				u: "1f52c",
				a: "1"
			},
			{
				n: [
					"tool",
					"contact",
					"science",
					"telescope",
					"extraterrestrial"
				],
				u: "1f52d",
				a: "1"
			},
			{
				n: [
					"dish",
					"aliens",
					"antenna",
					"contact",
					"science",
					"satellite",
					"satellite antenna"
				],
				u: "1f4e1",
				a: "0.6"
			},
			{
				n: [
					"flu",
					"shot",
					"sick",
					"tool",
					"doctor",
					"needle",
					"syringe",
					"medicine",
					"vaccination"
				],
				u: "1f489",
				a: "0.6"
			},
			{
				n: [
					"drop",
					"bleed",
					"blood",
					"injury",
					"donation",
					"medicine",
					"menstruation",
					"drop of blood"
				],
				u: "1fa78",
				a: "12"
			},
			{
				n: [
					"pill",
					"sick",
					"drugs",
					"pills",
					"doctor",
					"vitamin",
					"medicine",
					"medicated"
				],
				u: "1f48a",
				a: "0.6"
			},
			{
				n: [
					"bandage",
					"adhesive",
					"adhesive bandage"
				],
				u: "1fa79",
				a: "12"
			},
			{
				n: [
					"aid",
					"cane",
					"help",
					"hurt",
					"stick",
					"crutch",
					"injured",
					"mobility",
					"disability"
				],
				u: "1fa7c",
				a: "14"
			},
			{
				n: [
					"heart",
					"doctor",
					"medicine",
					"stethoscope"
				],
				u: "1fa7a",
				a: "12"
			},
			{
				n: [
					"xray",
					"x ray",
					"bones",
					"skull",
					"doctor",
					"medical",
					"skeleton"
				],
				u: "1fa7b",
				a: "14"
			},
			{
				n: [
					"door",
					"back",
					"front",
					"closet"
				],
				u: "1f6aa",
				a: "0.6"
			},
			{
				n: [
					"lift",
					"hoist",
					"elevator",
					"accessibility"
				],
				u: "1f6d7",
				a: "13"
			},
			{
				n: [
					"mirror",
					"makeup",
					"speculum",
					"reflector",
					"reflection"
				],
				u: "1fa9e",
				a: "13"
			},
			{
				n: [
					"air",
					"view",
					"frame",
					"fresh",
					"window",
					"opening",
					"transparent"
				],
				u: "1fa9f",
				a: "13"
			},
			{
				n: [
					"bed",
					"hotel",
					"sleep"
				],
				u: "1f6cf-fe0f",
				a: "0.7"
			},
			{
				n: [
					"lamp",
					"couch",
					"hotel",
					"couch and lamp"
				],
				u: "1f6cb-fe0f",
				a: "0.7"
			},
			{
				n: [
					"sit",
					"seat",
					"chair"
				],
				u: "1fa91",
				a: "12"
			},
			{
				n: ["toilet", "bathroom"],
				u: "1f6bd",
				a: "0.6"
			},
			{
				n: [
					"cup",
					"poop",
					"force",
					"toilet",
					"plunger",
					"plumber",
					"suction"
				],
				u: "1faa0",
				a: "13"
			},
			{
				n: ["water", "shower"],
				u: "1f6bf",
				a: "1"
			},
			{
				n: ["bath", "bathtub"],
				u: "1f6c1",
				a: "1"
			},
			{
				n: [
					"bait",
					"lure",
					"trap",
					"mouse",
					"snare",
					"cheese",
					"mousetrap",
					"mouse trap"
				],
				u: "1faa4",
				a: "13"
			},
			{
				n: [
					"razor",
					"sharp",
					"shave"
				],
				u: "1fa92",
				a: "12"
			},
			{
				n: [
					"bottle",
					"lotion",
					"shampoo",
					"sunscreen",
					"moisturizer",
					"lotion bottle"
				],
				u: "1f9f4",
				a: "11"
			},
			{
				n: [
					"pin",
					"punk",
					"rock",
					"diaper",
					"safety",
					"safety pin"
				],
				u: "1f9f7",
				a: "11"
			},
			{
				n: [
					"broom",
					"witch",
					"cleaning",
					"sweeping"
				],
				u: "1f9f9",
				a: "11"
			},
			{
				n: [
					"basket",
					"picnic",
					"farming",
					"laundry"
				],
				u: "1f9fa",
				a: "11"
			},
			{
				n: [
					"roll",
					"paper",
					"toilet",
					"towels",
					"roll of paper"
				],
				u: "1f9fb",
				a: "11"
			},
			{
				n: [
					"vat",
					"cask",
					"pail",
					"bucket"
				],
				u: "1faa3",
				a: "13"
			},
			{
				n: [
					"bar",
					"soap",
					"clean",
					"lather",
					"bathing",
					"cleaning",
					"soapdish"
				],
				u: "1f9fc",
				a: "11"
			},
			{
				n: [
					"burp",
					"soap",
					"clean",
					"pearl",
					"bubble",
					"bubbles",
					"floating",
					"underwater"
				],
				u: "1fae7",
				a: "14"
			},
			{
				n: [
					"brush",
					"clean",
					"teeth",
					"dental",
					"hygiene",
					"bathroom",
					"toiletry",
					"toothbrush"
				],
				u: "1faa5",
				a: "13"
			},
			{
				n: [
					"soak",
					"sponge",
					"porous",
					"cleaning",
					"absorbing"
				],
				u: "1f9fd",
				a: "11"
			},
			{
				n: [
					"fire",
					"quench",
					"extinguish",
					"extinguisher",
					"fire extinguisher"
				],
				u: "1f9ef",
				a: "11"
			},
			{
				n: [
					"cart",
					"trolley",
					"shopping",
					"shopping cart"
				],
				u: "1f6d2",
				a: "3"
			},
			{
				n: ["smoking", "cigarette"],
				u: "1f6ac",
				a: "0.6"
			},
			{
				n: [
					"dead",
					"death",
					"coffin",
					"vampire"
				],
				u: "26b0-fe0f",
				a: "1"
			},
			{
				n: [
					"rip",
					"dead",
					"tomb",
					"grave",
					"cemetery",
					"memorial",
					"headstone",
					"graveyard",
					"tombstone"
				],
				u: "1faa6",
				a: "13"
			},
			{
				n: [
					"urn",
					"ashes",
					"death",
					"funeral",
					"funeral urn"
				],
				u: "26b1-fe0f",
				a: "1"
			},
			{
				n: [
					"bead",
					"blue",
					"charm",
					"nazar",
					"amulet",
					"evil eye",
					"talisman",
					"nazar amulet"
				],
				u: "1f9ff",
				a: "11"
			},
			{
				n: [
					"hand",
					"mary",
					"palm",
					"hamsa",
					"guide",
					"amulet",
					"fatima",
					"miriam",
					"fortune",
					"protect",
					"protection"
				],
				u: "1faac",
				a: "14"
			},
			{
				n: [
					"moai",
					"face",
					"moyai",
					"statue",
					"travel",
					"stoneface"
				],
				u: "1f5ff",
				a: "0.6"
			},
			{
				n: [
					"card",
					"sign",
					"notice",
					"picket",
					"plaque",
					"placard",
					"protest",
					"demonstration"
				],
				u: "1faa7",
				a: "13"
			},
			{
				n: [
					"id",
					"card",
					"license",
					"document",
					"security",
					"credentials",
					"identification",
					"identification card"
				],
				u: "1faaa",
				a: "14"
			}
		],
		symbols: [
			{
				n: [
					"atm",
					"bank",
					"cash",
					"sign",
					"money",
					"teller",
					"ATM sign",
					"automated"
				],
				u: "1f3e7",
				a: "0.6"
			},
			{
				n: [
					"bin",
					"sign",
					"litter",
					"litterbin",
					"litter in bin sign"
				],
				u: "1f6ae",
				a: "1"
			},
			{
				n: [
					"water",
					"potable",
					"drinking",
					"potable water"
				],
				u: "1f6b0",
				a: "1"
			},
			{
				n: [
					"access",
					"symbol",
					"handicap",
					"wheelchair",
					"wheelchair symbol"
				],
				u: "267f",
				a: "0.6"
			},
			{
				n: [
					"wc",
					"man",
					"room",
					"men’s",
					"toilet",
					"bathroom",
					"lavatory",
					"restroom",
					"men’s room"
				],
				u: "1f6b9",
				a: "0.6"
			},
			{
				n: [
					"wc",
					"room",
					"woman",
					"toilet",
					"women’s",
					"bathroom",
					"lavatory",
					"restroom",
					"women’s room"
				],
				u: "1f6ba",
				a: "0.6"
			},
			{
				n: [
					"wc",
					"toilet",
					"restroom",
					"bathroom",
					"lavatory"
				],
				u: "1f6bb",
				a: "0.6"
			},
			{
				n: [
					"baby",
					"symbol",
					"changing",
					"baby symbol"
				],
				u: "1f6bc",
				a: "0.6"
			},
			{
				n: [
					"wc",
					"water",
					"closet",
					"toilet",
					"bathroom",
					"lavatory",
					"restroom",
					"water closet"
				],
				u: "1f6be",
				a: "0.6"
			},
			{
				n: [
					"control",
					"passport",
					"passport control"
				],
				u: "1f6c2",
				a: "1"
			},
			{
				n: ["customs", "packing"],
				u: "1f6c3",
				a: "1"
			},
			{
				n: [
					"bags",
					"case",
					"trip",
					"claim",
					"plane",
					"ready",
					"travel",
					"arrived",
					"baggage",
					"checked",
					"journey",
					"packing",
					"baggage claim"
				],
				u: "1f6c4",
				a: "1"
			},
			{
				n: [
					"case",
					"left",
					"locker",
					"baggage",
					"luggage",
					"left luggage"
				],
				u: "1f6c5",
				a: "1"
			},
			{
				n: ["warning", "caution"],
				u: "26a0-fe0f",
				a: "0.6"
			},
			{
				n: [
					"child",
					"traffic",
					"children",
					"crossing",
					"pedestrian",
					"children crossing"
				],
				u: "1f6b8",
				a: "1"
			},
			{
				n: [
					"do",
					"no",
					"not",
					"fail",
					"pass",
					"entry",
					"traffic",
					"no entry",
					"forbidden",
					"prohibited"
				],
				u: "26d4",
				a: "0.6"
			},
			{
				n: [
					"no",
					"not",
					"entry",
					"smoke",
					"forbidden",
					"prohibited"
				],
				u: "1f6ab",
				a: "0.6"
			},
			{
				n: [
					"no",
					"not",
					"bike",
					"bicycle",
					"bicycles",
					"forbidden",
					"prohibited",
					"no bicycles"
				],
				u: "1f6b3",
				a: "1"
			},
			{
				n: [
					"no",
					"not",
					"smoke",
					"smoking",
					"forbidden",
					"no smoking",
					"prohibited"
				],
				u: "1f6ad",
				a: "0.6"
			},
			{
				n: [
					"no",
					"not",
					"litter",
					"forbidden",
					"littering",
					"prohibited",
					"no littering"
				],
				u: "1f6af",
				a: "1"
			},
			{
				n: [
					"dry",
					"water",
					"prohibited",
					"non potable",
					"non drinking",
					"non potable water"
				],
				u: "1f6b1",
				a: "1"
			},
			{
				n: [
					"no",
					"not",
					"forbidden",
					"pedestrian",
					"prohibited",
					"pedestrians",
					"no pedestrians"
				],
				u: "1f6b7",
				a: "1"
			},
			{
				n: [
					"no",
					"not",
					"cell",
					"phone",
					"mobile",
					"phones",
					"forbidden",
					"telephone",
					"prohibited",
					"no mobile phones"
				],
				u: "1f4f5",
				a: "1"
			},
			{
				n: [
					"18",
					"no",
					"age",
					"not",
					"one",
					"eighteen",
					"underage",
					"forbidden",
					"prohibited",
					"restriction",
					"no one under eighteen"
				],
				u: "1f51e",
				a: "0.6"
			},
			{
				n: ["sign", "radioactive"],
				u: "2622-fe0f",
				a: "1"
			},
			{
				n: ["sign", "biohazard"],
				u: "2623-fe0f",
				a: "1"
			},
			{
				n: [
					"up",
					"arrow",
					"north",
					"up arrow",
					"cardinal",
					"direction"
				],
				u: "2b06-fe0f",
				a: "0.6"
			},
			{
				n: [
					"arrow",
					"up right",
					"direction",
					"northeast",
					"intercardinal",
					"up right arrow"
				],
				u: "2197-fe0f",
				a: "0.6"
			},
			{
				n: [
					"east",
					"arrow",
					"right",
					"cardinal",
					"direction",
					"right arrow"
				],
				u: "27a1-fe0f",
				a: "0.6"
			},
			{
				n: [
					"arrow",
					"direction",
					"southeast",
					"down right",
					"intercardinal",
					"down right arrow"
				],
				u: "2198-fe0f",
				a: "0.6"
			},
			{
				n: [
					"down",
					"arrow",
					"south",
					"cardinal",
					"direction",
					"down arrow"
				],
				u: "2b07-fe0f",
				a: "0.6"
			},
			{
				n: [
					"arrow",
					"direction",
					"down left",
					"southwest",
					"intercardinal",
					"down left arrow"
				],
				u: "2199-fe0f",
				a: "0.6"
			},
			{
				n: [
					"left",
					"west",
					"arrow",
					"cardinal",
					"direction",
					"left arrow"
				],
				u: "2b05-fe0f",
				a: "0.6"
			},
			{
				n: [
					"arrow",
					"up left",
					"direction",
					"northwest",
					"up left arrow",
					"intercardinal"
				],
				u: "2196-fe0f",
				a: "0.6"
			},
			{
				n: [
					"arrow",
					"up down",
					"up down arrow"
				],
				u: "2195-fe0f",
				a: "0.6"
			},
			{
				n: [
					"arrow",
					"left right",
					"left right arrow"
				],
				u: "2194-fe0f",
				a: "0.6"
			},
			{
				n: [
					"left",
					"arrow",
					"right",
					"curving",
					"right arrow curving left"
				],
				u: "21a9-fe0f",
				a: "0.6"
			},
			{
				n: [
					"left",
					"arrow",
					"right",
					"curving",
					"left arrow curving right"
				],
				u: "21aa-fe0f",
				a: "0.6"
			},
			{
				n: [
					"up",
					"arrow",
					"right",
					"curving",
					"right arrow curving up"
				],
				u: "2934-fe0f",
				a: "0.6"
			},
			{
				n: [
					"down",
					"arrow",
					"right",
					"curving",
					"right arrow curving down"
				],
				u: "2935-fe0f",
				a: "0.6"
			},
			{
				n: [
					"arrow",
					"arrows",
					"reload",
					"refresh",
					"vertical",
					"clockwise",
					"clockwise vertical arrows"
				],
				u: "1f503",
				a: "0.6"
			},
			{
				n: [
					"vu",
					"deja",
					"again",
					"arrow",
					"arrows",
					"button",
					"refresh",
					"anticlockwise",
					"rewindershins",
					"counterclockwise",
					"counterclockwise arrows button"
				],
				u: "1f504",
				a: "1"
			},
			{
				n: [
					"back",
					"arrow",
					"BACK arrow"
				],
				u: "1f519",
				a: "0.6"
			},
			{
				n: [
					"end",
					"arrow",
					"END arrow"
				],
				u: "1f51a",
				a: "0.6"
			},
			{
				n: [
					"on!",
					"mark",
					"arrow",
					"ON! arrow"
				],
				u: "1f51b",
				a: "0.6"
			},
			{
				n: [
					"brb",
					"omw",
					"soon",
					"arrow",
					"SOON arrow"
				],
				u: "1f51c",
				a: "0.6"
			},
			{
				n: [
					"up",
					"top",
					"arrow",
					"homie",
					"TOP arrow"
				],
				u: "1f51d",
				a: "0.6"
			},
			{
				n: [
					"pray",
					"place",
					"worship",
					"religion",
					"place of worship"
				],
				u: "1f6d0",
				a: "1"
			},
			{
				n: [
					"atom",
					"symbol",
					"atheist",
					"atom symbol"
				],
				u: "269b-fe0f",
				a: "1"
			},
			{
				n: [
					"om",
					"hindu",
					"religion"
				],
				u: "1f549-fe0f",
				a: "0.7"
			},
			{
				n: [
					"jew",
					"star",
					"david",
					"jewish",
					"judaism",
					"religion",
					"star of David"
				],
				u: "2721-fe0f",
				a: "0.7"
			},
			{
				n: [
					"wheel",
					"dharma",
					"buddhist",
					"religion",
					"wheel of dharma"
				],
				u: "2638-fe0f",
				a: "0.7"
			},
			{
				n: [
					"tao",
					"yin",
					"yang",
					"lives",
					"total",
					"taoist",
					"yinyang",
					"yin yang",
					"religion",
					"difficult"
				],
				u: "262f-fe0f",
				a: "0.7"
			},
			{
				n: [
					"cross",
					"latin",
					"christ",
					"religion",
					"christian",
					"latin cross"
				],
				u: "271d-fe0f",
				a: "0.7"
			},
			{
				n: [
					"cross",
					"orthodox",
					"religion",
					"christian",
					"orthodox cross"
				],
				u: "2626-fe0f",
				a: "1"
			},
			{
				n: [
					"star",
					"islam",
					"muslim",
					"ramadan",
					"crescent",
					"religion",
					"star and crescent"
				],
				u: "262a-fe0f",
				a: "0.7"
			},
			{
				n: [
					"peace",
					"symbol",
					"healing",
					"peaceful",
					"peace symbol"
				],
				u: "262e-fe0f",
				a: "1"
			},
			{
				n: [
					"jewish",
					"menorah",
					"judaism",
					"hanukkah",
					"religion",
					"candelabrum",
					"candlestick"
				],
				u: "1f54e",
				a: "1"
			},
			{
				n: [
					"star",
					"dotted",
					"jewish",
					"fortune",
					"judaism",
					"six pointed",
					"dotted six pointed star"
				],
				u: "1f52f",
				a: "0.6"
			},
			{
				n: [
					"deg",
					"sikh",
					"tegh",
					"fateh",
					"khanda",
					"khalsa",
					"sikhism",
					"religion"
				],
				u: "1faaf",
				a: "15"
			},
			{
				n: [
					"ram",
					"Aries",
					"aries",
					"zodiac",
					"horoscope"
				],
				u: "2648",
				a: "0.6"
			},
			{
				n: [
					"ox",
					"bull",
					"Taurus",
					"taurus",
					"zodiac",
					"horoscope"
				],
				u: "2649",
				a: "0.6"
			},
			{
				n: [
					"twins",
					"Gemini",
					"gemini",
					"zodiac",
					"horoscope"
				],
				u: "264a",
				a: "0.6"
			},
			{
				n: [
					"crab",
					"Cancer",
					"cancer",
					"zodiac",
					"horoscope"
				],
				u: "264b",
				a: "0.6"
			},
			{
				n: [
					"Leo",
					"leo",
					"lion",
					"zodiac",
					"horoscope"
				],
				u: "264c",
				a: "0.6"
			},
			{
				n: [
					"Virgo",
					"virgo",
					"zodiac",
					"horoscope"
				],
				u: "264d",
				a: "0.6"
			},
			{
				n: [
					"Libra",
					"libra",
					"scales",
					"zodiac",
					"balance",
					"justice",
					"horoscope"
				],
				u: "264e",
				a: "0.6"
			},
			{
				n: [
					"zodiac",
					"Scorpio",
					"scorpio",
					"scorpion",
					"scorpius",
					"horoscope"
				],
				u: "264f",
				a: "0.6"
			},
			{
				n: [
					"archer",
					"zodiac",
					"horoscope",
					"Sagittarius",
					"sagittarius"
				],
				u: "2650",
				a: "0.6"
			},
			{
				n: [
					"goat",
					"zodiac",
					"Capricorn",
					"capricorn",
					"horoscope"
				],
				u: "2651",
				a: "0.6"
			},
			{
				n: [
					"water",
					"bearer",
					"zodiac",
					"Aquarius",
					"aquarius",
					"horoscope"
				],
				u: "2652",
				a: "0.6"
			},
			{
				n: [
					"fish",
					"Pisces",
					"pisces",
					"zodiac",
					"horoscope"
				],
				u: "2653",
				a: "0.6"
			},
			{
				n: [
					"snake",
					"bearer",
					"zodiac",
					"serpent",
					"Ophiuchus",
					"ophiuchus"
				],
				u: "26ce",
				a: "0.6"
			},
			{
				n: [
					"arrow",
					"button",
					"tracks",
					"crossed",
					"shuffle",
					"shuffle tracks button"
				],
				u: "1f500",
				a: "1"
			},
			{
				n: [
					"arrow",
					"button",
					"repeat",
					"clockwise",
					"repeat button"
				],
				u: "1f501",
				a: "1"
			},
			{
				n: [
					"once",
					"arrow",
					"button",
					"repeat",
					"single",
					"clockwise",
					"repeat single button"
				],
				u: "1f502",
				a: "1"
			},
			{
				n: [
					"play",
					"arrow",
					"right",
					"button",
					"triangle",
					"play button"
				],
				u: "25b6-fe0f",
				a: "0.6"
			},
			{
				n: [
					"fast",
					"arrow",
					"button",
					"double",
					"forward",
					"fast forward",
					"fast forward button"
				],
				u: "23e9",
				a: "0.6"
			},
			{
				n: [
					"next",
					"arrow",
					"scene",
					"track",
					"button",
					"triangle",
					"next track button"
				],
				u: "23ed-fe0f",
				a: "0.7"
			},
			{
				n: [
					"play",
					"arrow",
					"pause",
					"right",
					"button",
					"triangle",
					"play or pause button"
				],
				u: "23ef-fe0f",
				a: "1"
			},
			{
				n: [
					"left",
					"arrow",
					"button",
					"reverse",
					"triangle",
					"reverse button"
				],
				u: "25c0-fe0f",
				a: "0.6"
			},
			{
				n: [
					"fast",
					"arrow",
					"button",
					"double",
					"rewind",
					"reverse",
					"fast reverse button"
				],
				u: "23ea",
				a: "0.6"
			},
			{
				n: [
					"last",
					"arrow",
					"scene",
					"track",
					"button",
					"previous",
					"triangle",
					"last track button"
				],
				u: "23ee-fe0f",
				a: "0.7"
			},
			{
				n: [
					"up",
					"red",
					"arrow",
					"button",
					"upwards",
					"upwards button"
				],
				u: "1f53c",
				a: "0.6"
			},
			{
				n: [
					"up",
					"fast",
					"arrow",
					"button",
					"double",
					"fast up button"
				],
				u: "23eb",
				a: "0.6"
			},
			{
				n: [
					"red",
					"down",
					"arrow",
					"button",
					"downwards",
					"downwards button"
				],
				u: "1f53d",
				a: "0.6"
			},
			{
				n: [
					"down",
					"fast",
					"arrow",
					"button",
					"double",
					"fast down button"
				],
				u: "23ec",
				a: "0.6"
			},
			{
				n: [
					"bar",
					"pause",
					"button",
					"double",
					"vertical",
					"pause button"
				],
				u: "23f8-fe0f",
				a: "0.7"
			},
			{
				n: [
					"stop",
					"button",
					"square",
					"stop button"
				],
				u: "23f9-fe0f",
				a: "0.7"
			},
			{
				n: [
					"button",
					"circle",
					"record",
					"record button"
				],
				u: "23fa-fe0f",
				a: "0.7"
			},
			{
				n: [
					"eject",
					"button",
					"eject button"
				],
				u: "23cf-fe0f",
				a: "1"
			},
			{
				n: [
					"film",
					"movie",
					"cinema",
					"camera"
				],
				u: "1f3a6",
				a: "0.6"
			},
			{
				n: [
					"dim",
					"low",
					"button",
					"dim button",
					"brightness"
				],
				u: "1f505",
				a: "1"
			},
			{
				n: [
					"light",
					"bright",
					"button",
					"brightness",
					"bright button"
				],
				u: "1f506",
				a: "1"
			},
			{
				n: [
					"bar",
					"bars",
					"cell",
					"phone",
					"mobile",
					"signal",
					"antenna",
					"telephone",
					"antenna bars",
					"communication"
				],
				u: "1f4f6",
				a: "0.6"
			},
			{
				n: [
					"wifi",
					"wlan",
					"wi fi",
					"router",
					"hotspot",
					"network",
					"wireless",
					"computer",
					"internet",
					"broadband",
					"smartphone",
					"connectivity"
				],
				u: "1f6dc",
				a: "15"
			},
			{
				n: [
					"cell",
					"mode",
					"phone",
					"mobile",
					"telephone",
					"vibration",
					"communication",
					"vibration mode"
				],
				u: "1f4f3",
				a: "0.6"
			},
			{
				n: [
					"off",
					"cell",
					"phone",
					"mobile",
					"telephone",
					"mobile phone off"
				],
				u: "1f4f4",
				a: "0.6"
			},
			{
				n: [
					"sign",
					"woman",
					"female",
					"female sign"
				],
				u: "2640-fe0f",
				a: "4"
			},
			{
				n: [
					"man",
					"male",
					"sign",
					"male sign"
				],
				u: "2642-fe0f",
				a: "4"
			},
			{
				n: [
					"symbol",
					"transgender",
					"transgender symbol"
				],
				u: "26a7-fe0f",
				a: "13"
			},
			{
				n: [
					"x",
					"×",
					"sign",
					"cancel",
					"multiply",
					"multiplication"
				],
				u: "2716-fe0f",
				a: "0.6"
			},
			{
				n: ["+", "plus"],
				u: "2795",
				a: "0.6"
			},
			{
				n: [
					" ",
					"−",
					"math",
					"sign",
					"minus",
					"heavy"
				],
				u: "2796",
				a: "0.6"
			},
			{
				n: [
					"÷",
					"math",
					"sign",
					"heavy",
					"divide",
					"division"
				],
				u: "2797",
				a: "0.6"
			},
			{
				n: [
					"math",
					"sign",
					"equal",
					"heavy",
					"answer",
					"equals",
					"equality",
					"heavy equals sign"
				],
				u: "1f7f0",
				a: "14"
			},
			{
				n: [
					"forever",
					"infinity",
					"unbounded",
					"universal"
				],
				u: "267e-fe0f",
				a: "11"
			},
			{
				n: [
					"!",
					"!!",
					"mark",
					"double",
					"bangbang",
					"exclamation",
					"punctuation",
					"double exclamation mark"
				],
				u: "203c-fe0f",
				a: "0.6"
			},
			{
				n: [
					"!",
					"?",
					"!?",
					"mark",
					"question",
					"exclamation",
					"interrobang",
					"punctuation",
					"exclamation question mark"
				],
				u: "2049-fe0f",
				a: "0.6"
			},
			{
				n: [
					"?",
					"red",
					"mark",
					"question",
					"punctuation",
					"red question mark"
				],
				u: "2753",
				a: "0.6"
			},
			{
				n: [
					"?",
					"mark",
					"white",
					"outlined",
					"question",
					"punctuation",
					"white question mark"
				],
				u: "2754",
				a: "0.6"
			},
			{
				n: [
					"!",
					"mark",
					"white",
					"outlined",
					"exclamation",
					"punctuation",
					"white exclamation mark"
				],
				u: "2755",
				a: "0.6"
			},
			{
				n: [
					"!",
					"red",
					"mark",
					"exclamation",
					"punctuation",
					"red exclamation mark"
				],
				u: "2757",
				a: "0.6"
			},
			{
				n: [
					"dash",
					"wavy",
					"wavy dash",
					"punctuation"
				],
				u: "3030-fe0f",
				a: "0.6"
			},
			{
				n: [
					"bank",
					"money",
					"currency",
					"exchange",
					"currency exchange"
				],
				u: "1f4b1",
				a: "0.6"
			},
			{
				n: [
					"pay",
					"cash",
					"sign",
					"heavy",
					"money",
					"charge",
					"dollar",
					"billion",
					"million",
					"currency",
					"heavy dollar sign"
				],
				u: "1f4b2",
				a: "0.6"
			},
			{
				n: [
					"staff",
					"symbol",
					"medical",
					"medicine",
					"aesculapius",
					"medical symbol"
				],
				u: "2695-fe0f",
				a: "4"
			},
			{
				n: [
					"symbol",
					"recycle",
					"recycling",
					"recycling symbol"
				],
				u: "267b-fe0f",
				a: "0.6"
			},
			{
				n: ["knights", "fleur de lis"],
				u: "269c-fe0f",
				a: "1"
			},
			{
				n: [
					"ship",
					"tool",
					"anchor",
					"emblem",
					"trident",
					"poseidon",
					"trident emblem"
				],
				u: "1f531",
				a: "0.6"
			},
			{
				n: [
					"name",
					"badge",
					"name badge"
				],
				u: "1f4db",
				a: "0.6"
			},
			{
				n: [
					"leaf",
					"tool",
					"green",
					"symbol",
					"yellow",
					"chevron",
					"beginner",
					"japanese",
					"Japanese symbol for beginner"
				],
				u: "1f530",
				a: "0.6"
			},
			{
				n: [
					"o",
					"red",
					"heavy",
					"large",
					"circle",
					"hollow",
					"hollow red circle"
				],
				u: "2b55",
				a: "0.6"
			},
			{
				n: [
					"✓",
					"done",
					"mark",
					"tick",
					"check",
					"fixed",
					"button",
					"checked",
					"complete",
					"checkmark",
					"completed",
					"check mark button"
				],
				u: "2705",
				a: "0.6"
			},
			{
				n: [
					"✓",
					"box",
					"off",
					"done",
					"tick",
					"check",
					"ballot",
					"checked",
					"check box with check"
				],
				u: "2611-fe0f",
				a: "0.6"
			},
			{
				n: [
					"✓",
					"done",
					"mark",
					"tick",
					"check",
					"heavy",
					"checked",
					"checkmark",
					"check mark"
				],
				u: "2714-fe0f",
				a: "0.6"
			},
			{
				n: [
					"x",
					"×",
					"mark",
					"cross",
					"cancel",
					"multiply",
					"cross mark",
					"multiplication"
				],
				u: "274c",
				a: "0.6"
			},
			{
				n: [
					"x",
					"×",
					"mark",
					"cross",
					"button",
					"square",
					"multiply",
					"multiplication",
					"cross mark button"
				],
				u: "274e",
				a: "0.6"
			},
			{
				n: [
					"curl",
					"loop",
					"curly",
					"curly loop"
				],
				u: "27b0",
				a: "0.6"
			},
			{
				n: [
					"curl",
					"loop",
					"curly",
					"double",
					"double curly loop"
				],
				u: "27bf",
				a: "1"
			},
			{
				n: [
					"mark",
					"part",
					"alternation",
					"part alternation mark"
				],
				u: "303d-fe0f",
				a: "0.6"
			},
			{
				n: [
					"*",
					"asterisk",
					"eight spoked",
					"eight spoked asterisk"
				],
				u: "2733-fe0f",
				a: "0.6"
			},
			{
				n: [
					"*",
					"star",
					"eight pointed",
					"eight pointed star"
				],
				u: "2734-fe0f",
				a: "0.6"
			},
			{
				n: ["*", "sparkle"],
				u: "2747-fe0f",
				a: "0.6"
			},
			{
				n: ["c", "copyright"],
				u: "00a9-fe0f",
				a: "0.6"
			},
			{
				n: ["r", "registered"],
				u: "00ae-fe0f",
				a: "0.6"
			},
			{
				n: [
					"tm",
					"mark",
					"trade",
					"trademark",
					"trade mark"
				],
				u: "2122-fe0f",
				a: "0.6"
			},
			{
				n: [
					"ink",
					"drip",
					"holi",
					"mess",
					"paint",
					"spill",
					"stain",
					"liquid",
					"splatter"
				],
				u: "1fadf",
				a: "16"
			},
			{
				n: ["keycap", "keycap: #"],
				u: "0023-fe0f-20e3",
				a: "0.6"
			},
			{
				n: ["keycap", "keycap: *"],
				u: "002a-fe0f-20e3",
				a: "2"
			},
			{
				n: [
					"0",
					"zero",
					"keycap",
					"keycap: 0"
				],
				u: "0030-fe0f-20e3",
				a: "0.6"
			},
			{
				n: [
					"1",
					"one",
					"keycap",
					"keycap: 1"
				],
				u: "0031-fe0f-20e3",
				a: "0.6"
			},
			{
				n: [
					"2",
					"two",
					"keycap",
					"keycap: 2"
				],
				u: "0032-fe0f-20e3",
				a: "0.6"
			},
			{
				n: [
					"3",
					"three",
					"keycap",
					"keycap: 3"
				],
				u: "0033-fe0f-20e3",
				a: "0.6"
			},
			{
				n: [
					"4",
					"four",
					"keycap",
					"keycap: 4"
				],
				u: "0034-fe0f-20e3",
				a: "0.6"
			},
			{
				n: [
					"5",
					"five",
					"keycap",
					"keycap: 5"
				],
				u: "0035-fe0f-20e3",
				a: "0.6"
			},
			{
				n: [
					"6",
					"six",
					"keycap",
					"keycap: 6"
				],
				u: "0036-fe0f-20e3",
				a: "0.6"
			},
			{
				n: [
					"7",
					"seven",
					"keycap",
					"keycap: 7"
				],
				u: "0037-fe0f-20e3",
				a: "0.6"
			},
			{
				n: [
					"8",
					"eight",
					"keycap",
					"keycap: 8"
				],
				u: "0038-fe0f-20e3",
				a: "0.6"
			},
			{
				n: [
					"9",
					"nine",
					"keycap",
					"keycap: 9"
				],
				u: "0039-fe0f-20e3",
				a: "0.6"
			},
			{
				n: ["keycap", "keycap: 10"],
				u: "1f51f",
				a: "0.6"
			},
			{
				n: [
					"abcd",
					"input",
					"latin",
					"letters",
					"uppercase",
					"input latin uppercase"
				],
				u: "1f520",
				a: "0.6"
			},
			{
				n: [
					"abcd",
					"input",
					"latin",
					"letters",
					"lowercase",
					"input latin lowercase"
				],
				u: "1f521",
				a: "0.6"
			},
			{
				n: [
					"1234",
					"input",
					"numbers",
					"input numbers"
				],
				u: "1f522",
				a: "0.6"
			},
			{
				n: [
					"%",
					"&",
					"♪",
					"〒",
					"input",
					"symbols",
					"input symbols"
				],
				u: "1f523",
				a: "0.6"
			},
			{
				n: [
					"abc",
					"input",
					"latin",
					"letters",
					"alphabet",
					"input latin letters"
				],
				u: "1f524",
				a: "0.6"
			},
			{
				n: [
					"type",
					"blood",
					"button",
					"A button (blood type)"
				],
				u: "1f170-fe0f",
				a: "0.6"
			},
			{
				n: [
					"ab",
					"type",
					"blood",
					"button",
					"AB button (blood type)"
				],
				u: "1f18e",
				a: "0.6"
			},
			{
				n: [
					"b",
					"type",
					"blood",
					"button",
					"B button (blood type)"
				],
				u: "1f171-fe0f",
				a: "0.6"
			},
			{
				n: [
					"cl",
					"button",
					"CL button"
				],
				u: "1f191",
				a: "0.6"
			},
			{
				n: [
					"cool",
					"button",
					"COOL button"
				],
				u: "1f192",
				a: "0.6"
			},
			{
				n: [
					"free",
					"button",
					"FREE button"
				],
				u: "1f193",
				a: "0.6"
			},
			{
				n: ["i", "information"],
				u: "2139-fe0f",
				a: "0.6"
			},
			{
				n: [
					"id",
					"button",
					"identity",
					"ID button"
				],
				u: "1f194",
				a: "0.6"
			},
			{
				n: [
					"m",
					"circle",
					"circled",
					"circled M"
				],
				u: "24c2-fe0f",
				a: "0.6"
			},
			{
				n: [
					"new",
					"button",
					"NEW button"
				],
				u: "1f195",
				a: "0.6"
			},
			{
				n: [
					"ng",
					"button",
					"NG button"
				],
				u: "1f196",
				a: "0.6"
			},
			{
				n: [
					"o",
					"type",
					"blood",
					"button",
					"O button (blood type)"
				],
				u: "1f17e-fe0f",
				a: "0.6"
			},
			{
				n: [
					"ok",
					"okay",
					"button",
					"OK button"
				],
				u: "1f197",
				a: "0.6"
			},
			{
				n: [
					"p",
					"button",
					"parking",
					"P button"
				],
				u: "1f17f-fe0f",
				a: "0.6"
			},
			{
				n: [
					"sos",
					"help",
					"button",
					"SOS button"
				],
				u: "1f198",
				a: "0.6"
			},
			{
				n: [
					"up",
					"up!",
					"mark",
					"button",
					"UP! button"
				],
				u: "1f199",
				a: "0.6"
			},
			{
				n: [
					"vs",
					"button",
					"versus",
					"VS button"
				],
				u: "1f19a",
				a: "0.6"
			},
			{
				n: [
					"here",
					"button",
					"japanese",
					"katakana",
					"Japanese “here” button"
				],
				u: "1f201",
				a: "0.6"
			},
			{
				n: [
					"button",
					"charge",
					"service",
					"japanese",
					"katakana",
					"Japanese “service charge” button"
				],
				u: "1f202-fe0f",
				a: "0.6"
			},
			{
				n: [
					"amount",
					"button",
					"monthly",
					"japanese",
					"ideograph",
					"Japanese “monthly amount” button"
				],
				u: "1f237-fe0f",
				a: "0.6"
			},
			{
				n: [
					"not",
					"free",
					"button",
					"charge",
					"japanese",
					"ideograph",
					"Japanese “not free of charge” button"
				],
				u: "1f236",
				a: "0.6"
			},
			{
				n: [
					"button",
					"japanese",
					"reserved",
					"ideograph",
					"Japanese “reserved” button"
				],
				u: "1f22f",
				a: "0.6"
			},
			{
				n: [
					"button",
					"bargain",
					"japanese",
					"ideograph",
					"Japanese “bargain” button"
				],
				u: "1f250",
				a: "0.6"
			},
			{
				n: [
					"button",
					"discount",
					"japanese",
					"ideograph",
					"Japanese “discount” button"
				],
				u: "1f239",
				a: "0.6"
			},
			{
				n: [
					"free",
					"button",
					"charge",
					"japanese",
					"ideograph",
					"Japanese “free of charge” button"
				],
				u: "1f21a",
				a: "0.6"
			},
			{
				n: [
					"button",
					"japanese",
					"ideograph",
					"prohibited",
					"Japanese “prohibited” button"
				],
				u: "1f232",
				a: "0.6"
			},
			{
				n: [
					"button",
					"japanese",
					"ideograph",
					"acceptable",
					"Japanese “acceptable” button"
				],
				u: "1f251",
				a: "0.6"
			},
			{
				n: [
					"button",
					"japanese",
					"ideograph",
					"application",
					"Japanese “application” button"
				],
				u: "1f238",
				a: "0.6"
			},
			{
				n: [
					"grade",
					"button",
					"passing",
					"japanese",
					"ideograph",
					"Japanese “passing grade” button"
				],
				u: "1f234",
				a: "0.6"
			},
			{
				n: [
					"button",
					"vacancy",
					"japanese",
					"ideograph",
					"Japanese “vacancy” button"
				],
				u: "1f233",
				a: "0.6"
			},
			{
				n: [
					"button",
					"japanese",
					"ideograph",
					"congratulations",
					"Japanese “congratulations” button"
				],
				u: "3297-fe0f",
				a: "0.6"
			},
			{
				n: [
					"button",
					"secret",
					"japanese",
					"ideograph",
					"Japanese “secret” button"
				],
				u: "3299-fe0f",
				a: "0.6"
			},
			{
				n: [
					"open",
					"button",
					"business",
					"japanese",
					"ideograph",
					"Japanese “open for business” button"
				],
				u: "1f23a",
				a: "0.6"
			},
			{
				n: [
					"no",
					"button",
					"vacancy",
					"japanese",
					"ideograph",
					"Japanese “no vacancy” button"
				],
				u: "1f235",
				a: "0.6"
			},
			{
				n: [
					"red",
					"circle",
					"geometric",
					"red circle"
				],
				u: "1f534",
				a: "0.6"
			},
			{
				n: [
					"circle",
					"orange",
					"orange circle"
				],
				u: "1f7e0",
				a: "12"
			},
			{
				n: [
					"circle",
					"yellow",
					"yellow circle"
				],
				u: "1f7e1",
				a: "12"
			},
			{
				n: [
					"green",
					"circle",
					"green circle"
				],
				u: "1f7e2",
				a: "12"
			},
			{
				n: [
					"blue",
					"circle",
					"geometric",
					"blue circle"
				],
				u: "1f535",
				a: "0.6"
			},
			{
				n: [
					"circle",
					"purple",
					"purple circle"
				],
				u: "1f7e3",
				a: "12"
			},
			{
				n: [
					"brown",
					"circle",
					"brown circle"
				],
				u: "1f7e4",
				a: "12"
			},
			{
				n: [
					"black",
					"circle",
					"geometric",
					"black circle"
				],
				u: "26ab",
				a: "0.6"
			},
			{
				n: [
					"white",
					"circle",
					"geometric",
					"white circle"
				],
				u: "26aa",
				a: "0.6"
			},
			{
				n: [
					"red",
					"card",
					"square",
					"penalty",
					"red square"
				],
				u: "1f7e5",
				a: "12"
			},
			{
				n: [
					"orange",
					"square",
					"orange square"
				],
				u: "1f7e7",
				a: "12"
			},
			{
				n: [
					"card",
					"square",
					"yellow",
					"penalty",
					"yellow square"
				],
				u: "1f7e8",
				a: "12"
			},
			{
				n: [
					"green",
					"square",
					"green square"
				],
				u: "1f7e9",
				a: "12"
			},
			{
				n: [
					"blue",
					"square",
					"blue square"
				],
				u: "1f7e6",
				a: "12"
			},
			{
				n: [
					"purple",
					"square",
					"purple square"
				],
				u: "1f7ea",
				a: "12"
			},
			{
				n: [
					"brown",
					"square",
					"brown square"
				],
				u: "1f7eb",
				a: "12"
			},
			{
				n: [
					"black",
					"large",
					"square",
					"geometric",
					"black large square"
				],
				u: "2b1b",
				a: "0.6"
			},
			{
				n: [
					"large",
					"white",
					"square",
					"geometric",
					"white large square"
				],
				u: "2b1c",
				a: "0.6"
			},
			{
				n: [
					"black",
					"medium",
					"square",
					"geometric",
					"black medium square"
				],
				u: "25fc-fe0f",
				a: "0.6"
			},
			{
				n: [
					"white",
					"medium",
					"square",
					"geometric",
					"white medium square"
				],
				u: "25fb-fe0f",
				a: "0.6"
			},
			{
				n: [
					"black",
					"square",
					"geometric",
					"medium small",
					"black medium small square"
				],
				u: "25fe",
				a: "0.6"
			},
			{
				n: [
					"white",
					"square",
					"geometric",
					"medium small",
					"white medium small square"
				],
				u: "25fd",
				a: "0.6"
			},
			{
				n: [
					"black",
					"small",
					"square",
					"geometric",
					"black small square"
				],
				u: "25aa-fe0f",
				a: "0.6"
			},
			{
				n: [
					"small",
					"white",
					"square",
					"geometric",
					"white small square"
				],
				u: "25ab-fe0f",
				a: "0.6"
			},
			{
				n: [
					"large",
					"orange",
					"diamond",
					"geometric",
					"large orange diamond"
				],
				u: "1f536",
				a: "0.6"
			},
			{
				n: [
					"blue",
					"large",
					"diamond",
					"geometric",
					"large blue diamond"
				],
				u: "1f537",
				a: "0.6"
			},
			{
				n: [
					"small",
					"orange",
					"diamond",
					"geometric",
					"small orange diamond"
				],
				u: "1f538",
				a: "0.6"
			},
			{
				n: [
					"blue",
					"small",
					"diamond",
					"geometric",
					"small blue diamond"
				],
				u: "1f539",
				a: "0.6"
			},
			{
				n: [
					"up",
					"red",
					"pointed",
					"triangle",
					"geometric",
					"red triangle pointed up"
				],
				u: "1f53a",
				a: "0.6"
			},
			{
				n: [
					"red",
					"down",
					"pointed",
					"triangle",
					"geometric",
					"red triangle pointed down"
				],
				u: "1f53b",
				a: "0.6"
			},
			{
				n: [
					"dot",
					"comic",
					"diamond",
					"geometric",
					"diamond with a dot"
				],
				u: "1f4a0",
				a: "0.6"
			},
			{
				n: [
					"radio",
					"button",
					"geometric",
					"radio button"
				],
				u: "1f518",
				a: "0.6"
			},
			{
				n: [
					"white",
					"button",
					"square",
					"outlined",
					"geometric",
					"white square button"
				],
				u: "1f533",
				a: "0.6"
			},
			{
				n: [
					"black",
					"button",
					"square",
					"geometric",
					"black square button"
				],
				u: "1f532",
				a: "0.6"
			}
		],
		flags: [
			{
				n: [
					"win",
					"flag",
					"game",
					"race",
					"flags",
					"sport",
					"finish",
					"racing",
					"checkered",
					"chequered",
					"chequered flag"
				],
				u: "1f3c1",
				a: "0.6"
			},
			{
				n: [
					"flag",
					"golf",
					"post",
					"triangular",
					"construction",
					"triangular flag"
				],
				u: "1f6a9",
				a: "0.6"
			},
			{
				n: [
					"cross",
					"flags",
					"crossed",
					"japanese",
					"celebration",
					"crossed flags"
				],
				u: "1f38c",
				a: "0.6"
			},
			{
				n: [
					"flag",
					"black",
					"waving",
					"black flag"
				],
				u: "1f3f4",
				a: "1"
			},
			{
				n: [
					"flag",
					"white",
					"waving",
					"white flag"
				],
				u: "1f3f3-fe0f",
				a: "0.7"
			},
			{
				n: [
					"gay",
					"flag",
					"glbt",
					"lgbt",
					"glbtq",
					"lgbtq",
					"pride",
					"queer",
					"trans",
					"lesbian",
					"lgbtqia",
					"rainbow",
					"bisexual",
					"genderqueer",
					"transgender",
					"rainbow flag"
				],
				u: "1f3f3-fe0f-200d-1f308",
				a: "4"
			},
			{
				n: [
					"blue",
					"flag",
					"pink",
					"light",
					"white",
					"transgender",
					"transgender flag"
				],
				u: "1f3f3-fe0f-200d-26a7-fe0f",
				a: "13"
			},
			{
				n: [
					"flag",
					"jolly",
					"roger",
					"pirate",
					"plunder",
					"treasure",
					"pirate flag"
				],
				u: "1f3f4-200d-2620-fe0f",
				a: "11"
			},
			{
				n: [
					"AC",
					"flag",
					"flag: Ascension Island"
				],
				u: "1f1e6-1f1e8",
				a: "2"
			},
			{
				n: [
					"AD",
					"flag",
					"flag: Andorra"
				],
				u: "1f1e6-1f1e9",
				a: "2"
			},
			{
				n: [
					"AE",
					"flag",
					"flag: United Arab Emirates"
				],
				u: "1f1e6-1f1ea",
				a: "2"
			},
			{
				n: [
					"AF",
					"flag",
					"flag: Afghanistan"
				],
				u: "1f1e6-1f1eb",
				a: "2"
			},
			{
				n: [
					"AG",
					"flag",
					"flag: Antigua & Barbuda"
				],
				u: "1f1e6-1f1ec",
				a: "2"
			},
			{
				n: [
					"AI",
					"flag",
					"flag: Anguilla"
				],
				u: "1f1e6-1f1ee",
				a: "2"
			},
			{
				n: [
					"AL",
					"flag",
					"flag: Albania"
				],
				u: "1f1e6-1f1f1",
				a: "2"
			},
			{
				n: [
					"AM",
					"flag",
					"flag: Armenia"
				],
				u: "1f1e6-1f1f2",
				a: "2"
			},
			{
				n: [
					"AO",
					"flag",
					"flag: Angola"
				],
				u: "1f1e6-1f1f4",
				a: "2"
			},
			{
				n: [
					"AQ",
					"flag",
					"flag: Antarctica"
				],
				u: "1f1e6-1f1f6",
				a: "2"
			},
			{
				n: [
					"AR",
					"flag",
					"flag: Argentina"
				],
				u: "1f1e6-1f1f7",
				a: "2"
			},
			{
				n: [
					"AS",
					"flag",
					"flag: American Samoa"
				],
				u: "1f1e6-1f1f8",
				a: "2"
			},
			{
				n: [
					"AT",
					"flag",
					"flag: Austria"
				],
				u: "1f1e6-1f1f9",
				a: "2"
			},
			{
				n: [
					"AU",
					"flag",
					"flag: Australia"
				],
				u: "1f1e6-1f1fa",
				a: "2"
			},
			{
				n: [
					"AW",
					"flag",
					"flag: Aruba"
				],
				u: "1f1e6-1f1fc",
				a: "2"
			},
			{
				n: [
					"AX",
					"flag",
					"flag: Åland Islands"
				],
				u: "1f1e6-1f1fd",
				a: "2"
			},
			{
				n: [
					"AZ",
					"flag",
					"flag: Azerbaijan"
				],
				u: "1f1e6-1f1ff",
				a: "2"
			},
			{
				n: [
					"BA",
					"flag",
					"flag: Bosnia & Herzegovina"
				],
				u: "1f1e7-1f1e6",
				a: "2"
			},
			{
				n: [
					"BB",
					"flag",
					"flag: Barbados"
				],
				u: "1f1e7-1f1e7",
				a: "2"
			},
			{
				n: [
					"BD",
					"flag",
					"flag: Bangladesh"
				],
				u: "1f1e7-1f1e9",
				a: "2"
			},
			{
				n: [
					"BE",
					"flag",
					"flag: Belgium"
				],
				u: "1f1e7-1f1ea",
				a: "2"
			},
			{
				n: [
					"BF",
					"flag",
					"flag: Burkina Faso"
				],
				u: "1f1e7-1f1eb",
				a: "2"
			},
			{
				n: [
					"BG",
					"flag",
					"flag: Bulgaria"
				],
				u: "1f1e7-1f1ec",
				a: "2"
			},
			{
				n: [
					"BH",
					"flag",
					"flag: Bahrain"
				],
				u: "1f1e7-1f1ed",
				a: "2"
			},
			{
				n: [
					"BI",
					"flag",
					"flag: Burundi"
				],
				u: "1f1e7-1f1ee",
				a: "2"
			},
			{
				n: [
					"BJ",
					"flag",
					"flag: Benin"
				],
				u: "1f1e7-1f1ef",
				a: "2"
			},
			{
				n: [
					"BL",
					"flag",
					"flag: St. Barthélemy"
				],
				u: "1f1e7-1f1f1",
				a: "2"
			},
			{
				n: [
					"BM",
					"flag",
					"flag: Bermuda"
				],
				u: "1f1e7-1f1f2",
				a: "2"
			},
			{
				n: [
					"BN",
					"flag",
					"flag: Brunei"
				],
				u: "1f1e7-1f1f3",
				a: "2"
			},
			{
				n: [
					"BO",
					"flag",
					"flag: Bolivia"
				],
				u: "1f1e7-1f1f4",
				a: "2"
			},
			{
				n: [
					"BQ",
					"flag",
					"flag: Caribbean Netherlands"
				],
				u: "1f1e7-1f1f6",
				a: "2"
			},
			{
				n: [
					"BR",
					"flag",
					"flag: Brazil"
				],
				u: "1f1e7-1f1f7",
				a: "2"
			},
			{
				n: [
					"BS",
					"flag",
					"flag: Bahamas"
				],
				u: "1f1e7-1f1f8",
				a: "2"
			},
			{
				n: [
					"BT",
					"flag",
					"flag: Bhutan"
				],
				u: "1f1e7-1f1f9",
				a: "2"
			},
			{
				n: [
					"BV",
					"flag",
					"flag: Bouvet Island"
				],
				u: "1f1e7-1f1fb",
				a: "2"
			},
			{
				n: [
					"BW",
					"flag",
					"flag: Botswana"
				],
				u: "1f1e7-1f1fc",
				a: "2"
			},
			{
				n: [
					"BY",
					"flag",
					"flag: Belarus"
				],
				u: "1f1e7-1f1fe",
				a: "2"
			},
			{
				n: [
					"BZ",
					"flag",
					"flag: Belize"
				],
				u: "1f1e7-1f1ff",
				a: "2"
			},
			{
				n: [
					"CA",
					"flag",
					"flag: Canada"
				],
				u: "1f1e8-1f1e6",
				a: "2"
			},
			{
				n: [
					"CC",
					"flag",
					"flag: Cocos (Keeling) Islands"
				],
				u: "1f1e8-1f1e8",
				a: "2"
			},
			{
				n: [
					"CD",
					"flag",
					"flag: Congo   Kinshasa"
				],
				u: "1f1e8-1f1e9",
				a: "2"
			},
			{
				n: [
					"CF",
					"flag",
					"flag: Central African Republic"
				],
				u: "1f1e8-1f1eb",
				a: "2"
			},
			{
				n: [
					"CG",
					"flag",
					"flag: Congo   Brazzaville"
				],
				u: "1f1e8-1f1ec",
				a: "2"
			},
			{
				n: [
					"CH",
					"flag",
					"flag: Switzerland"
				],
				u: "1f1e8-1f1ed",
				a: "2"
			},
			{
				n: [
					"CI",
					"flag",
					"flag: Côte d’Ivoire"
				],
				u: "1f1e8-1f1ee",
				a: "2"
			},
			{
				n: [
					"CK",
					"flag",
					"flag: Cook Islands"
				],
				u: "1f1e8-1f1f0",
				a: "2"
			},
			{
				n: [
					"CL",
					"flag",
					"flag: Chile"
				],
				u: "1f1e8-1f1f1",
				a: "2"
			},
			{
				n: [
					"CM",
					"flag",
					"flag: Cameroon"
				],
				u: "1f1e8-1f1f2",
				a: "2"
			},
			{
				n: [
					"CN",
					"flag",
					"flag: China"
				],
				u: "1f1e8-1f1f3",
				a: "0.6"
			},
			{
				n: [
					"CO",
					"flag",
					"flag: Colombia"
				],
				u: "1f1e8-1f1f4",
				a: "2"
			},
			{
				n: [
					"CP",
					"flag",
					"flag: Clipperton Island"
				],
				u: "1f1e8-1f1f5",
				a: "2"
			},
			{
				n: [
					"CQ",
					"flag",
					"flag: Sark"
				],
				u: "1f1e8-1f1f6",
				a: "16"
			},
			{
				n: [
					"CR",
					"flag",
					"flag: Costa Rica"
				],
				u: "1f1e8-1f1f7",
				a: "2"
			},
			{
				n: [
					"CU",
					"flag",
					"flag: Cuba"
				],
				u: "1f1e8-1f1fa",
				a: "2"
			},
			{
				n: [
					"CV",
					"flag",
					"flag: Cape Verde"
				],
				u: "1f1e8-1f1fb",
				a: "2"
			},
			{
				n: [
					"CW",
					"flag",
					"flag: Curaçao"
				],
				u: "1f1e8-1f1fc",
				a: "2"
			},
			{
				n: [
					"CX",
					"flag",
					"flag: Christmas Island"
				],
				u: "1f1e8-1f1fd",
				a: "2"
			},
			{
				n: [
					"CY",
					"flag",
					"flag: Cyprus"
				],
				u: "1f1e8-1f1fe",
				a: "2"
			},
			{
				n: [
					"CZ",
					"flag",
					"flag: Czechia"
				],
				u: "1f1e8-1f1ff",
				a: "2"
			},
			{
				n: [
					"DE",
					"flag",
					"flag: Germany"
				],
				u: "1f1e9-1f1ea",
				a: "0.6"
			},
			{
				n: [
					"DG",
					"flag",
					"flag: Diego Garcia"
				],
				u: "1f1e9-1f1ec",
				a: "2"
			},
			{
				n: [
					"DJ",
					"flag",
					"flag: Djibouti"
				],
				u: "1f1e9-1f1ef",
				a: "2"
			},
			{
				n: [
					"DK",
					"flag",
					"flag: Denmark"
				],
				u: "1f1e9-1f1f0",
				a: "2"
			},
			{
				n: [
					"DM",
					"flag",
					"flag: Dominica"
				],
				u: "1f1e9-1f1f2",
				a: "2"
			},
			{
				n: [
					"DO",
					"flag",
					"flag: Dominican Republic"
				],
				u: "1f1e9-1f1f4",
				a: "2"
			},
			{
				n: [
					"DZ",
					"flag",
					"flag: Algeria"
				],
				u: "1f1e9-1f1ff",
				a: "2"
			},
			{
				n: [
					"EA",
					"flag",
					"flag: Ceuta & Melilla"
				],
				u: "1f1ea-1f1e6",
				a: "2"
			},
			{
				n: [
					"EC",
					"flag",
					"flag: Ecuador"
				],
				u: "1f1ea-1f1e8",
				a: "2"
			},
			{
				n: [
					"EE",
					"flag",
					"flag: Estonia"
				],
				u: "1f1ea-1f1ea",
				a: "2"
			},
			{
				n: [
					"EG",
					"flag",
					"flag: Egypt"
				],
				u: "1f1ea-1f1ec",
				a: "2"
			},
			{
				n: [
					"EH",
					"flag",
					"flag: Western Sahara"
				],
				u: "1f1ea-1f1ed",
				a: "2"
			},
			{
				n: [
					"ER",
					"flag",
					"flag: Eritrea"
				],
				u: "1f1ea-1f1f7",
				a: "2"
			},
			{
				n: [
					"ES",
					"flag",
					"flag: Spain"
				],
				u: "1f1ea-1f1f8",
				a: "0.6"
			},
			{
				n: [
					"ET",
					"flag",
					"flag: Ethiopia"
				],
				u: "1f1ea-1f1f9",
				a: "2"
			},
			{
				n: [
					"EU",
					"flag",
					"flag: European Union"
				],
				u: "1f1ea-1f1fa",
				a: "2"
			},
			{
				n: [
					"FI",
					"flag",
					"flag: Finland"
				],
				u: "1f1eb-1f1ee",
				a: "2"
			},
			{
				n: [
					"FJ",
					"flag",
					"flag: Fiji"
				],
				u: "1f1eb-1f1ef",
				a: "2"
			},
			{
				n: [
					"FK",
					"flag",
					"flag: Falkland Islands"
				],
				u: "1f1eb-1f1f0",
				a: "2"
			},
			{
				n: [
					"FM",
					"flag",
					"flag: Micronesia"
				],
				u: "1f1eb-1f1f2",
				a: "2"
			},
			{
				n: [
					"FO",
					"flag",
					"flag: Faroe Islands"
				],
				u: "1f1eb-1f1f4",
				a: "2"
			},
			{
				n: [
					"FR",
					"flag",
					"flag: France"
				],
				u: "1f1eb-1f1f7",
				a: "0.6"
			},
			{
				n: [
					"GA",
					"flag",
					"flag: Gabon"
				],
				u: "1f1ec-1f1e6",
				a: "2"
			},
			{
				n: [
					"GB",
					"flag",
					"flag: United Kingdom"
				],
				u: "1f1ec-1f1e7",
				a: "0.6"
			},
			{
				n: [
					"GD",
					"flag",
					"flag: Grenada"
				],
				u: "1f1ec-1f1e9",
				a: "2"
			},
			{
				n: [
					"GE",
					"flag",
					"flag: Georgia"
				],
				u: "1f1ec-1f1ea",
				a: "2"
			},
			{
				n: [
					"GF",
					"flag",
					"flag: French Guiana"
				],
				u: "1f1ec-1f1eb",
				a: "2"
			},
			{
				n: [
					"GG",
					"flag",
					"flag: Guernsey"
				],
				u: "1f1ec-1f1ec",
				a: "2"
			},
			{
				n: [
					"GH",
					"flag",
					"flag: Ghana"
				],
				u: "1f1ec-1f1ed",
				a: "2"
			},
			{
				n: [
					"GI",
					"flag",
					"flag: Gibraltar"
				],
				u: "1f1ec-1f1ee",
				a: "2"
			},
			{
				n: [
					"GL",
					"flag",
					"flag: Greenland"
				],
				u: "1f1ec-1f1f1",
				a: "2"
			},
			{
				n: [
					"GM",
					"flag",
					"flag: Gambia"
				],
				u: "1f1ec-1f1f2",
				a: "2"
			},
			{
				n: [
					"GN",
					"flag",
					"flag: Guinea"
				],
				u: "1f1ec-1f1f3",
				a: "2"
			},
			{
				n: [
					"GP",
					"flag",
					"flag: Guadeloupe"
				],
				u: "1f1ec-1f1f5",
				a: "2"
			},
			{
				n: [
					"GQ",
					"flag",
					"flag: Equatorial Guinea"
				],
				u: "1f1ec-1f1f6",
				a: "2"
			},
			{
				n: [
					"GR",
					"flag",
					"flag: Greece"
				],
				u: "1f1ec-1f1f7",
				a: "2"
			},
			{
				n: [
					"GS",
					"flag",
					"flag: South Georgia & South Sandwich Islands"
				],
				u: "1f1ec-1f1f8",
				a: "2"
			},
			{
				n: [
					"GT",
					"flag",
					"flag: Guatemala"
				],
				u: "1f1ec-1f1f9",
				a: "2"
			},
			{
				n: [
					"GU",
					"flag",
					"flag: Guam"
				],
				u: "1f1ec-1f1fa",
				a: "2"
			},
			{
				n: [
					"GW",
					"flag",
					"flag: Guinea Bissau"
				],
				u: "1f1ec-1f1fc",
				a: "2"
			},
			{
				n: [
					"GY",
					"flag",
					"flag: Guyana"
				],
				u: "1f1ec-1f1fe",
				a: "2"
			},
			{
				n: [
					"HK",
					"flag",
					"flag: Hong Kong SAR China"
				],
				u: "1f1ed-1f1f0",
				a: "2"
			},
			{
				n: [
					"HM",
					"flag",
					"flag: Heard & McDonald Islands"
				],
				u: "1f1ed-1f1f2",
				a: "2"
			},
			{
				n: [
					"HN",
					"flag",
					"flag: Honduras"
				],
				u: "1f1ed-1f1f3",
				a: "2"
			},
			{
				n: [
					"HR",
					"flag",
					"flag: Croatia"
				],
				u: "1f1ed-1f1f7",
				a: "2"
			},
			{
				n: [
					"HT",
					"flag",
					"flag: Haiti"
				],
				u: "1f1ed-1f1f9",
				a: "2"
			},
			{
				n: [
					"HU",
					"flag",
					"flag: Hungary"
				],
				u: "1f1ed-1f1fa",
				a: "2"
			},
			{
				n: [
					"IC",
					"flag",
					"flag: Canary Islands"
				],
				u: "1f1ee-1f1e8",
				a: "2"
			},
			{
				n: [
					"ID",
					"flag",
					"flag: Indonesia"
				],
				u: "1f1ee-1f1e9",
				a: "2"
			},
			{
				n: [
					"IE",
					"flag",
					"flag: Ireland"
				],
				u: "1f1ee-1f1ea",
				a: "2"
			},
			{
				n: [
					"IL",
					"flag",
					"flag: Israel"
				],
				u: "1f1ee-1f1f1",
				a: "2"
			},
			{
				n: [
					"IM",
					"flag",
					"flag: Isle of Man"
				],
				u: "1f1ee-1f1f2",
				a: "2"
			},
			{
				n: [
					"IN",
					"flag",
					"flag: India"
				],
				u: "1f1ee-1f1f3",
				a: "2"
			},
			{
				n: [
					"IO",
					"flag",
					"flag: British Indian Ocean Territory"
				],
				u: "1f1ee-1f1f4",
				a: "2"
			},
			{
				n: [
					"IQ",
					"flag",
					"flag: Iraq"
				],
				u: "1f1ee-1f1f6",
				a: "2"
			},
			{
				n: [
					"IR",
					"flag",
					"flag: Iran"
				],
				u: "1f1ee-1f1f7",
				a: "2"
			},
			{
				n: [
					"IS",
					"flag",
					"flag: Iceland"
				],
				u: "1f1ee-1f1f8",
				a: "2"
			},
			{
				n: [
					"IT",
					"flag",
					"flag: Italy"
				],
				u: "1f1ee-1f1f9",
				a: "0.6"
			},
			{
				n: [
					"JE",
					"flag",
					"flag: Jersey"
				],
				u: "1f1ef-1f1ea",
				a: "2"
			},
			{
				n: [
					"JM",
					"flag",
					"flag: Jamaica"
				],
				u: "1f1ef-1f1f2",
				a: "2"
			},
			{
				n: [
					"JO",
					"flag",
					"flag: Jordan"
				],
				u: "1f1ef-1f1f4",
				a: "2"
			},
			{
				n: [
					"JP",
					"flag",
					"flag: Japan"
				],
				u: "1f1ef-1f1f5",
				a: "0.6"
			},
			{
				n: [
					"KE",
					"flag",
					"flag: Kenya"
				],
				u: "1f1f0-1f1ea",
				a: "2"
			},
			{
				n: [
					"KG",
					"flag",
					"flag: Kyrgyzstan"
				],
				u: "1f1f0-1f1ec",
				a: "2"
			},
			{
				n: [
					"KH",
					"flag",
					"flag: Cambodia"
				],
				u: "1f1f0-1f1ed",
				a: "2"
			},
			{
				n: [
					"KI",
					"flag",
					"flag: Kiribati"
				],
				u: "1f1f0-1f1ee",
				a: "2"
			},
			{
				n: [
					"KM",
					"flag",
					"flag: Comoros"
				],
				u: "1f1f0-1f1f2",
				a: "2"
			},
			{
				n: [
					"KN",
					"flag",
					"flag: St. Kitts & Nevis"
				],
				u: "1f1f0-1f1f3",
				a: "2"
			},
			{
				n: [
					"KP",
					"flag",
					"flag: North Korea"
				],
				u: "1f1f0-1f1f5",
				a: "2"
			},
			{
				n: [
					"KR",
					"flag",
					"flag: South Korea"
				],
				u: "1f1f0-1f1f7",
				a: "0.6"
			},
			{
				n: [
					"KW",
					"flag",
					"flag: Kuwait"
				],
				u: "1f1f0-1f1fc",
				a: "2"
			},
			{
				n: [
					"KY",
					"flag",
					"flag: Cayman Islands"
				],
				u: "1f1f0-1f1fe",
				a: "2"
			},
			{
				n: [
					"KZ",
					"flag",
					"flag: Kazakhstan"
				],
				u: "1f1f0-1f1ff",
				a: "2"
			},
			{
				n: [
					"LA",
					"flag",
					"flag: Laos"
				],
				u: "1f1f1-1f1e6",
				a: "2"
			},
			{
				n: [
					"LB",
					"flag",
					"flag: Lebanon"
				],
				u: "1f1f1-1f1e7",
				a: "2"
			},
			{
				n: [
					"LC",
					"flag",
					"flag: St. Lucia"
				],
				u: "1f1f1-1f1e8",
				a: "2"
			},
			{
				n: [
					"LI",
					"flag",
					"flag: Liechtenstein"
				],
				u: "1f1f1-1f1ee",
				a: "2"
			},
			{
				n: [
					"LK",
					"flag",
					"flag: Sri Lanka"
				],
				u: "1f1f1-1f1f0",
				a: "2"
			},
			{
				n: [
					"LR",
					"flag",
					"flag: Liberia"
				],
				u: "1f1f1-1f1f7",
				a: "2"
			},
			{
				n: [
					"LS",
					"flag",
					"flag: Lesotho"
				],
				u: "1f1f1-1f1f8",
				a: "2"
			},
			{
				n: [
					"LT",
					"flag",
					"flag: Lithuania"
				],
				u: "1f1f1-1f1f9",
				a: "2"
			},
			{
				n: [
					"LU",
					"flag",
					"flag: Luxembourg"
				],
				u: "1f1f1-1f1fa",
				a: "2"
			},
			{
				n: [
					"LV",
					"flag",
					"flag: Latvia"
				],
				u: "1f1f1-1f1fb",
				a: "2"
			},
			{
				n: [
					"LY",
					"flag",
					"flag: Libya"
				],
				u: "1f1f1-1f1fe",
				a: "2"
			},
			{
				n: [
					"MA",
					"flag",
					"flag: Morocco"
				],
				u: "1f1f2-1f1e6",
				a: "2"
			},
			{
				n: [
					"MC",
					"flag",
					"flag: Monaco"
				],
				u: "1f1f2-1f1e8",
				a: "2"
			},
			{
				n: [
					"MD",
					"flag",
					"flag: Moldova"
				],
				u: "1f1f2-1f1e9",
				a: "2"
			},
			{
				n: [
					"ME",
					"flag",
					"flag: Montenegro"
				],
				u: "1f1f2-1f1ea",
				a: "2"
			},
			{
				n: [
					"MF",
					"flag",
					"flag: St. Martin"
				],
				u: "1f1f2-1f1eb",
				a: "2"
			},
			{
				n: [
					"MG",
					"flag",
					"flag: Madagascar"
				],
				u: "1f1f2-1f1ec",
				a: "2"
			},
			{
				n: [
					"MH",
					"flag",
					"flag: Marshall Islands"
				],
				u: "1f1f2-1f1ed",
				a: "2"
			},
			{
				n: [
					"MK",
					"flag",
					"flag: North Macedonia"
				],
				u: "1f1f2-1f1f0",
				a: "2"
			},
			{
				n: [
					"ML",
					"flag",
					"flag: Mali"
				],
				u: "1f1f2-1f1f1",
				a: "2"
			},
			{
				n: [
					"MM",
					"flag",
					"flag: Myanmar (Burma)"
				],
				u: "1f1f2-1f1f2",
				a: "2"
			},
			{
				n: [
					"MN",
					"flag",
					"flag: Mongolia"
				],
				u: "1f1f2-1f1f3",
				a: "2"
			},
			{
				n: [
					"MO",
					"flag",
					"flag: Macao SAR China"
				],
				u: "1f1f2-1f1f4",
				a: "2"
			},
			{
				n: [
					"MP",
					"flag",
					"flag: Northern Mariana Islands"
				],
				u: "1f1f2-1f1f5",
				a: "2"
			},
			{
				n: [
					"MQ",
					"flag",
					"flag: Martinique"
				],
				u: "1f1f2-1f1f6",
				a: "2"
			},
			{
				n: [
					"MR",
					"flag",
					"flag: Mauritania"
				],
				u: "1f1f2-1f1f7",
				a: "2"
			},
			{
				n: [
					"MS",
					"flag",
					"flag: Montserrat"
				],
				u: "1f1f2-1f1f8",
				a: "2"
			},
			{
				n: [
					"MT",
					"flag",
					"flag: Malta"
				],
				u: "1f1f2-1f1f9",
				a: "2"
			},
			{
				n: [
					"MU",
					"flag",
					"flag: Mauritius"
				],
				u: "1f1f2-1f1fa",
				a: "2"
			},
			{
				n: [
					"MV",
					"flag",
					"flag: Maldives"
				],
				u: "1f1f2-1f1fb",
				a: "2"
			},
			{
				n: [
					"MW",
					"flag",
					"flag: Malawi"
				],
				u: "1f1f2-1f1fc",
				a: "2"
			},
			{
				n: [
					"MX",
					"flag",
					"flag: Mexico"
				],
				u: "1f1f2-1f1fd",
				a: "2"
			},
			{
				n: [
					"MY",
					"flag",
					"flag: Malaysia"
				],
				u: "1f1f2-1f1fe",
				a: "2"
			},
			{
				n: [
					"MZ",
					"flag",
					"flag: Mozambique"
				],
				u: "1f1f2-1f1ff",
				a: "2"
			},
			{
				n: [
					"NA",
					"flag",
					"flag: Namibia"
				],
				u: "1f1f3-1f1e6",
				a: "2"
			},
			{
				n: [
					"NC",
					"flag",
					"flag: New Caledonia"
				],
				u: "1f1f3-1f1e8",
				a: "2"
			},
			{
				n: [
					"NE",
					"flag",
					"flag: Niger"
				],
				u: "1f1f3-1f1ea",
				a: "2"
			},
			{
				n: [
					"NF",
					"flag",
					"flag: Norfolk Island"
				],
				u: "1f1f3-1f1eb",
				a: "2"
			},
			{
				n: [
					"NG",
					"flag",
					"flag: Nigeria"
				],
				u: "1f1f3-1f1ec",
				a: "2"
			},
			{
				n: [
					"NI",
					"flag",
					"flag: Nicaragua"
				],
				u: "1f1f3-1f1ee",
				a: "2"
			},
			{
				n: [
					"NL",
					"flag",
					"flag: Netherlands"
				],
				u: "1f1f3-1f1f1",
				a: "2"
			},
			{
				n: [
					"NO",
					"flag",
					"flag: Norway"
				],
				u: "1f1f3-1f1f4",
				a: "2"
			},
			{
				n: [
					"NP",
					"flag",
					"flag: Nepal"
				],
				u: "1f1f3-1f1f5",
				a: "2"
			},
			{
				n: [
					"NR",
					"flag",
					"flag: Nauru"
				],
				u: "1f1f3-1f1f7",
				a: "2"
			},
			{
				n: [
					"NU",
					"flag",
					"flag: Niue"
				],
				u: "1f1f3-1f1fa",
				a: "2"
			},
			{
				n: [
					"NZ",
					"flag",
					"flag: New Zealand"
				],
				u: "1f1f3-1f1ff",
				a: "2"
			},
			{
				n: [
					"OM",
					"flag",
					"flag: Oman"
				],
				u: "1f1f4-1f1f2",
				a: "2"
			},
			{
				n: [
					"PA",
					"flag",
					"flag: Panama"
				],
				u: "1f1f5-1f1e6",
				a: "2"
			},
			{
				n: [
					"PE",
					"flag",
					"flag: Peru"
				],
				u: "1f1f5-1f1ea",
				a: "2"
			},
			{
				n: [
					"PF",
					"flag",
					"flag: French Polynesia"
				],
				u: "1f1f5-1f1eb",
				a: "2"
			},
			{
				n: [
					"PG",
					"flag",
					"flag: Papua New Guinea"
				],
				u: "1f1f5-1f1ec",
				a: "2"
			},
			{
				n: [
					"PH",
					"flag",
					"flag: Philippines"
				],
				u: "1f1f5-1f1ed",
				a: "2"
			},
			{
				n: [
					"PK",
					"flag",
					"flag: Pakistan"
				],
				u: "1f1f5-1f1f0",
				a: "2"
			},
			{
				n: [
					"PL",
					"flag",
					"flag: Poland"
				],
				u: "1f1f5-1f1f1",
				a: "2"
			},
			{
				n: [
					"PM",
					"flag",
					"flag: St. Pierre & Miquelon"
				],
				u: "1f1f5-1f1f2",
				a: "2"
			},
			{
				n: [
					"PN",
					"flag",
					"flag: Pitcairn Islands"
				],
				u: "1f1f5-1f1f3",
				a: "2"
			},
			{
				n: [
					"PR",
					"flag",
					"flag: Puerto Rico"
				],
				u: "1f1f5-1f1f7",
				a: "2"
			},
			{
				n: [
					"PS",
					"flag",
					"flag: Palestinian Territories"
				],
				u: "1f1f5-1f1f8",
				a: "2"
			},
			{
				n: [
					"PT",
					"flag",
					"flag: Portugal"
				],
				u: "1f1f5-1f1f9",
				a: "2"
			},
			{
				n: [
					"PW",
					"flag",
					"flag: Palau"
				],
				u: "1f1f5-1f1fc",
				a: "2"
			},
			{
				n: [
					"PY",
					"flag",
					"flag: Paraguay"
				],
				u: "1f1f5-1f1fe",
				a: "2"
			},
			{
				n: [
					"QA",
					"flag",
					"flag: Qatar"
				],
				u: "1f1f6-1f1e6",
				a: "2"
			},
			{
				n: [
					"RE",
					"flag",
					"flag: Réunion"
				],
				u: "1f1f7-1f1ea",
				a: "2"
			},
			{
				n: [
					"RO",
					"flag",
					"flag: Romania"
				],
				u: "1f1f7-1f1f4",
				a: "2"
			},
			{
				n: [
					"RS",
					"flag",
					"flag: Serbia"
				],
				u: "1f1f7-1f1f8",
				a: "2"
			},
			{
				n: [
					"RU",
					"flag",
					"flag: Russia"
				],
				u: "1f1f7-1f1fa",
				a: "0.6"
			},
			{
				n: [
					"RW",
					"flag",
					"flag: Rwanda"
				],
				u: "1f1f7-1f1fc",
				a: "2"
			},
			{
				n: [
					"SA",
					"flag",
					"flag: Saudi Arabia"
				],
				u: "1f1f8-1f1e6",
				a: "2"
			},
			{
				n: [
					"SB",
					"flag",
					"flag: Solomon Islands"
				],
				u: "1f1f8-1f1e7",
				a: "2"
			},
			{
				n: [
					"SC",
					"flag",
					"flag: Seychelles"
				],
				u: "1f1f8-1f1e8",
				a: "2"
			},
			{
				n: [
					"SD",
					"flag",
					"flag: Sudan"
				],
				u: "1f1f8-1f1e9",
				a: "2"
			},
			{
				n: [
					"SE",
					"flag",
					"flag: Sweden"
				],
				u: "1f1f8-1f1ea",
				a: "2"
			},
			{
				n: [
					"SG",
					"flag",
					"flag: Singapore"
				],
				u: "1f1f8-1f1ec",
				a: "2"
			},
			{
				n: [
					"SH",
					"flag",
					"flag: St. Helena"
				],
				u: "1f1f8-1f1ed",
				a: "2"
			},
			{
				n: [
					"SI",
					"flag",
					"flag: Slovenia"
				],
				u: "1f1f8-1f1ee",
				a: "2"
			},
			{
				n: [
					"SJ",
					"flag",
					"flag: Svalbard & Jan Mayen"
				],
				u: "1f1f8-1f1ef",
				a: "2"
			},
			{
				n: [
					"SK",
					"flag",
					"flag: Slovakia"
				],
				u: "1f1f8-1f1f0",
				a: "2"
			},
			{
				n: [
					"SL",
					"flag",
					"flag: Sierra Leone"
				],
				u: "1f1f8-1f1f1",
				a: "2"
			},
			{
				n: [
					"SM",
					"flag",
					"flag: San Marino"
				],
				u: "1f1f8-1f1f2",
				a: "2"
			},
			{
				n: [
					"SN",
					"flag",
					"flag: Senegal"
				],
				u: "1f1f8-1f1f3",
				a: "2"
			},
			{
				n: [
					"SO",
					"flag",
					"flag: Somalia"
				],
				u: "1f1f8-1f1f4",
				a: "2"
			},
			{
				n: [
					"SR",
					"flag",
					"flag: Suriname"
				],
				u: "1f1f8-1f1f7",
				a: "2"
			},
			{
				n: [
					"SS",
					"flag",
					"flag: South Sudan"
				],
				u: "1f1f8-1f1f8",
				a: "2"
			},
			{
				n: [
					"ST",
					"flag",
					"flag: São Tomé & Príncipe"
				],
				u: "1f1f8-1f1f9",
				a: "2"
			},
			{
				n: [
					"SV",
					"flag",
					"flag: El Salvador"
				],
				u: "1f1f8-1f1fb",
				a: "2"
			},
			{
				n: [
					"SX",
					"flag",
					"flag: Sint Maarten"
				],
				u: "1f1f8-1f1fd",
				a: "2"
			},
			{
				n: [
					"SY",
					"flag",
					"flag: Syria"
				],
				u: "1f1f8-1f1fe",
				a: "2"
			},
			{
				n: [
					"SZ",
					"flag",
					"flag: Eswatini"
				],
				u: "1f1f8-1f1ff",
				a: "2"
			},
			{
				n: [
					"TA",
					"flag",
					"flag: Tristan da Cunha"
				],
				u: "1f1f9-1f1e6",
				a: "2"
			},
			{
				n: [
					"TC",
					"flag",
					"flag: Turks & Caicos Islands"
				],
				u: "1f1f9-1f1e8",
				a: "2"
			},
			{
				n: [
					"TD",
					"flag",
					"flag: Chad"
				],
				u: "1f1f9-1f1e9",
				a: "2"
			},
			{
				n: [
					"TF",
					"flag",
					"flag: French Southern Territories"
				],
				u: "1f1f9-1f1eb",
				a: "2"
			},
			{
				n: [
					"TG",
					"flag",
					"flag: Togo"
				],
				u: "1f1f9-1f1ec",
				a: "2"
			},
			{
				n: [
					"TH",
					"flag",
					"flag: Thailand"
				],
				u: "1f1f9-1f1ed",
				a: "2"
			},
			{
				n: [
					"TJ",
					"flag",
					"flag: Tajikistan"
				],
				u: "1f1f9-1f1ef",
				a: "2"
			},
			{
				n: [
					"TK",
					"flag",
					"flag: Tokelau"
				],
				u: "1f1f9-1f1f0",
				a: "2"
			},
			{
				n: [
					"TL",
					"flag",
					"flag: Timor Leste"
				],
				u: "1f1f9-1f1f1",
				a: "2"
			},
			{
				n: [
					"TM",
					"flag",
					"flag: Turkmenistan"
				],
				u: "1f1f9-1f1f2",
				a: "2"
			},
			{
				n: [
					"TN",
					"flag",
					"flag: Tunisia"
				],
				u: "1f1f9-1f1f3",
				a: "2"
			},
			{
				n: [
					"TO",
					"flag",
					"flag: Tonga"
				],
				u: "1f1f9-1f1f4",
				a: "2"
			},
			{
				n: [
					"TR",
					"flag",
					"flag: Türkiye"
				],
				u: "1f1f9-1f1f7",
				a: "2"
			},
			{
				n: [
					"TT",
					"flag",
					"flag: Trinidad & Tobago"
				],
				u: "1f1f9-1f1f9",
				a: "2"
			},
			{
				n: [
					"TV",
					"flag",
					"flag: Tuvalu"
				],
				u: "1f1f9-1f1fb",
				a: "2"
			},
			{
				n: [
					"TW",
					"flag",
					"flag: Taiwan"
				],
				u: "1f1f9-1f1fc",
				a: "2"
			},
			{
				n: [
					"TZ",
					"flag",
					"flag: Tanzania"
				],
				u: "1f1f9-1f1ff",
				a: "2"
			},
			{
				n: [
					"UA",
					"flag",
					"flag: Ukraine"
				],
				u: "1f1fa-1f1e6",
				a: "2"
			},
			{
				n: [
					"UG",
					"flag",
					"flag: Uganda"
				],
				u: "1f1fa-1f1ec",
				a: "2"
			},
			{
				n: [
					"UM",
					"flag",
					"flag: U.S. Outlying Islands"
				],
				u: "1f1fa-1f1f2",
				a: "2"
			},
			{
				n: [
					"UN",
					"flag",
					"flag: United Nations"
				],
				u: "1f1fa-1f1f3",
				a: "4"
			},
			{
				n: [
					"US",
					"flag",
					"flag: United States"
				],
				u: "1f1fa-1f1f8",
				a: "0.6"
			},
			{
				n: [
					"UY",
					"flag",
					"flag: Uruguay"
				],
				u: "1f1fa-1f1fe",
				a: "2"
			},
			{
				n: [
					"UZ",
					"flag",
					"flag: Uzbekistan"
				],
				u: "1f1fa-1f1ff",
				a: "2"
			},
			{
				n: [
					"VA",
					"flag",
					"flag: Vatican City"
				],
				u: "1f1fb-1f1e6",
				a: "2"
			},
			{
				n: [
					"VC",
					"flag",
					"flag: St. Vincent & Grenadines"
				],
				u: "1f1fb-1f1e8",
				a: "2"
			},
			{
				n: [
					"VE",
					"flag",
					"flag: Venezuela"
				],
				u: "1f1fb-1f1ea",
				a: "2"
			},
			{
				n: [
					"VG",
					"flag",
					"flag: British Virgin Islands"
				],
				u: "1f1fb-1f1ec",
				a: "2"
			},
			{
				n: [
					"VI",
					"flag",
					"flag: U.S. Virgin Islands"
				],
				u: "1f1fb-1f1ee",
				a: "2"
			},
			{
				n: [
					"VN",
					"flag",
					"flag: Vietnam"
				],
				u: "1f1fb-1f1f3",
				a: "2"
			},
			{
				n: [
					"VU",
					"flag",
					"flag: Vanuatu"
				],
				u: "1f1fb-1f1fa",
				a: "2"
			},
			{
				n: [
					"WF",
					"flag",
					"flag: Wallis & Futuna"
				],
				u: "1f1fc-1f1eb",
				a: "2"
			},
			{
				n: [
					"WS",
					"flag",
					"flag: Samoa"
				],
				u: "1f1fc-1f1f8",
				a: "2"
			},
			{
				n: [
					"XK",
					"flag",
					"flag: Kosovo"
				],
				u: "1f1fd-1f1f0",
				a: "2"
			},
			{
				n: [
					"YE",
					"flag",
					"flag: Yemen"
				],
				u: "1f1fe-1f1ea",
				a: "2"
			},
			{
				n: [
					"YT",
					"flag",
					"flag: Mayotte"
				],
				u: "1f1fe-1f1f9",
				a: "2"
			},
			{
				n: [
					"ZA",
					"flag",
					"flag: South Africa"
				],
				u: "1f1ff-1f1e6",
				a: "2"
			},
			{
				n: [
					"ZM",
					"flag",
					"flag: Zambia"
				],
				u: "1f1ff-1f1f2",
				a: "2"
			},
			{
				n: [
					"ZW",
					"flag",
					"flag: Zimbabwe"
				],
				u: "1f1ff-1f1fc",
				a: "2"
			},
			{
				n: [
					"flag",
					"gbeng",
					"flag: England"
				],
				u: "1f3f4-e0067-e0062-e0065-e006e-e0067-e007f",
				a: "5"
			},
			{
				n: [
					"flag",
					"gbsct",
					"flag: Scotland"
				],
				u: "1f3f4-e0067-e0062-e0073-e0063-e0074-e007f",
				a: "5"
			},
			{
				n: [
					"flag",
					"gbwls",
					"flag: Wales"
				],
				u: "1f3f4-e0067-e0062-e0077-e006c-e0073-e007f",
				a: "5"
			}
		]
	}
};
var SUGGESTED_LS_KEY = "epr_suggested";
function getSuggested(mode) {
	try {
		var _window, _window$localStorage$, _window2;
		if (!((_window = window) != null && _window.localStorage)) return [];
		var recent = JSON.parse((_window$localStorage$ = (_window2 = window) == null ? void 0 : _window2.localStorage.getItem(SUGGESTED_LS_KEY)) != null ? _window$localStorage$ : "[]");
		if (mode === SuggestionMode.FREQUENT) return recent.sort(function(a, b) {
			return b.count - a.count;
		});
		return recent;
	} catch (_unused) {
		return [];
	}
}
function setSuggested(emoji, skinTone) {
	var recent = getSuggested();
	var unified = emojiUnified$1(emoji, skinTone);
	var originalUnified = emojiUnified$1(emoji);
	var existing = recent.find(function(_ref) {
		return _ref.unified === unified;
	});
	var nextList;
	if (existing) nextList = [existing].concat(recent.filter(function(i) {
		return i !== existing;
	}));
	else {
		existing = {
			unified,
			original: originalUnified,
			count: 0
		};
		nextList = [existing].concat(recent);
	}
	existing.count++;
	nextList.length = Math.min(nextList.length, 14);
	try {
		var _window3;
		(_window3 = window) == null || _window3.localStorage.setItem(SUGGESTED_LS_KEY, JSON.stringify(nextList));
	} catch (_unused2) {}
}
function emojiNames$1(emoji) {
	var _emoji$EmojiPropertie;
	return (_emoji$EmojiPropertie = emoji[EmojiProperties.name]) != null ? _emoji$EmojiPropertie : [];
}
function emojiName$1(emoji) {
	if (!emoji) return "";
	var names = emojiNames$1(emoji);
	return names[names.length - 1];
}
function unifiedWithoutSkinTone$1(unified) {
	var splat = unified.split("-");
	if (skinTonesMapped[splat.splice(1, 1)[0]]) return splat.join("-");
	return unified;
}
function emojiUnified$1(emoji, skinTone) {
	var _emojiVariationUnifie;
	var unified = emoji[EmojiProperties.unified];
	if (!skinTone || !emojiHasVariations$1(emoji)) return unified;
	return (_emojiVariationUnifie = emojiVariationUnified$1(emoji, skinTone)) != null ? _emojiVariationUnifie : unified;
}
function useGetEmojisByCategory() {
	var suggestedEmojisModeConfig = useSuggestedEmojisModeConfig();
	var suggestedUpdated = useUpdateSuggested()[0];
	var suggested = import_react.useMemo(function() {
		var _getSuggested;
		return ((_getSuggested = getSuggested(suggestedEmojisModeConfig)) != null ? _getSuggested : []).map(function(s) {
			return emojiByUnified(s.unified);
		}).filter(Boolean);
	}, [suggestedUpdated, suggestedEmojisModeConfig]);
	return function getEmojisByCategory(category) {
		var _emojis$emojis$catego;
		if (category === Categories.SUGGESTED) return suggested;
		return (_emojis$emojis$catego = defaultEmojiData.emojis[category]) != null ? _emojis$emojis$catego : [];
	};
}
function emojiVariations$1(emoji) {
	var _emoji$EmojiPropertie2;
	return (_emoji$EmojiPropertie2 = emoji[EmojiProperties.variations]) != null ? _emoji$EmojiPropertie2 : [];
}
function emojiHasVariations$1(emoji) {
	return emojiVariations$1(emoji).length > 0;
}
function emojiVariationUnified$1(emoji, skinTone) {
	return skinTone ? emojiVariations$1(emoji).find(function(variation) {
		return variation.includes(skinTone);
	}) : emojiUnified$1(emoji);
}
function emojiByUnified(unified) {
	if (!unified) return;
	if (allEmojisByUnified[unified]) return allEmojisByUnified[unified];
	return allEmojisByUnified[unifiedWithoutSkinTone$1(unified)];
}
var allEmojis = /*#__PURE__*/ Object.values(defaultEmojiData.emojis).flat();
var allEmojisByUnified = {};
allEmojis.reduce(function(allEmojis, Emoji) {
	allEmojis[emojiUnified$1(Emoji)] = Emoji;
	if (emojiHasVariations$1(Emoji)) emojiVariations$1(Emoji).forEach(function(variation) {
		allEmojis[variation] = Emoji;
	});
	return allEmojis;
}, allEmojisByUnified);
function activeVariationFromUnified$1(unified) {
	var suspectedSkinTone = unified.split("-")[1];
	return skinToneVariations.includes(suspectedSkinTone) ? suspectedSkinTone : null;
}
var PickerDataContext = /*#__PURE__*/ import_react.createContext({
	emojiData: {},
	allEmojis: [],
	allEmojisByUnified: {},
	searchIndex: {},
	emojiByUnified,
	activeVariationFromUnified: function activeVariationFromUnified() {
		return null;
	}
});
function PickerDataProvider(_ref) {
	var children = _ref.children;
	var _usePickerConfig = usePickerConfig(), customEmojis = _usePickerConfig.customEmojis, genericEmojiData = _usePickerConfig.emojiData;
	var data = import_react.useMemo(function() {
		var newData = JSON.parse(JSON.stringify(genericEmojiData || defaultEmojiData));
		if (customEmojis && customEmojis.length > 0) newData.emojis[Categories.CUSTOM] = customEmojis.map(customToRegularEmoji);
		var emojis = newData.emojis || {};
		var allEmojis = Object.values(emojis).flat();
		var allEmojisByUnified = {};
		var searchIndex = {};
		allEmojis.forEach(function(emoji) {
			var unified = emoji[EmojiProperties.unified];
			allEmojisByUnified[unified] = emoji;
			if (emoji[EmojiProperties.variations]) {
				var _emoji$Keys$variation;
				(_emoji$Keys$variation = emoji[EmojiProperties.variations]) == null || _emoji$Keys$variation.forEach(function(variation) {
					allEmojisByUnified[variation] = emoji;
				});
			}
			(emoji[EmojiProperties.name] || []).join("").toLowerCase().split("").forEach(function(_char) {
				var _searchIndex$_char;
				searchIndex[_char] = (_searchIndex$_char = searchIndex[_char]) != null ? _searchIndex$_char : {};
				searchIndex[_char][unified] = emoji;
			});
		});
		return {
			emojiData: newData,
			allEmojis,
			allEmojisByUnified,
			searchIndex
		};
	}, [genericEmojiData, customEmojis]);
	var emojiByUnified = import_react.useCallback(function(unified) {
		var _data$allEmojisByUnif;
		if (!unified) return void 0;
		return (_data$allEmojisByUnif = data.allEmojisByUnified[unified]) != null ? _data$allEmojisByUnif : data.allEmojisByUnified[unifiedWithoutSkinTone(unified)];
	}, [data.allEmojisByUnified]);
	return import_react.createElement(PickerDataContext.Provider, { value: _extends({}, data, {
		emojiByUnified,
		activeVariationFromUnified
	}) }, children);
}
function usePickerDataContext() {
	return import_react.useContext(PickerDataContext);
}
function useGetEmojisByCategory$1() {
	var _usePickerDataContext = usePickerDataContext(), emojiData = _usePickerDataContext.emojiData, emojiByUnified = _usePickerDataContext.emojiByUnified;
	var suggestedEmojisModeConfig = useSuggestedEmojisModeConfig();
	var suggestedUpdated = useUpdateSuggested()[0];
	var suggested = import_react.useMemo(function() {
		var _getSuggested;
		return ((_getSuggested = getSuggested(suggestedEmojisModeConfig)) != null ? _getSuggested : []).map(function(s) {
			var _extends2;
			var emoji = emojiByUnified(s.unified);
			if (!emoji) return void 0;
			return _extends({}, emoji, (_extends2 = {}, _extends2[EmojiProperties.unified] = s.unified, _extends2));
		}).filter(Boolean);
	}, [
		suggestedUpdated,
		suggestedEmojisModeConfig,
		emojiByUnified
	]);
	return function getEmojisByCategory(category) {
		var _emojiData$emojis$cat, _emojiData$emojis;
		if (category === Categories.SUGGESTED) return suggested;
		return (_emojiData$emojis$cat = (_emojiData$emojis = emojiData.emojis) == null ? void 0 : _emojiData$emojis[category]) != null ? _emojiData$emojis$cat : [];
	};
}
function customToRegularEmoji(emoji) {
	var _ref2;
	return _ref2 = {}, _ref2[EmojiProperties.name] = emoji.names.map(function(name) {
		return name.toLowerCase();
	}), _ref2[EmojiProperties.unified] = emoji.id.toLowerCase(), _ref2[EmojiProperties.added_in] = "0", _ref2[EmojiProperties.imgUrl] = emoji.imgUrl, _ref2;
}
function useIsUnicodeHidden() {
	var unicodeToHide = useUnicodeToHide();
	return function(emojiUnified) {
		return unicodeToHide.has(emojiUnified);
	};
}
function useDisallowedEmojis() {
	var DisallowedEmojisRef = (0, import_react.useRef)({});
	var emojiVersionConfig = useEmojiVersionConfig();
	var allEmojis = usePickerDataContext().allEmojis;
	return (0, import_react.useMemo)(function() {
		var emojiVersion = parseFloat("" + emojiVersionConfig);
		if (!emojiVersionConfig || Number.isNaN(emojiVersion)) return DisallowedEmojisRef.current;
		return allEmojis.reduce(function(disallowedEmojis, emoji) {
			if (addedInNewerVersion(emoji, emojiVersion)) disallowedEmojis[emojiUnified(emoji)] = true;
			return disallowedEmojis;
		}, DisallowedEmojisRef.current);
	}, [emojiVersionConfig, allEmojis]);
}
function useIsEmojiDisallowed() {
	var disallowedEmojis = useDisallowedEmojis();
	var isUnicodeHidden = useIsUnicodeHidden();
	return function isEmojiDisallowed(emoji) {
		var unified = unifiedWithoutSkinTone(emojiUnified(emoji));
		return Boolean(disallowedEmojis[unified] || isUnicodeHidden(unified));
	};
}
function addedInNewerVersion(emoji, supportedLevel) {
	return addedIn(emoji) > supportedLevel;
}
function useMarkInitialLoad(dispatch) {
	(0, import_react.useEffect)(function() {
		dispatch(true);
	}, [dispatch]);
}
function PickerContextProvider(_ref) {
	var children = _ref.children;
	var disallowedEmojis = useDisallowedEmojis();
	var defaultSkinTone = useDefaultSkinToneConfig();
	var reactionsDefaultOpen = useReactionsOpenConfig();
	var searchIndex = usePickerDataContext().searchIndex;
	var filterRef = (0, import_react.useRef)(searchIndex);
	(0, import_react.useEffect)(function() {
		filterRef.current = searchIndex;
	}, [searchIndex]);
	var disallowClickRef = (0, import_react.useRef)(false);
	var disallowMouseRef = (0, import_react.useRef)(false);
	var disallowedEmojisRef = (0, import_react.useRef)(disallowedEmojis);
	var suggestedUpdateState = useDebouncedState(Date.now(), 200);
	var searchTerm = useDebouncedState("", 100);
	var skinToneFanOpenState = (0, import_react.useState)(false);
	var activeSkinTone = (0, import_react.useState)(defaultSkinTone);
	var activeCategoryState = (0, import_react.useState)(null);
	var emojisThatFailedToLoadState = (0, import_react.useState)(/* @__PURE__ */ new Set());
	var emojiVariationPickerState = (0, import_react.useState)(null);
	var reactionsModeState = (0, import_react.useState)(reactionsDefaultOpen);
	var _useState = (0, import_react.useState)(false), isPastInitialLoad = _useState[0], setIsPastInitialLoad = _useState[1];
	var visibleCategoriesState = (0, import_react.useState)([]);
	var emojiSizeState = (0, import_react.useState)(null);
	useMarkInitialLoad(setIsPastInitialLoad);
	return (0, import_react.createElement)(PickerContext.Provider, { value: {
		activeCategoryState,
		activeSkinTone,
		disallowClickRef,
		disallowMouseRef,
		disallowedEmojisRef,
		emojiVariationPickerState,
		emojisThatFailedToLoadState,
		filterRef,
		isPastInitialLoad,
		searchTerm,
		skinToneFanOpenState,
		suggestedUpdateState,
		reactionsModeState,
		visibleCategoriesState,
		emojiSizeState
	} }, children);
}
var PickerContext = /*#__PURE__*/ (0, import_react.createContext)({
	activeCategoryState: [null, function() {}],
	activeSkinTone: [SkinTones.NEUTRAL, function() {}],
	disallowClickRef: { current: false },
	disallowMouseRef: { current: false },
	disallowedEmojisRef: { current: {} },
	emojiVariationPickerState: [null, function() {}],
	emojisThatFailedToLoadState: [/*#__PURE__*/ new Set(), function() {}],
	filterRef: { current: {} },
	isPastInitialLoad: true,
	searchTerm: ["", function() {
		return new Promise(function() {});
	}],
	skinToneFanOpenState: [false, function() {}],
	suggestedUpdateState: [/*#__PURE__*/ Date.now(), function() {}],
	reactionsModeState: [false, function() {}],
	visibleCategoriesState: [[], function() {
		return [];
	}],
	emojiSizeState: [null, function() {}]
});
function useFilterRef() {
	return (0, import_react.useContext)(PickerContext).filterRef;
}
function useDisallowClickRef() {
	return (0, import_react.useContext)(PickerContext).disallowClickRef;
}
function useDisallowMouseRef() {
	return (0, import_react.useContext)(PickerContext).disallowMouseRef;
}
function useReactionsModeState() {
	return (0, import_react.useContext)(PickerContext).reactionsModeState;
}
function useSearchTermState() {
	return (0, import_react.useContext)(PickerContext).searchTerm;
}
function useActiveSkinToneState() {
	return (0, import_react.useContext)(PickerContext).activeSkinTone;
}
function useEmojisThatFailedToLoadState() {
	return (0, import_react.useContext)(PickerContext).emojisThatFailedToLoadState;
}
function useEmojiVariationPickerState() {
	return (0, import_react.useContext)(PickerContext).emojiVariationPickerState;
}
function useSkinToneFanOpenState() {
	return (0, import_react.useContext)(PickerContext).skinToneFanOpenState;
}
function useVisibleCategoriesState() {
	return (0, import_react.useContext)(PickerContext).visibleCategoriesState;
}
function useEmojiSizeState() {
	return (0, import_react.useContext)(PickerContext).emojiSizeState;
}
function useUpdateSuggested() {
	var suggestedUpdateState = (0, import_react.useContext)(PickerContext).suggestedUpdateState;
	var suggestedUpdated = suggestedUpdateState[0], setsuggestedUpdate = suggestedUpdateState[1];
	return [suggestedUpdated, function updateSuggested() {
		setsuggestedUpdate(Date.now());
	}];
}
var MutableConfigContext = /*#__PURE__*/ import_react.createContext({});
function useMutableConfig() {
	return import_react.useContext(MutableConfigContext);
}
function useDefineMutableConfig(config) {
	var MutableConfigRef = import_react.useRef({
		onEmojiClick: config.onEmojiClick || emptyFunc,
		onReactionClick: config.onReactionClick || config.onEmojiClick,
		onSkinToneChange: config.onSkinToneChange || emptyFunc
	});
	import_react.useEffect(function() {
		MutableConfigRef.current.onEmojiClick = config.onEmojiClick || emptyFunc;
		MutableConfigRef.current.onReactionClick = config.onReactionClick || config.onEmojiClick;
	}, [config.onEmojiClick, config.onReactionClick]);
	import_react.useEffect(function() {
		MutableConfigRef.current.onSkinToneChange = config.onSkinToneChange || emptyFunc;
	}, [config.onSkinToneChange]);
	return MutableConfigRef;
}
function emptyFunc() {}
var MOUSE_EVENT_SOURCE;
(function(MOUSE_EVENT_SOURCE) {
	MOUSE_EVENT_SOURCE["REACTIONS"] = "reactions";
	MOUSE_EVENT_SOURCE["PICKER"] = "picker";
})(MOUSE_EVENT_SOURCE || (MOUSE_EVENT_SOURCE = {}));
function useSearchPlaceHolderConfig() {
	var _find;
	var _usePickerConfig = usePickerConfig();
	return (_find = [_usePickerConfig.searchPlaceHolder, _usePickerConfig.searchPlaceholder].find(function(p) {
		return p !== DEFAULT_SEARCH_PLACEHOLDER;
	})) != null ? _find : DEFAULT_SEARCH_PLACEHOLDER;
}
function useSearchClearButtonLabelConfig() {
	var searchClearButtonLabel = usePickerConfig().searchClearButtonLabel;
	return searchClearButtonLabel != null ? searchClearButtonLabel : DEFAULT_SEARCH_CLEAR_BUTTON_LABEL;
}
function useDefaultSkinToneConfig() {
	return usePickerConfig().defaultSkinTone;
}
function useAllowExpandReactions() {
	return usePickerConfig().allowExpandReactions;
}
function useSkinTonesDisabledConfig() {
	return usePickerConfig().skinTonesDisabled;
}
function useEmojiStyleConfig() {
	return usePickerConfig().emojiStyle;
}
function useAutoFocusSearchConfig() {
	return usePickerConfig().autoFocusSearch;
}
function useCategoriesConfig() {
	return usePickerConfig().categories;
}
function useCategoryIconsConfig() {
	return usePickerConfig().categoryIcons;
}
function useCustomEmojisConfig() {
	return usePickerConfig().customEmojis;
}
function useOpenConfig() {
	return usePickerConfig().open;
}
function useOnEmojiClickConfig(mouseEventSource) {
	var current = useMutableConfig().current;
	var setReactionsOpen = useReactionsModeState()[1];
	var handler = current.onEmojiClick || function() {};
	var onReactionClick = current.onReactionClick;
	if (mouseEventSource === MOUSE_EVENT_SOURCE.REACTIONS && onReactionClick) return function() {
		for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
		return onReactionClick.apply(void 0, args.concat([{ collapseToReactions: function collapseToReactions() {
			setReactionsOpen(function(o) {
				return o;
			});
		} }]));
	};
	return function() {
		for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
		handler.apply(void 0, args.concat([{ collapseToReactions: function collapseToReactions() {
			setReactionsOpen(true);
		} }]));
	};
}
function useOnSkinToneChangeConfig() {
	return useMutableConfig().current.onSkinToneChange || function() {};
}
function usePreviewConfig() {
	return usePickerConfig().previewConfig;
}
function useThemeConfig() {
	return usePickerConfig().theme;
}
function useSuggestedEmojisModeConfig() {
	return usePickerConfig().suggestedEmojisMode;
}
function useLazyLoadEmojisConfig() {
	return usePickerConfig().lazyLoadEmojis;
}
function useClassNameConfig() {
	return usePickerConfig().className;
}
function useStyleConfig() {
	var _usePickerConfig15 = usePickerConfig(), height = _usePickerConfig15.height, width = _usePickerConfig15.width, style = _usePickerConfig15.style;
	return _extends({
		height: getDimension(height),
		width: getDimension(width)
	}, style);
}
function useReactionsOpenConfig() {
	return usePickerConfig().reactionsDefaultOpen;
}
function useEmojiVersionConfig() {
	return usePickerConfig().emojiVersion;
}
function useSearchDisabledConfig() {
	return usePickerConfig().searchDisabled;
}
function useSkinTonePickerLocationConfig() {
	return usePickerConfig().skinTonePickerLocation;
}
function useUnicodeToHide() {
	return usePickerConfig().unicodeToHide;
}
function useReactionsConfig() {
	return usePickerConfig().reactions;
}
function useGetEmojiUrlConfig() {
	return usePickerConfig().getEmojiUrl;
}
function getDimension(dimensionConfig) {
	return typeof dimensionConfig === "number" ? dimensionConfig + "px" : dimensionConfig;
}
function useSearchResultsConfig(searchResultsCount) {
	var hasResults = searchResultsCount > 0;
	var isPlural = searchResultsCount > 1;
	if (hasResults) return isPlural ? SEARCH_RESULTS_MULTIPLE_RESULTS_FOUND.replace("%n", searchResultsCount.toString()) : SEARCH_RESULTS_ONE_RESULT_FOUND;
	return SEARCH_RESULTS_NO_RESULTS_FOUND;
}
function useIsSearchMode() {
	return !!useSearchTermState()[0];
}
function focusElement(element) {
	if (!element) return;
	requestAnimationFrame(function() {
		element.focus();
	});
}
function focusPrevElementSibling(element) {
	if (!element) return;
	var prev = element.previousElementSibling;
	focusElement(prev);
}
function focusNextElementSibling(element) {
	if (!element) return;
	var next = element.nextElementSibling;
	focusElement(next);
}
function focusFirstElementChild(element) {
	if (!element) return;
	var first = element.firstElementChild;
	focusElement(first);
}
function getActiveElement() {
	return document.activeElement;
}
function ElementRefContextProvider(_ref) {
	var children = _ref.children;
	var PickerMainRef = (0, import_react.useRef)(null);
	var AnchoredEmojiRef = (0, import_react.useRef)(null);
	var BodyRef = (0, import_react.useRef)(null);
	var EmojiListRef = (0, import_react.useRef)(null);
	var SearchInputRef = (0, import_react.useRef)(null);
	var SkinTonePickerRef = (0, import_react.useRef)(null);
	var CategoryNavigationRef = (0, import_react.useRef)(null);
	var VariationPickerRef = (0, import_react.useRef)(null);
	var ReactionsRef = (0, import_react.useRef)(null);
	return (0, import_react.createElement)(ElementRefContext.Provider, { value: {
		AnchoredEmojiRef,
		BodyRef,
		EmojiListRef,
		CategoryNavigationRef,
		PickerMainRef,
		SearchInputRef,
		SkinTonePickerRef,
		VariationPickerRef,
		ReactionsRef
	} }, children);
}
var ElementRefContext = /*#__PURE__*/ (0, import_react.createContext)({
	AnchoredEmojiRef: /*#__PURE__*/ (0, import_react.createRef)(),
	BodyRef: /*#__PURE__*/ (0, import_react.createRef)(),
	CategoryNavigationRef: /*#__PURE__*/ (0, import_react.createRef)(),
	EmojiListRef: /*#__PURE__*/ (0, import_react.createRef)(),
	PickerMainRef: /*#__PURE__*/ (0, import_react.createRef)(),
	SearchInputRef: /*#__PURE__*/ (0, import_react.createRef)(),
	SkinTonePickerRef: /*#__PURE__*/ (0, import_react.createRef)(),
	VariationPickerRef: /*#__PURE__*/ (0, import_react.createRef)(),
	ReactionsRef: /*#__PURE__*/ (0, import_react.createRef)()
});
function useElementRef() {
	return (0, import_react.useContext)(ElementRefContext);
}
function useEmojiListRef() {
	return useElementRef()["EmojiListRef"];
}
function usePickerMainRef() {
	return useElementRef()["PickerMainRef"];
}
function useAnchoredEmojiRef() {
	return useElementRef()["AnchoredEmojiRef"];
}
function useSetAnchoredEmojiRef() {
	var AnchoredEmojiRef = useAnchoredEmojiRef();
	return function(target) {
		if (target === null && AnchoredEmojiRef.current !== null) focusElement(AnchoredEmojiRef.current);
		AnchoredEmojiRef.current = target;
	};
}
function useBodyRef() {
	return useElementRef()["BodyRef"];
}
function useReactionsRef() {
	return useElementRef()["ReactionsRef"];
}
function useSearchInputRef() {
	return useElementRef()["SearchInputRef"];
}
function useSkinTonePickerRef() {
	return useElementRef()["SkinTonePickerRef"];
}
function useCategoryNavigationRef() {
	return useElementRef()["CategoryNavigationRef"];
}
function useVariationPickerRef() {
	return useElementRef()["VariationPickerRef"];
}
function scrollTo(root, top) {
	if (top === void 0) top = 0;
	var $eprBody = queryScrollBody(root);
	if (!$eprBody) return;
	requestAnimationFrame(function() {
		$eprBody.scrollTop = top;
	});
}
function scrollBy(root, by) {
	var $eprBody = queryScrollBody(root);
	if (!$eprBody) return;
	requestAnimationFrame(function() {
		$eprBody.scrollTop = $eprBody.scrollTop + by;
	});
}
function useScrollTo() {
	var BodyRef = useBodyRef();
	return (0, import_react.useCallback)(function(top) {
		requestAnimationFrame(function() {
			if (BodyRef.current) BodyRef.current.scrollTop = top;
		});
	}, [BodyRef]);
}
function scrollEmojiAboveLabel(emoji) {
	if (!emoji || !isEmojiBehindLabel(emoji)) return;
	if (emoji.closest(asSelectors(ClassNames.variationPicker))) return;
	var scrollBody = closestScrollBody(emoji);
	var by = emojiDistanceFromScrollTop(emoji);
	scrollBy(scrollBody, -(categoryLabelHeight(closestCategory(emoji)) - by));
}
function focusFirstVisibleEmoji(parent) {
	var emoji = firstVisibleEmoji(parent);
	focusElement(emoji);
	scrollEmojiAboveLabel(emoji);
}
function focusAndClickFirstVisibleEmoji(parent) {
	var firstEmoji = firstVisibleEmoji(parent);
	focusElement(firstEmoji);
	firstEmoji?.click();
}
function focusLastVisibleEmoji(parent) {
	focusElement(lastVisibleEmoji(parent));
}
function focusNextVisibleEmoji(element) {
	if (!element) return;
	var next = nextVisibleEmoji(element);
	if (!next) return focusFirstVisibleEmoji(nextCategory(element));
	focusElement(next);
	scrollEmojiAboveLabel(next);
}
function focusPrevVisibleEmoji(element) {
	if (!element) return;
	var prev = prevVisibleEmoji(element);
	if (!prev) return focusLastVisibleEmoji(prevCategory(element));
	focusElement(prev);
	scrollEmojiAboveLabel(prev);
}
function focusVisibleEmojiOneRowUp(element, exitUp) {
	if (!element) return;
	var prev = visibleEmojiOneRowUp(element);
	if (!prev) return exitUp();
	focusElement(prev);
	scrollEmojiAboveLabel(prev);
}
function focusVisibleEmojiOneRowDown(element) {
	if (!element) return;
	return focusElement(visibleEmojiOneRowDown(element));
}
function visibleEmojiOneRowUp(element) {
	if (!element) return null;
	var categoryContent = closestCategoryContent(element);
	var category = closestCategory(categoryContent);
	var countInRow = elementCountInRow(categoryContent, element);
	var emojisInCurrentCategory = allVisibleEmojis(category);
	var currentEmojiIndex = emojisInCurrentCategory.indexOf(element);
	var indexInRow = currentEmojiIndex % countInRow;
	if (currentEmojiIndex === -1) return null;
	if (emojisInCurrentCategory[currentEmojiIndex - countInRow]) return emojisInCurrentCategory[currentEmojiIndex - countInRow];
	var prevVisibleCategory = prevCategory(category);
	if (!prevVisibleCategory) return null;
	var allPrevEmojis = allVisibleEmojis(prevVisibleCategory);
	if (indexInRow > allPrevEmojis.length % countInRow - 1) return allPrevEmojis.at(-1);
	for (var i = allPrevEmojis.length - 1; i >= 0; i--) if (i % countInRow === indexInRow) return allPrevEmojis[i];
	return allPrevEmojis.at(-1);
}
function visibleEmojiOneRowDown(element) {
	var _emojisInNextCategory;
	if (!element) return null;
	var categoryContent = closestCategoryContent(element);
	var category = closestCategory(categoryContent);
	var countInRow = elementCountInRow(categoryContent, element);
	var emojisInCurrentCategory = allVisibleEmojis(category);
	var currentEmojiIndex = emojisInCurrentCategory.indexOf(element);
	if (currentEmojiIndex === -1) return null;
	if (emojisInCurrentCategory[currentEmojiIndex + (countInRow - currentEmojiIndex % countInRow - 1) + 1]) {
		for (var p = currentEmojiIndex + countInRow; p % countInRow >= 0; p--) if (emojisInCurrentCategory[p]) return emojisInCurrentCategory[p];
	}
	var indexInRow = currentEmojiIndex % countInRow;
	var emojisInNextCategory = allVisibleEmojis(nextCategory(category));
	if (emojisInNextCategory[indexInRow]) return emojisInNextCategory[indexInRow];
	return (_emojisInNextCategory = emojisInNextCategory.at(0)) != null ? _emojisInNextCategory : null;
}
function useCloseAllOpenToggles() {
	var _useEmojiVariationPic = useEmojiVariationPickerState(), variationPicker = _useEmojiVariationPic[0], setVariationPicker = _useEmojiVariationPic[1];
	var _useSkinToneFanOpenSt = useSkinToneFanOpenState(), skinToneFanOpen = _useSkinToneFanOpenSt[0], setSkinToneFanOpen = _useSkinToneFanOpenSt[1];
	return (0, import_react.useCallback)(function() {
		if (variationPicker) setVariationPicker(null);
		if (skinToneFanOpen) setSkinToneFanOpen(false);
	}, [
		variationPicker,
		skinToneFanOpen,
		setVariationPicker,
		setSkinToneFanOpen
	]);
}
function useHasOpenToggles() {
	var variationPicker = useEmojiVariationPickerState()[0];
	var skinToneFanOpen = useSkinToneFanOpenState()[0];
	return function hasOpenToggles() {
		return !!variationPicker || skinToneFanOpen;
	};
}
function useDisallowMouseMove() {
	var DisallowMouseRef = useDisallowMouseRef();
	return function disallowMouseMove() {
		DisallowMouseRef.current = true;
	};
}
function useAllowMouseMove() {
	var DisallowMouseRef = useDisallowMouseRef();
	return function allowMouseMove() {
		DisallowMouseRef.current = false;
	};
}
function useIsMouseDisallowed() {
	var DisallowMouseRef = useDisallowMouseRef();
	return function isMouseDisallowed() {
		return DisallowMouseRef.current;
	};
}
function useOnMouseMove() {
	var BodyRef = useBodyRef();
	var allowMouseMove = useAllowMouseMove();
	var isMouseDisallowed = useIsMouseDisallowed();
	(0, import_react.useEffect)(function() {
		var bodyRef = BodyRef.current;
		bodyRef?.addEventListener("mousemove", onMouseMove, { passive: true });
		function onMouseMove() {
			if (isMouseDisallowed()) allowMouseMove();
		}
		return function() {
			bodyRef?.removeEventListener("mousemove", onMouseMove);
		};
	}, [
		BodyRef,
		allowMouseMove,
		isMouseDisallowed
	]);
}
function useFocusSearchInput() {
	var SearchInputRef = useSearchInputRef();
	return (0, import_react.useCallback)(function() {
		focusElement(SearchInputRef.current);
	}, [SearchInputRef]);
}
function useFocusSkinTonePicker() {
	var SkinTonePickerRef = useSkinTonePickerRef();
	return (0, import_react.useCallback)(function() {
		if (!SkinTonePickerRef.current) return;
		focusFirstElementChild(SkinTonePickerRef.current);
	}, [SkinTonePickerRef]);
}
function useFocusCategoryNavigation() {
	var CategoryNavigationRef = useCategoryNavigationRef();
	return (0, import_react.useCallback)(function() {
		if (!CategoryNavigationRef.current) return;
		focusFirstElementChild(CategoryNavigationRef.current);
	}, [CategoryNavigationRef]);
}
function useSetFilterRef() {
	var filterRef = useFilterRef();
	return function setFilter(setter) {
		if (typeof setter === "function") return setFilter(setter(filterRef.current));
		filterRef.current = setter;
	};
}
function useClearSearch() {
	var applySearch = useApplySearch();
	var SearchInputRef = useSearchInputRef();
	var focusSearchInput = useFocusSearchInput();
	return function clearSearch() {
		if (SearchInputRef.current) SearchInputRef.current.value = "";
		applySearch("");
		focusSearchInput();
	};
}
function useAppendSearch() {
	var SearchInputRef = useSearchInputRef();
	var applySearch = useApplySearch();
	return function appendSearch(str) {
		if (SearchInputRef.current) {
			SearchInputRef.current.value = "" + SearchInputRef.current.value + str;
			applySearch(getNormalizedSearchTerm(SearchInputRef.current.value));
		} else applySearch(getNormalizedSearchTerm(str));
	};
}
function useFilter() {
	var SearchInputRef = useSearchInputRef();
	var filterRef = useFilterRef();
	var setFilterRef = useSetFilterRef();
	var applySearch = useApplySearch();
	var searchTerm = useSearchTermState()[0];
	return {
		onChange,
		searchTerm,
		SearchInputRef,
		statusSearchResults: getStatusSearchResults(filterRef.current, searchTerm)
	};
	function onChange(inputValue) {
		var filter = filterRef.current;
		var nextValue = inputValue.toLowerCase();
		if (filter != null && filter[nextValue] || nextValue.length <= 1) return applySearch(nextValue);
		var longestMatch = findLongestMatch(nextValue, filter);
		if (!longestMatch) return applySearch(nextValue);
		setFilterRef(function(current) {
			var _Object$assign;
			return Object.assign(current, (_Object$assign = {}, _Object$assign[nextValue] = filterEmojiObjectByKeyword(longestMatch, nextValue), _Object$assign));
		});
		applySearch(nextValue);
	}
}
function useApplySearch() {
	var setSearchTerm = useSearchTermState()[1];
	var PickerMainRef = usePickerMainRef();
	return function applySearch(searchTerm) {
		requestAnimationFrame(function() {
			setSearchTerm(searchTerm ? searchTerm == null ? void 0 : searchTerm.toLowerCase() : searchTerm).then(function() {
				scrollTo(PickerMainRef.current, 0);
			});
		});
	};
}
function filterEmojiObjectByKeyword(emojis, keyword) {
	var filtered = {};
	for (var unified in emojis) {
		var emoji = emojis[unified];
		if (hasMatch(emoji, keyword)) filtered[unified] = emoji;
	}
	return filtered;
}
function hasMatch(emoji, keyword) {
	return emojiNames(emoji).some(function(name) {
		return name.includes(keyword);
	});
}
function useIsEmojiFiltered() {
	var filter = useFilterRef().current;
	var searchTerm = useSearchTermState()[0];
	return function(unified) {
		return isEmojiFilteredBySearchTerm(unified, filter, searchTerm);
	};
}
function isEmojiFilteredBySearchTerm(unified, filter, searchTerm) {
	var _filter$searchTerm;
	if (!filter || !searchTerm) return false;
	return !((_filter$searchTerm = filter[searchTerm]) != null && _filter$searchTerm[unified]);
}
function findLongestMatch(keyword, dict) {
	if (!dict) return null;
	if (dict[keyword]) return dict[keyword];
	var longestMatchingKey = Object.keys(dict).sort(function(a, b) {
		return b.length - a.length;
	}).find(function(key) {
		return keyword.includes(key);
	});
	if (longestMatchingKey) return dict[longestMatchingKey];
	return null;
}
function getNormalizedSearchTerm(str) {
	if (!str || typeof str !== "string") return "";
	return str.trim().toLowerCase();
}
function getStatusSearchResults(filterState, searchTerm) {
	var _Object$entries;
	if (!(filterState != null && filterState[searchTerm])) return "";
	return useSearchResultsConfig(((_Object$entries = Object.entries(filterState == null ? void 0 : filterState[searchTerm])) == null ? void 0 : _Object$entries.length) || 0);
}
function useSetVariationPicker() {
	var setAnchoredEmojiRef = useSetAnchoredEmojiRef();
	var setEmojiVariationPicker = useEmojiVariationPickerState()[1];
	return function setVariationPicker(element) {
		var emoji = emojiFromElement(element)[0];
		if (emoji) {
			setAnchoredEmojiRef(element);
			setEmojiVariationPicker(emoji);
		}
	};
}
function useIsSkinToneInSearch() {
	return useSkinTonePickerLocationConfig() === SkinTonePickerLocation.SEARCH;
}
function useIsSkinToneInPreview() {
	return useSkinTonePickerLocationConfig() === SkinTonePickerLocation.PREVIEW;
}
var KeyboardEvents;
(function(KeyboardEvents) {
	KeyboardEvents["ArrowDown"] = "ArrowDown";
	KeyboardEvents["ArrowUp"] = "ArrowUp";
	KeyboardEvents["ArrowLeft"] = "ArrowLeft";
	KeyboardEvents["ArrowRight"] = "ArrowRight";
	KeyboardEvents["Escape"] = "Escape";
	KeyboardEvents["Enter"] = "Enter";
	KeyboardEvents["Space"] = " ";
})(KeyboardEvents || (KeyboardEvents = {}));
function useKeyboardNavigation() {
	usePickerMainKeyboardEvents();
	useSearchInputKeyboardEvents();
	useSkinTonePickerKeyboardEvents();
	useCategoryNavigationKeyboardEvents();
	useBodyKeyboardEvents();
}
function usePickerMainKeyboardEvents() {
	var PickerMainRef = usePickerMainRef();
	var clearSearch = useClearSearch();
	var scrollTo = useScrollTo();
	var SearchInputRef = useSearchInputRef();
	var focusSearchInput = useFocusSearchInput();
	var hasOpenToggles = useHasOpenToggles();
	var disallowMouseMove = useDisallowMouseMove();
	var closeAllOpenToggles = useCloseAllOpenToggles();
	var onKeyDown = (0, import_react.useMemo)(function() {
		return function onKeyDown(event) {
			var key = event.key;
			disallowMouseMove();
			switch (key) {
				case KeyboardEvents.Escape:
					event.preventDefault();
					if (hasOpenToggles()) {
						closeAllOpenToggles();
						return;
					}
					clearSearch();
					scrollTo(0);
					focusSearchInput();
			}
		};
	}, [
		scrollTo,
		clearSearch,
		closeAllOpenToggles,
		focusSearchInput,
		hasOpenToggles,
		disallowMouseMove
	]);
	(0, import_react.useEffect)(function() {
		var current = PickerMainRef.current;
		if (!current) return;
		current.addEventListener("keydown", onKeyDown);
		return function() {
			current.removeEventListener("keydown", onKeyDown);
		};
	}, [
		PickerMainRef,
		SearchInputRef,
		scrollTo,
		onKeyDown
	]);
}
function useSearchInputKeyboardEvents() {
	var focusSkinTonePicker = useFocusSkinTonePicker();
	var PickerMainRef = usePickerMainRef();
	var BodyRef = useBodyRef();
	var SearchInputRef = useSearchInputRef();
	var setSkinToneFanOpenState = useSkinToneFanOpenState()[1];
	var goDownFromSearchInput = useGoDownFromSearchInput();
	var isSkinToneInSearch = useIsSkinToneInSearch();
	var onKeyDown = (0, import_react.useMemo)(function() {
		return function onKeyDown(event) {
			switch (event.key) {
				case KeyboardEvents.ArrowRight:
					if (!isSkinToneInSearch) return;
					event.preventDefault();
					setSkinToneFanOpenState(true);
					focusSkinTonePicker();
					break;
				case KeyboardEvents.ArrowDown:
					event.preventDefault();
					goDownFromSearchInput();
					break;
				case KeyboardEvents.Enter:
					event.preventDefault();
					focusAndClickFirstVisibleEmoji(BodyRef.current);
			}
		};
	}, [
		focusSkinTonePicker,
		goDownFromSearchInput,
		setSkinToneFanOpenState,
		BodyRef,
		isSkinToneInSearch
	]);
	(0, import_react.useEffect)(function() {
		var current = SearchInputRef.current;
		if (!current) return;
		current.addEventListener("keydown", onKeyDown);
		return function() {
			current.removeEventListener("keydown", onKeyDown);
		};
	}, [
		PickerMainRef,
		SearchInputRef,
		onKeyDown
	]);
}
function useSkinTonePickerKeyboardEvents() {
	var SkinTonePickerRef = useSkinTonePickerRef();
	var focusSearchInput = useFocusSearchInput();
	var SearchInputRef = useSearchInputRef();
	var goDownFromSearchInput = useGoDownFromSearchInput();
	var _useSkinToneFanOpenSt2 = useSkinToneFanOpenState(), isOpen = _useSkinToneFanOpenSt2[0], setIsOpen = _useSkinToneFanOpenSt2[1];
	var isSkinToneInPreview = useIsSkinToneInPreview();
	var isSkinToneInSearch = useIsSkinToneInSearch();
	var onType = useOnType();
	var onKeyDown = (0, import_react.useMemo)(function() {
		return (function onKeyDown(event) {
			var key = event.key;
			if (isSkinToneInSearch) switch (key) {
				case KeyboardEvents.ArrowLeft:
					event.preventDefault();
					if (!isOpen) return focusSearchInput();
					focusNextSkinTone(focusSearchInput);
					break;
				case KeyboardEvents.ArrowRight:
					event.preventDefault();
					if (!isOpen) return focusSearchInput();
					focusPrevSkinTone();
					break;
				case KeyboardEvents.ArrowDown:
					event.preventDefault();
					if (isOpen) setIsOpen(false);
					goDownFromSearchInput();
					break;
				default: onType(event);
			}
			if (isSkinToneInPreview) switch (key) {
				case KeyboardEvents.ArrowUp:
					event.preventDefault();
					if (!isOpen) return focusSearchInput();
					focusNextSkinTone(focusSearchInput);
					break;
				case KeyboardEvents.ArrowDown:
					event.preventDefault();
					if (!isOpen) return focusSearchInput();
					focusPrevSkinTone();
					break;
				default: onType(event);
			}
		});
	}, [
		isOpen,
		focusSearchInput,
		setIsOpen,
		goDownFromSearchInput,
		onType,
		isSkinToneInPreview,
		isSkinToneInSearch
	]);
	(0, import_react.useEffect)(function() {
		var current = SkinTonePickerRef.current;
		if (!current) return;
		current.addEventListener("keydown", onKeyDown);
		return function() {
			current.removeEventListener("keydown", onKeyDown);
		};
	}, [
		SkinTonePickerRef,
		SearchInputRef,
		isOpen,
		onKeyDown
	]);
}
function useCategoryNavigationKeyboardEvents() {
	var focusSearchInput = useFocusSearchInput();
	var CategoryNavigationRef = useCategoryNavigationRef();
	var BodyRef = useBodyRef();
	var onType = useOnType();
	var onKeyDown = (0, import_react.useMemo)(function() {
		return function onKeyDown(event) {
			switch (event.key) {
				case KeyboardEvents.ArrowUp:
					event.preventDefault();
					focusSearchInput();
					break;
				case KeyboardEvents.ArrowRight:
					event.preventDefault();
					focusNextElementSibling(getActiveElement());
					break;
				case KeyboardEvents.ArrowLeft:
					event.preventDefault();
					focusPrevElementSibling(getActiveElement());
					break;
				case KeyboardEvents.ArrowDown:
					event.preventDefault();
					focusFirstVisibleEmoji(BodyRef.current);
					break;
				default: onType(event);
			}
		};
	}, [
		BodyRef,
		focusSearchInput,
		onType
	]);
	(0, import_react.useEffect)(function() {
		var current = CategoryNavigationRef.current;
		if (!current) return;
		current.addEventListener("keydown", onKeyDown);
		return function() {
			current.removeEventListener("keydown", onKeyDown);
		};
	}, [
		CategoryNavigationRef,
		BodyRef,
		onKeyDown
	]);
}
function useBodyKeyboardEvents() {
	var BodyRef = useBodyRef();
	var goUpFromBody = useGoUpFromBody();
	var setVariationPicker = useSetVariationPicker();
	var hasOpenToggles = useHasOpenToggles();
	var closeAllOpenToggles = useCloseAllOpenToggles();
	var onType = useOnType();
	var onKeyDown = (0, import_react.useMemo)(function() {
		return (function onKeyDown(event) {
			var key = event.key;
			var activeElement = buttonFromTarget(getActiveElement());
			switch (key) {
				case KeyboardEvents.ArrowRight:
					event.preventDefault();
					focusNextVisibleEmoji(activeElement);
					break;
				case KeyboardEvents.ArrowLeft:
					event.preventDefault();
					focusPrevVisibleEmoji(activeElement);
					break;
				case KeyboardEvents.ArrowDown:
					event.preventDefault();
					if (hasOpenToggles()) {
						closeAllOpenToggles();
						break;
					}
					focusVisibleEmojiOneRowDown(activeElement);
					break;
				case KeyboardEvents.ArrowUp:
					event.preventDefault();
					if (hasOpenToggles()) {
						closeAllOpenToggles();
						break;
					}
					focusVisibleEmojiOneRowUp(activeElement, goUpFromBody);
					break;
				case KeyboardEvents.Space:
					event.preventDefault();
					setVariationPicker(event.target);
					break;
				default: onType(event);
			}
		});
	}, [
		goUpFromBody,
		onType,
		setVariationPicker,
		hasOpenToggles,
		closeAllOpenToggles
	]);
	(0, import_react.useEffect)(function() {
		var current = BodyRef.current;
		if (!current) return;
		current.addEventListener("keydown", onKeyDown);
		return function() {
			current.removeEventListener("keydown", onKeyDown);
		};
	}, [BodyRef, onKeyDown]);
}
function useGoDownFromSearchInput() {
	var focusCategoryNavigation = useFocusCategoryNavigation();
	var isSearchMode = useIsSearchMode();
	var BodyRef = useBodyRef();
	return (0, import_react.useCallback)(function goDownFromSearchInput() {
		if (isSearchMode) return focusFirstVisibleEmoji(BodyRef.current);
		return focusCategoryNavigation();
	}, [
		BodyRef,
		focusCategoryNavigation,
		isSearchMode
	]);
}
function useGoUpFromBody() {
	var focusSearchInput = useFocusSearchInput();
	var focusCategoryNavigation = useFocusCategoryNavigation();
	var isSearchMode = useIsSearchMode();
	return (0, import_react.useCallback)(function goUpFromEmoji() {
		if (isSearchMode) return focusSearchInput();
		return focusCategoryNavigation();
	}, [
		focusSearchInput,
		isSearchMode,
		focusCategoryNavigation
	]);
}
function focusNextSkinTone(exitLeft) {
	var currentSkinTone = getActiveElement();
	if (!currentSkinTone) return;
	if (!hasNextElementSibling(currentSkinTone)) exitLeft();
	focusNextElementSibling(currentSkinTone);
}
function focusPrevSkinTone() {
	var currentSkinTone = getActiveElement();
	if (!currentSkinTone) return;
	focusPrevElementSibling(currentSkinTone);
}
function useOnType() {
	var appendSearch = useAppendSearch();
	var focusSearchInput = useFocusSearchInput();
	var searchDisabled = useSearchDisabledConfig();
	var closeAllOpenToggles = useCloseAllOpenToggles();
	return function onType(event) {
		var key = event.key;
		if (hasModifier(event) || searchDisabled) return;
		if (key.match(/(^[a-zA-Z0-9]$){1}/)) {
			event.preventDefault();
			closeAllOpenToggles();
			focusSearchInput();
			appendSearch(key);
		}
	};
}
function hasModifier(event) {
	var metaKey = event.metaKey, ctrlKey = event.ctrlKey, altKey = event.altKey;
	return metaKey || ctrlKey || altKey;
}
function preloadEmojiIfNeeded(emoji, emojiStyles, scrollTop, clientHeight, topOffset, style, dimensions, getEmojiUrl) {
	if (!emoji) return;
	if (emojiStyles === EmojiStyle.NATIVE) return;
	var unified = emojiUnified(emoji);
	if (preloadedEmojs.has(unified)) return;
	if (!style || !dimensions) return;
	setTimeout(function() {
		var emojiTop = topOffset + style.top;
		var viewportBottom = scrollTop + clientHeight;
		if (emojiTop >= viewportBottom && emojiTop < viewportBottom + dimensions.emojiSize * 2) preloadEmoji(getEmojiUrl, emoji, emojiStyles);
	});
}
function preloadEmoji(getEmojiUrl, emoji, emojiStyle) {
	if (!emoji) return;
	var unified = emojiUnified(emoji);
	if (preloadedEmojs.has(unified)) return;
	preloadedEmojs.add(unified);
	emojiVariations(emoji).concat(unified).forEach(function(variation) {
		preloadImage(getEmojiUrl(variation, emojiStyle));
	});
}
var preloadedEmojs = /*#__PURE__*/ new Set();
function preloadImage(url) {
	var image = new Image();
	image.src = url;
}
function useOnFocus() {
	var BodyRef = useBodyRef();
	var emojiStyle = useEmojiStyleConfig();
	var getEmojiUrl = useGetEmojiUrlConfig();
	(0, import_react.useEffect)(function() {
		if (emojiStyle === EmojiStyle.NATIVE) return;
		var bodyRef = BodyRef.current;
		bodyRef?.addEventListener("focusin", onFocus);
		return function() {
			bodyRef?.removeEventListener("focusin", onFocus);
		};
		function onFocus(event) {
			var button = buttonFromTarget(event.target);
			if (!button) return;
			var emoji = emojiFromElement(button)[0];
			if (!emoji) return;
			if (emojiHasVariations$1(emoji)) preloadEmoji(getEmojiUrl, emoji, emojiStyle);
		}
	}, [
		BodyRef,
		emojiStyle,
		getEmojiUrl
	]);
}
var _excluded$1 = ["width", "height"];
var DEFAULT_LABEL_HEIGHT = 40;
function PickerMain(_ref) {
	var children = _ref.children;
	return (0, import_react.createElement)(PickerContextProvider, null, (0, import_react.createElement)(PickerRootElement, null, children));
}
function PickerRootElement(_ref2) {
	var _cx;
	var children = _ref2.children;
	var reactionsMode = useReactionsModeState()[0];
	var theme = useThemeConfig();
	var searchModeActive = useIsSearchMode();
	var PickerMainRef = usePickerMainRef();
	var className = useClassNameConfig();
	var style = useStyleConfig();
	useKeyboardNavigation();
	useOnFocus();
	var _ref3 = style || {}, width = _ref3.width, height = _ref3.height, styleProps = _objectWithoutPropertiesLoose(_ref3, _excluded$1);
	return (0, import_react.createElement)("aside", {
		className: cx(styles.main, styles.baseVariables, theme === Theme.DARK && styles.darkTheme, theme === Theme.AUTO && styles.autoThemeDark, (_cx = {}, _cx[ClassNames.searchActive] = searchModeActive, _cx), reactionsMode && styles.reactionsMenu, className),
		ref: PickerMainRef,
		style: _extends({}, styleProps, !reactionsMode && {
			height,
			width
		})
	}, children);
}
var DarkTheme = {
	"--epr-emoji-variation-picker-bg-color": "var(--epr-dark-emoji-variation-picker-bg-color)",
	"--epr-hover-bg-color-reduced-opacity": "var(--epr-dark-hover-bg-color-reduced-opacity)",
	"--epr-highlight-color": "var(--epr-dark-highlight-color)",
	"--epr-text-color": "var(--epr-dark-text-color)",
	"--epr-hover-bg-color": "var(--epr-dark-hover-bg-color)",
	"--epr-focus-bg-color": "var(--epr-dark-focus-bg-color)",
	"--epr-search-input-bg-color": "var(--epr-dark-search-input-bg-color)",
	"--epr-category-label-bg-color": "var(--epr-dark-category-label-bg-color)",
	"--epr-picker-border-color": "var(--epr-dark-picker-border-color)",
	"--epr-bg-color": "var(--epr-dark-bg-color)",
	"--epr-reactions-bg-color": "var(--epr-dark-reactions-bg-color)",
	"--epr-search-input-bg-color-active": "var(--epr-dark-search-input-bg-color-active)",
	"--epr-emoji-variation-indicator-color": "var(--epr-dark-emoji-variation-indicator-color)",
	"--epr-category-icon-active-color": "var(--epr-dark-category-icon-active-color)",
	"--epr-skin-tone-picker-menu-color": "var(--epr-dark-skin-tone-picker-menu-color)",
	"--epr-skin-tone-outer-border-color": "var(--epr-dark-skin-tone-outer-border-color)",
	"--epr-skin-tone-inner-border-color": "var(--epr-dark-skin-tone-inner-border-color)"
};
var styles = /*#__PURE__*/ stylesheet.create({
	main: {
		".": ["epr-main", ClassNames.emojiPicker],
		position: "relative",
		display: "flex",
		flexDirection: "column",
		borderWidth: "1px",
		borderStyle: "solid",
		borderRadius: "var(--epr-picker-border-radius)",
		borderColor: "var(--epr-picker-border-color)",
		backgroundColor: "var(--epr-bg-color)",
		overflow: "hidden",
		transition: "height 0.3s ease-in-out, background-color 0.1s ease-in-out",
		"*": {
			boxSizing: "border-box",
			fontFamily: "sans-serif"
		}
	},
	baseVariables: { "--": {
		"--epr-highlight-color": "#007aeb",
		"--epr-hover-bg-color": "#e5f0fa",
		"--epr-hover-bg-color-reduced-opacity": "#e5f0fa80",
		"--epr-focus-bg-color": "#e0f0ff",
		"--epr-text-color": "#858585",
		"--epr-search-input-bg-color": "#f6f6f6",
		"--epr-picker-border-color": "#e7e7e7",
		"--epr-bg-color": "#fff",
		"--epr-reactions-bg-color": "#ffffff90",
		"--epr-category-icon-active-color": "#6aa8de",
		"--epr-skin-tone-picker-menu-color": "#ffffff95",
		"--epr-skin-tone-outer-border-color": "#555555",
		"--epr-skin-tone-inner-border-color": "var(--epr-bg-color)",
		"--epr-horizontal-padding": "10px",
		"--epr-picker-border-radius": "8px",
		"--epr-header-padding": "15px var(--epr-horizontal-padding)",
		"--epr-active-skin-tone-indicator-border-color": "var(--epr-highlight-color)",
		"--epr-active-skin-hover-color": "var(--epr-hover-bg-color)",
		"--epr-search-input-bg-color-active": "var(--epr-search-input-bg-color)",
		"--epr-search-input-padding": "0 30px",
		"--epr-search-input-border-radius": "8px",
		"--epr-search-input-height": "40px",
		"--epr-search-input-text-color": "var(--epr-text-color)",
		"--epr-search-input-placeholder-color": "var(--epr-text-color)",
		"--epr-search-bar-inner-padding": "var(--epr-horizontal-padding)",
		"--epr-search-border-color": "var(--epr-search-input-bg-color)",
		"--epr-search-border-color-active": "var(--epr-highlight-color)",
		"--epr-category-navigation-button-size": "30px",
		"--epr-emoji-variation-picker-height": "45px",
		"--epr-emoji-variation-picker-bg-color": "var(--epr-bg-color)",
		"--epr-preview-height": "70px",
		"--epr-preview-text-size": "14px",
		"--epr-preview-text-padding": "0 var(--epr-horizontal-padding)",
		"--epr-preview-border-color": "var(--epr-picker-border-color)",
		"--epr-preview-text-color": "var(--epr-text-color)",
		"--epr-category-padding": "0 var(--epr-horizontal-padding)",
		"--epr-category-label-bg-color": "#ffffffe6",
		"--epr-category-label-text-color": "var(--epr-text-color)",
		"--epr-category-label-padding": "0 var(--epr-horizontal-padding)",
		"--epr-category-label-height": DEFAULT_LABEL_HEIGHT + "px",
		"--epr-emoji-size": "30px",
		"--epr-emoji-padding": "5px",
		"--epr-emoji-fullsize": "calc(var(--epr-emoji-size) + var(--epr-emoji-padding) * 2)",
		"--epr-emoji-hover-color": "var(--epr-hover-bg-color)",
		"--epr-emoji-variation-indicator-color": "var(--epr-picker-border-color)",
		"--epr-emoji-variation-indicator-color-hover": "var(--epr-text-color)",
		"--epr-header-overlay-z-index": "3",
		"--epr-emoji-variations-indictator-z-index": "1",
		"--epr-category-label-z-index": "2",
		"--epr-skin-variation-picker-z-index": "5",
		"--epr-preview-z-index": "6",
		"--epr-dark": "#000",
		"--epr-dark-emoji-variation-picker-bg-color": "var(--epr-dark)",
		"--epr-dark-highlight-color": "#c0c0c0",
		"--epr-dark-text-color": "var(--epr-highlight-color)",
		"--epr-dark-hover-bg-color": "#363636f6",
		"--epr-dark-hover-bg-color-reduced-opacity": "#36363680",
		"--epr-dark-focus-bg-color": "#474747",
		"--epr-dark-search-input-bg-color": "#333333",
		"--epr-dark-category-label-bg-color": "#222222e6",
		"--epr-dark-picker-border-color": "#151617",
		"--epr-dark-bg-color": "#222222",
		"--epr-dark-reactions-bg-color": "#22222290",
		"--epr-dark-search-input-bg-color-active": "var(--epr-dark)",
		"--epr-dark-emoji-variation-indicator-color": "#444",
		"--epr-dark-category-icon-active-color": "#3271b7",
		"--epr-dark-skin-tone-picker-menu-color": "#22222295",
		"--epr-dark-skin-tone-outer-border-color": "var(--epr-dark-picker-border-color)",
		"--epr-dark-skin-tone-inner-border-color": "#00000000"
	} },
	autoThemeDark: {
		".": ClassNames.autoTheme,
		"@media (prefers-color-scheme: dark)": { "--": DarkTheme }
	},
	darkTheme: {
		".": ClassNames.darkTheme,
		"--": DarkTheme
	},
	reactionsMenu: {
		".": "epr-reactions",
		height: "50px",
		display: "inline-flex",
		backgroundColor: "var(--epr-reactions-bg-color)",
		backdropFilter: "blur(8px)",
		"--": { "--epr-picker-border-radius": "50px" }
	}
});
function elementCountInRow(parent, element) {
	if (!parent || !element) return 0;
	var parentWidth = parent.getBoundingClientRect().width;
	var elementWidth = element.getBoundingClientRect().width;
	return Math.floor(parentWidth / elementWidth);
}
function firstVisibleElementInContainer(parent, elements, maxVisibilityDiffThreshold) {
	if (maxVisibilityDiffThreshold === void 0) maxVisibilityDiffThreshold = 0;
	if (!parent || !elements.length) return null;
	var parentTop = parent.getBoundingClientRect().top;
	var parentBottom = parent.getBoundingClientRect().bottom;
	var parentTopWithLabel = parentTop + getLabelHeight(parent);
	return elements.find(function(element) {
		var elementTop = element.getBoundingClientRect().top;
		var elementBottom = element.getBoundingClientRect().bottom;
		var maxVisibilityDiffPixels = element.clientHeight * maxVisibilityDiffThreshold;
		var elementTopWithAllowedDiff = elementTop + maxVisibilityDiffPixels;
		var elementBottomWithAllowedDiff = elementBottom - maxVisibilityDiffPixels;
		if (elementTopWithAllowedDiff < parentTopWithLabel) return false;
		return elementTopWithAllowedDiff >= parentTop && elementTopWithAllowedDiff <= parentBottom || elementBottomWithAllowedDiff >= parentTop && elementBottomWithAllowedDiff <= parentBottom;
	}) || null;
}
function hasNextElementSibling(element) {
	return !!element.nextElementSibling;
}
function getLabelHeight(parentNode) {
	if (!parentNode) return DEFAULT_LABEL_HEIGHT;
	var label = parentNode.querySelector(asSelectors(ClassNames.label));
	if (label) {
		var height = label.getBoundingClientRect().height;
		if (height > 0) return height;
	}
	return DEFAULT_LABEL_HEIGHT;
}
var EmojiButtonSelector = "button" + /*#__PURE__*/ asSelectors(ClassNames.emoji);
var VisibleEmojiSelector = /*#__PURE__*/ [
	EmojiButtonSelector,
	asSelectors(ClassNames.visible),
	":not(" + asSelectors(ClassNames.hidden) + ")"
].join("");
function buttonFromTarget(emojiElement) {
	var _emojiElement$closest;
	return (_emojiElement$closest = emojiElement == null ? void 0 : emojiElement.closest(EmojiButtonSelector)) != null ? _emojiElement$closest : null;
}
function emojiFromElement(element) {
	var originalUnified = originalUnifiedFromEmojiElement(element);
	var unified = unifiedFromEmojiElement(element);
	if (!originalUnified) return [];
	var emoji = emojiByUnified(unified != null ? unified : originalUnified);
	if (!emoji) return [];
	return [emoji, unified];
}
function isEmojiElement(element) {
	var _element$parentElemen;
	return Boolean((element == null ? void 0 : element.matches(EmojiButtonSelector)) || (element == null ? void 0 : (_element$parentElemen = element.parentElement) == null ? void 0 : _element$parentElemen.matches(EmojiButtonSelector)));
}
function elementHeight(element) {
	var _element$clientHeight;
	return (_element$clientHeight = element == null ? void 0 : element.clientHeight) != null ? _element$clientHeight : 0;
}
function emojiTrueOffsetTop(element) {
	if (!element) return 0;
	var button = buttonFromTarget(element);
	var category = closestCategory(button);
	var labelHeight = categoryLabelHeight(category);
	return elementOffsetTop(button) + elementOffsetTop(category) + labelHeight;
}
function categoryLabelHeight(category) {
	var _category$clientHeigh, _categoryWithoutLabel;
	if (!category) return 0;
	var categoryWithoutLabel = category.querySelector(asSelectors(ClassNames.categoryContent));
	return ((_category$clientHeigh = category == null ? void 0 : category.clientHeight) != null ? _category$clientHeigh : 0) - ((_categoryWithoutLabel = categoryWithoutLabel == null ? void 0 : categoryWithoutLabel.clientHeight) != null ? _categoryWithoutLabel : 0);
}
function isEmojiBehindLabel(emoji) {
	if (!emoji) return false;
	return emojiDistanceFromScrollTop(emoji) < categoryLabelHeight(closestCategory(emoji));
}
function queryScrollBody(root) {
	if (!root) return null;
	return root.matches(asSelectors(ClassNames.scrollBody)) ? root : root.querySelector(asSelectors(ClassNames.scrollBody));
}
function emojiDistanceFromScrollTop(emoji) {
	var _closestScrollBody$sc, _closestScrollBody;
	if (!emoji) return 0;
	return emojiTrueOffsetTop(emoji) - ((_closestScrollBody$sc = (_closestScrollBody = closestScrollBody(emoji)) == null ? void 0 : _closestScrollBody.scrollTop) != null ? _closestScrollBody$sc : 0);
}
function closestScrollBody(element) {
	var _element$closest;
	if (!element) return null;
	return (_element$closest = element.closest(asSelectors(ClassNames.scrollBody))) != null ? _element$closest : null;
}
function emojiTruOffsetLeft(element) {
	var button = buttonFromTarget(element);
	var category = closestCategory(button);
	return elementOffsetLeft(button) + elementOffsetLeft(category);
}
function elementOffsetTop(element) {
	var _element$offsetTop;
	return (_element$offsetTop = element == null ? void 0 : element.offsetTop) != null ? _element$offsetTop : 0;
}
function elementOffsetLeft(element) {
	var _element$offsetLeft;
	return (_element$offsetLeft = element == null ? void 0 : element.offsetLeft) != null ? _element$offsetLeft : 0;
}
function unifiedFromEmojiElement(emoji) {
	var _elementDataSetKey;
	return (_elementDataSetKey = elementDataSetKey(buttonFromTarget(emoji), "unified")) != null ? _elementDataSetKey : null;
}
function originalUnifiedFromEmojiElement(emoji) {
	var unified = unifiedFromEmojiElement(emoji);
	if (unified) return unifiedWithoutSkinTone$1(unified);
	return null;
}
function allUnifiedFromEmojiElement(emoji) {
	if (!emoji) return {
		unified: null,
		originalUnified: null
	};
	return {
		unified: unifiedFromEmojiElement(emoji),
		originalUnified: originalUnifiedFromEmojiElement(emoji)
	};
}
function elementDataSetKey(element, key) {
	var _elementDataSet$key;
	return (_elementDataSet$key = elementDataSet(element)[key]) != null ? _elementDataSet$key : null;
}
function elementDataSet(element) {
	var _element$dataset;
	return (_element$dataset = element == null ? void 0 : element.dataset) != null ? _element$dataset : {};
}
function isVisibleEmoji(element) {
	return element.classList.contains(ClassNames.visible);
}
function isHidden(element) {
	if (!element) return true;
	return element.classList.contains(ClassNames.hidden);
}
function allVisibleEmojis(parent) {
	if (!parent) return [];
	return Array.from(parent.querySelectorAll(VisibleEmojiSelector));
}
function lastVisibleEmoji(element) {
	if (!element) return null;
	var last = allVisibleEmojis(element).slice(-1)[0];
	if (!last) return null;
	if (!isVisibleEmoji(last)) return prevVisibleEmoji(last);
	return last;
}
function nextVisibleEmoji(element) {
	var next = element.nextElementSibling;
	if (!next) return firstVisibleEmoji(nextCategory(element));
	if (!isVisibleEmoji(next)) return nextVisibleEmoji(next);
	return next;
}
function prevVisibleEmoji(element) {
	var prev = element.previousElementSibling;
	if (!prev) return lastVisibleEmoji(prevCategory(element));
	if (!isVisibleEmoji(prev)) return prevVisibleEmoji(prev);
	return prev;
}
function firstVisibleEmoji(parent) {
	if (!parent) return null;
	return firstVisibleElementInContainer(parent, allVisibleEmojis(parent), .1);
}
function prevCategory(element) {
	var category = closestCategory(element);
	if (!category) return null;
	var prev = category.previousElementSibling;
	if (!prev) return null;
	if (isHidden(prev)) return prevCategory(prev);
	return prev;
}
function nextCategory(element) {
	var category = closestCategory(element);
	if (!category) return null;
	var next = category.nextElementSibling;
	if (!next) return null;
	if (isHidden(next)) return nextCategory(next);
	return next;
}
function closestCategory(element) {
	if (!element) return null;
	return element.closest(asSelectors(ClassNames.category));
}
function closestCategoryContent(element) {
	if (!element) return null;
	return element.closest(asSelectors(ClassNames.categoryContent));
}
function parseNativeEmoji(unified) {
	return unified.split("-").map(function(hex) {
		return String.fromCodePoint(parseInt(hex, 16));
	}).join("");
}
function isCustomCategory(category) {
	return category.category === Categories.CUSTOM;
}
function isCustomEmoji(emoji) {
	return emoji.imgUrl !== void 0;
}
function useMouseDownHandlers(ContainerRef, mouseEventSource) {
	var mouseDownTimerRef = (0, import_react.useRef)();
	var setVariationPicker = useSetVariationPicker();
	var disallowClickRef = useDisallowClickRef();
	var setEmojiVariationPicker = useEmojiVariationPickerState()[1];
	var closeAllOpenToggles = useCloseAllOpenToggles();
	var activeSkinTone = useActiveSkinToneState()[0];
	var onEmojiClick = useOnEmojiClickConfig(mouseEventSource);
	var updateSuggested = useUpdateSuggested()[1];
	var getEmojiUrl = useGetEmojiUrlConfig();
	var activeEmojiStyle = useEmojiStyleConfig();
	var emojiByUnified = usePickerDataContext().emojiByUnified;
	var onClick = (0, import_react.useCallback)(function onClick(event) {
		if (disallowClickRef.current) return;
		closeAllOpenToggles();
		var _emojiFromEvent = emojiFromEvent(event, emojiByUnified), emoji = _emojiFromEvent[0], unified = _emojiFromEvent[1];
		if (!emoji || !unified) return;
		var skinToneToUse = activeVariationFromUnified$1(unified) || activeSkinTone;
		updateSuggested();
		setSuggested(emoji, skinToneToUse);
		onEmojiClick(emojiClickOutput(emoji, skinToneToUse, activeEmojiStyle, getEmojiUrl), event);
	}, [
		activeSkinTone,
		closeAllOpenToggles,
		disallowClickRef,
		emojiByUnified,
		onEmojiClick,
		updateSuggested,
		getEmojiUrl,
		activeEmojiStyle
	]);
	var onMouseDown = (0, import_react.useCallback)(function onMouseDown(event) {
		var _window;
		if (mouseDownTimerRef.current) clearTimeout(mouseDownTimerRef.current);
		var emoji = emojiFromEvent(event, emojiByUnified)[0];
		if (!emoji || !emojiHasVariations$1(emoji)) return;
		mouseDownTimerRef.current = (_window = window) == null ? void 0 : _window.setTimeout(function() {
			disallowClickRef.current = true;
			mouseDownTimerRef.current = void 0;
			closeAllOpenToggles();
			setVariationPicker(event.target);
			setEmojiVariationPicker(emoji);
		}, 500);
	}, [
		disallowClickRef,
		emojiByUnified,
		closeAllOpenToggles,
		setVariationPicker,
		setEmojiVariationPicker
	]);
	var onMouseUp = (0, import_react.useCallback)(function onMouseUp() {
		if (mouseDownTimerRef.current) {
			clearTimeout(mouseDownTimerRef.current);
			mouseDownTimerRef.current = void 0;
		} else if (disallowClickRef.current) requestAnimationFrame(function() {
			disallowClickRef.current = false;
		});
	}, [disallowClickRef]);
	(0, import_react.useEffect)(function() {
		if (!ContainerRef.current) return;
		var confainerRef = ContainerRef.current;
		confainerRef.addEventListener("click", onClick, { passive: true });
		confainerRef.addEventListener("mousedown", onMouseDown, { passive: true });
		confainerRef.addEventListener("mouseup", onMouseUp, { passive: true });
		return function() {
			confainerRef?.removeEventListener("click", onClick);
			confainerRef?.removeEventListener("mousedown", onMouseDown);
			confainerRef?.removeEventListener("mouseup", onMouseUp);
		};
	}, [
		ContainerRef,
		onClick,
		onMouseDown,
		onMouseUp
	]);
}
function emojiFromEvent(event, lookupEmojiByUnified) {
	var target = event == null ? void 0 : event.target;
	if (!isEmojiElement(target)) return [];
	var _allUnifiedFromEmojiE = allUnifiedFromEmojiElement(target), unified = _allUnifiedFromEmojiE.unified, originalUnified = _allUnifiedFromEmojiE.originalUnified;
	var resolvedUnified = unified != null ? unified : originalUnified;
	if (!resolvedUnified) return [];
	var emoji = lookupEmojiByUnified(resolvedUnified);
	if (!emoji) return [];
	return [emoji, unified != null ? unified : resolvedUnified];
}
function emojiClickOutput(emoji, activeSkinTone, activeEmojiStyle, getEmojiUrl) {
	var names = emojiNames$1(emoji);
	if (isCustomEmoji(emoji)) {
		var _unified = emojiUnified$1(emoji);
		return {
			activeSkinTone,
			emoji: _unified,
			getImageUrl: function getImageUrl() {
				return emoji.imgUrl;
			},
			imageUrl: emoji.imgUrl,
			isCustom: true,
			names,
			unified: _unified,
			unifiedWithoutSkinTone: _unified
		};
	}
	var unified = emojiUnified$1(emoji, activeSkinTone);
	return {
		activeSkinTone,
		emoji: parseNativeEmoji(unified),
		getImageUrl: function getImageUrl(emojiStyle) {
			if (emojiStyle === void 0) emojiStyle = activeEmojiStyle != null ? activeEmojiStyle : EmojiStyle.APPLE;
			return getEmojiUrl(unified, emojiStyle);
		},
		imageUrl: getEmojiUrl(unified, activeEmojiStyle != null ? activeEmojiStyle : EmojiStyle.APPLE),
		isCustom: false,
		names,
		unified,
		unifiedWithoutSkinTone: emojiUnified$1(emoji)
	};
}
function Button(props) {
	return (0, import_react.createElement)("button", Object.assign({ type: "button" }, props, { className: cx(styles$1.button, props.className) }), props.children);
}
var styles$1 = /*#__PURE__*/ stylesheet.create({ button: {
	".": "epr-btn",
	cursor: "pointer",
	border: "0",
	background: "none",
	outline: "none"
} });
function ClickableEmojiButton(_ref) {
	var _cx;
	var emojiNames = _ref.emojiNames, unified = _ref.unified, hidden = _ref.hidden, hiddenOnSearch = _ref.hiddenOnSearch, _ref$showVariations = _ref.showVariations, showVariations = _ref$showVariations === void 0 ? true : _ref$showVariations, hasVariations = _ref.hasVariations, children = _ref.children, className = _ref.className, _ref$noBackground = _ref.noBackground, noBackground = _ref$noBackground === void 0 ? false : _ref$noBackground, style = _ref.style;
	return (0, import_react.createElement)(Button, {
		className: cx(styles$2.emoji, hidden && commonStyles.hidden, hiddenOnSearch && commonInteractionStyles.hiddenOnSearch, (_cx = {}, _cx[ClassNames.visible] = !hidden && !hiddenOnSearch, _cx), !!(hasVariations && showVariations) && styles$2.hasVariations, noBackground && styles$2.noBackground, className),
		"data-unified": unified,
		"aria-label": getAriaLabel(emojiNames),
		"data-full-name": emojiNames,
		style
	}, children);
}
function getAriaLabel(emojiNames) {
	return emojiNames[emojiNames.length - 1];
}
var styles$2 = /*#__PURE__*/ stylesheet.create({
	emoji: {
		".": ClassNames.emoji,
		position: "relative",
		width: "var(--epr-emoji-fullsize)",
		height: "var(--epr-emoji-fullsize)",
		boxSizing: "border-box",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		maxWidth: "var(--epr-emoji-fullsize)",
		maxHeight: "var(--epr-emoji-fullsize)",
		borderRadius: "8px",
		overflow: "hidden",
		transition: "background-color 0.2s",
		":hover": { backgroundColor: "var(--epr-emoji-hover-color)" },
		":focus": { backgroundColor: "var(--epr-focus-bg-color)" }
	},
	noBackground: {
		background: "none",
		":hover": {
			backgroundColor: "transparent",
			background: "none"
		},
		":focus": {
			backgroundColor: "transparent",
			background: "none"
		}
	},
	hasVariations: {
		".": ClassNames.emojiHasVariations,
		":after": {
			content: "",
			display: "block",
			width: "0",
			height: "0",
			right: "0px",
			bottom: "1px",
			position: "absolute",
			borderLeft: "4px solid transparent",
			borderRight: "4px solid transparent",
			transform: "rotate(135deg)",
			borderBottom: "4px solid var(--epr-emoji-variation-indicator-color)",
			zIndex: "var(--epr-emoji-variations-indictator-z-index)"
		},
		":hover:after": { borderBottom: "4px solid var(--epr-emoji-variation-indicator-color-hover)" }
	}
});
var emojiStyles = /*#__PURE__*/ stylesheet.create({
	external: {
		".": ClassNames.external,
		fontSize: "0"
	},
	common: {
		alignSelf: "center",
		justifySelf: "center",
		display: "block"
	}
});
function EmojiImg(_ref) {
	var emojiName = _ref.emojiName, style = _ref.style, _ref$lazyLoad = _ref.lazyLoad, lazyLoad = _ref$lazyLoad === void 0 ? false : _ref$lazyLoad, imgUrl = _ref.imgUrl, onError = _ref.onError, className = _ref.className;
	return (0, import_react.createElement)("img", {
		src: imgUrl,
		alt: emojiName,
		className: cx(styles$3.emojiImag, emojiStyles.external, emojiStyles.common, className),
		loading: lazyLoad ? "lazy" : "eager",
		onError,
		style
	});
}
var styles$3 = /*#__PURE__*/ stylesheet.create({ emojiImag: {
	".": "epr-emoji-img",
	maxWidth: "var(--epr-emoji-fullsize)",
	maxHeight: "var(--epr-emoji-fullsize)",
	minWidth: "var(--epr-emoji-fullsize)",
	minHeight: "var(--epr-emoji-fullsize)",
	padding: "var(--epr-emoji-padding)"
} });
function NativeEmoji(_ref) {
	var unified = _ref.unified, style = _ref.style, className = _ref.className;
	return (0, import_react.createElement)("span", {
		className: cx(styles$4.nativeEmoji, emojiStyles.common, emojiStyles.external, className),
		"data-unified": unified,
		style
	}, parseNativeEmoji(unified));
}
var styles$4 = /*#__PURE__*/ stylesheet.create({ nativeEmoji: {
	".": "epr-emoji-native",
	fontFamily: "\"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Segoe UI\", \"Apple Color Emoji\", \"Twemoji Mozilla\", \"Noto Color Emoji\", \"EmojiOne Color\", \"Android Emoji\"!important",
	position: "relative",
	lineHeight: "100%",
	fontSize: "var(--epr-emoji-size)",
	textAlign: "center",
	alignSelf: "center",
	justifySelf: "center",
	letterSpacing: "0",
	padding: "var(--epr-emoji-padding)"
} });
function ViewOnlyEmoji(_ref) {
	var emoji = _ref.emoji, unified = _ref.unified, emojiStyle = _ref.emojiStyle, size = _ref.size, lazyLoad = _ref.lazyLoad, _ref$getEmojiUrl = _ref.getEmojiUrl, getEmojiUrl = _ref$getEmojiUrl === void 0 ? emojiUrlByUnified : _ref$getEmojiUrl, className = _ref.className;
	var setEmojisThatFailedToLoad = useEmojisThatFailedToLoadState()[1];
	var emojiByUnified = usePickerDataContext().emojiByUnified;
	var style = {};
	if (size) style.width = style.height = style.fontSize = size + "px";
	var emojiToRender = emoji ? emoji : emojiByUnified(unified);
	if (!emojiToRender) return null;
	if (isCustomEmoji(emojiToRender)) return (0, import_react.createElement)(EmojiImg, {
		style,
		emojiName: unified,
		emojiStyle: EmojiStyle.NATIVE,
		lazyLoad,
		imgUrl: emojiToRender.imgUrl,
		onError,
		className
	});
	return (0, import_react.createElement)(import_react.Fragment, null, emojiStyle === EmojiStyle.NATIVE ? (0, import_react.createElement)(NativeEmoji, {
		unified,
		style,
		className
	}) : (0, import_react.createElement)(EmojiImg, {
		style,
		emojiName: emojiName(emojiToRender),
		emojiStyle,
		lazyLoad,
		imgUrl: getEmojiUrl(unified, emojiStyle),
		onError,
		className
	}));
	function onError() {
		setEmojisThatFailedToLoad(function(prev) {
			return new Set(prev).add(unified);
		});
	}
}
function ClickableEmoji(_ref) {
	var emoji = _ref.emoji, unified = _ref.unified, hidden = _ref.hidden, hiddenOnSearch = _ref.hiddenOnSearch, emojiStyle = _ref.emojiStyle, _ref$showVariations = _ref.showVariations, showVariations = _ref$showVariations === void 0 ? true : _ref$showVariations, size = _ref.size, lazyLoad = _ref.lazyLoad, getEmojiUrl = _ref.getEmojiUrl, className = _ref.className, _ref$noBackground = _ref.noBackground, noBackground = _ref$noBackground === void 0 ? false : _ref$noBackground, style = _ref.style;
	var hasVariations = emojiHasVariations$1(emoji);
	return (0, import_react.createElement)(ClickableEmojiButton, {
		hasVariations,
		showVariations,
		hidden,
		hiddenOnSearch,
		emojiNames: emojiNames$1(emoji),
		unified,
		noBackground,
		style
	}, (0, import_react.createElement)(ViewOnlyEmoji, {
		unified,
		emoji,
		size,
		emojiStyle,
		lazyLoad,
		getEmojiUrl,
		className
	}));
}
var Plus = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI4LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHdpZHRoPSIyMHB4IiBoZWlnaHQ9IjgwcHgiIHZpZXdCb3g9IjAgMCAyMCA4MCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjAgODAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBmaWxsPSIjODY4Njg2IiBkPSJNNS43LDEwLjRjMCwwLjEsMC4xLDAuMywwLjIsMC40QzYsMTAuOSw2LjEsMTEsNi4zLDExaDMuNHYzLjRjMCwwLjEsMC4xLDAuMywwLjIsMC40CgljMC4xLDAuMSwwLjIsMC4yLDAuNCwwLjJjMC4zLDAsMC41LTAuMiwwLjUtMC41di0zLjRoMy40YzAuMywwLDAuNS0wLjIsMC41LTAuNXMtMC4yLTAuNS0wLjUtMC41aC0zLjRWNi43YzAtMC4zLTAuMi0wLjUtMC41LTAuNQoJQzkuOCw2LDkuNiw2LjIsOS42LDYuNXYzLjRINi4yQzUuOSw5LjksNS43LDEwLjEsNS43LDEwLjRMNS43LDEwLjR6Ii8+CjxwYXRoIGZpbGw9IiMzMzcxQjciIGQ9Ik01LjcsMzAuNGMwLDAuMSwwLjEsMC4zLDAuMiwwLjRTNi4xLDMxLDYuMywzMWgzLjR2My40YzAsMC4xLDAuMSwwLjMsMC4yLDAuNGMwLjEsMC4xLDAuMiwwLjIsMC40LDAuMgoJYzAuMywwLDAuNS0wLjIsMC41LTAuNXYtMy40aDMuNGMwLjMsMCwwLjUtMC4yLDAuNS0wLjVzLTAuMi0wLjUtMC41LTAuNWgtMy40di0zLjRjMC0wLjMtMC4yLTAuNS0wLjUtMC41cy0wLjUsMC4yLTAuNSwwLjV2My40SDYuMgoJQzUuOSwyOS45LDUuNywzMC4xLDUuNywzMC40TDUuNywzMC40eiIvPgo8cGF0aCBmaWxsPSIjQzBDMEJGIiBkPSJNNS43LDUwLjRjMCwwLjEsMC4xLDAuMywwLjIsMC40QzYsNTAuOSw2LjEsNTEsNi4zLDUxaDMuNHYzLjRjMCwwLjEsMC4xLDAuMywwLjIsMC40CgljMC4xLDAuMSwwLjIsMC4yLDAuNCwwLjJjMC4zLDAsMC41LTAuMiwwLjUtMC41di0zLjRoMy40YzAuMywwLDAuNS0wLjIsMC41LTAuNXMtMC4yLTAuNS0wLjUtMC41aC0zLjR2LTMuNGMwLTAuMy0wLjItMC41LTAuNS0wLjUKCXMtMC41LDAuMi0wLjUsMC41djMuNEg2LjJDNS45LDQ5LjksNS43LDUwLjEsNS43LDUwLjRMNS43LDUwLjR6Ii8+CjxwYXRoIGZpbGw9IiM2QUE5REQiIGQ9Ik01LjcsNzAuNGMwLDAuMSwwLjEsMC4zLDAuMiwwLjRTNi4xLDcxLDYuMyw3MWgzLjR2My40YzAsMC4xLDAuMSwwLjMsMC4yLDAuNGMwLjEsMC4xLDAuMiwwLjIsMC40LDAuMgoJYzAuMywwLDAuNS0wLjIsMC41LTAuNXYtMy40aDMuNGMwLjMsMCwwLjUtMC4yLDAuNS0wLjVzLTAuMi0wLjUtMC41LTAuNWgtMy40di0zLjRjMC0wLjMtMC4yLTAuNS0wLjUtMC41cy0wLjUsMC4yLTAuNSwwLjV2My40SDYuNAoJQzUuOSw2OS45LDUuNyw3MC4xLDUuNyw3MC40TDUuNyw3MC40eiIvPgo8L3N2Zz4=";
function BtnPlus() {
	var setReactionsMode = useReactionsModeState()[1];
	return (0, import_react.createElement)(Button, {
		"aria-label": "Show all Emojis",
		title: "Show all Emojis",
		tabIndex: 0,
		className: cx(styles$5.plusSign),
		onClick: function onClick() {
			return setReactionsMode(false);
		}
	});
}
var styles$5 = /*#__PURE__*/ stylesheet.create(/*#__PURE__*/ _extends({ plusSign: {
	fontSize: "20px",
	padding: "17px",
	color: "var(--epr-text-color)",
	borderRadius: "50%",
	textAlign: "center",
	lineHeight: "100%",
	width: "20px",
	height: "20px",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	transition: "background-color 0.2s ease-in-out",
	":after": {
		content: "",
		minWidth: "20px",
		minHeight: "20px",
		backgroundImage: "url(" + Plus + ")",
		backgroundColor: "transparent",
		backgroundRepeat: "no-repeat",
		backgroundSize: "20px",
		backgroundPositionY: "0"
	},
	":hover": {
		color: "var(--epr-highlight-color)",
		backgroundColor: "var(--epr-hover-bg-color-reduced-opacity)",
		":after": { backgroundPositionY: "-20px" }
	},
	":focus": {
		color: "var(--epr-highlight-color)",
		backgroundColor: "var(--epr-hover-bg-color-reduced-opacity)",
		":after": { backgroundPositionY: "-40px" }
	}
} }, /*#__PURE__*/ darkMode("plusSign", {
	":after": { backgroundPositionY: "-40px" },
	":hover:after": { backgroundPositionY: "-60px" }
})));
function Reactions() {
	var reactionsOpen = useReactionsModeState()[0];
	var ReactionsRef = useReactionsRef();
	var reactions = useReactionsConfig();
	useMouseDownHandlers(ReactionsRef, MOUSE_EVENT_SOURCE.REACTIONS);
	var emojiStyle = useEmojiStyleConfig();
	var allowExpandReactions = useAllowExpandReactions();
	var getEmojiUrl = useGetEmojiUrlConfig();
	if (!reactionsOpen) return null;
	return (0, import_react.createElement)("ul", {
		className: cx(styles$6.list, !reactionsOpen && commonStyles.hidden),
		ref: ReactionsRef,
		"aria-label": "Reactions"
	}, reactions.map(function(reaction) {
		var emoji = emojiByUnified(reaction);
		if (!emoji) return null;
		return (0, import_react.createElement)("li", { key: reaction }, (0, import_react.createElement)(ClickableEmoji, {
			emoji,
			emojiStyle,
			unified: reaction,
			showVariations: false,
			className: cx(styles$6.emojiButton),
			noBackground: true,
			getEmojiUrl
		}));
	}), allowExpandReactions ? (0, import_react.createElement)("li", null, (0, import_react.createElement)(BtnPlus, null)) : null);
}
var styles$6 = /*#__PURE__*/ stylesheet.create({
	list: {
		listStyle: "none",
		margin: "0",
		padding: "0 5px",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		height: "100%"
	},
	emojiButton: {
		":hover": { transform: "scale(1.2)" },
		":focus": { transform: "scale(1.2)" },
		":active": { transform: "scale(1.1)" },
		transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.5)"
	}
});
function useOnScroll(BodyRef) {
	var closeAllOpenToggles = useCloseAllOpenToggles();
	var _useState = (0, import_react.useState)(0), scrollTop = _useState[0], setScrollTop = _useState[1];
	(0, import_react.useEffect)(function() {
		var bodyRef = BodyRef.current;
		if (!bodyRef) return;
		bodyRef.addEventListener("scroll", onScroll, { passive: true });
		function onScroll() {
			var _bodyRef$scrollTop;
			setScrollTop((_bodyRef$scrollTop = bodyRef == null ? void 0 : bodyRef.scrollTop) != null ? _bodyRef$scrollTop : 0);
			closeAllOpenToggles();
		}
		return function() {
			bodyRef?.removeEventListener("scroll", onScroll);
		};
	}, [BodyRef, closeAllOpenToggles]);
	return scrollTop;
}
function shouldVirtualize(_ref) {
	var scrollTop = _ref.scrollTop, clientHeight = _ref.clientHeight, topOffset = _ref.topOffset, style = _ref.style, dimensions = _ref.dimensions;
	if (!style || !dimensions) return false;
	var emojiTop = topOffset + style.top;
	return !(emojiTop + dimensions.emojiSize + dimensions.emojiSize * 2 >= scrollTop && emojiTop <= scrollTop + clientHeight + dimensions.emojiSize);
}
function getEmojiPositionStyle(dimensions, index) {
	return dimensions ? {
		top: Math.floor(index / dimensions.emojisPerRow) * dimensions.emojiSize,
		left: index % dimensions.emojisPerRow * dimensions.emojiSize
	} : void 0;
}
var EMOJI_SIZE_DEFAULT = 40;
function useCategoryHeight(emojiCount) {
	var EmojiListRef = useEmojiListRef();
	var isReactionsMode = useReactionsModeState()[0];
	var PickerMainRef = usePickerMainRef();
	var emojiSizeRef = (0, import_react.useRef)();
	var visibleCategories = useVisibleCategoriesState()[0];
	var emojiSizeFromContext = useEmojiSizeState()[0];
	var _React$useState = (0, import_react.useState)(), dimensions = _React$useState[0], setDimensions = _React$useState[1];
	var computeAndSetDimensions = (0, import_react.useCallback)(function() {
		var listEl = EmojiListRef.current;
		if (!listEl) return;
		var emojiElement = listEl.querySelector(EmojiButtonSelector);
		var measured = emojiElement == null ? void 0 : emojiElement.clientHeight;
		if (measured) emojiSizeRef.current = measured;
		var emojiSize = emojiSizeFromContext || measured || emojiSizeRef.current || EMOJI_SIZE_DEFAULT;
		var pickerWidth = listEl.clientWidth;
		if (pickerWidth === 0 || emojiSize === 0) return;
		var emojisPerRow = Math.max(1, Math.floor(pickerWidth / emojiSize));
		setDimensions({
			categoryHeight: Math.ceil(emojiCount / emojisPerRow) * emojiSize,
			emojisPerRow,
			emojiSize
		});
	}, [
		EmojiListRef,
		emojiCount,
		emojiSizeFromContext
	]);
	(0, import_react.useEffect)(function() {
		computeAndSetDimensions();
	}, [
		emojiCount,
		isReactionsMode,
		computeAndSetDimensions,
		visibleCategories.length
	]);
	(0, import_react.useEffect)(function() {
		var rootEl = PickerMainRef.current;
		if (!rootEl) return;
		var handler = function handler(e) {
			var prop = e.propertyName;
			if (prop === "width" || prop === "max-width" || prop === "min-width" || prop === "height" || prop === "max-height" || prop === "min-height") {
				if (typeof queueMicrotask === "function") queueMicrotask(function() {
					return computeAndSetDimensions();
				});
				else requestAnimationFrame(function() {
					return computeAndSetDimensions();
				});
			}
		};
		rootEl.addEventListener("transitionend", handler, { passive: true });
		return function() {
			rootEl.removeEventListener("transitionend", handler);
		};
	}, [PickerMainRef, computeAndSetDimensions]);
	return dimensions;
}
function useIsEmojiHidden() {
	var emojisThatFailedToLoad = useEmojisThatFailedToLoadState()[0];
	var isEmojiFiltered = useIsEmojiFiltered();
	return function(emoji) {
		var unified = emojiUnified(emoji);
		var failedToLoad = emojisThatFailedToLoad.has(unified);
		var filteredOut = isEmojiFiltered(unified);
		return {
			failedToLoad,
			filteredOut,
			hidden: failedToLoad || filteredOut
		};
	};
}
function useEmojiVirtualization(_ref) {
	var categoryEmojis = _ref.categoryEmojis, topOffset = _ref.topOffset, onHeightReady = _ref.onHeightReady, scrollTop = _ref.scrollTop, isCategoryVisible = _ref.isCategoryVisible;
	var isEmojiHidden = useIsEmojiHidden();
	var lazyLoadEmojis = useLazyLoadEmojisConfig();
	var emojiStyle = useEmojiStyleConfig();
	var activeSkinTone = useActiveSkinToneState()[0];
	var isEmojiDisallowed = useIsEmojiDisallowed();
	var getEmojiUrl = useGetEmojiUrlConfig();
	var showVariations = !useSkinTonesDisabledConfig();
	var BodyRef = useBodyRef();
	var virtualizedCounter = 0;
	var emojisToPush = categoryEmojis.filter(function(emoji) {
		var isDisallowed = isEmojiDisallowed(emoji);
		var _isEmojiHidden = isEmojiHidden(emoji), failedToLoad = _isEmojiHidden.failedToLoad, filteredOut = _isEmojiHidden.filteredOut, hidden = _isEmojiHidden.hidden;
		return !failedToLoad && !filteredOut && !hidden && !isDisallowed;
	});
	var dimensions = useCategoryHeight(emojisToPush.length);
	(0, import_react.useEffect)(function() {
		if (dimensions) onHeightReady(dimensions.categoryHeight);
	}, [
		dimensions,
		onHeightReady,
		emojisToPush.length
	]);
	var isVirtualized = function isVirtualized(style) {
		var _BodyRef$current$clie, _BodyRef$current;
		return dimensions && BodyRef.current && shouldVirtualize({
			scrollTop,
			clientHeight: (_BodyRef$current$clie = (_BodyRef$current = BodyRef.current) == null ? void 0 : _BodyRef$current.clientHeight) != null ? _BodyRef$current$clie : 0,
			topOffset,
			style,
			dimensions
		});
	};
	var emojis = emojisToPush.reduce(function(accumulator, emoji, index) {
		var unified = emojiUnified(emoji, activeSkinTone);
		var style = getEmojiPositionStyle(dimensions, index);
		if (isVirtualized(style)) {
			var _BodyRef$current$clie2, _BodyRef$current2;
			virtualizedCounter++;
			preloadEmojiIfNeeded(emoji, emojiStyle, scrollTop, (_BodyRef$current$clie2 = (_BodyRef$current2 = BodyRef.current) == null ? void 0 : _BodyRef$current2.clientHeight) != null ? _BodyRef$current$clie2 : 0, topOffset, style, dimensions, getEmojiUrl);
			return accumulator;
		}
		if (!isCategoryVisible) {
			virtualizedCounter++;
			return accumulator;
		}
		accumulator.push((0, import_react.createElement)(ClickableEmoji, {
			showVariations,
			key: unified,
			emoji,
			unified,
			emojiStyle,
			lazyLoad: lazyLoadEmojis,
			getEmojiUrl,
			style: _extends({}, style, { position: "absolute" })
		}));
		return accumulator;
	}, []);
	return {
		virtualizedCounter,
		emojis,
		dimensions
	};
}
function EmojiCategory(_ref) {
	var categoryConfig = _ref.categoryConfig, children = _ref.children, hidden = _ref.hidden, hiddenOnSearch = _ref.hiddenOnSearch, height = _ref.height;
	var category = categoryFromCategoryConfig(categoryConfig);
	var categoryName = categoryNameFromCategoryConfig(categoryConfig);
	return (0, import_react.createElement)("li", {
		className: cx(styles$7.category, hidden && commonStyles.hidden, hiddenOnSearch && commonInteractionStyles.hiddenOnSearch),
		"data-name": category,
		"aria-label": categoryName
	}, (0, import_react.createElement)("h2", { className: cx(styles$7.label) }, categoryName), (0, import_react.createElement)("div", {
		className: cx(styles$7.categoryContent),
		style: { height }
	}, children));
}
var styles$7 = /*#__PURE__*/ stylesheet.create({
	category: {
		".": ClassNames.category,
		minHeight: "calc(var(--epr-emoji-fullsize) + var(--epr-category-label-height))",
		position: "relative"
	},
	categoryContent: {
		".": ClassNames.categoryContent,
		display: "grid",
		gridGap: "0",
		gridTemplateColumns: "repeat(auto-fill, var(--epr-emoji-fullsize))",
		justifyContent: "space-between",
		margin: "var(--epr-category-padding)",
		position: "relative"
	},
	label: {
		".": ClassNames.label,
		alignItems: "center",
		backdropFilter: "blur(3px)",
		backgroundColor: "var(--epr-category-label-bg-color)",
		color: "var(--epr-category-label-text-color)",
		display: "flex",
		fontSize: "16px",
		fontWeight: "bold",
		height: "var(--epr-category-label-height)",
		margin: "0",
		padding: "var(--epr-category-label-padding)",
		position: "sticky",
		textTransform: "capitalize",
		top: "0",
		width: "100%",
		zIndex: "var(--epr-category-label-z-index)"
	}
});
function MeasureEmoji() {
	var categories = useCategoriesConfig();
	var getEmojisByCategory = useGetEmojisByCategory();
	var emojiStyle = useEmojiStyleConfig();
	var getEmojiUrl = useGetEmojiUrlConfig();
	var lazyLoadEmojis = useLazyLoadEmojisConfig();
	var activeSkinTone = useActiveSkinToneState()[0];
	var _useEmojiSizeState = useEmojiSizeState(), emojiSize = _useEmojiSizeState[0], setEmojiSize = _useEmojiSizeState[1];
	var ref = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(function() {
		if (ref.current) setEmojiSize(ref.current.clientHeight);
	});
	if (emojiSize) return null;
	var firstCategory = categories[0];
	var dummyEmoji = getEmojisByCategory(categoryFromCategoryConfig(firstCategory))[0];
	var unified = dummyEmoji ? emojiUnified$1(dummyEmoji, activeSkinTone) : "";
	if (!dummyEmoji) return null;
	return (0, import_react.createElement)("div", { ref }, (0, import_react.createElement)(ClickableEmoji, {
		emoji: dummyEmoji,
		unified,
		emojiStyle,
		getEmojiUrl,
		lazyLoad: lazyLoadEmojis,
		showVariations: false,
		hidden: false,
		style: {
			opacity: 0,
			pointerEvents: "none",
			position: "absolute",
			top: 0,
			left: 0,
			zIndex: -1,
			height: "var(--epr-emoji-fullsize)",
			width: "var(--epr-emoji-fullsize)"
		}
	}));
}
function EmojiList(_ref) {
	var scrollTop = _ref.scrollTop;
	var categories = useCategoriesConfig();
	var _React$useState = (0, import_react.useState)({}), categoryHeights = _React$useState[0], setCategoryHeights = _React$useState[1];
	var EmojiListRef = useEmojiListRef();
	var getEmojisByCategory = useGetEmojisByCategory$1();
	var labelHeight = getLabelHeight(EmojiListRef.current);
	var topOffset = 0;
	return (0, import_react.createElement)("ul", {
		className: cx(styles$8.emojiList),
		ref: EmojiListRef
	}, (0, import_react.createElement)(MeasureEmoji, null), categories.map(function(categoryConfig) {
		var category = categoryFromCategoryConfig(categoryConfig);
		var currentOffset = topOffset;
		var categoryHeight = categoryHeights[category];
		if (categoryHeight) topOffset += categoryHeight + labelHeight;
		return (0, import_react.createElement)(import_react.Suspense, { key: category }, (0, import_react.createElement)(RenderCategory, {
			categoryEmojis: getEmojisByCategory(category),
			categoryConfig,
			topOffset: currentOffset,
			onHeightReady: function onHeightReady(height) {
				if (categoryHeights[category] !== height) setCategoryHeights(function(prev) {
					var _extends2;
					return _extends({}, prev, (_extends2 = {}, _extends2[category] = height, _extends2));
				});
			},
			scrollTop
		}));
	}));
}
function RenderCategory(_ref2) {
	var categoryEmojis = _ref2.categoryEmojis, categoryConfig = _ref2.categoryConfig, topOffset = _ref2.topOffset, onHeightReady = _ref2.onHeightReady, scrollTop = _ref2.scrollTop;
	var visibleCategories = useVisibleCategoriesState()[0];
	var _useEmojiVirtualizati = useEmojiVirtualization({
		categoryEmojis,
		topOffset,
		onHeightReady,
		scrollTop,
		isCategoryVisible: visibleCategories.includes(categoryConfig.category)
	}), virtualizedCounter = _useEmojiVirtualizati.virtualizedCounter, emojis = _useEmojiVirtualizati.emojis, dimensions = _useEmojiVirtualizati.dimensions;
	return (0, import_react.createElement)(EmojiCategory, {
		categoryConfig,
		height: dimensions == null ? void 0 : dimensions.categoryHeight,
		hidden: !emojis.length && virtualizedCounter === 0
	}, emojis);
}
var styles$8 = /*#__PURE__*/ stylesheet.create({ emojiList: {
	".": ClassNames.emojiList,
	listStyle: "none",
	margin: "0",
	padding: "0"
} });
var SVGTriangle = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjMuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI1MHB4IgoJIGhlaWdodD0iMTVweCIgdmlld0JveD0iMCAwIDUwIDE1IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MCAxNSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnIGlkPSJMYXllcl8xIj4KPC9nPgo8ZyBpZD0iTGF5ZXJfMiI+Cgk8cGF0aCBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNFOEU3RTciIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTEuODYtMC40M2w5LjgzLDExLjUzYzAuNTksMC42OSwxLjU2LDAuNjksMi4xNCwwbDkuODMtMTEuNTMiLz4KCTxwYXRoIGZpbGw9IiMwMTAyMDIiIHN0cm9rZT0iIzE1MTYxNyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMjYuODYtMC40M2w5LjgzLDExLjUzYzAuNTksMC42OSwxLjU2LDAuNjksMi4xNCwwbDkuODMtMTEuNTMiLz4KPC9nPgo8L3N2Zz4=";
var Direction;
(function(Direction) {
	Direction[Direction["Up"] = 0] = "Up";
	Direction[Direction["Down"] = 1] = "Down";
})(Direction || (Direction = {}));
function EmojiVariationPicker() {
	var AnchoredEmojiRef = useAnchoredEmojiRef();
	var VariationPickerRef = useVariationPickerRef();
	var emoji = useEmojiVariationPickerState()[0];
	var emojiStyle = useEmojiStyleConfig();
	var _useVariationPickerTo = useVariationPickerTop(VariationPickerRef), getTop = _useVariationPickerTo.getTop, getMenuDirection = _useVariationPickerTo.getMenuDirection;
	var setAnchoredEmojiRef = useSetAnchoredEmojiRef();
	var getPointerStyle = usePointerStyle(VariationPickerRef);
	var getEmojiUrl = useGetEmojiUrlConfig();
	var button = buttonFromTarget(AnchoredEmojiRef.current);
	var visible = Boolean(emoji && button && emojiHasVariations$1(emoji) && button.classList.contains(ClassNames.emojiHasVariations));
	(0, import_react.useEffect)(function() {
		if (!visible) return;
		focusFirstVisibleEmoji(VariationPickerRef.current);
	}, [
		VariationPickerRef,
		visible,
		AnchoredEmojiRef
	]);
	var top, pointerStyle;
	if (!visible && AnchoredEmojiRef.current) setAnchoredEmojiRef(null);
	else {
		top = getTop();
		pointerStyle = getPointerStyle();
	}
	return (0, import_react.createElement)("div", {
		ref: VariationPickerRef,
		className: cx(styles$9.variationPicker, getMenuDirection() === Direction.Down && styles$9.pointingUp, visible && styles$9.visible),
		style: { top }
	}, visible && emoji ? [emojiUnified$1(emoji)].concat(emojiVariations$1(emoji)).slice(0, 6).map(function(unified) {
		return (0, import_react.createElement)(ClickableEmoji, {
			key: unified,
			emoji,
			unified,
			emojiStyle,
			showVariations: false,
			getEmojiUrl
		});
	}) : null, (0, import_react.createElement)("div", {
		className: cx(styles$9.pointer),
		style: pointerStyle
	}));
}
function usePointerStyle(VariationPickerRef) {
	var AnchoredEmojiRef = useAnchoredEmojiRef();
	return function getPointerStyle() {
		var style = {};
		if (!VariationPickerRef.current) return style;
		if (AnchoredEmojiRef.current) {
			var button = buttonFromTarget(AnchoredEmojiRef.current);
			var offsetLeft = emojiTruOffsetLeft(button);
			if (!button) return style;
			style.left = offsetLeft + (button == null ? void 0 : button.clientWidth) / 2;
		}
		return style;
	};
}
function useVariationPickerTop(VariationPickerRef) {
	var AnchoredEmojiRef = useAnchoredEmojiRef();
	var BodyRef = useBodyRef();
	var direction = Direction.Up;
	return {
		getMenuDirection,
		getTop
	};
	function getMenuDirection() {
		return direction;
	}
	function getTop() {
		direction = Direction.Up;
		var emojiOffsetTop = 0;
		if (!VariationPickerRef.current) return 0;
		var height = elementHeight(VariationPickerRef.current);
		if (AnchoredEmojiRef.current) {
			var _bodyRef$scrollTop;
			var bodyRef = BodyRef.current;
			var button = buttonFromTarget(AnchoredEmojiRef.current);
			var buttonHeight = elementHeight(button);
			emojiOffsetTop = emojiTrueOffsetTop(button);
			if (((_bodyRef$scrollTop = bodyRef == null ? void 0 : bodyRef.scrollTop) != null ? _bodyRef$scrollTop : 0) > emojiOffsetTop - height) {
				direction = Direction.Down;
				emojiOffsetTop += buttonHeight + height;
			}
		}
		return emojiOffsetTop - height;
	}
}
var styles$9 = /*#__PURE__*/ stylesheet.create(/*#__PURE__*/ _extends({
	variationPicker: {
		".": ClassNames.variationPicker,
		position: "absolute",
		right: "15px",
		left: "15px",
		padding: "5px",
		boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
		borderRadius: "3px",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-around",
		opacity: "0",
		visibility: "hidden",
		pointerEvents: "none",
		top: "-100%",
		border: "1px solid var(--epr-picker-border-color)",
		height: "var(--epr-emoji-variation-picker-height)",
		zIndex: "var(--epr-skin-variation-picker-z-index)",
		background: "var(--epr-emoji-variation-picker-bg-color)",
		transform: "scale(0.9)",
		transition: "transform 0.1s ease-out, opacity 0.2s ease-out"
	},
	visible: {
		opacity: "1",
		visibility: "visible",
		pointerEvents: "all",
		transform: "scale(1)"
	},
	pointingUp: {
		".": "pointing-up",
		transformOrigin: "center 0%",
		transform: "scale(0.9)"
	},
	".pointing-up": { pointer: {
		top: "0",
		transform: "rotate(180deg) translateY(100%) translateX(18px)"
	} },
	pointer: {
		".": "epr-emoji-pointer",
		content: "",
		position: "absolute",
		width: "25px",
		height: "15px",
		backgroundRepeat: "no-repeat",
		backgroundPosition: "0 0",
		backgroundSize: "50px 15px",
		top: "100%",
		transform: "translateX(-18px)",
		backgroundImage: "url(" + SVGTriangle + ")"
	}
}, /*#__PURE__*/ darkMode("pointer", { backgroundPosition: "-25px 0" })));
function Body() {
	var BodyRef = useBodyRef();
	var scrollTop = useOnScroll(BodyRef);
	useMouseDownHandlers(BodyRef, MOUSE_EVENT_SOURCE.PICKER);
	useOnMouseMove();
	return (0, import_react.createElement)("div", {
		className: cx(styles$a.body, commonInteractionStyles.hiddenOnReactions),
		ref: BodyRef
	}, (0, import_react.createElement)(EmojiVariationPicker, null), (0, import_react.createElement)(EmojiList, { scrollTop }));
}
var styles$a = /*#__PURE__*/ stylesheet.create({ body: {
	".": ClassNames.scrollBody,
	flex: "1",
	overflowY: "scroll",
	overflowX: "hidden",
	position: "relative"
} });
function detectEmojyPartiallyBelowFold(button, bodyRef) {
	if (!button || !bodyRef) return 0;
	var buttonRect = button.getBoundingClientRect();
	var bodyRect = bodyRef.getBoundingClientRect();
	return bodyRect.height - (buttonRect.y - bodyRect.y);
}
function useEmojiPreviewEvents(allow, setPreviewEmoji) {
	var BodyRef = useBodyRef();
	var isMouseDisallowed = useIsMouseDisallowed();
	var allowMouseMove = useAllowMouseMove();
	(0, import_react.useEffect)(function() {
		if (!allow) return;
		var bodyRef = BodyRef.current;
		bodyRef?.addEventListener("keydown", onEscape, { passive: true });
		bodyRef?.addEventListener("mouseover", onMouseOver, true);
		bodyRef?.addEventListener("focus", onEnter, true);
		bodyRef?.addEventListener("mouseout", onLeave, { passive: true });
		bodyRef?.addEventListener("blur", onLeave, true);
		function onEnter(e) {
			var button = buttonFromTarget(e.target);
			if (!button) return onLeave();
			var _allUnifiedFromEmojiE = allUnifiedFromEmojiElement(button), unified = _allUnifiedFromEmojiE.unified, originalUnified = _allUnifiedFromEmojiE.originalUnified;
			if (!unified || !originalUnified) return onLeave();
			setPreviewEmoji({
				unified,
				originalUnified
			});
		}
		function onLeave(e) {
			if (e) {
				var relatedTarget = e.relatedTarget;
				if (!buttonFromTarget(relatedTarget)) return setPreviewEmoji(null);
			}
			setPreviewEmoji(null);
		}
		function onEscape(e) {
			if (e.key === "Escape") setPreviewEmoji(null);
		}
		function onMouseOver(e) {
			if (isMouseDisallowed()) return;
			var button = buttonFromTarget(e.target);
			if (button) {
				if (detectEmojyPartiallyBelowFold(button, bodyRef) < button.getBoundingClientRect().height) return handlePartiallyVisibleElementFocus(button, setPreviewEmoji);
				focusElement(button);
			}
		}
		return function() {
			bodyRef?.removeEventListener("mouseover", onMouseOver);
			bodyRef?.removeEventListener("mouseout", onLeave);
			bodyRef?.removeEventListener("focus", onEnter, true);
			bodyRef?.removeEventListener("blur", onLeave, true);
			bodyRef?.removeEventListener("keydown", onEscape);
		};
	}, [
		BodyRef,
		allow,
		setPreviewEmoji,
		isMouseDisallowed,
		allowMouseMove
	]);
}
function handlePartiallyVisibleElementFocus(button, setPreviewEmoji) {
	var _document$activeEleme;
	var _allUnifiedFromEmojiE2 = allUnifiedFromEmojiElement(button), unified = _allUnifiedFromEmojiE2.unified, originalUnified = _allUnifiedFromEmojiE2.originalUnified;
	if (!unified || !originalUnified) return;
	(_document$activeEleme = document.activeElement) == null || _document$activeEleme.blur == null || _document$activeEleme.blur();
	setPreviewEmoji({
		unified,
		originalUnified
	});
}
var _stylesheet$create;
var FlexDirection;
(function(FlexDirection) {
	FlexDirection["ROW"] = "FlexRow";
	FlexDirection["COLUMN"] = "FlexColumn";
})(FlexDirection || (FlexDirection = {}));
function Flex(_ref) {
	var children = _ref.children, className = _ref.className, _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style, _ref$direction = _ref.direction, direction = _ref$direction === void 0 ? FlexDirection.ROW : _ref$direction;
	return (0, import_react.createElement)("div", {
		style: _extends({}, style),
		className: cx(styles$b.flex, className, styles$b[direction])
	}, children);
}
var styles$b = /*#__PURE__*/ stylesheet.create((_stylesheet$create = { flex: { display: "flex" } }, _stylesheet$create[FlexDirection.ROW] = { flexDirection: "row" }, _stylesheet$create[FlexDirection.COLUMN] = { flexDirection: "column" }, _stylesheet$create));
function Space(_ref) {
	var className = _ref.className, _ref$style = _ref.style;
	return (0, import_react.createElement)("div", {
		style: _extends({ flex: 1 }, _ref$style === void 0 ? {} : _ref$style),
		className: cx(className)
	});
}
function Absolute(_ref) {
	var children = _ref.children, className = _ref.className, style = _ref.style;
	return (0, import_react.createElement)("div", {
		style: _extends({}, style, { position: "absolute" }),
		className
	}, children);
}
function Relative(_ref) {
	var children = _ref.children, className = _ref.className, style = _ref.style;
	return (0, import_react.createElement)("div", {
		style: _extends({}, style, { position: "relative" }),
		className
	}, children);
}
function BtnSkinToneVariation(_ref) {
	var isOpen = _ref.isOpen, onClick = _ref.onClick, isActive = _ref.isActive, skinToneVariation = _ref.skinToneVariation, style = _ref.style;
	return (0, import_react.createElement)(Button, {
		style,
		onClick,
		className: cx("epr-tone-" + skinToneVariation, styles$c.tone, !isOpen && styles$c.closedTone, isActive && styles$c.active),
		"aria-pressed": isActive,
		"aria-label": "Skin tone " + skinTonesNamed[skinToneVariation]
	});
}
var styles$c = /*#__PURE__*/ stylesheet.create({
	closedTone: {
		opacity: "0",
		zIndex: "0"
	},
	active: {
		".": "epr-active",
		zIndex: "1",
		opacity: "1"
	},
	tone: {
		".": "epr-tone",
		width: "var(--epr-skin-tone-size)",
		display: "block",
		cursor: "pointer",
		borderRadius: "4px",
		height: "var(--epr-skin-tone-size)",
		position: "absolute",
		right: "0",
		transition: "transform 0.3s ease-in-out, opacity 0.35s ease-in-out",
		zIndex: "0",
		border: "1px solid var(--epr-skin-tone-outer-border-color)",
		boxShadow: "inset 0px 0px 0 1px var(--epr-skin-tone-inner-border-color)",
		":hover": { boxShadow: "0 0 0 3px var(--epr-active-skin-hover-color), inset 0px 0px 0 1px var(--epr-skin-tone-inner-border-color)" },
		":focus": { boxShadow: "0 0 0 3px var(--epr-focus-bg-color)" },
		"&.epr-tone-neutral": { backgroundColor: "#ffd225" },
		"&.epr-tone-1f3fb": { backgroundColor: "#ffdfbd" },
		"&.epr-tone-1f3fc": { backgroundColor: "#e9c197" },
		"&.epr-tone-1f3fd": { backgroundColor: "#c88e62" },
		"&.epr-tone-1f3fe": { backgroundColor: "#a86637" },
		"&.epr-tone-1f3ff": { backgroundColor: "#60463a" }
	}
});
var ITEM_SIZE = 28;
function SkinTonePickerMenu() {
	return (0, import_react.createElement)(Relative, { style: { height: ITEM_SIZE } }, (0, import_react.createElement)(Absolute, { style: {
		bottom: 0,
		right: 0
	} }, (0, import_react.createElement)(SkinTonePicker, { direction: SkinTonePickerDirection.VERTICAL })));
}
function SkinTonePicker(_ref) {
	var _ref$direction = _ref.direction, direction = _ref$direction === void 0 ? SkinTonePickerDirection.HORIZONTAL : _ref$direction;
	var SkinTonePickerRef = useSkinTonePickerRef();
	var isDisabled = useSkinTonesDisabledConfig();
	var _useSkinToneFanOpenSt = useSkinToneFanOpenState(), isOpen = _useSkinToneFanOpenSt[0], setIsOpen = _useSkinToneFanOpenSt[1];
	var _useActiveSkinToneSta = useActiveSkinToneState(), activeSkinTone = _useActiveSkinToneSta[0], setActiveSkinTone = _useActiveSkinToneSta[1];
	var onSkinToneChange = useOnSkinToneChangeConfig();
	var closeAllOpenToggles = useCloseAllOpenToggles();
	var focusSearchInput = useFocusSearchInput();
	if (isDisabled) return null;
	var fullWidth = ITEM_SIZE * skinToneVariations.length + "px";
	var expandedSize = isOpen ? fullWidth : ITEM_SIZE + "px";
	var vertical = direction === SkinTonePickerDirection.VERTICAL;
	return (0, import_react.createElement)(Relative, {
		className: cx(styles$d.skinTones, vertical && styles$d.vertical, isOpen && styles$d.open, vertical && isOpen && styles$d.verticalShadow),
		style: vertical ? {
			flexBasis: expandedSize,
			height: expandedSize
		} : { flexBasis: expandedSize }
	}, (0, import_react.createElement)("div", {
		className: cx(styles$d.select),
		ref: SkinTonePickerRef
	}, skinToneVariations.map(function(skinToneVariation, i) {
		var active = skinToneVariation === activeSkinTone;
		return (0, import_react.createElement)(BtnSkinToneVariation, {
			key: skinToneVariation,
			skinToneVariation,
			isOpen,
			style: { transform: cx(vertical ? "translateY(-" + i * (isOpen ? ITEM_SIZE : 0) + "px)" : "translateX(-" + i * (isOpen ? ITEM_SIZE : 0) + "px)", isOpen && active && "scale(1.3)") },
			isActive: active,
			onClick: function onClick() {
				if (isOpen) {
					setActiveSkinTone(skinToneVariation);
					onSkinToneChange(skinToneVariation);
					focusSearchInput();
				} else setIsOpen(true);
				closeAllOpenToggles();
			}
		});
	})));
}
var SkinTonePickerDirection;
(function(SkinTonePickerDirection) {
	SkinTonePickerDirection["VERTICAL"] = "epr-vertical";
	SkinTonePickerDirection["HORIZONTAL"] = "epr-horizontal";
})(SkinTonePickerDirection || (SkinTonePickerDirection = {}));
var styles$d = /*#__PURE__*/ stylesheet.create({
	skinTones: {
		".": "epr-skin-tones",
		"--": { "--epr-skin-tone-size": "15px" },
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end",
		transition: "all 0.3s ease-in-out",
		padding: "10px 0"
	},
	vertical: {
		padding: "9px",
		alignItems: "flex-end",
		flexDirection: "column",
		borderRadius: "6px",
		border: "1px solid var(--epr-bg-color)"
	},
	verticalShadow: { boxShadow: "0px 0 7px var(--epr-picker-border-color)" },
	open: {
		backdropFilter: "blur(5px)",
		background: "var(--epr-skin-tone-picker-menu-color)",
		".epr-active": { border: "1px solid var(--epr-active-skin-tone-indicator-border-color)" }
	},
	select: {
		".": "epr-skin-tone-select",
		position: "relative",
		width: "var(--epr-skin-tone-size)",
		height: "var(--epr-skin-tone-size)"
	}
});
function Preview() {
	var previewConfig = usePreviewConfig();
	var isSkinToneInPreview = useIsSkinToneInPreview();
	var reactionsOpen = useReactionsModeState()[0];
	if (!previewConfig.showPreview) return null;
	return (0, import_react.createElement)(Flex, { className: cx(styles$e.preview, commonInteractionStyles.hiddenOnReactions, reactionsOpen && styles$e.hideOnReactions) }, (0, import_react.createElement)(PreviewBody, null), (0, import_react.createElement)(Space, null), isSkinToneInPreview ? (0, import_react.createElement)(SkinTonePickerMenu, null) : null);
}
function PreviewBody() {
	var _previewEmoji$unified;
	var previewConfig = usePreviewConfig();
	var _useState = (0, import_react.useState)(null), previewEmoji = _useState[0], setPreviewEmoji = _useState[1];
	var emojiStyle = useEmojiStyleConfig();
	var variationPickerEmoji = useEmojiVariationPickerState()[0];
	var getEmojiUrl = useGetEmojiUrlConfig();
	var emojiByUnified = usePickerDataContext().emojiByUnified;
	useEmojiPreviewEvents(previewConfig.showPreview, setPreviewEmoji);
	var emoji = emojiByUnified((_previewEmoji$unified = previewEmoji == null ? void 0 : previewEmoji.unified) != null ? _previewEmoji$unified : previewEmoji == null ? void 0 : previewEmoji.originalUnified);
	var show = emoji != null && previewEmoji != null;
	return (0, import_react.createElement)(PreviewContent, null);
	function PreviewContent() {
		var defaultEmoji = variationPickerEmoji != null ? variationPickerEmoji : emojiByUnified(previewConfig.defaultEmoji);
		if (!defaultEmoji) return null;
		var defaultText = variationPickerEmoji ? emojiName$1(variationPickerEmoji) : previewConfig.defaultCaption;
		return (0, import_react.createElement)(import_react.Fragment, null, (0, import_react.createElement)("div", null, show ? (0, import_react.createElement)(ViewOnlyEmoji, {
			unified: previewEmoji == null ? void 0 : previewEmoji.unified,
			emoji,
			emojiStyle,
			size: 45,
			getEmojiUrl,
			className: cx(styles$e.emoji)
		}) : defaultEmoji ? (0, import_react.createElement)(ViewOnlyEmoji, {
			unified: emojiUnified$1(defaultEmoji),
			emoji: defaultEmoji,
			emojiStyle,
			size: 45,
			getEmojiUrl,
			className: cx(styles$e.emoji)
		}) : null), (0, import_react.createElement)("div", { className: cx(styles$e.label) }, show ? emojiName$1(emoji) : defaultText));
	}
}
var styles$e = /*#__PURE__*/ stylesheet.create({
	preview: {
		alignItems: "center",
		borderTop: "1px solid var(--epr-preview-border-color)",
		height: "var(--epr-preview-height)",
		padding: "0 var(--epr-horizontal-padding)",
		position: "relative",
		zIndex: "var(--epr-preview-z-index)"
	},
	label: {
		color: "var(--epr-preview-text-color)",
		fontSize: "var(--epr-preview-text-size)",
		padding: "var(--epr-preview-text-padding)",
		textTransform: "capitalize"
	},
	emoji: { padding: "0" },
	hideOnReactions: {
		opacity: "0",
		transition: "opacity 0.5s ease-in-out"
	}
});
function categoryNameFromDom($category) {
	var _$category$getAttribu;
	return (_$category$getAttribu = $category == null ? void 0 : $category.getAttribute("data-name")) != null ? _$category$getAttribu : null;
}
function useActiveCategoryScrollDetection(_ref) {
	var setActiveCategory = _ref.setActiveCategory, setVisibleCategories = _ref.setVisibleCategories;
	var BodyRef = useBodyRef();
	(0, import_react.useEffect)(function() {
		var visibleCategories = /* @__PURE__ */ new Map();
		var intersectingCategories = /* @__PURE__ */ new Map();
		var bodyRef = BodyRef.current;
		var observer = new IntersectionObserver(function(entries) {
			if (!bodyRef) return;
			for (var _iterator = _createForOfIteratorHelperLoose(entries), _step; !(_step = _iterator()).done;) {
				var entry = _step.value;
				var _id = categoryNameFromDom(entry.target);
				if (!_id) continue;
				visibleCategories.set(_id, entry.intersectionRatio);
				intersectingCategories.set(_id, entry.isIntersecting);
			}
			var ratios = Array.from(visibleCategories);
			setVisibleCategories(ratios.filter(function(_ref2) {
				var id = _ref2[0];
				return _ref2[1] > 0 || intersectingCategories.get(id);
			}).map(function(_ref3) {
				return _ref3[0];
			}));
			var lastCategory = ratios[ratios.length - 1];
			if ((lastCategory == null ? void 0 : lastCategory[1]) == 1) return setActiveCategory(lastCategory[0]);
			for (var _i = 0, _ratios = ratios; _i < _ratios.length; _i++) {
				var _ratios$_i = _ratios[_i], id = _ratios$_i[0];
				if (_ratios$_i[1]) {
					setActiveCategory(id);
					break;
				}
			}
		}, {
			root: bodyRef,
			threshold: [0, 1]
		});
		bodyRef?.querySelectorAll(asSelectors(ClassNames.category)).forEach(function(el) {
			observer.observe(el);
		});
		return function() {
			observer.disconnect();
		};
	}, [
		BodyRef,
		setActiveCategory,
		setVisibleCategories
	]);
}
function useScrollCategoryIntoView() {
	var BodyRef = useBodyRef();
	var PickerMainRef = usePickerMainRef();
	return function scrollCategoryIntoView(category) {
		var _BodyRef$current;
		if (!BodyRef.current) return;
		var $category = (_BodyRef$current = BodyRef.current) == null ? void 0 : _BodyRef$current.querySelector("[data-name=\"" + category + "\"]");
		if (!$category) return;
		var offsetTop = $category.offsetTop || 0;
		scrollTo(PickerMainRef.current, offsetTop);
	};
}
function useShouldHideCustomEmojis() {
	var customCategoryConfig = useCustomEmojisConfig();
	if (!customCategoryConfig) return false;
	return customCategoryConfig.length === 0;
}
var SVGNavigation = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjMuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHdpZHRoPSIyMDBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMDAgODAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8ZyBpZD0iTGF5ZXJfMTEiPgoJPGc+CgkJPHBhdGggZmlsbD0iIzMzNzFCNyIgc3Ryb2tlPSIjMzM3MUI3IiBzdHJva2Utd2lkdGg9IjAuMSIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTIuOCwyOS41YzAuNiwwLDEuMS0wLjUsMS4xLTEuMQoJCQljMC0wLjYtMC41LTEuMi0xLjEtMS4yYy0wLjYsMC0xLjIsMC41LTEuMiwxLjJDMTEuNiwyOSwxMi4yLDI5LjUsMTIuOCwyOS41eiBNMTIuOCwyOGMwLjIsMCwwLjQsMC4yLDAuNCwwLjQKCQkJYzAsMC4yLTAuMiwwLjQtMC40LDAuNGMtMC4yLDAtMC40LTAuMi0wLjQtMC40QzEyLjQsMjguMSwxMi42LDI4LDEyLjgsMjh6Ii8+CgkJPHBhdGggZmlsbD0iIzMzNzFCNyIgc3Ryb2tlPSIjMzM3MUI3IiBzdHJva2Utd2lkdGg9IjAuMSIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTAsMjNjLTMuOCwwLTcsMy4xLTcsN2MwLDMuOCwzLjEsNyw3LDcKCQkJczctMy4xLDctN0MxNywyNi4yLDEzLjgsMjMsMTAsMjN6IE0xMCwzNi4yYy0zLjQsMC02LjItMi44LTYuMi02LjJjMC0zLjQsMi44LTYuMiw2LjItNi4yczYuMiwyLjgsNi4yLDYuMgoJCQlDMTYuMiwzMy40LDEzLjQsMzYuMiwxMCwzNi4yeiIvPgoJCTxwYXRoIGZpbGw9IiMzMzcxQjciIHN0cm9rZT0iIzMzNzFCNyIgc3Ryb2tlLXdpZHRoPSIwLjEiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTE0LjYsMzEuMmMtMC4xLTAuMS0wLjItMC4yLTAuMy0wLjJINS43CgkJCWMtMC4xLDAtMC4yLDAuMS0wLjMsMC4yYy0wLjEsMC4xLTAuMSwwLjIsMCwwLjRjMC43LDIsMi41LDMuMyw0LjYsMy4zczMuOS0xLjMsNC42LTMuM0MxNC43LDMxLjUsMTQuNywzMS4zLDE0LjYsMzEuMnogTTEwLDM0LjEKCQkJYy0xLjYsMC0zLTAuOS0zLjctMi4yaDcuM0MxMywzMy4yLDExLjYsMzQuMSwxMCwzNC4xeiIvPgoJCTxwYXRoIGZpbGw9IiMzMzcxQjciIHN0cm9rZT0iIzMzNzFCNyIgc3Ryb2tlLXdpZHRoPSIwLjEiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTcuMiwyOS41YzAuNiwwLDEuMi0wLjUsMS4yLTEuMQoJCQljMC0wLjYtMC41LTEuMi0xLjItMS4yYy0wLjYsMC0xLjEsMC41LTEuMSwxLjJDNi4xLDI5LDYuNiwyOS41LDcuMiwyOS41eiBNNy4yLDI4YzAuMiwwLDAuNCwwLjIsMC40LDAuNGMwLDAuMi0wLjIsMC40LTAuNCwwLjQKCQkJYy0wLjIsMC0wLjQtMC4yLTAuNC0wLjRDNi44LDI4LjEsNywyOCw3LjIsMjh6Ii8+Cgk8L2c+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzM3MUI3IiBkPSJNNjQuMSwzMy40bDIuMywwYzAuMiwwLDAuNCwwLjIsMC40LDAuNHYyLjFjMCwwLjItMC4yLDAuNC0wLjQsMC40aC0yLjMKCQkJCWMtMC4yLDAtMC40LTAuMi0wLjQtMC40di0yLjFDNjMuNywzMy42LDYzLjgsMzMuNCw2NC4xLDMzLjR6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNzFCNyIgZD0iTTczLjUsMzMuNWgyLjRjMC4yLDAsMC40LDAuMiwwLjQsMC40djJjMCwwLjItMC4yLDAuNC0wLjQsMC40aC0yLjQKCQkJCWMtMC4yLDAtMC40LTAuMi0wLjQtMC40bDAtMkM3My4xLDMzLjYsNzMuMywzMy41LDczLjUsMzMuNXoiLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzM3MUI3IiBkPSJNNjMuNywyOC40aDEyLjZ2NUg2My43VjI4LjR6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNzFCNyIgZD0iTTY1LjUsMjMuNmg4LjljMSwwLDEuOSwwLjgsMS45LDEuOXYzLjFINjMuN3YtMy4xQzYzLjcsMjQuNSw2NC41LDIzLjYsNjUuNSwyMy42eiIvPgoJCQk8ZWxsaXBzZSBmaWxsPSIjMzM3MUI3IiBjeD0iNjYuMiIgY3k9IjMwLjkiIHJ4PSIwLjkiIHJ5PSIxIi8+CgkJCTxlbGxpcHNlIGZpbGw9IiMzMzcxQjciIGN4PSI3My44IiBjeT0iMzAuOSIgcng9IjAuOSIgcnk9IjEiLz4KCQk8L2c+Cgk8L2c+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzM3MUI3IiBkPSJNOTYuNCwzMGMwLDMuNi0yLjksNi41LTYuNCw2LjVzLTYuNC0yLjktNi40LTYuNXMyLjktNi41LDYuNC02LjVTOTYuNCwyNi40LDk2LjQsMzB6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNzFCNyIgZD0iTTk2LjMsMjguNmMwLDAsMCwwLjEsMCwwLjFjLTAuOSwwLjEtMi45LDAuMS00LjYtMS4xYy0xLjEtMC44LTItMS43LTIuNi0yLjUKCQkJCWMtMC4zLTAuNC0wLjYtMC44LTAuNy0xYy0wLjEtMC4xLTAuMS0wLjEtMC4xLTAuMmMwLjUtMC4xLDEuMi0wLjIsMi0wLjFjMS4yLDAsMi41LDAuMywzLjUsMS4xYzEsMC44LDEuNywxLjgsMi4xLDIuOAoJCQkJQzk2LjEsMjcuOSw5Ni4yLDI4LjMsOTYuMywyOC42eiIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMzMzcxQjciIGQ9Ik04NCwzMi4yYzAsMCwwLTAuMSwwLTAuMWMwLjktMC4yLDIuOS0wLjQsNC43LDAuNmMxLjEsMC43LDEuOSwxLjUsMi40LDIuMwoJCQkJYzAuNCwwLjUsMC42LDEsMC43LDEuM2MtMC40LDAuMS0xLDAuMi0xLjcsMC4zYy0xLDAtMi4xLTAuMS0zLjItMC44cy0xLjktMS42LTIuNC0yLjVDODQuMiwzMi44LDg0LjEsMzIuNSw4NCwzMi4yeiIvPgoJCTwvZz4KCTwvZz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMzMzcxQjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZD0iTTExNi4zLDI2LjhsLTEuNCwybC0wLjgtMC44bC0wLjYtMC42bDAsMC45bC0wLjEsOC4yaC02LjgKCQkJCWwtMC4xLTguMmwwLTAuOWwtMC42LDAuNmwtMC44LDAuOGwtMS40LTJsMi42LTIuOWMwLjEtMC4xLDAuMi0wLjEsMC4zLTAuMWgxLjNsMC40LDAuN2MwLjcsMS4zLDIuNiwxLjMsMy4zLTAuMWwwLjMtMC42aDEuMgoJCQkJYzAuMSwwLDAuMiwwLDAuMywwLjFsMC4zLTAuM2wtMC4zLDAuM0wxMTYuMywyNi44eiIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMzMzcxQjciIGQ9Ik0xMTAuMSwyNy43aDJ2MC45YzAsMC40LTAuNCwwLjctMSwwLjdjLTAuNiwwLTEtMC4zLTEtMC43TDExMC4xLDI3LjdMMTEwLjEsMjcuN3oiLz4KCQk8L2c+Cgk8L2c+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzM3MUI3IiBkPSJNMTI2LjgsMzQuM2MwLDEuMi0xLDIuMi0yLjIsMi4ycy0yLjItMS0yLjItMi4yczEtMi4yLDIuMi0yLjJTMTI2LjgsMzMuMSwxMjYuOCwzNC4zeiIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMzMzcxQjciIGQ9Ik0xMzcuNiwzNC4zYzAsMS4yLTEsMi4yLTIuMiwyLjJjLTEuMiwwLTIuMi0xLTIuMi0yLjJzMS0yLjIsMi4yLTIuMgoJCQkJQzEzNi42LDMyLjEsMTM3LjYsMzMuMSwxMzcuNiwzNC4zeiIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMzMzcxQjciIGQ9Ik0xMjYuOCwyNC40djkuOSIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMzMzcxQjciIGQ9Ik0xMzcuNywyNC40djkuOSIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMzMzcxQjciIGQ9Ik0xMjYuOCwyMy41aDEwLjh2Mi43aC0xMC44QzEyNi44LDI2LjIsMTI2LjgsMjMuNSwxMjYuOCwyMy41eiIvPgoJCTwvZz4KCTwvZz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBmaWxsPSIjMzM3MUI3IiBkPSJNMTcwLjgsMjMuMUwxNzAuOCwyMy4xYy0wLjMsMC0wLjUsMC0wLjgsMGMtMi4xLDAtNCwxLTUuMywyLjVsLTAuMSwwbC0wLjEtMC4xbC0xLTEuMmwtMC4zLDMuNGwzLjQsMC4zCgkJCQlsLTEuMS0xLjNsLTAuMS0wLjFsMC4xLTAuMWMxLjEtMS41LDMtMi4zLDUtMi4xbDAsMGMzLjIsMC4zLDUuNSwzLjEsNS4yLDYuM2MtMC4zLDMtMy4xLDUuMy02LjEsNS4xYy0zLjEtMC4yLTUuNC0yLjktNS4zLTYKCQkJCWwtMS4zLTAuMWMtMC4yLDMuOCwyLjYsNy4xLDYuMyw3LjRjMy45LDAuMyw3LjMtMi42LDcuNi02LjVDMTc3LjIsMjYuOCwxNzQuNCwyMy41LDE3MC44LDIzLjF6Ii8+CgkJCTxwYXRoIGZpbGw9IiMzMzcxQjciIGQ9Ik0xNzAuMywyNy40YzAtMC4zLTAuMy0wLjYtMC42LTAuNnMtMC42LDAuMy0wLjYsMC42djMuMmMwLDAuMiwwLjEsMC4zLDAuMiwwLjRjMC4xLDAuMSwwLjMsMC4yLDAuNCwwLjIKCQkJCWgyLjRjMC40LDAsMC42LTAuMywwLjYtMC42YzAtMC40LTAuMy0wLjYtMC42LTAuNmgtMS42aC0wLjJ2LTAuMkwxNzAuMywyNy40TDE3MC4zLDI3LjR6Ii8+CgkJPC9nPgoJPC9nPgoJPGc+CgkJPGc+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNzFCNyIgZD0iTTE4Ni4yLDIzLjRoNy43YzEuNSwwLDIuNywxLjIsMi43LDIuN3Y3LjdjMCwxLjUtMS4yLDIuNy0yLjcsMi43aC03LjcKCQkJCWMtMS41LDAtMi43LTEuMi0yLjctMi43di03LjdDMTgzLjQsMjQuNiwxODQuNywyMy40LDE4Ni4yLDIzLjR6Ii8+CgkJCTxlbGxpcHNlIGZpbGw9IiMzMzcxQjciIGN4PSIxODYiIGN5PSIyOC45IiByeD0iMC43IiByeT0iMC43Ii8+CgkJCTxlbGxpcHNlIGZpbGw9IiMzMzcxQjciIGN4PSIxOTQiIGN5PSIyNi43IiByeD0iMC43IiByeT0iMC43Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNzFCNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMTg2LDMzLjNsMC40LTAuM2MwLjQtMC4zLDEtMC4zLDEuNS0wLjFsMSwwLjQKCQkJCWMwLjUsMC4yLDEsMC4yLDEuNS0wLjFsMC44LTAuNWMwLjQtMC4zLDEtMC4zLDEuNS0wLjFsMS44LDAuOCIvPgoJCTwvZz4KCTwvZz4KCTxwYXRoIGZpbGw9IiMzMzcxQjciIHN0cm9rZT0iIzMzNzFCNyIgc3Ryb2tlLXdpZHRoPSIwLjI1IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0xNTYsMjQuM2MtMC4yLTAuMS0wLjQtMC4xLTAuNSwwCgkJYzAsMC0wLjIsMC4xLTAuOSwwLjJjLTAuNywwLTIuNC0wLjEtMy44LTAuNmMtMC44LTAuMy0xLjctMC41LTIuNS0wLjVjLTAuMiwwLTAuNCwwLTAuNSwwYy0xLjMsMC0yLjUsMC4zLTMuNiwxCgkJYy0wLjIsMC4xLTAuMiwwLjItMC4yLDAuNHYxMS42YzAsMC4zLDAuMSwwLjUsMC4zLDAuNWMwLjYsMCwwLjUtMC40LDAuNS0wLjZ2LTUuN2MwLjctMC4zLDMuMi0xLjEsNS44LTAuMQoJCWMxLjYsMC42LDMuNSwwLjcsNC4zLDAuN2MwLjgsMCwxLjMtMC4zLDEuMy0wLjNjMC4yLTAuMSwwLjMtMC4yLDAuMy0wLjR2LTUuN0MxNTYuMiwyNC42LDE1Ni4xLDI0LjQsMTU2LDI0LjN6IE0xNTUuNiwzMC4yCgkJYy0wLjEsMC0wLjcsMC4xLTEsMC4xYy0wLjcsMC0yLjQtMC4xLTMuOC0wLjZjLTIuNS0xLTUtMC41LTYuMi0wLjF2LTQuOWMwLjktMC41LDIuMi0wLjcsMy4yLTAuN2MwLjEsMCwwLjMsMCwwLjQsMAoJCWMwLjcsMCwxLjUsMC4yLDIuMiwwLjRjMS42LDAuNiwzLjUsMC43LDQuMywwLjdjMC4yLDAsMC44LDAsMS0wLjFWMzAuMnoiLz4KCTxnPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNzFCNyIgZD0iTTQ4LjEsMjMuNWgzLjdjMi41LDAsNC41LDIsNC41LDQuNWMwLDAuNS0wLjQsMC45LTAuOSwwLjlINDQuNWMtMC41LDAtMC45LTAuNC0wLjktMC45CgkJCUM0My42LDI1LjUsNDUuNiwyMy41LDQ4LjEsMjMuNXoiLz4KCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMzMzcxQjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZD0iTTQzLjUsMjguOGMtMC4yLDAuMS0wLjUsMS4yLDAsMS41YzEuNCwxLDguNSwwLjgsMTEuMywwLjYKCQkJYzAuOC0wLjEsMS42LTAuNCwxLjctMS4yYzAtMC4zLTAuMS0wLjYtMC42LTAuOSIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNzFCNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNNDMuNSwzMC42TDQzLjMsMzFjLTAuMiwwLjUsMC4yLDEsMC43LDAuOWMwLjMtMC4xLDAuNSwwLDAuNywwLjMKCQkJbDAuMSwwLjJjMC4zLDAuNSwxLDAuNiwxLjUsMC4ybDAsMGMwLjMtMC4yLDAuNy0wLjMsMS0wLjJsMC44LDAuM2MwLjQsMC4yLDAuOCwwLjEsMS4yLDBsMC41LTAuMmMwLjQtMC4yLDAuOS0wLjIsMS4zLDBsMC41LDAuMgoJCQljMC40LDAuMiwwLjgsMC4yLDEuMiwwbDAuMi0wLjFjMC4zLTAuMiwwLjgtMC4yLDEuMSwwLjFsMC4yLDAuMmMwLjMsMC4zLDAuOCwwLjIsMS0wLjJsMC4xLTAuMmMwLjEtMC4yLDAtMC4zLDAuMi0wLjMKCQkJYzAuNSwwLDEuMi0wLjMsMS4xLTAuN2wtMC40LTEuMSIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNzFCNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNNDMuNSwzMi4yYy0wLjEsMC4yLTAuMywwLjgsMCwxLjFjMC4zLDAuNCwzLDEuMSw2LjQsMS4xCgkJCWMyLjIsMCw0LjYtMC4zLDYtMC42YzAuNS0wLjEsMC45LTAuNSwwLjgtMC45YzAtMC4yLTAuMi0wLjUtMC40LTAuNyIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNzFCNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNNDMuNSwzMy4zYzAsMC41LDAuNiwyLjMsMS4zLDIuN2MxLjgsMC44LDUuNywwLjcsOC4xLDAuNQoJCQljMS4zLTAuMSwyLjUtMC43LDMuMi0xLjhjMC4zLTAuNSwwLjUtMSwwLjUtMS40Ii8+CgkJPGVsbGlwc2UgZmlsbD0iIzMzNzFCNyIgY3g9IjUxLjYiIGN5PSIyNi41IiByeD0iMC4zIiByeT0iMC40Ii8+CgkJPGVsbGlwc2UgZmlsbD0iIzMzNzFCNyIgY3g9IjUzIiBjeT0iMjUiIHJ4PSIwLjMiIHJ5PSIwLjQiLz4KCQk8ZWxsaXBzZSBmaWxsPSIjMzM3MUI3IiBjeD0iNTMiIGN5PSIyNy4yIiByeD0iMC4zIiByeT0iMC40Ii8+CgkJPGVsbGlwc2UgZmlsbD0iIzMzNzFCNyIgY3g9IjU0LjMiIGN5PSIyNi41IiByeD0iMC4zIiByeT0iMC40Ii8+CgkJPGVsbGlwc2UgZmlsbD0iIzMzNzFCNyIgY3g9IjUwLjkiIGN5PSIyNSIgcng9IjAuMyIgcnk9IjAuNCIvPgoJPC9nPgoJPGc+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzM3MUI3IiBkPSJNMjQuMiwzMXYtNy42YzAuMSwwLjEsMC44LDAuOSwyLjgsMy4xYzIuNS0xLjYsNS42LTAuNyw2LjksMGwyLjQtMy4xdjcuMQoJCQljMCwxLjItMC4xLDIuNS0wLjksMy40Yy0xLDEuMi0yLjcsMi41LTUuMywyLjVjLTIuOSwwLTQuNS0xLjUtNS4zLTIuOUMyNC4yLDMyLjksMjQuMiwzMiwyNC4yLDMxeiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNzFCNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMjEuMiwzMGw1LjQsMS4yIi8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzM3MUI3IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik0yMS4yLDM0LjFsNS40LTEuMiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNzFCNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMzguOCwzMGwtNS40LDEuMiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNzFCNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMzguOCwzNC4xbC01LjQtMS4yIi8+CgkJPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiMzMzcxQjciIGQ9Ik0yOS41LDMyLjRMMjksMzEuN2MtMC4yLTAuMywwLTAuNiwwLjMtMC42aDEuNAoJCQljMC4zLDAsMC41LDAuNCwwLjMsMC42bC0wLjcsMWwwLDBjLTAuNywxLjItMi42LDEuMS0zLjEtMC4zbC0wLjEtMC4yYy0wLjEtMC4yLDAtMC40LDAuMi0wLjVzMC40LDAsMC41LDAuMmwwLjEsMC4yCgkJCUMyOC4zLDMyLjgsMjkuMSwzMi45LDI5LjUsMzIuNHoiLz4KCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMzMzcxQjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZD0iTTMyLjQsMzIuMWwtMC4xLDAuMmMtMC40LDEtMS44LDEuMS0yLjMsMC4yIi8+CgkJPGVsbGlwc2UgZmlsbD0iIzMzNzFCNyIgY3g9IjI3LjYiIGN5PSIyOS43IiByeD0iMC43IiByeT0iMC43Ii8+CgkJPGVsbGlwc2UgZmlsbD0iIzMzNzFCNyIgY3g9IjMyLjQiIGN5PSIyOS43IiByeD0iMC43IiByeT0iMC43Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBmaWxsPSIjQzBDMEJGIiBzdHJva2U9IiNDMEMwQkYiIHN0cm9rZS13aWR0aD0iMC4xIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0xMi44LDQ5LjVjMC42LDAsMS4xLTAuNSwxLjEtMS4xCgkJCWMwLTAuNi0wLjUtMS4yLTEuMS0xLjJjLTAuNiwwLTEuMiwwLjUtMS4yLDEuMkMxMS42LDQ5LDEyLjIsNDkuNSwxMi44LDQ5LjV6IE0xMi44LDQ4YzAuMiwwLDAuNCwwLjIsMC40LDAuNAoJCQljMCwwLjItMC4yLDAuNC0wLjQsMC40Yy0wLjIsMC0wLjQtMC4yLTAuNC0wLjRDMTIuNCw0OC4xLDEyLjYsNDgsMTIuOCw0OHoiLz4KCQk8cGF0aCBmaWxsPSIjQzBDMEJGIiBzdHJva2U9IiNDMEMwQkYiIHN0cm9rZS13aWR0aD0iMC4xIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0xNC42LDUxLjJjLTAuMS0wLjEtMC4yLTAuMi0wLjMtMC4ySDUuNwoJCQljLTAuMSwwLTAuMiwwLjEtMC4zLDAuMmMtMC4xLDAuMS0wLjEsMC4yLDAsMC40YzAuNywyLDIuNSwzLjMsNC42LDMuM3MzLjktMS4zLDQuNi0zLjNDMTQuNyw1MS41LDE0LjcsNTEuMywxNC42LDUxLjJ6IE0xMCw1NC4xCgkJCWMtMS42LDAtMy0wLjktMy43LTIuMmg3LjNDMTMsNTMuMiwxMS42LDU0LjEsMTAsNTQuMXoiLz4KCQk8cGF0aCBmaWxsPSIjQzBDMEJGIiBzdHJva2U9IiNDMEMwQkYiIHN0cm9rZS13aWR0aD0iMC4xIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik03LjIsNDkuNWMwLjYsMCwxLjItMC41LDEuMi0xLjEKCQkJYzAtMC42LTAuNS0xLjItMS4yLTEuMmMtMC42LDAtMS4xLDAuNS0xLjEsMS4yQzYuMSw0OSw2LjYsNDkuNSw3LjIsNDkuNXogTTcuMiw0OGMwLjIsMCwwLjQsMC4yLDAuNCwwLjRjMCwwLjItMC4yLDAuNC0wLjQsMC40CgkJCWMtMC4yLDAtMC40LTAuMi0wLjQtMC40QzYuOCw0OC4xLDcsNDgsNy4yLDQ4eiIvPgoJCTxwYXRoIGZpbGw9IiNDMEMwQkYiIHN0cm9rZT0iI0MwQzBCRiIgc3Ryb2tlLXdpZHRoPSIwLjEiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTEwLDQzYy0zLjgsMC03LDMuMS03LDdjMCwzLjgsMy4xLDcsNyw3CgkJCXM3LTMuMSw3LTdDMTcsNDYuMiwxMy44LDQzLDEwLDQzeiBNMTAsNTYuMmMtMy40LDAtNi4yLTIuOC02LjItNi4yYzAtMy40LDIuOC02LjIsNi4yLTYuMnM2LjIsMi44LDYuMiw2LjIKCQkJQzE2LjIsNTMuNCwxMy40LDU2LjIsMTAsNTYuMnoiLz4KCTwvZz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNDMEMwQkYiIGQ9Ik02NC4xLDUzLjRsMi4zLDBjMC4yLDAsMC40LDAuMiwwLjQsMC40djIuMWMwLDAuMi0wLjIsMC40LTAuNCwwLjRoLTIuMwoJCQkJYy0wLjIsMC0wLjQtMC4yLTAuNC0wLjR2LTIuMUM2My43LDUzLjYsNjMuOCw1My40LDY0LjEsNTMuNHoiLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzBDMEJGIiBkPSJNNzMuNSw1My41aDIuNGMwLjIsMCwwLjQsMC4yLDAuNCwwLjR2MmMwLDAuMi0wLjIsMC40LTAuNCwwLjRoLTIuNAoJCQkJYy0wLjIsMC0wLjQtMC4yLTAuNC0wLjRsMC0yQzczLjEsNTMuNiw3My4zLDUzLjUsNzMuNSw1My41eiIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNDMEMwQkYiIGQ9Ik02My43LDQ4LjRoMTIuNnY1SDYzLjdWNDguNHoiLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzBDMEJGIiBkPSJNNjUuNSw0My42aDguOWMxLDAsMS45LDAuOCwxLjksMS45djMuMUg2My43di0zLjFDNjMuNyw0NC41LDY0LjUsNDMuNiw2NS41LDQzLjZ6Ii8+CgkJCTxlbGxpcHNlIGZpbGw9IiNDMEMwQkYiIGN4PSI2Ni4yIiBjeT0iNTAuOSIgcng9IjAuOSIgcnk9IjEiLz4KCQkJPGVsbGlwc2UgZmlsbD0iI0MwQzBCRiIgY3g9IjczLjgiIGN5PSI1MC45IiByeD0iMC45IiByeT0iMSIvPgoJCTwvZz4KCTwvZz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNDMEMwQkYiIGQ9Ik05Ni40LDUwYzAsMy42LTIuOSw2LjUtNi40LDYuNXMtNi40LTIuOS02LjQtNi41czIuOS02LjUsNi40LTYuNVM5Ni40LDQ2LjQsOTYuNCw1MHoiLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzBDMEJGIiBkPSJNOTYuMyw0OC42YzAsMCwwLDAuMSwwLDAuMWMtMC45LDAuMS0yLjksMC4xLTQuNi0xLjJjLTEuMS0wLjgtMi0xLjctMi42LTIuNQoJCQkJYy0wLjMtMC40LTAuNi0wLjgtMC43LTFjLTAuMS0wLjEtMC4xLTAuMi0wLjEtMC4yYzAuNS0wLjEsMS4yLTAuMiwyLTAuMmMxLjIsMCwyLjUsMC4zLDMuNSwxLjFjMSwwLjgsMS43LDEuOCwyLjEsMi44CgkJCQlDOTYuMSw0Ny45LDk2LjIsNDguMyw5Ni4zLDQ4LjZ6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0MwQzBCRiIgZD0iTTg0LDUyLjJjMCwwLDAtMC4xLDAtMC4xYzAuOS0wLjIsMi45LTAuNCw0LjcsMC42YzEuMSwwLjcsMS45LDEuNSwyLjQsMi4zCgkJCQljMC40LDAuNSwwLjYsMSwwLjcsMS4zYy0wLjQsMC4xLTEsMC4yLTEuNywwLjNjLTEsMC0yLjEtMC4xLTMuMi0wLjhzLTEuOS0xLjYtMi40LTIuNUM4NC4yLDUyLjgsODQuMSw1Mi41LDg0LDUyLjJ6Ii8+CgkJPC9nPgoJPC9nPgoJPGc+CgkJPGc+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0MwQzBCRiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMTE2LjMsNDYuOGwtMS40LDJsLTAuOC0wLjhsLTAuNi0wLjdsMCwwLjlsLTAuMSw4LjJoLTYuOAoJCQkJbC0wLjEtOC4ybDAtMC45bC0wLjYsMC43bC0wLjgsMC44bC0xLjQtMmwyLjYtMi45YzAuMS0wLjEsMC4yLTAuMSwwLjMtMC4xaDEuM2wwLjQsMC43YzAuNywxLjMsMi42LDEuMywzLjMtMC4xbDAuMy0wLjZoMS4yCgkJCQljMC4xLDAsMC4yLDAsMC4zLDAuMWwwLjMtMC4zbC0wLjMsMC4zTDExNi4zLDQ2Ljh6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0MwQzBCRiIgZD0iTTExMC4xLDQ3LjdoMnYwLjljMCwwLjQtMC40LDAuNy0xLDAuN2MtMC42LDAtMS0wLjMtMS0wLjdMMTEwLjEsNDcuN0wxMTAuMSw0Ny43eiIvPgoJCTwvZz4KCTwvZz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNDMEMwQkYiIGQ9Ik0xMjYuOCw1NC4zYzAsMS4yLTEsMi4yLTIuMiwyLjJzLTIuMi0xLTIuMi0yLjJzMS0yLjIsMi4yLTIuMlMxMjYuOCw1My4xLDEyNi44LDU0LjN6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0MwQzBCRiIgZD0iTTEzNy42LDU0LjNjMCwxLjItMSwyLjItMi4yLDIuMmMtMS4yLDAtMi4yLTEtMi4yLTIuMnMxLTIuMiwyLjItMi4yCgkJCQlDMTM2LjYsNTIuMSwxMzcuNiw1My4xLDEzNy42LDU0LjN6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0MwQzBCRiIgZD0iTTEyNi44LDQ0LjR2OS45Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0MwQzBCRiIgZD0iTTEzNy43LDQ0LjR2OS45Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0MwQzBCRiIgZD0iTTEyNi44LDQzLjVoMTAuOHYyLjdoLTEwLjhDMTI2LjgsNDYuMiwxMjYuOCw0My41LDEyNi44LDQzLjV6Ii8+CgkJPC9nPgoJPC9nPgoJPGc+CgkJPGc+CgkJCTxwYXRoIGZpbGw9IiNDMEMwQkYiIGQ9Ik0xNzAuOCw0My4xTDE3MC44LDQzLjFjLTAuMywwLTAuNSwwLTAuOCwwYy0yLjEsMC00LDEtNS4zLDIuNWwtMC4xLDBsLTAuMS0wLjFsLTEtMS4ybC0wLjMsMy40bDMuNCwwLjMKCQkJCWwtMS4xLTEuM2wtMC4xLTAuMWwwLjEtMC4xYzEuMS0xLjUsMy0yLjMsNS0yLjFsMCwwYzMuMiwwLjMsNS41LDMuMSw1LjIsNi4zYy0wLjMsMy0zLjEsNS4zLTYuMSw1LjFjLTMuMS0wLjItNS40LTIuOS01LjMtNgoJCQkJbC0xLjMtMC4xYy0wLjIsMy44LDIuNiw3LjEsNi4zLDcuNGMzLjksMC4zLDcuMy0yLjYsNy42LTYuNUMxNzcuMiw0Ni44LDE3NC40LDQzLjUsMTcwLjgsNDMuMXoiLz4KCQkJPHBhdGggZmlsbD0iI0MwQzBCRiIgZD0iTTE3MC4zLDQ3LjRjMC0wLjMtMC4zLTAuNi0wLjYtMC42cy0wLjYsMC4zLTAuNiwwLjZ2My4yYzAsMC4yLDAuMSwwLjMsMC4yLDAuNGMwLjEsMC4xLDAuMywwLjIsMC40LDAuMgoJCQkJaDIuNGMwLjQsMCwwLjYtMC4zLDAuNi0wLjZjMC0wLjMtMC4zLTAuNi0wLjYtMC42aC0xLjZoLTAuMnYtMC4yTDE3MC4zLDQ3LjRMMTcwLjMsNDcuNHoiLz4KCQk8L2c+Cgk8L2c+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzBDMEJGIiBkPSJNMTg2LjIsNDMuNGg3LjdjMS41LDAsMi43LDEuMiwyLjcsMi43djcuN2MwLDEuNS0xLjIsMi43LTIuNywyLjdoLTcuNwoJCQkJYy0xLjUsMC0yLjctMS4yLTIuNy0yLjd2LTcuN0MxODMuNCw0NC43LDE4NC43LDQzLjQsMTg2LjIsNDMuNHoiLz4KCQkJPGVsbGlwc2UgZmlsbD0iI0MwQzBCRiIgY3g9IjE4NiIgY3k9IjQ4LjkiIHJ4PSIwLjciIHJ5PSIwLjciLz4KCQkJPGVsbGlwc2UgZmlsbD0iI0MwQzBCRiIgY3g9IjE5NCIgY3k9IjQ2LjciIHJ4PSIwLjciIHJ5PSIwLjciLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzBDMEJGIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik0xODYsNTMuM2wwLjQtMC4zYzAuNC0wLjMsMS0wLjMsMS41LTAuMWwxLDAuNAoJCQkJYzAuNSwwLjIsMSwwLjIsMS41LTAuMWwwLjgtMC41YzAuNC0wLjMsMS0wLjMsMS41LTAuMWwxLjgsMC44Ii8+CgkJPC9nPgoJPC9nPgoJPHBhdGggZmlsbD0iI0MwQzBCRiIgc3Ryb2tlPSIjQzBDMEJGIiBzdHJva2Utd2lkdGg9IjAuMjUiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTE1Niw0NC4zYy0wLjItMC4xLTAuNC0wLjEtMC41LDAKCQljMCwwLTAuMiwwLjEtMC45LDAuMmMtMC43LDAtMi40LTAuMS0zLjgtMC42Yy0wLjgtMC4zLTEuNy0wLjUtMi41LTAuNWMtMC4yLDAtMC40LDAtMC41LDBjLTEuMywwLTIuNSwwLjMtMy42LDEKCQljLTAuMiwwLjEtMC4yLDAuMi0wLjIsMC40djExLjZjMCwwLjMsMC4xLDAuNSwwLjMsMC41YzAuNiwwLDAuNS0wLjQsMC41LTAuNnYtNS43YzAuNy0wLjMsMy4yLTEuMSw1LjgtMC4xCgkJYzEuNiwwLjYsMy41LDAuNyw0LjMsMC43YzAuOCwwLDEuMy0wLjMsMS4zLTAuM2MwLjItMC4xLDAuMy0wLjIsMC4zLTAuNHYtNS43QzE1Ni4yLDQ0LjYsMTU2LjEsNDQuNCwxNTYsNDQuM3ogTTE1NS42LDUwLjIKCQljLTAuMSwwLTAuNywwLjEtMSwwLjFjLTAuNywwLTIuNC0wLjEtMy44LTAuNmMtMi41LTEtNS0wLjUtNi4yLTAuMXYtNC45YzAuOS0wLjUsMi4yLTAuNywzLjItMC43YzAuMSwwLDAuMywwLDAuNCwwCgkJYzAuNywwLDEuNSwwLjIsMi4yLDAuNGMxLjYsMC42LDMuNSwwLjcsNC4zLDAuN2MwLjIsMCwwLjgsMCwxLTAuMVY1MC4yeiIvPgoJPGc+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzBDMEJGIiBkPSJNNDguMSw0My41aDMuN2MyLjUsMCw0LjUsMiw0LjUsNC41YzAsMC41LTAuNCwwLjktMC45LDAuOUg0NC41Yy0wLjUsMC0wLjktMC40LTAuOS0wLjkKCQkJQzQzLjYsNDUuNSw0NS42LDQzLjUsNDguMSw0My41eiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0MwQzBCRiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNNDMuNSw0OC44Yy0wLjIsMC4xLTAuNSwxLjIsMCwxLjVjMS40LDEsOC41LDAuOCwxMS4zLDAuNgoJCQljMC44LTAuMSwxLjYtMC40LDEuNy0xLjJjMC0wLjMtMC4xLTAuNi0wLjYtMC45Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzBDMEJGIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik00My41LDUwLjZMNDMuMyw1MWMtMC4yLDAuNSwwLjIsMSwwLjcsMC45YzAuMy0wLjEsMC41LDAsMC43LDAuMwoJCQlsMC4xLDAuMmMwLjMsMC41LDEsMC42LDEuNSwwLjJsMCwwYzAuMy0wLjIsMC43LTAuMywxLTAuMmwwLjgsMC4zYzAuNCwwLjIsMC44LDAuMSwxLjIsMGwwLjUtMC4yYzAuNC0wLjIsMC45LTAuMiwxLjMsMGwwLjUsMC4yCgkJCWMwLjQsMC4yLDAuOCwwLjIsMS4yLDBsMC4yLTAuMWMwLjMtMC4yLDAuOC0wLjIsMS4xLDAuMWwwLjIsMC4yYzAuMywwLjMsMC44LDAuMiwxLTAuMmwwLjEtMC4yYzAuMS0wLjIsMC0wLjMsMC4yLTAuMwoJCQljMC41LDAsMS4yLTAuMywxLjEtMC43bC0wLjQtMS4xIi8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzBDMEJGIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik00My41LDUyLjJjLTAuMSwwLjItMC4zLDAuOCwwLDEuMWMwLjMsMC40LDMsMS4xLDYuNCwxLjEKCQkJYzIuMiwwLDQuNi0wLjMsNi0wLjZjMC41LTAuMSwwLjktMC41LDAuOC0wLjljMC0wLjItMC4yLTAuNS0wLjQtMC43Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzBDMEJGIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik00My41LDUzLjNjMCwwLjUsMC42LDIuMywxLjMsMi43YzEuOCwwLjgsNS43LDAuNyw4LjEsMC41CgkJCWMxLjMtMC4xLDIuNS0wLjcsMy4yLTEuOGMwLjMtMC41LDAuNS0xLDAuNS0xLjQiLz4KCQk8ZWxsaXBzZSBmaWxsPSIjQzBDMEJGIiBjeD0iNTEuNiIgY3k9IjQ2LjUiIHJ4PSIwLjMiIHJ5PSIwLjQiLz4KCQk8ZWxsaXBzZSBmaWxsPSIjQzBDMEJGIiBjeD0iNTMiIGN5PSI0NSIgcng9IjAuMyIgcnk9IjAuNCIvPgoJCTxlbGxpcHNlIGZpbGw9IiNDMEMwQkYiIGN4PSI1MyIgY3k9IjQ3LjIiIHJ4PSIwLjMiIHJ5PSIwLjQiLz4KCQk8ZWxsaXBzZSBmaWxsPSIjQzBDMEJGIiBjeD0iNTQuMyIgY3k9IjQ2LjUiIHJ4PSIwLjMiIHJ5PSIwLjQiLz4KCQk8ZWxsaXBzZSBmaWxsPSIjQzBDMEJGIiBjeD0iNTAuOSIgY3k9IjQ1IiByeD0iMC4zIiByeT0iMC40Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNDMEMwQkYiIGQ9Ik0yNC4yLDUxdi03LjZjMC4xLDAuMSwwLjgsMC45LDIuOCwzLjFjMi41LTEuNyw1LjYtMC43LDYuOSwwbDIuNC0zLjF2Ny4xCgkJCWMwLDEuMi0wLjEsMi41LTAuOSwzLjRjLTEsMS4yLTIuNywyLjUtNS4zLDIuNWMtMi45LDAtNC41LTEuNS01LjMtMi45QzI0LjIsNTIuOSwyNC4yLDUyLDI0LjIsNTF6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzBDMEJGIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik0yMS4yLDUwbDUuNCwxLjIiLz4KCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNDMEMwQkYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZD0iTTIxLjIsNTQuMWw1LjQtMS4yIi8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzBDMEJGIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik0zOC44LDUwbC01LjQsMS4yIi8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzBDMEJGIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik0zOC44LDU0LjFsLTUuNC0xLjIiLz4KCQk8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iI0MwQzBCRiIgZD0iTTI5LjUsNTIuNEwyOSw1MS43Yy0wLjItMC4zLDAtMC42LDAuMy0wLjZoMS40CgkJCWMwLjMsMCwwLjUsMC40LDAuMywwLjZsLTAuNywxbDAsMGMtMC43LDEuMi0yLjYsMS4xLTMuMS0wLjNsLTAuMS0wLjJjLTAuMS0wLjIsMC0wLjQsMC4yLTAuNXMwLjQsMCwwLjUsMC4ybDAuMSwwLjIKCQkJQzI4LjMsNTIuOCwyOS4xLDUyLjksMjkuNSw1Mi40eiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0MwQzBCRiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMzIuNCw1Mi4xbC0wLjEsMC4yYy0wLjQsMS0xLjgsMS4xLTIuMywwLjIiLz4KCQk8ZWxsaXBzZSBmaWxsPSIjQzBDMEJGIiBjeD0iMjcuNiIgY3k9IjQ5LjciIHJ4PSIwLjciIHJ5PSIwLjciLz4KCQk8ZWxsaXBzZSBmaWxsPSIjQzBDMEJGIiBjeD0iMzIuNCIgY3k9IjQ5LjciIHJ4PSIwLjciIHJ5PSIwLjciLz4KCTwvZz4KCTxnPgoJCTxwYXRoIGZpbGw9IiM2QUE5REQiIHN0cm9rZT0iIzZBQTlERCIgc3Ryb2tlLXdpZHRoPSIwLjEiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTE0LjYsNzEuMmMtMC4xLTAuMS0wLjItMC4yLTAuMy0wLjJINS43CgkJCWMtMC4xLDAtMC4yLDAuMS0wLjMsMC4yYy0wLjEsMC4xLTAuMSwwLjIsMCwwLjRjMC43LDIsMi41LDMuMyw0LjYsMy4zczMuOS0xLjMsNC42LTMuM0MxNC43LDcxLjUsMTQuNyw3MS4zLDE0LjYsNzEuMnogTTEwLDc0LjEKCQkJYy0xLjYsMC0zLTAuOS0zLjctMi4yaDcuM0MxMyw3My4yLDExLjYsNzQuMSwxMCw3NC4xeiIvPgoJCTxwYXRoIGZpbGw9IiM2QUE5REQiIHN0cm9rZT0iIzZBQTlERCIgc3Ryb2tlLXdpZHRoPSIwLjEiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTEyLjgsNjkuNWMwLjYsMCwxLjEtMC41LDEuMS0xLjEKCQkJYzAtMC42LTAuNS0xLjItMS4xLTEuMmMtMC42LDAtMS4yLDAuNS0xLjIsMS4yQzExLjYsNjksMTIuMiw2OS41LDEyLjgsNjkuNXogTTEyLjgsNjhjMC4yLDAsMC40LDAuMiwwLjQsMC40CgkJCWMwLDAuMi0wLjIsMC40LTAuNCwwLjRjLTAuMiwwLTAuNC0wLjItMC40LTAuNEMxMi40LDY4LjEsMTIuNiw2OCwxMi44LDY4eiIvPgoJCTxwYXRoIGZpbGw9IiM2QUE5REQiIHN0cm9rZT0iIzZBQTlERCIgc3Ryb2tlLXdpZHRoPSIwLjEiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTcuMiw2OS41YzAuNiwwLDEuMi0wLjUsMS4yLTEuMQoJCQljMC0wLjYtMC41LTEuMi0xLjItMS4yYy0wLjYsMC0xLjEsMC41LTEuMSwxLjJDNi4xLDY5LDYuNiw2OS41LDcuMiw2OS41eiBNNy4yLDY4YzAuMiwwLDAuNCwwLjIsMC40LDAuNGMwLDAuMi0wLjIsMC40LTAuNCwwLjQKCQkJYy0wLjIsMC0wLjQtMC4yLTAuNC0wLjRDNi44LDY4LjEsNyw2OCw3LjIsNjh6Ii8+CgkJPHBhdGggZmlsbD0iIzZBQTlERCIgc3Ryb2tlPSIjNkFBOUREIiBzdHJva2Utd2lkdGg9IjAuMSIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTAsNjNjLTMuOCwwLTcsMy4xLTcsN2MwLDMuOCwzLjEsNyw3LDcKCQkJczctMy4xLDctN0MxNyw2Ni4yLDEzLjgsNjMsMTAsNjN6IE0xMCw3Ni4yYy0zLjQsMC02LjItMi44LTYuMi02LjJjMC0zLjQsMi44LTYuMiw2LjItNi4yczYuMiwyLjgsNi4yLDYuMgoJCQlDMTYuMiw3My40LDEzLjQsNzYuMiwxMCw3Ni4yeiIvPgoJPC9nPgoJPGc+CgkJPGc+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgZD0iTTY0LjEsNzMuNGwyLjMsMGMwLjIsMCwwLjQsMC4yLDAuNCwwLjR2Mi4xYzAsMC4yLTAuMiwwLjQtMC40LDAuNGgtMi4zCgkJCQljLTAuMiwwLTAuNC0wLjItMC40LTAuNHYtMi4xQzYzLjcsNzMuNiw2My44LDczLjQsNjQuMSw3My40eiIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM2QUE5REQiIGQ9Ik03My41LDczLjVoMi40YzAuMiwwLDAuNCwwLjIsMC40LDAuNHYyLjFjMCwwLjItMC4yLDAuNC0wLjQsMC40aC0yLjQKCQkJCWMtMC4yLDAtMC40LTAuMi0wLjQtMC40bDAtMi4xQzczLjEsNzMuNiw3My4zLDczLjUsNzMuNSw3My41eiIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM2QUE5REQiIGQ9Ik02My43LDY4LjRoMTIuNnY1SDYzLjdWNjguNHoiLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkFBOUREIiBkPSJNNjUuNSw2My42aDguOWMxLDAsMS45LDAuOCwxLjksMS45djMuMUg2My43di0zLjFDNjMuNyw2NC41LDY0LjUsNjMuNiw2NS41LDYzLjZ6Ii8+CgkJCTxlbGxpcHNlIGZpbGw9IiM2QUE5REQiIGN4PSI2Ni4yIiBjeT0iNzAuOSIgcng9IjAuOSIgcnk9IjAuOSIvPgoJCQk8ZWxsaXBzZSBmaWxsPSIjNkFBOUREIiBjeD0iNzMuOCIgY3k9IjcwLjkiIHJ4PSIwLjkiIHJ5PSIwLjkiLz4KCQk8L2c+Cgk8L2c+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkFBOUREIiBkPSJNOTYuNCw3MGMwLDMuNi0yLjksNi41LTYuNCw2LjVzLTYuNC0yLjktNi40LTYuNXMyLjktNi41LDYuNC02LjVTOTYuNCw2Ni40LDk2LjQsNzB6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgZD0iTTk2LjMsNjguNmMwLDAsMCwwLjEsMCwwLjFjLTAuOSwwLjEtMi45LDAuMS00LjYtMS4yYy0xLjEtMC44LTItMS43LTIuNi0yLjUKCQkJCWMtMC4zLTAuNC0wLjYtMC44LTAuNy0xLjFjLTAuMS0wLjEtMC4xLTAuMi0wLjEtMC4yYzAuNS0wLjEsMS4yLTAuMiwyLTAuMmMxLjIsMCwyLjUsMC4zLDMuNSwxLjFjMSwwLjgsMS43LDEuOCwyLjEsMi44CgkJCQlDOTYuMSw2Ny45LDk2LjIsNjguMyw5Ni4zLDY4LjZ6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgZD0iTTg0LDcyLjJjMCwwLDAtMC4xLDAtMC4xYzAuOS0wLjIsMi45LTAuNCw0LjcsMC42YzEuMSwwLjcsMS45LDEuNSwyLjQsMi4zCgkJCQljMC40LDAuNSwwLjYsMSwwLjcsMS4zYy0wLjQsMC4xLTEsMC4yLTEuNywwLjNjLTEsMC0yLjEtMC4xLTMuMi0wLjhzLTEuOS0xLjYtMi40LTIuNUM4NC4yLDcyLjgsODQuMSw3Mi40LDg0LDcyLjJ6Ii8+CgkJPC9nPgoJPC9nPgoJPGc+CgkJPGc+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMTE2LjMsNjYuOGwtMS40LDJsLTAuOC0wLjhsLTAuNi0wLjdsMCwwLjlsLTAuMSw4LjJoLTYuOAoJCQkJbC0wLjEtOC4ybDAtMC45bC0wLjYsMC43bC0wLjgsMC44bC0xLjQtMmwyLjYtMi45YzAuMS0wLjEsMC4yLTAuMSwwLjMtMC4xaDEuM2wwLjQsMC43YzAuNywxLjMsMi42LDEuMywzLjMtMC4xbDAuMy0wLjZoMS4yCgkJCQljMC4xLDAsMC4yLDAsMC4zLDAuMWwwLjMtMC4zbC0wLjMsMC4zTDExNi4zLDY2Ljh6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgZD0iTTExMC4xLDY3LjdoMnYwLjljMCwwLjQtMC40LDAuNy0xLDAuN2MtMC42LDAtMS0wLjMtMS0wLjdMMTEwLjEsNjcuN0wxMTAuMSw2Ny43eiIvPgoJCTwvZz4KCTwvZz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM2QUE5REQiIGQ9Ik0xMjYuOCw3NC4zYzAsMS4yLTEsMi4yLTIuMiwyLjJzLTIuMi0xLTIuMi0yLjJzMS0yLjIsMi4yLTIuMlMxMjYuOCw3My4xLDEyNi44LDc0LjN6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgZD0iTTEzNy42LDc0LjNjMCwxLjItMSwyLjItMi4yLDIuMmMtMS4yLDAtMi4yLTEtMi4yLTIuMnMxLTIuMiwyLjItMi4yCgkJCQlDMTM2LjYsNzIuMSwxMzcuNiw3My4xLDEzNy42LDc0LjN6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgZD0iTTEyNi44LDY0LjR2OS45Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgZD0iTTEzNy43LDY0LjR2OS45Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgZD0iTTEyNi44LDYzLjVoMTAuOHYyLjdoLTEwLjhDMTI2LjgsNjYuMiwxMjYuOCw2My41LDEyNi44LDYzLjV6Ii8+CgkJPC9nPgoJPC9nPgoJPGc+CgkJPGc+CgkJCTxwYXRoIGZpbGw9IiM2QUE5REQiIGQ9Ik0xNzAuOCw2My4xTDE3MC44LDYzLjFjLTAuMywwLTAuNSwwLTAuOCwwYy0yLjEsMC00LDEtNS4zLDIuNWwtMC4xLDBsLTAuMS0wLjFsLTEtMS4ybC0wLjMsMy40bDMuNCwwLjMKCQkJCWwtMS4xLTEuM2wtMC4xLTAuMWwwLjEtMC4xYzEuMS0xLjQsMy0yLjMsNS0yLjFsMCwwYzMuMiwwLjMsNS41LDMuMSw1LjIsNi4zYy0wLjMsMy0zLjEsNS4zLTYuMSw1LjFjLTMuMS0wLjItNS40LTIuOS01LjMtNgoJCQkJbC0xLjMtMC4xYy0wLjIsMy44LDIuNiw3LjEsNi4zLDcuNGMzLjksMC4zLDcuMy0yLjYsNy42LTYuNUMxNzcuMiw2Ni44LDE3NC40LDYzLjUsMTcwLjgsNjMuMXoiLz4KCQkJPHBhdGggZmlsbD0iIzZBQTlERCIgZD0iTTE3MC4zLDY3LjRjMC0wLjMtMC4zLTAuNi0wLjYtMC42cy0wLjYsMC4zLTAuNiwwLjZ2My4yYzAsMC4yLDAuMSwwLjMsMC4yLDAuNGMwLjEsMC4xLDAuMywwLjIsMC40LDAuMgoJCQkJaDIuNGMwLjQsMCwwLjYtMC4zLDAuNi0wLjZTMTcyLjQsNzAsMTcyLDcwaC0xLjZoLTAuMnYtMC4yTDE3MC4zLDY3LjRMMTcwLjMsNjcuNHoiLz4KCQk8L2c+Cgk8L2c+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkFBOUREIiBkPSJNMTg2LjIsNjMuNGg3LjdjMS41LDAsMi43LDEuMiwyLjcsMi43djcuN2MwLDEuNS0xLjIsMi43LTIuNywyLjdoLTcuNwoJCQkJYy0xLjUsMC0yLjctMS4yLTIuNy0yLjd2LTcuN0MxODMuNCw2NC43LDE4NC43LDYzLjQsMTg2LjIsNjMuNHoiLz4KCQkJPGVsbGlwc2UgZmlsbD0iIzZBQTlERCIgY3g9IjE4NiIgY3k9IjY4LjkiIHJ4PSIwLjciIHJ5PSIwLjciLz4KCQkJPGVsbGlwc2UgZmlsbD0iIzZBQTlERCIgY3g9IjE5NCIgY3k9IjY2LjciIHJ4PSIwLjciIHJ5PSIwLjciLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkFBOUREIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik0xODYsNzMuM2wwLjQtMC4zYzAuNC0wLjMsMS0wLjMsMS41LTAuMWwxLDAuNAoJCQkJYzAuNSwwLjIsMSwwLjIsMS41LTAuMWwwLjgtMC41YzAuNC0wLjMsMS0wLjMsMS41LTAuMWwxLjgsMC44Ii8+CgkJPC9nPgoJPC9nPgoJPHBhdGggZmlsbD0iIzZBQTlERCIgc3Ryb2tlPSIjNkFBOUREIiBzdHJva2Utd2lkdGg9IjAuMjUiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTE1Niw2NC4zYy0wLjItMC4xLTAuNC0wLjEtMC41LDAKCQljMCwwLTAuMiwwLjEtMC45LDAuMmMtMC43LDAtMi40LTAuMS0zLjgtMC42Yy0wLjgtMC4zLTEuNy0wLjUtMi41LTAuNWMtMC4yLDAtMC40LDAtMC41LDBjLTEuMywwLTIuNSwwLjMtMy42LDEKCQljLTAuMiwwLjEtMC4yLDAuMi0wLjIsMC40djExLjZjMCwwLjMsMC4xLDAuNSwwLjMsMC41YzAuNiwwLDAuNS0wLjQsMC41LTAuNnYtNS43YzAuNy0wLjMsMy4yLTEuMSw1LjgtMC4xCgkJYzEuNiwwLjYsMy41LDAuNyw0LjMsMC43YzAuOCwwLDEuMy0wLjMsMS4zLTAuM2MwLjItMC4xLDAuMy0wLjIsMC4zLTAuNHYtNS43QzE1Ni4yLDY0LjYsMTU2LjEsNjQuNCwxNTYsNjQuM3ogTTE1NS42LDcwLjIKCQljLTAuMSwwLTAuNywwLjEtMSwwLjFjLTAuNywwLTIuNC0wLjEtMy44LTAuNmMtMi41LTEtNS0wLjUtNi4yLTAuMXYtNC45YzAuOS0wLjUsMi4yLTAuNywzLjItMC43YzAuMSwwLDAuMywwLDAuNCwwCgkJYzAuNywwLDEuNSwwLjIsMi4yLDAuNGMxLjYsMC42LDMuNSwwLjcsNC4zLDAuN2MwLjIsMCwwLjgsMCwxLTAuMVY3MC4yeiIvPgoJPGc+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkFBOUREIiBkPSJNNDguMSw2My41aDMuN2MyLjUsMCw0LjUsMiw0LjUsNC41YzAsMC41LTAuNCwwLjktMC45LDAuOUg0NC41Yy0wLjUsMC0wLjktMC40LTAuOS0wLjkKCQkJQzQzLjYsNjUuNSw0NS42LDYzLjUsNDguMSw2My41eiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNNDMuNSw2OC44Yy0wLjIsMC4xLTAuNSwxLjIsMCwxLjVjMS40LDAuOSw4LjUsMC44LDExLjMsMC42CgkJCWMwLjgtMC4xLDEuNi0wLjQsMS43LTEuMmMwLTAuMy0wLjEtMC42LTAuNi0wLjkiLz4KCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM2QUE5REQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZD0iTTQzLjUsNzAuNkw0My4zLDcxYy0wLjIsMC41LDAuMiwxLDAuNywwLjljMC4zLTAuMSwwLjUsMC4xLDAuNywwLjMKCQkJbDAuMSwwLjJjMC4zLDAuNSwxLDAuNiwxLjUsMC4ybDAsMGMwLjMtMC4yLDAuNy0wLjMsMS0wLjJsMC44LDAuM2MwLjQsMC4yLDAuOCwwLjEsMS4yLDBsMC41LTAuMmMwLjQtMC4yLDAuOS0wLjIsMS4zLDBsMC41LDAuMgoJCQljMC40LDAuMiwwLjgsMC4yLDEuMi0wLjFsMC4yLTAuMWMwLjMtMC4yLDAuOC0wLjIsMS4xLDAuMWwwLjIsMC4yYzAuMywwLjMsMC44LDAuMiwxLTAuMmwwLjEtMC4yYzAuMS0wLjIsMC0wLjMsMC4yLTAuMwoJCQljMC41LDAsMS4yLTAuMywxLjEtMC43bC0wLjQtMS4xIi8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkFBOUREIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik00My41LDcyLjJjLTAuMSwwLjItMC4zLDAuOCwwLDEuMWMwLjMsMC40LDMsMS4xLDYuNCwxLjEKCQkJYzIuMiwwLDQuNi0wLjMsNi0wLjZjMC41LTAuMSwwLjktMC40LDAuOC0wLjljMC0wLjItMC4yLTAuNS0wLjQtMC43Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkFBOUREIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik00My41LDczLjNjMCwwLjUsMC42LDIuMywxLjMsMi43YzEuOCwwLjgsNS43LDAuNyw4LjEsMC41CgkJCWMxLjMtMC4xLDIuNS0wLjcsMy4yLTEuOGMwLjMtMC41LDAuNS0xLDAuNS0xLjQiLz4KCQk8ZWxsaXBzZSBmaWxsPSIjNkFBOUREIiBjeD0iNTEuNiIgY3k9IjY2LjUiIHJ4PSIwLjMiIHJ5PSIwLjQiLz4KCQk8ZWxsaXBzZSBmaWxsPSIjNkFBOUREIiBjeD0iNTMiIGN5PSI2NSIgcng9IjAuMyIgcnk9IjAuNCIvPgoJCTxlbGxpcHNlIGZpbGw9IiM2QUE5REQiIGN4PSI1MyIgY3k9IjY3LjIiIHJ4PSIwLjMiIHJ5PSIwLjQiLz4KCQk8ZWxsaXBzZSBmaWxsPSIjNkFBOUREIiBjeD0iNTQuMyIgY3k9IjY2LjUiIHJ4PSIwLjMiIHJ5PSIwLjQiLz4KCQk8ZWxsaXBzZSBmaWxsPSIjNkFBOUREIiBjeD0iNTAuOSIgY3k9IjY1IiByeD0iMC4zIiByeT0iMC40Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM2QUE5REQiIGQ9Ik0yNC4yLDcxdi03LjZjMC4xLDAuMSwwLjgsMC45LDIuOCwzLjFjMi41LTEuNyw1LjYtMC43LDYuOSwwbDIuNC0zLjF2Ny4xCgkJCWMwLDEuMi0wLjEsMi41LTAuOSwzLjRjLTEsMS4yLTIuNywyLjUtNS4zLDIuNWMtMi45LDAtNC41LTEuNS01LjMtMi45QzI0LjIsNzIuOSwyNC4yLDcyLDI0LjIsNzF6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkFBOUREIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik0yMS4yLDcwLjFsNS40LDEuMiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMjEuMiw3NC4xbDUuNC0xLjIiLz4KCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM2QUE5REQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZD0iTTM4LjgsNzAuMWwtNS40LDEuMiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMzguOCw3NC4xbC01LjQtMS4yIi8+CgkJPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiM2QUE5REQiIGQ9Ik0yOS41LDcyLjRMMjksNzEuN2MtMC4yLTAuMywwLTAuNiwwLjMtMC42aDEuNAoJCQljMC4zLDAsMC41LDAuNCwwLjMsMC42bC0wLjcsMWwwLDBjLTAuNywxLjItMi42LDEuMS0zLjEtMC4zbC0wLjEtMC4yYy0wLjEtMC4yLDAtMC40LDAuMi0wLjVjMC4yLTAuMSwwLjQsMCwwLjUsMC4ybDAuMSwwLjIKCQkJQzI4LjMsNzIuOCwyOS4xLDcyLjksMjkuNSw3Mi40eiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZBQTlERCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMzIuNCw3Mi4xbC0wLjEsMC4yYy0wLjQsMS0xLjgsMS4xLTIuMywwLjIiLz4KCQk8ZWxsaXBzZSBmaWxsPSIjNkFBOUREIiBjeD0iMjcuNiIgY3k9IjY5LjciIHJ4PSIwLjciIHJ5PSIwLjciLz4KCQk8ZWxsaXBzZSBmaWxsPSIjNkFBOUREIiBjeD0iMzIuNCIgY3k9IjY5LjciIHJ4PSIwLjciIHJ5PSIwLjciLz4KCTwvZz4KPC9nPgo8Zz4KCTxwYXRoIGZpbGw9IiM4Njg2ODYiIHN0cm9rZT0iIzg2ODY4NiIgc3Ryb2tlLXdpZHRoPSIwLjEiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTEyLjgsOS41YzAuNiwwLDEuMS0wLjUsMS4xLTEuMgoJCWMwLTAuNi0wLjUtMS4xLTEuMS0xLjFjLTAuNiwwLTEuMiwwLjUtMS4yLDEuMVMxMi4yLDkuNSwxMi44LDkuNXogTTEyLjgsNy45YzAuMiwwLDAuNCwwLjIsMC40LDAuNGMwLDAuMi0wLjIsMC40LTAuNCwwLjQKCQljLTAuMiwwLTAuNC0wLjItMC40LTAuNEMxMi40LDguMSwxMi42LDcuOSwxMi44LDcuOXoiLz4KCTxwYXRoIGZpbGw9IiM4Njg2ODYiIHN0cm9rZT0iIzg2ODY4NiIgc3Ryb2tlLXdpZHRoPSIwLjEiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTcuMiw5LjVjMC42LDAsMS4yLTAuNSwxLjItMS4yCgkJYzAtMC42LTAuNS0xLjEtMS4yLTEuMWMtMC42LDAtMS4xLDAuNS0xLjEsMS4xUzYuNiw5LjUsNy4yLDkuNXogTTcuMiw3LjljMC4yLDAsMC40LDAuMiwwLjQsMC40YzAsMC4yLTAuMiwwLjQtMC40LDAuNAoJCUM3LDguNyw2LjgsOC41LDYuOCw4LjNDNi44LDguMSw3LDcuOSw3LjIsNy45eiIvPgoJPHBhdGggZmlsbD0iIzg2ODY4NiIgc3Ryb2tlPSIjODY4Njg2IiBzdHJva2Utd2lkdGg9IjAuMSIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTQuNiwxMS4yYy0wLjEtMC4xLTAuMi0wLjItMC4zLTAuMkg1LjcKCQljLTAuMSwwLTAuMiwwLjEtMC4zLDAuMmMtMC4xLDAuMS0wLjEsMC4yLDAsMC40YzAuNywyLDIuNSwzLjMsNC42LDMuM3MzLjktMS4zLDQuNi0zLjNDMTQuNywxMS40LDE0LjcsMTEuMywxNC42LDExLjJ6IE0xMCwxNC4xCgkJYy0xLjYsMC0zLTAuOS0zLjctMi4yaDcuM0MxMywxMy4yLDExLjYsMTQuMSwxMCwxNC4xeiIvPgoJPHBhdGggZmlsbD0iIzg2ODY4NiIgc3Ryb2tlPSIjODY4Njg2IiBzdHJva2Utd2lkdGg9IjAuMSIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTAsM2MtMy44LDAtNywzLjEtNyw3czMuMSw3LDcsN3M3LTMuMSw3LTcKCQlTMTMuOCwzLDEwLDN6IE0xMCwxNi4yYy0zLjQsMC02LjItMi44LTYuMi02LjJTNi42LDMuOCwxMCwzLjhzNi4yLDIuOCw2LjIsNi4yUzEzLjQsMTYuMiwxMCwxNi4yeiIvPgo8L2c+CjxnIGlkPSJDYXJfMDAwMDAwMTg5MzUzOTUwODU0MTM0MTM3NTAwMDAwMDA4MjUyNzM4Nzc4NDI3NzU3MTVfIj4KCTxnPgoJCTxnPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM4Njg2ODYiIGQ9Ik02NC4xLDEzLjRsMi4zLDBjMC4yLDAsMC40LDAuMiwwLjQsMC40djIuMWMwLDAuMi0wLjIsMC40LTAuNCwwLjRoLTIuMwoJCQkJYy0wLjIsMC0wLjQtMC4yLTAuNC0wLjR2LTIuMUM2My43LDEzLjYsNjMuOCwxMy40LDY0LjEsMTMuNHoiLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4Njg2IiBkPSJNNzMuNSwxMy40aDIuNGMwLjIsMCwwLjQsMC4yLDAuNCwwLjR2Mi4xYzAsMC4yLTAuMiwwLjQtMC40LDAuNGgtMi40CgkJCQljLTAuMiwwLTAuNC0wLjItMC40LTAuNGwwLTIuMUM3My4xLDEzLjYsNzMuMywxMy40LDczLjUsMTMuNHoiLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4Njg2IiBkPSJNNjMuNyw4LjRoMTIuNnY1SDYzLjdWOC40eiIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM4Njg2ODYiIGQ9Ik02NS41LDMuNmg4LjljMSwwLDEuOSwwLjgsMS45LDEuOXYzLjFINjMuN1Y1LjVDNjMuNyw0LjQsNjQuNSwzLjYsNjUuNSwzLjZ6Ii8+CgkJCTxlbGxpcHNlIGZpbGw9IiM4Njg2ODYiIGN4PSI2Ni4yIiBjeT0iMTAuOSIgcng9IjAuOSIgcnk9IjAuOSIvPgoJCQk8ZWxsaXBzZSBmaWxsPSIjODY4Njg2IiBjeD0iNzMuOCIgY3k9IjEwLjkiIHJ4PSIwLjkiIHJ5PSIwLjkiLz4KCQk8L2c+Cgk8L2c+CjwvZz4KPGcgaWQ9IkFjdGl2aXRpZXMiPgoJPGc+CgkJPGc+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg2ODY4NiIgZD0iTTk2LjQsMTBjMCwzLjYtMi45LDYuNS02LjQsNi41cy02LjQtMi45LTYuNC02LjVzMi45LTYuNSw2LjQtNi41Uzk2LjQsNi40LDk2LjQsMTB6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg2ODY4NiIgZD0iTTk2LjMsOC42YzAsMCwwLDAuMSwwLDAuMWMtMC45LDAuMS0yLjksMC4xLTQuNi0xLjJjLTEuMS0wLjgtMi0xLjctMi42LTIuNQoJCQkJYy0wLjMtMC40LTAuNi0wLjgtMC43LTEuMWMtMC4xLTAuMS0wLjEtMC4yLTAuMS0wLjJjMC41LTAuMSwxLjItMC4yLDItMC4yYzEuMiwwLDIuNSwwLjMsMy41LDEuMWMxLDAuOCwxLjcsMS44LDIuMSwyLjgKCQkJCUM5Ni4xLDcuOSw5Ni4yLDguMyw5Ni4zLDguNnoiLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4Njg2IiBkPSJNODQsMTIuMWMwLDAsMC0wLjEsMC0wLjFjMC45LTAuMiwyLjktMC40LDQuNywwLjZjMS4xLDAuNiwxLjksMS41LDIuNCwyLjMKCQkJCWMwLjQsMC41LDAuNiwxLDAuNywxLjNjLTAuNCwwLjEtMSwwLjItMS43LDAuM2MtMSwwLTIuMS0wLjEtMy4yLTAuOGMtMS4xLTAuNi0xLjktMS42LTIuNC0yLjVDODQuMiwxMi44LDg0LjEsMTIuNCw4NCwxMi4xeiIvPgoJCTwvZz4KCTwvZz4KPC9nPgo8ZyBpZD0iT2JqZWN0c18wMDAwMDA2NDMxMjM3MTczOTEzMDMxNTI1MDAwMDAxMDIyNTg4OTAzMjIyODYzMjk3NV8iPgoJPGc+CgkJPGc+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg2ODY4NiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMTE2LjMsNi44bC0xLjQsMkwxMTQuMSw4bC0wLjYtMC43bDAsMC45bC0wLjEsOC4yaC02LjhsLTAuMS04LjIKCQkJCWwwLTAuOUwxMDUuOSw4bC0wLjgsMC44bC0xLjQtMmwyLjYtMi45YzAuMS0wLjEsMC4yLTAuMSwwLjMtMC4xaDEuM2wwLjQsMC43YzAuNywxLjMsMi42LDEuMywzLjMtMC4xbDAuMy0wLjZoMS4yCgkJCQljMC4xLDAsMC4yLDAsMC4zLDAuMWwwLjMtMC4zbC0wLjMsMC4zTDExNi4zLDYuOHoiLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4Njg2IiBkPSJNMTEwLjEsNy43aDJ2MC45YzAsMC40LTAuNCwwLjctMSwwLjdjLTAuNiwwLTEtMC4zLTEtMC43TDExMC4xLDcuN0wxMTAuMSw3Ljd6Ii8+CgkJPC9nPgoJPC9nPgo8L2c+CjxnIGlkPSJTeW1ib2xzXzAwMDAwMDk2NzQ2OTA3ODY5OTI5OTIxMTgwMDAwMDA2NDg0ODEyODMwMjgyNTgyNDE2XyI+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4Njg2IiBkPSJNMTI2LjgsMTQuM2MwLDEuMi0xLDIuMi0yLjIsMi4ycy0yLjItMS0yLjItMi4yczEtMi4yLDIuMi0yLjJTMTI2LjgsMTMuMSwxMjYuOCwxNC4zeiIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM4Njg2ODYiIGQ9Ik0xMzcuNiwxNC4zYzAsMS4yLTEsMi4yLTIuMiwyLjJjLTEuMiwwLTIuMi0xLTIuMi0yLjJzMS0yLjIsMi4yLTIuMgoJCQkJQzEzNi42LDEyLjEsMTM3LjYsMTMuMSwxMzcuNiwxNC4zeiIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM4Njg2ODYiIGQ9Ik0xMjYuOCw0LjR2OS45Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg2ODY4NiIgZD0iTTEzNy43LDQuNHY5LjkiLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4Njg2IiBkPSJNMTI2LjgsMy41aDEwLjh2Mi43aC0xMC44QzEyNi44LDYuMiwxMjYuOCwzLjUsMTI2LjgsMy41eiIvPgoJCTwvZz4KCTwvZz4KPC9nPgo8ZyBpZD0iUmVjZW50cyI+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggZmlsbD0iIzg2ODY4NiIgZD0iTTE3MC44LDMuMUwxNzAuOCwzLjFjLTAuMywwLTAuNSwwLTAuOCwwYy0yLjEsMC00LDEtNS4zLDIuNWwtMC4xLDBsLTAuMS0wLjFsLTEtMS4ybC0wLjMsMy40bDMuNCwwLjMKCQkJCWwtMS4xLTEuM2wtMC4xLTAuMWwwLjEtMC4xYzEuMS0xLjQsMy0yLjMsNS0yLjFsMCwwYzMuMiwwLjMsNS41LDMuMSw1LjIsNi4zYy0wLjMsMy0zLjEsNS4zLTYuMSw1LjFjLTMuMS0wLjItNS40LTIuOS01LjMtNgoJCQkJTDE2Myw5LjVjLTAuMiwzLjgsMi42LDcuMSw2LjMsNy40YzMuOSwwLjQsNy4zLTIuNiw3LjYtNi41QzE3Ny4yLDYuOCwxNzQuNCwzLjUsMTcwLjgsMy4xeiIvPgoJCQk8cGF0aCBmaWxsPSIjODY4Njg2IiBkPSJNMTcwLjMsNy40YzAtMC4zLTAuMy0wLjYtMC42LTAuNlMxNjksNy4xLDE2OSw3LjR2My4yYzAsMC4yLDAuMSwwLjMsMC4yLDAuNGMwLjEsMC4xLDAuMywwLjIsMC40LDAuMgoJCQkJaDIuNGMwLjQsMCwwLjYtMC4zLDAuNi0wLjZzLTAuMy0wLjYtMC42LTAuNmgtMS42aC0wLjJWOS44TDE3MC4zLDcuNEwxNzAuMyw3LjR6Ii8+CgkJPC9nPgoJPC9nPgo8L2c+CjxnIGlkPSJDdXN0b21fMDAwMDAxODEwODcyMjk0MzQzMDIzMzY3ODAwMDAwMDUxNTIyNzc5NDU5NDA2NzQ0ODhfIj4KCTxnPgoJCTxnPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM4Njg2ODYiIGQ9Ik0xODYuMiwzLjRoNy43YzEuNSwwLDIuNywxLjIsMi43LDIuN3Y3LjdjMCwxLjUtMS4yLDIuNy0yLjcsMi43aC03LjcKCQkJCWMtMS41LDAtMi43LTEuMi0yLjctMi43VjYuMUMxODMuNCw0LjYsMTg0LjcsMy40LDE4Ni4yLDMuNHoiLz4KCQkJPGVsbGlwc2UgZmlsbD0iIzg2ODY4NiIgY3g9IjE4NiIgY3k9IjguOSIgcng9IjAuNyIgcnk9IjAuNyIvPgoJCQk8ZWxsaXBzZSBmaWxsPSIjODY4Njg2IiBjeD0iMTk0IiBjeT0iNi43IiByeD0iMC43IiByeT0iMC43Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg2ODY4NiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMTg2LDEzLjNsMC40LTAuM2MwLjQtMC4zLDEtMC4zLDEuNS0wLjFsMSwwLjQKCQkJCWMwLjUsMC4yLDEsMC4yLDEuNS0wLjFsMC44LTAuNWMwLjQtMC4zLDEtMC4zLDEuNS0wLjFsMS44LDAuOCIvPgoJCTwvZz4KCTwvZz4KPC9nPgo8cGF0aCBmaWxsPSIjODY4Njg2IiBzdHJva2U9IiM4Njg2ODYiIHN0cm9rZS13aWR0aD0iMC4yNSIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMTU2LDQuM2MtMC4yLTAuMS0wLjQtMC4xLTAuNSwwCgljMCwwLTAuMiwwLjEtMC45LDAuMWMtMC43LDAtMi40LTAuMS0zLjgtMC42Yy0wLjgtMC4zLTEuNy0wLjUtMi41LTAuNWMtMC4yLDAtMC40LDAtMC41LDBjLTEuMywwLTIuNSwwLjMtMy42LDEKCWMtMC4yLDAuMS0wLjIsMC4yLTAuMiwwLjR2MTEuNmMwLDAuMywwLjEsMC41LDAuMywwLjVjMC42LDAsMC41LTAuNCwwLjUtMC42di01LjdjMC43LTAuMywzLjItMS4xLDUuOC0wLjFjMS42LDAuNiwzLjUsMC43LDQuMywwLjcKCWMwLjgsMCwxLjMtMC4zLDEuMy0wLjNjMC4yLTAuMSwwLjMtMC4yLDAuMy0wLjRWNC43QzE1Ni4yLDQuNSwxNTYuMSw0LjQsMTU2LDQuM3ogTTE1NS42LDEwLjJjLTAuMSwwLTAuNywwLjEtMSwwLjEKCWMtMC43LDAtMi40LTAuMS0zLjgtMC42Yy0yLjUtMS01LTAuNS02LjItMC4xVjQuN2MwLjktMC41LDIuMi0wLjcsMy4yLTAuN2MwLjEsMCwwLjMsMCwwLjQsMGMwLjcsMCwxLjUsMC4yLDIuMiwwLjQKCWMxLjYsMC42LDMuNSwwLjcsNC4zLDAuN2MwLjIsMCwwLjgsMCwxLTAuMVYxMC4yeiIvPgo8ZyBpZD0iRm9vZCI+Cgk8ZyBpZD0iTGF5ZXJfMTIiPgoJCTxnPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM4Njg2ODYiIGQ9Ik00OC4xLDMuNWgzLjdjMi41LDAsNC41LDIsNC41LDQuNWMwLDAuNS0wLjQsMC45LTAuOSwwLjlINDQuNWMtMC41LDAtMC45LTAuNC0wLjktMC45CgkJCQlDNDMuNiw1LjUsNDUuNiwzLjUsNDguMSwzLjV6Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg2ODY4NiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNNDMuNSw4LjdjLTAuMiwwLjEtMC41LDEuMiwwLDEuNWMxLjQsMC45LDguNSwwLjgsMTEuMywwLjYKCQkJCWMwLjgtMC4xLDEuNi0wLjQsMS43LTEuMmMwLTAuMy0wLjEtMC42LTAuNi0wLjkiLz4KCQkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4Njg2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik00My41LDEwLjZMNDMuMywxMWMtMC4yLDAuNSwwLjIsMSwwLjcsMC45CgkJCQljMC4zLTAuMSwwLjUsMC4xLDAuNywwLjNsMC4xLDAuMmMwLjMsMC41LDEsMC42LDEuNSwwLjJsMCwwYzAuMy0wLjIsMC43LTAuMywxLTAuMmwwLjgsMC4zYzAuNCwwLjEsMC44LDAuMSwxLjIsMGwwLjUtMC4yCgkJCQljMC40LTAuMiwwLjktMC4yLDEuMywwbDAuNSwwLjJjMC40LDAuMiwwLjgsMC4xLDEuMi0wLjFsMC4yLTAuMWMwLjMtMC4yLDAuOC0wLjEsMS4xLDAuMWwwLjIsMC4yYzAuMywwLjMsMC44LDAuMiwxLTAuMmwwLjEtMC4yCgkJCQljMC4xLTAuMiwwLTAuMywwLjItMC40YzAuNSwwLDEuMi0wLjMsMS4xLTAuN2wtMC40LTEuMSIvPgoJCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM4Njg2ODYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZD0iTTQzLjUsMTIuMWMtMC4xLDAuMi0wLjMsMC44LDAsMS4xYzAuMywwLjQsMywxLjEsNi40LDEuMQoJCQkJYzIuMiwwLDQuNi0wLjMsNi0wLjZjMC41LTAuMSwwLjktMC40LDAuOC0wLjljMC0wLjItMC4yLTAuNS0wLjQtMC43Ii8+CgkJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg2ODY4NiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNNDMuNSwxMy4zYzAsMC41LDAuNiwyLjQsMS4zLDIuNmMxLjgsMC44LDUuNywwLjcsOC4xLDAuNQoJCQkJYzEuMy0wLjEsMi41LTAuNywzLjItMS44YzAuMy0wLjUsMC41LTEsMC41LTEuNCIvPgoJCQk8ZWxsaXBzZSBmaWxsPSIjODY4Njg2IiBjeD0iNTEuNiIgY3k9IjYuNSIgcng9IjAuMyIgcnk9IjAuNCIvPgoJCQk8ZWxsaXBzZSBmaWxsPSIjODY4Njg2IiBjeD0iNTMiIGN5PSI0LjkiIHJ4PSIwLjMiIHJ5PSIwLjQiLz4KCQkJPGVsbGlwc2UgZmlsbD0iIzg2ODY4NiIgY3g9IjUzIiBjeT0iNy4yIiByeD0iMC4zIiByeT0iMC40Ii8+CgkJCTxlbGxpcHNlIGZpbGw9IiM4Njg2ODYiIGN4PSI1NC4zIiBjeT0iNi41IiByeD0iMC4zIiByeT0iMC40Ii8+CgkJCTxlbGxpcHNlIGZpbGw9IiM4Njg2ODYiIGN4PSI1MC45IiBjeT0iNC45IiByeD0iMC4zIiByeT0iMC40Ii8+CgkJPC9nPgoJPC9nPgo8L2c+CjxnIGlkPSJBbmltYWxzIj4KCTxnPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg2ODY4NiIgZD0iTTI0LjIsMTFWMy41YzAuMSwwLjEsMC44LDAuOSwyLjgsMy4xYzIuNS0xLjcsNS42LTAuNyw2LjksMGwyLjQtMy4xdjcuMQoJCQljMCwxLjItMC4xLDIuNS0wLjksMy40Yy0xLDEuMi0yLjcsMi41LTUuMywyLjVjLTIuOSwwLTQuNS0xLjUtNS4zLTIuOUMyNC4yLDEyLjksMjQuMiwxMS45LDI0LjIsMTF6Ii8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4Njg2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik0yMS4yLDEwbDUuNCwxLjIiLz4KCQk8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiM4Njg2ODYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZD0iTTIxLjIsMTQuMWw1LjQtMS4yIi8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4Njg2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik0zOC44LDEwbC01LjQsMS4yIi8+CgkJPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODY4Njg2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik0zOC44LDE0LjFsLTUuNC0xLjIiLz4KCQk8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iIzg2ODY4NiIgZD0iTTI5LjUsMTIuNEwyOSwxMS43Yy0wLjItMC4zLDAtMC42LDAuMy0wLjZoMS40CgkJCWMwLjMsMCwwLjUsMC40LDAuMywwLjZsLTAuNywxbDAsMGMtMC43LDEuMi0yLjYsMS4xLTMuMS0wLjNsLTAuMS0wLjJjLTAuMS0wLjIsMC0wLjQsMC4yLTAuNXMwLjQsMCwwLjUsMC4ybDAuMSwwLjIKCQkJQzI4LjMsMTIuNywyOS4xLDEyLjksMjkuNSwxMi40eiIvPgoJCTxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg2ODY4NiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNMzIuNCwxMi4xbC0wLjEsMC4yYy0wLjQsMS0xLjgsMS4xLTIuMywwLjIiLz4KCQk8ZWxsaXBzZSBmaWxsPSIjODY4Njg2IiBjeD0iMjcuNiIgY3k9IjkuNyIgcng9IjAuNyIgcnk9IjAuNyIvPgoJCTxlbGxpcHNlIGZpbGw9IiM4Njg2ODYiIGN4PSIzMi40IiBjeT0iOS43IiByeD0iMC43IiByeT0iMC43Ii8+Cgk8L2c+CjwvZz4KPC9zdmc+";
function CategoryButton(_ref) {
	var _categoryConfig$icon, _cx;
	var isActiveCategory = _ref.isActiveCategory, category = _ref.category, allowNavigation = _ref.allowNavigation, categoryConfig = _ref.categoryConfig, onClick = _ref.onClick, customIcon = _ref.customIcon;
	var icon = (_categoryConfig$icon = categoryConfig.icon) != null ? _categoryConfig$icon : customIcon;
	var hasCustomIcon = icon != null;
	return (0, import_react.createElement)(Button, {
		tabIndex: allowNavigation ? 0 : -1,
		className: cx(styles$f.catBtn, commonInteractionStyles.categoryBtn, hasCustomIcon ? styles$f.customIcon : "epr-icn-" + category, (_cx = {}, _cx[ClassNames.active] = isActiveCategory, _cx)),
		onClick,
		"aria-label": categoryNameFromCategoryConfig(categoryConfig),
		"aria-selected": isActiveCategory,
		role: "tab",
		"aria-controls": "epr-category-nav-id"
	}, hasCustomIcon ? icon : null);
}
var DarkActivePositionY = { backgroundPositionY: "calc(var(--epr-category-navigation-button-size) * 3)" };
var DarkPositionY = { backgroundPositionY: "calc(var(--epr-category-navigation-button-size) * 2)" };
var DarkInactivePosition = { ":not(.epr-search-active)": { catBtn: {
	":hover": DarkActivePositionY,
	"&.epr-active": DarkActivePositionY
} } };
var styles$f = /*#__PURE__*/ stylesheet.create(/*#__PURE__*/ _extends({
	catBtn: {
		".": "epr-cat-btn",
		display: "inline-block",
		transition: "opacity 0.2s ease-in-out",
		position: "relative",
		height: "var(--epr-category-navigation-button-size)",
		width: "var(--epr-category-navigation-button-size)",
		backgroundSize: "calc(var(--epr-category-navigation-button-size) * 10)",
		outline: "none",
		backgroundPosition: "0 0",
		backgroundImage: "url(" + SVGNavigation + ")",
		":focus:before": {
			content: "",
			position: "absolute",
			top: "-2px",
			left: "-2px",
			right: "-2px",
			bottom: "-2px",
			border: "2px solid var(--epr-category-icon-active-color)",
			borderRadius: "50%"
		},
		"&.epr-icn-suggested": { backgroundPositionX: "calc(var(--epr-category-navigation-button-size) * -8)" },
		"&.epr-icn-custom": { backgroundPositionX: "calc(var(--epr-category-navigation-button-size) * -9)" },
		"&.epr-icn-activities": { backgroundPositionX: "calc(var(--epr-category-navigation-button-size) * -4)" },
		"&.epr-icn-animals_nature": { backgroundPositionX: "calc(var(--epr-category-navigation-button-size) * -1)" },
		"&.epr-icn-flags": { backgroundPositionX: "calc(var(--epr-category-navigation-button-size) * -7)" },
		"&.epr-icn-food_drink": { backgroundPositionX: "calc(var(--epr-category-navigation-button-size) * -2)" },
		"&.epr-icn-objects": { backgroundPositionX: "calc(var(--epr-category-navigation-button-size) * -5)" },
		"&.epr-icn-smileys_people": { backgroundPositionX: "0px" },
		"&.epr-icn-symbols": { backgroundPositionX: "calc(var(--epr-category-navigation-button-size) * -6)" },
		"&.epr-icn-travel_places": { backgroundPositionX: "calc(var(--epr-category-navigation-button-size) * -3)" }
	},
	customIcon: {
		".": "epr-cat-btn-custom-icon",
		backgroundImage: "none",
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	}
}, /*#__PURE__*/ darkMode("catBtn", DarkPositionY), {
	".epr-dark-theme": /*#__PURE__*/ _extends({}, DarkInactivePosition),
	".epr-auto-theme": /*#__PURE__*/ _extends({}, DarkInactivePosition)
}));
function CategoryNavigation() {
	var _useState = (0, import_react.useState)(null), activeCategory = _useState[0], setActiveCategory = _useState[1];
	var setVisibleCategories = useVisibleCategoriesState()[1];
	var scrollCategoryIntoView = useScrollCategoryIntoView();
	useActiveCategoryScrollDetection({
		setActiveCategory,
		setVisibleCategories
	});
	var isSearchMode = useIsSearchMode();
	var categoriesConfig = useCategoriesConfig();
	var categoryIcons = useCategoryIconsConfig();
	var CategoryNavigationRef = useCategoryNavigationRef();
	var hideCustomCategory = useShouldHideCustomEmojis();
	return (0, import_react.createElement)("div", {
		className: cx(styles$g.nav),
		role: "tablist",
		"aria-label": "Category navigation",
		id: "epr-category-nav-id",
		ref: CategoryNavigationRef
	}, categoriesConfig.map(function(categoryConfig) {
		var category = categoryFromCategoryConfig(categoryConfig);
		var isActiveCategory = category === activeCategory;
		if (isCustomCategory(categoryConfig) && hideCustomCategory) return null;
		return (0, import_react.createElement)(CategoryButton, {
			key: category,
			category,
			isActiveCategory,
			allowNavigation: !isSearchMode && !isActiveCategory,
			categoryConfig,
			customIcon: categoryIcons[category],
			onClick: function onClick() {
				scrollCategoryIntoView(category);
				setTimeout(function() {
					setActiveCategory(category);
				}, 10);
			}
		});
	}));
}
var styles$g = /*#__PURE__*/ stylesheet.create({
	nav: {
		".": "epr-category-nav",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-around",
		padding: "var(--epr-header-padding)"
	},
	".epr-search-active": { nav: {
		opacity: "0.3",
		cursor: "default",
		pointerEvents: "none"
	} },
	".epr-main:has(input:not(:placeholder-shown))": { nav: {
		opacity: "0.3",
		cursor: "default",
		pointerEvents: "none"
	} }
});
var SVGTimes = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjMuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHdpZHRoPSIyMHB4IiBoZWlnaHQ9IjgwcHgiIHZpZXdCb3g9IjAgMCAyMCA4MCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjAgODAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBmaWxsPSIjODY4Njg2IiBkPSJNNi45OCwxMy41OWMwLjEsMC4xLDAuMjQsMC4xNSwwLjM3LDAuMTVzMC4yNy0wLjA1LDAuMzctMC4xNWwyLjQyLTIuNDJsMi40MywyLjQzCgljMC4xLDAuMSwwLjI0LDAuMTUsMC4zNywwLjE1YzAuMTQsMCwwLjI3LTAuMDUsMC4zNy0wLjE1YzAuMjEtMC4yMSwwLjIxLTAuNTQsMC0wLjc1bC0yLjQzLTIuNDNMMTMuMzIsOAoJYzAuMjEtMC4yMSwwLjIxLTAuNTQsMC0wLjc1Yy0wLjIxLTAuMjEtMC41NC0wLjIxLTAuNzUsMGwtMi40MiwyLjQyTDcuNzQsNy4yN2MtMC4yMS0wLjIxLTAuNTQtMC4yMS0wLjc1LDAKCWMtMC4yMSwwLjIxLTAuMjEsMC41NCwwLDAuNzVsMi40MSwyLjQxbC0yLjQyLDIuNDJDNi43NywxMy4wNSw2Ljc3LDEzLjM5LDYuOTgsMTMuNTlMNi45OCwxMy41OXoiLz4KPHBhdGggZmlsbD0iIzg2ODY4NiIgZD0iTTEwLjE1LDE4LjQzYzQuNDEsMCw4LTMuNTksOC04YzAtNC40MS0zLjU5LTgtOC04Yy00LjQxLDAtOCwzLjU5LTgsOEMyLjE1LDE0Ljg0LDUuNzQsMTguNDMsMTAuMTUsMTguNDN6CgkgTTEwLjE1LDMuNDljMy44MywwLDYuOTQsMy4xMSw2Ljk0LDYuOTRjMCwzLjgzLTMuMTEsNi45NC02Ljk0LDYuOTRjLTMuODMsMC02Ljk0LTMuMTEtNi45NC02Ljk0QzMuMjEsNi42LDYuMzMsMy40OSwxMC4xNSwzLjQ5CglMMTAuMTUsMy40OXoiLz4KPHBhdGggZmlsbD0iIzMzNzFCNyIgZD0iTTYuOTgsMzMuNTljMC4xLDAuMSwwLjI0LDAuMTUsMC4zNywwLjE1czAuMjctMC4wNSwwLjM3LTAuMTVsMi40Mi0yLjQybDIuNDMsMi40MwoJYzAuMSwwLjEsMC4yNCwwLjE1LDAuMzcsMC4xNWMwLjE0LDAsMC4yNy0wLjA1LDAuMzctMC4xNWMwLjIxLTAuMjEsMC4yMS0wLjU0LDAtMC43NWwtMi40My0yLjQzTDEzLjMyLDI4CgljMC4yMS0wLjIxLDAuMjEtMC41NCwwLTAuNzVjLTAuMjEtMC4yMS0wLjU0LTAuMjEtMC43NSwwbC0yLjQyLDIuNDJsLTIuNDEtMi40MWMtMC4yMS0wLjIxLTAuNTQtMC4yMS0wLjc1LDAKCWMtMC4yMSwwLjIxLTAuMjEsMC41NCwwLDAuNzVsMi40MSwyLjQxbC0yLjQyLDIuNDJDNi43NywzMy4wNSw2Ljc3LDMzLjM5LDYuOTgsMzMuNTlMNi45OCwzMy41OXoiLz4KPHBhdGggZmlsbD0iIzMzNzFCNyIgZD0iTTEwLjE1LDM4LjQzYzQuNDEsMCw4LTMuNTksOC04YzAtNC40MS0zLjU5LTgtOC04Yy00LjQxLDAtOCwzLjU5LTgsOEMyLjE1LDM0Ljg0LDUuNzQsMzguNDMsMTAuMTUsMzguNDN6CgkgTTEwLjE1LDIzLjQ5YzMuODMsMCw2Ljk0LDMuMTEsNi45NCw2Ljk0YzAsMy44My0zLjExLDYuOTQtNi45NCw2Ljk0Yy0zLjgzLDAtNi45NC0zLjExLTYuOTQtNi45NAoJQzMuMjEsMjYuNiw2LjMzLDIzLjQ5LDEwLjE1LDIzLjQ5TDEwLjE1LDIzLjQ5eiIvPgo8cGF0aCBmaWxsPSIjQzBDMEJGIiBkPSJNNi45OCw1My41OWMwLjEsMC4xLDAuMjQsMC4xNSwwLjM3LDAuMTVzMC4yNy0wLjA1LDAuMzctMC4xNWwyLjQyLTIuNDJsMi40MywyLjQzCgljMC4xLDAuMSwwLjI0LDAuMTUsMC4zNywwLjE1YzAuMTQsMCwwLjI3LTAuMDUsMC4zNy0wLjE1YzAuMjEtMC4yMSwwLjIxLTAuNTQsMC0wLjc1bC0yLjQzLTIuNDNMMTMuMzIsNDgKCWMwLjIxLTAuMjEsMC4yMS0wLjU0LDAtMC43NWMtMC4yMS0wLjIxLTAuNTQtMC4yMS0wLjc1LDBsLTIuNDIsMi40MmwtMi40MS0yLjQxYy0wLjIxLTAuMjEtMC41NC0wLjIxLTAuNzUsMAoJYy0wLjIxLDAuMjEtMC4yMSwwLjU0LDAsMC43NWwyLjQxLDIuNDFsLTIuNDIsMi40MkM2Ljc3LDUzLjA1LDYuNzcsNTMuMzksNi45OCw1My41OUw2Ljk4LDUzLjU5eiIvPgo8cGF0aCBmaWxsPSIjQzBDMEJGIiBkPSJNMTAuMTUsNTguNDNjNC40MSwwLDgtMy41OSw4LThjMC00LjQxLTMuNTktOC04LThjLTQuNDEsMC04LDMuNTktOCw4QzIuMTUsNTQuODQsNS43NCw1OC40MywxMC4xNSw1OC40M3oKCSBNMTAuMTUsNDMuNDljMy44MywwLDYuOTQsMy4xMSw2Ljk0LDYuOTRjMCwzLjgzLTMuMTEsNi45NC02Ljk0LDYuOTRjLTMuODMsMC02Ljk0LTMuMTEtNi45NC02Ljk0CglDMy4yMSw0Ni42LDYuMzMsNDMuNDksMTAuMTUsNDMuNDlMMTAuMTUsNDMuNDl6Ii8+CjxwYXRoIGZpbGw9IiM2QUE5REQiIGQ9Ik02Ljk4LDczLjU5YzAuMSwwLjEsMC4yNCwwLjE1LDAuMzcsMC4xNXMwLjI3LTAuMDUsMC4zNy0wLjE1bDIuNDItMi40MmwyLjQzLDIuNDMKCWMwLjEsMC4xLDAuMjQsMC4xNSwwLjM3LDAuMTVjMC4xNCwwLDAuMjctMC4wNSwwLjM3LTAuMTVjMC4yMS0wLjIxLDAuMjEtMC41NCwwLTAuNzVsLTIuNDMtMi40M0wxMy4zMiw2OAoJYzAuMjEtMC4yMSwwLjIxLTAuNTQsMC0wLjc1Yy0wLjIxLTAuMjEtMC41NC0wLjIxLTAuNzUsMGwtMi40MiwyLjQybC0yLjQxLTIuNDFjLTAuMjEtMC4yMS0wLjU0LTAuMjEtMC43NSwwCgljLTAuMjEsMC4yMS0wLjIxLDAuNTQsMCwwLjc1bDIuNDEsMi40MWwtMi40MiwyLjQyQzYuNzcsNzMuMDUsNi43Nyw3My4zOSw2Ljk4LDczLjU5TDYuOTgsNzMuNTl6Ii8+CjxwYXRoIGZpbGw9IiM2QUE5REQiIGQ9Ik0xMC4xNSw3OC40M2M0LjQxLDAsOC0zLjU5LDgtOGMwLTQuNDEtMy41OS04LTgtOGMtNC40MSwwLTgsMy41OS04LDhDMi4xNSw3NC44NCw1Ljc0LDc4LjQzLDEwLjE1LDc4LjQzegoJIE0xMC4xNSw2My40OWMzLjgzLDAsNi45NCwzLjExLDYuOTQsNi45NGMwLDMuODMtMy4xMSw2Ljk0LTYuOTQsNi45NGMtMy44MywwLTYuOTQtMy4xMS02Ljk0LTYuOTQKCUMzLjIxLDY2LjYsNi4zMyw2My40OSwxMC4xNSw2My40OUwxMC4xNSw2My40OXoiLz4KPC9zdmc+";
function BtnClearSearch() {
	var clearSearch = useClearSearch();
	var searchClearButtonLabel = useSearchClearButtonLabelConfig();
	return (0, import_react.createElement)(Button, {
		className: cx(styles$h.btnClearSearch, commonInteractionStyles.visibleOnSearchOnly),
		onClick: clearSearch,
		"aria-label": searchClearButtonLabel,
		title: searchClearButtonLabel
	}, (0, import_react.createElement)("div", { className: cx(styles$h.icnClearnSearch) }));
}
var styles$h = /*#__PURE__*/ stylesheet.create(/*#__PURE__*/ _extends({
	btnClearSearch: {
		".": "epr-btn-clear-search",
		position: "absolute",
		right: "var(--epr-search-bar-inner-padding)",
		height: "30px",
		width: "30px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		top: "50%",
		transform: "translateY(-50%)",
		padding: "0",
		borderRadius: "50%",
		":hover": { background: "var(--epr-hover-bg-color)" },
		":focus": { background: "var(--epr-hover-bg-color)" }
	},
	icnClearnSearch: {
		".": "epr-icn-clear-search",
		backgroundColor: "transparent",
		backgroundRepeat: "no-repeat",
		backgroundSize: "20px",
		height: "20px",
		width: "20px",
		backgroundImage: "url(" + SVGTimes + ")",
		":hover": { backgroundPositionY: "-20px" },
		":focus": { backgroundPositionY: "-20px" }
	}
}, /*#__PURE__*/ darkMode("icnClearnSearch", { backgroundPositionY: "-40px" }), /*#__PURE__*/ darkMode("btnClearSearch", { ":hover": { "> .epr-icn-clear-search": { backgroundPositionY: "-60px" } } })));
var SVGMagnifier = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjMuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHdpZHRoPSIyMHB4IiBoZWlnaHQ9IjQwcHgiIHZpZXdCb3g9IjAgMCAyMCA0MCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjAgNDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iIzg2ODY4NiIgZD0iTTEyLDguODFjMCwyLjA4LTEuNjgsMy43Ni0zLjc2LDMuNzZjLTIuMDgsMC0zLjc2LTEuNjgtMy43Ni0zLjc2CgljMC0yLjA4LDEuNjgtMy43NiwzLjc2LTMuNzZDMTAuMzIsNS4wNSwxMiw2LjczLDEyLDguODF6IE0xMS4yMywxMi43MmMtMC44MywwLjY0LTEuODcsMS4wMS0yLjk5LDEuMDFjLTIuNzIsMC00LjkyLTIuMi00LjkyLTQuOTIKCWMwLTIuNzIsMi4yLTQuOTIsNC45Mi00LjkyYzIuNzIsMCw0LjkyLDIuMiw0LjkyLDQuOTJjMCwxLjEzLTAuMzgsMi4xNi0xLjAxLDIuOTlsMy45NCwzLjkzYzAuMjUsMC4yNSwwLjI1LDAuNjYsMCwwLjkyCgljLTAuMjUsMC4yNS0wLjY2LDAuMjUtMC45MiwwTDExLjIzLDEyLjcyeiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iI0MwQzBCRiIgZD0iTTEyLDI4LjgxYzAsMi4wOC0xLjY4LDMuNzYtMy43NiwzLjc2Yy0yLjA4LDAtMy43Ni0xLjY4LTMuNzYtMy43NgoJYzAtMi4wOCwxLjY4LTMuNzYsMy43Ni0zLjc2QzEwLjMyLDI1LjA1LDEyLDI2LjczLDEyLDI4LjgxeiBNMTEuMjMsMzIuNzJjLTAuODMsMC42NC0xLjg3LDEuMDEtMi45OSwxLjAxCgljLTIuNzIsMC00LjkyLTIuMi00LjkyLTQuOTJjMC0yLjcyLDIuMi00LjkyLDQuOTItNC45MmMyLjcyLDAsNC45MiwyLjIsNC45Miw0LjkyYzAsMS4xMy0wLjM4LDIuMTYtMS4wMSwyLjk5bDMuOTQsMy45MwoJYzAuMjUsMC4yNSwwLjI1LDAuNjYsMCwwLjkyYy0wLjI1LDAuMjUtMC42NiwwLjI1LTAuOTIsMEwxMS4yMywzMi43MnoiLz4KPC9zdmc+";
function IcnSearch() {
	return (0, import_react.createElement)("div", { className: cx(styles$i.icnSearch) });
}
var styles$i = /*#__PURE__*/ stylesheet.create(/*#__PURE__*/ _extends({ icnSearch: {
	".": "epr-icn-search",
	content: "",
	position: "absolute",
	top: "50%",
	left: "var(--epr-search-bar-inner-padding)",
	transform: "translateY(-50%)",
	width: "20px",
	height: "20px",
	backgroundRepeat: "no-repeat",
	backgroundPosition: "0 0",
	backgroundSize: "20px",
	backgroundImage: "url(" + SVGMagnifier + ")"
} }, /*#__PURE__*/ darkMode("icnSearch", { backgroundPositionY: "-20px" })));
function SearchContainer() {
	var searchDisabled = useSearchDisabledConfig();
	var isSkinToneInSearch = useIsSkinToneInSearch();
	if (searchDisabled) return null;
	return (0, import_react.createElement)(Flex, { className: cx(styles$j.overlay) }, (0, import_react.createElement)(Search, null), isSkinToneInSearch ? (0, import_react.createElement)(SkinTonePicker, null) : null);
}
function Search() {
	var closeAllOpenToggles = useCloseAllOpenToggles();
	var SearchInputRef = useSearchInputRef();
	var placeholder = useSearchPlaceHolderConfig();
	var autoFocus = useAutoFocusSearchConfig();
	var _useFilter = useFilter(), statusSearchResults = _useFilter.statusSearchResults, searchTerm = _useFilter.searchTerm, _onChange = _useFilter.onChange;
	var input = SearchInputRef == null ? void 0 : SearchInputRef.current;
	var value = input == null ? void 0 : input.value;
	return (0, import_react.createElement)(Relative, { className: cx(styles$j.searchContainer) }, (0, import_react.createElement)("input", {
		autoFocus,
		"aria-label": "Type to search for an emoji",
		onFocus: closeAllOpenToggles,
		className: cx(styles$j.search),
		type: "text",
		"aria-controls": "epr-search-id",
		placeholder,
		onChange: function onChange(event) {
			var _event$target$value, _event$target;
			_onChange((_event$target$value = event == null ? void 0 : (_event$target = event.target) == null ? void 0 : _event$target.value) != null ? _event$target$value : value);
		},
		ref: SearchInputRef
	}), searchTerm ? (0, import_react.createElement)("div", {
		role: "status",
		className: cx("epr-status-search-results", styles$j.visuallyHidden),
		"aria-live": "polite",
		id: "epr-search-id",
		"aria-atomic": "true"
	}, statusSearchResults) : null, (0, import_react.createElement)(IcnSearch, null), (0, import_react.createElement)(BtnClearSearch, null));
}
var styles$j = /*#__PURE__*/ stylesheet.create(/*#__PURE__*/ _extends({
	overlay: {
		padding: "var(--epr-header-padding)",
		zIndex: "var(--epr-header-overlay-z-index)"
	},
	searchContainer: {
		".": "epr-search-container",
		flex: "1",
		display: "block",
		minWidth: "0"
	},
	visuallyHidden: {
		clip: "rect(0 0 0 0)",
		clipPath: "inset(50%)",
		height: "1px",
		overflow: "hidden",
		position: "absolute",
		whiteSpace: "nowrap",
		width: "1px"
	},
	search: {
		outline: "none",
		transition: "all 0.2s ease-in-out",
		color: "var(--epr-search-input-text-color)",
		borderRadius: "var(--epr-search-input-border-radius)",
		padding: "var(--epr-search-input-padding)",
		height: "var(--epr-search-input-height)",
		backgroundColor: "var(--epr-search-input-bg-color)",
		border: "1px solid var(--epr-search-border-color)",
		width: "100%",
		":focus": {
			backgroundColor: "var(--epr-search-input-bg-color-active)",
			border: "1px solid var(--epr-search-border-color-active)"
		},
		"::placeholder": { color: "var(--epr-search-input-placeholder-color)" }
	},
	btnClearSearch: {
		".": "epr-btn-clear-search",
		position: "absolute",
		right: "var(--epr-search-bar-inner-padding)",
		height: "30px",
		width: "30px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		top: "50%",
		transform: "translateY(-50%)",
		padding: "0",
		borderRadius: "50%",
		":hover": { background: "var(--epr-hover-bg-color)" },
		":focus": { background: "var(--epr-hover-bg-color)" }
	},
	icnClearnSearch: {
		".": "epr-icn-clear-search",
		backgroundColor: "transparent",
		backgroundRepeat: "no-repeat",
		backgroundSize: "20px",
		height: "20px",
		width: "20px",
		backgroundImage: "url(" + SVGTimes + ")",
		":hover": { backgroundPositionY: "-20px" },
		":focus": { backgroundPositionY: "-20px" }
	}
}, /*#__PURE__*/ darkMode("icnClearnSearch", { backgroundPositionY: "-40px" }), /*#__PURE__*/ darkMode("btnClearSearch", { ":hover > .epr-icn-clear-search": { backgroundPositionY: "-60px" } })));
function Header() {
	return (0, import_react.createElement)(Relative, { className: cx("epr-header", commonInteractionStyles.hiddenOnReactions) }, (0, import_react.createElement)(SearchContainer, null), (0, import_react.createElement)(CategoryNavigation, null));
}
function EmojiPicker(props) {
	return (0, import_react.createElement)(ElementRefContextProvider, null, (0, import_react.createElement)(PickerStyleTag, { nonce: props.nonce }), (0, import_react.createElement)(PickerConfigProvider, Object.assign({}, props), (0, import_react.createElement)(PickerDataProvider, null, (0, import_react.createElement)(ContentControl, null))));
}
function ContentControl() {
	var reactionsDefaultOpen = useReactionsModeState()[0];
	var allowExpandReactions = useAllowExpandReactions();
	var _React$useState = (0, import_react.useState)(!reactionsDefaultOpen), renderAll = _React$useState[0], setRenderAll = _React$useState[1];
	var isOpen = useOpenConfig();
	(0, import_react.useEffect)(function() {
		if (reactionsDefaultOpen && !allowExpandReactions) return;
		if (!renderAll) setRenderAll(true);
	}, [
		renderAll,
		allowExpandReactions,
		reactionsDefaultOpen
	]);
	if (!isOpen) return null;
	return (0, import_react.createElement)(PickerMain, null, (0, import_react.createElement)(Reactions, null), (0, import_react.createElement)(ExpandedPickerContent, { renderAll }));
}
function ExpandedPickerContent(_ref) {
	if (!_ref.renderAll) return null;
	return (0, import_react.createElement)(import_react.Fragment, null, (0, import_react.createElement)(Header, null), (0, import_react.createElement)(Body, null), (0, import_react.createElement)(Preview, null));
}
var EmojiPickerReact = /*#__PURE__*/ (0, import_react.memo)(EmojiPicker, compareConfig);
var ErrorBoundary = /*#__PURE__*/ function(_React$Component) {
	_inheritsLoose(ErrorBoundary, _React$Component);
	function ErrorBoundary(props) {
		var _this = _React$Component.call(this, props) || this;
		_this.state = { hasError: false };
		return _this;
	}
	ErrorBoundary.getDerivedStateFromError = function getDerivedStateFromError() {
		return { hasError: true };
	};
	var _proto = ErrorBoundary.prototype;
	_proto.componentDidCatch = function componentDidCatch(error, errorInfo) {
		console.error("Emoji Picker React failed to render:", error, errorInfo);
	};
	_proto.render = function render() {
		if (this.state.hasError) return null;
		return this.props.children;
	};
	return ErrorBoundary;
}(import_react.Component);
function EmojiPicker$1(props) {
	var MutableConfigRef = useDefineMutableConfig({
		onEmojiClick: props.onEmojiClick,
		onReactionClick: props.onReactionClick,
		onSkinToneChange: props.onSkinToneChange
	});
	return (0, import_react.createElement)(ErrorBoundary, null, (0, import_react.createElement)(MutableConfigContext.Provider, { value: MutableConfigRef }, (0, import_react.createElement)(EmojiPickerReact, Object.assign({}, props))));
}
//#endregion
export { Theme as n, EmojiPicker$1 as t };
