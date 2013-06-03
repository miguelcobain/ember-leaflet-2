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
App.Supermarket = Ember.Object.extend(Ember.LeafletMarkerMixin,{
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
    highlightDidChange : function(){
        var marker = this.get('marker');
        var highlight = this.get('highlight');
        var map = this.get('map');

        if (!marker)
            return;

        if (highlight) {
            this.set('icon',this.get('highlightIcon'));
            map.setView(marker.getLatLng(), 14);
        } else {
            this.set('icon',this.get('normalIcon'));
        }
    }.observes('highlight', 'marker', 'map')
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
    },
    icons:[
        {
            label: 'Supermarket',
            icon: L.AwesomeMarkers.icon({
                icon : 'shopping-cart',
                color : 'blue'
            }),
        },
        {
            label: 'Rocket!',
            icon:L.AwesomeMarkers.icon({
                icon : 'rocket',
                color : 'orange'
            })
        },
        {
            label: 'Fire! Fire!',
            icon:L.AwesomeMarkers.icon({
                icon : 'fire-extinguisher',
                color : 'red'
            })
        },
        {
            label: 'Let\'s play!',
            icon:L.AwesomeMarkers.icon({
                icon : 'gamepad',
                color : 'cadetblue'
            })
        },
        {
            label: 'Ember',
            icon:L.AwesomeMarkers.icon({
                icon : 'fire',
                color : 'green'
            })
        }
    ],
    changeIcon : function(s, icon){
        s.set('icon',icon);
    }
});
