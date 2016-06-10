class DragBox {
	constructor (boxElement = null) {
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
    
    $(document).mousemove(function(event) {
        thisObject.currentMousePos.x = event.pageX;
        thisObject.currentMousePos.y = event.pageY;
    });

    // check if the box already exists, else create it
    if (!this.boxElement) {
    	$("#paramBox").remove();

    	// html for creation
    	this.boxHTML = '<div id="dragbox" class="'+this.DEFAULT_BOX_CLASS+'" style="visibility:hidden;" draggable="true">' +
				'<div class="col-xs-12 dragbox-title"><center><h3>Dragbox</h3></center></div>' +
				'<div class="col-xs-12 dragbox-content"></div>' +
				'</div>';

				$(document.body).append(this.boxHTML);
				this.boxElement = $("#dragbox");
    }

    // keyboard show hide hotkeys events
		$(document.body).keydown(function(e) { thisObject.keyfunction(e); });
		$(document.body).keyup(function(e) { thisObject.keyfunction(e); });

		$(this.boxElement).find(".dragbox-title").mousedown(function(e) { thisObject.startDrag(e); });
		$(this.boxElement).find(".dragbox-title").mouseup(function(e) { thisObject.stopDrag(e); });

    // draggin cleanUp event
    $(document).click(function(e) {
    		thisObject.stopDrag(e);
    });

	}


	// drag methods
	startDrag(e) {
    // prevent classic dragging from happening
    e.preventDefault();

    // check if already being dragged, stop the dragging if so
    if (this.beingDragged=="true") {
    	this.beingDragged = false;
    	return;
    }

    // calculate X and Y offset of the mouse compare to the top left corner of the box
    var offset = {x: e.clientX-$(this.boxElement).offset().left, y:  e.clientY-$(this.boxElement).offset().top};

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
	  if (this.beingDragged==true) {
	  	var newPosX = this.currentMousePos.x-offset.x;
	  	var newPosY = this.currentMousePos.y-offset.y;

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
		  	if ((constrainedPosition.stickyX == -2)||(constrainedPosition.stickyX == 2)) {
		  		this.isStickingX = true;
		  	}

		  	// for sticky window, check if the box got out of the sticky x aera before authorizing movement in x
		  	if ((this.isStickingX)&&(constrainedPosition.stickyX!=0)) {
		  		constrainedPositionX = constrainedPosition.leftSticky; //stick to the window
		  	}

		  	// make sure stickiness disapears when out of the sticky zone
		  	if (constrainedPosition.stickyX==0) {
		  		this.isStickingX = false;
		  	}

		  	// make the box sticky if collided with y border
		  	if ((constrainedPosition.stickyY == -2)||(constrainedPosition.stickyY == 2)) {
		  		this.isStickingY = true;
		  	}

		  	// for sticky window, check if the box got out of the sticky y aera before authorizing movement in y
		  	if ((this.isStickingY)&&(constrainedPosition.stickyY!=0)) {
		  		constrainedPositionY = constrainedPosition.topSticky; //stick to the window
		  	}

				// make sure stickiness disapears when out of the sticky zone
		  	if (constrainedPosition.stickyY==0) {
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
		  }, 25, function() {
		    thisObject.loopDrag(offset);
		  });
	    return false;
	  }
	}


	// keyboard functions
	keyfunction (e) {
		// to be able to pass parametox as argument in the callback
		// we need to return an anonymous function in the scope of parameterBox
	    this.map[e.key] = e.type == 'keydown';

	    // hide and show parameter box
	    if ((this.map["Shift"])&&(this.map["P"])) {
	    		//make sure to reset value in case keyup event is ignored
	    		this.map["Shift"] = this.map["P"] = false


	    		// toggle box visibility
	    		if (this.visibility == "hidden") {
	    			this.visibility = "visible";
	    		} else {
	    			this.visibility = "hidden";
	    		}

	    		// prevent default action if any
	    		e.preventDefault();
	    }
			
	}

  // setters getters
  set beingDragged(dragged) {
  	this._beingDragged = dragged;
  	$(this.boxElement).attr("beingDragged", dragged);
  }

  get beingDragged() {
  	return(this._beingDragged);
  }

  set visibility(visibility) {
  	this._visibility = visibility;
  	$(this.boxElement).css("visibility", visibility);
  }

  get visibility () {
  	return(this._visibility);
  }

  set stickiness (type) {
  	// different type of stickyness for the box : "none", "glue", "magnetized"
  	switch(type) {
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
  	this._stickiness = type
  }

  set title(html) {
  	if (this.boxElement) {
  		$(this.boxElement).find(".dragbox-title").html(html);	
  	}
  }

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

  	return({
  		x: (left < 0) ? 0 : (right > window.innerWidth) ? maxLeft : left,
  		y: (top < 0) ? 0 : (bottom > window.innerHeight) ? maxTop : top,
  		stickyX: (left <= 0) ? -2 :  (left <= STOP_BEING_STICKY_AFTER*element.offsetWidth) ? -1 : (right >= window.innerWidth) ? 2 : (right >= window.innerWidth-STOP_BEING_STICKY_AFTER*element.offsetWidth) ? 1 : 0,
  		stickyY: (top <= 0) ? -2 : (top <= STOP_BEING_STICKY_AFTER*element.offsetHeigth) ? -1 : (bottom >= window.innerHeight) ? 2 : (bottom >= window.innerHeight-STOP_BEING_STICKY_AFTER*element.offsetHeigth) ? 1 : 0,
  		leftSticky: (left <= 0) ? 0 :  (left <= STOP_BEING_STICKY_AFTER*element.offsetWidth) ? 0 : (right >= window.innerWidth) ? window.innerWidth-element.offsetWidth : (right >= window.innerWidth-STOP_BEING_STICKY_AFTER*element.offsetWidth) ? window.innerWidth-element.offsetWidth : left,
  		topSticky: (top <= 0) ? 0 : (top <= STOP_BEING_STICKY_AFTER*element.offsetHeigth) ? 0 : (bottom >= window.innerHeight) ? window.innerHeight-element.offsetHeigth : (bottom >= window.innerHeight-STOP_BEING_STICKY_AFTER*element.offsetHeigth) ? window.innerHeight-element.offsetHeigth : top
  				});
  }
}


