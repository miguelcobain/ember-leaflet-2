/*
 * Queue zoom transitions
 */
if (L.DomUtil.TRANSITION) {
    L.Map.addInitHook(function() {
        L.DomEvent.on(this._mapPane, L.DomUtil.TRANSITION_END, function() {
            var zoom = this._zoomActions.shift();
            if (zoom !== undefined) {
                this.setZoom(zoom);
            }
        }, this);
    });
}

L.Map.include(!L.DomUtil.TRANSITION ? {} : {
    _zoomActions : [],
    queueZoom : function(zoom) {
        if (this._animatingZoom) {
            this._zoomActions.push(zoom);
        } else {
            this.setZoom(zoom);
        }
    }
});

Ember.LeafletPathMixin = Ember.Mixin.create({
    popupDidChange:function(){
        var path = this.get('path');
        var popup = this.get('popup');
        if (!path)
            return;
            
        if(popup){
            path.closePopup();
            path.bindPopup(popup);
        }
    }.observes('popup','path'),
    stroke: true,
    strokeDidChange:function(){
        var stroke = this.get('stroke');
        var path = this.get('path');
        if(!path)
            return;
        
        path.setStyle({stroke: stroke});
    }.observes('stroke','path'),
    color:'#03f',
    colorDidChange : function(){
        var color = this.get('color');
        var path = this.get('path');
        if(!path || !color)
            return;
        
        path.setStyle({color: color});
    }.observes('color','path'),
    weight:5,
    weightDidChange : function(){
        var weight = this.get('weight');
        var path = this.get('path');
        if(!path || !weight)
            return;
        
        path.setStyle({weight: weight});
    }.observes('weight','path'),
    opacity:0.5,
    opacityDidChange : function(){
        var opacity = this.get('opacity');
        var path = this.get('path');
        if(!path || !opacity)
            return;
        
        path.setStyle({opacity: opacity});
    }.observes('opacity','path'),
    fillColorDidChange : function(){
        var fillColor = this.get('fillColor');
        var path = this.get('path');
        if(!path || !fillColor)
            return;
        
        path.setStyle({fillColor: fillColor});
    }.observes('fillColor','path'),
    fillOpacity:0.2,
    fillOpacityDidChange : function(){
        var fillOpacity = this.get('fillOpacity');
        var path = this.get('path');
        if(!path || !fillOpacity)
            return;
        
        path.setStyle({fillOpacity: fillOpacity});
    }.observes('fillOpacity','path'),
    dashArray:null,
    dashArrayDidChange : function(){
        var dashArray = this.get('dashArray');
        var path = this.get('path');
        if(!path || !dashArray)
            return;
        
        path.setStyle({dashArray: dashArray});
    }.observes('dashArray','path')
});

Ember.LeafletCircleMixin = Ember.Mixin.create(Ember.LeafletPathMixin,{
    isCircle:true,
    path:function(){
        var circle = L.circle([this.get('location.lat'),this.get('location.lng')]);
        this.set('path',circle);
        return circle;
    }.property(),
    locationDidChange:function(){
        var circle = this.get('path');
        if (!circle)
            return;
            
        circle.setLatLng([this.get('location.lat'),this.get('location.lng')]);
    }.observes('location.lat','location.lng','path'),
    radius:10,
    radiusDidChange:function(){
        var radius = this.get('radius');
        var circle = this.get('path');
        if(!circle || !radius)
            return;
        
        circle.setRadius(radius);
    }.observes('radius','path')
});

Ember.LeafletPolylineMixin = Ember.Mixin.create(Ember.LeafletPathMixin,{
    isPolyline:true,
    path:function(){
        var locations = [];
        this.get('locations').forEach(function(l){
            locations.push(L.latLng(l.get('lat'),l.get('lng')));
        });
        var polyline = L.polyline(locations);
        this.set('path',polyline);
        return polyline;
    }.property(),
    locationsDidChange:function(){
        var polyline = this.get('path');
        if (!polyline)
            return;
            
        var locations = [];
        this.get('locations').forEach(function(l){
            locations.push(L.latLng(l.get('lat'),l.get('lng')));
        });
        polyline.setLatLngs(locations);
    }.observes('locations.@each.lat','locations.@each.lng','path'),
    smoothFactor:1.0,
    smoothFactorDidChange : function(){
        var smoothFactor = this.get('smoothFactor');
        var path = this.get('path');
        if(!path || !smoothFactor)
            return;
        
        path.setStyle({smoothFactor: smoothFactor});
    }.observes('smoothFactor','path'),
});

