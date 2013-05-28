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

/*
 * Convenience Marker class.
 * Inherit this class to have location, draggable and popup support out-of-the-box.
 * This class expects properties with certain names. Name your properties accordingly, provide
 * bindings or computed properties if you don't want to polute your objects.
 *  
 */
Ember.LeafletMarker = Ember.Object.extend({
    locationDidChange:function(){
        var marker = this.get('marker');
        var lat = this.get('location.lat');
        var lng = this.get('location.lng');
        
        if (!marker)
            return;
            
        if (lat && lng){
            marker.setLatLng([lat,lng]);
        }
    }.observes('location.lat','location.lng','marker'),
    draggableDidChange:function(){
        var marker = this.get('marker');
        var draggable = this.get('draggable');
        if (!marker)
            return;
            
        if (draggable){
            marker.dragging.enable();
        } else {
            marker.dragging.disable();
        }
    }.observes('draggable','marker'),
    popupDidChange:function(){
        var marker = this.get('marker');
        var popup = this.get('popup');
        if (!marker)
            return;
            
        if(popup){
            marker.closePopup();
            marker.bindPopup(popup);
        }
    }.observes('popup','marker'),
    setupMarker:function(){
        var marker = this.get('marker');
        if (!marker)
            return;
        var self = this;
        marker.on('drag', function(e) {
            var latlng = e.target.getLatLng();
            self.set('location.lat', latlng.lat);
            self.set('location.lng', latlng.lng);
        });
    }.observes('marker')
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
    arrayWillChange : function(array, start, removeCount, addCount) {
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
    arrayDidChange : function(array, start, removeCount, addCount) {
        if (addCount > 0) {
            var leafletMarkers = this.get('leafletMarkers');
            var map = this.get('map');

            var addedObjects = array.slice(start, start + addCount);
            addedObjects.forEach(function(object, index) {
                var marker = this.createMarker(object);
                marker.addTo(map);
                object.set('marker', marker);
                object.set('map', map);
                leafletMarkers.set(object, marker);

            }, this);
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
        markersProxy.addArrayObserver(this);
        markersProxy.set('content', this.get('markers'));
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
