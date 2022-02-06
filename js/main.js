document.body.addEventListener('click', (e) => {
    const currentCard = e.target.closest('[data-card]'); // текущая карточка
    const cardNumber = +currentCard.dataset.card; // номер текущей карточки
    const direction = e.target.dataset.action; // следующее направление
    const clickedLabel = e.target.closest('label'); // кликнутый label

    if (direction === 'next') {
        // если клик по кнопке "далее"
        if (currentCard.classList.contains('no_validate')) {
            // если не надо валидировать перемещаемся на следующую карточку
            navigate('next', currentCard, cardNumber);
            // обновляем прогресс
            updateProgressbar(cardNumber);
        } else {
            // собираем данные и сохраняем в объект
            answers[cardNumber] = getCardData(currentCard);
            if (isFilled(cardNumber) && checkRequired(currentCard)) {
                // если карточка заполнена и обязательные поля(если есть)
                // и идем дальше
                navigate('next', currentCard, cardNumber);
                // обновляем прогресс
                updateProgressbar(cardNumber);
            } else {
                // иначе показываем разный алерт
                showErrorMessage(currentCard);
            }
        }
    } else if (direction === 'prev') {
        navigate('prev', currentCard, cardNumber);
        // обновляем прогресс
        updateProgressbar(cardNumber - 2);
    }

    // если клик по label
    if (clickedLabel) addFrame(clickedLabel, currentCard);
});

const answers = {};
// количество карточек именно с вопросами (без старта и финиша)
const totalCard = document.querySelectorAll('[data-card]').length - 2;

// заполняем answers начальными значениями (нужно для прогрессбар)
for (let i = 0; i < totalCard; i++) answers[i + 2] = null;

// перемещение по карточкам
const navigate = (direction, currentCard, cardNumber) => {
    currentCard.classList.add('none');
    document
        .querySelector(`[data-card="${direction === 'next' ? cardNumber + 1 : cardNumber - 1}"]`)
        .classList.remove('none');
};

// сбор данных
const getCardData = (currentCard) => {
    const cardData = {
        question: null,
        answer: [],
    };
    cardData.question = currentCard.querySelector('[data-question]').innerText;
    const inputs = currentCard.querySelectorAll('input');
    inputs.forEach((item) => {
        // пушим данные из выбранных инпутов
        if (item.checked) cardData.answer.push({name: item.name, value: item.value});
        if (item.type === 'email' && item.value.trim() !== '')
            cardData.answer.push({name: item.name, value: item.value});
    });
    return cardData;
};

// проверка на заполнение карточки
const isFilled = (cardNumber) => {
    return answers[cardNumber].answer.length;
};

//  показываем сообщение
const showErrorMessage = (currentCard) => {
    const RadioEl = currentCard.querySelector('[type="radio"]');
    const CheckboxEl = currentCard.querySelector('[type="checkbox"]');
    const EmailEl = currentCard.querySelector('[type="email"]');
    let message;
    if (RadioEl) {
        // если на текущей странице есть radio
        message = 'Выберите ОДИН из ответов, чтобы пройти далее.';
    } else if (CheckboxEl && EmailEl && !isValid(EmailEl.value)) {
        // если мы на странице с формой, и не валидный email
        message = 'Невалидный или пустой Email';
    } else if (CheckboxEl && EmailEl && !CheckboxEl.checked) {
        // если мы на странице с формой, email валидный, но checkbox не отмечен
        message = 'Вы должны согласиться с политикой конфеденциальности.';
    } else if (CheckboxEl) {
        // если на текущей странице есть checkbox
        message = 'Выберите один ИЛИ несколько ответов, чтобы пройти далее.';
    }
    alert(message);
};

// проверка на заполнение обязательных полей
const checkRequired = (currentCard) => {
    const requiredFields = currentCard.querySelectorAll('[required]');
    // если на странице есть обязательные поля
    if (requiredFields.length) {
        const isValidArray = [];
        requiredFields.forEach((item) => {
            // если оба поля валидны то в массиве isValidArray должно быть два элемента
            if ((item.type === 'checkbox' && item.checked) || (item.type === 'email' && isValid(item.value)))
                isValidArray.push(true);
        });
        return isValidArray.length === 2;
    } else {
        // если на странице нет обязательных полей
        return true;
    }
};

// проверяем email
const isValid = (email) => {
    return /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i.test(email);
};

// добавляем или убираем рамку
const addFrame = (clickedLabel, currentCard) => {
    // проверка на класс кликнутого label
    const isContains = (selector) => clickedLabel.classList.contains(selector);

    if (isContains('checkbox-block') && clickedLabel.firstElementChild.checked) {
        // если это чекбокс И он выбран, добавляем актив.
        clickedLabel.classList.add('checkbox-block--active');
    } else if (isContains('checkbox-block')) {
        // иначе убираем актив если чекбокс не выбран
        clickedLabel.classList.remove('checkbox-block--active');
    } else if (isContains('radio-block') || isContains('card-block')) {
        // если это радио, удаляем у всех и добавляем к текущему
        currentCard.querySelectorAll('label').forEach((label) => {
            label.classList.remove('block--active');
        });
        clickedLabel.classList.add('block--active');
    }
};

// прогресс бар
const updateProgressbar = (cardNumber) => {
    const countCard = Object.keys(answers).length;
    const progressBar = (100 / (countCard / cardNumber)).toFixed();
    document.querySelectorAll('.progress').forEach((item) => {
        item.querySelector('.progress__label strong').innerText = `${progressBar}%`;
        item.querySelector('.progress__line-bar').style.width = `${progressBar}%`;
    });
};
