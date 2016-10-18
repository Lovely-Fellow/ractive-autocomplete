var Ractive = require("ractive");

var KEY_ENTER = 13;
var KEY_ESC = 27;
var KEY_UP = 38;
var KEY_DOWN = 40;

var template
	= '<div class="ractive-autocomplete">'
	+	'<input value="{{_state.text}}" '
	+		'{{#if placeholder}}placeholder="{{placeholder}}"{{/if}} '
	+		'on-blur="blur" '
	+		'on-focus="show(true)" '
	+		'on-click="show(true)" '
	+		'on-keydown="keydown">'
	
	+		'{{#if _state.visible}}'
	+			'<ul on-mousedown="click">'
	+				'{{#_state.suggestions:i}}'
	+					'<li {{#if _state.isSelected(.)}}class="selected"{{/if}}>{{_state.getText(.)}}</li>'
	+				'{{/_state.suggestions}}'
	+			'</ul>'
	+		'{{/if}}'
	+ '</div>';
	
var getter = function(prop) {
	return function(obj) {
		if (obj === undefined) return "";
		var display = this.get(prop);
		
		switch (typeof display) {
			case "string": return obj[display];
			case "function": return display(obj);
			default: return obj;
		}
	};
};
	
module.exports = Ractive.extend({
	template: template,
	lazy: false,
	isolated: true,
	
	data: function() {
		return {
			text: "",
			value: null,
			placeholder: "",
			displayMember: null,
			valueMember: null,
			suggest: null,
			autoselect: false,
			delay: 200,
			
			_state: {
				text: "",
				value: null,
				suggestions: null,
				visible: false,
				
				isSelected: this.isSelected.bind(this),
				getText: this.getText.bind(this),
				getValue: this.getValue.bind(this)
			}
		};
	},
	
	isSelected: function(obj) {
		return this.getState("text") == this.getText(obj)
			&& this.getState("value") == this.getValue(obj);
	},
	
	getText: getter("displayMember"),
	getValue: getter("valueMember"),
	
	getSelectedIndex: function() {
		var suggestions = this.getState("suggestions") || [];
		
		for (var i = 0; i < suggestions.length; i++) {
			if (this.isSelected(suggestions[i])) return i;
		}
		
		return -1;
	},
	
	getState: function(path) { return this.get("_state." + path); },
	setState: function(path, value) { this.set("_state." + path, value); },
	
	oninit: function() {
	},
	
	onrender: function() {
		
		this.on("click", function(event) {
			var ul = this.find("ul");
			
			for (var i = 0; i < ul.children.length; i++) {
				if (ul.children[i] == event.original.target) {
					this.select(i);
					return;
				}
			}
		});
		
		this.on("keydown", function(event) {
			var key = event.original.keyCode;
			
			if (key == KEY_ENTER) {
				event.original.preventDefault();
				this.show(false);
				this.select(this.getSelectedIndex());
				
			} else if (key == KEY_ESC) {
				event.original.preventDefault();
				this.cancel();
				
			} else if (key == KEY_UP || key == KEY_DOWN) {
				event.original.preventDefault();
				var index = this.getSelectedIndex();
				
				if (!this.getState("visible")) {
					this.loadSuggestions();
					this.show(true);
					return;
				}
				
				if (index == -1) this.preview(0);
				if (key == KEY_UP && index > 0) this.preview(index - 1);
				if (key == KEY_DOWN && index < this.getState("suggestions").length - 1) this.preview(index + 1);
				
			} else {
				this.loadSuggestions();
			
			}
		});
		
		this.on("blur", function() {
			if (this.blurTimer) clearTimeout(this.blurTimer);
			this.blurTimer = setTimeout(this.show.bind(this, false), 100);
		});
		
		this.setState("text", this.get("text"));
		this.setState("value", this.get("value"));
		
	},
	
	show: function(visible) {
		visible = visible
			&& this.getState("suggestions")
			&& this.getState("suggestions").length > 0;
			
		this.setState("visible", !!visible);
	},
	
	cancel: function() {
		this.setState("text", this.get("text"));
		this.setState("value", this.get("value"));
		this.show(false);
	},
	
	select: function(index, visible) {
		this.preview(index);
		this.set("text", this.getState("text"));
		this.set("value", this.getState("value"));
		this.show(!!visible);
	},
	
	preview: function(index) {
		var suggestions = this.getState("suggestions") || [];
		var obj = suggestions[index];
		
		if (obj == undefined) {
			var text = this.getState("text");
			var value = null;
		} else {
			var text = this.getText(obj);
			var value = this.getValue(obj);
		}
		
		this.setState("text", text);
		this.setState("value", value);
	},
	
	loadSuggestions: function() {
		if (this.suggestTimer) {
			clearTimeout(this.suggestTimer);
		}
			
		var timer = this.suggestTimer = setTimeout(function() {
			if (timer != this.suggestTimer) return;
			
			this.suggestTimer = null;
			var suggest = this.get("suggest");
			var text = this.getState("text");
			
			suggest(text, function(error, suggestions) {
				if (error) return;
				
				this.setState("suggestions", suggestions || []);
				this.show(document.activeElement == this.find("input"));
				
				if (this.get("autoselect")) {
					var text = this.getState("text");
					for (var i = 0; i < suggestions.length; i++) {
						if (text == this.getText(suggestions[i])) {
							return this.select(i, this.find("input") == document.activeElement);
						}
					}
				}
				
			}.bind(this));
			
		}.bind(this), this.get("delay") || 0);
	}
	
});