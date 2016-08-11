"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DragBox = function () {
  function DragBox() {
    var boxElement = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
    var width = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var height = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    _classCallCheck(this, DragBox);

    // constants
    this.MAX_BINDED_PROPERTIES = 15;
    this.INIT_WIDTH = width ? width : 400;
    this.INIT_HEIGHT = height ? height : 300;
    this.DEFAULT_BOX_CLASS = "dragbox";
    this.DEFAULT_DRAGGABLE = true;
    this.DEFAULT_STICKINESS_TYPE = "magnetized";

    // ui variables
    this.boxId = null;
    this.boxElement = boxElement;
    this.draggable = this.DEFAULT_DRAGGABLE;
    this.boxHTML = null;

    // stickness
    this.shouldStick = null;
    this.shouldMagnetize = null;
    this.isStickingX = null;
    this.isStickingY = null;

    this.stickiness = this.DEFAULT_STICKINESS_TYPE;

    // private
    this._beingDragged = false;
    this._visibility = "hidden";
    this._overflow = "hidden";
    this._boxClass = this.DEFAULT_BOX_CLASS;
    this._width = this.INIT_WIDTH;
    this._height = this.INIT_HEIGHT;

    // keyboard variables
    // maps the keys pressed with either true on kedown or false on keyup
    this.map = [];

    // keep mouse position at all times
    this.currentMousePos = {
      x: -1,
      y: -1
    };

    var thisObject = this;

    $(document).mousemove(function (event) {
      thisObject.currentMousePos.x = event.pageX;
      thisObject.currentMousePos.y = event.pageY;
    });

    // check if the box already exists, else create it
    if (!this.boxElement) {
      // get a unique ID for the box
      this.boxId = "dragbox" + ($("." + this._boxClass).length + 1);

      // html for creation
      this.boxHTML = '<div id="' + this.boxId + '" class="' + this._boxClass + '" style="opacity:0.0;" draggable="true">' + '<div class="col-xs-12 dragbox-container"><div class="col-xs-12 dragbox-title"><center><h3>Dragbox</h3></center></div>' + '<div class="col-xs-12 dragbox-content"></div><div class="col-xs-12 dragbox-footer"></div></div>' + '</div>';

      $(document.body).append(this.boxHTML);
      this.boxElement = $("#" + this.boxId);
    } else {
      this.boxId = $(this.boxElement).attr("id");
    }

    // set class
    this.boxClass = $(this.boxElement).attr('class');

    //set size
    this.width = this._width;
    this.height = this._height;

    // set overflow
    this.overflow = "hidden";

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
  // destroy


  _createClass(DragBox, [{
    key: "destroy",
    value: function destroy() {
      // fade out and remove from DOM
      var thisObject = this;
      $(this.boxElement).animate({
        opacity: 0.0
      }, 25, function () {
        $(thisObject.boxElement).remove();
      });
    }

    // size methods

  }, {
    key: "updateSize",
    value: function updateSize() {
      $(this.boxElement).width(this.width);
      $(this.boxElement).height(this.height);

      var contentHeight = this.height - $(this.boxElement).find(".dragbox-title").height() - $(this.boxElement).find(".dragbox-footer").height();

      var thisObject = this;
      $(this.boxElement).animate({
        height: thisObject.height,
        width: thisObject.width
      }, 25, function () {});
      $(this.boxElement).find(".dragbox-container").animate({
        height: thisObject.height
      }, 25, function () {});
      $(this.boxElement).find(".dragbox-content").animate({
        height: contentHeight
      }, 25, function () {});
    }

    // drag methods

  }, {
    key: "startDrag",
    value: function startDrag(e) {
      // prevent classic dragging from happening
      e.preventDefault();

      // check if already being dragged, stop the dragging if so
      if (this.beingDragged == "true") {
        this.beingDragged = false;
        return;
      }

      if (!this.draggable) {
        return;
      }

      // calculate X and Y offset of the mouse compare to the top left corner of the box
      var offset = {
        x: e.clientX - $(this.boxElement).offset().left,
        y: e.clientY - $(this.boxElement).offset().top
      };

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
      if (this.beingDragged === true) {
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
          if (this.isStickingX && constrainedPosition.stickyX !== 0) {
            constrainedPositionX = constrainedPosition.leftSticky; //stick to the window
          }

          // make sure stickiness disapears when out of the sticky zone
          if (constrainedPosition.stickyX === 0) {
            this.isStickingX = false;
          }

          // make the box sticky if collided with y border
          if (constrainedPosition.stickyY == -2 || constrainedPosition.stickyY == 2) {
            this.isStickingY = true;
          }

          // for sticky window, check if the box got out of the sticky y aera before authorizing movement in y
          if (this.isStickingY && constrainedPosition.stickyY !== 0) {
            constrainedPositionY = constrainedPosition.topSticky; //stick to the window
          }

          // make sure stickiness disapears when out of the sticky zone
          if (constrainedPosition.stickyY === 0) {
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
      console.log("keyEvent dragbox method");
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

    // content function

  }, {
    key: "append",
    value: function append(html) {
      var to = arguments.length <= 1 || arguments[1] === undefined ? ".dragbox-content" : arguments[1];

      // append html to the selected child element of the dragbox
      if (this.boxElement) {
        if (to != "container") {
          this.boxElement.find(to).append(html);
        } else {
          this.boxElement.append(html);
        }
      }
    }

    /* ======== Setters and getters ======== */

  }, {
    key: "width",
    set: function set(width) {
      this._width = width;
      this.updateSize();
    },
    get: function get() {
      return this._width;
    }
  }, {
    key: "height",
    set: function set(height) {
      this._height = height;
      this.updateSize();
    },
    get: function get() {
      return this._height;
    }
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
    key: "boxClass",
    set: function set(newClass) {
      if (this.boxElement) {

        if (typeof newClass != "string") {
          throw new Error("newClass must be a string");
        }

        // if there is more than one class in the string take the first one
        var spacePos = newClass.indexOf(" ");
        if (spacePos != -1) {
          newClass = newClass.substr(0, spacePos);
        }

        // remove the old class from the boxElement and add the new class
        this.boxElement.removeClass(this.boxClass).addClass(newClass);
        this._boxClass = newClass;
      }
    },
    get: function get() {
      if (this.boxElement) {
        return this._boxClass;
      }
    }
  }, {
    key: "visibility",
    set: function set(visibility) {
      this._visibility = visibility;
      if (visibility == "visible") {
        $(this.boxElement).animate({
          opacity: 1.0
        }, 150);
      } else {
        $(this.boxElement).animate({
          opacity: 0.0
        }, 150);
      }
    },
    get: function get() {
      return this._visibility;
    }
  }, {
    key: "overflow",
    set: function set(overflow) {
      this._overflow = overflow;
      $(this.boxElement).find(".dragbox-content").css("overflow-y", overflow);
    },
    get: function get() {
      return this._overflow;
    }

    /**
     * Variable defining how the box behaves near screen limit, weither it stick "glue", it magnetize "magnetized" or it has no interaction "none".
     * @return {[type]} [description]
     */

  }, {
    key: "stickiness",
    get: function get() {
      return this._stickiness;
    },
    set: function set(type) {
      // different type of stickyness for the box : "none", "glue", "magnetized"
      switch (type) {
        case "none":
          this.shouldMagnetize = false;
          this.shouldStick = false;
          console.log("Parambox: stickiness set to none");
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
    get: function get() {
      if (this.boxElement) {
        $(this.boxElement).find(".dragbox-title").html();
      }
    },
    set: function set(html) {
      if (this.boxElement) {
        $(this.boxElement).find(".dragbox-title").html(html);
      }
    }
  }, {
    key: "content",
    set: function set(html) {
      if (this.boxElement) {
        this.contentDiv.html(html);
      }
    },
    get: function get() {
      if (this.boxElement) {
        return this.contentDiv.html();
      }
    }
  }, {
    key: "contentDiv",
    get: function get() {
      if (this.boxElement) {
        return $(this.boxElement).find(".dragbox-content");
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
  }, {
    key: "getCoordinateInWindow",
    value: function getCoordinateInWindow(element) {
      var left = element.offsetLeft;
      var right = element.offsetLeft + element.offsetWidth;
      var top = element.offsetTop;
      var bottom = element.offsetTop + element.offsetHeigth;

      var maxLeft = window.innerWidth - element.offsetWidth;
      var maxTop = window.innerHeight - element.offsetHeigth;

      return {
        left: left,
        right: right,
        top: top,
        bottom: bottom,
        maxLeft: maxLeft,
        maxTop: maxTop
      };
    }
  }, {
    key: "stickiness",
    get: function get() {}
  }, {
    key: "title",
    get: function get() {}
  }]);

  return DragBox;
}();

// SmartModal Class

var SmartModal = function (_DragBox) {
  _inherits(SmartModal, _DragBox);

  function SmartModal() {
    var formatType = arguments.length <= 0 || arguments[0] === undefined ? "across" : arguments[0];
    var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var buttonType = arguments.length <= 2 || arguments[2] === undefined ? "closebutton" : arguments[2];
    var boxElement = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    _classCallCheck(this, SmartModal);

    // constants

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SmartModal).call(this, boxElement));
    // call super constructor


    _this.DEFAULT_BUTTON_ROW_HTML = '<div class="col-xs-12 dragbox-row smartmodal-buttonrow"></div>';
    _this.DEFAULT_BUTTON_HTML = {
      closebutton: '<button type="button" class="btn btn-secondary smartmodal-closebutton">Close</button>',
      nextbutton: '<button type="button" class="btn btn-secondary smartmodal-nextbutton">Next</button>',
      blankbutton: '<button type="button" class="btn btn-secondary smartmodal-blankbutton"></button>'
    };
    _this.DEFAULT_FORMAT_TYPES = {
      // format type desribe the topOffset, width, and height of the modal in proportion
      // updatePosition is called when the window is resized
      centralSmall: [0.2, 0.4, 0.3],
      centralLarge: [0.2, 0.7, 0.6],
      across: [0.3, 1, 0.4]
    };

    // callback
    _this.callback = callback;

    // ui
    _this.draggable = false;
    _this.formatType = formatType;
    _this.buttonRowHtml = _this.DEFAULT_BUTTON_ROW_HTML;

    if (!(buttonType in _this.DEFAULT_BUTTON_HTML)) {
      throw new Error("buttonType invalid");
    }
    _this.buttonType = buttonType;

    // row hold the row object in dom as well as the bindedField object {rowDom: row, bindedField: bindedField}
    _this.rows = [];

    // set dragbox title
    _this.title = '<center><h5>Smart Modal</h5></center>';

    // setup the button
    _this.append(_this.buttonRowHtml, ".dragbox-footer");
    _this.append(_this.DEFAULT_BUTTON_HTML[_this.buttonType], ".smartmodal-buttonrow");

    _this.button = $(_this.boxElement).find(".smartmodal-" + _this.buttonType);

    // update position to fit the screen adequatly and show
    _this.updatePosition();
    _this.show();

    // event listener for window resize updates the size and position.
    var smartModalObject = _this;
    $(window).resize(function () {
      smartModalObject.updatePosition();
    });

    // event listener on the button
    $(_this.button).click(function () {
      smartModalObject.callThenDestroy();
    });

    return _this;
  }

  // look for a callback then destroy


  _createClass(SmartModal, [{
    key: "callThenDestroy",
    value: function callThenDestroy() {
      if (this.callback) {
        this.callback();
      }

      this.destroy();
    }

    // position function

  }, {
    key: "updatePosition",
    value: function updatePosition() {
      //var coordinates = Dragbox.getCoordinateInWindow(this.boxElement);
      var innerHeight = window.innerHeight;
      var innerWidth = window.innerWidth;
      var format = this.DEFAULT_FORMAT_TYPES[this.formatType];
      var topPos = format[0] * innerHeight;
      var leftPos = innerWidth * (1 - format[1]) / 2;
      var width = innerWidth * format[1];
      var height = innerHeight * format[2];

      this.width = width;
      this.height = height;

      $(this.boxElement).animate({
        left: leftPos,
        top: topPos
      }, 25, function () {});
      return false;
    }
  }]);

  return SmartModal;
}(DragBox);

var ParamBox = function (_DragBox2) {
  _inherits(ParamBox, _DragBox2);

  function ParamBox() {
    var boxElement = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    _classCallCheck(this, ParamBox);

    // constants

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(ParamBox).call(this, boxElement));
    // call super constructor


    _this2.DEFAULT_ROW_HTML = '<div class="col-md-12 dragbox-row paramboxtmprow"></div>';

    // ui
    _this2.rowHtml = _this2.DEFAULT_ROW_HTML;

    // row hold the row object in dom as well as the bindedField object {rowDom: row, bindedField: bindedField}
    _this2.rows = [];

    // set dragbox title
    _this2.title = '<h5><i class="fa fa-cog fa-1x"></i> Parameter Box</h5>';

    // set overflow
    _this2.overflow = "scroll";

    return _this2;
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
          if (constraints !== null) {
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
        if (constraints !== null) {
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
      return {
        rowDom: rowDom,
        bindedField: bindedField
      };
    }
  }, {
    key: "refreshView",
    value: function refreshView() {
      // check if all binded field are displayed in the paramBox
      // if not add them
      // get rid of unbinded field
    }
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

  /* ======== Binding function ======== */

  _createClass(BindedProperty, [{
    key: "bind",
    value: function bind(object, property) {
      var propertyType = _typeof(this.object[this.property]);
      if (propertyType === 'undefined') {
        throw new Error("Parambox: The variable '" + property + "' you are trying to bind is undefined - either this object or the property is not defined");
      } else {
        if (this.HANDLED_VARIABLE_TYPES.indexOf(propertyType) == -1) {
          throw new Error("The variable you are trying to bind is of a non-handled type (string, number or boolean");
        }

        /**
         * Binded property key
         * @type {string}
         */
        this.property = property;

        /**
         * Parent object
         * @type {object}
         */
        this.object = object;

        /**
         * Binded property type constructor
         * @type {function}
         */
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
            case "1":
              return true;
            case "FALSE":
              return false;
            case "TRUE":
              return true;
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

    _classCallCheck(this, BindedField);

    // constant

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(BindedField).call(this, object, property));

    _this3.VALID_FIELD_TYPE = ["input", "selector", "slider"];

    // field
    _this3.field = null;
    _this3.fieldType = fieldType;
    _this3.fieldHTML = null;
    _this3.allowedValues = allowedValues;
    _this3.tempClass = "binded-" + (typeof object === "undefined" ? "undefined" : _typeof(object)) + property;

    // parent
    _this3.parent = parent;

    // build the field html
    switch (_this3.fieldType) {
      case 'input':
        _this3.fieldHTML = '<fieldset class="form-group">' + '<label>' + property + '</label>' + '<input type="text" class="form-control ' + _this3.tempClass + '" data-binded="' + property + '">' + '</fieldset>';
        break;
      case 'selector':
        if (!allowedValues) {
          throw new Error("fieldType selector needs at least one allowedValues");
        }

        _this3.fieldHTML = '<fieldset class="form-group">' + '<label>' + property + '</label>' + '<select class="form-control ' + _this3.tempClass + '" data-binded="' + property + '">';

        for (var i = 0; i < _this3.allowedValues.length; i++) {
          _this3.fieldHTML = _this3.fieldHTML + '<option value="' + _this3.allowedValues[i] + '">' + _this3.allowedValues[i] + '</option>';
        }
        _this3.fieldHTML = _this3.fieldHTML + '</select></fieldset>';
        break;
      case 'slider':
        break;
      default:
        throw new Error("fieldType is invalid : input, selector and slider are the only valid type for now");
    }

    if (parent) {
      _this3.placeInParent();
    }
    return _this3;
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

      if (this.allowedValues) {
        if (this.allowedValues.constructor === Array) {
          this.field.val(this.allowedValues[0]);
        } else {
          this.field.val(this.value);
        }
      } else {
        this.field.val(this.value);
      }

      var thisObject = this;

      // add event listener on change
      this.field.change(function (e) {
        thisObject.update("field");
      });
      this.field.keydown(function (e) {
        switch (e.keyCode) {
          case 13:
            /* Pressed enter */
            thisObject.update("field");
            break;
        }
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
        $(this.field).get(0).blur();
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