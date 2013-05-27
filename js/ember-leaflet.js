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
    panOnLocate: true,
    //default center
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

    
    // Real markers array
    markers : Ember.A(),
    // Markers ArrayProxy to better control notifications and to allow filtering in the future...
    markersProxy : Ember.ArrayProxy.create(),
    // Map that maps Ember objects to Leaflet marker objects
    leafletMarkers : Ember.Map.create(),
    // Default overridable location property path
    latPath:'lat',
    lngPath:'lng',
    // Default overridable popup content property path
    popupPath:'popup',
    // Default overridable highlight property path
    highlightPath:'highlight',
    // Default overridable draggable property path
    draggablePath:'draggable',
    arrayWillChange : function(array, start, removeCount, addCount) {
        if (removeCount>0) {
            var leafletMarkers = this.get('leafletMarkers');
            var map = this.get('map');
            var removedObjects = array.slice(start, start + removeCount);
            removedObjects.forEach(function(object, index){
                console.log(start+index, object);
                var marker = leafletMarkers.get(object);
                if(map)
                    map.removeLayer(marker);
                leafletMarkers.remove(object);
            });
        }
    },
    arrayDidChange : function(array, start, removeCount, addCount) {
        if(addCount>0){
            var leafletMarkers = this.get('leafletMarkers');
            var map = this.get('map');
            var latPath = this.get('latPath');var lngPath = this.get('lngPath');
            var popupPath = this.get('popupPath');var highlightPath = this.get('highlightPath');
            var draggablePath = this.get('draggablePath');
            
            var addedObjects = array.slice(start, start + addCount);
            addedObjects.forEach(function(object, index){
                if(object.get(latPath) && object.get(lngPath)){
                    var marker = L.marker(new L.LatLng(object.get(latPath), object.get(lngPath)),{
                        icon: object.get(highlightPath) ? this.get('highlightIcon') : this.get('normalIcon'),
                        draggable: object.get(draggablePath)
                    });
                    marker.on('drag', function(e) {
                        var latlng = e.target.getLatLng();
                        object.set(latPath,latlng.lat);
                        object.set(lngPath,latlng.lng);
                    });
                    marker.bindPopup(object.get(popupPath));
                    marker.addTo(map);
                    
                    leafletMarkers.set(object,marker);
                    
                    if(object.get(highlightPath)){
                    
                    map.setView(marker.getLatLng(), 14);
                        //marker.openPopup();
                        // setTimeout(function(){
    //                         
                        // },500);
                    }
                }
                // Register observers
                object.addObserver(latPath, this, 'markersPositionDidChange');
                object.addObserver(lngPath, this, 'markersPositionDidChange');
                object.addObserver(popupPath, this, 'markersPopupDidChange');
                object.addObserver(highlightPath, this, 'markersHighlightDidChange');
                object.addObserver(draggablePath, this, 'markersDraggableDidChange');
                

            }, this);
        }
    },
    markersPositionDidChange : function(sender, key){
        var leafletMarkers = this.get('leafletMarkers');
        var latPath = this.get('latPath');var lngPath = this.get('lngPath');
        var marker = leafletMarkers.get(sender);
        if(marker)
            marker.setLatLng([sender.get(latPath),sender.get(lngPath)]);
    },
    markersPopupDidChange : function(sender, key){
        var leafletMarkers = this.get('leafletMarkers');
        var marker = leafletMarkers.get(sender);
        var popupPath = this.get('popupPath');
        if(marker){
            marker.closePopup();
            marker.bindPopup(sender.get(popupPath));
        }
    },
    // Default normal icon
    normalIcon : new L.Icon.Default(),
    // Default highlight icon
    highlightIcon : new L.Icon.Default({iconUrl: 'img/marker-icon-highlight.png'}),
    markersHighlightDidChange : function(sender, key){
        var leafletMarkers = this.get('leafletMarkers');
        var marker = leafletMarkers.get(sender);
        var highlightPath = this.get('highlightPath');
        var map = this.get('map');
        
        if(!marker) return;
        
        var draggable = marker.dragging.enabled();
        if(sender.get(highlightPath)){
            marker.setIcon(this.get('highlightIcon'));
            map.setView(marker.getLatLng(), 14);
            // setTimeout(function(){
                // marker.openPopup();    
            // },500);
        }
        else {
            marker.setIcon(this.get('normalIcon'));
        }
            
        if(draggable)
            marker.dragging.enable();
        else
            marker.dragging.disable();
    },
    markersDraggableDidChange : function(sender, key){
        var leafletMarkers = this.get('leafletMarkers');
        var marker = leafletMarkers.get(sender);
        var draggablePath = this.get('draggablePath');
        
        if(!marker) return;
        
        if(sender.get(draggablePath))
            marker.dragging.enable();
        else
            marker.dragging.disable();
    },
    init : function(){
        this._super();
        /*var markersProxy = this.get('markers');
        markersProxy.addArrayObserver(this);*/
        //markersProxy.addObserver('@each.name', this, 'markersDidChange');
        this.set('markersProxy', Ember.ArrayProxy.create());
        this.set('leafletMarkers', Ember.Map.create());
    },
    didInsertElement : function() {
        this._super();


        var self = this;
        var zoomLevel = this.get('zoomLevel');
        var center = this.get('center');

        var map = L.map(this.$().get(0)).setView([center.get('lat'), center.get('lng')], zoomLevel);

        // add an OpenStreetMap tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        /*L.zoomTMSLayer({
            url : 'http://{s}.tile.cloudmade.com/b981a03c18ca40098c71cdaa433d50af/',
            layername : '997/256',
            serviceVersion : '',
            attribution : 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
            tileMaxZoom : 18,
            maxZoom : 20,
            tms : false
        }).addTo(map);*/

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

        window.lmap = map; 
        // save map instance
        this.set('map', map);
        
        var markersProxy = this.get('markersProxy');
        markersProxy.addArrayObserver(this);
        markersProxy.set('content', this.get('markers'));
    },
    willDestroyElement : function(){
        this._super();
        var map = this.get('map');
        map.off('locationfound');
        map.off('locationerror');
        map.off('move');
        map.off('movestart');
        map.off('moveend');
        map.off('zoomend');
        
        var latPath = this.get('latPath');var lngPath = this.get('lngPath');
            var popupPath = this.get('popupPath');var highlightPath = this.get('highlightPath');
            var draggablePath = this.get('draggablePath');
            
        this.get('markersProxy').forEach(function(object){
            object.removeObserver(latPath, this, 'markersPositionDidChange');
            object.removeObserver(lngPath, this, 'markersPositionDidChange');
            object.removeObserver(popupPath, this, 'markersPopupDidChange');
            object.removeObserver(highlightPath, this, 'markersHighlightDidChange');
            object.removeObserver(draggablePath, this, 'markersDraggableDidChange');
        }, this);
        
        this.get('markersProxy').removeArrayObserver(this);

        delete window.lmap;
        this.set('map',null);
    }
});
