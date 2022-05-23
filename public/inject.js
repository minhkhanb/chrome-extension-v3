function toJSON(obj) {
  if (!obj) return {};

  try {
  } catch (err) {
    return {
      err: {
        code: 'ERR_CODE',
        msg: 'Cannot parse body',
        args: [obj],
      },
    };
  }
}

function workOnStrinig(str) {
  const obj = {};

  if (!str) return obj;

  for (let n = str.split('\r\n'), r = 0; r < n.length; r++) {
    const o = n[r],
      a = o.indexOf(':');

    if (a > 0) {
      const i = o.substring(0, a);
      obj[i] = o.substring(a + 2);
    }
  }
}

console.log('IPDebug inject script success');

toJSON({});
workOnStrinig('');

const xhrProto = XMLHttpRequest.prototype,
  open = xhrProto.open,
  send = xhrProto.send,
  setRequestHeader = xhrProto.setRequestHeader;

xhrProto.open = function () {
  this.requestHeaders = {};

  return open.apply(this, arguments);
};

xhrProto.setRequestHeader = function (header, value) {
  this.requestHeaders[header] = value;

  return setRequestHeader.apply(this, arguments);
};

xhrProto.send = function () {
  this.addEventListener('load', function () {
    const url = this.responseURL;
    const responseHeaders = this.getAllResponseHeaders();

    console.log('__IPDebug responseHeaders: ', responseHeaders, url);

    try {
      if (this.responseType !== 'blob') {
        let responseBody;
        if (this.responseType === '' || this.responseType === 'text') {
          responseBody = JSON.parse(this.responseText);
        } /* if (this.responseType === 'json') */ else {
          responseBody = this.response;
        }
        // Do your stuff HERE.
        console.log('IPDebug responseBody: ', responseBody);
      }
    } catch (err) {
      console.log('Cannot get body response');
    }
  });

  send.apply(this, arguments);
};
