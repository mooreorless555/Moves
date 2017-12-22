import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { LoginProvider } from '../../providers/login-provider';
import { Observable } from 'rxjs/observable';
import 'rxjs/add/operator/map';

var url = 'http://54.175.164.247:80/';

@Injectable()
export class MovesService {

  moves: Array<any>;

  static get parameters() {
    return [[Http, Observable]];
  }

  constructor(public http: Http, public loginProvider: LoginProvider) {
    console.log('Hello MovesService Provider');
  }

  getMoves_old() {
    console.log('Getting Moves');
    var response = this.http.get(url).map(res => res.json());
    return response;
  }

  getMoves() {

    var token = null;
    var headers = new Headers({ 'Authorization': token });

    return new Promise((resolve, reject) => {

      this.http.get(url + 'api/', { headers: headers })
        .map(res => res.json())
        .subscribe(data => {
          //alert(data);
          resolve(data);

        }, (err) => {
          //alert(err);
          reject(err);

        });

    });

  }

  setMoves(moves) {
    this.moves = moves;
    //alert("Moves: " + moves + "This.moves: " + this.moves);
  }

  retrieveMoves() {
    //alert(this.moves);
    return this.moves;
  }

  makeMove(move) {
    console.log('Making Move');
    console.log(move);

    let body = JSON.stringify(move);
    console.log(body);
    let headers = new Headers({ 'Content-Type': 'application/json' });

    return new Promise((resolve, reject) => {

      this.http.post(url + 'api/', body, { headers: headers }).subscribe(res => {

        let data = res.json();
        resolve(data);
        console.log('Went through');
      }, (err) => {
        console.log('No thru.');
        reject(err);

      });

    });
  }

  deleteMove(move) {

    console.log('Deleting move');
    console.log(move);
    let urlDelete = url + 'moves/' + move._id;

    return new Promise((resolve, reject) => {

      this.http.delete(urlDelete)
        .subscribe(res => {

          let data = res.json();
          resolve(data);

        }, (err) => {

          reject(err);

        });

    });
  }


  updateMove(move) {

    let body = JSON.stringify(move);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let urlUpdate = url + 'moves/' + move._id;

    return new Promise((resolve, reject) => {

      this.http.put(urlUpdate, body, { headers: headers })
        .subscribe(res => {

          resolve(res);

        }, (err) => {

          alert(err);
          reject(err);
        });

    });
  }

  // updateMove(move) {

  //   console.log('Updating move');
  //   console.log(move);
  //   let urlUpdate = url + 'moves/' + move._id;

  //   return new Promise((resolve, reject) => {

  //     this.http.put(urlUpdate)
  //     .subscribe(res => {

  //       let data = res.json();
  //       resolve(data);

  //     }, (err) => {

  //       reject(err);

  //     });

  //   });
  // }
}