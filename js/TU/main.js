(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "baldness"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var baldness_1 = require("baldness");
    var sourceTest1 = "<div>\n  <b>Albert Einstein</b><br/>\n  <desc>He was a German-born theoretical physicist. He developed the theory of relativity ... (from Wikipedia)</desc>\n</div>\n<div>\n  <b>Marie Curie</b><br/>\n  <i>female</i><br/>\n  <desc>Marie Sk\u0142odowska Curie (/\u02C8kj\u028Ari, kj\u028A\u02C8ri\u02D0/;[2] French: [ky\u0281i]; Polish: [k\u02B2i\u02C8ri]; 7 November 1867 \u2013 4 July 1934),\nborn Maria Salomea Sk\u0142odowska ([\u02C8marja sal\u0254\u02C8m\u025Ba skw\u0254\u02C8d\u0254fska]),\nwas a Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity.(from Wikipedia)\n</desc>\n</div>\n<div>\n  <b>Niels Bohr</b><br/>\n  <i>male</i><br/>\n</div>";
    var tplTest1 = "{{#person}}<div>\n  <b>{{name}}</b><br/>\n  {{#gender}}<i>{{value}}</i><br/>\n{{/gender}}\n{{#description}}  <desc>{{text}}</desc>\n{{/description}}</div>\n{{/person}}";
    var tplTest3 = 'test of a template with no section {{var1}} ... {{var2}}...';
    var tplTest4 = 'test of a template with no section {handlebars which have no sense}} {{ } #{}/ and finishing with a mustache {{var1}} ... {{var2}}';
    // Activates the verbose mode for BaldnessJs
    baldness_1.debugOn();
    function test1() {
        console.group('Preliminary tests, while finding simple sections position in TPL');
        var firstLevelSections = baldness_1._findSections(tplTest1);
        console.assert(firstLevelSections.length === 1, 'Nb of Sections of first level should be 1');
        console.assert(firstLevelSections[0].position.raw.begin === 0, 'The begin of the first section should be 0');
        console.log('firstLevelSections', firstLevelSections);
        var secondLevelSections = baldness_1._findSections(firstLevelSections[0].src);
        console.assert(secondLevelSections.length === 2, 'Nb of Sections of second level should be 2');
        console.assert(secondLevelSections[0].position.raw.begin === 31, 'The begin of the first section of the second level is 31');
        console.log('secondLevelSections', secondLevelSections);
        console.groupEnd();
    }
    function test2() {
        console.group('Tests of a full compilation of the TPL');
        var AST = baldness_1.compile(tplTest1);
        console.assert(AST.children.length === 1, "AST should have a unique child wich is the section 'person'");
        console.assert(AST.children[0].children.length === 7, "The first level section should have 7 children");
        console.log('AST', AST);
        var regeneratedTpl = baldness_1.regenerateTpl(AST);
        console.log('Original src of tpl', tplTest1);
        console.log('Regenerated src of tpl', regeneratedTpl);
        console.assert(regeneratedTpl === tplTest1, 'The regenerated TPL from AST must be equal to original TPL');
        console.groupEnd();
    }
    function test3() {
        console.group('Tests of a full compilation of a TPL without any section');
        var AST = baldness_1.compile(tplTest3);
        console.assert(AST.children.length === 1, "AST has a unique child wich is the section 'person'");
        console.log('AST', AST);
        console.groupEnd();
    }
    // Here is the execution of tests
    function exec() {
        console.log('The tests below pass if there is no error in the console log');
        test1();
        test2();
        test3();
    }
    exports.exec = exec;
});
//# sourceMappingURL=main.js.map