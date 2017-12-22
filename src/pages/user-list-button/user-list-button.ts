import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import { MovesProvider } from '../../providers/moves-provider';
import { DatabaseProvider } from '../../providers/database-provider';
import { System } from '../functions/functions';

/**
 * Generated class for the UserListButtonPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-user-list-button',
  templateUrl: 'user-list-button.html',
  providers: [System]
})
export class UserListButtonPage {
 ui = {
    title: '---',
    subtitle: '------',
    addText: 'ADD',
    addedText: 'ADDED'
  }


  objList: any;
  objListToPopulate: any;
  list: any;
  listf: any;
  listToPopulate = [];

  closeMessage: string;
  updateDB: boolean;
  dBPath: string;

  searchItem: string;
  move: any;

  searchControl: any;
  searching: any = false;
  searchTerm: string = "";

  ngAfterViewInit() {
    this.mp.modalOn = true;
    this.introduceModal()
  }

  constructor(public navCtrl: NavController, public db: DatabaseProvider, public system: System, public viewCtrl: ViewController, public navParams: NavParams, public mp: MovesProvider) {
    console.log('WE GOT: ', navParams.get('list'))
    this.list = navParams.get('list')
    this.listf = this.list;
    this.objListToPopulate = navParams.get('objListToPopulate')
    this.listToPopulate = this.convertListToArray(this.objListToPopulate)
    this.ui.title = navParams.get('title')
    this.ui.subtitle = navParams.get('subtitle')
    this.ui.addText = navParams.get('addText');
    this.ui.addedText = navParams.get('addedText');
    this.closeMessage = navParams.get('closeMessage');
    this.move = navParams.get('move')
    this.updateDB = navParams.get('updateDB');
    this.dBPath = navParams.get('dBPath');

    if (!this.ui.addText) this.ui.addText = "ADD";
    if (!this.ui.addedText) this.ui.addedText = "ADDED";

    this.searchControl = new FormControl();


    console.log('List To Populate:', this.listToPopulate, 'Using list: ', this.list);

    if (this.list.length == 0) {
      this.ui.subtitle = 'No new friends :('
    }
}

  filterItems(searchTerm) {
    return this.list.filter((item) => {
        return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }

  setFilteredItems() {
    this.list = this.filterItems(this.searchTerm);
  }

  onSearchInput() {
    this.searching = true;
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserListButtonPage');
    $("*[id*=check]") // add invisible class to button
      .addClass('invisible')

    $("*[id*=remove]") // add invisible class to button
      .addClass('invisible')

    this.setFilteredItems();

    this.searchControl.valueChanges.debounceTime(2000).subscribe(search => {
      this.list = this.listf;
      this.searching = false;
      this.setFilteredItems();
    })
  }

  eventHandler(keyCode) {
    let ltp = this.listToPopulate
    let list = this.list
    let firstItem = list[0]
    console.log(ltp, list, firstItem)

    if (keyCode == 13) { // ENTER key has been pressed!
      if (firstItem) {
        if (this.isInList(ltp, firstItem, 'id')) {
          console.log('Attempting removal.')
          this.removeFromList(ltp, firstItem, 'id')
        } else {
          console.log('Attempting add!')
          this.addToList(ltp, firstItem);
        }
      }
    }

  }

  ionViewWillLeave() {
    this.closeModal();
  }

  closeModal() {
    this.mp.modalOn = false;
    console.log('Closing modal...')
    $("*[id*=userItem]")
      .find('button')
      .addClass('invisible')
    $("*[id*=userItem]")
      .addClass('invisible')
      
      if (this.listToPopulate.length > 0) { // only do the conversion if there is actually a list to convert
        this.objListToPopulate = this.convertArrayToList(this.listToPopulate, 'id');
      } else {
        this.objListToPopulate = null;
      }

      console.log('Array list to populate: ', this.listToPopulate)
      console.log('Obj list to populate: ', this.objListToPopulate)

      if (this.updateDB) {
        if (this.objListToPopulate) {
          this.db.set(this.objListToPopulate, this.dBPath).then(() => {
            if (this.closeMessage) {
              this.system.displayToast(this.closeMessage, 3000);
            }
            this.viewCtrl.dismiss(this.objListToPopulate);
          })
        } else {
          this.db.remove(this.dBPath)
          if (this.closeMessage) {
            this.system.displayToast(this.closeMessage, 3000);
          }
          this.viewCtrl.dismiss(this.objListToPopulate);
        }
      } else {
        if (this.closeMessage) {
          this.system.displayToast(this.closeMessage, 3000);
        }
        this.viewCtrl.dismiss(this.objListToPopulate)
      }
  }

  introduceModal() {
    $("*[id*=title]").velocity('transition.slideUpIn')
    setTimeout(() => {
      $("ion-list")
        .removeClass('invisible')
        .velocity({delay: 200}, 'transition.slideUpIn')

      setTimeout(() => {
        $("*[id*=check]") // remove invisible class from button
          .removeClass('invisible')

        $("*[id*=remove]") // remove invisible class from button
          .removeClass('invisible')

        $("*[id*=userItem]")
          .find('button')
          .removeClass('invisible')
          .velocity('transition.flipBounceXIn', {stagger: 80})


                
      }, 600)
    }, 200)

  }

  onInput(event) {
    // Reset items back to all of the items
    this.list = this.listf;

    // set q to the value of the searchbar
    var q = event.srcElement.value;


    // if the value is an empty string don't filter the items
    if (!q) {
      return;
    }

    this.list = this.list.filter((v) => {
      if (v.name && q) {
        if (v.name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  addToList(list, item) {
    if (!this.isInList(list, item)) {
      list.push(item);
      this.system.displayToast(`${item.name} to the list.`, null, false, 'ADDED', 'rgba(48,209,99,0.9)', null, null, '1');
      console.log('Added ' + item);   
      console.log('Current list: ', list);
    } else {
      this.system.displayToast(`${item.name} is already in the list.`);
    }
  }

  removeFromList(list, item, prop?: string) {
    var index = list.findIndex(function(value) {
      if (prop) {
        return value[prop] === item[prop];
      } else {
        return value === item;
      }
    });

    console.log('Current list: ', list);
    console.log("index is: ", index, "item is: ", item);

    if (index > -1) {
      list.splice(index, 1);
      console.log(item + " has been removed.");
      this.system.displayToast(`${item.name} from the list.`, null, false, 'REMOVED', null, null, null, '2');
    } else {
      console.log("Nothing to remove.");
    }
  }

  isInList(list, item, prop?: string) {
    var found;
    if (prop) {
      found = list.some(function(value) {
      return value[prop] === item[prop];
    });  
    } else {
      found = list.some(function(value) {
        return value === item;
      });  
    }

    return found;
  }

  getItemFromList(list, item) {
    // var found = list.find(function(value) {
    //   return value === item;
    // });  
    for (var val of list) {
      if (val == item) {
        return val;
      }
    }

    return null;
  }
}
