define(['aeris'], function(aeris) {

  /**
   * @fileoverview Default implementations of the LayerStrategy for OpenLayers.
   */


  aeris.provide('aeris.maps.openlayers.layerstrategies.mixins.Default');


  /**
   * A mixin for a default implementation of the LayerStrategy for OpenLayers.
   *
   * @const
   */
  aeris.maps.openlayers.layerstrategies.mixins.Default = {


    /**
     * @override
     */
    registerInstanceLayer: function(instanceLayer, map) {
      map.addLayer(instanceLayer);
    },


    /**
     * @override
     */
    setBaseInstanceLayer: function(instanceLayer, map) {
      map.setBaseLayer(instanceLayer);
    }

  };


  return aeris.maps.openlayers.layerstrategies.mixins.Default;

});