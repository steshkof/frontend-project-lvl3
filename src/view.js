import i18 from 'i18next';

export default (state, path, elements) => {
  const { input, feedback, submitBtn } = elements;

  const validateInput = () => {
    if (state.form.isValid) {
      input.classList.remove('is-invalid');
    } else {
      input.classList.add('is-invalid');
    }
  };

  const blockForm = () => {
    input.setAttribute('readonly', '');
    submitBtn.setAttribute('disabled', '');
  };

  const unblockForm = () => {
    input.removeAttribute('readonly');
    submitBtn.removeAttribute('disabled');
  };

  const clearValue = () => {
    input.value = '';
  };

  const printFeedBack = (text, type = 'error') => {
    feedback.textContent = text;

    const feedbackClassList = {
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-danger',
    };

    Object.values(feedbackClassList).forEach((className) => {
      feedback.classList.remove(className);
    });

    feedback.classList.add(feedbackClassList[type]);
  };

  const errorMessages = {
    url: 'errors.url',
    rssExists: 'errors.rssExists',
    networkError: 'errors.networkError',
    notRss: 'errors.notRss',
  };

  const processFormAndFeedback = (status, error) => {
    switch (status) {
      case 'success':
        printFeedBack(i18.t('success'), 'success');
        clearValue();
        unblockForm();
        break;

      case 'working':
        printFeedBack(i18.t('working'), 'warning');
        blockForm();
        break;

      case 'failed':
        unblockForm();

        if (error in errorMessages) {
          printFeedBack(i18.t(errorMessages[error]));
        } else {
          printFeedBack(i18.t('errors.unknown'));
        }
        break;

      default:
        break;
    }
  };

  const printFeeds = () => {
    const feedsContainer = document.querySelector('.feeds');
    feedsContainer.innerHTML = '<div class="card border-0"><div class="card-body"><h2 class="card-title h4">Фиды</h2></div></div>';

    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');

    feedsContainer.querySelector('.card').append(ul);

    state.rssFeeds.forEach((feed) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0', 'border-end-0');

      const h3 = document.createElement('h3');
      h3.classList.add('h6', 'm-0');
      h3.textContent = feed.title;

      const p = document.createElement('p');
      p.classList.add('m-0', 'small', 'text-black-50');
      p.textContent = feed.description;

      li.append(h3, p);
      ul.append(li);
    });
  };

  const printPosts = () => {
    const postsContainer = document.querySelector('.posts');
    postsContainer.innerHTML = '<div class="card border-0"><div class="card-body"><h2 class="card-title h4">Посты</h2></div></div>';

    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');

    postsContainer.querySelector('.card').append(ul);

    state.rssPosts.forEach((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      const a = document.createElement('a');

      if (state.visitedPosts.includes(`${post.id}`)) {
        a.classList.add('fw-normal', 'link-secondary');
      } else {
        a.classList.add('fw-bold');
      }
      a.textContent = post.title;
      a.dataset.id = post.id;
      a.setAttribute('href', post.link);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');

      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.dataset.id = post.id;
      button.dataset.bsToggle = 'modal';
      button.dataset.bsTarget = '#modal';
      button.textContent = 'Просмотр';

      li.append(a);
      li.append(button);
      ul.append(li);
    });
  };

  const markVisitedPosts = () => {
    const visitedPostsIds = state.visitedPosts;
    document.querySelectorAll('.posts a').forEach((a) => {
      const id = a.getAttribute('data-id');
      if (visitedPostsIds.includes(id)) {
        a.classList.add('fw-normal', 'link-secondary');
        a.classList.remove('fw-bold');
      }
    });
  };

  const fillModal = () => {
    const post = state.rssPosts.find((rsspost) => rsspost.id === state.modal);

    const modal = document.getElementById('modal');
    modal.querySelector('.modal-title').textContent = post.title;
    modal.querySelector('.modal-body').textContent = post.description;
    modal.querySelector('.full-article').setAttribute('href', post.link);
  };

  switch (path) {
    case 'form.isValid':
      validateInput();
      break;

    case 'process.status':
      processFormAndFeedback(state.process.status, state.process.error);
      break;

    case 'process.error':
      processFormAndFeedback(state.process.status, state.process.error);
      break;

    case 'rssFeeds':
      printFeeds();
      break;

    case 'rssPosts':
      printPosts();
      break;

    case 'visitedPosts':
      markVisitedPosts();
      break;

    case 'modal':
      fillModal();
      break;

    default:
      break;
  }
};
