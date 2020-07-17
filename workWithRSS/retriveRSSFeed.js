async function getFeeds() {
  const urls = {
    rapidFeed: 'https://emergency.copernicus.eu/mapping/activations-rapid/feed',
    riskAndRecoveryFeed:
      'https://emergency.copernicus.eu/mapping/activations-risk-and-recovery/feed',
  };

  let rapidActivationFeed = extractItemData(
    await parseXmlRssFeed(urls.rapidFeed),
    12
  );
  let riskAndRecoveryFeed = extractItemData(
    await parseXmlRssFeed(urls.riskAndRecoveryFeed),
    1
  );

  return {
    rapidActivationFeed,
    riskAndRecoveryFeed,
  };
}

async function parseXmlRssFeed(url) {
  let parser = new DOMParser();
  let queryResult = await (await fetch(url)).text(); // get query to rss feed
  queryResult = parser.parseFromString(queryResult, 'text/xml'); //parsing from xml to DOM elements
  return queryResult.querySelectorAll('item'); // gets everything wrapped in item tag
}

function extractItemData(items, correction) {
  // some item elements don`t have equal number of fields, and query selector does not find the <georss:point> tag that is why i use childelements
  // but that element is always at position: number of elements - correction // for the rapid feed it is 12  //for the risk and recovery it is 1
  // number of required fields can be extended from here just add new entry to object
  let usefulInfo = [];
  items.forEach((e) => {
    usefulInfo.push({
      //making text object
      title: e.querySelector('title').textContent,
      description: e.querySelector('description').textContent,
      link: [
        ...e
          .querySelector('description')
          .textContent.matchAll(/https:\/\/emergency.*"/g), // getting links from description tag
      ],
      category: e.querySelector('category').textContent,
      guid: e.querySelector('guid').textContent,
      coordinates: e.children[e.childElementCount - correction].textContent,
    });
  });

  return usefulInfo;
}

//testing code here
// maybe get the feeds once per day ? and keep a copy locally not making a request every time someone makes a query to the server ?
console.log('here');
getFeeds().then((e) => {
  // this returns a promise
  console.log(e.rapidActivationFeed[0].link[0][0]);
  console.log(e.riskAndRecoveryFeed[0].link[0][0]);
});

console.log('here2');