class ParamBox extends DragBox {
	constructor (boxElement = null) {
		// call super constructor
		super (boxElement);

		// constants
		this.DEFAULT_ROW_HTML = '<div class="col-md-12 dragbox-row paramboxtmprow"></div>'

		// ui
		this.rowHtml = this.DEFAULT_ROW_HTML;

		// row hold the row object in dom as well as the bindedField object {rowDom: row, bindedField: bindedField}
		this.rows = []

		// set dragbox title
		this.title = '<h5><i class="fa fa-cog fa-1x"></i> Parameter Box</h5>';

	}

	// binding methods
	bind(object, properties) {
		if (typeof object == 'undefined') {
			throw new Error("object is undefined")
		}

		if (properties.constructor === Array) {
			for (var i = 0; i < properties.length; i++) {
				if (typeof object[properties[i]] == 'undefined') {
					throw new Error("object property " + properties[i] + " is undefined");
				}

				var rowDom = this.newRowInDom();

				if (object[properties[i]].constructor === Boolean) {
					var bindedField = new BindedField(object, properties[i], rowDom, 'selector', ["TRUE", "FALSE"]);
				} else {
					var bindedField = new BindedField(object, properties[i], rowDom);	
				}
				

				this.rows.push(this.getBindedRow(rowDom, bindedField));
			}
		} else {
			if (typeof object[properties] == 'undefined') {
					throw new Error("object property " + properties + " is undefined");
				}

			var rowDom = this.newRowInDom();

			if (object[property].constructor === Boolean) {
				var bindedField = new BindedField(object, properties, rowDom, 'selector', ["TRUE", "FALSE"]);
			} else {
				var bindedField = new BindedField(object, properties, rowDom);	
			}
			

			this.rows.push(this.getBindedRow(rowDom, bindedField));
		}
		

	}

