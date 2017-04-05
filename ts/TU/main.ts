import { parse, compile, _findSections, debugOn, regenerateTpl } from "baldness"

let sourceTest1 = `<div>
  <b>Albert Einstein</b><br/>
  <desc>He was a German-born theoretical physicist. He developed the theory of relativity ... (from Wikipedia)</desc>
</div>
<div>
  <b>Marie Curie</b><br/>
  <i>female</i><br/>
  <desc>Marie Skłodowska Curie (/ˈkjʊri, kjʊˈriː/;[2] French: [kyʁi]; Polish: [kʲiˈri]; 7 November 1867 – 4 July 1934),
born Maria Salomea Skłodowska ([ˈmarja salɔˈmɛa skwɔˈdɔfska]),
was a Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity.(from Wikipedia)
</desc>
</div>
<div>
  <b>Niels Bohr</b><br/>
  <i>male</i><br/>
</div>`

let tplTest1 = `{{#person}}<div>
  <b>{{name}}</b><br/>
  {{#gender}}<i>{{value}}</i><br/>
{{/gender}}
{{#description}}  <desc>{{text}}</desc>
{{/description}}</div>
{{/person}}
...final text`


let tplTest3 = 'test of a template with no section {{var1}} ... {{var2}}...'
let tplTest4 = 'test of a template with no section {handlebars which have no sense}} {{ } #{}/ and finishing with a mustache {{var1}} ... {{var2}}'

// Activates the verbose mode for BaldnessJs
debugOn()

function test1() {
  console.group('Preliminary tests, while finding simple sections position in TPL')

  let firstLevelSections = _findSections(tplTest1)
  console.assert(firstLevelSections.length === 1, 'Nb of Sections of first level should be 1')
  console.assert(firstLevelSections[0].position.raw.begin === 0, 'The begin of the first section should be 0')
  console.log('firstLevelSections', firstLevelSections)

  let secondLevelSections = _findSections(firstLevelSections[0].src)
  console.assert(secondLevelSections.length === 2, 'Nb of Sections of second level should be 2')
  console.assert(secondLevelSections[0].position.raw.begin === 31, 'The begin of the first section of the second level is 31')
  console.log('secondLevelSections', secondLevelSections)
  console.groupEnd()
}

function test2() {
  console.group('Tests of a full compilation of the TPL')
  let AST = compile(tplTest1)

  console.assert(AST.children.length === 2, "AST should have 2 children wich are the section 'person' and the final text")
  console.assert(AST.children[0].children.length === 7, "The first level section should have 7 children")
  console.log('AST', AST)
  let regeneratedTpl = regenerateTpl(AST)
  console.log('Original src of tpl', tplTest1)
  console.log('Regenerated src of tpl', regeneratedTpl)
  console.assert(regeneratedTpl === tplTest1, 'The regenerated TPL from AST must be equal to original TPL')
  console.groupEnd()
}

function test3() {
  console.group('Tests of a full compilation of a TPL without any section')
  let AST = compile(tplTest3)

  console.assert(AST.children.length === 5, "AST has 5 children")
  console.log('AST', AST);
  console.groupEnd()
}


// Here is the execution of tests
export function exec() {
  console.log('The tests below pass if there is no error in the console log');
  test1()
  test2()
  test3()
}
