import Baldness from "../baldness"

let sourceTest1Bis = `<div>
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

let sourceTest1 = `<div>
  <b>Marie Curie</b><br/>
  <i>female</i><br/>
  <desc>Marie Skłodowska Curie (/ˈkjʊri, kjʊˈriː/;[2] French: [kyʁi]; Polish: [kʲiˈri]; 7 November 1867 – 4 July 1934),
born Maria Salomea Skłodowska ([ˈmarja salɔˈmɛa skwɔˈdɔfska]),
was a Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity.(from Wikipedia)
</desc>
</div>
`

let sourceTest1Ter = `<div>
  <b>Albert Einstein</b><br/>
  <desc>He was a German-born theoretical physicist.
  He developed the theory of relativity ... (from Wikipedia)</desc>
</div>
`

let tplTest1 = `{{#person}}<div>
  <b>{{name}}</b><br/>
{{#gender?}}  <i>{{value}}</i><br/>
{{/gender}}{{#description}}  <desc>{{text([^]*)}}</desc>
{{/description}}</div>
{{/person}}`


let tplTest3 = 'test of a template with no section {{var1}} ... {{var2}}...'
let tplTest4 = 'test of a template with no section {handlebars which have no sense}} {{ } #{}/ and finishing with a mustache {{var1}} ... {{var2}}'

let sourceTest2 = "I have 3 dollars in my pocket and I want to buy a sandwich."
let tplTest5 = "I have {{money}} dollars in my pocket and I want to buy {{thing}}."

let sourceTest3 = "I have 3 dollars in my pocket and I want to buy a sandwich. My pants are blue."
let tplTest6 = "I have {{money}} dollars in my pocket and I want to buy {{thing}}.{{#clothes}} {{cloth}} are {{color}}.{{/clothes}}"

let tplTest7 = "I have {{money}} dollars in my pocket and I want to buy {{thing([^.]*)}}.{{#clothes?}} {{cloth}} are {{color}}.{{/clothes}}"

let abcBourseSrc = "AN8068571086;04/01/16;63,21;64,40;62,82;63,15;8251\r\nAN8068571086;05/01/16;64,00;65,00;63,58;64,16;3127\r\nAN8068571086;06/01/16;63,70;64,47;63,00;64,43;3358\r\n"

let tplCSVAbcBourse = "{{#actions*}}{{ISIN}};{{day}}/{{month}}/{{year}};{{openingPrice}};{{max}};{{min}};{{closingPrice}};{{volumeWeighted}}\r\n{{/actions}}"


// Activate the verbose mode for BaldnessJs
Baldness.debugOn()

function test1() {
  console.group('Preliminary tests, while finding simple sections position in TPL')

  let firstLevelSections = Baldness._findSections(tplTest1)
  console.assert(firstLevelSections.length === 1, 'Nb of Sections of first level should be 1')
  console.assert(firstLevelSections[0].position.raw.begin === 0, 'The begin of the first section should be 0')
  console.log('firstLevelSections', firstLevelSections)

  let secondLevelSections = Baldness._findSections(firstLevelSections[0].src)
  console.assert(secondLevelSections.length === 2, 'Nb of Sections of second level should be 2')
  console.assert(secondLevelSections[0].position.raw.begin === 31, 'The begin of the first section of the second level is 31')
  console.log('secondLevelSections', secondLevelSections)
  console.groupEnd()
}

function test2() {
  console.group('Tests of a full compilation of the TPL')
  let AST = Baldness.compile(tplTest1)

  console.assert(AST.children.length === 2, "AST should have 2 children wich are the section 'person' and the final text")
  console.assert(AST.children[0].children.length === 7, "The first level section should have 7 children")
  console.log('AST', AST)
  let regeneratedTpl = Baldness.regenerateTpl(AST)
  console.log('Original src of tpl', tplTest1)
  console.log('Regenerated src of tpl', regeneratedTpl)
  console.assert(regeneratedTpl === tplTest1, 'The regenerated TPL from AST must be equal to original TPL')
  console.groupEnd()
}

function test3() {
  console.group('Tests of a full compilation of a TPL without any section')
  let AST = Baldness.compile(tplTest3)

  console.assert(AST.children.length === 5, "AST has 5 children")
  console.log('AST', AST);

  console.groupEnd()
}

function test4() {
  console.group('Tests of a full but very simple parse')
  let result = Baldness.parse(sourceTest2, tplTest5)
  console.log('AST', Baldness.getLastAST())
  console.log('Result', result);
  console.groupEnd()
}

function test5() {
  console.group('Tests of a more complex parse')
  let result = Baldness.parse(sourceTest3, tplTest6)
  console.log('AST', Baldness.getLastAST())
  console.log('Result', result);
  console.groupEnd()
}

function test6() {
  console.group('Tests of a simple tpl with a non-mandatory section')

  let AST = Baldness.compile(tplTest7)
  console.log('AST', AST)
  console.assert(AST.children.length === 6, "There must be 6 children")
  console.assert(AST.children[5].type === "section")

  let result = Baldness.parse(sourceTest2, AST)
  console.log('Result', result);
  console.assert(result.clothes === undefined, "The section does not appear in source, so it must not appear in result")

  result = Baldness.parse(sourceTest3, AST)
  console.log('Result', result);
  console.assert(result.clothes !== undefined, "The section appears in source, so it must appear in result")

  console.groupEnd()
}

function test7() {
  console.group('Tests of a parse of simple html source')
  let result = Baldness.parse(sourceTest1Ter, tplTest1)
  let AST = Baldness.getLastAST()
  console.log('AST', AST)
  console.log('Result', result);

  console.assert(result.person, 'Person has not been recognised')
  console.assert(result.person.name === 'Albert Einstein', 'Person has not been recognised')

  result = Baldness.parse(sourceTest1, tplTest1)
  AST = Baldness.getLastAST()
  console.log('AST', AST)
  console.log('Result', result);
  console.groupEnd()
}

function test8() {
  console.group('Tests of a parse of simple multi section tpl source from stocks CSV')
  let result = Baldness.parse(abcBourseSrc, tplCSVAbcBourse)
  console.log('AST', Baldness.getLastAST())

  console.assert(result.actions !== undefined, 'Thee must be an actions property')
  console.assert(result.actions.length !== undefined, 'The actions property must be an array')
  console.assert(result.actions.length && result.actions.length === 3, 'There must be three lines of stocks so three lines in actions array')

  console.log('Result:');
  console.log(result)
}

//
// Here is the execution of tests
//
export function exec() {
  console.log('The tests below pass if there is no error in the console log');
  /*test1()
  test2()
  test3()
  test4()
  test5()
  test6()*/
  //test7()
  //test6()
  test8()
}
