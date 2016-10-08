/**
 * ParamBox.JS
 * Created. 2016
 *
 * Plug and play tools for easy development in js. Part of the experiment.js toolbox.
 * 
 * Authors. Albert Buchard 
 *
 * Requires: bootstrap and jQuery
 * 
 * LICENSE MIT 
 */

/* =============== Set-up =============== */

/* === Get the absolute path of the library === */
var scripts = document.getElementsByTagName("script");
var paramBoxFullpath = scripts[scripts.length - 1].src;
var delimiterIndices = findAllIndices("/", paramBoxFullpath);
paramBoxFullpath = paramBoxFullpath.substr(0, delimiterIndices[delimiterIndices.length - 2]);

/* === Add the paramBox css once the page is loaded === */
document.addEventListener("DOMContentLoaded", function (event) {
  var head = document.getElementsByTagName('head')[0];
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = paramBoxFullpath + '/dist/paramBox.css';
  head.appendChild(link);
});

/** Dragable div - Parent class suporting the toolbox  */
class DragBox {
  constructor(boxElement = null, width = null, height = null) {
      // constants
      this.MAX_BINDED_PROPERTIES = 15;
      this.INIT_WIDTH = (width) ? width : 400;
      this.INIT_HEIGHT = (height) ? height : 300;
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
        this.boxHTML = '<div id="' + this.boxId + '" class="' + this._boxClass + '" style="opacity:0.0;" draggable="true">' +
          '<div class="col-xs-12 dragbox-container"><div class="col-xs-12 dragbox-title"><center><h3>Dragbox</h3></center></div>' +
          '<div class="col-xs-12 dragbox-content"></div><div class="col-xs-12 dragbox-footer"></div></div>' +
          '</div>';

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

      /* --- Load the query string if reload and import was used --- */
      this.queryString = this.getQueryString();

    }
    // destroy
  destroy() {
    // fade out and remove from DOM
    var thisObject = this;
    $(this.boxElement).animate({
      opacity: 0.0
    }, 25, function () {
      $(thisObject.boxElement).remove();
    });

  }

