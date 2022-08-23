import onChange from 'on-change';
import * as yup from 'yup';
import i18 from 'i18next';
import axios from 'axios';
import view from './view.js';
import ru from './locales/ru.js';
import parser from './parser.js';
import 'bootstrap';
import uniqueId from './uniqueId.js';

const getProxyUrl = (url) => {
  const addr = new URL('https://allorigins.hexlet.app/get');
  addr.searchParams.set('url', url);
  addr.searchParams.set('disableCache', 'true');
  return addr;
};

const addNewPost = (post, feedId, watchedState) => {
  watchedState.rssPosts.push({
    rssFeedId: feedId,
    id: uniqueId('post'),
    title: post.itemTitle,
    description: post.itemDescription,
    link: post.itemLink,
  });
};

const addNewFeed = (rssObject, watchedState) => {
  const rssFeedId = uniqueId('feed');

  watchedState.rssFeeds.push({
    id: rssFeedId,
    title: rssObject.rssTitle,
    description: rssObject.rssDescription,
    link: watchedState.form.inputValue,
  });

  rssObject.posts.forEach((post) => addNewPost(post, rssFeedId, watchedState));
};

const getNewFeed = (url, watchedState) => {
  axios.get(getProxyUrl(url))
    .then((response) => {
      const rssObject = parser(response.data.contents);

      addNewFeed(rssObject, watchedState);
      watchedState.process.status = 'success';
      watchedState.form.inputValue = '';
    })
    .catch((error) => {
      watchedState.form.isValid = false;
      if (error.isAxiosError) watchedState.process.error = 'networkError';
      if (error.type === 'parseError') watchedState.process.error = 'notRss';
      watchedState.process.status = 'failed';
    });
};

const updateFeeds = (watchedState) => {
  const promises = watchedState.rssFeeds
    .map((rssFeed) => {
      axios.get(getProxyUrl(rssFeed.link))
        .then((response) => {
          const rssObject = parser(response.data.contents);
          const { posts } = rssObject;

          const titlesOfPostsInState = watchedState.rssPosts.map((post) => post.title);

          posts.forEach((post) => {
            if (!titlesOfPostsInState.includes(post.itemTitle)) {
              addNewPost(post, rssFeed.id, watchedState);
            }
          });
        })
        .catch((error) => {
          throw new Error(error);
        });
      return true;
    });
  Promise.all(promises).finally(() => setTimeout(() => updateFeeds(watchedState), 5000));
};

export default () => {
  i18
    .init({
      lng: 'ru',
      resources: { ru },
    })
    .then(() => {
      yup.setLocale({
        string: {
          url: 'errors.url',
        },
        mixed: {
          empty: 'errors.required',
        },
      });

      const elements = {
        form: document.querySelector('.rss-form'),
        input: document.getElementById('url-input'),
        feedback: document.querySelector('.feedback'),
        postsContainer: document.querySelector('.posts'),
        submitBtn: document.querySelector('button[type="submit"]'),
      };

      const state = {
        form: {
          inputValue: '',
          isValid: true,
        },
        process: {
          status: null, // working, success, error
          error: null,
        },
        rssFeeds: [],
        rssPosts: [],
        modal: null,
        ui: {
          visitedPosts: [],
        },
      };

      const watchedState = onChange(state, (path) => {
        view(state, path, elements);
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const inputValue = formData.get('url').trim();

        const schema = yup
          .string()
          .url()
          .notOneOf(state.rssFeeds.map((feed) => feed.link))
          .required();

        schema
          .validate(inputValue)
          .then(() => {
            watchedState.form.inputValue = inputValue;
            watchedState.form.isValid = true;
            watchedState.process.status = 'working';
            watchedState.process.error = 'null';

            getNewFeed(inputValue, watchedState);
          })
          .catch((error) => {
            watchedState.form.isValid = false;
            if (error.type === 'notOneOf') watchedState.process.error = 'rssExists';
            if (error.type === 'url') watchedState.process.error = 'url';
            watchedState.process.status = 'failed';
          });
      });

      elements.postsContainer.addEventListener('click', (e) => {
        const { id } = e.target.dataset;

        if (!id) return;
        watchedState.ui.visitedPosts.push(id);
        if (e.target.localName === 'button') watchedState.modal = id;
      });

      setTimeout(() => updateFeeds(watchedState), 5000);
    });
};
