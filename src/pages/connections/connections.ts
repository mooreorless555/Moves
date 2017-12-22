import { Component, Input, trigger, style, animate, transition } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MoveUser } from '../../providers/login-provider';
import { NotificationProvider } from '../../providers/notification-provider';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ConnectionsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

declare var $: any;
declare var velocity: any;

@Component({
  selector: 'page-connections',
  templateUrl: 'connections.html',
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

export class ConnectionsPage {

  @Input()
  set ready(isReady: boolean) {
    if (isReady) console.log('DONE!!');
  }

  // conRef: any;
  // connectionsList: any;
  // lconnectionsList: any; // preloaded to reduce server calls
  // actualList: any;
  // actualListf: any;
  // random: number;
  // status = [];

  user: any;
  connections = [];
  connectionsList = [];
  connectionsListCache = [];
  statusList = [];
  loaded = true;
  searchTerm: string;
  searchControl: any;
  searching: any = true;
  loading: any = true;

  trackConnections = function(idx, obj) {
    return obj.id;
  }

  ui = {
    title: "Add Friends",
    info: {
      title: "YOUR FACEBOOK CONNECTIONS",
      status: {
        a: "SEND REQUEST",
        b: "REQUEST SENT",
        c: "FRIENDS"
      }
    }
  }

  

  ngAfterViewInit() {
    var me = this;
  }

  constructor(private navCtrl: NavController, private np: NotificationProvider, private navParams: NavParams, private mUser: MoveUser) {
    this.user = this.mUser.getFB();
    this.connections = this.mUser.getConnections();

    this.searchControl = new FormControl();

    let me = this;;
    let fn = function(con) {
      let def = new $.Deferred();
      me.mUser.getFriendsStatus(me.user.id, con.id)
      .then(status => {
        con.status = status;
        def.resolve(status);
      })
      return def;
    }
  setTimeout(() => {
    Promise.all(this.connections.map(fn)).then(data => {
          this.searching = false;
          this.connectionsListCache = this.connections;
          this.connectionsList = this.connectionsListCache;
          this.loading = false;
          $('ion-list').removeClass('invisible');
        })
  }, 10)
  }

  ionViewDidLoad() {
    
    this.setFilteredItems();

    this.searchControl.valueChanges.debounceTime(800).subscribe(search => {

      this.connectionsList = this.connectionsListCache;

      this.searching = false;
      this.setFilteredItems();
    })
  }

  filterItems(searchTerm) {
    return this.connectionsList.filter((item) => {
        return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }

  setFilteredItems() {
    this.searching = true;
    this.connectionsList = this.filterItems(this.searchTerm);
    this.searching = false;
  }

  onSearchInput() {
    this.searching = true;
  }

  sendFriendRequest(con) {
    try {
    this.mUser.sendFriendRequest(con.id).then(() => {
      var idx = this.connectionsList.findIndex(i => i.id === con.id);
      this.connectionsList[idx].status.requestSent = true;
      this.np.sendPushToUser(con.id, this.mUser.getFB().name + " sent you a friend request. Tap to open Moves.");
    })
    } catch (e) {
      
    }
  }
}
