import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { NativeStorage } from '@ionic-native/native-storage';
import 'rxjs/add/operator/map';

/*
  Generated class for the PreferencesProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class PreferencesProvider {

  public userPreferences = {
    swearFilter: false,
  }

  public blockedLanguage = [
"anal",
"anus",
"arse",
"ass",
"ballsack",
"balls",
"bastard",
"bitch",
"blowjob",
"blow job",
"bollock",
"bollok",
"boner",
"boob",
"bugger",
"bum",
"butt",
"buttplug",
"clitoris",
"cock",
"coon",
"crap",
"cunt",
"damn",
"dick",
"dildo",
"dyke",
"fag",
"feck",
"fellate",
"fellatio",
"felching",
"fuck",
"f u c k",
"fudgepacker",
"fudge packer",
"flange",
"Goddamn",
"God damn",
"homo",
"jerk",
"jizz",
"knobend",
"knob end",
"lmao",
"lmfao",
"muff",
"nigger",
"nigga",
"omg",
"penis",
"piss",
"prick",
"pussy",
"queer",
"scrotum",
"sex",
"shit",
"s hit", 
"sh1t",
"slut",
"smegma",
"spunk",
"tit",
"tosser",
"turd",
"twat",
"vagina",
"wank",
"whore",
"wtf"
  ]

  constructor(public http: Http, public ns: NativeStorage) {
    this.load().then(result => {
      if (!result) {
        this.save();
        alert('Initializing user settings.');
      } else {
        console.log('Settings already exist!');
      }
    })
  }

  save(): Promise<any> {
    let def = new $.Deferred();
    this.ns.setItem('userPreferences', this.userPreferences).then(result => {
      def.resolve(result);
    }).catch(e => {
      def.reject(e);
    })

    return def;
  }

  load() : Promise<any> {
    let def = new $.Deferred();
    this.ns.getItem('userPreferences').then(result => {
      this.userPreferences = result;
      def.resolve(result);
    }).catch(e => {
      def.reject(e);
    })

    return def;
  }

  get() {
    return this.userPreferences;
  }


  /* Swear Filter Functions */
  filterSwears(string) {
    var rgx = new RegExp(this.blockedLanguage.join("|"), "gi");

    function wordFilter(str) {          
            return str.replace(rgx, "*bloop*");           
    }
    if (this.get().swearFilter) {
      console.log('Swear Filter is on');
      return wordFilter(string);
    } else {
     console.log('Swear Filter is not on');
      return string;
    }
  }



}
