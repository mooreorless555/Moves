import { Component } from '@angular/core';
import { Facebook } from '@ionic-native/facebook';
import firebase from 'firebase';
import { NativeStorage } from '@ionic-native/native-storage';

import { ToastController, Platform} from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { NavController } from 'ionic-angular';

import { LoginProvider, MoveUser } from '../../providers/login-provider';
import { EmailProvider } from '../../providers/email-provider';
import { StatsProvider } from '../../providers/stats-provider';
import { DatabaseProvider } from '../../providers/database-provider';
import { System, Globals } from '../functions/functions';

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { TabsPage } from '../tabs/tabs';
import swal from 'sweetalert2';
// import { HomePage } from '../home/home';

declare var $: any;
declare var velocity: any;

//var url = 'http://54.175.164.247:80/';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [StatsProvider, System, Globals]
})
export class LoginPage {
  FB_APP_ID: number = 1726230761032513;

  public info = "";
  user: any;
  profinfo: any;

  userProfile: any = null;

  public firsttime = {
    email: "",
    code: ""
  };

  public debugflag = true;

  ngAfterViewInit() {
    this.introducePage();
  }

  constructor(public loginProvider: LoginProvider, 
              public platform: Platform,
              public ep: EmailProvider, 
              public ns: NativeStorage, 
              private mUser: MoveUser, 
              private facebook: Facebook, 
              public system: System, 
              public globals: Globals, 
              public http: Http, 
              public navCtrl: NavController, 
              public toastCtrl: ToastController, 
              public alertCtrl: AlertController,
              public db: DatabaseProvider) {


                this.ep.sendMailjetEmail();
                this.getData();

  }

  async getData() {
    this.info = await this.db.get('value', '/serverInfo/loginMessage');
  }

  isLoggedIn() {
    let user = firebase.auth().currentUser
    if (!user) {
      console.log('User is NOT logged in.')
      return false;
    }
    console.log('User IS logged in.')
    return true;
  }

  isWeb() {
    return !this.platform.is('cordova');
  }

  facebookLogin() {
    let g = this.globals.fb
    let me = this;
    $('#loginBtn').prop('disabled', true);
    setTimeout(() => {
      $('#fadeOut').velocity('transition.fadeIn', { duration: 500 })
      setTimeout(() => {
        if (!this.globals.debugflag) {
          this.system.appLoader('Logging you in...')
          alert("Executing facebook.login...awaiting Safari popup.")
          this.facebook.login(g.perms).then((response) => {
            const facebookCredential = firebase.auth.FacebookAuthProvider
              .credential(response.authResponse.accessToken);

            let params = new Array();
            alert("Executing firebase login with API...awaiting Safari popup.")
            firebase.auth().signInWithCredential(facebookCredential)
            return Promise.all([response, this.facebook.api(g.apifields, params)])
              .then((success) => {
                this.system.loader.dismiss();
                this.mUser.setFB(success);
                // alert("Firebase success: " + JSON.stringify(success[1]));

                this.mUser.initUser(success, 0, 0, this.firsttime.email).then(result => {
                  if (result[1]) {
                    this.system.welcomeUser(result[0].first_name)
                  }

                  $('#fadeOut').velocity('transition.fadeIn', { duration: 500 })
                  this.navCtrl.setRoot(TabsPage);
                })
                // this.presentWelcome();
              })
              .catch((error) => {
                this.system.simpleAlert(JSON.stringify(error) + "Oh no!");
              });

          }).catch((error) => { console.log(error) });
        } else {
          // this.presentWelcome();
          // this.mUser.initUser()
          this.navCtrl.setRoot(TabsPage);
        }
      }, 1600)
    }, 800);
  }

  determineAuthStatus() {
    let g = this.globals.fb;
    let me = this;
    this.ns.getItem('accessToken')
    /* User already has an access token. */
    .then(accessToken => {
      this.ns.getItem('firstName')
      .then(firstName => {
      this.login(accessToken, firstName)
      })
      .catch(() => {
        this.login(accessToken)
      })
    })
    /* First Time Facebook Login */
    .catch(() => {
      this.facebook.login(g.perms).then((response) => {
        var accessToken = response.authResponse.accessToken;
        this.login(accessToken);
      })
    })
  }

