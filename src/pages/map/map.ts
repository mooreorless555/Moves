import { Component, ViewChild, ElementRef, OnInit , trigger, style, animate, transition } from '@angular/core';
import { Platform, NavParams, NavController, ViewController } from 'ionic-angular';
// import { NativeStorage } from 'ionic-native';
import { StatsPage } from '../stats/stats'
import { System } from '../functions/functions';
import { LocationTracker } from '../../providers/location-tracker';
import { MovesProvider } from '../../providers/moves-provider';
import { MapComponentProvider } from '../../providers/map-component-provider';
import { MoveUser } from '../../providers/login-provider';
import 'rxjs/Observable';
import 'rxjs/add/operator/map';

declare var google: any;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
  providers: [System],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(100, style({ opacity: 0 })),
        animate(100, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(100, style({ opacity: 0 }))
      ])
    ])
  ]
})


export class MapPage implements OnInit{


  @ViewChild('map') mapElement: ElementRef;
  map: any;
  geocoder: any;
  user: any;
  userPoint = {x: 0, y: 0}

  /* Map Modal Variables here */
  clickFunc: any;
  focusFunc: any;
  dragFunc: any;
  isModal: boolean;
  tempLatLng: any;
  tempAddress: string;
  marker: any;
  customOverlay: any;

  /* Autocomplete Variables here */
  autocompleteItems: any;
  autocomplete: any;
  acService:any;
  placesService: any;

  moves: Array<any>;

  trackAddresses = (idx, obj) => obj.description;

  constructor(public platform: Platform, navParams: NavParams, public mapComponent: MapComponentProvider, public mUser: MoveUser, public mp: MovesProvider, public viewCtrl: ViewController, public system: System, public navCtrl: NavController, public params: NavParams, public locationTracker: LocationTracker) { 
    this.mp.modalOn = true;
    this.isModal = navParams.get('isModal'); 
    this.user = this.mUser.getFB();
  }

ngOnInit() {
  this.acService = new google.maps.places.AutocompleteService();        
  this.autocompleteItems = [];
  this.autocomplete = {
    query: ''
  };        
}


updateSearch() {
console.log('modal > updateSearch');
if (this.autocomplete.query == '') {
this.autocompleteItems = [];
return;
}
let self = this; 
let config = { 
//types:  ['geocode'], // other types available in the API: 'establishment', 'regions', and 'cities'
input: this.autocomplete.query, 
componentRestrictions: {  } 
}
this.acService.getPlacePredictions(config, function (predictions, status) {
console.log('modal > getPlacePredictions > status > ', status);
self.autocompleteItems = [];            
if (predictions) predictions.forEach(function (prediction) {              
self.autocompleteItems.push(prediction);
});
});
}

chooseItem(item) {
  this.dismiss();
  this.locationTracker.getCoordinates(item.description).then(latLng => {
    this.setMarker(latLng, true)
    this.tempLatLng = {lat: latLng.lat(), lng: latLng.lng()}
    console.log(this.tempLatLng);
    $('#mapSearch input').val(item.description);
  })
}

repopulate() {
  this.updateSearch()
}

dismiss() {
  this.autocompleteItems = [];
}


  ionViewDidLoad() {
    this.initializeMap();
    $('.corner-emblem').velocity('transition.slideUpIn');
  }

  closeModal() {
    this.mp.modalOn = false;
    console.log('Closing modal...')
    this.viewCtrl.dismiss({latLng: this.tempLatLng, address: this.tempAddress})
  }