/*
 * Convenience Marker mixin.
 * Inherit this class to have location, draggable and popup support out-of-the-box.
 * This class expects properties with certain names. Name your properties accordingly, provide
 * bindings or computed properties if you don't want to polute your objects.
 *  
 */
Ember.LeafletMarkerMixin = Ember.Mixin.create({
    marker: function() {
        var marker = L.marker([this.get('location.lat'),this.get('location.lng')]);
        var self = this;
        marker.on('drag', function(e) {
            var latlng = e.target.getLatLng();
            self.set('location.lat', latlng.lat);
            self.set('location.lng', latlng.lng);
        });
        this.set('marker',marker);
        return marker;
    }.property(),
    /*
     * Default icon.
     * Override as a computed property to define the icon based on custom logic.
     */
    icon: new L.Icon.Default(),
    iconChanged:function(){
        var marker = this.get('marker');
        var icon = this.get('icon');
        if (!marker || !marker.dragging)
            return;
        
        var draggable = marker.dragging.enabled();
        marker.setIcon(icon);
        if (draggable)
            marker.dragging.enable();
        else
            marker.dragging.disable();
    }.observes('icon','marker','map'),
    zIndex:0,
    zIndexChanged:function(){
        var marker = this.get('marker');
        var zIndex = this.get('zIndex');
        
        if(marker)
            marker.setZIndexOffset(zIndex);
    }.observes('zIndex','marker'),
    locationDidChange:function(){
        var marker = this.get('marker');
        var lat = this.get('location.lat');
        var lng = this.get('location.lng');
        
        if (!marker)
            return;
            
        if (lat && lng){
            marker.setLatLng([lat,lng]);
        }
    }.observes('location','marker'),
    draggableDidChange:function(){
        var marker = this.get('marker');
        var draggable = this.get('draggable');
        if (!marker || !marker.dragging)
            return;
            
        if (draggable){

            marker.dragging.enable();
        } else {
            marker.dragging.disable();
        }
    }.observes('draggable','marker','map'),
    popupDidChange:function(){
        var marker = this.get('marker');
        var popup = this.get('popup');
        if (!marker)
            return;
            
        if(popup){
            marker.closePopup();
            marker.bindPopup(popup);
        }
    }.observes('popup','marker')
});

/**
 * Main View
 */