  // size methods
  updateSize() {
    $(this.boxElement).width(this.width);
    $(this.boxElement).height(this.height);

    var contentHeight = this.height -
      $(this.boxElement).find(".dragbox-title").height() -
      $(this.boxElement).find(".dragbox-footer").height() - 7;

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
  startDrag(e) {
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

  stopDrag() {
    this.beingDragged = false;
  }

  loopDrag(offset) {
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
        if ((constrainedPosition.stickyX == -2) || (constrainedPosition.stickyX == 2)) {
          this.isStickingX = true;
        }

        // for sticky window, check if the box got out of the sticky x aera before authorizing movement in x
        if ((this.isStickingX) && (constrainedPosition.stickyX !== 0)) {
          constrainedPositionX = constrainedPosition.leftSticky; //stick to the window
        }

        // make sure stickiness disapears when out of the sticky zone
        if (constrainedPosition.stickyX === 0) {
          this.isStickingX = false;
        }

        // make the box sticky if collided with y border
        if ((constrainedPosition.stickyY == -2) || (constrainedPosition.stickyY == 2)) {
          this.isStickingY = true;
        }

        // for sticky window, check if the box got out of the sticky y aera before authorizing movement in y
        if ((this.isStickingY) && (constrainedPosition.stickyY !== 0)) {
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
  keyfunction(e) {
    // check if shift + P hotkeys were stroke and toggle visibility if so
    console.log("keyEvent dragbox method");

  }

  // visibility functions
  toggle() {
    // toggle box visibility
    if (this.visibility == "hidden") {
      this.visibility = "visible";
    } else {
      this.visibility = "hidden";
    }
  }

  show() {
    this.visibility = "visible";
  }

  hide() {
    this.visibility = "hidden";
  }

  // content function

  /**
   * Add the specified html code to the specified target. 
   * If wrapInDivClass is set, a div of specified class is created around the html code. This could be usefull to set grid class like 'col-xs-12'.
   * @param  {string} html           html to append to the target
   * @param  {String} to             target identifier eg .target-class or #targetID
   * @param  {String} wrapInDivClass Null by default. If set, creates a div with specified class wrapping the html code.
   */
  append(html, to = ".dragbox-content", wrapInDivClass = null) {
    // append html to the selected child element of the dragbox
    if (this.boxElement) {
      if (wrapInDivClass !== null) {
        html = '<div class="' + wrapInDivClass + '" >' + html + "</div>";
      }

      if (to != "container") {
        this.boxElement.find(to).append(html);
      } else {
        this.boxElement.append(html);
      }

    }
  }

  /**
   * set or get html of the selected child element of the DragBox
   * @param  {String} child child selector
   * @param  {?string} value Either null if you want to get the html or a string to set the html of the node
   * @return {?string}       If value is null, returns a string of the html content of the node. 
   */
  html(child = ".dragbox-content", value = null) {
    // 
    if (this.boxElement) {
      var target = (child != "container") ? this.boxElement.find(child) : this.boxElement;

      if (value !== null) {
        target.html(value);
      } else {
        return (target.html());
      }
    }
  }

  /* ======== Setters and getters ======== */

  set width(width) {
    this._width = width;
    this.updateSize();
  }

  get width() {
    return (this._width);
  }

  set height(height) {
    this._height = height;
    this.updateSize();
  }

  get height() {
    return (this._height);
  }

  set beingDragged(dragged) {
    this._beingDragged = dragged;
    $(this.boxElement).attr("beingDragged", dragged);
  }

  get beingDragged() {
    return (this._beingDragged);
  }

  set boxClass(newClass) {
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
  }

  get boxClass() {
    if (this.boxElement) {
      return (this._boxClass);
    }
  }

  set visibility(visibility) {
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

  }

  get visibility() {
    return (this._visibility);
  }

  set overflow(overflow) {
    this._overflow = overflow;
    $(this.boxElement).find(".dragbox-content").css("overflow-y", overflow);
  }

  get overflow() {
    return (this._overflow);
  }

  /**
   * Variable defining how the box behaves near screen limit, weither it stick "glue", it magnetize "magnetized" or it has no interaction "none".
   * @return {[type]} [description]
   */
  static get stickiness() {}

  get stickiness() {
    return (this._stickiness);
  }

  set stickiness(type) {
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

  static get title() {}

  get title() {
    if (this.boxElement) {
      $(this.boxElement).find(".dragbox-title").html();
    }
  }

  set title(html) {
    if (this.boxElement) {
      $(this.boxElement).find(".dragbox-title").html(html);
      this.updateSize();
    }
  }

  set content(html) {
    if (this.boxElement) {
      this.contentDiv.html(html);
      this.updateSize();
    }
  }

  get content() {
    if (this.boxElement) {
      return (this.contentDiv.html());
    }
  }

  get contentDiv() {
    if (this.boxElement) {
      return ($(this.boxElement).find(".dragbox-content"));
    }
  }

  /* =============== Helper functions =============== */
  /**
   * From http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters?page=1&tab=votes#tab-top
   * @return {Array} Array containing variables of the location string.
   */
  getQueryString() {
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      // If first entry with this name
      if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
      } else if (typeof query_string[pair[0]] === "string") {
        var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
        query_string[pair[0]] = arr;
        // If third or later entry with this name
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
      }
    }
    return query_string;
  }

  /* ======== Static ======== */
  // TODO make non static probably
  // some static helper functions
  static stayInWindow(element) {
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

    return ({
      x: (left < 0) ? 0 : (right > window.innerWidth) ? maxLeft : left,
      y: (top < 0) ? 0 : (bottom > window.innerHeight) ? maxTop : top,
      stickyX: (left <= 0) ? -2 : (left <= STOP_BEING_STICKY_AFTER * element.offsetWidth) ? -1 : (right >= window.innerWidth) ? 2 : (right >= window.innerWidth - STOP_BEING_STICKY_AFTER * element.offsetWidth) ? 1 : 0,
      stickyY: (top <= 0) ? -2 : (top <= STOP_BEING_STICKY_AFTER * element.offsetHeigth) ? -1 : (bottom >= window.innerHeight) ? 2 : (bottom >= window.innerHeight - STOP_BEING_STICKY_AFTER * element.offsetHeigth) ? 1 : 0,
      leftSticky: (left <= 0) ? 0 : (left <= STOP_BEING_STICKY_AFTER * element.offsetWidth) ? 0 : (right >= window.innerWidth) ? window.innerWidth - element.offsetWidth : (right >= window.innerWidth - STOP_BEING_STICKY_AFTER * element.offsetWidth) ? window.innerWidth - element.offsetWidth : left,
      topSticky: (top <= 0) ? 0 : (top <= STOP_BEING_STICKY_AFTER * element.offsetHeigth) ? 0 : (bottom >= window.innerHeight) ? window.innerHeight - element.offsetHeigth : (bottom >= window.innerHeight - STOP_BEING_STICKY_AFTER * element.offsetHeigth) ? window.innerHeight - element.offsetHeigth : top
    });
  }

  static getCoordinateInWindow(element) {
    var left = element.offsetLeft;
    var right = element.offsetLeft + element.offsetWidth;
    var top = element.offsetTop;
    var bottom = element.offsetTop + element.offsetHeigth;

    var maxLeft = window.innerWidth - element.offsetWidth;
    var maxTop = window.innerHeight - element.offsetHeigth;

    return ({
      left: left,
      right: right,
      top: top,
      bottom: bottom,
      maxLeft: maxLeft,
      maxTop: maxTop
    });
  }
}

/** Helper class creating modals */
class SmartModal extends DragBox {
  constructor(formatType = "across", callback = null, buttonType = "closebutton", boxElement = null) {
    // call super constructor
    super(boxElement);

    // constants
    this.DEFAULT_BUTTON_ROW_HTML = '<div class="col-xs-12 dragbox-row smartmodal-buttonrow"></div>';
    this.DEFAULT_BUTTON_HTML = {
      closebutton: '<button type="button" class="btn btn-secondary dragbox-button  smartmodal-closebutton">Close</button>',
      nextbutton: '<button type="button" class="btn btn-secondary dragbox-button smartmodal-nextbutton">Next</button>',
      blankbutton: '<button type="button" class="btn btn-secondary dragbox-button smartmodal-blankbutton"></button>',
      sendbutton: '<button type="button" class="btn btn-secondary dragbox-button smartmodal-sendbutton">Send</button>',
    };
    this.DEFAULT_FORMAT_TYPES = {
      // format type desribe the topOffset, width, and height of the modal in proportion
      // updatePosition is called when the window is resized
      centralSmall: [0.2, 0.4, 0.3],
      centralLarge: [0.2, 0.7, 0.6],
      across: [0.3, 1, 0.4],
      overlay: [0.1, 0.8, 0.8]
    };

    // callback 
    this.callback = callback;

    // ui
    this.draggable = false;
    this.formatType = formatType;
    this.buttonRowHtml = this.DEFAULT_BUTTON_ROW_HTML;

    if (!(buttonType in this.DEFAULT_BUTTON_HTML)) {
      throw new Error("buttonType invalid");
    }
    this.buttonType = buttonType;

    // row hold the row object in dom as well as the bindedField object {rowDom: row, bindedField: bindedField}
    this.rows = [];

    // set dragbox title
    this.title = '<center><h5>Smart Modal</h5></center>';

    // setup the button
    this.append(this.buttonRowHtml, ".dragbox-footer");
    this.append(this.DEFAULT_BUTTON_HTML[this.buttonType], ".smartmodal-buttonrow");

    this.button = $(this.boxElement).find(".smartmodal-" + this.buttonType);

    // update position to fit the screen adequatly and show
    this.callAfterConstructor();

    // event listener for window resize updates the size and position.
    var smartModalObject = this;
    $(window).resize(function () {
      smartModalObject.updatePosition();
    });

    // event listener on the button
    $(this.button).click(function () {
      smartModalObject.callThenDestroy();
    });

  }

  // after setup life cycle function
  callAfterConstructor() {
    // update position to fit the screen adequatly and show
    this.updatePosition();
    this.updateSize();
    this.show();
  }

  // look for a callback then destroy
  callThenDestroy() {
    if (this.callback) {
      this.callback();
    }

    this.destroy();
  }

  // position function
  updatePosition() {
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
}

/** Dragable box holding double binded parameters for live development */
class ParamBox extends DragBox {
  constructor(boxElement = null) {
    // call super constructor
    super(boxElement);

    // constants
    this.DEFAULT_ROW_HTML = '<div class="col-md-12 dragbox-row paramboxtmprow"></div>';

    this.PARAMBOX_EMPTY_ROW_HTML = '<div class="col-md-12 dragbox-row parambox-empty"><center>No parameters binded.</center></div>';

    this.DEFAULT_BUTTON_ROW_HTML = '<div class="col-xs-12 dragbox-row parambox-buttonrow"></div>';
    this.DEFAULT_BUTTON_HTML = {
      savebutton: '<button type="button" class="btn btn-secondary btn-block dragbox-button parambox-savebutton">Save</button>',
      importbutton: '<button type="button" class="btn btn-secondary  btn-block dragbox-button parambox-importbutton">Import</button>',
      reloadbutton: '<button type="button" class="btn btn-secondary btn-block dragbox-button parambox-reloadbutton">Reload</button>'
    };

    // setup the buttons
    this.append(this.DEFAULT_BUTTON_ROW_HTML, ".dragbox-footer");
    this.append(this.DEFAULT_BUTTON_HTML.savebutton, ".parambox-buttonrow", "col-xs-4");
    this.append(this.DEFAULT_BUTTON_HTML.importbutton, ".parambox-buttonrow", "col-xs-4");
    this.append(this.DEFAULT_BUTTON_HTML.reloadbutton, ".parambox-buttonrow", "col-xs-4");

    var thisObject = this;
    this.boxElement[0].getElementsByClassName("parambox-savebutton")[0].addEventListener("click", function (e) {
      thisObject.save(e);
    });
    this.boxElement[0].getElementsByClassName("parambox-importbutton")[0].addEventListener("click", function (e) {
      thisObject.import(e);
    });
    this.boxElement[0].getElementsByClassName("parambox-reloadbutton")[0].addEventListener("click", function (e) {
      thisObject.reloadAndImport(e);
    });

    // ui
    this.rowHtml = this.DEFAULT_ROW_HTML;

    // row hold the row object in dom as well as the bindedField object {rowDom: row, bindedField: bindedField}
    this.rows = [];

    // set dragbox title
    this.title = '<h5><i class="fa fa-cog fa-1x"></i> Parameter Box</h5>';

    // set overflow
    this.overflow = "scroll";

    // set prefix for exports TODO: IMPLEMENT IT IN EXPORTS
    if (typeof window.paramPrefixIncrement === "undefined") {
      window.paramPrefixIncrement = 0;
    } else {
      window.paramPrefixIncrement += 1;
    }

    this.prefix = "paramBox" + window.paramPrefixIncrement;

    // update size and refreshView
    this.updateSize();

    this.refreshView();

  }

  // binding methods
  bind(object, properties, constraints = null) {
    if (typeof object == 'undefined') {
      throw new Error("object is undefined");
    }

    var objectHierarchy = null;

    if (properties.constructor !== Array) {
      properties = [properties];
    }

    for (var i = 0; i < properties.length; i++) {

      objectHierarchy = this.getDescendantProp(object, properties[i]); // TODO use lodash ?
      var objectTemp = objectHierarchy[0];
      var property = objectHierarchy[1];

      var rowDom = this.newRowInDom();
      var bindedField = null;

      /* --- look for a value in the query string for this property --- */
      var initialValue = null;
      if (typeof this.queryString[property] !== "undefined") {
        initialValue = this.queryString[property];
      }

      // look for a constrained field
      if (constraints !== null) {
        if (typeof constraints[properties[i]] != 'undefined') {
          var constraintValues = constraints[properties[i]];

          if (initialValue !== null) {
            if (constraintValues.indexOf(initialValue) === -1) {
              throw new Error("ParamBox.bind: cannot set initial value to query string value of " + initialValue + " because it is not in the constraints array.");
            }

            objectTemp[property] = objectTemp[property].constructor(initialValue);
          }

          var bindedField = new BindedField(objectTemp, property, rowDom, 'selector', constraintValues);
        }
      }

      // if no constrained field found, create the most relevant type of field
      if (!bindedField) {
        if (initialValue !== null) {
          objectTemp[property] = objectTemp[property].constructor(initialValue);
        }

        if (objectTemp[property].constructor === Boolean) {
          var bindedField = new BindedField(objectTemp, property, rowDom, 'selector', ["TRUE", "FALSE"], initialValue);
        } else {
          var bindedField = new BindedField(objectTemp, property, rowDom, 'input', null, initialValue);
        }
      }

      this.rows.push(this.getBindedRow(rowDom, bindedField));
    }

    this.refreshView();

  }

  unbind(object, property) {
    for (var i = 0; i < this.rows.length; i++) {
      var bindedField = this.rows[i].bindedField;

      if ((bindedField.object === object) && (bindedField.property == property)) {
        this.rows.splice(i, 1);
        bindedField.delete();
      }
    }

    this.refreshView();
  }

  // ui methods
  addExportButton() {

  }

  newRowInDom() {
    var row = null;
    $(this.boxElement).find(".dragbox-content").append(this.rowHtml);
    row = this.boxElement.find(".paramboxtmprow");
    $(row).removeClass("paramboxtmprow");

    return row;
  }

  getBindedRow(rowDom, bindedField) {
    return ({
      rowDom: rowDom,
      bindedField: bindedField
    });
  }

  refreshView() {
    // TODO: maybe check if all binded field are displayed in the paramBox. if not add them. get rid of unbinded field

    /* --- Add an export button if there is at least one binded property --- */
    if (this.rows.length) {
      this.boxElement[0].getElementsByClassName("parambox-buttonrow")[0].style.visibility = "visible";
    } else {
      this.boxElement[0].getElementsByClassName("parambox-buttonrow")[0].style.visibility = "hidden";
      //TODO: add empty message
    }

    /* --- Adapt the box's height to the number of parameters --- */
    var height = 80 + this.rows.length * 75;
    if (height > 600) {
      height = 600;
    }

    this.height = height;

  }

  keyfunction(e) {
    // check if shift + P hotkeys were stroke and toggle visibility if so
    this.map[e.keyCode] = e.type == 'keydown';

    // hide and show parameter box
    if ((this.map[16]) && (this.map[80])) {
      // 16 == Shift - 80 == P
      //make sure to reset value in case keyup event is ignored (keep shift true for rapid toggle)
      this.map[80] = false;

      // toggle box visibility
      this.toggle();

      // prevent default action if any
      e.preventDefault();
    }

  }

  /* ======== Import/Export functions ======== */
  getSummaryArray() {
    var summaryArray = [];
    for (var i = 0; i < this.rows.length; i++) {
      var bindedField = this.rows[i].bindedField;
      summaryArray.push({
        property: bindedField.property,
        value: bindedField.value
      });
    }

    return (summaryArray);
  }

  import (event) {
    // make it a smart form 
    // but while smart forms are finished use a simple prompt
    var importedString = prompt("Enter a JSON string:");
    var importedJSON = null;
    try {
      importedJSON = JSON.parse(importedString);
    } catch (e) {
      console.error("ParamBox.import: Invalid JSON string - Parsing error:", e);
    }

    if (importedJSON !== null) {
      if (importedJSON.constructor !== Array) {
        console.error("ParamBox.import: Invalid JSON string - the parent object needs to be of the same structure as the summaryArray");
      }

      for (var i = 0; i < importedJSON.length; i++) {
        if (typeof importedJSON[i].property === "undefined") {
          console.error("ParamBox.import: importedJSON[" + i + "].property is undefined. Invalid JSON string - the parent object needs to be of the same structure as the summaryArray.");
        }
        if (typeof importedJSON[i].value === "undefined") {
          console.error("ParamBox.import: importedJSON[" + i + "].value is undefined. Invalid JSON string - the parent object needs to be of the same structure as the summaryArray.");
        }

        this.setProperty(importedJSON[i].property, importedJSON[i].value);
      }
    }
  }

  save(event) {
    // get summary array
    var summaryArray = this.getSummaryArray();

    // stringify summary object
    var stringified = JSON.stringify(summaryArray, null, 2);

    // opens a new window with the stringified json
    var height = 30 + summaryArray.length * 70;
    if (height > 500) {
      height = 500;
    }
    window.open('data:application/json;' + (window.btoa ? 'base64,' + btoa(stringified) : stringified), "ParamBox.save", "width=400,height=" + height);

  }

  reloadAndImport(event) {
    /* --- Serialize the parameters in URL format --- */

    var summaryArray = this.getSummaryArray();
    var str = "";
    for (var i = 0; i < summaryArray.length; i++) {
      if (str !== "") {
        str += "&";
      }
      str += summaryArray[i].property + "=" + encodeURIComponent(summaryArray[i].value);
    }

    /* --- Append the parameters and reload the page --- */

    var url = window.location.href;
    var questionPosition = url.indexOf("?");
    if (questionPosition !== -1) {
      // delete arguments from the URL 
      url = url.substring(0, questionPosition);
    }
    url += "?" + str;
    window.location.href = url;

  }

  /**
   * Gets the last object and property from a string description of object hierachy 
   * @param  {object} object      Top object from which the hierarchy starts
   * @param  {string} description String describing the object hierachy (e.g this.object.has.property )
   * @return {array}             [parentObject, lastProperty, propertyValue]
   */
  getDescendantProp(object, description) {
    var arr = description.split(".");
    var parentObject = null;
    var lastProperty = null;

    while (arr.length) {
      parentObject = object;
      lastProperty = arr.shift();

      if (typeof object[lastProperty] === "undefined") {
        throw new Error("object property " + lastProperty + " is undefined");
      }

      object = object[lastProperty];
    }

    /* the last object of the while is the value of the specified property */
    var propertyValue = object;

    return [parentObject, lastProperty, propertyValue];
  }

  setProperty(property, value) {
    if (property.constructor !== String) {
      throw new Error("ParamBox.setProperty: property needs to be a string.");
    }

    var found = false;
    for (var i = 0; i < this.rows.length; i++) {
      if (this.rows[i].bindedField.property === property) {
        this.rows[i].bindedField.value = value;
        found = true;
      }
    }

    if (found === false) {
      console.warn("ParamBox.setProperty: did not find property " + property);
    }
  }

}

/** Wrapper class for easy chart creation using chart.js and SmartModal */
class SmartChart extends SmartModal {
  constructor(options = mandatory(), callback = null, boxElement = null) {
    if (typeof Chart === "undefined") {
      throw new Error("SmartChart.constructor: Chart.js is not loaded.");
    }

    if (options.constructor !== Object) {
      throw new Error("SmartChart.constructor: options needs to be an object (chart.js chart options)");
    }
    super("overlay", callback, "closebutton", boxElement);
    // save options 
    this.chartOptions = $.extend(true, {}, options);

    // set dragbox title
    this.title = '<center><h5>Smart Chart</h5></center>';

    // Create canvas 
    var canvasID = "chart-canvas" + ($("canvas").length + 1);
    this.content = '<canvas id="' + canvasID + '" class="chart-canvas"></canvas>';
    this.canvas = document.getElementById(canvasID);

    // Create chart
    try {
      Chart.defaults.global.responsive = true;
      Chart.defaults.global.maintainAspectRatio = false;
      this.chart = new Chart(this.canvas, options);
    } catch (e) {
      throw new Error("SmartChart.constructor: could not build the chart. Error: " + e);
    }

    this.canvas.style.background = "white";
    this.boxClass = "dragbox-white-boxshadow";

    // setup footer and buttons 
    this.DEFAULT_BUTTON_ROW_HTML = '<div class="col-xs-12 dragbox-row smartchart-buttonrow"><div class="col-xs-10"></div></div>';
    this.DEFAULT_BUTTON_HTML = {
      closebutton: '<button type="button" class="btn btn-secondary dragbox-button  smartchart-closebutton">Close</button>',
      savebutton: '<button type="button" class="btn btn-secondary dragbox-button smartchart-savebutton">Save</button>'
    };

    this.html(".dragbox-footer", this.DEFAULT_BUTTON_ROW_HTML);

    this.append(this.DEFAULT_BUTTON_HTML.savebutton, ".smartchart-buttonrow", "col-xs-1 centered");
    this.append(this.DEFAULT_BUTTON_HTML.closebutton, ".smartchart-buttonrow", "col-xs-1 centered");

    this.closeButton = this.button = $(this.boxElement).find(".smartchart-closebutton");
    this.saveButton = $(this.boxElement).find(".smartchart-savebutton");

    // event listener on the button
    thisObject = this;
    $(this.closeButton).click(function (e) {
      thisObject.callThenDestroy();
    });

    $(this.saveButton).click(function (e) {
      thisObject.save(e);
    });

    this.updatePosition();
    this.updateSize();
    var thisObject = this;
    setTimeout(function () {
      thisObject.chart.resize();
      thisObject.show();
    }, 250);

  }

  callAfterConstructor() {
    // overide smart modal
  }

  /** Overides SmartModal.callThenDestroy() function */
  callThenDestroy() {
    // look for a callback then destroy
    if (this.callback) {
      this.callback();
    }

    // if chart destroy the chart .destroy()
    if ((typeof this.chart !== "undefined") && (typeof Chart !== "undefined")) {
      if (this.chart.constructor === Chart) {
        this.chart.destroy();
      }
    }
    // call Dragbox.destroy()
    this.destroy();
  }

  save(event) {
    // stringify summary object
    var stringified = JSON.stringify(this.chartOptions, null, 2);

    // opens a new window with the stringified json
    var height = 150 + this.chartOptions.data.datasets.length * 150;
    if (height > 500) {
      height = 500;
    }
    window.open('data:application/json;' + (window.btoa ? 'base64,' + btoa(stringified) : stringified), "SmartChart.save", "width=400,height=" + height);

  }

}
/** TODO: Class generating a form based on preset fields and managing */
// class SmartForm extends SmartModal {
//   constructor(fields = mandatory(), callback = null, url = null, boxElement = null) {
//     if (fields.constructor !== Object) {
//       throw new Error("SmartForm: fields is not an object.");
//     }

//     /* --- Create the modal for the form --- */
//     super("overlay", callback, "sendbutton", boxElement);

//     // TODO Create the form element IF url !== null, else only use the callback to handle data. 

//     // constraints can be functions like checkPassword(x) { return (bool) }
//     this.fields = {};
//     var keys = _.keys(fields);
//     for (var i = 0; i < keys.length; i++) {
//       var key = keys[i];
//       // fields needs to have a name and type property
//       if (typeof fields[key].type === "undefined") {
//         throw new Error("SmartForm: field[" + i + "].type is undefinned");
//       }

//       var baseField = {
//         type: null,
//         constraints: null,
//         value: "",
//         bindedField: null
//       };

//       fields[key] = _.extends(baseField, fields[key]); // TODO Either migrate to lodash or rewrite an extend function as well a a keys function 

//       this.fields[key] = fields[key];

//       // TODO Create a form row
//       this.fields[key].bindedField = new BindedField(this.fields, key, this.content, this.fields[key].type, this.fields[key].constraints);

//     }

//   }
// }

class BindedProperty {
  constructor(object = null, property = null) {
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

    if (property !== null) {
      this.bind(object, property);
    }

  }

  /* ======== Binding function ======== */

  bind(object, property) {
    var propertyType = typeof this.object[this.property];
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

  convertToType(value) {
      if (this.type) {
        if (this.type === Boolean) {
          switch (String(value).toUpperCase()) {
          case "0":
            return (false);
          case "1":
            return (true);
          case "FALSE":
            return (false);
          case "TRUE":
            return (true);
          }
        }
        return (this.type(value));
      } else {
        throw new Error("You are trying to convert a value to a the type of the binded property but the object has no property binded to it (or no type)");
      }
    }
    // getters and setters
  set value(value) {
    if (typeof this.object[this.property] === 'undefined') {
      throw new Error("The variable you are trying to bind is undefined - either this object or the property is incorrect");
    } else {
      this.object[this.property] = this.convertToType(value);
    }
  }

  get value() {
    if (typeof this.object[this.property] === 'undefined') {
      throw new Error("The variable you are trying to bind is undefined - either this object or the property is incorrect");
    } else {
      return (this.object[this.property]);
    }
  }
}

class BindedField extends BindedProperty {
  // this class holds an active input field (select, text input, slider component)
  // it creates a field from the selected type and bind a binded property to it
  constructor(object = mandatory("object"),
    property = mandatory("property"),
    parent = null,
    fieldType = 'input',
    allowedValues = null) {

    super(object, property);

    // constant
    this.VALID_FIELD_TYPE = ["input", "selector", "slider"];

    // field
    this.field = null;
    this.fieldType = fieldType;
    this.fieldHTML = null;
    this.allowedValues = allowedValues;
    this.tempClass = "binded-" + typeof object + property;

    // parent
    this.parent = parent;

    // build the field html
    switch (this.fieldType) {
    case 'input':
      this.fieldHTML = '<fieldset class="form-group">' +
        '<label>' + property + '</label>' +
        '<input type="text" class="form-control ' + this.tempClass + '" data-binded="' + property + '">' +
        '</fieldset>';
      break;
    case 'selector':
      if (!allowedValues) {
        throw new Error("fieldType selector needs at least one allowedValues");
      }

      this.fieldHTML = '<fieldset class="form-group">' +
        '<label>' + property + '</label>' +
        '<select class="form-control ' + this.tempClass + '" data-binded="' + property + '">';

      for (var i = 0; i < this.allowedValues.length; i++) {
        this.fieldHTML = this.fieldHTML +
          '<option value="' + this.allowedValues[i] + '">' + this.allowedValues[i] + '</option>';
      }
      this.fieldHTML = this.fieldHTML + '</select></fieldset>';
      break;
    case 'slider':
      break;
    default:
      throw new Error("fieldType is invalid : input, selector and slider are the only valid type for now");
    }

    if (parent) {
      this.placeInParent();
    }
  }

  // ui function
  placeInParent(parent = null) {
    if (parent) {
      this.parent = parent;
    }

    $(this.parent).append(this.fieldHTML);
    this.field = $("." + this.tempClass);
    this.field.removeClass(this.tempClass);

    if (this.allowedValues) {
      if (this.allowedValues.constructor === Array) {
        if (this.allowedValues.indexOf(this.value) !== -1) {
          this.field.val(this.value);
        } else {
          this.field.val(this.allowedValues[0]);
        }
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

  delete() {
    //delete the fieldset
    this.field.parent().remove();
    this.property = null;
    this.object = null;
  }

  update(origin = "field") {
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
  set value(value) {
    if (typeof this.object[this.property] === 'undefined') {
      throw new Error("The variable you are trying to bind is undefined - either this object or the property is incorrect");
    } else {
      this.object[this.property] = this.convertToType(value);
      this.update("setter");
    }
  }

  get value() {
    if (typeof this.object[this.property] === 'undefined') {
      throw new Error("The variable you are trying to bind is undefined - either this object or the property is incorrect");
    } else {
      return (this.object[this.property]);
    }
  }
}

// utilities
function mandatory(param = "") {
  throw new Error('Missing parameter ' + param);
}

/**
 * Find all the positions of a needle in a haystack string
 * @param  {string} needle   string to find
 * @param  {string} haystack string to scan
 * @return {Array}  Either -1 if no match is found or an array containing the indicies
 */
function findAllIndices(needle = mandatory(), haystack = mandatory()) {
  var indices = [];
  for (var i = 0; i < haystack.length; i++) {
    if ((haystack.substr(i, needle.length)) === needle) {
      indices.push(i);
    }
  }

  if (indices.length) {
    return (indices);
  } else {
    return (-1);
  }
}