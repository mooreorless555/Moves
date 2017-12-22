import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';
import { Http } from '@angular/http';
import { MovesProvider } from '../providers/moves-provider';
import { MoveUser } from '../providers/login-provider';
import { System } from '../pages/functions/functions';
import { StatsPage } from '../pages/stats/stats';
import 'rxjs/add/operator/map';

/*
  Generated class for the MapComponentProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class MapComponentProvider {

  map: any;
  zoomFunc: any;

  constructor(public http: Http, public app: App, public system: System, public mUser: MoveUser, public mp: MovesProvider) {
    console.log('Hello MapComponentProvider Provider');
  }

  useMap(mapToUse) {
    this.map = mapToUse;
  }

  moveBubble(move: any, map?: any) {
    var me = this;
    var bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(move.LatLng.lat, move.LatLng.lng),
            new google.maps.LatLng(move.LatLng.lat, move.LatLng.lng));
    var newFunc = function() {
      me.checkStats(move, move.key)
    }

    var args = {
      bounds: bounds,
      map: this.map,
      id: 'ctn_'+move.key,
      clickHandler: newFunc,
      label: move.info.name,
      isMove: true
    }
    var bubble = new MapOverlay(args)

    this.map.addListener('zoom_changed', function(event) {
      console.log('Zoom change!', me.map.getZoom(), $('#ctn_'+move.key));
      var zoomValue = me.map.getZoom() / 20;
      $('.map-component-item').css({
      '-webkit-transform' : 'scale(' + zoomValue + ')',
      '-moz-transform'    : 'scale(' + zoomValue + ')',
      '-ms-transform'     : 'scale(' + zoomValue + ')',
      '-o-transform'      : 'scale(' + zoomValue + ')',
      'transform'         : 'scale(' + zoomValue + ')'
    });
    });

    return bubble;
  }

  userBubble(user, latLng) {
    var me = this;
    var bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(latLng.lat, latLng.lng),
            new google.maps.LatLng(latLng.lat, latLng.lng));
    var newFunc = function() {
      alert('Click!');
    }

    var args = {
      bounds: bounds,
      image: this.mUser.getPhoto(user.id).square,
      map: this.map,
      id: 'USER',
      clickHandler: newFunc,
      isAvatar: true
    }
    var bubble = new MapOverlay(args)
    return bubble;    
  }

  /* Auxiliary Functions */
  checkStats(move, key) {
      if (!move.info.isPending) {
        this.mp.stopTrackingChanges();
        this.app.getRootNav().push(StatsPage, {
          firstPassed: move,
          movekey: key
        });
      } else {
        // Check to see if the user trying to enter is any of the hosts
        let user = this.mUser.getFB();
        let hosts = move.info.hosts
        if (this.system.contains(user.id, hosts, 'id')) {
          this.system.displayToast("Host access granted for " + user.name);
          this.mp.stopTrackingChanges();
            this.app.getRootNav().push(StatsPage, {
            firstPassed: move,
            movekey: key
          });       
        } else {
          // Show toast! Move is not yet ready!
          this.system.displayToast(move.info.name + " has not yet gone live! Please wait.");
        }
      }
    }

}
