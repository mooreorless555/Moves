/* This is the main functions file. It contains ubiquitous functions such as toast displays,
alert/input controls, etc.. */



import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Platform, AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { StatsProvider } from '../../providers/stats-provider';
import { EmailProvider } from '../../providers/email-provider';
import { Keyboard } from '@ionic-native/keyboard';

// import { LoginProvider } from '../../providers/login-provider';
import swal from 'sweetalert2';

declare var ProgressBar: any;


@Injectable()
export class System {
  
  public checked = 0;
  public moves = [];
  public loader: any;
  public toast: any;
  public animating: boolean = false;

  // public progbars = new Array();

  public currentdate = this.showDate();
  public currentday = this.showDay();

  public stat_updates = null;

  constructor(public platform: Platform,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public stat: StatsProvider,
    public ep: EmailProvider,
    public keyboard: Keyboard) {

      // Initialize iziToast defaults
      // iziToast.settings({
      //     timeout: 10000,
      //     resetOnHover: true,
      //     icon: 'material-icons',
      //     transitionIn: 'flipInX',
      //     transitionOut: 'flipOutX',
      //     onOpening: function(){
      //         console.log('callback abriu!');
      //     },
      //     onClosing: function(){
      //         console.log("callback fechou!");
      //     }
      // });

  }

  dismissKeyboard() {
    this.keyboard.close();
  }

  async updateHTML(selector: string, animateOut: any, newText: string) {
    var def = new $.Deferred();
    var oldText = $(selector).html();
      $(selector).removeClass('invisible');
      if (oldText != newText) {
        $(selector).animate({opacity: 0}, 400, function(){
          $(this).html(newText).velocity(animateOut);
          def.resolve(true); 
        })
      } else {
        $(this).html(newText);
        def.resolve(true);
      }

    return def;

  }

  /**
   * Displays a toast notification at the bottom of the screen.
   * @param {string} msg Message to be displayed in the notification.
   * @param {number} duration Number of milliseconds (ms) for the notification to be displayed.
   * @param {string} type Optional argument, change type of notification to be displayed: 'success', 'error'
   */
  showNotification(msg, duration, type?: string) {
    if (type == "error") {
      this.toast = iziToast.error({
        title: 'INVALID',
        toastOnce: true,
        timeout: 10000,
        message: msg
      })
  } else {
    this.toast = iziToast.show({
            title: 'NOTICE',
            toastOnce: true,
            timeout: duration,
            message: msg,
      });
  }
  }

  isAdmin(fbid) {
    let adminList = ['5678910202', '1248413801916793', '1817826131561673', '954620861346899']
    for (let id of adminList) {
      if (id == fbid) {
        return true;
      }
    }
    return false;
  }

  displayToast(message: string, customDuration?: number, dismissByOk?: boolean, title?: string, bgColor?: string, type?: string, pictureIcon?: string, id?: string) {
    if (!customDuration) customDuration = message.length * 60;
    // if (this.toast) this.toast.dismiss();
    // this.toast = this.toastCtrl.create({
    //   message: message,
    //   showCloseButton: dismissByOk ? true : false,
    //   closeButtonText: "GOT IT",
    //   duration: dismissByOk ? 9999999 : customDuration,
    //   cssClass: dismissByOk ? 'my-pre-toast' : 'my-toast'
    // });
    // this.toast.present();   
    if (type == 'success') {
      this.toast = iziToast.success({
        id: id || null,
        image: pictureIcon || null,
        title: title.toUpperCase() || 'SUCCESS',
        toastOnce: true,
        timeout: customDuration,
        message: `<b>${message}</b>`,
    });
    } else {
    this.toast = iziToast.show({
        id: id || null,
        image: pictureIcon || null,
        title: title.toUpperCase() || 'NOTICE',
        theme: 'dark',
        backgroundColor: bgColor || 'rgba(30,30,30,0.9)',
        toastOnce: true,
        timeout: customDuration,
        message: `<b>${message}</b>`,
    });
    }
  }

  displayNewToast(message: string) {
    iziToast.show({
        title: 'MESSAGE',
        message: message,
    });
  }

  displayError(message: string, title?: string) {
    this.displayToast(message, 4000, null, title || "ERROR", null, 'error', null, '1');
  }

