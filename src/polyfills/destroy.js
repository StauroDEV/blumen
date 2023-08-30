function emitErrorNT(self2, err) {
  const r = self2._readableState
  const w = self2._writableState
  if ((w && w.errorEmitted) || (r && r.errorEmitted)) {
    return
  }
  if (w) {
    w.errorEmitted = true
  }
  if (r) {
    r.errorEmitted = true
  }
  self2.emit('error', err)
}

function emitErrorCloseNT(self2, err) {
  emitErrorNT(self2, err)
  emitCloseNT(self2)
}
function emitCloseNT(self2) {
  const r = self2._readableState
  const w = self2._writableState
  if (w) {
    w.closeEmitted = true
  }
  if (r) {
    r.closeEmitted = true
  }
  if ((w && w.emitClose) || (r && r.emitClose)) {
    self2.emit('close')
  }
}

export function destroy(err, cb) {
  const r = this._readableState
  const w = this._writableState
  const s = w || r
  if ((w && w.destroyed) || (r && r.destroyed)) {
    if (typeof cb === 'function') {
      cb()
    }
    return this
  }
  checkError(err, w, r)
  if (w) {
    w.destroyed = true
  }
  if (r) {
    r.destroyed = true
  }
  if (!s.constructed) {
    this.once(kDestroy, function (er) {
      _destroy(this, aggregateTwoErrors(er, err), cb)
    })
  } else {
    _destroy(this, err, cb)
  }
  return this
}

function _destroy(self2, err, cb) {
  let called = false
  function onDestroy(err2) {
    if (called) {
      return
    }
    called = true
    const r = self2._readableState
    const w = self2._writableState
    checkError(err2, w, r)
    if (w) {
      w.closed = true
    }
    if (r) {
      r.closed = true
    }
    if (typeof cb === 'function') {
      cb(err2)
    }
    if (err2) {
      process.nextTick(emitErrorCloseNT, self2, err2)
    } else {
      process.nextTick(emitCloseNT, self2)
    }
  }
  try {
    self2._destroy(err || null, onDestroy)
  } catch (err2) {
    onDestroy(err2)
  }
}
