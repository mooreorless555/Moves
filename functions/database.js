
exports.insert = function(dBObject, dBPath) {
  let ref = admin.database().ref(dBPath)
  return ref.once('value', snap => {
        snap.ref.update(dBObject)
      })
}

exports.remove = function(dBPath) {
    let ref = admin.database().ref(dBPath)
    return ref.remove();
}

exports.get = function(dBPath) {
    let ref = admin.database().ref(dBPath)
    return ref.once('value', snapshot => {
        let stuff = snapshot.val();
        return Promise.all();
    })
}
