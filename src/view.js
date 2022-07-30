/*eslint-disable*/

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
    Object.values(feedbackClassList).forEach((className) => {
      feedback.classList.remove(className);
    });
    feedback.classList.add(feedbackClassList[state.feedback.type]);
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
    })
  }

  const printPosts = () => {
    const postsContainer = document.querySelector('.posts');
    postsContainer.innerHTML = '<div class="card border-0"><div class="card-body"><h2 class="card-title h4">Посты</h2></div></div>';
    
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0')

    postsContainer.querySelector('.card').append(ul);

    state.rssPosts.forEach((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      const a = document.createElement('a');
      a.classList.add('fw-bold');
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
    })
  }

  const markVisitedPosts = () => {
    const visitedPostsIds = state.visitedPosts;
    document.querySelectorAll('.posts a').forEach((a) => {
      const id = a.getAttribute('data-id');
      if (visitedPostsIds.includes(id)) {
        a.classList.add('fw-normal', 'link-secondary');
        a.classList.remove('fw-bold');
      }
    });
  }

  const fillModal = () => {
    const post = state.rssPosts.find((post) => post.id === state.modal);

    const modal = document.getElementById('modal');
    modal.querySelector('.modal-title').textContent = post.title;
    modal.querySelector('.modal-body').textContent = post.description;
    modal.querySelector('.full-article').setAttribute('href', post.link);
    console.log(post);
  }

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

    case 'rssFeeds':
      printFeeds();
      break;

    case 'rssPosts':
      printPosts();
      break
    
    case 'visitedPosts':
      markVisitedPosts();
      break;

    case 'modal':
        fillModal();
        break;

    default:
      // throw new Error('Unknown path recieved');
      break;
  }
};
