import { Injectable, NgZone } from '@angular/core';
// import { BackgroundMode } from '@ionic-native/background-mode';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
// import { Globals } from '../pages/functions/functions';
import 'rxjs/add/operator/filter';

declare var google;

/*
  Generated class for the LocationTracker provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class LocationTracker {

  public distance = 999;
  public watch: any;
  public lat: number = 0;
  public lng: number = 0;
  public locs: Array<any> = [];
  public altitude: number = 0;
  public status = 0;
  public geofences: any;
  public address = "Fetching address..."
  // public globals = Globals;

  public movesPath: string;

  public currentCollege = {
    key: "yale"
  }

  constructor(public zone: NgZone, public backgroundGeolocation: BackgroundGeolocation, public geolocation: Geolocation) {
    console.log('Hello LocationTracker Provider woohoo');
    // this.setCurrentCollege();
    this.movesPath = 'moves/'+this.currentCollege.key+'/';
  }

  // setCurrentCollege() {
  //   let myLat = this.lat;
  //   let myLng = this.lng;

  //   // Check distance from each college
  //   let colleges = this.globals.colleges;
  //   for (let college of colleges) {
  //     let collegeLat = college.location.lat;
  //     let collegeLng = college.location.lng;
  //     let dist = this.calculateDistance(myLat, myLng, collegeLat, collegeLng);

  //     if (dist <= 4000)
  //       this.currentCollege = college;
  //   }
  // }

  // setGeofence(move, radius) {
  //   this.geofence.addOrUpdate({
  //     id: move.key + "ENTER",           //A unique identifier of geofence
  //     latitude: move.LatLng.lat, //Geo latitude of geofence
  //     longitude: move.LatLng.lng, //Geo longitude of geofence
  //     radius: radius,          //Radius of geofence in meters
  //     transitionType: 1,               //Type of transition 1 - Enter, 2 - Exit, 3 - Both
  //     notification: {                  //Notification object
  //       id: 1,        //optional should be integer, id of notification
  //       title: "Arriving at " + move.info.name,        //Title of notification
  //       text: "Tap to open Moves",        //Text of notification
  //       openAppOnClick: true     //is main app activity should be opened after clicking on notification
  //     }
  //   }).then(function () {
  //     console.log('Geofence successfully added/updated.');
  //   }, function (reason) {
  //     console.log('Adding geofence failed', reason);
  //   });

  //   this.geofence.addOrUpdate({
  //     id: move.key + "LEAVE",           //A unique identifier of geofence
  //     latitude: move.LatLng.lat, //Geo latitude of geofence
  //     longitude: move.LatLng.lng, //Geo longitude of geofence
  //     radius: radius,          //Radius of geofence in meters
  //     transitionType: 2,               //Type of transition 1 - Enter, 2 - Exit, 3 - Both
  //     notification: {                  //Notification object
  //       id: 1,        //optional should be integer, id of notification
  //       title: "Leaving " + move.info.name,        //Title of notification
  //       text: "Tap to open Moves",        //Text of notification
  //       openAppOnClick: true       //is main app activity should be opened after clicking on notification
  //     }
  //   }).then(function () {
  //     // alert('Geofence for ' + move.info.name + ' successfully added/updated at ' + move.LatLng.lat + ', ' + move.LatLng.lng);
  //     // this.system.showNotification('Geofence made for ' + move.info.name, 1000);
  //   }, function (reason) {
  //     // alert('Adding' + move.info.name + ' failed: ' + reason);
  //     // this.system.showNotification('Geofence failed: ' + reason, 1000, 'error');
  //   });
  // }


  //   let fence = {
  //       id: "myGeofenceID1", 
  //       latitude:       latitude, 
  //       longitude:      longitude,
  //       radius:         radius,  
  //       transitionType: 2
  //     }

  //     this.geofence.addOrUpdate(fence).then(
  //       () => alert("Fence has been made at " + fence.latitude + " and " + fence.longitude),
  //       (err) => console.log("Failed to add or update the fence."));




  // }).catch((error) => {
  //   alert("ERROR! NO: " + error);
  // });

  // getLocationName(location) {
  //   address = location;
  // }

  // revGeocode(inlatLng) {
  //   var me = this;
  //    var geocoder = new google.maps.Geocoder;
  //    var location = "NO_ADDRESS";
  //     var latLng = inlatLng;
  //     geocoder.geocode({'location': latLng}, function(results, status) {
  //               if (status === 'OK') {
  //                 if (results[0]) {
  //                   location = results[0].formatted_address;
  //                   console.log(location);
  //                   me.getLocationName(location);           
  //                 } else {
  //                   alert('No results.');
  //                   location = 'Nothing.';
  //                 }
  //               } else {
  //                 alert('Geocoder failed due to: ' + status);
  //                 location = 'GEOCODER_ERROR';
  //               }});
  // }
  getLocationName(location) {
    var me = this;
    me.address = location;
  }

  revGeocode(address, inlatLng) {
    if (inlatLng.lat != 0) {
      var me = this;
      var geocoder = new google.maps.Geocoder;
      var location = "NO_ADDRESS";
      var latLng = inlatLng;
      geocoder.geocode({ 'location': latLng }, function (results, status) {
        if (status === 'OK') {
          if (results[0]) {
            location = results[0].formatted_address;
            console.log(location);
            me.getLocationName(location);
          } else {
            alert('No results.');
            location = 'Nothing.';
          }
        } else {
          alert('Geocoder failed due to: ' + status);
          location = 'GEOCODER_ERROR';
        }
      });
    }
  }

  getAddress(latLng) : Promise<any> {
    var def = new $.Deferred();
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({ 'location': latLng }, function(results, status) {
      if (status === 'OK') {
        if (results[0]) {
          def.resolve(results[0].formatted_address);
        } else {
          def.reject();
        }
      }
    })

    return def;
  }

  getCoordinates(address) : Promise<any> {
    var geocoder = new google.maps.Geocoder;
    var def = new $.Deferred()
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (results[0]) {
        def.resolve(results[0].geometry.location)
        return def;
      } else {
        def.reject('GEOCODE ERROR: ' + status)
        return def;
      }
    })
  
    return def;
  }

  startTracking() {
    console.log("Tracking has started...");
      // this.bg.setDefaults({title: "Moves is active", text: "Tap to view", color: '#886cef'})
      // this.bg.enable()
    // Foreground Tracking, this will track and update your location every second.

    let options = {
      frequency: 15000,
      enableHighAccuracy: true
    };

    this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {

      console.log("Your position", position);

      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        if (this.lat != 0) this.status++;
      });

    });

    // Background Tracking

    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 1,
      distanceFilter: 0,
      debug: false,
      interval: 60000
    };

    this.backgroundGeolocation.configure(config).subscribe((location) => {

      console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);

      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = location.latitude;
        this.lng = location.longitude;
        this.altitude = location.altitude;
      });

    }, (err) => {

      console.log(err);

    });

    // Turn ON the background-geolocation system.
    // this.backgroundGeolocation.start();



  }

  stopTracking() {

    console.log('stopTracking');
    this.backgroundGeolocation.finish();
    this.watch.unsubscribe();

  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km (change this constant to get miles)
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return Math.round(d * 1000)
  }

}
