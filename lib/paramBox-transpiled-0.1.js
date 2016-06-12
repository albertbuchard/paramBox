"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DragBox = function () {
	function DragBox() {
		var boxElement = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

		_classCallCheck(this, DragBox);

		// constants
		this.MAX_BINDED_PROPERTIES = 15;
		this.INIT_WIDTH = 400;
		this.INIT_HEIGHT = 300;
		this.DEFAULT_BOX_CLASS = "dragbox";
		this.DEFAULT_DRAGGABLE = true;
		this.DEFAULT_STICKINESS_TYPE = "magnetized";

		// ui variables
		this.boxElement = boxElement;
		this.draggable = this.DEFAULT_DRAGGABLE;
		this.boxHTML = null;

		// stickness
		this.shouldStick = null;
		this.shouldMagnetize = null;
		this.isStickingX = null;
		this.isStickingY = null;
		this._stickiness = this.DEFAULT_STICKINESS_TYPE;
		this.stickiness = this._stickiness;

		// private
		this._beingDragged = false;
		this._visibility = "hidden";

		// keyboard variables
		// maps the keys pressed with either true on kedown or false on keyup
		this.map = [];

		// keep mouse position at all times
		this.currentMousePos = { x: -1, y: -1 };

		var thisObject = this;

		$(document).mousemove(function (event) {
			thisObject.currentMousePos.x = event.pageX;
			thisObject.currentMousePos.y = event.pageY;
		});

		// check if the box already exists, else create it
		if (!this.boxElement) {
			$("#paramBox").remove();

			// html for creation
			this.boxHTML = '<div id="dragbox" class="' + this.DEFAULT_BOX_CLASS + '" style="visibility:hidden;" draggable="true">' + '<div class="col-xs-12 dragbox-title"><center><h3>Dragbox</h3></center></div>' + '<div class="col-xs-12 dragbox-content"></div>' + '</div>';

			$(document.body).append(this.boxHTML);
			this.boxElement = $("#dragbox");
		}

		// keyboard show hide hotkeys events
		$(document.body).keydown(function (e) {
			thisObject.keyfunction(e);
		});
		$(document.body).keyup(function (e) {
			thisObject.keyfunction(e);
		});

		$(this.boxElement).find(".dragbox-title").mousedown(function (e) {
			thisObject.startDrag(e);
		});
		$(this.boxElement).find(".dragbox-title").mouseup(function (e) {
			thisObject.stopDrag(e);
		});

		// draggin cleanUp event
		$(document).click(function (e) {
			thisObject.stopDrag(e);
		});
	}

	// drag methods


	_createClass(DragBox, [{
		key: "startDrag",
		value: function startDrag(e) {
			// prevent classic dragging from happening
			e.preventDefault();

			// check if already being dragged, stop the dragging if so
			if (this.beingDragged == "true") {
				this.beingDragged = false;
				return;
			}

			// calculate X and Y offset of the mouse compare to the top left corner of the box
			var offset = { x: e.clientX - $(this.boxElement).offset().left, y: e.clientY - $(this.boxElement).offset().top };

			// set the beingdragged flag to true
			this.beingDragged = true;

			// start the update loop for smooth dragging
			this.loopDrag(offset);

			// another way of preventing default, just in case
			return false;
		}
	}, {
		key: "stopDrag",
		value: function stopDrag() {
			this.beingDragged = false;
		}
	}, {
		key: "loopDrag",
		value: function loopDrag(offset) {
			if (this.beingDragged == true) {
				var newPosX = this.currentMousePos.x - offset.x;
				var newPosY = this.currentMousePos.y - offset.y;

				var element = {
					offsetLeft: newPosX,
					offsetTop: newPosY,
					offsetWidth: $(this.boxElement).width(),
					offsetHeigth: $(this.boxElement).height()
				};

				// maintain box totally visible and check for sticky borders
				var constrainedPosition = ParamBox.stayInWindow(element);
				var constrainedPositionX = constrainedPosition.x;
				var constrainedPositionY = constrainedPosition.y;

				// stickiness
				// glue
				if (this.shouldStick) {
					//make the box sticky if collided with x border
					if (constrainedPosition.stickyX == -2 || constrainedPosition.stickyX == 2) {
						this.isStickingX = true;
					}

					// for sticky window, check if the box got out of the sticky x aera before authorizing movement in x
					if (this.isStickingX && constrainedPosition.stickyX != 0) {
						constrainedPositionX = constrainedPosition.leftSticky; //stick to the window
					}

					// make sure stickiness disapears when out of the sticky zone
					if (constrainedPosition.stickyX == 0) {
						this.isStickingX = false;
					}

					// make the box sticky if collided with y border
					if (constrainedPosition.stickyY == -2 || constrainedPosition.stickyY == 2) {
						this.isStickingY = true;
					}

					// for sticky window, check if the box got out of the sticky y aera before authorizing movement in y
					if (this.isStickingY && constrainedPosition.stickyY != 0) {
						constrainedPositionY = constrainedPosition.topSticky; //stick to the window
					}

					// make sure stickiness disapears when out of the sticky zone
					if (constrainedPosition.stickyY == 0) {
						this.isStickingY = false;
					}
				}

				// magnet
				if (this.shouldMagnetize) {
					constrainedPositionX = constrainedPosition.leftSticky;
					constrainedPositionY = constrainedPosition.topSticky;
				}

				var thisObject = this;
				$(this.boxElement).animate({
					left: constrainedPositionX,
					top: constrainedPositionY
				}, 25, function () {
					thisObject.loopDrag(offset);
				});
				return false;
			}
		}

		// keyboard functions

	}, {
		key: "keyfunction",
		value: function keyfunction(e) {
			// check if shift + P hotkeys were stroke and toggle visibility if so
			this.map[e.keyCode] = e.type == 'keydown';

			// hide and show parameter box
			if (this.map[16] && this.map[80]) {
				// 16 == Shift - 80 == P
				//make sure to reset value in case keyup event is ignored (keep shift true for rapid toggle)
				this.map[80] = false;

				// toggle box visibility
				this.toggle();

				// prevent default action if any
				e.preventDefault();
			}
		}

		// visibility functions

	}, {
		key: "toggle",
		value: function toggle() {
			// toggle box visibility
			if (this.visibility == "hidden") {
				this.visibility = "visible";
			} else {
				this.visibility = "hidden";
			}
		}
	}, {
		key: "show",
		value: function show() {
			this.visibility = "visible";
		}
	}, {
		key: "hide",
		value: function hide() {
			this.visibility = "hidden";
		}

		// setters getters

	}, {
		key: "beingDragged",
		set: function set(dragged) {
			this._beingDragged = dragged;
			$(this.boxElement).attr("beingDragged", dragged);
		},
		get: function get() {
			return this._beingDragged;
		}
	}, {
		key: "visibility",
		set: function set(visibility) {
			this._visibility = visibility;
			$(this.boxElement).css("visibility", visibility);
		},
		get: function get() {
			return this._visibility;
		}
	}, {
		key: "stickiness",
		set: function set(type) {
			// different type of stickyness for the box : "none", "glue", "magnetized"
			switch (type) {
				case "none":
					this.shouldMagnetize = false;
					this.shouldStick = false;
					console.log("stickiness set to none");
					break;
				case "glue":
					this.shouldStick = true;
					this.shouldMagnetize = false;
					console.log("stickiness set to glue");
					break;
				case "magnetized":
					this.shouldStick = false;
					this.shouldMagnetize = true;
					console.log("stickiness set to magnetized");
					break;
				default:
					throw new Error("this sticky type does not exist. Types are : none, glue, or magnetized.");

			}
			this._stickiness = type;
		}
	}, {
		key: "title",
		set: function set(html) {
			if (this.boxElement) {
				$(this.boxElement).find(".dragbox-title").html(html);
			}
		}

		// some static helper functions

	}], [{
		key: "stayInWindow",
		value: function stayInWindow(element) {
			if (typeof element === 'undefined') {
				throw new Error("element is undefined");
			}

			// constants
			var STOP_BEING_STICKY_AFTER = 0.15; // times the size in distance

			// coordinates
			var left = element.offsetLeft;
			var right = element.offsetLeft + element.offsetWidth;
			var top = element.offsetTop;
			var bottom = element.offsetTop + element.offsetHeigth;

			var maxLeft = window.innerWidth - element.offsetWidth;
			var maxTop = window.innerHeight - element.offsetHeigth;

			return {
				x: left < 0 ? 0 : right > window.innerWidth ? maxLeft : left,
				y: top < 0 ? 0 : bottom > window.innerHeight ? maxTop : top,
				stickyX: left <= 0 ? -2 : left <= STOP_BEING_STICKY_AFTER * element.offsetWidth ? -1 : right >= window.innerWidth ? 2 : right >= window.innerWidth - STOP_BEING_STICKY_AFTER * element.offsetWidth ? 1 : 0,
				stickyY: top <= 0 ? -2 : top <= STOP_BEING_STICKY_AFTER * element.offsetHeigth ? -1 : bottom >= window.innerHeight ? 2 : bottom >= window.innerHeight - STOP_BEING_STICKY_AFTER * element.offsetHeigth ? 1 : 0,
				leftSticky: left <= 0 ? 0 : left <= STOP_BEING_STICKY_AFTER * element.offsetWidth ? 0 : right >= window.innerWidth ? window.innerWidth - element.offsetWidth : right >= window.innerWidth - STOP_BEING_STICKY_AFTER * element.offsetWidth ? window.innerWidth - element.offsetWidth : left,
				topSticky: top <= 0 ? 0 : top <= STOP_BEING_STICKY_AFTER * element.offsetHeigth ? 0 : bottom >= window.innerHeight ? window.innerHeight - element.offsetHeigth : bottom >= window.innerHeight - STOP_BEING_STICKY_AFTER * element.offsetHeigth ? window.innerHeight - element.offsetHeigth : top
			};
		}
	}]);

	return DragBox;
}();

