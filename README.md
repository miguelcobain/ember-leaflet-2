# Ember Leaflet #
## Ember and Leaflet tight integration for rich map web application development. ##

Homepage and demo: http://miguelcobain.github.io/ember-leaflet/

# Component Overview (WIP)#

## Ember.LeafletView ##


This view represents a Leaflet Map instance. It has some bidirectional bindings to some map's variables. This is the view class that you'll use in your templates, or extend to provide additional behaviours.

### Properties ###

- **`zoomLevel`**

This property holds the current zoom level of the map. **Two-way binding**.

- **`moving`**

Property that holds `true` if the map is moving (panning), or `false` if it isn't.

- **`center`**

An ember object that holds the current center of the map. **Two-way binding**.

- **`markers`**

An array that holds objects for creting [leaflet markers](http://leafletjs.com/reference.html#marker). Its elements must have a property named `marker` that creates a `Leaflet.Marker` instance. Check `Ember.LeafletMarkerMixin` for a convenient way to define your objects.

- **`paths`**

An array that holds objects for creting [leaflet paths](http://leafletjs.com/reference.html#path). Its elements must have a property named `marker` that creates a `Leaflet.Marker` instance. Check `Ember.LeafletPathMixin` for a convenient way to define your objects.

### Methods ###

- **`createMap`**

Overidable hook responsible for creating the [leaflet map](http://leafletjs.com/reference.html#map-class) instance. Useful for adding custom plugin logic.
By default it instanciates a simple map with OpenStreetMap layer.


## Ember.LeafletMarkerMixin ##

### Properties ###

- **`marker`**

A computed property with no dependencies that is responsible for creating a [leaflet marker](http://leafletjs.com/reference.html#marker) instance.

- **`icon`**

A [leaflet icon](http://leafletjs.com/reference.html#icon) object that holds the current icon of the marker.

- **`zIndex`**

A property that holds the current z-index of the marker.



### Methods ###

### Bindings ###
Essencially EmberLeaflet is a wrapper on top of Leaflet that exposes Ember properties.
This way, the leaflet map is updated when an Ember property changes and Ember properties are updated when the user interacts with the map

### Learn ###
This project is in its enfancy. You can learn by inspecting the code of the demo in [gh-pages branch](https://github.com/miguelcobain/ember-leaflet/tree/gh-pages) and/or of the [component](https://github.com/miguelcobain/ember-leaflet/blob/master/src/ember-leaflet.js) itself.

### Help! ###
If you are an Ember/Leaflet/Javascript master, please help! It would be great to improve features, implement geometry binding, add documentation, tests, etc. Please help anything you can. Pull requests are very welcome on github.