  /**
   * Sorts an array (by default in descending order) based on the values/length of the designated object property.
   * @param {Array<any>} array Array to be sorted.
   * @param {string} objProps The object property to be organized
   * @param {string} order Optional, type false for 'descending' and true for 'ascending'
   */
  sortArray(array: Array<any>, objProps: string, order?: boolean) : Array<any> {
    let me = this
    let objPropsArr = objProps.split('.')
    console.log('objPropsArr: ', objPropsArr)

    array.sort(function(a, b) {
      for (let objProp of objPropsArr) {
        console.log('Current objProp: ' + objProp)
        a = a[objProp]
        b = b[objProp]
        console.log('a is now: ' + a, 'b is now: ' + b)
      }

      if (typeof a === 'number') {
        if (order) return a - b
        return b - a
      } else {
        if (order) return me.getObjectLength(a) - me.getObjectLength(b)
        return me.getObjectLength(b) - me.getObjectLength(a)
      }

    });   
    console.log("Sorted array:", array)
    return array
  }



  filterArray(array: Array<any>, attr: Array<string>, val: any) : Array<any> {

    let filteredArray = [];

    for (let parse of attr) {
      let attrParse = parse.split(".");
      filteredArray = array.filter(function(el) {
        for (let attribute of attrParse) {
          el = el[attribute];
        }
        return el === val;
      })
    }



    console.log('Filtered Array:', filteredArray)
    return filteredArray;
  }

  startLoading(msg, duration) {
    let loader = this.loadingCtrl.create({
      spinner: 'hide',
      content: '<div class="centertext"><img class="custom-spinner" src="assets/img/test_stroke_animated.svg"/><br>' + msg + '</div>',
      duration: duration,
      cssClass: 'my-loader'
    });
    loader.present();
  }

  appLoader(msg?: string) {
    if (!msg) msg = ''
    this.loader = this.loadingCtrl.create({
      spinner: 'hide',
      content: '<div id="loadspinner" class="centertext"><div class="new-spinner"></div><br>' + msg + '</div>',
      duration: 999999,
      cssClass: 'my-loader'
    });
    this.loader.present();
  }

  versionAlert(msg, title?: string, btn?: string) {
    if (!title) title = '';
    if (!btn) btn = 'OK'
    let alert = this.alertCtrl.create({
      title: title,
      message: msg,
      buttons: [
        {
          text: btn,
          role: 'cancel',
          handler: data => {
            this.platform.exitApp()
          }
        }]
    })
    alert.present()
  }
  /**
   * Displays a single alert modal dialog box
   * @param {string} msg Message to display to the user
   * @param {string} title (Optional) Title text for the dialog box.
   * @param {string} btn (Optional) Button text for the dialog box - default is "OK"
   * @param {any} func (Optional) Function to call upon the user pressing OK
   */
  simpleAlert(msg, title?: string, btn?: string, func?: any, allowOutsideClick?: boolean) {

    if (!title) title = '';
    if (!btn) btn = 'OK'
    if (allowOutsideClick == undefined) allowOutsideClick = true;
    
    swal({
      title: title,
      html: msg,
      showCloseButton: false,
      showConfirmButton: true,
      confirmButtonText: btn,
      confirmButtonColor: '#886FE8',
      allowOutsideClick: allowOutsideClick
    }).then(data => {
      if (func) func()
    });
  }

