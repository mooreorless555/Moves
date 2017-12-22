import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ListPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage {

  move: any;
  guests_original = [];
  guests_filtered = [];

  searchTerm: string;
  searchControl: any;
  searching: any = true;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.move = navParams.get("move");
    
    this.searchControl = new FormControl();

    
    for (let key in this.move.info.guests) {
      this.guests_original.push(this.move.info.guests[key]);
    }
    
    this.guests_filtered = this.guests_original;
  
  }

  

  ionViewDidLoad() {
    console.log('ionViewDidLoad ListPage');
    this.initSearch();
  }

  setFilteredItems() {
    this.searching = true;
    this.guests_filtered = this.filterItems(this.searchTerm);
    this.searching = false;
  }

  filterItems(searchTerm) {
    return this.guests_filtered.filter((item) => {
        return item.name.toLowerCase().indexOf((searchTerm || "").toLowerCase()) > -1;
    });
  }

  initSearch() {
    
  this.setFilteredItems();
  
      this.searchControl.valueChanges.debounceTime(800).subscribe(search => {
        this.guests_filtered = this.guests_original;
  
        this.searching = false;
        this.setFilteredItems();
      })
    }
  
  
  
    onSearchInput() {
      this.searching = true;
    }

}
