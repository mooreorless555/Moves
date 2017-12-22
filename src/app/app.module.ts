/* MAIN IONIC IMPORTS */
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BusyModule } from 'angular2-busy';
import { HttpModule } from '@angular/http';
import { MyApp } from './app.component';

/* PAGES */
import { StatsPage } from '../pages/stats/stats';
import { MakePage } from '../pages/make/make';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { ProfilePage } from '../pages/profile/profile';
import { FriendsPage } from '../pages/friends/friends';
import { ConnectionsPage } from '../pages/connections/connections';
import { SettingsPage } from '../pages/settings/settings';
import { UserListPage } from '../pages/user-list/user-list';
import { UserListButtonPage } from '../pages/user-list-button/user-list-button';
import { EditStatsPage } from '../pages/edit-stats/edit-stats';
import { LinkModalPage } from '../pages/link-modal/link-modal';
import { MapPage } from '../pages/map/map';
import { UserPage } from '../pages/user/user';
import { FacebookEventsPage } from '../pages/facebook-events/facebook-events';
import { BulletinPage } from '../pages/bulletin/bulletin';
import { ListPage } from '../pages/list/list';
import { ControlPanelPage } from '../pages/control-panel/control-panel';

/***********************************
 *  PLUGINS 
 * *********************************/
import {SplashScreen} from "@ionic-native/splash-screen";
import {StatusBar} from "@ionic-native/status-bar";
import { Facebook } from '@ionic-native/facebook';
import { LocationTracker } from '../providers/location-tracker';
// import { AngularFireModule } from 'angularfire2';
// import { AngularFireDatabaseModule } from 'angularfire2/database';
import { NativeAudio } from '@ionic-native/native-audio';
import { NativeStorage } from '@ionic-native/native-storage';
import { OneSignal } from '@ionic-native/onesignal';
import { BackgroundMode } from '@ionic-native/background-mode';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation } from '@ionic-native/geolocation';
import { Geofence } from '@ionic-native/geofence';
import { AppMinimize } from '@ionic-native/app-minimize';
import { LocalNotifications } from '@ionic-native/local-notifications';
import 'rxjs/add/operator/map';
import { DatePicker } from '@ionic-native/date-picker';
import { HeaderColor } from '@ionic-native/header-color';
import { Keyboard } from '@ionic-native/keyboard';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';

/***********************************
 *  PROVIDERS 
 * *********************************/
import { System, Globals } from '../pages/functions/functions';
import { LoginProvider, MoveUser } from '../providers/login-provider';
import { MovesProvider } from '../providers/moves-provider';
import { StatsProvider } from '../providers/stats-provider';
import { EmailProvider } from '../providers/email-provider';
import { DatabaseProvider } from '../providers/database-provider';
import { ServerStatusProvider } from '../providers/server-status-provider';
import { PreferencesProvider } from '../providers/preferences-provider';
import { MapComponentProvider } from '../providers/map-component-provider';
import { Aliases, Badges } from '../providers/profile-provider';
import { NotificationProvider, Tutorial } from '../providers/notification-provider';
import { SoundProvider } from '../providers/sound-provider';

/***********************************
 *  COMPONENTS 
 * *********************************/
import { UserItemComponent } from '../components/user-item/user-item';
import { TitleComponent } from '../components/title/tit';
import { LargeButtonComponent } from '../components/large-button/large-button';
import { MoveItemComponent } from '../components/move-item/move-item';
import { CommentComponent } from '../components/comment/comment';
import { UserBubbleComponent } from '../components/user-bubble/user-bubble';


import { ImageCacheDirective } from '../directives/imagecache/imagecache';
import { BulletinPostComponent } from '../components/bulletin-post/bulletin-post';
import { InfoComponent } from '../components/info/info';


const cloudSettings: CloudSettings = {
  'core': {
    'app_id': 'aaddcec5'
  }
};


export const firebaseConfig = {
      apiKey: "AIzaSyANmdr_oNcjak8eVKUI7esAoyk4mtWKD-M",
      authDomain: "moves-ad1b4.firebaseapp.com",
      databaseURL: "https://moves-ad1b4.firebaseio.com",
      projectId: "moves-ad1b4",
      storageBucket: "moves-ad1b4.appspot.com",
      messagingSenderId: "583373480587"
    };

@NgModule({
  declarations: [
    MyApp,
    StatsPage,
    MakePage,
    HomePage,
    LoginPage,
    ProfilePage,
    FriendsPage,
    ConnectionsPage,
    SettingsPage,
    TabsPage,
    MapPage,
    UserItemComponent,
    EditStatsPage,
    UserListPage,
    UserListButtonPage,
    UserPage,
    LinkModalPage,
    TitleComponent,
    LargeButtonComponent,
    MoveItemComponent,
    CommentComponent,
    UserBubbleComponent,
    ImageCacheDirective,
    FacebookEventsPage,
    BulletinPage,
    BulletinPostComponent,
    InfoComponent,
    ListPage,
    ControlPanelPage
  ],
  imports: [
    IonicModule.forRoot(MyApp, {
      // These options are available in ionic-angular@2.0.0-beta.2 and up.
      activator: 'ripple',
      scrollAssist: false,    // Valid options appear to be [true, false]
      autoFocusAssist: false,  // Valid options appear to be ['instant', 'delay', false]
      mode: 'ios',
      tabsMode: 'md',
      modalEnter: 'modal-slide-in',
      modalLeave: 'modal-slide-out',
      animate: true
    }),
    // AngularFireDatabaseModule,
    // AngularFireModule.initializeApp(firebaseConfig),
    CloudModule.forRoot(cloudSettings),
    BusyModule,
    BrowserModule,  // New in ionic 3
    BrowserAnimationsModule,
    HttpModule  // New in ionic 3
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    StatsPage,
    MakePage,
    HomePage,
    LoginPage,
    ProfilePage,
    FriendsPage,
    ConnectionsPage,
    SettingsPage,
    TabsPage,
    MapPage,
    UserListPage,
    UserListButtonPage,
    UserPage,
    EditStatsPage,
    LinkModalPage,
    FacebookEventsPage,
    BulletinPage,
    ListPage,
    ControlPanelPage
  ],
  providers: [LocationTracker, 
              LoginProvider, MoveUser, MovesProvider, StatsProvider, Keyboard, AppMinimize, DatePicker, HeaderColor, LocalNotifications, BackgroundMode, BackgroundGeolocation, Geolocation, Geofence, NativeAudio, SplashScreen, StatusBar, Facebook,
    EmailProvider, NativeStorage,
    DatabaseProvider, ServerStatusProvider, NotificationProvider,
    PreferencesProvider,
    MapComponentProvider,
    Aliases, Badges, Tutorial, System, Globals,
    SoundProvider, OneSignal]
})
export class AppModule {}