	unbind(object, property) {
		for(var i = 0; i < this.rows.length; i++) {
            var bindedField = this.rows[i].bindedField;

            if((bindedField.object === object)&&(bindedField.property == property)) {
                this.rows.splice(i, 1);
                bindedField.delete()
            }
        }
	}

	// ui methods
	newRowInDom () {
		var row = null;
		$(this.boxElement).find(".dragbox-content").append(this.rowHtml);
		row = this.boxElement.find(".paramboxtmprow");
		$(row).removeClass("paramboxtmprow");

		return row;
	}

	getBindedRow (rowDom, bindedField) {
		return({rowDom: rowDom, bindedField: bindedField});
	}

	refreshView() {
		// check if all binded field are displayed in the paramBox
		// if not add them
		// get rid of unbinded field
	}
					
}


class BindedProperty {
	constructor (object = null, property = null) {
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
	bind(object, property) {
		var propertyType = typeof this.object[this.property];
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

	convertToType (value) {
		if (this.type) {
			if (this.type === Boolean) {
				switch(String(value).toUpperCase()) {
					case "0":
					return(false);
					break;
					case "1":
					return(true);
					break;
					case "FALSE":
					return(false);
					break;
					case "TRUE":
					return(true);
					break;
				}
			}
			return(this.type(value));
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
			return(this.object[this.property]);
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
							allowedValues = null, 
							addClass = null) {

		super(object, property);
		
		// constant
		this.VALID_FIELD_TYPE = ["input", "selector", "slider"];

		// field
		this.field = null;
		this.fieldType = fieldType;
		this.fieldHTML = null;
		this.allowedValues = allowedValues;
		this.tempClass = "binded-"+typeof object+property;
		
		// parent
		this.parent = parent;

		// build the field html
		switch(this.fieldType) {
			case 'input':
			this.fieldHTML = '<fieldset class="form-group">' +
    		'<label>'+property+'</label>' +
    		'<input type="text" class="form-control '+ this.tempClass +'" data-binded="'+property+'">' +
  			'</fieldset>';
			break;
			case 'selector':
				if (!allowedValues) {
					throw new Error("fieldType selector needs at least one allowedValues");
				} 

				this.fieldHTML = '<fieldset class="form-group">' +
    		'<label>'+property+'</label>' +
    		'<select class="form-control '+ this.tempClass +'" data-binded="'+property+'">';

			  for (var i = 0; i < this.allowedValues.length; i++) {
			    this.fieldHTML = this.fieldHTML + 
			    	'<option value="'+this.allowedValues[i]+'">'+this.allowedValues[i]+'</option>';
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
	placeInParent (parent = null) {
		if (parent) {
			this.parent = parent;
		}

		$(this.parent).append(this.fieldHTML);
		this.field = $("."+this.tempClass);
		this.field.removeClass(this.tempClass);

		(this.allowedValues) ? (this.allowedValues.constructor == Array) ? this.field.val(this.allowedValues[0]) : this.field.val(this.value)  : this.field.val(this.value);
		

		var thisObject = this;

		// add event listener on change
		this.field.change(function(e) { 
			thisObject.update("field");
		});
		this.field.keyup(function(e) { 
			thisObject.update("field");
		});

	}

	delete () {
		//delete the fieldset
		this.field.parent().remove();
		this.property = null;
		this.object = null;
	}

	update(origin = "field") {
		if (origin == "field") {
			this.value = $(this.field).val();	
		} else {
			if ($(this.field).val().toUpperCase()!=String(this.value).toUpperCase()) {
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
			return(this.object[this.property]);
		}
	}
}


// utilities
function mandatory(param = "") {
        throw new Error('Missing parameter ' + param);
}
