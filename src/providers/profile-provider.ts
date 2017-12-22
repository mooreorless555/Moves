import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { System } from '../pages/functions/functions';
import { MoveUser } from '../providers/login-provider';
import { AlertController } from 'ionic-angular';

/*
  Generated class for the ProfileProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class Badges {

  badgePath = 'assets/img/badges/'

  badges = {
    720: {
      id: 720,
      name: 'Verified',
      image: this.getPath('verified.png')
    },
    111: {
      id: 111,
      name: 'LIT Co',
      image: this.getPath('litco.png')
    },
    999: {
      id: 999,
      name: 'None',
      image: this.getPath('default.png')
    }
  }

  constructor(public http: Http, public system: System, public alertCtrl: AlertController, public mUser: MoveUser) {
    console.log('Hello ProfileProvider Provider: Badges');
  }

manage() {
    var me = this;
    var def = new $.Deferred();
    var user = this.mUser.getFB();
    this.system.appLoader("");
    this.mUser.getBadges(user.id).then(badges => {
      this.system.loader.dismiss();
      var badgeArray = this.system.getArrayFromObjProps(badges, 'id')
      let confirmFunc = (oldBadge, newBadge) => {
        me.mUser.setCurrentBadge(user.id, newBadge).then(() => {
          if (newBadge != 999 || newBadge != oldBadge) me.system.displayToast("You're now repping the '" + this.get(newBadge).name + "' badge", 5000, false, 'BADGE CHANGE');
          def.resolve(this.get(newBadge))
      })
      }
      let allInputs = [];
      this.mUser.getCurrentBadge(user.id).then(currentBadge => {
        console.log('Badge Array: ', badgeArray);
        // allInputs.push({type: 'radio', label: 'None', value: 999, checked: currentBadge == 999 ? true : false})
        for (var i = 0; i < badgeArray.length; i++) {
          var thisBadge = this.get(badgeArray[i])
          if (badgeArray[i] != currentBadge) {
            allInputs.push({type: 'radio', label: thisBadge.name, value: thisBadge.id, checked: false});
          } else {
            allInputs.push({type: 'radio', label: thisBadge.name, value: thisBadge.id, checked: true});;
          }
        }

      let alert = this.alertCtrl.create({
        title: "Choose Active Badge",
        inputs: allInputs,
        buttons: [{
          text: 'OK',
          handler: data => {
            console.log(data)
            confirmFunc(currentBadge, data);
          }
      }]
    })
    alert.present();
  })
})

return def;
}  

  getPath(fileName) {
    return this.badgePath + fileName;
  }

  get(id) {
    return this.badges[id];
  }

}

@Injectable()
export class Aliases {

  constructor(public http: Http, public system: System, public alertCtrl: AlertController, public mUser: MoveUser) {
    console.log('Hello ProfileProvider Provider: Badges');
  }

  manage() {
    var def = new $.Deferred();
    var me = this;
    var user = this.mUser.getFB();
    this.system.appLoader();
    this.mUser.getAliases(user.id).then(aliases => {
      var aliasArray = this.system.getArrayFromObjProps(aliases, 'name')
      let confirmFunc = (oldAlias, newAlias) => {
        me.mUser.setCurrentAlias(user.id, newAlias).then(() => {
          if (oldAlias != newAlias) me.system.displayToast("You will now be known as " + newAlias + " when you host your next move.", 5000, false, 'ALIAS CHANGE');
        })
      }
      let allInputs = [];
      this.mUser.getCurrentAlias(user.id).then(currentAlias => {
        this.system.loader.dismiss();
        console.log('Alias Array: ', aliasArray);
        for (var i = 0; i < aliasArray.length; i++) {
          if (aliasArray[i] != currentAlias) {
            allInputs.push({type: 'radio', label: aliasArray[i], value: aliasArray[i], checked: false});
          } else {
            allInputs.push({type: 'radio', label: aliasArray[i], value: aliasArray[i], checked: true});;
          }
        }

      let alert = this.alertCtrl.create({
        title: "Choose Active Alias",
        inputs: allInputs,
        buttons: [{
          text: 'OK',
          handler: data => {
            console.log(data);
            confirmFunc(currentAlias, data);
            def.resolve(data);
          }
      }]
    })
    alert.present();
  })
})

return def;
}
}