  /**
   * Displays a single Yes-No modal dialog box
   * @param {string} msg Message to display to the user
   * @param {any} yesFunc (Optional) Function to call upon the user pressing Yes
   * @param {any} noFunc (Optional) Function to call upon the user pressing No
   * @param {string} yesBtn (Optional) Yes button text for the dialog box - default is "Yes"
   * @param {string} noBtn (Optional) No button text for the dialog box - default is "No"
   * @param {string} title (Optional) Title text for the dialog box.
   */
  simpleYesNo(msg: string, yesFunc: any, noFunc: any, yesBtn?: string, noBtn?: string, title?: string) {
    if (!title) title = ''
    if (!yesBtn) yesBtn = "Yes"
    if (!noBtn) noBtn = "No"

    swal({
      title: title,
      html: msg,
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: noBtn,
      cancelButtonColor: '#db3f44',
      confirmButtonText: yesBtn,
      confirmButtonColor: '#886FE8',
      allowOutsideClick: true
    }).then(function () {
      if (yesFunc) yesFunc()
}, function (dismiss) {
  // dismiss can be 'cancel', 'overlay',
  // 'close', and 'timer'
  if (dismiss === 'cancel') {
    if (noFunc) noFunc()
  }
})
  }
  /**
   * Displays a single input modal dialog box.
   * @param {string} msg Message to display to the user
   * @param {string} confirmBtn (Optional) Confirm button text - default is "OK"
   * @param {string} title (Optional) Title text for the dialog box.
   * @param {string} placeholder (Optional) Placeholder text inside the input field.
   * @param {string} value (Optional) Initial value already inside the input field when the dialog box opens.
   */
  simpleInput(msg: string, confirmBtn?: string, title?: string, placeholder?: string, value?: string, dismissByOk?: boolean) : Promise<any> {
    var def = $.Deferred()
    if (!title) title = ''
    if (!value) value = ''
    if (!confirmBtn) confirmBtn = 'Confirm'
    if (!placeholder) placeholder = 'Type here...'

  swal.setDefaults({
    input: 'text',
    inputValue: value,
    inputPlaceholder: placeholder,
    inputAttributes: {
      'autocomplete': 'true',
      'autocorrect': 'on'
    },
    confirmButtonText: confirmBtn,
    confirmButtonColor: '#886FE8',
    allowEnterKey: true,
    showCancelButton: dismissByOk ? true : false,
    allowOutsideClick: dismissByOk || true,
    animation: true
  })

  var steps = [
    {
      title: title,
      html: '<span id="simple-input">'+msg+'</span>'
    },
  ]

  var me = this; 
  swal.queue(steps).then(function (result) {
    swal.resetDefaults()
    console.log('END RESULT: ', result[0])
    me.dismissKeyboard();
    def.resolve(result[0])
  }, function () {
    swal.resetDefaults()
  })

    return def;
  }

  async easyInput(msg: string, confirmBtn?: string, title?: string, placeholder?: string, value?: string, dismissByOk?: boolean, inputValFunc?: any, inputType?: any) {
    if (!inputValFunc) 
      inputValFunc = function(value) {
        return new Promise(function (resolve, reject) { 
          if (value) {
            resolve() 
          } else {
            reject("Please enter something in the space above.")
          }
          })
      }

    let result = await swal({
      title: title || "",
      html: msg || "",
      input: inputType || 'text',
      inputValue: value || '',
      inputPlaceholder: placeholder || '',
      inputAttributes: {
        'autocomplete': 'true',
        'autocorrect': 'on'
      },
      confirmButtonText: confirmBtn || 'OK',
      confirmButtonColor: '#886FE8',
      allowEnterKey: true,
      showCancelButton: dismissByOk ? true : false,
      allowOutsideClick: dismissByOk || true,
      animation: true,
      inputValidator: inputValFunc
  })

  return result;

  }

  /**
   * Displays multi/chained input modal dialog boxes.
   * @param {any} info SweetAlert2 step info...refer to swal2 documentation
   */
  multiInput(info: any) {
    var def = $.Deferred()

    let progSteps = []
    for (let i = 0; i < info.length; i++) {
      progSteps.push(i + '')
    }

  swal.setDefaults({
    input: 'textarea',
    inputValue: '',
    confirmButtonText: '',
    confirmButtonColor: '#886FE8',
    showCancelButton: false,
    allowOutsideClick: true,
    allowEnterKey: true,
    animation: true,
    // progressSteps: progSteps
  })

  var steps = info
  var me = this;

  swal.queue(steps).then(function (result) {
    swal.resetDefaults()
    console.log('END RESULT: ', result)
    me.keyboard.close();
    def.resolve(result)
  }, function () {
    swal.resetDefaults()
  })
    return def;
  }

