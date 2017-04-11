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
    function parse(source, tpl) {
        if (typeof tpl === 'string')
            tplAST = _compile_AST_1.compile(tpl);
        else
            tplAST = tpl;
        var obj = {};
        _debug_1._console.log('');
        _debug_1._console.log('');
        _debug_1._console.log('Begin of parsing');
        _debug_1._console.log('');
        return _parseRecur(source, tplAST, obj);
    }
    exports.parse = parse;
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
        var storeMustacheVarsFlg = (futureMatches.length === 0);
        var futureMatch = {
            matchIdx: futureMatches.length,
            ASTLeaf: tplAST
        };
        futureMatches.push(futureMatch);
        var regExpPart = '';
        tplAST.children.forEach(function (child) { return regExpPart += __getRegExpPartByType[child.type](child, futureMatches, storeMustacheVarsFlg); });
        return storeMustacheVarsFlg ? regExpPart : "(" + regExpPart + ")";
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
        return "(" + (storeMustacheVars ? "" : "?:") + ".*)";
    };
    function _escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
});
//# sourceMappingURL=_parsing.js.map