  async login(token, firstName?: string) {

    var me = this;
    var exitFunc = function() {
      me.platform.exitApp();
    }
    let updatedVal = await this.db.get('value', '/serverInfo/updates/facebook');
  
    $('#loginBtn').prop('disabled', true);
    setTimeout(() => {
      $('#fadeOut').velocity('transition.fadeIn', { duration: 500 })
      setTimeout(() => {
      const facebookCredential = firebase.auth.FacebookAuthProvider.credential(token);
      var params = new Array();
      var g = this.globals.fb;
      this.system.appLoader("What's good " + (firstName ? firstName : "") + "?");
      return Promise.all([firebase.auth().signInWithCredential(facebookCredential), this.facebook.api(g.apifields, params)])
      .then(success => {
                this.system.loader.dismiss();
                this.ns.setItem('accessToken', token);
                this.ns.setItem('firstName', success[1].first_name);
                this.mUser.setFB(success);
                this.mUser.initUser(success, token, updatedVal, this.firsttime.email).then(result => {
                  if (result[1]) {
                    this.system.welcomeUser(result[0].first_name)
                  }

                  $('#fadeOut').velocity('transition.fadeIn', { duration: 500 })
                  this.navCtrl.setRoot(TabsPage);
                })       
      }).catch(error => {
        this.system.loader.dismiss();
        setTimeout(() => this.system.simpleAlert('Looks like we ran into a problem.<br><br>'+JSON.stringify(error)+`<br><br>Uninstalling and reinstalling Moves will usually fix these errors, but please send us a screenshot of the error at movesbot@gmail.com so we can figure out what happened. Sorry about that!`, 'Yikes!', "Quit", exitFunc, false), 800)
      })
      }, 600);
    }, 800);
  }



  introducePage() {
    $('#fadeOut').velocity('transition.fadeOut', { delay: 1000, duration: 1000 })
    $('#loginLogo').velocity('transition.shrinkIn', { delay: 1000, duration: 800 });
  }

  toggleDebugFlag() {
    this.globals.debugflag = !(this.globals.debugflag);
  }
  presentWelcome() {
    // let welcome = this.toastCtrl.create({
    //   message: "Hey " + this.mUser.getFB().first_name + "!",
    //   duration: 3000
    // });
    // welcome.present();
    setTimeout(() => this.presentToast('Hey!', 2000), 500);
    setTimeout(() => this.presentToast("This is the Hub- here you'll be able to see an overview of the moves going on right now.", 3000), 3300);
    setTimeout(() => this.presentToast("Really excited you've joined. This'll be the place to check to see if anything is going on! If you want to make a move yourself, just click the + tab below.", 6000), 7000);
  }

