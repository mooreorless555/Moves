// firebase deploy --only functions:yourFunction

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello, hello from Firebase!");
});

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  admin.database().ref('/messages').push({original: original}).then(snapshot => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.redirect(303, snapshot.ref);
  });
});

exports.unsubscribeEmail = functions.https.onRequest((req, res) => {
    const email = req.query.text
    admin.database().ref('/website/panlist').orderByChild('email').equalTo(email).once("value", function(snapshot) {
        if (snapshot.val()) {
            let key = Object.keys(snapshot.val())[0];
            snapshot.ref.child(key).remove();
            res.send("<div style='text-align:center'><h1>Okay byeeee!</h1><h4>You've successfully unsubscribed from the Moves newsletter.</h4></div>")
        } else {
            res.send("<div style='text-align:center'><h1>Well, this is awkward.</h1><h4>You're not even subscribed to the Moves newsletter!</h4></div>")
        }
    });
});

exports.addValue = functions.https.onRequest((req, res) => {
    const ref = admin.database().ref('/test')
    dbInsert({hey: 'sup'}, '/test')
})

exports.moveCleanUpCrew = functions.https.onRequest((req, res) => {
    const movesRef = admin.database().ref('/moves');
    const usersRef = admin.database().ref('/userData')

    var listOfMoves = text(title("Moves Clean Up Crew Report"))

    /******************************************
    Check to see if any moves are done pending 
    ********************************************/
    listOfMoves += subtitle("Pending Moves Report");
    movesRef.once('value', function(snapshot) {
        snapshot.forEach(college => {
            listOfMoves+= "<h4>"+college.key+"</h4>";
            college.forEach(snap => {
                var move = snap.val();
                var date = new Date();
                if (move.info.isPending) {
                    if (move.info.pending.startTime - date.getTime() <= 0) {
                        listOfMoves += text(bold(move.info.name) + ' has started.');

                        // Need to see if the host is there
                        var owner = move.info.owner;
                        var users = move.users;
                        listOfMoves += subtext("Checking to see if the owner is there.", 1);
                        if (findKey(owner.id, users)) {
                            listOfMoves += subtext("Owner is there. Going live!", 2)
                            dBInsert({isPending: false}, 'moves/'+college.key+'/'+move.key+'/info');
                        } else if (isAdmin(owner.id)) {
                            listOfMoves += subtext("Owner is not there but has permission to make moves remotely ("+owner.name+") Going live!", 2)
                            dBInsert({isPending: false}, 'moves/'+college.key+'/'+move.key+'/info');
                        } else {
                            listOfMoves += subtext("Owner is NOT there. But move has not been removed!", 2);
                            dBInsert({isPending: false}, 'moves/'+college.key+'/'+move.key+'/info');
                        }
                        listOfMoves += "<br>";
            
                    } else {
                        listOfMoves += text(bold(move.info.name) + " hasn't started yet. Exciting!");
                    }
                } else {
                    listOfMoves += text(bold(move.info.name) + " is not pending, so performing no checks on it.");
                }
            })
        })
    }).then(() => {
        res.send(listOfMoves)
    })
})

exports.removeComment = functions.https.onRequest((req, res) => {
    const collegeKey = req.query.collegeKey;
    const moveKey = req.query.moveKey;
    const commentKey = req.query.commentKey;
    
    const dBPath = 'moves/'+collegeKey+'/'+moveKey+'/comments/'+commentKey;
    dBRemove(dBPath).then(() => {
        res.send(title('Done.') + text(req.query) + "......." + text(JSON.stringify(req.query)))
    }).catch(e => {
        res.send(title('Error.') + text(e))
    })
})

exports.banUser = functions.https.onRequest((req, res) => {
    const culpritId = req.query.culpritId;

    const dBPath = 'userData/'+culpritId+'/userStatus'
    dBInsert({banned: true}, dBPath)
    .then(() => res.send(title("Done.")+subtitle("User has been banned. rip...")))
})

exports.unbanUser = functions.https.onRequest((req, res) => {
    const culpritId = req.query.culpritId;

    const dBPath = 'userData/'+culpritId+'/userStatus'
    dBInsert({banned: false}, dBPath)
    .then(() => res.send(title("Done.")+subtitle("User has been unbanned!")))
})

function dBInsert(dBObject, dBPath) {
  let ref = admin.database().ref(dBPath)
  return ref.once('value', snap => {
        snap.ref.update(dBObject)
      })
}

function dBRemove(dBPath) {
    let ref = admin.database().ref(dBPath)
    return ref.remove();
}

function dBGet(dBPath) {
    let ref = admin.database().ref(dBPath)
    return ref.once('value', snapshot => {
        let stuff = snapshot.val();
        return Promise.all();
    })
}

var sendNotification = function(data) {
    var headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Basic NWM0YjA3MWQtMTNmNi00MDMyLWI1MzMtZjBkNmYxNmUxZTg0"
    };
    
    var options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers
    };
    
    var https = require('https');
    var req = https.request(options, function(res) {  
      res.on('data', function(data) {
        console.log("Response:");
        console.log(JSON.parse(data));
      });
    });
    
    req.on('error', function(e) {
      console.log("ERROR:");
      console.log(e);
    });
    
    req.write(JSON.stringify(data));
    req.end();
  };

  
  exports.sendPush = functions.https.onRequest((req, res) => {

    var message = { 
        app_id: "73988abc-df1b-455e-b71c-03e817ba9c9a",
        contents: {"en": "English Message"},
        included_segments: ["All"]
      };

      sendNotification(message);
  })




function findKey(key, haystack) {
    if (!haystack) {
        return false;
    } else {
        var haystackArr = Object.keys(haystack)
        var found = haystackArr.find(function(val) {
            return key == val;
        })
    }
  
  return found;
}

function isAdmin(key) {
    var acceptedKeys = [
        "1248413801916793",
        "954620861346899",
        "5678910202",
        "1523467674379377"
    ]

    return acceptedKeys.some(function(value) {
      return value == key;
    })
}


function list(arguments, delim) {
    var finalString = ""
    for (item of arguments) {
        finalString += item + delim;
    }
    return finalString;
}

function bold(string) {
    return '<b>'+string+'</b>';
}

function title(string) {
    return '<h1>'+string+'</h1>';
}

function subtitle(string) {
    return '<h3>'+string+'</h3>';
}

function text(string) {
    return string+'<br>';
}

function subtext(string, level) {
    var subTextLines = "";
    for (var i = 0; i < level; i++) {
        subTextLines += "--------";
    }
    return subTextLines+string+'<br>';
}