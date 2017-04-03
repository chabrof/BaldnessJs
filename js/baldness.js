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
        sections.forEach(function (section) {
            _compileRecur(section);
            curPos = __insertChildrenInLeaf(leaf, curPos, section);
        });
        if (curPos < leaf.src.length - curPos) {
            // There is still text after the last section
            var text = leaf.src.substr(curPos);
            leaf.children.push({
                type: "text",
                src: leaf.src.substr(curPos),
                position: {
                    content: {
                        begin: curPos,
                        length: text.length
                    }
                }
            });
        }
        return leaf;
    }
    function __insertChildrenInLeaf(leaf, pos, section) {
        // The section can be preceded by text
        var textChild;
        var sectionRawPos = section.position.raw;
        if (sectionRawPos.begin > pos) {
            var textLen = sectionRawPos.begin - pos;
            textChild = {
                type: "text",
                src: leaf.src.substr(pos, textLen),
                position: {
                    content: {
                        begin: pos,
                        length: textLen
                    }
                }
            };
            leaf.children.push(textChild);
        }
        // Finally push the section as a child of leaf
        leaf.children.push(section);
        return sectionRawPos.begin + sectionRawPos.length;
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
        _console.log("  match:", match);
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
});
//# sourceMappingURL=baldness.js.map