var ParamBox = function (_DragBox) {
	_inherits(ParamBox, _DragBox);

	function ParamBox() {
		var boxElement = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

		_classCallCheck(this, ParamBox);

		// constants

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ParamBox).call(this, boxElement));
		// call super constructor


		_this.DEFAULT_ROW_HTML = '<div class="col-md-12 dragbox-row paramboxtmprow"></div>';

		// ui
		_this.rowHtml = _this.DEFAULT_ROW_HTML;

		// row hold the row object in dom as well as the bindedField object {rowDom: row, bindedField: bindedField}
		_this.rows = [];

		// set dragbox title
		_this.title = '<h5><i class="fa fa-cog fa-1x"></i> Parameter Box</h5>';

		return _this;
	}

	// binding methods


	_createClass(ParamBox, [{
		key: "bind",
		value: function bind(object, properties) {
			var constraints = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

			if (typeof object == 'undefined') {
				throw new Error("object is undefined");
			}

			if (properties.constructor === Array) {
				for (var i = 0; i < properties.length; i++) {
					if (typeof object[properties[i]] == 'undefined') {
						throw new Error("object property " + properties[i] + " is undefined");
					}

					var rowDom = this.newRowInDom();
					var bindedField = null;

					// look for a constrained field
					if (constraints != null) {
						if (typeof constraints[properties[i]] != 'undefined') {
							var bindedField = new BindedField(object, properties[i], rowDom, 'selector', constraints[properties[i]]);
						}
					}

					// if not constrained field found, create the most relevant type of field
					if (!bindedField) {
						if (object[properties[i]].constructor === Boolean) {
							var bindedField = new BindedField(object, properties[i], rowDom, 'selector', ["TRUE", "FALSE"]);
						} else {
							var bindedField = new BindedField(object, properties[i], rowDom);
						}
					}

					this.rows.push(this.getBindedRow(rowDom, bindedField));
				}
			} else {
				if (typeof object[properties] == 'undefined') {
					throw new Error("object property " + properties + " is undefined");
				}

				var rowDom = this.newRowInDom();
				var bindedField = null;

				// look for a constrained field
				if (constraints != null) {
					if (typeof constraints[properties] != 'undefined') {
						var bindedField = new BindedField(object, properties, rowDom, 'selector', constraints[properties]);
					}
				}

				// if not constrained field found, create the most relevant type of field
				if (!bindedField) {
					if (object[property].constructor === Boolean) {
						var bindedField = new BindedField(object, properties, rowDom, 'selector', ["TRUE", "FALSE"]);
					} else {
						var bindedField = new BindedField(object, properties, rowDom);
					}
				}

				this.rows.push(this.getBindedRow(rowDom, bindedField));
			}
		}
	}, {
		key: "unbind",
		value: function unbind(object, property) {
			for (var i = 0; i < this.rows.length; i++) {
				var bindedField = this.rows[i].bindedField;

				if (bindedField.object === object && bindedField.property == property) {
					this.rows.splice(i, 1);
					bindedField.delete();
				}
			}
		}

		// ui methods

	}, {
		key: "newRowInDom",
		value: function newRowInDom() {
			var row = null;
			$(this.boxElement).find(".dragbox-content").append(this.rowHtml);
			row = this.boxElement.find(".paramboxtmprow");
			$(row).removeClass("paramboxtmprow");

			return row;
		}
	}, {
		key: "getBindedRow",
		value: function getBindedRow(rowDom, bindedField) {
			return { rowDom: rowDom, bindedField: bindedField };
		}
	}, {
		key: "refreshView",
		value: function refreshView() {
			// check if all binded field are displayed in the paramBox
			// if not add them
			// get rid of unbinded field
		}
	}]);

	return ParamBox;
}(DragBox);

