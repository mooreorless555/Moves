import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import firebase from 'firebase';
// import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { StatsProvider } from '../providers/stats-provider';
import { LocationTracker } from '../providers/location-tracker';
import { DatabaseProvider } from '../providers/database-provider';
// import { NotificationProvider } from '../providers/notification-provider';
import { NotificationProvider } from '../providers/notification-provider';
import { LoginProvider, MoveUser } from '../providers/login-provider';

import { AlertController } from 'ionic-angular';

/*
  Generated class for the MovesProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class MovesProvider {

  public tempmoves: any;
  // public moves: FirebaseListObservable<any>;
  public movesArr = [];
  public movesList = { 
    open: [], 
    private: [],
    hidden: []
  }
  public dbRefObject: any;
  public movenum = 0;
  public netFlow: any;
  public calling = false;
  public modalOn = false;
  public userInviteList: any;
  public subscription: any;
  public dbRefWatch: any;
  public dbRefPeople: any;

  public serverMessage = "";

  public interval: any;
  public mSubscription: any;
  public wait = false;

  public radius = 17;

  public currentmove = "NONE";

  constructor(public db: DatabaseProvider, 
              public stat: StatsProvider, 
              public alertCtrl: AlertController,
              public np: NotificationProvider,
              public lp: LoginProvider, 
              public mUser: MoveUser, 
              public locationTracker: LocationTracker) {
    this.db.get('value', 'serverInfo/serverMessage', true).then(result => {
      this.serverMessage = result;
    })

    setInterval(() => {
      if (this.locationTracker.lat) this.storeLocation();
    }, 10000);
  }

  cleanUp() {
    if (this.dbRefObject) this.dbRefObject.off();
    if (this.dbRefPeople) this.dbRefPeople.off();
    if (this.interval) clearInterval(this.interval);
  }


  checkMoves() {
    let updatedMoveList;
    let user = this.mUser.getFB()
    this.db.get('array of moves').then(newMoves => {
      updatedMoveList = newMoves

      this.pushLocation()
   
      if (this.locationTracker.locs.length >= 3) {
        for (let move of updatedMoveList) {
          if (this.isInMove(move)) {
            if (!this.findKey(user.id, move.users)) {
              console.log('Adding user to move...');
              this.addUser(move.key);
              this.db.insert(move.key, 'userData/'+user.id+'/currently/move')
            } else {
              console.log('User is already there, no add.');
            }
          } else {
            if (this.findKey(user.id, move.users)) {
                this.removeUser(move.key);
                this.db.remove('userData/'+user.id+'/currently/move')
                console.log('Removing user from this move.')
            }
          }
        }
      }
    })
  }

  pushLocation() {
    let lt = this.locationTracker;
    let myLatLng = {
      lat: lt.lat,
      lng: lt.lng
    }
    if (lt.locs.length < 3) {
      lt.locs.push(myLatLng);
    } else {
      lt.locs = [];
    }
    console.log("Current status of location data: ", lt.locs)
  }

  async currentlyAtMove(fbid, key) {
    let current = await this.db.get('value', '/userData/'+fbid+'/currently');
    
    if (current.move == key) {
      this.currentmove = key;
      return true;
    }

  }

  isInMove(move) {
    let lt = this.locationTracker;
    let denom = lt.locs.length;
    let numer = 0;
    let dist = 0;
    let avgDist = 0;

    console.log("Our array of locations:", lt.locs);

    for (let loc of lt.locs) {
      dist = lt.calculateDistance(move.LatLng.lat, move.LatLng.lng, loc.lat, loc.lng);
      console.log("Distance: " + dist);
      numer += dist;
    }

    avgDist = numer/denom; // The mean!

    if (avgDist <= 40) {
	
      return true;
    }
    return false;
  }

  async trackChanges() {
    let def = new $.Deferred()
    let result = await this.db.get('array of moves');
    result = this.filterNearbyMoves(result);

    if (this.mSubscription) this.mSubscription.unsubscribe()
    if (this.interval) {
      console.log("Clearing interval");
      clearInterval(this.interval)
    }
    this.movesArr = result
    this.interval = setInterval(() => this.checkMoves(), 10000)
    def.resolve(result)

    return def;
  }

  filterNearbyMoves(moves) {
    let myLat = this.locationTracker.lat;
    let myLng = this.locationTracker.lng;

    let nearbyMoves = [];

    for (let move of moves) {
      let moveLat = move.LatLng.lat;
      let moveLng = move.LatLng.lng;
      let dist    = this.locationTracker.calculateDistance(myLat, myLng, moveLat, moveLng);
      if (dist <= 4828) {
        nearbyMoves.push(move);
      }
    }

    return nearbyMoves;
  }

  getMoveByKey(movekey) {
    let ref = firebase.database().ref('moves/'+this.locationTracker.currentCollege.key+'/')
    return ref.orderByKey().equalTo(movekey)
  }

  addUser(movekey) {
    var movesPath = 'moves/'+this.locationTracker.currentCollege.key+'/'+movekey
    var user = this.mUser.getFB();
    var userInfo = {
      id: user.id,
      name: user.name,
      move: movekey
    }
    var d = new Date()
    var timeRef = d.getTime()
    var currentMoveInfo = {
      move: movekey
    }
    var newResult = {id: user.id, in: 1, out: 0, timeRef: timeRef}

    // Check to see if user is not already there
    this.db.get('value', 'userData/'+user.id+'/currently')
    .then(currentMove => {
      if (currentMove.move != movekey) this.db.push(newResult, movesPath+'/stats/flow/')
    })
    
    this.db.insert(currentMoveInfo, 'userData/'+user.id+'/currently')
    this.db.insert(userInfo, movesPath+'/users/'+user.id)

  }

  addRando(movekey) {
    var user = { uid: Math.random() * 10 + '', displayName: "Rando" }
    var userInfo = {
      name: user.displayName,
      move: movekey
    }

    var ref = firebase.database().ref('moves/'+this.locationTracker.currentCollege.key+'/')
    ref
      .orderByKey()
      .equalTo(movekey)
      .once('child_added', snap => {
        snap.ref.child('users').child(user.uid).update(userInfo)
      })
  }

  removeUser(movekey) {
    var user = this.mUser.getFB()
    var movesPath = 'moves/'+this.locationTracker.currentCollege.key+'/'+movekey;
    var dBPathMove = movesPath+'/users/'+user.id;
    var dBPathUserData = 'userData/'+user.id+'/currently/'
    var newResult = {id: user.id, in: 0, out: 1, timeRef: new Date().getTime()}
    this.db.remove(dBPathMove)
    this.db.remove(dBPathUserData+'move')
    // Check to see if user is not already there
    this.db.get('value', 'userData/'+user.id+'/currently')
    .then(currentMove => {
      if (currentMove.move == movekey) this.db.push(newResult, movesPath+'/stats/flow/')
    })
  }

  trackStatChanges(move, funstatbar, mehstatbar, deadstatbar, progbar) {
    let capacity = move.info.capacity;
    this.dbRefWatch = firebase.database().ref().child('moves/'+this.locationTracker.currentCollege.key+'/'+move.key);
    this.dbRefPeople = firebase.database().ref().child('moves/'+this.locationTracker.currentCollege.key+'/'+move.key).child('users');

    this.dbRefPeople.on('value', snap => {
      let move = snap.val()
      console.log(move);
      let value = snap.numChildren() / capacity;
      progbar.animate(value > 1 ? 1 : value);
    })


    this.dbRefWatch.on('value', snap => {
      let move = snap.val();
      let capacity = move.info.capacity;
      var funbarperc;
      var mehbarperc;
      var deadbarperc;
      funbarperc = move.stats.fun / capacity;
      mehbarperc = move.stats.meh / capacity;
      deadbarperc = move.stats.dead / capacity;

      this.netFlow = this.stat.calculateFlow(move.stats.flow);

      if (funbarperc > 0) {
        this.stat.UpdateCounter(funstatbar, funbarperc, move.stats.fun);
      } else {
        this.stat.UpdateCounter(funstatbar, 0.003);
      }
      if (mehbarperc > 0) {
        this.stat.UpdateCounter(mehstatbar, mehbarperc, move.stats.meh);
      } else {
        this.stat.UpdateCounter(mehstatbar, 0.003);
      }
      if (deadbarperc > 0) {
        this.stat.UpdateCounter(deadstatbar, deadbarperc, move.stats.dead);
      } else {
        this.stat.UpdateCounter(deadstatbar, 0.003);
      }
    });
  }

  isMoveLive(move) {
    let start = move.info.pending.startTime || 0;
    let now   = new Date().getTime();
    return (now - start) > 0;
  }


  stopTrackingChanges() {
    if (this.dbRefObject) this.dbRefObject.off();
    if (this.dbRefPeople) this.dbRefPeople.off();
    if (this.dbRefWatch) this.dbRefWatch.off();
  }

  putBars(move) {
    let movekey = move.key
    console.log('Container for ' + move.info.name + ' is empty. Adding.');
    this.db.get('number', 'moves/'+this.locationTracker.currentCollege.key+'/'+movekey+'/users').then(numUsers => {
      this.stat.CreatePeopleCounter(movekey, numUsers / move.info.capacity)
    })

    this.db.get('value', 'moves/'+this.locationTracker.currentCollege.key+'/'+movekey+'/stats/').then(allStats => {
      console.log('Stats are, ', allStats)
      let highestValue = Math.max(allStats.fun, allStats.meh, allStats.dead)
      let ratingColor = "#000";
      switch (highestValue) {
        case allStats.fun:
          ratingColor = '#27e833';
          break;
        case allStats.meh:
          ratingColor = '#FBD200';
          break;
        case allStats.dead:
          ratingColor = '#f9152f';
          break;
        default:
          ratingColor = '#333';
      }

      if (highestValue == allStats.fun && highestValue == allStats.meh && highestValue == allStats.dead) ratingColor = '#333'
      setTimeout(() => {
        // this.stat.CreateSmallLineCounter('fun'+movekey, ratingColor, 2000, 0.1)
      }, 1000)
    })
  }

  incStat(move, type, value?: number) {
    let incBy = 1;
    console.log('INCREASE')
    if (value) incBy = value;
    firebase.database().ref('moves/'+this.locationTracker.currentCollege.key+'/' + move.key + '/stats/')
      .once('value', snap => {
        let stats = snap.val()[type] + incBy;
        snap.ref.update({ [type]: stats })
      })
  }

  // appendMove(move) {
  //   let part1 = "<ion-item id=" + "SOME_KEY" + "class='moveslist' no-lines (click)='checkStats(move)' (press)='system.moveOptionsScreen(move)'><ion-icon item-right><div id=" + "SOME_KEY" + "class='container' #container></div>";
  //   let part2 = "</ion-icon><span><ion-icon name='arrow-dropright-circle' class='ratingdot' [ngClass]='{ 'fun-border': totalRatings(move) == 1, 'meh-border': totalRatings(move) == 2, 'dead-border': totalRatings(move) == 3 }'></ion-icon>";
  //   let part3 = "<h1 id='moveName' class='cutoff' style='display: inline'>" + move.info.name + "</h1></span>";
  //   let part4 = '<p id="extraInfo" class="extra-info-text item-description">' + move.info.extraInfo + '</p>';
  //   let part5 = '<p class="host-text"><i>Hosted by" + ' + move.info.hosts[0] + '</i></p></ion-item>';
  //   let total = part1 + part2 + part3 + part4 + part5;
  //   $('#indivMove').append(total);
  // }

  // getMove(myKey) {
  //   firebase.database().ref().child('moves').orderByChild("key").equalTo(myKey);
  // }

  // trackMove() {
  //   const preObject = document.getElementById('moves');
  //       const dbRefObject = firebase.database().ref().child('moves');
  //       dbRefObject.on('value', snap => {
  //         this.moves = snap.val();
  //         if (this.moves.length > 0 && this.stat.counters.length == 0) {  
  //         } else {
  //         let perc = 0.3;
  //         console.log(this.stat.counters);
  //         if (this.stat.counters.length > 0) this.stat.UpdateCounter(this.stat.counters[0], perc);
  //         }
  //       });    
  // }
  
  findKey(key, haystack) {
      if (!haystack) {
          return false;
      } else {
          var haystackArr = Object.keys(haystack)
          var found = haystackArr.find(function(val) {
              return key == val;
          })
      }
    
    return found;
  }

  deleteMove(move) {
    let confirm = this.alertCtrl.create({
      message: 'Are you sure want to delete "' + move.info.name + '"?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: data => {
            firebase.database().ref().child('moves/'+this.locationTracker.currentCollege.key+'/' + move.key).remove().then(() => {
              this.stat.cnum--;
              console.log("All done.");
              this.trackChanges()
                .then(result => {
                  this.movenum = this.movesArr.length;
                  this.stopTrackingChanges()
                })
            }
            );
          }
        }
      ]
    });
    confirm.present();
  }

  convertListToArray(list) {
  var finalArray = [];
  for (var e in list) {
    finalArray.push(list[e])
  }
  console.log('fArray: ', finalArray);
  return finalArray;
}

convertArrayToList(array, prop) {
  var finalObjList: any;

  var newArray = [];
  for (var item of array) {
    let id = item[prop]
    let newObj = {[id]: item}
    newArray.push(newObj)
  }
  finalObjList = Object.assign.apply(null, newArray);
  console.log('fOBJL: ', finalObjList);
  return finalObjList;
}

  makeMove(move) {

    let user = this.mUser.getFB();

    /* Our move JSON object to be
    pushed into the database */
    let newMove = {
        "key": "",
        "LatLng": {
        "lat": move.LatLng.lat,
        "lng": move.LatLng.lng
      },
      "info": {
        "capacity": move.info.capacity,
        "extraInfo": move.info.extraInfo,
        "hasAlcohol": move.info.hasAlcohol,
        "location": move.info.location,
        "name": move.info.name,
        "hosts": {[user.id] : { id: user.id, name: move.info.owner.name}},
        "owner": {id: user.id, name: move.info.owner.name, badgeId: move.info.owner.badgeId},
        "address": move.info.address,
        "showAddress": move.info.showAddress,
        "isOpen": move.info.isOpen,
        "isPending": move.info.isPending,
        "isAnon": move.info.isAnon,
        "visibility": parseInt(move.info.visibility),
        "pending": {
          "startTime": move.info.pending.startTime,
          "createdTime": move.info.pending.createdTime
        }
      },
      "stats": {
        "dead": 0,
        "fun": 0,
        "meh": 0,
        "people": move.stats.people
      }
    }

    /* Push new move to the database and
    store its key value for later use */
    let newKey = this.db.push(newMove, 'moves/'+this.locationTracker.currentCollege.key+'/')
    this.db.insert({key: newKey}, 'moves/'+this.locationTracker.currentCollege.key+'/' + newKey)

    /* If it exists, empty out the user invite list 
    after inserting it into the database */
    if (this.userInviteList) {
      this.db.insert({guests: this.userInviteList}, 'moves/'+this.locationTracker.currentCollege.key+'/' + newKey + '/info/').then(() => {
        this.userInviteList = null;
      })
    }

    /* If the move is pending, add the timestamp and necessary information */
  }

  async addFollower(move) {
    let user = this.mUser.getFB()
    await this.db.insert({id: user.id, name: user.name}, `/moves/${this.locationTracker.currentCollege.key}/${move.key}/followers/${user.id}`);
  }

  async removeFollower(move) {
    let user = this.mUser.getFB();
    await this.db.remove(`/moves/${this.locationTracker.currentCollege.key}/${move.key}/followers/${user.id}`);
  }

  async storeLocation() {
    let user = this.mUser.getFB();
    let lat = this.locationTracker.lat;
    let lng = this.locationTracker.lng;
    await this.db.insert({location: {lat: lat, lng: lng}}, `/userData/${user.id}/`);
  }



}
