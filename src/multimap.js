/**
 * Creates map with drill-down functionality.
 * @constructor
 * @param {Object} params Parameters to initialize map with.
 * @param {Number} params.maxLevel Maximum number of levels user can go through
 * @param {Object} params.main Config of the main map. See <a href="./jvm-map/">jvm.Map</a> for more information.
 */
jvm.MultiMap = function(params) {
  var that = this;

  this.maps = {};
  this.params = params;
  this.history = [ this.addMap(params.main.map, params.main) ];

  this.params.container.css({position: 'relative'});
  this.backButton = jvm.$('<div/>').addClass('jvectormap-goback').text('back').appendTo(this.params.container);
  this.backButton.hide();
  this.backButton.click(function(){
    that.goBack();
  });
};

jvm.MultiMap.prototype = {
  addMap: function(name, config){
    var cnt = $('<div/>').css({
      width: '100%',
      height: '100%'
    });

    this.params.container.append(cnt);

    this.maps[name] = new jvm.Map(jvm.$.extend(config, {container: cnt}));
    this.maps[name].container.on('regionClick.jvectormap', {scope: this}, function(e, code){
      var multimap = e.data.scope,
          mapName = 'us_tx_lcc_en';

      multimap.drillDown(mapName, code);
    })

    return this.maps[name];
  },

  drillDown: function(name, code){
    var currentMap = this.history[this.history.length - 1],
        that = this;

    currentMap.setFocus(code, true).then(function(){
      currentMap.params.container.hide();
      if (!that.maps[name]) {
        that.addMap(name, {map: name});
      } else {
        that.maps[name].params.container.show();
      }
      that.history.push( that.maps[name] );
      that.backButton.show();
    });
  },

  goBack: function(){
    var currentMap = this.history.pop(),
        prevMap = this.history[this.history.length - 1],
        that = this;

    currentMap.setFocus(1, 0.5, 0.5, true, true).then(function(){
      currentMap.params.container.hide();
      prevMap.params.container.show();
      prevMap.updateSize();
      if (that.history.length === 1) {
        that.backButton.hide();
      }
      prevMap.setFocus(1, 0.5, 0.5, true, true);
    });
  }
};

jvm.MultiMap.defaultParams = {

};