var BindedProperty = function () {
	function BindedProperty() {
		var object = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		var property = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

		_classCallCheck(this, BindedProperty);

		// constants
		this.HANDLED_VARIABLE_TYPES = ["number", "string", "boolean"];

		// data properties
		this.property = property;
		this.object = object;
		this.propagate = false; // to add ? chain propagation? a subscription system maybe...
		this.type = null;

		if (!this.object) {
			// if parent object is not set consider that the binding is with a variable in the global scope
			this.object = window;
		}

		if (property) {
			this.bind(object, property);
		}
	}

	// binding function


	_createClass(BindedProperty, [{
		key: "bind",
		value: function bind(object, property) {
			var propertyType = _typeof(this.object[this.property]);
			if (propertyType === 'undefined') {
				throw new Error("The variable you are trying to bind is undefined - either this object or the property is incorrect");
			} else {
				if (this.HANDLED_VARIABLE_TYPES.indexOf(propertyType) == -1) {
					throw new Error("The variable you are trying to bind is of a non-handled type (string, number or boolean");
				}
				this.property = property;
				this.object = object;
				this.type = this.object[this.property].constructor;
			}
		}
	}, {
		key: "convertToType",
		value: function convertToType(value) {
			if (this.type) {
				if (this.type === Boolean) {
					switch (String(value).toUpperCase()) {
						case "0":
							return false;
							break;
						case "1":
							return true;
							break;
						case "FALSE":
							return false;
							break;
						case "TRUE":
							return true;
							break;
					}
				}
				return this.type(value);
			} else {
				throw new Error("You are trying to convert a value to a the type of the binded property but the object has no property binded to it (or no type)");
			}
		}
		// getters and setters

	}, {
		key: "value",
		set: function set(value) {
			if (typeof this.object[this.property] === 'undefined') {
				throw new Error("The variable you are trying to bind is undefined - either this object or the property is incorrect");
			} else {
				this.object[this.property] = this.convertToType(value);
			}
		},
		get: function get() {
			if (typeof this.object[this.property] === 'undefined') {
				throw new Error("The variable you are trying to bind is undefined - either this object or the property is incorrect");
			} else {
				return this.object[this.property];
			}
		}
	}]);

	return BindedProperty;
}();

