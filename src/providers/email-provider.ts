import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

declare var emailjs: any;

/*
  Generated class for the EmailProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/



@Injectable()
export class EmailProvider {
    

    constructor() {
        console.log('Hello EmailProvider Provider');

    }

    sendEmail(to_email: string, college: any, to_name: string, code: string) {
        let greetingArr = ['Hey',
        "What's up",
        "Hey there",
        "Ay",
        "What's good",
        "Sup"]

        let greeting = greetingArr[Math.floor(Math.random() * greetingArr.length)]
      return emailjs.send("gmail", "moves_email_verify", {"subject": "Your code: " + code + " (Moves)", "greeting": greeting,"to_email":to_email,"nickname": college.nickname, "reply_to":"","to_name":to_name, "code": code})
    }

    sendReportEmail(type: string, obj: any) {
        if (type == 'comment') {
            console.log('Reported.');
            let reporter = obj.reporter;
            let culprit = obj.culprit;
            let comment = obj.comment
            let move = obj.move;
            return emailjs.send("gmail", "report_comment", {
                "reporterName":reporter.name,
                "reporterId":reporter.id,
                "culpritName":culprit.name,
                "culpritId":culprit.id,
                "commentContent":comment.content,
                "commentKey":comment.key,
                "moveName":move.name,
                "moveKey":move.key})
        } else if (type == 'user') {
            console.log('Reported.');
            let reporter = obj.reporter;
            let culprit = obj.culprit;
            let reason = obj.reason;
            return emailjs.send("gmail", "report_user", {
                "reporterName":reporter.name,
                "reporterId":reporter.id,
                "culpritName":culprit.name,
                "culpritId":culprit.id,
                "culpritEmail":culprit.email,
                "reason":reason})           
        } 
    }

    sendMailjetEmail() {

    }
}