import i18 from 'i18next';

export default (state, path, elements) => {
  const {
    input, feedback,
  } = elements;

  const validateInput = (_state) => {
    if (_state.form.isValid) {
      input.classList.remove('is-invalid');
      feedback.textContent = '';
    } else {
      input.classList.add('is-invalid');
      feedback.textContent = i18.t('errors.url');
    }
  };

  switch (path) {
    case 'form.isValid':
      validateInput(state);
      break;

    default:
      break;
  }
};
