export default (rssContent) => {
  const parser = new DOMParser();
  const parsedRSS = parser.parseFromString(rssContent, 'application/xml');

  const rssTitle = parsedRSS.querySelector('title').textContent;
  const rssDescription = parsedRSS.querySelector('description').textContent;
  const rssLink = parsedRSS.querySelector('link').textContent;

  const itemsArray = [...parsedRSS.querySelectorAll('item')];
  const items = itemsArray.map((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const itemLink = item.querySelector('link').textContent;
    const itemDescription = item.querySelector('description').textContent;
    return { itemTitle, itemLink, itemDescription };
  });

  return {
    rssTitle, rssDescription, rssLink, items,
  };
};
