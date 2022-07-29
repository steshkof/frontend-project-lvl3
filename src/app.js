import onChange from 'on-change';
import * as yup from 'yup';
import i18 from 'i18next';
import axios from 'axios';
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
        // submitBtn: document.querySelector('button[type="submit"]'),
        feedback: document.querySelector('.feedback'),
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
      };

      const watchedState = onChange(state, (path) => {
        view(state, path, elements);
      });

      let uqiqId = 0;
      const getUqiqId = () => {
        uqiqId += 1;
        return uqiqId;
      };

      const proxyUrl = (url) => `https://allorigins.hexlet.app/get?url=${url}&disableCache=true`;

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const inputValue = formData.get('url');

        // validate input
        const schema = yup.string().url().required();
        schema
          .validate(inputValue)
          .then(() => {
            watchedState.form.inputValue = inputValue;
            watchedState.form.isValid = true;

            watchedState.feedback.type = 'warning';
            watchedState.feedback.text = i18.t('working');

            // watchedState.form.readOnly = true;

            axios.get(proxyUrl(inputValue))
              .then((response) => {
                const rssObject = parser(response.data.contents);
                const rssFeedId = getUqiqId();

                // add feed
                watchedState.rssFeeds.push({
                  id: rssFeedId,
                  title: rssObject.rssTitle,
                  description: rssObject.rssDescription,
                  link: rssObject.link,
                });

                // add items
                rssObject.items.forEach((item) => {
                  watchedState.rssPosts.push({
                    rssFeedId,
                    title: item.itemTitle,
                    description: item.itemDescription,
                    link: item.itemLink,
                  });
                });

                watchedState.feedback.type = 'success';
                watchedState.feedback.text = i18.t('success');
                watchedState.form.inputValue = '';
              })
              .catch(() => {
                watchedState.feedback.type = 'error';
                watchedState.feedback.text = i18.t('networkError');
              });
          })
          .catch(() => {
            watchedState.form.isValid = false;
            watchedState.feedback.type = 'error';
            watchedState.feedback.text = i18.t('errors.url');
            watchedState.form.inputValue = '';
          });
      });
    });
};
