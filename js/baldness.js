(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./_debug", "./_compile_AST", "./_parsing"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _debug_1 = require("./_debug");
    var _compile_AST_1 = require("./_compile_AST");
    var _parsing_1 = require("./_parsing");
    var Baldness = {
        parse: _parsing_1.parse,
        getLastAST: _parsing_1.getLastAST,
        compile: _compile_AST_1.compile,
        regenerateTpl: _compile_AST_1.regenerateTpl,
        debugOn: _debug_1.debugOn,
        _findSections: _compile_AST_1._findSections
    };
    exports.default = Baldness;
});
//# sourceMappingURL=baldness.js.map