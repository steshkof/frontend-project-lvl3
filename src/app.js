import onChange from 'on-change';
import * as yup from 'yup';
import i18 from 'i18next';
import view from './view.js';
import ru from './locales/ru.js';

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
          isValid: true,
        },
      };

      const watchedState = onChange(state, (path) => {
        view(state, path, elements);
      });

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
          })
          .catch(() => {
            watchedState.form.isValid = false;
          });
      });
    });
};
