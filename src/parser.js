export default (rssContent) => {
  const parser = new DOMParser();
  const parsedRSS = parser.parseFromString(rssContent, 'application/xml');

  const parserError = parsedRSS.querySelector('parsererror ');

  if (!parserError) {
    const rssTitle = parsedRSS.querySelector('title').textContent;
    const rssDescription = parsedRSS.querySelector('description').textContent;

    const itemsArray = [...parsedRSS.querySelectorAll('item')];
    const posts = itemsArray.map((item) => {
      const itemTitle = item.querySelector('title').textContent;
      const itemLink = item.querySelector('link').textContent;
      const itemDescription = item.querySelector('description').textContent;
      return { itemTitle, itemLink, itemDescription };
    });

    return {
      rssTitle, rssDescription, posts,
    };
  }

  const errorContent = parserError.textContent;
  console.error(errorContent);
  throw new Error(parserError);
};
