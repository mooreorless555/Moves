import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import firebase from 'firebase';
import { LocationTracker } from '../providers/location-tracker';

declare var $: any;

/*
  Generated class for the DatabaseProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class DatabaseProvider {

  constructor(public lt: LocationTracker) {
    console.log('Hello DatabaseProvider Provider');
  }

get(dataQuery: string, dBPath?: string, listen?: boolean) : Promise<any> {

    let dataParse = dataQuery.split(' ');
    let dataType = dataParse[0];
    let dataKind = dataParse[2];
    let subscription;
    let def = new $.Deferred()
    let ref;

    if (!dBPath) {
      switch (dataKind) {
        case 'moves':
          dBPath = 'moves/'+this.lt.currentCollege.key+'/';
          break;
        case 'users':
          dBPath = 'userData/';
          break;
      }
    }

    if (dataType == "number") {
      ref = firebase.database().ref(dBPath)
      ref.once('value', snap => {
        let num = snap.numChildren()
        def.resolve(num)
      }).catch(e => {
        def.reject(e)
      })
    } else if (dataType == "value") {
      ref = firebase.database().ref(dBPath)
      ref.once('value', snap => {
        let value = snap.val()
        def.resolve(value)
      }).catch(e => {
        console.log('DB GET FAILED: ', e)
        def.reject(e)
      })
    }
    else if (dataType == "array") {
      ref = firebase.database().ref(dBPath)
      ref.once('value', snap => {
        let value = snap.val()
        let array = [];
        for (let key in value) {
          array.push(value[key]);
        }
        def.resolve(array);
      }).catch(e => {
        console.log('DB GET FAILED: ', e)
        def.reject(e)
      })

    }
  
    return def;
  }


listen(dBPath: string) {
  let ref = firebase.database().ref(dBPath)
  return ref;
}

getListener(dBPath: string) {
  let ref = firebase.database().ref(dBPath);
  return ref;
}

/* Inserts the given object into the database at the given path. */
insert(dBObject: any, dBPath: string) : Promise<any> {
  let def = new $.Deferred()
  let ref = firebase.database().ref(dBPath)
  ref.once('value', snap => {
        snap.ref.update(dBObject)
        def.resolve()
      }).catch(e => {
        def.reject(e)
      })
  
  return def;
}


push(dBObject: any, dBPath: string) : string {
  let ref = firebase.database().ref(dBPath)
  let key = ref.push(dBObject).key
  return key;
}

remove(dBPath: string) {
  let ref = firebase.database().ref(dBPath)
  return ref.remove();
}

set(dBObject: any, dBPath: string) : Promise<any> {
  let def = new $.Deferred()
  let ref = firebase.database().ref(dBPath)
  ref.set(dBObject).then(() => {
    def.resolve();
  })
    return def;
}


}


