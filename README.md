# BaldnessJs

BaldnessJs, as the reverse of MustacheJs, is a little library made for parsing various strings (from html pages, logs, app history, etc.) and extract data with Mustach' style (handlebars) templates.

```html
I have 3 dollars in my pocket and I want to buy a sandwich . My pants are blue.
```
with this template :
```html
I have {{money}} dollars in my pocket and I want to buy {{thing}} .{{#clothes}} {{cloth}} are {{color}}.{{/clothes}}
```
gives :
```js
{
  "money" : 3,
  "thing" : "a sandwich"
  "clothes" :
    "cloth" : "My pants"
    "color" : "blue"
}
```
