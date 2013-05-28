$('body').tooltip({
    selector : 'a[rel="tooltip"], [data-toggle="tooltip"]'
});
App = Ember.Application.create({
    rootElement : "#application"
});

App.Router = Ember.Router.extend({
    location : Ember.Location.create({
        implementation : 'none'
    })
});

App.IndexView = Ember.View.extend({
    didInsertElement : function() {
        $('body').tooltip({
            selector : 'a[rel="tooltip"], [data-toggle="tooltip"]'
        });
    }
});

/*
 * A subclass of LeafletMarker.
 * Example of a custom marker behavior "Highlight".
 * Every other functionality is provided by its super class.
 */
App.Supermarket = Ember.LeafletMarker.extend({
    highlight : false,
    draggable : true,
    popupBinding : 'name',
    // Default normal icon
    normalIcon : L.AwesomeMarkers.icon({
        icon : 'shopping-cart',
        color : 'blue'
    }),
    // Default highlight icon
    highlightIcon : L.AwesomeMarkers.icon({
        icon : 'flag',
        color : 'red'
    }),
    highlightDidChange : function() {
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
    }.observes('highlight', 'marker')
});

// Example Controller

App.IndexController = Ember.ObjectController.extend({
    zoom : 14,
    center : Ember.Object.create({
        lat : 41.276081,
        lng : -8.376861
    }),
    supermarkets : Ember.A([App.Supermarket.create({
        name : 'A',
        location : {
            lat : 41.276081,
            lng : -8.356861
        }
    }), App.Supermarket.create({
        name : 'B',
        location : {
            lat : 41.276081,
            lng : -8.366861
        }
    }), App.Supermarket.create({
        name : 'C',
        location : {
            lat : 41.276081,
            lng : -8.376861
        }
    }), App.Supermarket.create({
        name : 'D',
        location : {
            lat : 41.276081,
            lng : -8.386861
        }
    })]),
    remove : function(s) {
        this.get('supermarkets').removeObject(s);
    },
    zoomIn : function() {
        this.incrementProperty('zoom');
    },
    zoomOut : function() {
        this.decrementProperty('zoom');
    },
    add : function() {
        this.get('supermarkets').pushObject(App.Supermarket.create({
            location : {
                lat : this.get('center.lat'),
                lng : this.get('center.lng')
            },
            name : 'New Marker'
        }));
    },
    highlight : function(s) {
        s.toggleProperty('highlight');
    },
    lock : function(s) {
        this.highlight(s);
        s.toggleProperty('draggable');
    },
    centerMarker : function(s) {
        this.set('center', Ember.Object.create({
            lat : s.get('location.lat'),
            lng : s.get('location.lng')
        }))
    }
});
