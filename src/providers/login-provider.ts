import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import { DatabaseProvider } from '../providers/database-provider';
import { Facebook } from '@ionic-native/facebook';
import 'rxjs/add/operator/map';

/*
  Generated class for the LoginProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class LoginProvider {

  public user: any;
  token: string;
  social_token: string;

  static get parameters() {
    return [[Http]];
  }

  constructor(public http: Http, public mUser: MoveUser, public navCtrl: NavController) {
  
    console.log('Hello LoginProvider Provider');
  }


  setUser(user) {
    this.user = user;
  }

  getUser() {
    let null_user = {
      uid: "999999999",
      displayName: "NULL_USER",
      email: "nobody@yale.edu"
    }
    if (!firebase.auth().currentUser) return null_user;
    return firebase.auth().currentUser;
  }

}

@Injectable()
export class MoveUser {

  subscription: any;
  friendRequestsListArr = [];

  numFriendRequests: number;

  null_user = {
    uid: "999999999",
    displayName: "NULL_USER",
    email: "nobody@yale.edu",
    info: {
      picture: {
        prof: "https://firebasestorage.googleapis.com/v0/b/moves-ad1b4.appspot.com/o/misc%2Fmac_profpic.png",
        square: "https://firebasestorage.googleapis.com/v0/b/moves-ad1b4.appspot.com/o/misc%2Fmac_profpic.png"
      }
    },
    photoURL: "https://firebasestorage.googleapis.com/v0/b/moves-ad1b4.appspot.com/o/misc%2Fmac_profpic.png",
    providerData: {
      isNull: true,
      id: "5678910202",
      name: "Mac Tosh",
      first_name: "Mac",
      friends: {
        data: [{name: "Alika Smith", id: '100000976637882'},
        {name: "Chris Moore", id: '1248413801916793'},
        {name: "Zachary Balleisen", id: '1858334444490693'},
        {name: "Gray Newfield", id: '954620861346899'},
        {name: "Alika Smith", id: '100000976637882'},
        {name: "Chris Moore", id: '1248413801916793'},
        {name: "Zachary Balleisen", id: '1858334444490693'},
        {name: "Gray Newfield", id: '954620861346899'},
        {name: "Alika Smith", id: '100000976637882'},
        {name: "Chris Moore", id: '1248413801916793'},
        {name: "Zachary Balleisen", id: '1858334444490693'},
        {name: "Gray Newfield", id: '954620861346899'},
        {name: "Chris Moore", id: '1248413801916793'},
        {name: "Zachary Balleisen", id: '1858334444490693'},
        {name: "Gray Newfield", id: '954620861346899'},
        {name: "Alika Smith", id: '100000976637882'},
        {name: "Chris Moore", id: '1248413801916793'},
        {name: "Zachary Balleisen", id: '1858334444490693'},
        {name: "Gray Newfield", id: '954620861346899'},
        {name: "Alika Smith", id: '100000976637882'},
        {name: "Chris Moore", id: '1248413801916793'},
        {name: "Zachary Balleisen", id: '1858334444490693'},
        {name: "Gray Newfield", id: '954620861346899'},        {name: "Chris Moore", id: '1248413801916793'},
        {name: "Zachary Balleisen", id: '1858334444490693'},
        {name: "Gray Newfield", id: '954620861346899'},
        {name: "Alika Smith", id: '100000976637882'},
        {name: "Chris Moore", id: '1248413801916793'},
        {name: "Zachary Balleisen", id: '1858334444490693'},
        {name: "Gray Newfield", id: '954620861346899'},
        {name: "Alika Smith", id: '100000976637882'},
        {name: "Chris Moore", id: '1248413801916793'},
        {name: "Zachary Balleisen", id: '1858334444490693'},
        {name: "Gray Newfield", id: '954620861346899'}      
      ]
      }
    },
    friends: {
      members: [],
      requests_recv: [],
      requests_sent: []
    },
    status: {
      move: '-1'
    }
  }

  public user: any = {}
  public providerData: any;


/***************************
 * MOVE USER
 * Contains all data necessary to
 * edit, create and manipulate user data.
 * 
 * - Chris Moore
 */
  constructor(public facebook: Facebook, public db: DatabaseProvider) {

  var firebaseConfig = {
      apiKey: "AIzaSyANmdr_oNcjak8eVKUI7esAoyk4mtWKD-M",
      authDomain: "moves-ad1b4.firebaseapp.com",
      databaseURL: "https://moves-ad1b4.firebaseio.com",
      projectId: "moves-ad1b4",
      storageBucket: "moves-ad1b4.appspot.com",
      messagingSenderId: "583373480587"
    };

  firebase.initializeApp(firebaseConfig)
    let fbid = this.getFB().id
    this.getFriendRequests(fbid)
    // this.getFriendsListArr(fbid)
  }

  initUser(success, token, updatedVal, email) {
    let user = this.getFB()
    let userInfo = {
      id: success[1].id,
      name: success[1].name,
      email: email,
      badges:{
        999: {
          id: '999',
          name: 'None'
        }
      },
      aliases: {
        original: {
          name: success[1].name
        }
      },
      first_name: success[1].first_name,
      currentAlias: success[1].name,
      currentBadge: '999',
      friends: {
        members: [],
        requests_recv: [],
        requests_sent: []
      },
      info: {
        dateJoined: new Date().getTime(),
        picture: {
          prof: 'https://graph.facebook.com/' + success[1].id + '/picture?height=400',
          square: 'https://graph.facebook.com/' + success[1].id + '/picture?type=square'
        }
      },
      profile: {
        bio: "Hey, I'm " + success[1].first_name + "."
      },
      userStatus: {
        banned: false
      },
      facebook: {
        token: token,
        updated: updatedVal
      }
    }

    let def = new $.Deferred()

    /* Initialize user in the database. */
    let ref = firebase.database().ref('userData/' + success[1].id)
    ref.once('value', snap => {
      console.log("THE SNAP IS: ", snap.key, user.id, snap.numChildren())
      let num = snap.numChildren()
      if (num == 0) {
        // alert('User does not yet exist. Initializing...')
        ref.set(userInfo)
          .then(() => {
            console.log('User initialized.')
            userInfo["uid"] = this.get().uid;
            def.resolve([userInfo, true])})
          .catch((e) => console.log('User not initalized: ', e))
      } else {
        // alert('User already exists.')
        def.resolve([userInfo, false])
      }
    })

    /* Add user's email to the panlist */
    this.db.get('value', 'website/panlist/').then(emails => {
      var userEmail = email;
      if (!contains(userEmail, emails, 'email')) {
        this.db.push({email: userEmail},'website/panlist/');
      }
    })

    return def;
  }

  getFBData() {
    var def = new $.Deferred();
    this.getUser(this.getFB().id)
    .then(userData => {
      def.resolve(userData.facebook);
    })

    return def;
  }

  updateFBData(object) {
    return this.db.insert({facebook: object}, '/userData/'+this.getFB().id+'/');
  }

  updateConnections() {
    var def = new $.Deferred();
    this.facebook.api('/me?fields=friends.limit(300)', []).then(connections => {
      this.getFB().friends.data = connections.friends.data;
      def.resolve(connections);
    }).catch(e => {
      console.log('Null user.');
      alert("Oh god. An error...: " + e);
      def.reject(e);
    })

    return def;
  }
  

  get() {
    if (!firebase.auth().currentUser) return this.null_user;
    return firebase.auth().currentUser;
  }

  getUserData(fbid) {
    return firebase.database().ref('userData/').orderByKey().equalTo(fbid)
  }

  getUser(fbid) {
    return this.db.get('value', '/userData/'+fbid);
  }

  getPhoto(fbid) {
    if (fbid == '5678910202') {
      return {
        prof: "https://firebasestorage.googleapis.com/v0/b/moves-ad1b4.appspot.com/o/misc%2Fmac_profpic.png?alt=media&token=afc4edf8-974e-43ae-9eb1-e8de2514a9c3",
        square: "https://firebasestorage.googleapis.com/v0/b/moves-ad1b4.appspot.com/o/misc%2Fmac_profipic_small.png?alt=media&token=d3d23701-4ba5-4db6-923b-57f25b8e2058"
      }
    }
    let res = {
      prof: 'https://graph.facebook.com/' + fbid + '/picture?height=400',
      square: 'https://graph.facebook.com/' + fbid + '/picture?type=square'
    }
    return res;
  }

  getFB() {
    if (!firebase.auth().currentUser) return this.null_user.providerData;
    return this.providerData[1];
  }

  setFB(info) {
    this.providerData = info;
  }

  getConnectionsCount() {
    if (!this.getFB().friends.data.length) return this.null_user.providerData.friends.data.length;
    return this.getFB().friends.data.length;
  }

  getConnections() {
    if (!this.getFB().friends.data) return this.null_user.providerData.friends.data;
    return this.getFB().friends.data;
  }


  isConnection(fbid) {
    var friendlist = this.getConnections()
    var len = friendlist.length;
    for (let i = 0; i < len; i++) {
      if (fbid == friendlist[i].id && friendlist[i].id != this.getFB().id) {
        return true;
      }
    }
    return false;
  }

  getConnectionByID(fbid) {
    var friendlist = this.getConnections()
    var len = friendlist.length;
    console.log('Friends list: ', friendlist)
    for (let i = 0; i < len; i++) {
      if (fbid == friendlist[i].id) {
        return friendlist[i];
      }
    }
    return null;
  }

  getFriendByID(fbid) {
    let user = this.getFB()
    let friend= firebase.database().ref('userData/'+user.id+'/friends/members').orderByKey().equalTo(fbid)
    return friend;
  }

  getFriends() {
    let user = this.getFB()
    let ref = firebase.database().ref('userData/'+user.id+'/friends/members')
    return ref;
  }

  isFriend(fbid) {
    let ref = this.getFriends().orderByKey().equalTo(fbid);
    console.log("isFriend (ref): ", fbid, ref)
    return ref;
  }

  getFriendsStatus(yourId, fbid) : Promise<any> {
    let def = new $.Deferred();
    let results = {
      friends: false, // whether you two are friends
      requestSent: false, // whether YOU have SENT request to them
      requestRecv: false
    }
    this.db.get('value', '/userData/'+yourId+'/friends/members').then(members => {
      results.friends = contains(fbid, members, 'id');

      this.db.get('value', '/userData/'+fbid+'/friends/requests_recv').then(requestsRecv => {
        results.requestRecv = contains(yourId, requestsRecv, 'id');

          this.db.get('value', '/userData/'+yourId+'/friends/requests_sent').then(requestsSent => {
            results.requestSent = contains(fbid, requestsSent, 'id');
            def.resolve(results);
          })
      })

    })

    return def;
  }

  isPending(fbid) {
    let user = this.getFB()
    let ref = firebase.database().ref('userData/'+user.id+'/friends/requests_sent').orderByKey().equalTo(fbid)
    return ref;
  }

  sentFriendRequestTo(fbid) {
    let user = this.getFB();
    let def = new $.Deferred();
    let ref = firebase.database().ref('/userData/'+user.id+'/friends/requests_sent/'+fbid);
    ref.once('value', snapshot => {
        def.resolve(fbid == snapshot.val().id)
    })
    
    return def;
  }



  acceptFriend(fbid) {
    let def = new $.Deferred();
    let user = this.getFB()
    let friend = this.getConnectionByID(fbid)
    let refYou = this.getUserData(user.id)
    let refYou_rem = firebase.database().ref('userData/'+user.id).child('friends').child('requests_recv').child(fbid)
    let refThem = this.getUserData(fbid)
    let refThem_rem = firebase.database().ref('userData/'+fbid).child('friends').child('requests_sent').child(user.id)
    
    /* Remove sent friend request */
    refYou_rem.on('child_added', snap => {
      snap.ref.remove().then(() => refYou_rem.off())
    })

    /* Remove received friend request */
    refThem_rem.on('child_added', snap => {
      snap.ref.remove().then(() => refThem_rem.off())
    })

    /* Make them YOUR friend */
    refYou.once('child_added', snap => {
      snap.ref.child('friends').child('members').child(friend.id).update({id: friend.id, name: friend.name})
      def.resolve();
    })
    /* Make you THEIR friend */
    refThem.once('child_added', snap => {
      snap.ref.child('friends').child('members').child(user.id).update({id: user.id, name: user.name})
    })

    // Yay all cleaned up and you're friends!
    return def;
  }

  sendFriendRequest(fbid, memberInfo?:any) : Promise<any> {
      console.log('Sending friend request...');
      let def = new $.Deferred();
      let user = this.getFB()
    if (!memberInfo) {
      let member = this.getConnectionByID(fbid)
      if (!member) member = {id: '1248413801916793', name: 'Fake Chris'}
      console.log("User " + user.id + " sending request to User " + fbid)
      
      let refYou = this.getUserData(user.id)
      refYou.once('child_added', snap => {
        snap.ref.child('friends').child('requests_sent').child(fbid).update({id: member.id, name: member.name})
      })

      let refThem = this.getUserData(fbid)
      refThem.once('child_added', snap => {
        snap.ref.child('friends').child('requests_recv').child(user.id).update({id: user.id, name: user.name})
        def.resolve();
      })
    } else {
      console.log('Overriding logic for only accepting connections. Here we go!');
      console.log("User " + user.id + " sending request to User " + fbid)
      this.db.insert(memberInfo, '/userData/'+user.id+'/friends/requests_sent/'+fbid)
      this.db.insert({id: user.id, name: user.name}, '/userData/'+fbid+'/friends/requests_recv/'+user.id).then(result => {
        def.resolve(result)
      })
    }
      return def;
  }

  receiveFriendRequest(from) {
    let sender = this.getConnectionByID(from);
    let recipient = this.getFB()
    let refYou = this.getUserData(from)
    refYou.once('child_added', snap => {
      snap.ref.child('friends').child('requests_sent').child(recipient.id).update({id: recipient.id, name: recipient.name})
    })

    let refThem = this.getUserData(recipient.id)
    refThem.once('child_added', snap => {
      snap.ref.child('friends').child('requests_recv').child(sender.id).update({id: sender.id, name: "(TEST) " + sender.name})
    })   
  }

  // getFriendRequests(fbid) {
  //   let subscription;
  //   this.numFriendRequests = 0;
  //   this.subscription = this.af.list('/userData/'+fbid+'/friends/requests_recv/')
  //     .subscribe(data => {
  //       this.friendRequestsListArr = data;
  //       this.numFriendRequests = data.length;
  //     })
  // }

  async getFriendRequests(fbid) {
    try {
      let friendRequests = await this.db.get('array', `/userData/${fbid}/friends/requests_recv`);
      console.log('FRIENDS ARE', friendRequests)
      this.friendRequestsListArr = friendRequests;
      this.numFriendRequests = this.friendRequestsListArr.length
    } catch (e) {
      //
    }
  }

  // getFriendsList(fbid) {
  //   this.friendsList = this.af.list('/userData/'+fbid+'/friends/members/')
  //   this.subscription = this.friendsList.subscribe().unsubscribe()    
  // }

  getFriendsListArr(fbid) {
    return this.db.get('array', '/userData/'+fbid+'/friends/members/')
  }

  removeFriend(fbid) {
    let user = this.getFB();
    let userLoc = '/userData/'+fbid+'/friends/members/'+user.id;
    let friendLoc = '/userData/'+user.id+'/friends/members/'+fbid;
    this.db.remove(userLoc);
    return this.db.remove(friendLoc);
  }

  addAlias(fbid, aliasName) {
    let aliasObject = {
      name: aliasName
    }
    return this.db.push(aliasObject, '/userData/'+fbid+'/aliases/');
  }

  removeAlias(fbid, aliasName) {
    this.db.get('value', '/userData/'+fbid+'/aliases/').then(aliases => {
      for (let key in aliases) {
        if (aliases[key].name == aliasName) {
          this.db.remove('/userData/'+fbid+'/aliases/'+key)
          return true;
        }
      }
      return false;
    })
  }

  getAliases(fbid) {
    let def = new $.Deferred();
    this.db.get('value', '/userData/'+fbid+'/aliases/').then(aliases => {  
       def.resolve(aliases);
    });

    return def;
  }

  getCurrentAlias(fbid) {
    let def = new $.Deferred();
    this.db.get('value', '/userData/'+fbid+'/currentAlias').then(alias => {  
       def.resolve(alias);
    });

    return def;
  }

  setCurrentAlias(fbid, newAlias) {
    return this.db.insert({currentAlias: newAlias}, '/userData/'+fbid)
  }

  addBadge(fbid, badgeId) {
    let badgeObject = {
      id: badgeId
    }
    return this.db.insert(badgeObject, '/userData/'+fbid+'/badges/'+badgeId);
  }

  removeBadge(fbid, badgeId) {
    this.db.get('value', '/userData/'+fbid+'/badges/').then(aliases => {
      for (let key in aliases) {
        if (key == badgeId) {
          this.db.remove('/userData/'+fbid+'/badges/'+key)
          return true;
        }
      }
    })
  }

  addBadgeToAlias(fbid, aliasName, badgeId) {
    let badgeObject = {
      id: badgeId
    }

    this.db.get('value', '/userData/'+fbid+'/aliases/').then(aliases => {
          for (let key in aliases) {
            if (aliases[key].name == aliasName) {
              return this.db.insert(badgeObject, '/userData/'+fbid+'/aliases/'+key+'/badges/'+badgeId); 
            }
          }
        })    
  }

  removeBadgeFromAlias(fbid, aliasName, badgeId) {
    this.db.get('value', '/userData/'+fbid+'/aliases/').then(aliases => {
          for (let aliasKey in aliases) {
            if (aliases[aliasKey].name == aliasName) {
              let badgePath = aliases[aliasKey];
              for (let badgeKey in badgePath) {
                if (badgeKey == badgeId) {
                  this.db.remove('/userData/'+fbid+'/aliases/'+aliasKey+'/badges/'+badgeId); 
                  return true;
                }
              }
            }
        }
    })    
  }  

  getBadges(fbid) {
    return this.db.get('value', '/userData/'+fbid+'/badges/');
  } 

  getCurrentBadge(fbid) {
    let def = new $.Deferred();
    this.db.get('value', '/userData/'+fbid+'/currentBadge').then(badge => {  
       def.resolve(badge);
    });

    return def;
  }

  getTokens(fbid) {
    return this.db.get('value', '/userData/'+fbid+'/tokens/');
  }

  getToken(fbid, api) {
    return this.db.get('value', '/userData/'+fbid+'/tokens/api'); 
  }

  updateToken(fbid, api, token) {
    return this.db.insert({[api]: token}, '/userData/'+fbid+'/tokens/');
  }

  removeToken(fbid, api) {
    return this.db.remove('/userData/'+fbid+'/tokens/api');
  }

  setCurrentBadge(fbid, newBadge) {
    return this.db.insert({currentBadge: newBadge}, '/userData/'+fbid)
  }


  getProfileData(fbid) {
    return this.db.get('value', '/userData/'+fbid+'/profile/');
  }

  setProfileData(object, fbid) {
    return this.db.insert(object, '/userData/'+fbid+'/profile/')
  }

  isAdmin() {
    let you = this.getFB();
    let acceptedIDs = ['5678910202', '1248413801916793']
    return acceptedIDs.some(value => {
      return value == you.id
    });
  }

  async getUserByName(name) {
    let def = new $.Deferred();
    let user = null;
    firebase.database().ref('userData/').orderByChild('name').equalTo(name).once('value', snap => {
      for (let data in snap.val()) {
        user = snap.val()[data];
      }

      def.resolve(user);
    })

    return def;

  }

  signOut() {
    return firebase.auth().signOut()
  }
}


function contains(item:any, obj:any, prop?:string): boolean {
  console.log('Executing contains()\r\n\r\nLooking for '+item+' under '+prop+' property in the object: ', obj)
  for (var e in obj) {
    if (prop) {
      console.log(obj[e][prop], item)
      if (obj[e][prop] == item) {
        return true;
      }
    } else {
      if (obj[e] == item) {
        return true;
      }      
    }
  }
  return false;
}