# paramBox v1.2

Too much parameters to handle ? 

paramBox is a collection of smart plug and play tools to facilitate the design of javascript games and cognitive tasks.


## Description 
A ParamBox is a little draggable div allowing you to do double binding with any variable of your page. It is often long to go back and forth between your code and the page when you want to change the value of just one variable. This box allows you to to have all your variables in check for quick access.

Two other classes are currently avaible : DragBox (simple draggable box), and SmartModal (a configurable modal).

http://imgur.com/4OcMkNR

## Require

For now : jQuery, Bootstrap

## Install

You can either clone the repo, download the files in the lib folder, or use npm (recommended).

	npm install parambox

Then, to install a paramBox :

	<link rel="stylesheet" type="text/css" href="/node_modules/bootstrap/dist/css/bootstrap.min.css"></link>
	<script type="text/javascript" src="/lib/paramBox-transpiled-1.2.js"></script>
	<script type="text/javascript">
		// one example of implementation could be
    var paramBox = null;
		$(document).ready(function(){
				// we suppose you have an object "Task" holding all your variables. 
				// If your variables are in the global space you can just put window as an object
			  taskObject = new Task();			
				
				// instanciate the param box
				paramBox = new ParamBox();

				// bind object variables to it
				paramBox.bind(taskObject, ["nameOfVariableOne", "nameOfVariableTwo"]);

				// we suppose in this example that taskObject.nameOfVariableOne, and taskObject.nameOfVariableTwo exists !
			
		});
	</script>


A div containing the ParamBox is automatically added to the document's body, to show/hide it, press Shift + P. You ight want to change the url of your imports.


## Classes

### DragBox

This is the parent class, all properties and method of this object are inherited by ParamBox and SmartModal classes. Dragboxes are small dragable boxes with a title and content. By clicking on the title bar you can drag the box. 

To create a box :

	var dragBox = new DragBox();
	dragBox.title = "<h3><center> My dragbox </center></h3>";
	dragBox.content = "<p>Some very usefull information in HTML</p>";

	// then show the dragbox
	dragBox.show();

	// to hide the dragBox
	// dragBox.hide();

	// to destroy a box (removes it from the DOM)
	// dragBox.destroy()


You will see that by default the box is sticky on the edge of the screen, this property can be changed to: magnetized, glue, or none.
	
	// edge are magnetic and attract the box
	dragBox.stickiness = "magnetized";
	
	// the box is not attracted by the edge but sticks to it if you make it collide with it.
	dragBox.stickiness = "glue";

	// no stickiness
	dragBox.stickiness = "none";


### ParamBox

The boxes are keybinded and appear and disapear on command : Shift + P for now. This will show and hide all paramBoxes you have on your page.


* BindedProperty
* BindedField

### SmartModal

Smart modal is another helping class that creates a modal that adapt intelligently to the page, and are easilly configurable. They are shown automatically and dismiss when the button is clicked.

The modal constructor takes four possible arguments :
	SmartModal(formatType = "across", callback = null, buttonType = "closebutton")

formatType determine the size and position of the modal, modals appeara at 20% from the top and are of three types: 
	* "centralSmall" creates a modal with : 30% height 40% width 
	* "centralLarge" creates a modal with : 60% height 70% width 
	* "across" creates a modal with : 40% height 100% width (30% from the top)

Callback is a function that is called when the modal is dismissed. 

Buttontype is a string can either be : "closebutton", "nextbutton", or "blankbutton"

To create a modal :

	var modalBox = new SmartModal("centralSmall", function() { console.log("Modal Destroyed"); })
	modalBox.title = "<h4><center>This is a modal</center></h4>"
	modalBox.content = "Very important information, needed a modal."



## PS

A lot remains to be done! (i'll work on the docs... it takes time sorry !)
You are most welcome to land a hand :)
