const openModalButtons = document.querySelectorAll('[data-open-modal]');
const closeCurrentModalButtons = document.querySelectorAll('.close-modal-button');
const menu = document.querySelector('.menu');
const overlay = document.querySelector('.overlay');


// note
const noteForm = document.querySelector('.note__form');
const ul = document.querySelector('ul.item-list');

// Todo list
const todoListForm = document.querySelector('.modal.todo > form');
const todoList = document.querySelector('.todo__list');
const appendTopButton = document.querySelector('#append-top');
const appendBottomButton = document.querySelector('#append-bottom');

// Todo item
const todoItemModal = document.querySelector('.todo-item');
const todoItemNextButton = document.querySelector('.todo-item__button-container__next');
const todoItemConfirmButton = document.querySelector('.todo-item__button-container__confirm');

// Storage
let itemList = JSON.parse(localStorage.getItem('itemList')) || [];

function displayItem(item) {
    const li = document.createElement("li");
    const newTitle = document.createTextNode(item.title);
    const span = document.createElement("span");
    span.appendChild(newTitle)
    li.appendChild(span);
    li.setAttribute('data-open-modal', item.modal)
    li.setAttribute('data-id', item.id)
    const deleteButton = '<button class="delete-item" type="button"><span>&times</span></button>';
    li.innerHTML += deleteButton;

    // open existing note / todo list
    li.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(document.querySelector(li.dataset.openModal));
        if (li.dataset.openModal === '.note') {
            noteForm.setAttribute('data-id', li.dataset.id);
            noteForm.querySelector('.note__title').value = item.title;
            noteForm.querySelector('.note__body').value = item.content;
        } else if (li.dataset.openModal === '.todo') {
            todoListForm.setAttribute('data-id', li.dataset.id);
            todoListForm.querySelector('.todo__title').value = item.title;
            item.content.forEach(item => {
                addAndClearTodoItem(item, 'bottom')
            })
        }

    });
    ul.appendChild(li);
}

let displayItemList = () => {
    if (itemList.length === 0) {
        ul.innerHTML = 'There is currently no notes!'
        return;
    }
    ul.innerHTML = '';
    for (const item of itemList) {
        displayItem(item)
    }
    updateDeleteButtons();
};

let updateLocalStorage = () => {localStorage.setItem('itemList', JSON.stringify(itemList))};

displayItemList();
// General
openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
    openModal(document.querySelector(button.dataset.openModal));
    })
})

closeCurrentModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        closeCurrentModal(button);
    })
})

overlay.addEventListener('click', () => {
    closeAllModal();
})

function openModal(modal) {
    if (modal === null) return;
    modal.classList.add('active');
    overlay.classList.add('active');
    modal.classList.contains('todo-item') && (overlay.style.zIndex = 100);
}

function closeCurrentModal(modal) {
    if (modal === null) return;
    // search for parent if it is not an active modal
    if (!modal.classList.contains('active') || !modal.classList.contains('modal')) {
        modal = modal.closest('.modal.active')
        if (modal === null) return;
    }
    modal.classList.remove('active');
    if (document.querySelector('.modal.active') === null) {
        overlay.classList.remove('active');
    }

    // Initial the form

    modal.hasAttribute('append-method') && modal.removeAttribute('append-method');
    modal.hasAttribute('data-id') && modal.removeAttribute('data-id')
    modal.querySelector('form') && modal.querySelector('form').reset();
    if (modal.classList.contains('todo-item')) {
        todoItemModal.querySelector('.todo-item__body').value = '';
        overlay.style.zIndex = 0;
    } 
    if (modal.classList.contains('todo')) {
        todoList.querySelectorAll('.todo__item:not(.todo__item--add').forEach(item => item.remove())
        }
    }

function closeAllModal() {
    document.querySelectorAll('.modal.active').forEach(modal => closeCurrentModal(modal));
    overlay.classList.remove('active');
}

const getRandomID = () => Math.floor(Math.random() * 1000000) + 1;

//note
// When submit, check the title and content
// and append to the li

noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleElement = noteForm.querySelector('.note__title');
    const contentElement = noteForm.querySelector('.note__body');
    let title = titleElement.value;
    let content = contentElement.value;
    if (title !== '' && content !== '') {
        let formData = {'title':title, 'content':content, 'modal':'.note'}
        if (noteForm.hasAttribute('data-id')) {
            itemList = itemList.map(item => item.id == noteForm.getAttribute('data-id') ? {...item, ...formData} : item)
        } else {
            itemList.push({'id': getRandomID(), ...formData})
        }
        updateLocalStorage();
        displayItemList();
        closeAllModal();
    }
})

function updateDeleteButtons() {
    const deleteButtons = document.querySelectorAll('li > button.delete-item')
    deleteButtons.forEach((button, idx) => {
        button.addEventListener('click', (e) => {
            // stopPropagation prevents item form opening
            e.stopPropagation();
            itemList.splice(idx, 1);
            button.closest('li').remove();
            updateLocalStorage();
            displayItemList();
        });
    })
}


// Todo List
todoListForm.addEventListener('submit', e => {
    e.preventDefault();
    const titleElement = todoListForm.querySelector('.todo__title');
    const contentElements = todoListForm.querySelectorAll('.todo__item:not(.todo__item--add)');
    let title = titleElement.value;
    const content = [];
    contentElements.forEach((element) => content.push(element.firstChild.textContent))
    if (title !== '' && content !== []) {
        let formData = {'title':title, 'content':content, 'modal':'.todo'}
        if (todoListForm.hasAttribute('data-id')) {
            itemList = itemList.map(item => item.id == todoListForm.getAttribute('data-id') ? {...item, ...formData} : item)
        } else {
            itemList.push({'id': getRandomID(), ...formData})
        }
        
        updateLocalStorage();
        displayItemList();
        closeAllModal();

    }
})

appendTopButton.addEventListener('click', () => {
    todoItemModal.setAttribute('append-method', 'top')
})

appendBottomButton.addEventListener('click', () => {
    todoItemModal.setAttribute('append-method', 'bottom')
})

// Todo Item

todoItemConfirmButton.addEventListener('click', () => {
    let todoItemBody= todoItemModal.querySelector('.todo-item__body');
    let appendMethod = todoItemModal.getAttribute('append-method');
    const is_success = addAndClearTodoItem(todoItemBody.value, appendMethod);
    if (is_success) {
        closeCurrentModal(todoItemModal)
    };
})

todoItemNextButton.addEventListener('click', () => {
    let todoItemBody = todoItemModal.querySelector('.todo-item__body');
    let appendMethod = todoItemModal.getAttribute('append-method');
    const is_success = addAndClearTodoItem(todoItemBody.value, appendMethod);
    if (is_success) {
        todoItemBody.value = '';
        todoItemBody.focus();
    };
})

function addAndClearTodoItem(todoItemBodyText, appendMethod) {
    if (todoItemBodyText === '') return false;
    const li = document.createElement("li");
    const span = document.createElement("span")
    li.classList.add('todo__item')
    const newTitle = document.createTextNode(todoItemBodyText);
    span.appendChild(newTitle)
    li.appendChild(span);
    const deleteButton = '<button class="delete-item" type="button"><span>&times</span></button>';
    li.innerHTML += deleteButton;
    updateDeleteButtons();
    
    if ( appendMethod === 'top') {
        todoList.insertBefore(li, todoList.querySelector('.todo__item--add:first-of-type').nextElementSibling);
    } else if (appendMethod === 'bottom') {
        todoList.insertBefore(li, todoList.querySelector('.todo__item--add:last-of-type'));
    } else {
        console.log('append method not found')
    }
    return true;
}