  presentToast(msg, duration) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: duration
    });
    toast.present();
  }

  beginLogin() {
    let debug = this.globals.debugflag
    if (!debug) { // if debug mode is off
      this.ns.getItem('verified').then( data => {
        if (!data.verified) {
          // this.selectCollege();
          this.presentNewPrompt();
        } else {
          this.ns.getItem('code').then( data => {
            this.presentConfirmCode(this.firsttime.email, this.firsttime.code, true)   
          })
          this.determineAuthStatus()  
        }
      }).catch(error => {
        // this.selectCollege();
        this.presentNewPrompt();  
      })
    } else {
       $('#fadeOut').velocity('transition.fadeIn', { duration: 500 })
       setTimeout(() => {
         this.navCtrl.setRoot(TabsPage);
       }, 800)
    }
  }

  selectCollege() {
    let collegeRawList = this.globals.colleges;
    let collegeJSON = {};

    for (var college of collegeRawList) {
      collegeJSON[college.key] = college.name;
    }

    this.system.simpleSelectInput('Select College', 'Which college do you go to?', 'Select College');
  }


  // presentRealPrompt() {
  //   this.system.simpleInput("Before we let you sign in, we just need to confirm that you have a <b>@yale.edu</b> email.<br>Type it in below and we'll send you a verification code.",
  //   "Send Confirmation",
  //   "First Time",
  //   "Yale Email",
  //   "").then(data => {
  //           data = data.trim()
  //           this.firsttime.email = data

  //     this.db.get('value', 'serverInfo/emailLock').then((result) => {
  //             console.log("Email Lock: " + JSON.stringify(result))
  //             if (data.endsWith("@yale.edu")) { // Change this back to @yale.edu to filter out Yale emails.
  //               if (data == "@yale.edu") {
  //                 this.presentError("This isn't an email.");
  //                 return false;
  //               }
  //               else {
  //                 this.firsttime.email = this.firsttime.email.toLowerCase()
  //                 this.firsttime.code = this.generateCode(6);
  //                 this.ns.setItem('code', this.firsttime.code)
  //                 this.ns.setItem('email', this.firsttime.email)
  //                 let email = this.firsttime.email;
  //                 let code = this.firsttime.code;
  //                 let name = email.split('.')[0];
  //                 name = this.jsUcfirst(name);
  //                 // Send email verification.
  //                 this.system.appLoader('Sending email...');
  //                 this.ep.sendEmail(email, name, code)
  //                 .then(() => {
  //                   this.system.loader.dismiss()
  //                   this.presentConfirmCode(this.firsttime.email, this.firsttime.code)
  //                 })
  //                 .catch(err => {
  //                   this.presentError("Seems like there was an issue sending the email. ERROR: " + JSON.stringify(err))
  //                   this.system.loader.dismiss()
  //                 })
  //               }
  //             } else {
  //               if (result == 0) {
  //                 this.firsttime.email = this.firsttime.email.toLowerCase()
  //                 this.firsttime.code = this.generateCode(6);
  //                 this.ns.setItem('code', this.firsttime.code)
  //                 this.ns.setItem('email', this.firsttime.email)
  //                 let email = this.firsttime.email;
  //                 let code = this.firsttime.code;
  //                 let name = email.split('.')[0];
  //                 name = this.jsUcfirst(name);
  //                 // Send email verification.
  //                 this.system.appLoader('Sending email...');
  //                 this.ep.sendEmail(email, name, code)
  //                 .then(() => {
  //                   this.system.loader.dismiss()
  //                   this.presentConfirmCode(this.firsttime.email, this.firsttime.code)
  //                 })
  //                 .catch(err => {
  //                   this.presentError("Seems like there was an issue sending the email. ERROR: " + JSON.stringify(err))
  //                   this.system.loader.dismiss()
  //                 })
  //               } else {
  //               this.presentError("You didn't type in a valid Yale email.");
  //               return false;
  //               }
  //             }
  //           })
  //   })
  // }
  presentNewPrompt() {

    $('#loginBtn').prop('disabled', true);
    setTimeout(() => { 
    // Get storage data
    this.ns.getItem('code').then(code => {
      this.ns.getItem('email').then(email => {
        this.presentConfirmCode(email, code, true);
        $('#loginBtn').prop('disabled', false);
      })
    }).catch(() => {
      let collegeRawList = this.globals.colleges;
      let colleges = this.globals.collegesJSON;
      console.log(colleges);
      console.log(collegeRawList);
      let collegeJSON = {};
  
      for (var college of collegeRawList) {
        collegeJSON[college.key] = college.name;
      }

      let buttons = "";
      for (let college of collegeRawList) {
        buttons += "<button id=" + college.key + " class='swal2-styled' style='width: 100% !important; background-color: " + '#886fe8' + " !important; border-radius: 20px; padding: 20px; font-weight: 800em !important; font-family: 'TruLato' !important; color: #fff; font-size: 20px !important;'>" + college.name + "</button>"
      }
        swal({
          title: 'Where do you go?',
          showConfirmButton: false,
          html: "<br><br>" + buttons
        }).then(function (result) {
          swal(JSON.stringify(result))
        }).catch(swal.noop)

        for (let college of collegeRawList) {
          $('#' + college.key).click(() => {
            swal.close();
            this.enterEmail(college);
          })
        }
      })
    $('#loginBtn').prop('disabled', false);
    }, 800);
  }

    enterEmail(collegeKey) {
      // First, get specified college:
      let college = collegeKey;
      let inputValFunc = function (value) {
        return new Promise(function (resolve, reject) {
          if (!value) {
            reject('Please type your college email in the space above.');
          } else if (!value.endsWith(college.emailSuffix)) {
            reject(`This isn't a valid ${college.nickname} email.`);
          } else {
            resolve();
          }
        })
      }
      this.system.easyInput(`Sweet. Before we let you sign in, we just need to confirm that you have a <b>${college.emailSuffix}</b> email.<br>Type it in below and we'll send you a verification code.`,
      "Send Verification Code",
      `So you go to ${college.nickname}?`,
      `Your ${college.nickname} email`,
      "",
      false,
      inputValFunc).then(data => {
              data = data.trim()
              this.firsttime.email = data
  
        this.db.get('value', 'serverInfo/emailLock').then((result) => {
                console.log("Email Lock: " + JSON.stringify(result))
                if (data.endsWith(college.emailSuffix)) { // Change this back to @yale.edu to filter out Yale emails.
                  if (data == college.emailSuffix) {
                    this.presentError("This on its own isn't an email.");
                    return false;
                  }
                  else {
                    this.firsttime.email = this.firsttime.email.toLowerCase()
                    this.firsttime.code = this.generateCode(6);
                    this.ns.setItem('code', this.firsttime.code)
                    this.ns.setItem('email', this.firsttime.email)
                    let email = this.firsttime.email;
                    let code = this.firsttime.code;
                    let name = email.split('.')[0];
                    name = this.jsUcfirst(name);
                    // Send email verification.
                    this.system.appLoader('Sending email...');
                    this.ep.sendEmail(email, college, name, code)
                    .then(() => {
                      this.system.loader.dismiss()
                      this.presentConfirmCode(this.firsttime.email, this.firsttime.code)
                    })
                    .catch(err => {
                      this.presentError("Seems like there was an issue sending the email. Wait a couple of minutes and then try this again. Sorry about that!")
                      this.system.loader.dismiss()
                    })
                  }
                } else {
                  if (result == 0) {
                    this.firsttime.email = this.firsttime.email.toLowerCase()
                    this.firsttime.code = this.generateCode(6);
                    this.ns.setItem('code', this.firsttime.code)
                    this.ns.setItem('email', this.firsttime.email)
                    let email = this.firsttime.email;
                    let code = this.firsttime.code;
                    let name = email.split('.')[0];
                    name = this.jsUcfirst(name);
                    // Send email verification.
                    this.system.appLoader('Sending email...');
                    this.ep.sendEmail(email, college, name, code)
                    .then(() => {
                      this.system.loader.dismiss()
                      this.presentConfirmCode(this.firsttime.email, this.firsttime.code)
                    })
                    .catch(err => this.presentError("Seems like there was an issue sending the email. ERROR: " + err))
                  } else {
                  this.presentError("You didn't type in a valid " + college.nickname + " email.");
                  return false;
                  }
                }
              })
      })
    }
  
  presentPrompt() {
    $('#loginBtn').prop('disabled', true);
    setTimeout(() => { 
    this.ns.getItem('code').then(code => {
      this.ns.getItem('email').then(email => {
        this.presentConfirmCode(email, code, true)
        $('#loginBtn').prop('disabled', false)
      })
    }).catch(() => {
this.system.simpleInput("Before we let you sign in, we just need to confirm that you have a <b>@yale.edu</b> email.<br>Type it in below and we'll send you a verification code.",
    "Send Confirmation",
    "First Time",
    "Yale Email",
    "").then(data => {
            data = data.trim()
            this.firsttime.email = data

      this.db.get('value', 'serverInfo/emailLock').then((result) => {
              console.log("Email Lock: " + JSON.stringify(result))
              if (data.endsWith("@yale.edu")) { // Change this back to @yale.edu to filter out Yale emails.
                if (data == "@yale.edu") {
                  this.presentError("This on its own isn't an email.");
                  return false;
                }
                else {
                  this.firsttime.email = this.firsttime.email.toLowerCase()
                  this.firsttime.code = this.generateCode(6);
                  this.ns.setItem('code', this.firsttime.code)
                  this.ns.setItem('email', this.firsttime.email)
                  let email = this.firsttime.email;
                  let code = this.firsttime.code;
                  let name = email.split('.')[0];
                  name = this.jsUcfirst(name);
                  // Send email verification.
                  this.system.appLoader('Sending email...');
                  this.ep.sendEmail(email, [], name, code)
                  .then(() => {
                    this.system.loader.dismiss()
                    this.presentConfirmCode(this.firsttime.email, this.firsttime.code)
                  })
                  .catch(err => {
                    this.presentError("Seems like there was an issue sending the email. Wait a couple of minutes and then try this again. Sorry about that!")
                    this.system.loader.dismiss()
                  })
                }
              } else {
                if (result == 0) {
                  this.firsttime.email = this.firsttime.email.toLowerCase()
                  this.firsttime.code = this.generateCode(6);
                  this.ns.setItem('code', this.firsttime.code)
                  this.ns.setItem('email', this.firsttime.email)
                  let email = this.firsttime.email;
                  let code = this.firsttime.code;
                  let name = email.split('.')[0];
                  name = this.jsUcfirst(name);
                  // Send email verification.
                  this.system.appLoader('Sending email...');
                  this.ep.sendEmail(email, [], name, code)
                  .then(() => {
                    this.system.loader.dismiss()
                    this.presentConfirmCode(this.firsttime.email, this.firsttime.code)
                  })
                  .catch(err => this.presentError("Seems like there was an issue sending the email. ERROR: " + err))
                } else {
                this.presentError("You didn't type in a valid Yale email.");
                return false;
                }
              }
            })
    })
      $('#loginBtn').prop('disabled', false)
    })}, 800)
  }

  presentConfirmCode(email: string, code: string, extra?: boolean) {
    let me = this;
    let verifyDialog = "<br><span tappable id='tap-here-btn' style='font-size: 12px; border: 1px solid #fff; border-radius: 3px; padding: 3px;'>messed up? tap here to resend the email</span><br><br>";
    let diag = "Okay, we just sent the verification code to " + email + ". Type it in here and that's it!";
    if (extra) diag = "Looks like you haven't yet verified your email. We sent the code to " + email + "- go check the email and type in the code here!";
    diag = verifyDialog + diag;

    let inputValFunc = function (value) {
        return new Promise(function (resolve, reject) {
          if (!value) {
            reject('Please type the code you received by email in the space above.');
          } else if (value == code) {
            resolve();
          } else {
            reject("The verification code is wrong. Please try again.");
          }
        })
      }

    this.system.easyInput(diag, "Verify", "Your code is on its way!", "Enter code here", "",false,
  inputValFunc).then(data => {
          if (data == code) {
                this.presentVerified()
              } else if (data.trim() == '') {
                this.presentError("You didn't even enter anything into the box.");
                return false;
              } else {
                this.presentError("The verification code you entered was wrong!");
                return false;
              }
    })
    
    $('#tap-here-btn').on('click', function() {
      swal.close();
      me.ns.remove('code').then(() => {
        me.presentPrompt();
      })
    })
  }

  presentError(msg: string) {
    let msgs = ['Oops!', 'Try Again.', 'Uh-oh!', 'Oh no!'];
    let alert = this.alertCtrl.create({
      title: msgs[Math.floor(Math.random() * msgs.length)],
      message: msg,
      buttons: ['Go Back']
    });
    // alert.present();
    this.system.simpleAlert(msg, msgs[Math.floor(Math.random() * msgs.length)], 'Go back')
  }

  presentVerified() {
    let alert = this.alertCtrl.create({
      title: "Got it!",
      message: "Sweeeet, you've been verified. Welcome to Moves!",
      buttons: [{
          text: 'Continue',
          handler: data => {
            this.determineAuthStatus()
          }
        }]
    });
    this.ns.remove('code')
    this.determineAuthStatus()
    this.verifyUser();
    // alert.present();
  }

  verifyUser() {
    this.ns.setItem('verified', {verified: true});
  }



  generateCode(digits: number) {
    let code = '';
    for (var i = 0; i < digits; i++) {
      let randomNum = Math.floor(Math.random() * 9)
      code += randomNum;
    }
    return code;
  }

  jsUcfirst(string) 
  {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

}
