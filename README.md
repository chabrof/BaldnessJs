# BaldnessJs

BaldnessJs, as the reverse of MustacheJs (or Handlebars.js equivalent), is a little library made for parsing various strings (from html pages, logs, app history, etc.) and extract data with Mustach' style (handlebars) templates.

## simple sample

This text :
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

## How to use it

```html
{{foo}}
```
is a variable, it will store the parsed data (in the simple example, 'money' variable has stored the string "3")

```html
{{#bar}}
```
is a mandatory section : a part of a text wich will creates a sub object in the result (such as "clothes" section in the sample bellow)

```html
{{#bar?}}
```
is a section which can not exist in source

```html
{{#bar*}}
```
this section can exist or not and can be multiple

```html
{{#bar+}}
```
this section exists in source one or more time