  simpleSelectInput(json: any, placeholder?: string, msg?: string, title?: string) {
    if (!title) title = "Select";
    if (!msg) msg = "";
    swal({
  title: 'Select Ukraine',
  input: 'select',
  inputOptions: json,
  inputPlaceholder: 'Select country',
  showCancelButton: true
}).then(function (result) {
  swal({
    type: 'success',
    html: 'You selected: ' + result
  })
})
  }


  /**
   * Welcomes the user with an alert box when they sign up!
   * @param {String} name The name of the user who signed up.
   */
  welcomeUser(name) {
    swal({
      title: 'All signed up!',
      type: 'success',
      text: 'Welcome aboard, ' + name + '!',
      showCloseButton: false,
      showConfirmButton: true,
      confirmButtonText: 'Sweet',
      confirmButtonColor: '#886FE8',
      allowOutsideClick: false
    });
  }

  logOutBox(func) {
    let ask = this.alertCtrl.create({
      title: 'Confirm',
      message: "Are you sure want to sign out?",
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: data => {
            func();
          }
        }
      ]
    });

    ask.present();
    
  }

  updateStatsBars(move, progbar, funstatbar, mehstatbar, deadstatbar) {

    try {
      console.log("Updating Stats Bars");
      let value = move.stats.people / move.info.capacity;
      let capacity = move.info.capacity;
      var funbarperc;
      var mehbarperc;
      var deadbarperc;
      funbarperc = move.stats.fun / capacity;
      mehbarperc = move.stats.meh / capacity;
      deadbarperc = move.stats.dead / capacity;

      progbar.animate(value);
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
    } catch (err) {
      console.log('Cannot animate length error.');
    }
  }


  getFriendsScreen(move, friendsAtMove) {
    var msg = 'Friends Here';
    var ratingBtns = "These friends are currently at " + move.info.name + ".</span><br><br>" +
      "<ion-list><ion-item no-lines *ngFor='let friend of friendsAtMove'>" +
      "<user-item [user]='friend'></user-item>" +
      "</ion-item></ion-list>";
    swal({
      title: msg,
      html: ratingBtns,
      showCloseButton: true,
      showConfirmButton: false,
      allowOutsideClick: false
    }).then(function () {
      console.log('Okay..');
    }, function (dismiss) {
      // dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer' 
      if (dismiss === 'cancel') {
        swal.close();
      }
    })
  }

  deleteMove(move) {
    this.startLoading('Deleting move, standby...', 1000);
    setTimeout(() => {
      this.checked = 0;
      this.stat.ResetCounters();
      this.showNotification('Move has been deleted.', 1000);
    }, 1000);
  }

  sortDescending(data_A, data_B) {
    return ((data_B.stats.people / data_B.info.capacity) - (data_A.stats.people / data_A.info.capacity));
  }

  getObjectLength(my_object: any): number {
    var len = 0;
    for (var o in my_object) {
      len++;
    }
    return len;
  }

  showDay() {
    var d = new Date();
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var message = days[d.getDay()] + " " + this.getTimeOfDay()
    return message;
  }

  showDate() {
    var d = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var message = months[d.getMonth()] + " " + this.getDateRight() + ", " + d.getFullYear();
    return message;
  }

  getDateRight() {
    var d = new Date();
    var date = d.getDate().toString();
    var nDate = d.getDate();
    var result;
    if (nDate > 9 && nDate < 14) {
      result = date + "th";
    } else if (date.endsWith('1')) {
      result = date + "st";
    } else if (date.endsWith('2')) {
      result = date + "nd";
    } else if (date.endsWith('3')) {
      result = date + "rd";
    } else {
      result = date + "th";
    }
    return result;
  }

  getTimeOfDay() {
    var d = new Date();
    var time = d.getHours();
    var result;
    if (time >= 0 && time < 12) {
      result = "morning";
    } else if (time >= 12 && time < 18) {
      result = "afternoon";
    } else if (time >= 18 && time < 21) {
      result = "evening";
    } else {
      result = "night";
    }
    return result;
  }

  getClockTime(date?: any) {
    var d = date ? date : new Date()
    var hour = d.getHours()
    var minute = ('0' + d.getMinutes()).slice(-2) 
    var tod = "am"
    var time = '0:00am'

    if (hour != hour % 12) {
      hour = hour % 12
      tod = "pm"
    }

    if (hour == 0) {
      hour = 12
    }

    time = hour + ':' + minute + tod
    return time;
  }

  getTimeStamp() {
    var d = new Date()
    return d;
  }

  getTime() {
    var d = new Date()
    return d.getTime()
  }

  getTimeSince(oldTime) {
    // Snippet hijacked from https://www.w3schools.com/jsref/jsref_gettime.asp
    var seconds = 1000;
    var minutes = seconds * 60;
    var hours = minutes * 60;
    var days = hours * 24;
    var years = days * 365;
    var d = new Date();
    var t = d.getTime()
    // end of snippet

    var timeElapsed = t - oldTime;
    var timeString = "";

    if (timeElapsed > years) {
      timeString = Math.round(timeElapsed / years) + " year(s) ago";
    } else if (timeElapsed > days) {
      timeString = Math.round(timeElapsed / days) + "d ago";
    } else if (timeElapsed > hours) {
      timeString = Math.round(timeElapsed / hours) + "h ago";
    } else if (timeElapsed > minutes) {
      timeString = Math.round(timeElapsed / minutes) + "m ago";
    } else if (timeElapsed > (10 * seconds)) {
      timeString = Math.round(timeElapsed / seconds) + "s ago";
    } else {
      timeString = "just now";
    }

    return timeString;
  }

  getTimeUntil(newTime) {
    // Snippet hijacked from https://www.w3schools.com/jsref/jsref_gettime.asp
    var seconds = 1000;
    var minutes = seconds * 60;
    var hours = minutes * 60;
    var days = hours * 24;
    var years = days * 365;
    var d = new Date();
    var t = d.getTime()
    // end of snippet

    var timeElapsed = newTime - t;
    var timeString = "";

    if (timeElapsed > years) {
      timeString = Math.round(timeElapsed / years) + " year(s)";
    } else if (timeElapsed > days) {
      timeString = Math.round(timeElapsed / days) + "d";
    } else if (timeElapsed > hours) {
      timeString = Math.round(timeElapsed / hours) + "h";
    } else if (timeElapsed > minutes) {
      timeString = Math.round(timeElapsed / minutes) + "m";
    } else if (timeElapsed > (10 * seconds)) {
      timeString = Math.round(timeElapsed / seconds) + "s";
    } else {
      timeString = "right now";
    }

    return timeString;
  }

  getMSTimeSince(newTime, oldTime) {
    return newTime - oldTime;
  }

