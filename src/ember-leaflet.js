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
    //default center
    moving : false,
    center : Ember.Object.create({
        lat: 51.505,
        lng: -0.09
    }),
    centerDidChange : function() {
        var center = this.get('center');
        var map = this.get('map');
        if (map && !this.get('moving')) {
            map.panTo([center.get('lat'), center.get('lng')]);
        }
        console.log('centerDidChange', 'center to ' + [center.get('lat'), center.get('lng')]);
    }.observes('center.lat','center.lng'),

    markers : Ember.A(),
    markersProxy : Ember.ArrayProxy.create(),
    leafletMarkers : Ember.Map.create(),
    arrayWillChange : function(array, start, removeCount, addCount) {
        if (removeCount>0) {
            var leafletMarkers = this.get('leafletMarkers');
            var map = this.get('map');
            var removedObjects = array.slice(start, start + removeCount);
            removedObjects.forEach(function(object, index){
                console.log(start+index, object);
                var marker = leafletMarkers.get(object);
                map.removeLayer(marker);
                leafletMarkers.remove(object);
            });
        }
    },
    arrayDidChange : function(array, start, removeCount, addCount) {
        if(addCount>0){
            var leafletMarkers = this.get('leafletMarkers');
            var map = this.get('map');
            var addedObjects = array.slice(start, start + addCount);
            addedObjects.forEach(function(object, index){
                var marker = L.marker(new L.LatLng(object.get('lat'), object.get('lng')),{draggable:true});
                marker.on('drag', function(e) {
                    var latlng = e.target.getLatLng();
                    object.set('lat',latlng.lat);
                    object.set('lng',latlng.lng);
                });
                marker.bindPopup(object.get('popup'));
                marker.addTo(map);
                leafletMarkers.set(object,marker);
                object.addObserver('lat', this, 'markersPositionDidChange');
                object.addObserver('lng', this, 'markersPositionDidChange');
                object.addObserver('popup', this, 'markersPopupDidChange');
                object.addObserver('highlight', this, 'markersHighlightDidChange');
                object.addObserver('draggable', this, 'markersDraggableDidChange');
            }, this);
        }
    },
    markersPositionDidChange : function(sender, key){
        var leafletMarkers = this.get('leafletMarkers');
        var marker = leafletMarkers.get(sender);
        marker.setLatLng([sender.get('lat'),sender.get('lng')]);
    },
    markersPopupDidChange : function(sender, key){
        var leafletMarkers = this.get('leafletMarkers');
        var marker = leafletMarkers.get(sender);
        marker.closePopup();
        marker.bindPopup(sender.get('popup'));
    },
    // Default normal icon
    normalIcon : new L.Icon.Default(),
    // Default highlight icon
    highlightIcon : new L.Icon.Default({iconUrl: 'img/marker-icon-highlight.png'}),
    markersHighlightDidChange : function(sender, key){
        var leafletMarkers = this.get('leafletMarkers');
        var marker = leafletMarkers.get(sender);
        if(sender.get('highlight'))
            marker.setIcon(this.get('highlightIcon'));
        else
            marker.setIcon(this.get('normalIcon'));
    },
    markersDraggableDidChange : function(sender, key){
        var leafletMarkers = this.get('leafletMarkers');
        var marker = leafletMarkers.get(sender);
        if(sender.get('draggable'))
            marker.dragging.enable();
        else
            marker.dragging.disable();
    },
    init : function(){
        this._super();
        var markersProxy = this.get('markersProxy');
        markersProxy.addArrayObserver(this);
        //markersProxy.addObserver('@each.name', this, 'markersDidChange');
        
    },
    didInsertElement : function() {
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
                if (map._animatingZoom) {
                    this._zoomActions.push(zoom);
                } else {
                    this.setZoom(zoom);
                }
            }
        });

        var self = this;
        var zoomLevel = this.get('zoomLevel');
        var center = this.get('center');

        var map = L.map(this.$().get(0)).setView([center.get('lat'), center.get('lng')], zoomLevel);

        // add an OpenStreetMap tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

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

        window.map = map;
        // save map instance
        this.set('map', map);
        var markersProxy = this.get('markersProxy');
        markersProxy.set('content', this.get('markers'));
    }
});
