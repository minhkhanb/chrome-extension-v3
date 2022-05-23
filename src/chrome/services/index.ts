import { TabUrl } from '../../utils';

console.log('Background Script');

let url: string | undefined = '';
let userId = '';

const injectDom = () => {
  console.log('IPDebug inject Dom');
  document.body.style.backgroundColor = 'red';

  const swap = document.createElement('script');

  swap.id = 'swap-element';

  swap.src = chrome.runtime.getURL('inject.js');

  swap.onload = function () {
    console.log('IPDebug script injected');
  };

  document.body.appendChild(swap);

  return 'completed';
};

async function inject(tabId: number) {
  console.log('IPDebug Inject dom starting');

  console.log('IPDebug tabId: ', tabId);

  await chrome.scripting.executeScript(
    {
      target: {
        tabId,
        allFrames: false,
      },
      func: injectDom,
    },
    (injectionResults) => {
      console.log('IPDebug Frame Title: ', injectionResults);
    }
  );
}

chrome.tabs.onUpdated.addListener(function () {
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    if (!tabs[0]?.url) return;

    if (url !== tabs[0].url) {
      url = tabs[0].url;

      let matches = url.match(TabUrl.BASE_URL_MATCH_QUERY);

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

      if (matches !== null && matches && matches[1]) {
        userId = matches[1];

        if (tabs[0].id)
          chrome.tabs.sendMessage(tabs[0].id, {message: 'onPageLoad', search: matches[1]});
      }
    });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, () => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
      if (tabId === activeInfo.tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);

        console.log('tab: ', tab);
        if (!tab.id) return;

        inject(tabId);
      }
    });
  });
});