getCountdownClock(startTime, nowTime) {
    var millis = startTime - nowTime;

    var hours = Math.floor(millis / 36e5),
        mins = Math.floor((millis % 36e5) / 6e4),
        secs = Math.floor((millis % 6e4) / 1000);

    return {timer: hours+":"+("0"+mins).slice(-2)+":"+("0"+secs).slice(-2), time: millis}
}


listOfNames(names: Array<string>, numToShow?: number) {
  numToShow = numToShow || 999;
  var i = 0;
  var finalString = ""
    for (i = 0; i < names.length && i < numToShow; i++) {
      if (i == 0) {
        finalString += names[i];
      } else if (i == names.length - 1) {
        finalString += ", and " + names[i];
      } else {
        finalString += ", " + names[i];
      }
    }
    
    if (i >= numToShow && numToShow < names.length) {
        finalString += ", and " + (names.length - i) + " more.";
    }

  return finalString;
}

getArrayFromProps(array: any, prop: string, itemInFront?: any) : any {
  let finalArray = []
  if (itemInFront) {
    finalArray.push(itemInFront[prop])
  }
  for (let e of array) {
    if (e[prop] != itemInFront[prop]) {
      finalArray.push(e[prop]);
    }
  }
  console.log('ArrayFromProps: ', finalArray)
  return finalArray;
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

getArrayFromObjProps(object: any, prop: string) {
  var finalArray = [];
  for (var e in object) {
    var element = object[e]
    finalArray.push(element[prop]);
  }
  return finalArray;
}

contains(item:any, obj:any, prop?:string): boolean {
  for (var e in obj) {
    if (prop) {
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

report(type:string, obj:any) {
  this.ep.sendReportEmail(type, obj).then(() => {
    this.displayToast("Report has been sent.", 2000)
  }).catch(e => {
    this.displayToast("Whoops! [" + JSON.stringify(e) + "] Please try reporting the " + type + " again.", 7000)
  })
}

showModal(selector: string, title: string, subtitle: string, htmlContent: string, afterRenderFunc: any) {

  let newModal;

  $(selector).iziModal('resetContent');

  htmlContent += `<div class="invisible">` + `<div class="modal-button"></div>`.repeat(15) + `</div>`
  $(selector).html(htmlContent || `<p>No results.</p>`);

  newModal = $(selector).iziModal({
      title: title || 'OPTIONS',
      subtitle: subtitle || 'Choose your settings',
      headerColor: '#886FE8',
      fullscreen: true,
      openFullscreen: true,
      overlayClose: true,
      autoOpen: false,
      history: false,
      overlayColor: 'rgba(0, 0, 0, 0.6)',
      afterRender: afterRenderFunc || null,
      onClosed: function() {
          $(selector).iziModal('destroy');
      }
  })

    newModal.iziModal('open');

  return newModal;

}

showWebPageModal(selector: string, title: string, subtitle: string, iframeURL: string) {

  let newModal = $(selector).iziModal({
    title: title || 'OPTIONS',
    subtitle: subtitle || 'Choose your settings',
    headerColor: '#886FE8',
    iframe: true,
    iframeHeight: 800,
    iframeURL: iframeURL,
    fullscreen: true,
    openFullscreen: true,
    overlayClose: true,
    autoOpen: false,
    history: false,
    overlayColor: 'rgba(0, 0, 0, 0.6)',
    onClosed: function() {
        $(selector).iziModal('destroy');
    }
})
  newModal.iziModal('open');

return newModal;

}

}

@Injectable()
export class Globals {


  public version = '0.1.7';
  public debugflag = false;
  public user: any;
  public config = {
    min: 30,
    max: 5000,
    displayMsg: false
  };
  public fb = {
    perms: ['email', 'public_profile', 'user_friends', 'user_events'],
    apifields: "/me?fields=name,email,events,first_name,friends.limit(1000),picture.width(100).height(100)"
  }

  public ui = {
    versionval: "Validating version number...",
    status: "Checking server status...",
    loading: ["Hold on...",
      "Just a second...",
      "Loading...",
      "Loading up...",
      "Getting ready...",
      "One second...",
      "Just a sec...",
      "Hold tight...",
      "Hang tight...",
      "Starting up...",
      "What's the move? Boutta find out..",
      "Just give me a second...",
      "Hey, hold on...",
      "Revving up...",
      "Here we go...",
      "Okay hold on...",
      "What's good?",
      "Boutta be lit once I load up...",
      "Please wait...",
      "Okay here we go...",
      "Booting up...",
      "Leggo...",
      "Let's get it..."],
    updating: ["Yep, we got another update. Hold up...",
               "Looks like there's an update. Lemme download that real quick....",
               "Hey! There's an update! Downloading now...",
               "Updating Moves, this is good. One sec...",
               "Got a new update...",
               "Looks like we got another update, lemme load that up...",
               "Moves just got revamped! Updating your app right now...",
               "Update received. Ayy it's downloading now..."]
  }

  loadingMsg() {
    return this.ui.loading[Math.floor(Math.random() * this.ui.loading.length)]
  }

  // public colleges;

  public collegesJSON = {};

  public colleges = [];



  constructor(public http: Http) {
    // this.http.get('/assets/json/colleges.json').map(res => {
    //            return res.json();
    //        }).subscribe(data =>{ 
    //          this.colleges = data;
    this.colleges = [{
      key: "yale",
      name: "Yale University",
      nickname: "Yale",
      emailSuffix: "@yale.edu",
      color: "#886fe8",
      location: {
        lat: 41.308750,
        lng: -72.931877
      }
    },
    {
      key: "harvard",
      name: "Harvard University",
      nickname: "Harvard",
      emailSuffix: "@college.harvard.edu",
      color: "#DC143C",
      location: {
        lat: 42.3770029,
        lng: -71.1188488
      }
    }]

    for (let college of this.colleges) {
      this.collegesJSON[college.key] = college;
    }

      console.log(this.colleges);
// });
  }


}