# ReactGrid component

## Pre-requisites
- node 6.9+

## Installation & deploy

```
$ cd ~/react-data-grid
$ npm install

$ cd ~/react-data-grid/packages/react-data-grid-examples
$ npm install

$ cd ~/react-data-grid/packages/react-data-grid-addons
$ npm install

$ cd ~/react-data-grid
$ npm start

```


## Config
The gridConfig.json can be found in `~/packages/react-data-grid-examples/src/assets/gridConfig.json`

## Plugin usage 

```sh
import ReactGrid from '../components/ReactGrid';

render() {
  ...
  <ReactGrid 
    config = {gridConfig}
  />
}
```

the `gridConfig` is the configuration variable.

Ref. `~/packages/react-data-grid-examples/src/scripts/react-grid-demo.js` for more detials


### Columns Array data structure
Following data structure has been used for column data:

```sh
id                     | description                                            |
-----------------------|--------------------------------------------------------|
"key"                  | Field from Values Array that needs to be displayed     |
"name"                 | Header Text: By default Field value,                   |
"alignment"            | Alignment body content                                 |
"headerAlignment"      | Header Alignment                                       |
"editItemTemaplate"    | "text": for textbox currently only support text,       |
                       |for "checkbox, combobox" component is required to be    |
                        build but that is out of scope. Ref: forum              |
"width"                | width                                                  |
"resizable"            | resizable or not                                       |
"editable"             | Read Only : Make the column readonly                   |
"visible"              | Visible : true  / false                                |
"footerText"           | Footer Text                                            |
"columnClass"          | Column Class                                           |
"footerStyle"          |  Footer Style : CSS Classes                            |

```


* QA
- Q:  The client load just the data shown on current page. Control will pass page changed event / callback.
- A: For demo purpose I've added the function `pageChangeCallbackHandler` in 'packages/react-data-grid-examples/src/scripts/react-grid-demo.js' & this prints the current page index in console whever pagechage occurs in pagination. ref: https://user-images.githubusercontent.com/3652329/31578087-db568f80-b137-11e7-85df-f4a380c0b693.png