Ember.LeafletView = Ember.View.extend({
    classNames : ['ember-leaflet'],

    //default zoom level
    zoomLevelValue : 13,
    zoomLevel : function(key, value) {
        // getter
        if (arguments.length === 1) {
            var zoomLevel = this.get('zoomLevelValue');
            return zoomLevel;
            // setter
        } else {
            var map = this.get('map');
            if (map) {
                console.log('zoomLevel', 'changing map zoom to ' + value);
                map.queueZoom(value);
            }

            return value;
        }
    }.property('zoomLevelValue'),

    zoomDidChange : function() {
        var zoomLevel = this.get('zoomLevel');

        //console.log('zoomDidChange', 'zoomLevel to '+zoomLevel);
    }.observes('zoomLevel'),
    moving : false,
    // should we try to setView on current location?
    locate : true,
    panOnLocate : true,
    //default center
    center : Ember.Object.create({
        lat : 51.505,
        lng : -0.09
    }),
    centerDidChange : function() {
        var center = this.get('center');
        var map = this.get('map');
        if (map && !this.get('moving')) {
            map.panTo([center.get('lat'), center.get('lng')]);
        }
        console.log('centerDidChange', 'center to ' + [center.get('lat'), center.get('lng')]);
    }.observes('center.lat', 'center.lng'),

    // Real markers array
    markers : Ember.A(),
    // Markers ArrayProxy to better control notifications and to allow filtering in the future...
    markersProxy : Ember.ArrayProxy.create(),
    // Map that maps Ember objects to Leaflet marker objects
    leafletMarkers : Ember.Map.create(),
    markersWillChange : function(array, start, removeCount, addCount) {
        if (removeCount > 0) {
            var leafletMarkers = this.get('leafletMarkers');
            var map = this.get('map');
            var removedObjects = array.slice(start, start + removeCount);
            removedObjects.forEach(function(object, index) {
                console.log(start + index, object);
                var marker = leafletMarkers.get(object);
                if (map)
                    map.removeLayer(marker);
                leafletMarkers.remove(object);
            });
        }
    },
    markersDidChange : function(array, start, removeCount, addCount) {
        if (addCount > 0) {
            var leafletMarkers = this.get('leafletMarkers');
            var map = this.get('map');

            var addedObjects = array.slice(start, start + addCount);
            addedObjects.forEach(function(object, index) {
                var marker = object.get('marker');//this.createMarker(object);
                marker.addTo(map);
                //object.set('marker', marker);
                object.set('map', map);
                leafletMarkers.set(object, marker);

            }, this);
        }
    },
    paths : Ember.A(),
    pathsProxy : Ember.ArrayProxy.create(),
    pathsWillChange : function(array, start, removeCount, addCount){
        if (removeCount > 0) {
            var map = this.get('map');
            var removedObjects = array.slice(start, start + removeCount);
            removedObjects.forEach(function(object, index) {
                var path = object.get('path');
                if(path)
                    map.removeLayer(path);
            },this);
        }
    },
    pathsDidChange : function(array, start, removeCount, addCount){
        if (addCount > 0) {
            var map = this.get('map');
            var addedObjects = array.slice(start, start + addCount);
            addedObjects.forEach(function(object, index) {
                var path = object.get('path');
                if(path)
                    path.addTo(map);
            },this);
        }
    },
    init : function() {
        this._super();
        this.set('markersProxy', Ember.ArrayProxy.create());
        this.set('leafletMarkers', Ember.Map.create());
    },
    didInsertElement : function() {
        this._super();

        var map = this.createMap();

        var self = this;
        // Register handler events on map
        map.on('move', function(e) {
            var newCenter = e.target.getCenter();
            var centerValue = self.get('center');
            centerValue.beginPropertyChanges();
            centerValue.set('lat', newCenter.lat);
            centerValue.set('lng', newCenter.lng);
            centerValue.endPropertyChanges();
        });
        map.on('movestart', function(e) {
            self.set('moving', true);
        });
        map.on('moveend', function(e) {
            self.set('moving', false);
        });
        map.on('zoomend', function(e) {
            console.log('zoomend', 'Setting zoomLevel ' + e.target.getZoom());
            self.set('zoomLevelValue', e.target.getZoom());
        });

        // Save map reference in a global variable for easy debugging.
        window.lmap = map;
        // save map instance
        this.set('map', map);

        var markersProxy = this.get('markersProxy');
        markersProxy.addArrayObserver(this,{
            willChange:'markersWillChange',
            didChange:'markersDidChange'
        });
        markersProxy.set('content', this.get('markers'));
        
        var pathsProxy = this.get('pathsProxy');
        pathsProxy.addArrayObserver(this,{
            willChange:'pathsWillChange',
            didChange:'pathsDidChange'
        });
        pathsProxy.set('content', this.get('paths'));
    },
    /*
     * Overidable hook to create the map instance. Useful for custom plugin logic.
     * This is the default (simple) implementation.
     */
    createMap : function() {
        var zoomLevel = this.get('zoomLevel');
        var center = this.get('center');
        var map = L.map(this.$().get(0)).setView([center.get('lat'), center.get('lng')], zoomLevel);
        // add an OpenStreetMap tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        return map;
    },
    /*
     * Overridable hook to create marker instances.
     * Override this hook to create custom markers, possibly depending on its data.
     * Ex: Custom icons, click handlers, etc. This is the default (simple) implementation.
     *
     * @param marker object/variable
     * @return Leaflet marker instance
     */
    createMarker : function(data) {
        var marker = L.marker(new L.LatLng(data.get('location.lat'), data.get('location.lng')));
        return marker;
    },
    willDestroyElement : function() {
        this._super();
        var map = this.get('map');
        map.off('locationfound');
        map.off('locationerror');
        map.off('move');
        map.off('movestart');
        map.off('moveend');
        map.off('zoomend');

        this.teardown();

        this.get('markersProxy').removeArrayObserver(this);
        delete window.lmap;
        this.set('map', null);
    },
    /*
     * Overridable hook to define any teardown logic. Eg: Remove manually added observers, plugin teardown
     */
    teardown : function() {
    }
});
