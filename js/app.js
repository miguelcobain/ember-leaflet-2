$('body').tooltip({
    selector: 'a[rel="tooltip"], [data-toggle="tooltip"]'
});
App = Ember.Application.create({
    rootElement: "#application"
});

App.Router = Ember.Router.extend({
    location : Ember.Location.create({
        implementation : 'none'
    })
});

App.IndexView = Ember.View.extend({
    didInsertElement : function(){
        $('body').tooltip({
            selector: 'a[rel="tooltip"], [data-toggle="tooltip"]'
        });
    }
});

App.Supermarket = Ember.Object.extend({
    highlight : false,
    draggable : true,
    popup : function(){
        return this.get('name');
    }.property('name'),
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
    // Default normal icon
    normalIcon : new L.Icon.Default(),
    // Default highlight icon
    highlightIcon : new L.Icon.Default({
        iconUrl : 'img/marker-icon-highlight.png'
    }),
    highlightDidChange:function(){
        var marker = this.get('marker');
        var highlight = this.get('highlight');
        var map = this.get('map');

        if (!marker)
            return;

        var draggable = marker.dragging.enabled();
        if (highlight) {
            marker.setIcon(this.get('highlightIcon'));
            map.setView(marker.getLatLng(), 14);
        } else {
            marker.setIcon(this.get('normalIcon'));
        }

        if (draggable)
            marker.dragging.enable();
        else
            marker.dragging.disable();
    }.observes('highlight','marker'),
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

// Example Controller

App.IndexController = Ember.ObjectController.extend({
    zoom : 14,
    center : Ember.Object.create({
        lat: 41.276081,
        lng: -8.376861
    }),
    supermarkets : Ember.A([
        App.Supermarket.create({
            name: 'A',
            location:{
                lat: 41.276081,
                lng: -8.356861
            }
        }),
        App.Supermarket.create({
            name: 'B',
            location:{
                lat: 41.276081,
                lng: -8.366861
            }
        }),
        App.Supermarket.create({
            name: 'C',
            location:{
                lat: 41.276081,
                lng: -8.376861
            }
        }),
        App.Supermarket.create({
            name: 'D',
            location:{
                lat: 41.276081,
                lng: -8.386861
            }
        })
    ]),
    remove: function(s){
        this.get('supermarkets').removeObject(s);
    },
    zoomIn: function(){
        this.incrementProperty('zoom');
    },
    zoomOut: function(){
        this.decrementProperty('zoom');
    },
    add: function(){
        this.get('supermarkets').pushObject(App.Supermarket.create({
            location : {
                lat: this.get('center.lat'),
                lng: this.get('center.lng')
            },
            name : 'New Marker'
        }));  
    },
    highlight: function(s){
        s.toggleProperty('highlight');
    },
    lock: function(s){
        this.highlight(s);
        s.toggleProperty('draggable');
    },
    centerMarker: function(s){
        /*var center = this.get('center');
        center.set('lat',s.get('lat'));
        center.set('lng',s.get('lng'));*/
        this.set('center',Ember.Object.create({
            lat:s.get('location.lat'),
            lng:s.get('location.lng')
        }))
    }
});
