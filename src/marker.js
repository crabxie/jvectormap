jvm.Marker = function(config){
  var text,
      offsets;
  this.config = config;
  this.map = this.config.map;
  this.badge = this.config.badge;
  this.badgeNodeObj;
  this.badgeTextNodeObj;

    if(typeof this.badge=='object'){
        if(typeof this.config.badge[this.config.index] == 'object'){
            this.createBadge(this.config.badge[this.config.index]);
        }

    }

  this.isImage = !!this.config.style.initial.image;
  this.createShape();

  text = this.getLabelText(config.index);
  if (this.config.label && text) {
    this.offsets = this.getLabelOffsets(config.index);
    this.labelX = config.cx / this.map.scale - this.map.transX;
    this.labelY = config.cy / this.map.scale - this.map.transY;
    this.label = config.canvas.addText({
      text: text,
      'data-index': config.index,
      dy: "0.6ex",
      x: this.labelX,
      y: this.labelY
    }, config.labelStyle, config.labelsGroup);

    this.label.addClass('jvectormap-marker jvectormap-element');
  }



};

jvm.inherits(jvm.Marker, jvm.MapObject);

jvm.Marker.prototype.getBadge = function(){
    return this.badge
}
jvm.Marker.prototype.createBadge = function(badgeObj){
    var that = this;

    var num = 0;
    if(typeof badgeObj.t == "number"){
        num = badgeObj.t;
    }else if(typeof badgeObj.t == "string"){
        num = parseInt(badgeObj.t);
    }
    var badgeStyle = this.config.style;
    badgeStyle.initial = {fill:'red','fill-opacity':'1',r:'10','stroke':'red','stroke-opacity':1,'stroke-width':1};

    var badgeTextStyle = {
        current:{},
        hover:{},
        initial:{
            cursor:"default",
            fill:'#ffffff',
            'font-family' : "Verdana",
            'font-size' : 12,
            'font-weight': ""
        }
    };

    var inner_x = -100;
    var  inner_y = -100;
    if(num>1){
        that.badgeNodeObj = this.config.canvas['addCircle']({
            "data-index": this.config.index,
            cx: inner_x,
            cy: inner_y
        }, badgeStyle, this.config.badgeGroup);
        that.badgeNodeObj.addClass('jvectormap-marker jvectormap-element jvectormap-badge');

        that.badgeTextNodeObj = this.config.canvas['addText']({
            text: num,
            'text-anchor': 'middle',
            'alignment-baseline': 'central',
            x: inner_x,
            y: inner_y+3,
            'data-code': this.config.code
        }, badgeTextStyle, this.config.badgeGroup);
    }
}

jvm.Marker.prototype.createShape = function(){
  var that = this;
  if (this.shape) {
    this.shape.remove();
  }

  this.shape = this.config.canvas[this.isImage ? 'addImage' : 'addCircle']({
    "data-index": this.config.index,
    cx: this.config.cx,
    cy: this.config.cy
  }, this.config.style, this.config.group);
  this.shape.addClass('jvectormap-marker jvectormap-element');

  if (this.isImage) {
    jvm.$(this.shape.node).on('imageloaded', function(){
      that.updateLabelPosition();
        if(typeof that.badgeNodeObj=='object'){

            var _x = parseFloat(that.shape.node.getAttribute('x')) + parseFloat(that.shape.node.getAttribute('width'));
            var _y = parseFloat(that.shape.node.getAttribute('y'));
            that.badgeNodeObj.node.setAttribute('cx',_x);
            that.badgeNodeObj.node.setAttribute('cy',_y+2);
            that.badgeTextNodeObj.node.setAttribute('x',_x);
            that.badgeTextNodeObj.node.setAttribute('y',_y+6);
        }

        //
        //that.badgeObj.node.setAttribute('y',that.shape.node.getAttribute('y'));
    });
  }
};

jvm.Marker.prototype.updateLabelPosition = function(){
  if (this.label) {
    this.label.set({
      x: this.labelX * this.map.scale + this.offsets[0] +
         this.map.transX * this.map.scale + 5 + (this.isImage ? (this.shape.width || 0) / 2 : this.shape.properties.r),
      y: this.labelY * this.map.scale + this.map.transY * this.map.scale + this.offsets[1]
    });
  }

};

jvm.Marker.prototype.setStyle = function(property, value){
  var isImage;

  jvm.Marker.parentClass.prototype.setStyle.apply(this, arguments);

  if (property === 'r') {
    this.updateLabelPosition();
  }

  isImage = !!this.shape.get('image');
  if (isImage != this.isImage) {
    this.isImage = isImage;
    this.config.style = jvm.$.extend(true, {}, this.shape.style);
    this.createShape();
  }
};