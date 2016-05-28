# ractive-autocomplete

Autocomplete component for ractive.js

## Install

	npm install ractive-autocomplete

## Usage

```html
<autocomplete
	text="{{selection.name}}"
	value="{{selection.id}}"
	placeholder="Full name"
	displayMember="name"
	valueMember="id"
	delay="200"
	autoselect="true"
	suggest="{{searchUsers}}"/>
```

```javascript
	var AutoComplete = require("ractive-autocomplete");
	Ractive.components.autocomplete = AutoComplete;
	
	var ractive = new Ractive({
		el: document.querySelector("#container"),
		template: "..."
		data: function() {
			return {
				selection: { name: "bart", id: 1 },
				searchUsers: function(text, callback) {
					var error = null;
					var results = [{ name: "bart", id: 1 }, { name: "bart2", id: 2 }];
					callback(error, results);
				}
			};
		}
	});
```

## Parameters

### `text`

Current selected text (string)

### `value`

Current selected value (object)

### `placeholder`

Placeholder text (string)

### `displayMember`

Property to display.

- `string`: "name"
- `function`: function(object) { return object.name; }
- `null`: object

### `valueMember`

Property to bind to value (see displayMember)

### `delay`

Milliseconds to delay autocomplete (set to 0 to autocomplete on every keypress)

### `autoselect`

- `true`: Automatically select a value if the text matches any of the suggestions
- `false`: wait for [enter] to select a value

### `suggest`

Autocomplete function(text, callback)

- `text`: entered text
- `callback`: function(error, results) to retrieve autocomplete suggestions

## CSS classes

- `.ractive-autocomplete` root element
- `input` text input
- `div` suggestions root element
- `ul` suggestions list
- `li` suggestion
- `li.selected` selected suggestion