  initializeMap() {
    let latLng = new google.maps.LatLng(this.locationTracker.lat, this.locationTracker.lng)

    let mapOptions = {
      center: latLng,
      zoom: 19,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,

      styles: [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1a3251"
      }
    ]
  },
  {
    "elementType": "labels.text",
    "stylers": [
      {
        "color": "#aac7ea"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8ec3b9"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1a3646"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#4b6878"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#64779e"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#4b6878"
      }
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#334e87"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#023e58"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#283d6a"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#589bbc"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#023e58"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3C7680"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#304a7d"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text",
    "stylers": [
      {
        "weight": 2,
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#98a5be"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2c6675"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#255763"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#b0d5ce"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#023e58"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#98a5be"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#283d6a"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3a4762"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#0e1626"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#4e6d70"
      }
    ]
  }
]
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.mapComponent.useMap(this.map)
    var bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(40.936587, -73.734054),
            new google.maps.LatLng(40.936587, -73.734054));
    var me = this;

    if (this.isModal) {
      this.clickFunc = new google.maps.event.addListener(this.map, 'click', function(event) {
        var newLat = event.latLng.lat();
        var newLng = event.latLng.lng();
        console.log('NEW LAT: ', newLat);
        me.tempLatLng = {lat: newLat, lng: newLng}
        me.setMarker(me.tempLatLng, false)
      });
        // this.customOverlay = new MapOverlay(bounds, 'https://developers.google.com/maps/documentation/javascript/examples/full/images/talkeetna.png', this.map)
    }



    // Place the user on the map
    this.mapComponent.userBubble(this.mUser.getFB(), {lat: this.locationTracker.lat, lng: this.locationTracker.lng})
    // Populate the map with moves!
    this.mp.trackChanges()
    .then(result => {
        this.mp.movesArr = result;
        this.sortMoves(this);
        for (let move of this.mp.movesList.open) {
            me.mapComponent.moveBubble(move);
        }
        for (let move of this.mp.movesList.private) {
            me.mapComponent.moveBubble(move);
        }
    })


  // this.initAutocomplete();
}

/* Check if user is invited or not */
  filterInvited(array: Array<any>, fbid: string) : Array<any> {

    let filteredArray = [];
    let acceptable = false;

    for (var i = 0; i < array.length; i++) {

      // Check to see whether your fb ID is in the guests list or
      // whether you're one of the hosts.
      var guestList = array[i].info.guests;
      var hostList = array[i].info.hosts;
      
      for (var id in guestList) {
        if (guestList[id].id == fbid) {
          acceptable = true;
        }
      }

      for (var id in hostList) {
        if (hostList[id].id == fbid) {
          acceptable = true;
        }
      }

      if (acceptable) {
          filteredArray.push(array[i]);
      }

    }
    return filteredArray;

  }

  sortMoves(myThis) {
      myThis.mp.movesArr = myThis.system.sortArray(myThis.mp.movesArr, 'users')
      console.log('SORTED MOVES!: ', myThis.mp.movesArr);

      myThis.mp.movesList.open = [];
      myThis.mp.movesList.open = myThis.system.filterArray(myThis.mp.movesArr, ['info.isOpen'], true);
      myThis.mp.movesList.open = myThis.system.sortArray(myThis.mp.movesList.open, 'info.isPending');
      console.log('OPEN MOVES!: ', myThis.mp.movesList.open);

      let filterPrivate = myThis.system.filterArray(myThis.mp.movesArr, ['info.isOpen'], false);
      myThis.mp.movesList.private = myThis.filterInvited(filterPrivate, myThis.mUser.getFB().id)
      myThis.mp.movesList.private = myThis.system.sortArray(myThis.mp.movesList.private, 'info.isPending');
      console.log('PRIVATE MOVES: ', myThis.mp.movesList.private);

      
      myThis.mp.movenum = myThis.mp.movesArr.length;
      myThis.mp.stopTrackingChanges()
  }

setMarker(latLng, panTo: boolean) {
  var me = this;
  if (me.marker) me.marker.setMap(null)
  me.marker = new google.maps.Marker({
    map: me.map,
    draggable: false,
    position: latLng
  });
  if (panTo) {
      me.marker.setMap(me.map)
      me.map.panTo(latLng)
      me.tempLatLng = latLng;
      me.locationTracker.getAddress(me.tempLatLng).then(result => {
        me.tempAddress = result;
        me.system.displayToast(result, 3000)
      });
  } else {
      me.locationTracker.getAddress(me.tempLatLng).then(result => {
        me.marker.setMap(me.map)
        me.tempAddress = result;
        me.system.displayToast(result, 3000)
      });
  } 

}

initAutocomplete() {

      }

}

