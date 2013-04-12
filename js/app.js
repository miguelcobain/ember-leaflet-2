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

App.IndexRoute = Ember.Route.extend({
    setupController : function(controller) {
        controller.set('content', ['red', 'yellow', 'blue']);
    }
});

App.Supermarket = Ember.Object.extend({
    highlighted : false,
    draggable : true,
    popup : function(){
        return this.get('name');
    }.property('name')
});

App.IndexView = Ember.View.extend({
    didInsertElement : function(){
        $('body').tooltip({
            selector: 'a[rel="tooltip"], [data-toggle="tooltip"]'
        });
    }
});

App.IndexController = Ember.ObjectController.extend({
    zoom : 14,
    center : Ember.Object.create({
        lat: 41.276081,
        lng: -8.376861
    }),
    supermarkets : Ember.A([
        App.Supermarket.create({
            name: 'A',
            lat: 41.276081,
            lng: -8.356861
        }),
        App.Supermarket.create({
            name: 'B',
            lat: 41.276081,
            lng: -8.366861
        }),
        App.Supermarket.create({
            name: 'C',
            lat: 41.276081,
            lng: -8.376861
        }),
        App.Supermarket.create({
            name: 'D',
            lat: 41.276081,
            lng: -8.386861
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
            lat: this.get('center.lat'),
            lng: this.get('center.lng')
        }));  
    },
    highlight: function(s){
        s.toggleProperty('highlighted');
    },
    lock: function(s){
        s.toggleProperty('draggable');
    },
    centerMarker: function(s){
        /*var center = this.get('center');
        center.set('lat',s.get('lat'));
        center.set('lng',s.get('lng'));*/
        this.set('center',Ember.Object.create({
            lat:s.get('lat'),
            lng:s.get('lng')
        }))
    }
});