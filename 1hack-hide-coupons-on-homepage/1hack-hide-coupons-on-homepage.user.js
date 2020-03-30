// ==UserScript==

// @name                1hack Hide COUPONS on Homepage
// @description         Hide [COUPON] & [COUPONS] tagged topics on onehack.us homepage.
// @version             2.5

// @namespace           io.github.ni554n
// @match               https://onehack.us/
// @run-at              document-idle
// @inject-into         content

// @supportURL          https://github.com/ni554n/userscripts/issues
// @license             MIT

// @author              Nissan Ahmed
// @homepageURL         https://ni554n.github.io/
// @contributionURL     https://paypal.me/ni554n

// ==/UserScript==

// Initial list filtering right after the first page loads
hideCoupons([...document.getElementsByClassName("topic-list-item category-free-give-away")]);

/* This section deals with the dynamically loaded topics added to the bottom of the list because of scrolling and
recently updated topics added to the top. */

const tableBody = document.getElementsByClassName("topic-list ember-view")[0].tBodies[0];
let firstTopicBeforeUpdate = tableBody.firstElementChild;
let lastTopicBeforeUpdate = tableBody.lastElementChild;

startNewTopicObserver(new MutationObserver(function (mutationList, tableBodyObserver) {
  // Stop the event listener, because any topic removal will trigger new events.
  stopNewTopicObserver(tableBodyObserver);

  for (const mutation of mutationList) {
    if (mutation.type === 'childList' && mutation.addedNodes.length) {
      if (tableBody.firstElementChild !== firstTopicBeforeUpdate) {
        hideCoupons(filterUpdatedGiveawayCategoryTopics(firstTopicBeforeUpdate.previousElementSibling));
        firstTopicBeforeUpdate = tableBody.firstElementChild;
      } else {
        hideCoupons(filterGiveawayCategoryTopics(lastTopicBeforeUpdate.nextElementSibling)); // First topic from the new update
        lastTopicBeforeUpdate = tableBody.lastElementChild;
      }

      break;
    }
  }

  startNewTopicObserver(tableBodyObserver);
}));

function startNewTopicObserver(observer) {
  observer.observe(tableBody, {childList: true});
}

function stopNewTopicObserver(observer) {
  observer.disconnect();
}

function hideCoupons(topics) {

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    if (topic.innerText.includes("COUPON")) topic.parentNode.removeChild(topic);
  }
}

// Items added to the bottom of the list
function filterGiveawayCategoryTopics(startingRow) {
  const giveawayCategoryTopics = [];

  for (let topic = startingRow; topic != null; topic = topic.nextElementSibling) {
    if (topic.matches(".topic-list-item.category-free-give-away")) giveawayCategoryTopics.push(topic);
  }

  return giveawayCategoryTopics;
}

// New items added to the top of the list
function filterUpdatedGiveawayCategoryTopics(bottomRow) {
  const giveawayCategoryTopics = [];

  for (let topic = bottomRow; topic != null; topic = topic.previousElementSibling) {
    if (topic.matches(".topic-list-item.category-free-give-away")) giveawayCategoryTopics.push(topic);
  }

  return giveawayCategoryTopics;
}
