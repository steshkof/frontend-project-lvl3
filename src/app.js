import onChange from 'on-change';
import * as yup from 'yup';
import i18 from 'i18next';
import axios from 'axios';
import view from './view.js';
import ru from './locales/ru.js';
import parser from './parser.js';
import 'bootstrap';

export default () => {
  i18
    .init({
      lng: 'ru',
      resources: { ru },
    })
    .then(() => {
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
          readOnly: false,
          isValid: true,
        },
        process: {
          status: null, // working, success, error
          error: null,
        },
        rssFeeds: [],
        rssPosts: [],
        visitedPosts: [],
        modal: null,
      };

      const watchedState = onChange(state, (path) => {
        view(state, path, elements);
      });

      const proxyUrl = (url) => `https://allorigins.hexlet.app/get?url=${url}&disableCache=true`;

      const feedExists = (link) => {
        const rssLinksArray = state.rssFeeds.map((rssFeed) => rssFeed.link);
        if (rssLinksArray.includes(link)) return true;
        return false;
      };

      const uniqueId = (function () {
        const prefixes = { default: 0 };
        return (prefix) => {
          if (prefix) {
            if (!prefixes[prefix]) prefixes[prefix] = 0;
            prefixes[prefix] += 1;
            return `${prefix}-${prefixes[prefix]}`;
          }
          prefixes.default += 1;
          return `${prefixes.default}`;
        };
      }());

      const addNewPost = (post, feedId) => {
        watchedState.rssPosts.push({
          rssFeedId: feedId,
          id: uniqueId('post'),
          title: post.itemTitle,
          description: post.itemDescription,
          link: post.itemLink,
        });
      };

      const addNewFeed = (rssObject) => {
        const rssFeedId = uniqueId('feed');

        watchedState.rssFeeds.push({
          id: rssFeedId,
          title: rssObject.rssTitle,
          description: rssObject.rssDescription,
          link: state.form.inputValue,
        });

        rssObject.posts.forEach((post) => addNewPost(post, rssFeedId));
      };

      const updateFeeds = () => {
        const promises = state.rssFeeds
          .map((rssFeed) => {
            axios.get(proxyUrl(rssFeed.link))
              .then((response) => {
                const rssObject = parser(response.data.contents);
                const { posts } = rssObject;

                const titlesOfPostsInState = state.rssPosts.map((post) => post.title);

                posts.forEach((post) => {
                  if (!titlesOfPostsInState.includes(post.itemTitle)) {
                    addNewPost(post, rssFeed.id);
                  }
                });
              })
              .catch((error) => {
                throw new Error(error);
              });
            return true;
          });
        Promise.all(promises).finally(() => setTimeout(() => updateFeeds(), 5000));
      };

      const setFormValidation = (value) => {
        watchedState.form.isValid = value;
      };

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const inputValue = formData.get('url').trim();

        yup.setLocale({
          string: {
            url: 'errors.url',
          },
          mixed: {
            empty: 'errors.required',
          },
        });

        const schema = yup.string().url().required();
        schema
          .validate(inputValue)
          .then(() => {
            watchedState.form.inputValue = (inputValue);
            setFormValidation(true);
            watchedState.process.status = 'working';
            watchedState.process.error = 'null';

            axios.get(proxyUrl(inputValue))
              .then((response) => {
                const rssObject = parser(response.data.contents);

                if (!feedExists(inputValue)) {
                  addNewFeed(rssObject);
                  watchedState.process.status = 'success';
                  watchedState.form.inputValue = '';
                } else {
                  setFormValidation(false);
                  watchedState.process.error = 'rssExists';
                  watchedState.process.status = 'failed';
                }
              })
              .catch((error) => {
                setFormValidation(false);
                if (error.isAxiosError) {
                  watchedState.process.error = 'networkError';
                } else {
                  watchedState.process.error = 'notRss';
                }
                watchedState.process.status = 'failed';
              });
          })
          .catch(() => {
            setFormValidation(false);
            watchedState.process.error = 'url';
            watchedState.process.status = 'failed';
            console.log(watchedState);
          });
      });

      elements.postsContainer.addEventListener('click', (e) => {
        const { id } = e.target.dataset;

        if (!id) return;
        watchedState.visitedPosts.push(id);
        if (e.target.localName === 'button') watchedState.modal = id;
      });

      setTimeout(() => updateFeeds(), 5000);
    });
};
