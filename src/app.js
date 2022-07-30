/*eslint-disable*/

import onChange from 'on-change';
import * as yup from 'yup';
import i18 from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import view from './view.js';
import ru from './locales/ru.js';
import parser from './parser.js';

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
        // submitBtn: document.querySelector('button[type="submit"]'),
      };

      const state = {
        form: {
          inputValue: '',
          readOnly: false,
          isValid: true,
        },
        feedback: {
          text: '',
          type: '',
        },
        rssFeeds: [],
        rssPosts: [],
        visitedPosts: [],
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

      const addNewFeed = (rssObject) => {
        const rssFeedId = _.uniqueId();

        watchedState.rssFeeds.push({
          id: rssFeedId,
          title: rssObject.rssTitle,
          description: rssObject.rssDescription,
          link: state.form.inputValue,
        });

        rssObject.items.forEach((item) => {
          watchedState.rssPosts.push({
            rssFeedId,
            id: _.uniqueId(),
            title: item.itemTitle,
            description: item.itemDescription,
            link: item.itemLink,
          });
        });
      };

      const updateFeeds = () => {
        const promises = state.rssFeeds
          .map((rssFeed) => {
            axios.get(proxyUrl(rssFeed.link))
              .then((response) => {
                const rssObject = parser(response.data.contents);
                const posts = rssObject.items;

                const titlesOfPostsInState = state.rssPosts.map((post) => post.title);

                posts.forEach((post) => {
                  if (!titlesOfPostsInState.includes(post.itemTitle)) {
                    watchedState.rssPosts.push({
                      rssFeedId: rssFeed.id,
                      id: _.uniqueId(),
                      title: post.itemTitle,
                      description: post.itemDescription,
                      link: post.itemLink,
                    });
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

      const setFeedback = (type, text) => {
        watchedState.feedback.type = type;
        watchedState.feedback.text = text;
      };

      const setInputValue = (value = '') => {
        watchedState.form.inputValue = value;
      };

      const setFormValidation = (value) => {
        watchedState.form.isValid = value;
      };

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const inputValue = formData.get('url');

        const schema = yup.string().url().required();
        schema
          .validate(inputValue)
          .then(() => {
            setInputValue(inputValue);
            setFormValidation(true);
            setFeedback('warning', i18.t('working'));

            axios.get(proxyUrl(inputValue))
              .then((response) => {
                const rssObject = parser(response.data.contents);

                if (!feedExists(inputValue)) {
                  addNewFeed(rssObject);
                  setFeedback('success', i18.t('success'));
                  setInputValue();
                } else {
                  setFormValidation(false);
                  setFeedback('error', i18.t('errors.rssExists'));
                }
              })
              .catch((error) => {
                // setFeedback('error', i18.t('networkError'));
                setFeedback('error', error);
                setFormValidation(false);
              });
          })
          .catch(() => {
            setFormValidation(false);
            setFeedback('error', i18.t('errors.url'));
            setInputValue();
          });
      });

      elements.postsContainer.addEventListener('click', (e) => {
        const { id } = e.target.dataset;

        if (!id) return;
        
        watchedState.visitedPosts.push(id)

        
        // const currentPost = state.rssPosts.find(({ id: postId }) => postId === id);
        // currentPost.visited = true;

      })

      setTimeout(() => updateFeeds(), 5000);
    });
};