var BindedField = function (_BindedProperty) {
	_inherits(BindedField, _BindedProperty);

	// this class holds an active input field (select, text input, slider component)
	// it creates a field from the selected type and bind a binded property to it

	function BindedField() {
		var object = arguments.length <= 0 || arguments[0] === undefined ? mandatory("object") : arguments[0];
		var property = arguments.length <= 1 || arguments[1] === undefined ? mandatory("property") : arguments[1];
		var parent = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
		var fieldType = arguments.length <= 3 || arguments[3] === undefined ? 'input' : arguments[3];
		var allowedValues = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
		var addClass = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

		_classCallCheck(this, BindedField);

		// constant

		var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(BindedField).call(this, object, property));

		_this2.VALID_FIELD_TYPE = ["input", "selector", "slider"];

		// field
		_this2.field = null;
		_this2.fieldType = fieldType;
		_this2.fieldHTML = null;
		_this2.allowedValues = allowedValues;
		_this2.tempClass = "binded-" + (typeof object === "undefined" ? "undefined" : _typeof(object)) + property;

		// parent
		_this2.parent = parent;

		// build the field html
		switch (_this2.fieldType) {
			case 'input':
				_this2.fieldHTML = '<fieldset class="form-group">' + '<label>' + property + '</label>' + '<input type="text" class="form-control ' + _this2.tempClass + '" data-binded="' + property + '">' + '</fieldset>';
				break;
			case 'selector':
				if (!allowedValues) {
					throw new Error("fieldType selector needs at least one allowedValues");
				}

				_this2.fieldHTML = '<fieldset class="form-group">' + '<label>' + property + '</label>' + '<select class="form-control ' + _this2.tempClass + '" data-binded="' + property + '">';

				for (var i = 0; i < _this2.allowedValues.length; i++) {
					_this2.fieldHTML = _this2.fieldHTML + '<option value="' + _this2.allowedValues[i] + '">' + _this2.allowedValues[i] + '</option>';
				}
				_this2.fieldHTML = _this2.fieldHTML + '</select></fieldset>';
				break;
			case 'slider':
				break;
			default:
				throw new Error("fieldType is invalid : input, selector and slider are the only valid type for now");
		}

		if (parent) {
			_this2.placeInParent();
		}
		return _this2;
	}

	// ui function


	_createClass(BindedField, [{
		key: "placeInParent",
		value: function placeInParent() {
			var parent = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

			if (parent) {
				this.parent = parent;
			}

			$(this.parent).append(this.fieldHTML);
			this.field = $("." + this.tempClass);
			this.field.removeClass(this.tempClass);

			this.allowedValues ? this.allowedValues.constructor == Array ? this.field.val(this.allowedValues[0]) : this.field.val(this.value) : this.field.val(this.value);

			var thisObject = this;

			// add event listener on change
			this.field.change(function (e) {
				thisObject.update("field");
			});
			this.field.keyup(function (e) {
				thisObject.update("field");
			});
		}
	}, {
		key: "delete",
		value: function _delete() {
			//delete the fieldset
			this.field.parent().remove();
			this.property = null;
			this.object = null;
		}
	}, {
		key: "update",
		value: function update() {
			var origin = arguments.length <= 0 || arguments[0] === undefined ? "field" : arguments[0];

			if (origin == "field") {
				this.value = $(this.field).val();
			} else {
				if ($(this.field).val().toUpperCase() != String(this.value).toUpperCase()) {
					$(this.field).val(this.value);
				}
			}
		}

		// getters and setters

	}, {
		key: "value",
		set: function set(value) {
			if (typeof this.object[this.property] === 'undefined') {
				throw new Error("The variable you are trying to bind is undefined - either this object or the property is incorrect");
			} else {
				this.object[this.property] = this.convertToType(value);
				this.update("setter");
			}
		},
		get: function get() {
			if (typeof this.object[this.property] === 'undefined') {
				throw new Error("The variable you are trying to bind is undefined - either this object or the property is incorrect");
			} else {
				return this.object[this.property];
			}
		}
	}]);

	return BindedField;
}(BindedProperty);

// utilities


function mandatory() {
	var param = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

	throw new Error('Missing parameter ' + param);
}