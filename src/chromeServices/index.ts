import { TabUrl } from '../utils';

console.log('Background Script');

let url: string | undefined = '';
let userId = '';

chrome.tabs.onUpdated.addListener(function () {
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    if (!tabs[0]?.url) return;

    if (url !== tabs[0].url) {
      url = tabs[0].url;

      let matches = url.match(TabUrl.BASE_URL_MATCH_QUERY);

      console.log('bg onUpdated matches: ', matches);

      if (matches && matches[1] && matches[1] !== userId) {
        userId = matches[1];

        if (tabs[0].id)
          chrome.tabs.sendMessage(tabs[0].id, {message: 'onPageLoad', search: matches[1]});
      }
    }
  });
});

chrome.runtime.onMessage.addListener(function (params) {
  console.log('bg onmessage: ', params);
  if (params.message === 'onPageLoad') {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
      if (!tabs[0]?.url) return;

      url = tabs[0].url;

      let matches = url.match(TabUrl.BASE_URL_MATCH_QUERY);

      console.log('bg onMessage matches: ', matches, tabs[0].id);

      if (matches !== null && matches && matches[1]) {
        userId = matches[1];

        if (tabs[0].id)
          chrome.tabs.sendMessage(tabs[0].id, {message: 'onPageLoad', search: matches[1]});
      }
    });
  }
});