export default (state, path, elements) => {
  const { input, feedback } = elements;

  const validateInput = () => {
    if (state.form.isValid) {
      input.classList.remove('is-invalid');
    } else {
      input.classList.add('is-invalid');
    }
  };

  const printFeedback = () => {
    const feedbackClassList = {
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-danger',
    };
    feedback.textContent = state.feedback.text;
    Object.values(feedbackClassList).forEach((item) => {
      feedback.classList.remove(item);
    });
    feedback.classList.add(feedbackClassList[state.feedback.type]);
  };

  switch (path) {
    case 'form.isValid':
      validateInput();
      break;

    case 'form.inputValue':
      input.value = state.form.inputValue;
      break;

    case 'feedback.text':
      printFeedback();
      break;

    case 'form.readOnly':
      if (state.form.readOnly) {
        input.setAttribute('readonly');
      } else {
        input.removeAttribute('readonly');
      }
      break;

    default:
      // throw new Error('Unknown path recieved');
      break;
  }
};
