(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "BaldnessJs/_compile_AST", "BaldnessJs/_debug"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _compile_AST_1 = require("BaldnessJs/_compile_AST");
    var _debug_1 = require("BaldnessJs/_debug");
    var tplAST;
    /**
     * Main function wich parses the source with a TPL or the ASTLeaf associated (and precompiled with compile method)
     * The result will be a "jsonisable" js object
     * @function parse
     * @public
     * @param {string} source : the text source
     * @param {string | ASTLeaf} tpl : the template source (or the compiled ASTLeaf)
     */
    function parse(source, tpl) {
        if (typeof tpl === 'string')
            tplAST = _compile_AST_1.compile(tpl);
        else
            tplAST = tpl;
        var obj = {};
        _debug_1._console.log('');
        _debug_1._console.log('');
        _debug_1._console.log('Begin of parsing');
        _debug_1._console.log('src :', source);
        return _parseRecur(source, tplAST, obj);
    }
    exports.parse = parse;
    /**
     * If you have just parsed a source, you can get the ASTLeaf compiled from the tpl for debug purpose
     * @function getLastAST
     * @public
     * @return {ASTLeaf} the compiled Abstract Syntax Tree of the template
     */
    function getLastAST() {
        return tplAST;
    }
    exports.getLastAST = getLastAST;
    function _parseRecur(source, tplAST, obj) {
        _debug_1._console.group();
        _debug_1._console.log("parseRecur for leaf of type (" + tplAST.type + ") : ", tplAST.label);
        _debug_1._console.assert(source !== undefined, 'source must be a string');
        var futureMatches = [];
        var regExpStr = __getRegExpPartByType[tplAST.type](tplAST, futureMatches);
        _debug_1._console.log('regExp generated :', regExpStr);
        var regExp = new RegExp(regExpStr);
        var match = source.match(regExp);
        if (match === null)
            throw "Parse failed, the tpl does not match source"; // --> Parse Exception
        _debug_1._console.log('matches', match);
        // Store values in obj
        futureMatches.forEach(function (futureMatch) {
            var ASTLeaf = futureMatch.ASTLeaf;
            _debug_1._console.log('futureMatch ASTLeaf', ASTLeaf);
            switch (ASTLeaf.type) {
                case "mustacheVar":
                    obj[ASTLeaf.label] = match[futureMatch.matchIdx];
                    break;
                case "root":
                    break;
                case "section":
                    if (futureMatch.ASTLeaf !== tplAST) {
                        if (!match[futureMatch.matchIdx] || match[futureMatch.matchIdx].length === 0) {
                            if (futureMatch.ASTLeaf.info.repeatMode === "" || futureMatch.ASTLeaf.info.repeatMode === "+")
                                throw "Parse failed, the tpl does not match source (section \"" + ASTLeaf.label + "\" is mandatory)"; // --> Parse Exception
                            break;
                        }
                        obj[ASTLeaf.label] = {}; //  create the subObj corresponding to section
                        _parseRecur(match[futureMatch.matchIdx], ASTLeaf, obj[ASTLeaf.label]); // --> recur
                    }
                    break;
                default:
                    _debug_1._console.assert(false, 'futureMatch ASTLeaf can not be of this type', ASTLeaf.type);
            }
        });
        _debug_1._console.groupEnd();
        return obj;
    }
    var __getRegExpPartByType = {};
    __getRegExpPartByType.root = function (tplAST, futureMatches, storeMustacheVars) {
        if (storeMustacheVars === void 0) { storeMustacheVars = true; }
        _debug_1._console.log('__getRegExpPartByType.root/section', tplAST);
        var storeMustacheVarsFlg = (storeMustacheVars === false ? false : (futureMatches.length === 0));
        var futureMatch = {
            matchIdx: futureMatches.length,
            ASTLeaf: tplAST
        };
        futureMatches.push(futureMatch);
        var regExpPart = '';
        tplAST.children.forEach(function (child) { return regExpPart += __getRegExpPartByType[child.type](child, futureMatches, storeMustacheVarsFlg); });
        var repeatMode = ((tplAST.info && tplAST.info.repeatMode) ? tplAST.info.repeatMode : '');
        return storeMustacheVarsFlg ? "(?:(?:" + regExpPart + ")" + repeatMode + ")" : "((?:" + regExpPart + ")" + repeatMode + ")";
    };
    __getRegExpPartByType.section = __getRegExpPartByType.root;
    __getRegExpPartByType.strSwallowing = function (tplAST, futureMatches) {
        return '';
    };
    __getRegExpPartByType.text = function (tplAST, futureMatches) {
        return _escapeRegExp(tplAST.src);
    };
    __getRegExpPartByType.mustacheVar = function (tplAST, futureMatches, storeMustacheVars) {
        if (storeMustacheVars === void 0) { storeMustacheVars = true; }
        if (storeMustacheVars) {
            // If futureMatches array is given, we want to store the value of the mustache,
            // we push the ASTLeaf in array to program extraction
            var futureMatch = {
                matchIdx: futureMatches.length,
                ASTLeaf: tplAST
            };
            futureMatches.push(futureMatch);
        }
        var regExpPart = ((tplAST.info && tplAST.info.regExp !== '') ? tplAST.info.regExp : ".*"); // by default we match everithing, but it can cause conflicts
        return "(" + (storeMustacheVars ? "" : "?:") + regExpPart + ")";
    };
    function _escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function reverseParseDebug(source, tpl) {
        if (typeof tpl === 'string')
            tplAST = _compile_AST_1.compile(tpl);
        else
            tplAST = tpl;
        var obj = {};
        _debug_1._console.log('');
        _debug_1._console.log('');
        _debug_1._console.log('Begin of reverse parsing');
        _debug_1._console.log('src :', source);
        var dpLevel2ASTLeaves = [];
        _reverseParseFlatten(tplAST, dpLevel2ASTLeaves);
        for (var i = dpLevel2ASTLeaves.length - 1; i >= 0; i--) {
            __matchLonelySection(source, tplAST, dpLevel2ASTLeaves[i]);
        }
    }
    function __matchLonelySection(source, tplAST, revParseFlats) {
        revParseFlats.forEach(function (revParseFlat) {
            var regExpStr = __getRegExpPartByType.root(revParseFlat.ASTLeaf, [], false);
            var regExp = new RegExp(regExpStr, 'g');
            var match;
            while (match = regExp.exec(source)) {
                revParseFlat.occurencies.push(match[1]);
            }
        });
    }
    function _reverseParseFlatten(tplAST, dpLevel2ASTLeaves, level) {
        if (level === void 0) { level = 0; }
        tplAST.children.forEach(function (child) { return _reverseParseFlatten(child, dpLevel2ASTLeaves, level + 1); });
        if (tplAST.type !== 'section' && tplAST.type !== 'root')
            return; // --> return
        if (dpLevel2ASTLeaves[level] === undefined)
            dpLevel2ASTLeaves[level] = [];
        dpLevel2ASTLeaves[level].push({ ASTLeaf: tplAST, occurencies: [] });
    }
});
//# sourceMappingURL=_parsing.js.map