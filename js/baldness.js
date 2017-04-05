(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var console_1 = require("console");
    var _console = console_1.nullConsole;
    function debugOn(prConsole) {
        _console = prConsole ? prConsole : console;
    }
    exports.debugOn = debugOn;
    function parse(source, tpl) {
        return "toto";
    }
    exports.parse = parse;
    function compile(tpl) {
        var root = {
            label: "root",
            type: "root",
            src: tpl,
            children: []
        };
        return _compileRecur(root);
    }
    exports.compile = compile;
    function _compileRecur(leaf) {
        var sections = _findSections(leaf.src);
        var curPos = 0;
        // Loop into the sections, and get what is preceding them
        sections.forEach(function (section) {
            _compileRecur(section);
            curPos = __insertMiscAndSection(leaf, curPos, section);
        });
        // Is there any text after the last section ?
        if (leaf.src.length - curPos) {
            var text = leaf.src.substr(curPos);
            // We are searching, in text, subparts (text ASTLeaves and other 'simple' ASTLeaves)
            __findSimpleLeavesAndText(text, curPos)
                .forEach(function (child) { return leaf.children.push(child); });
        }
        return leaf;
    }
    function __insertMiscAndSection(leaf, pos, section) {
        // The section can be preceded by text decorated itself with miscellaneous ASTLeaves
        var sectionRawPos = section.position.raw;
        if (sectionRawPos.begin > pos) {
            var textLen = sectionRawPos.begin - pos;
            // We are searching, in text, subparts (text ASTLeves and other 'simple' ASTLeaves)
            __findSimpleLeavesAndText(leaf.src.substr(pos, textLen), pos)
                .forEach(function (leafChild) { return leaf.children.push(leafChild); });
        }
        // Finally push the section as a child of the parent leaf
        leaf.children.push(section);
        return sectionRawPos.begin + sectionRawPos.length;
    }
    function __findSimpleLeavesAndText(src, pos) {
        var tmpTextChild = __createTextLeaf(src, pos);
        var simpleLeavesToFind = [
            { regExpStr: "({{([a-z_][a-z0-9_]+)}})", type: "mustacheVar" },
            { regExpStr: "({{\((.*)\)}})", type: "strSwallowing" }
        ];
        return __findSimpleLeavesAndTextRecur(tmpTextChild, tmpTextChild.src, tmpTextChild.position.raw.begin, simpleLeavesToFind);
    }
    function __findSimpleLeavesAndTextRecur(tmpTextChild, src, pos, leavesToFind) {
        _console.log("__findSimpleLeavesAndText");
        _console.log("  src :", src);
        _console.log("  nbTypes of Leaves to find :", leavesToFind.length);
        _console.assert(tmpTextChild.type === "text", 'The tmpTextChild must be a "text" typed ASTLeaf');
        if (leavesToFind[0] === undefined) {
            _console.log('  Just one text found :', src);
            return [__createTextLeaf(src, pos)]; // No leaf to find except the text given. -->
        }
        var leaves = [];
        var locPos = 0;
        var regExp = new RegExp(leavesToFind[0].regExpStr, "i");
        var match;
        while (match = src.match(regExp)) {
            if (match.index > 0) {
                var subSrc = src.substr(0, match.index);
                _console.log('  recur for text before the Simple leaf');
                __findSimpleLeavesAndTextRecur(tmpTextChild, subSrc, pos, leavesToFind.slice(1))
                    .forEach(function (leaf) { return leaves.push(leaf); });
                pos += subSrc.length;
                locPos += subSrc.length;
            }
            var simpleLeafLength = match[1].length;
            leaves.push({
                type: leavesToFind[0].type,
                src: null,
                label: match[2],
                markup: {
                    begin: match[1]
                },
                position: {
                    raw: {
                        begin: pos,
                        length: simpleLeafLength
                    }
                }
            });
            pos += simpleLeafLength;
            locPos += simpleLeafLength;
            src = src.substr(locPos);
        }
        // Take care of the potential text after the last found simple ASTLeaf (or the absence of it)
        _console.log('locPos', pos, 'length', tmpTextChild.position.raw.length);
        if (locPos < tmpTextChild.position.raw.length) {
            _console.log('  recur for text after the Simple leaf');
            __findSimpleLeavesAndTextRecur(tmpTextChild, src, pos, leavesToFind.slice(1))
                .forEach(function (leaf) { return leaves.push(leaf); });
        }
        _console.log('  Nb leaves finally found', leaves.length);
        return leaves;
    }
    function __createTextLeaf(src, posBegin) {
        return {
            type: "text",
            src: src,
            position: {
                raw: {
                    begin: posBegin,
                    length: src.length
                }
            }
        };
    }
    function _findSections(src) {
        var partialASTLeaf;
        var sectionLeaves = [];
        var pos = 0;
        while (partialASTLeaf = _findSectionBegin(src, pos)) {
            _console.log('  We find the begin of a section :', partialASTLeaf);
            try {
                _findSectionEnd(partialASTLeaf);
            }
            catch (e) {
                _console.error(e);
                return [];
            }
            sectionLeaves.push(partialASTLeaf);
            // Continue walking in the src in order to find more first-level sections
            pos = partialASTLeaf.position.raw.begin + partialASTLeaf.position.raw.length;
            src = src.substr(pos);
        }
        return sectionLeaves;
    }
    exports._findSections = _findSections;
    /**
     * Find the potential begin of the section and create a ASTLeaf
     * @function _findSectionBegin
     * @param {string} src : a part of the source text of the leaf
     * @param {number} pos : position in the global source text of the leaf
     * @return {ASTLeaf} created leaf
     */
    function _findSectionBegin(src, pos) {
        _console.log("_findSectionBegin", src);
        var regExp = new RegExp("({{#([a-z_][a-z0-9_]+)}})", "i");
        var match = src.match(regExp);
        if (!match)
            return null; // --> return
        _console.assert(match[0] !== undefined &&
            match[1] !== undefined &&
            match[2] !== undefined, 'match result not correct: ', match);
        return {
            label: match[2],
            type: "section",
            src: src.substr(match.index + match[1].length),
            markup: {
                begin: match[1],
                end: null
            },
            info: { repeatMode: "" },
            children: [],
            position: {
                raw: {
                    begin: match.index + pos,
                    length: null // not known for the moment
                },
                content: {
                    begin: match.index + match[1].length + pos,
                    length: null // not known for the moment
                }
            }
        };
    }
    /**
     * Find the end of the section and mutate section according to new infos
     * @function _findSectionEnd
     * @param {ASTLead} section
     */
    function _findSectionEnd(section) {
        _console.log("_findSectionEnd", section);
        var regExp = new RegExp("({{/" + section.label + "}})", "i");
        var match = section.src.match(regExp);
        if (!match)
            throw "No end of section for section : " + section.label; // --> exception
        _console.assert(match[0] !== undefined &&
            match[1] !== undefined);
        // Mutate section
        var beginMarkupLength = section.markup.begin.length;
        section.position.raw.length = match.index + match[1].length + beginMarkupLength;
        var contentPos = section.position.content;
        contentPos.length = match.index;
        section.src = section.src.substr(0, match.index);
        section.markup.end = match[1];
    }
    /**
     * Regenerate the template with an AST
     * (usually for debug purpose)
     * @function regenerateTpl
     * @public
     * @param {ASTLeaf} root of the AST
     * @return {string} the TPL (which should be the same as the one used to compile AST)
     */
    function regenerateTpl(leaf) {
        return __regenerateTpl[leaf.type](leaf);
    }
    exports.regenerateTpl = regenerateTpl;
    var __regenerateTpl = {};
    __regenerateTpl.root = function (leaf) {
        var tpl = '';
        leaf.children.forEach(function (child) { tpl += regenerateTpl(child); });
        return tpl;
    };
    __regenerateTpl.section = function (leaf) {
        var tpl = leaf.markup.begin;
        leaf.children.forEach(function (child) { tpl += regenerateTpl(child); });
        tpl += leaf.markup.end;
        return tpl;
    };
    __regenerateTpl.text = function (leaf) {
        return leaf.src;
    };
    __regenerateTpl.mustacheVar = function (leaf) {
        return leaf.markup.begin;
    };
    __regenerateTpl.strSwallowing = __regenerateTpl.mustacheVar;
});
//# sourceMappingURL=baldness.js.map