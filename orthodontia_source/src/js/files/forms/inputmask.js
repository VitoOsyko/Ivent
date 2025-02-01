/* Маски для полей (в работе) */

// Подключение функционала "Чертогов Фрилансера"
// Подключение списка активных модулей
import { mhzModules } from "../modules.js";
import { formValidate } from "./forms.js";

// Подключение модуля
import "inputmask/dist/inputmask.min.js";

export function inputmaslFirstInit() {
	const inputMasks = document.querySelectorAll('[data-inputmask]');
	if (inputMasks.length) {
    Inputmask.extendDefinitions({
      '9': {
        validator: '[9]',
        definitionSymbol: '9',
        static: true
      },
      '#':{
        validator: '[0-9]'
      }
    })
    inputMasks.forEach(inputMask=>{
      let inputmode = inputMask.hasAttribute('data-inputmode') ? inputMask.getAttribute('data-inputmode') : 'text';
      mhzModules.inputmask = new Inputmask({
        showMaskOnHover: false,
        positionCaretOnClick: 'none',
        inputmode,
        onincomplete: function() {
          formValidate.addError(this);
        }
      }).mask(inputMask);
    })

	}

  // const emailInputs =document.querySelectorAll('[data-mask="email"]');
  // emailInputs.length ? emailInputs.forEach(emailInput=>{
  //   new Inputmask({
  //     // mask: "*{1,20}[.*{1,20}][.*{1,20}][.*{1,20}]@*{1,20}.*{1,20}",
  //     alias: 'email',
  //     onKeyDown: function(event, buffer, caretPos, optsFunction) {
  //       console.log(event);
  //       console.log(buffer);
  //       console.log(caretPos);
  //       console.log(optsFunction);
  //     }
  //   }).mask(emailInput);
  // }) : null;

  const pincodeInputs = document.querySelectorAll('[data-pincode]');
  pincodeInputs.length ? pincodeInputs.forEach(pincodeInput=>{
    let count = pincodeInput.getAttribute('data-pincode');
    let callback = pincodeInput.getAttribute('data-callback');
    new Inputmask({
      mask: `#{${count}}`,
      inputmode: 'numeric',
      oncomplete: function() {
        const form = this.closest('form');
        if (form&&this.hasAttribute('data-oncomplete-formsent')) {
          form.submit();
        }
        if (callback&&callback.trim !== '') {
          eval(callback)
        }
      }
    }).mask(pincodeInput);
  }) : null;
}
inputmaslFirstInit();
