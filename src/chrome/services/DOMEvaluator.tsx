import React from 'react';
import ReactDOM from 'react-dom';
import UserWrap from '../ui/section/UserWrap';
import { TabUrl } from '../../utils';

console.log('Content Script');

let userWrap = document.createElement('div');
userWrap.setAttribute('id', 'user-wrap');

document.body.appendChild(userWrap);

const renderUI = (search: any) => {
  ReactDOM.render(<UserWrap search={search} />, document.getElementById('user-wrap'));
};

chrome.runtime.onMessage.addListener((params) => {
  if (params.message === 'onPageLoad') {
    if (window.location.href.indexOf(TabUrl.BASE_URL) !== -1) {
      const loadedStates = ['complete', 'loaded', 'interactive'];

      const { search } = params;

      if (loadedStates.includes(document.readyState) && document.body) {
        renderUI(search);
      } else {
        window.addEventListener('DOMContentLoaded', renderUI, false);
      }
    }
  }
});

chrome.runtime.sendMessage({message: 'onPageLoad'});

