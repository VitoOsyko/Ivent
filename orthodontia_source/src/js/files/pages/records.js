import { wrap } from '../functions.js';
import { Datepicker } from 'vanillajs-datepicker';
import ru from 'vanillajs-datepicker/locales/ru';
// import 'vanillajs-datepicker/css/datepicker-foundation.css';
Object.assign(Datepicker.locales, ru);

document.addEventListener('DOMContentLoaded', function() {
  const datePickerEls = document.querySelectorAll('[data-datepicker]');
  if (datePickerEls.length) {
    datePickerEls.forEach(el=>{
      datePickerInit(el);
    })
  }
});

export function datePickerInit(el) {
  let picker = null;

  picker = new Datepicker(el, {
    // autohide: false,
    language: 'ru',
    prevArrow: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7275 4.09094L6.81836 9.00003L11.7275 13.9091" stroke="#8A8A8A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    nextArrow: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.27255 13.9091L11.1816 8.99997L6.27255 4.09088" stroke="#8E8E93" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    // todayButton: true,
    todayHighlight: true,
  });
  wrapCeils();
  el.picker = picker;

  el.addEventListener('changeDate', (e)=>{
    const input = el.querySelector('input[data-fordate]');
    if (input) {
      const parent = el.closest('.spollers-filters__body');
      let date = e.detail.date.toLocaleString('ru-RU').split(',')[0];
      input.value = date;
      let counter = 0;
      let interval = setInterval(() => {
        if (counter < 50) {
          input.blur();
          counter++;
        } else {
          clearInterval(interval)
        }
      }, 10);
      el.focus();
      if (parent) {
        const button = el.parentElement.querySelector('[type="submit"]');
        if (button) {
          button.hidden = false;
        }
      }
    }
  })
}

document.addEventListener('click', (e)=>{
  wrapCeils();

  const videoTrigger = e.target.closest('[data-video-trigger]');
  if (videoTrigger) {
    const parent = videoTrigger.closest('[data-video-container]') || videoTrigger.parentElement;
    if (parent) {
      const video = parent.querySelector('video');
      if (video) {
        videoTrigger.hidden = true;
        video.controls = true;
        video.play();
      }
    }
  }
});

function wrapCeils() {
  const ceils = document.querySelectorAll('.datepicker-cell');
  if (ceils.length) {
    ceils.forEach(ceil=>{
      if (!ceil.querySelector('span')) {
        ceil.innerHTML = `<span>${ceil.textContent.trim()}</span>`
      }
    })
  }
}