(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./console", "./_test_node"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var console_1 = require("./console");
    var _test_node_1 = require("./_test_node");
    exports._console = console_1.nullConsole;
    function debugOn(prConsole) {
        exports._console = prConsole ? prConsole : console;
        // For node JS we create dummy functions for unknown methods of std Console
        if (!prConsole && _test_node_1.detectNodeJs()) {
            exports._console.group = function () { };
            exports._console.groupEnd = function () { };
        }
    }
    exports.debugOn = debugOn;
});
//# sourceMappingURL=_debug.js.map