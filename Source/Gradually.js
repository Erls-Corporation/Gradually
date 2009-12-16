/*
---
description: 

license: MIT-style

authors:
- Noritaka Horio
- Buck Kingsley

requires:
- localComponent1
- [localComponent2, localComponent3]
- externalPackage1:tag/component1
- externalPackage1:tag: component4
- externalPackage2:tag: [component1, component2]

provides: [Gradually]

*/

var Gradually = new Class({

	Implements: [Events, Options],

	options: {
		'size': 100,
		'periodical': 10000,
		'zIndex': 9000,
		'duration': 100
	},

	initialize: function (container, source, options) {
		this.setOptions(options);
		this.source = ($type(source) == "string" ) ? $(source) : source;
		this.container = ($type(container) == "string" ) ? $(container) : container;

		this.container.setStyle("height", 400);
		this.container.setStyle("width", 950);
		
		this.images = this.source.getElements("li img");
		this.zIndex	= this.images.length;
		this.source.setStyle("diplay","none");

		this.build();
		this.onTime.delay(this.options.periodical, this);
	},

	build: function() {
		this.elements = new Array();
		this.images.each(function(image,k) {
			var panelSet = this.createPanelSet(image);
			panelSet.inject(this.container);
		}.bind(this));

		this.source.dispose();
		this.elements = $(this.container).getElements("ul");
		this.index = 0;
	},

	createPanelSet: function(targetImage) {
		var src		= targetImage.getProperty('src');
		var height	= targetImage.getProperty('height');
		var width	= targetImage.getProperty('width');
		var size    = this.options.size;
		
		var panelSet = new Element('ul', {'styles': { 'height': height + "px", 'width': width + "px", 'zIndex': this.zIndex--}});
		var cols = ((width / size) * size >= width) ? (width / size) : (width / size) + 1; 
		var rows = ((height / size) * size >= height) ? (height / size) : (height / size) + 1; 
		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < rows; y++) {
				var l = x * size, t = y * size;
				var panel = this.createPanel(l, t, src, size);
				panel.inject(panelSet);
			}
		}
		return panelSet;
	},

	createPanel: function() {
		var p = Array.link(arguments, {'x': Number.type,'y': Number.type, 'src': String.type, 'size': Number.type});
		var panel = new Element("li", {
			"styles": {
				"background": "url(" + p.src + ") no-repeat " + -p.x.toString() + "px  " + -p.y.toString() + "px",
				"height": p.size, "width": p.size,
				"top": p.y, "left": p.x
			}
		});
		return panel;
	},

	getCurrentPanelSet: function() {
		return this.elements[this.index];
	},

	getCurrentPanels: function() {
		var current = this.elements[this.index];
		var panels = $(current).getElements("li");
		return panels;
	},

	reset: function() {
		this.hides = 0;
		this.count = 0;
	},

	random: function() {
		this.reset();
		var panels = this.getCurrentPanels();
		var total = panels.length;
		var duration = 0;
		while(panels.length > 0) {
			var pickup = panels.getRandom();
			var size = pickup.getSize();
			var position = pickup.getStyles("left", "top");
			var fx = pickup.get("morph", {"duration": duration, "transition": "expo:out", "onComplete": this.onProgress.bind(this,[this.hides++,total])});
			fx.start({
				"opacity": [1, 0],
				"height": [size.y, 0], "width": [size.x, 0],
				"top": [position.top.toInt(), position.top.toInt() + (size.y/2)],
				"left": [position.left.toInt(), position.left.toInt() + (size.x/2)]
			});
			duration = duration + this.options.duration;
			panels.erase(pickup);
		}
	},

	onTime: function() {
		this.random();
	},

	onProgress: function(progress, total) {
		(progress >= total - 1) ? this.onComplete.bind(this) : false;
	},

	onComplete: function() {
		this.toFront();
		this.index = (this.index < this.elements.length - 1) ? this.index + 1 : 0;
		this.onTime.delay(this.options.periodical, this);
	},

	toFront: function() {
		var current = this.getCurrentPanelSet();
		var panels	= this.getCurrentPanels();
		current.setStyle("zIndex", 1);
		panels.each(function(e,k) {
			e.setStyle("opacity", 1);
		}.bind(this));

		this.elements.each(function(e,k) {
			if (k != this.index) {
				var zIndex= e.getStyle("zIndex").toInt();
				e.setStyle("zIndex", ++zIndex);
			}
		}.bind(this));
	}
	
});