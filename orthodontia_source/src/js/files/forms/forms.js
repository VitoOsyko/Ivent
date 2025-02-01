// Подключение функционала "Чертогов Фрилансера"
// Подключение списка активных модулей
import { mhzModules } from "../modules.js";
// Вспомогательные функции
import { isMobile, _slideUp, _slideDown, _slideToggle, FLS } from "../functions.js";
// Модуль прокрутки к блоку
import { gotoBlock } from "../scroll/gotoblock.js";
//================================================================================================================================================================================================================================================================================================================================

/*
Документация: https://template.fls.guru/template-docs/rabota-s-formami.html
*/

// Работа с полями формы. Добавление классов, работа с placeholder
export function formFieldsInit(options = { viewPass: false }) {
	// Если включено, добавляем функционал "скрыть плейсходлер при фокусе"
	const formFields = document.querySelectorAll('input,textarea');
	if (formFields.length) {
		formFields.forEach(formField => {
			if (formField.hasAttribute('placeholder')&&!formField.hasAttribute('data-placeholder-nohide')) {
				formField.dataset.placeholder = formField.placeholder;
			}
			if (!formField.hasAttribute('data-no-focus-classes')&&formField.value !== '') {
				formField.classList.add('_form-input');
				formField.parentElement.classList.add('_form-input');
			}
		});
	}
	document.body.addEventListener("focusin", function (e) {
		let targetElement = e.target;
		if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') || targetElement.closest('.select')) {
      if (targetElement.closest('.select')) {
        targetElement = targetElement.closest('.select').querySelector('select');
      }
			if (targetElement.dataset.placeholder) {
				targetElement.placeholder = '';
			}
			if (!targetElement.hasAttribute('data-no-focus-classes')) {
				targetElement.classList.add('_form-focus');
				targetElement.parentElement.classList.add('_form-focus');
				targetElement.classList.add('_form-input');
				targetElement.parentElement.classList.add('_form-input');
			}
      if (targetElement.type==='radio') {
        const parent = targetElement.closest('[data-radio-parent]');
        parent ? formValidate.removeError(parent) : null;
        let name = targetElement.name;
        document.querySelectorAll(`[name="${name}"]`).forEach(e=>{formValidate.removeError(e)});
        formValidate.removeError(targetElement);
      } else {
        formValidate.removeError(targetElement);
      }
		}
	});
	document.body.addEventListener("focusout", function (e) {
		const targetElement = e.target;
		if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
			if (targetElement.dataset.placeholder) {
				targetElement.placeholder = targetElement.dataset.placeholder;
			}
			if (!targetElement.hasAttribute('data-no-focus-classes')) {
				targetElement.classList.remove('_form-focus');
				targetElement.parentElement.classList.remove('_form-focus');
        if (targetElement.value === '') {
          targetElement.classList.remove('_form-input');
          targetElement.parentElement.classList.remove('_form-input');
        }
			}
			// Моментальная валидация
			if (targetElement.hasAttribute('data-validate')) {
				formValidate.validateInput(targetElement);
			}
		}
	});

	// Если включено, добавляем функционал "Показать пароль"
	if (options.viewPass) {
		document.addEventListener("click", function (e) {
			let targetElement = e.target;
      const viewPassEl = targetElement.closest('[class*="__viewpass"]');
			if (viewPassEl) {
				let inputType = viewPassEl.classList.contains('_viewpass-active') ? "password" : "text";
				viewPassEl.parentElement?.querySelector('input').setAttribute("type", inputType);
				viewPassEl.classList.toggle('_viewpass-active');
			}
		});
	}
}
// Валидация форм
export let formValidate = {
	getErrors(form, validate) {
		let error = 0;
		let formRequiredItems = form.querySelectorAll('*[data-required]');
		if (formRequiredItems.length) {
			formRequiredItems.forEach(formRequiredItem => {
				if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
					error += this.validateInput(formRequiredItem, validate);
				}
			});
		}
		return error;
	},
	validateInput(formRequiredItem, validate = true) {
		let error = 0;
		if (formRequiredItem.dataset.required === "email") {
      if (!formRequiredItem.inputmask) {
        formRequiredItem.value = formRequiredItem.value.replace(" ", "");
      }
			if (this.emailTest(formRequiredItem)) {
				validate ? this.addError(formRequiredItem) : null;
				error++;
			} else {
				this.removeError(formRequiredItem);
			}
		} else if (formRequiredItem.dataset.required === "phone") {
			// formRequiredItem.value = formRequiredItem.value.replace(" ", "");
			if (this.phoneTest(formRequiredItem)) {
				validate ? this.addError(formRequiredItem) : null;
				error++;
			} else {
				this.removeError(formRequiredItem);
			}
		} else if (formRequiredItem.dataset.required === "fio") {
			if (this.fioTest(formRequiredItem)) {
				validate ? this.addError(formRequiredItem) : null;
				error++;
			} else {
				this.removeError(formRequiredItem);
			}
		} else if (formRequiredItem.dataset.required === "password") {
      const parentForm = formRequiredItem.closest('form');
      const passwordRequireds = parentForm.querySelectorAll('[data-required="password"]');
      let errorObj = this.passwordTest(passwordRequireds);
			if (passwordRequireds.length&&errorObj.status) {
        passwordRequireds.forEach(e=>{
          // validate ? this.addError(e, errorObj, true) : null;
          this.addError(e, errorObj.text)
        })
				error++;
			} else {
        passwordRequireds.forEach(e=>{
          this.removeError(e);
          this.addSuccess(e, errorObj.text)
        })
			}
		}  else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
			validate ? this.addError(formRequiredItem) : null;
			error++;
		} else if (formRequiredItem.type === "radio") {
      let name = formRequiredItem.name;
      if (!document.querySelector(`input[name="${name}"]:checked`)) {
				validate ? this.addError(formRequiredItem) : null;
				error++;
      } else {
				this.removeError(formRequiredItem);
			}
    } else {
			if (!formRequiredItem.value.trim()) {
        let condition = !formRequiredItem.hidden&&!formRequiredItem.closest('[hidden]');
        if (formRequiredItem.tagName === 'SELECT') {
          condition = true;
        }
        if (condition) {
          validate ? this.addError(formRequiredItem) : null;
          error++;
        }
			} else {
				this.removeError(formRequiredItem);
			}
		}
		return error;
	},
	addError(formRequiredItem, errorTextArg) {
    const parentForm = formRequiredItem.closest('form');
    let forError = formRequiredItem.parentElement;
    if (parentForm&&parentForm.querySelector('[data-forerror]')) {
      forError = parentForm.querySelector('[data-forerror]');
    }
		formRequiredItem.classList.add('_form-error');
		formRequiredItem.parentElement.classList.add('_form-error');
		formRequiredItem.classList.remove('_form-success');
		formRequiredItem.parentElement.classList.remove('_form-success');

		let inputError = forError.querySelector('.form__error');
		let inputSuccess = forError.querySelector('.form__success');
		if (inputError) forError.removeChild(inputError);
		if (inputSuccess) forError.removeChild(inputSuccess);
    let errorText = formRequiredItem.dataset.error;
    if (errorTextArg) {
      errorText =  errorTextArg;
    }
		if (errorText&&errorText.trim()) {
      let className = 'form__error';
			forError.insertAdjacentHTML('beforeend', `<div class="${className}">${errorText}</div>`);
		}
	},
  addSuccess(formRequiredItem, successTextArg) {
    const parentForm = formRequiredItem.closest('form');
    let forError = formRequiredItem.parentElement;
    if (parentForm&&parentForm.querySelector('[data-forerror]')) {
      forError = parentForm.querySelector('[data-forerror]');
    }
		formRequiredItem.classList.remove('_form-error');
		formRequiredItem.parentElement.classList.remove('_form-error');
		formRequiredItem.classList.add('_form-success');
		formRequiredItem.parentElement.classList.add('_form-success');

		let inputError = forError.querySelector('.form__error');
		let inputSuccess = forError.querySelector('.form__success');
		if (inputError) forError.removeChild(inputError);
		if (inputSuccess) forError.removeChild(inputSuccess);
    let errorText = formRequiredItem.dataset.error;
    if (successTextArg) {
      errorText =  successTextArg;
    }
		if (errorText&&errorText.trim()) {
      let className = 'form__success';
			forError.insertAdjacentHTML('beforeend', `<div class="${className}">${errorText}</div>`);
		}
  },
	removeError(formRequiredItem) {
    const parentForm = formRequiredItem.closest('form');
    let forError = formRequiredItem.parentElement;
    if (parentForm&&parentForm.querySelector('[data-forerror]')) {
      forError = parentForm.querySelector('[data-forerror]');
    }

		formRequiredItem.classList.remove('_form-error');
		formRequiredItem.parentElement.classList.remove('_form-error');
		if (forError.querySelector('.form__error')) {
			forError.removeChild(forError.querySelector('.form__error'));
		}
	},
	formClean(form, clearboxes = true) {
    if (form.tagName === 'FORM') {
      form.reset();
    }
		setTimeout(() => {
      console.log('formClean')
			let inputs = form.querySelectorAll('input,textarea');
			for (let index = 0; index < inputs.length; index++) {
				const el = inputs[index];
				el.parentElement.classList.remove('_form-focus');
				el.classList.remove('_form-focus');
        if (!el.value.trim()) {
          el.parentElement.classList.remove('_form-input');
          el.classList.remove('_form-input');
        }
				formValidate.removeError(el);
			}
			let checkboxes = form.querySelectorAll('[type="checkbox"],[type="radio"]');
			if (checkboxes.length > 0&&clearboxes) {
				for (let index = 0; index < checkboxes.length; index++) {
					const checkbox = checkboxes[index];
					checkbox.checked = false;
          checkbox.parentElement.classList.remove('_form-input');
          checkbox.classList.remove('_form-input');
				}
			}
      let ratings = form.querySelectorAll('.rating');
			if (ratings.length > 0) {
				for (let index = 0; index < ratings.length; index++) {
					const rating = ratings[index];
          rating.querySelector('.rating__active') ? rating.querySelector('.rating__active').style.removeProperty('width') : null;
          rating.querySelector('.rating__value') ? rating.querySelector('.rating__value').innerHTML=0 : null;
				}
			}
			if (mhzModules.select) {
				let selects = form.querySelectorAll('.select');
				if (selects.length) {
					for (let index = 0; index < selects.length; index++) {
						const select = selects[index].querySelector('select');
						mhzModules.select.selectBuild(select);
					}
				}
			}
		}, 0);
	},
	emailTest(formRequiredItem) {
		return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
	},
  fioTest: e=>!/^.+\s.+\s?.*$/i.test(e.value),
  passwordTest(passwordRequireds) {
    if (passwordRequireds.length > 1) {
      let answer = {
        status: false,
        text: `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.3335 7.99984L6.66683 11.3332L13.3335 4.6665" stroke="#2FCB71" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3.3335 7.99984L6.66683 11.3332L13.3335 4.6665" stroke="#2FCB71" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Пароли совпадают</span>
        `
      };
      let pass = passwordRequireds[0].value;
      if (!pass.trim()) {
        answer.status = true;
        answer.text = passwordRequireds[0].dataset.error ? passwordRequireds[0].dataset.error : '';
        return answer;
      }
      let pattern = passwordRequireds[0].dataset.pattern;
      if (pattern) {
        pattern = new RegExp(pattern);
        if (!pattern.test(passwordRequireds[0].value)) {
          answer.status = true;
          answer.text = passwordRequireds[0].dataset.error || '';
          return answer;
        }
      }
      for (let index = 0; index < passwordRequireds.length; index++) {
        const element = passwordRequireds[index];
        if (element.value !== pass) {
          answer.status = true;
          answer.text = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12" stroke="#E74C3C" stroke-width="1.55556" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 4L4 12" stroke="#E74C3C" stroke-width="1.55556" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 4L12 12" stroke="#E74C3C" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 4L12 12" stroke="#E74C3C" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Пароли не совпадают<span>
          `;
          break;
        }
      }

      return answer;
    }
  },
	phoneTest(formRequiredItem) {
		return !/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/.test(formRequiredItem.value);
	}
}
/* Отправка форм */
export function formSubmit(options = { validate: true }) {
	const forms = document.forms;
	if (forms.length) {
		for (const form of forms) {
			form.addEventListener('submit', function (e) {
				const form = e.target;
				formSubmitAction(form, e);
			});
			form.addEventListener('reset', function (e) {
				const form = e.target;
				formValidate.formClean(form, false);
			});
		}
	}
	async function formSubmitAction(form, e) {
		const error = !form.hasAttribute('data-no-validate') ? formValidate.getErrors(form) : 0;
		if (error === 0) {
			const ajax = form.hasAttribute('data-ajax');
			if (ajax) { // Если режим ajax
				e.preventDefault();
				const formAction = form.getAttribute('action') ? form.getAttribute('action').trim() : '#';
				const formMethod = form.getAttribute('method') ? form.getAttribute('method').trim() : 'GET';
				const formData = new FormData(form);

				form.classList.add('_sending');
				const response = await fetch(formAction, {
					method: formMethod,
					body: formData
				});
				if (response.ok) {
          let responseResult = await response.text();
					form.classList.remove('_sending');
          let newResponseResult = IsJsonString(responseResult) ? JSON.parse(responseResult) : responseResult;
					formSent(form, newResponseResult);
				} else {
					alert("Ошибка");
					form.classList.remove('_sending');
				}
			} else if (form.hasAttribute('data-dev')) {	// Если режим разработки
				e.preventDefault();
				formSent(form, {success: true, findemail: false, message: `
        <p><strong>Мы отправили ссылку для активации учетной записи.</strong></p>
        <p>Если письма нет во Входящих и в папке Спам, напишите нам через форму обратной связи с сайта</p>`});
			}
		} else {
			e.preventDefault();
			const formError = form.querySelector('._form-error');
			if (formError && form.hasAttribute('data-goto-error')) {
				gotoBlock(formError, true, 1000);
			}
		}
	}
	// Действия после отправки формы
  function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }

	function formSent(form, responseResult = ``) {
		// Создаем событие отправки формы
		document.dispatchEvent(new CustomEvent("formSent", {
			detail: {
        responseResult,
				form: form
			}
		}));
		// Показываем попап, если подключен модуль попапов 
		// и для формы указана настройка
		setTimeout(() => {
			if (mhzModules.popup) {
				const popup = form.dataset.popupMessage;
				popup ? mhzModules.popup.open(popup) : null;
			}
		}, 0);
		// Очищаем форму
		!form.hasAttribute('data-noclean') ? formValidate.formClean(form) : null;
		// Сообщаем в консоль
		formLogging(`Форма отправлена!`);
	}
	function formLogging(message) {
		FLS(`[Формы]: ${message}`);
	}
}
/* Модуь формы "колличество" */
export function formQuantity() {
	document.addEventListener("click", function (e) {
		let targetElement = e.target;
		if (targetElement.closest('.quantity__button')) {
			let value = parseInt(targetElement.closest('.quantity').querySelector('input').value);
			if (targetElement.classList.contains('quantity__button_plus')) {
				value++;
			} else {
				--value;
				if (value < 1) value = 1;
			}
			targetElement.closest('.quantity').querySelector('input').value = value;
		}
	});
}
/* Модуь звездного рейтинга */
export function formRating() {
	const ratings = document.querySelectorAll('.rating');
	if (ratings.length > 0) {
		initRatings();
	}
	// Основная функция
	function initRatings() {
		let ratingActive, ratingValue;
		// "Бегаем" по всем рейтингам на странице
		for (let index = 0; index < ratings.length; index++) {
			const rating = ratings[index];
			initRating(rating);
		}
		// Инициализируем конкретный рейтинг
		function initRating(rating) {
			initRatingVars(rating);

			setRatingActiveWidth();

			if (rating.classList.contains('rating_set')) {
				setRating(rating);
			}
		}
		// Инициализайция переменных
		function initRatingVars(rating) {
			ratingActive = rating.querySelector('.rating__active');
			ratingValue = rating.querySelector('.rating__value');
		}
		// Изменяем ширину активных звезд
		function setRatingActiveWidth(index = ratingValue.innerHTML) {
			const ratingActiveWidth = index / 0.05;
			ratingActive.style.width = `${ratingActiveWidth}%`;
		}
		// Возможность указать оценку 
		function setRating(rating) {
			const ratingItems = rating.querySelectorAll('.rating__item');
			for (let index = 0; index < ratingItems.length; index++) {
				const ratingItem = ratingItems[index];
				ratingItem.addEventListener("mouseenter", function (e) {
					// Обновление переменных
					initRatingVars(rating);
					// Обновление активных звезд
					setRatingActiveWidth(ratingItem.value);
				});
				ratingItem.addEventListener("mouseleave", function (e) {
					// Обновление активных звезд
					setRatingActiveWidth();
				});
				ratingItem.addEventListener("click", function (e) {
					// Обновление переменных
					initRatingVars(rating);

					if (rating.dataset.ajax) {
						// "Отправить" на сервер
						setRatingValue(ratingItem.value, rating);
					} else {
						// Отобразить указанную оцнку
						ratingValue.innerHTML = index + 1;
						setRatingActiveWidth();
					}
				});
			}
		}
		async function setRatingValue(value, rating) {
			if (!rating.classList.contains('rating_sending')) {
				rating.classList.add('rating_sending');

				// Отправика данных (value) на сервер
				let response = await fetch('rating.json', {
					method: 'GET',

					//body: JSON.stringify({
					//	userRating: value
					//}),
					//headers: {
					//	'content-type': 'application/json'
					//}

				});
				if (response.ok) {
					const result = await response.json();

					// Получаем новый рейтинг
					const newRating = result.newRating;

					// Вывод нового среднего результата
					ratingValue.innerHTML = newRating;

					// Обновление активных звезд
					setRatingActiveWidth();

					rating.classList.remove('rating_sending');
				} else {
					alert("Ошибка");

					rating.classList.remove('rating_sending');
				}
			}
		}
	}
}