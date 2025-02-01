import { menuClose, bodyLock, bodyLockToggle, bodyUnlock, _slideUp, _slideDown } from '../functions.js'
import { formValidate } from '../forms/forms.js'
import { mhzModules } from "../modules.js";
import Cookies from 'js-cookie';

const md2 = matchMedia('(max-width:992px)');
const md3 = matchMedia('(max-width:768px)');
document.addEventListener('DOMContentLoaded', function() {
  checkYurParent();

  const eventsCustomScrollEls = document.querySelectorAll('.events-profile__customscroll');
  if (eventsCustomScrollEls.length) {
    eventsCustomScrollEls.forEach(eventsCustomScrollEl=>{
      if (!md2.matches) {
        eventsCustomScrollEls.forEach(eventsCustomScrollEl=>{
          setCustomScrollHeight(eventsCustomScrollEl);
        })
      }
    })
    window.addEventListener('resize', ()=>{
      if (!md2.matches) {
        eventsCustomScrollEls.forEach(eventsCustomScrollEl=>{
          setCustomScrollHeight(eventsCustomScrollEl);
        })
      }
    })
  }

  const lkDownloads = document.querySelector('.lk-downloads');
  const lkDownloadsSticky = lkDownloads?.querySelector('.lk-downloads__sticky');
  if (lkDownloadsSticky) {
    setTimeout(() => {
      lkDownloads.style.minHeight = `${lkDownloadsSticky.offsetHeight}px`;
    }, 10);
  }
})

window.addEventListener('load', ()=>{
  document.addEventListener('watcherCallback', (e)=>{
    const { entry } = e.detail;
    const eventsLoader = entry.target.closest('.events-profile__customscroll .loader')
    if (eventsLoader&&entry.isIntersecting) {
      const parent = entry.target.closest('.events-profile__customscroll');
      if (parent) {
        getMoreEvents(parent, eventsLoader);
      }
    }
  })
})

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-sidebar-trigger]')) {
    menuClose(false);
    document.documentElement.classList.toggle('_sidebar-open');
  }
  if (e.target.closest('[data-sidebar-navigation] a')||!e.target.closest('[data-sidebar]')) {
    document.documentElement.classList.remove('_sidebar-open');
  }

  const yurTippyClose = e.target.closest('[data-tippy-close]');
  if (yurTippyClose) {
    const parentTippy = yurTippyClose.closest('[data-tippy-root]')?.parentElement?.querySelector('[data-tippy-init]')?.tippy;
    if (parentTippy) {
      parentTippy.hide();
    }
  }
  const yurTippyDel = e.target.closest('[data-yur-item-del]');
  if (yurTippyDel) {
    const parentTippy = yurTippyDel.closest('[data-tippy-root]')?.parentElement?.querySelector('[data-tippy-init]')?.tippy;
    if (parentTippy) {
      parentTippy.hide();
    }

    const yurItem = yurTippyDel.closest('[data-yur-item]');
    if (yurItem) {
      _slideUp(yurItem);
      setTimeout(() => {
        yurItem.remove();
        checkYurParent();
      }, 600);
    }
  }

  const lkDownloadBtn = e.target.closest('[data-lk-download]');
  if (lkDownloadBtn) {
    lkDownload(lkDownloadBtn);
  }

  const mobileDropDownTrigger = e.target.closest('[data-mobile-dropdown-trigger]');
  if (mobileDropDownTrigger) {
    mobileDropDownOpen(mobileDropDownTrigger);
  }

  const closeTrigger = e.target.closest('[data-close]');
  if (closeTrigger) {
    mobileDropClose(closeTrigger);
  }
})

document.addEventListener('change', (e)=>{
  const lkBox = e.target.closest('[data-lk-box]');
  if (lkBox) {
    const label = lkBox.closest('label');
    if (lkBox.checked) {
      lkBox.classList.add('_checked');
      if (label) {
        label.classList.add('_checked');
      }
    } else {
      lkBox.classList.remove('_checked');
      if (label) {
        label.classList.remove('_checked');
      }
    }

    checkLkBoxes();
  }

  const mobileDropDown = e.target.closest('[data-mobile-dropdown]');
  if (mobileDropDown&&e.target.checked) {
    mobileDropDownChange(e.target, mobileDropDown);
  }
})

document.addEventListener('beforePopupOpen', (e)=>{
  const { popup } = e.detail;
  // console.log(popup)
  if (popup) {
    const popupEl = popup.targetOpen.element;
    const trigger = popup.targetOpen.trigger;
    if (popupEl&&trigger) {
      const id = popupEl.id;

      if (id == 'persData') {
        setPersData(popupEl, trigger)
      }
      if (id == 'changePhonePopup') {
        setPersPhone(popupEl, trigger)
      }
      if (id == 'changeEmailPopup') {
        setPersEmail(popupEl, trigger)
      }
      if (id == 'changeAddressPopup') {
        setPersAddress(popupEl, trigger)
      }
      if (id == 'yurPopup') {
        setYurData(popupEl, trigger);
      }
      if (id == 'eventPayPopup') {
        setPayEventPopupData(popupEl, trigger);
      }
    }
  }
})

document.addEventListener('formSent', (e)=>{
  const { form, responseResult } = e.detail;

  console.log('Событие отправки формы', e);
  console.log('Форма', form);
  if (form.hasAttribute('data-dev')) {
    console.log('Эта форма в дев режиме!!! Если сейчас происходит натяжка то нужно атрибут data-dev заменить на data-ajax или вовсе убрать');
  }
  console.log('Ожидаемый формат ответа', responseResult);
  console.log('.........................................');

  if (form.closest('#yurPopup')) {
    if (responseResult.success) {
      form.hasAttribute('data-id') ? changeYurItem(form) : setNewYurId(form, responseResult);
    }
  }

  if (form.closest('#setAddressPopup')) {
    if (responseResult.success) {
      if (form.hasAttribute('data-set-cookie')) {
        let expires = !isNaN(parseFloat(form.getAttribute('data-set-cookie'))) ? parseFloat(form.getAttribute('data-set-cookie')) : 1;
        Cookies.set('isAddressSet', true, {expires});
      }
      mhzModules.popup ? mhzModules.popup.close('#setAddressPopup') : null;
      document.querySelector('[data-notification]') ? document.querySelector('[data-notification]').hidden = true : null;
    }
  }
})

function checkYurParent() {
  const yurParent = document.querySelector('[data-yur-parent]');
  if (yurParent) {
    const yurItems = yurParent.querySelectorAll('[data-yur-item]');
    if (!yurItems.length) {
      let div = document.createElement('div');
      div.style = 'margin: 1.5rem 0;';
      div.hidden = true;
      div.classList.add('_no-one-yur');
      div.textContent = 'У вас нет ни одного юридического лица';

      yurParent.appendChild(div);
      _slideDown(div);
    }
  }
}

function setPersData(popupEl, trigger) {
  const triggerParent = trigger.closest('[data-persdata]');
  if (triggerParent) {
    const professionEl = triggerParent.querySelector('[data-profession]');
    const nameEl = triggerParent.querySelector('[data-name]');
    const otherProfessionEl = popupEl.querySelector('[data-other-profession]');
    let professionText = professionEl ? professionEl.textContent.trim() : null;
    let professionValue = professionEl ? professionEl.getAttribute('data-profession').trim() : null;
    let nameArr = nameEl ? nameEl.textContent.trim().split(' ') : null;

    const nameInputs = popupEl.querySelectorAll('[data-persdata]');
    if (nameInputs.length&&nameArr?.length) {
      nameInputs.forEach(nameInput => {
        let attr = nameInput.getAttribute('data-persdata');
        if (attr == 'name') {
          nameInput.value = nameArr[1];
          nameInput.classList.add('_form-input');
          nameInput.parentElement.classList.add('_form-input');
        }
        if (attr == 'surname') {
          nameInput.value = nameArr[0];
          nameInput.classList.add('_form-input');
          nameInput.parentElement.classList.add('_form-input');
        }
        if (attr == 'secondname') {
          nameInput.value = nameArr[2];
          nameInput.classList.add('_form-input');
          nameInput.parentElement.classList.add('_form-input');
        }
      });
    }

    const professionInputs = popupEl.querySelectorAll('[data-profession]');
    if (professionInputs?.length&&professionText&&professionValue) {
      let changed = false;
      professionInputs.forEach(professionInput=>{
        let attr = professionInput.getAttribute('data-profession').trim();
        if (attr == professionValue) {
          professionInput.click();
          if (professionEl.hasAttribute('data-vuz')) {
            const parent = professionInput.closest('[data-radio-spoller]');
            if (parent) {
              const selectEl = parent.querySelector('select');
              if (selectEl) {
                const options = selectEl.options;
                [...options].forEach(e=>{
                  if (e.value == professionEl.getAttribute('data-vuz').trim()) {
                    e.click();
                    e.selected = true;
                    const evt = new Event("change", { bubbles: true });
                    selectEl.dispatchEvent(evt);
                  }
                })
              }
            }
          }
          changed = true;
        }
      })

      if (!changed&&otherProfessionEl) {
        otherProfessionEl.click();
        const otherProfessionParent = otherProfessionEl.closest('[data-radio-spoller]');
        if (otherProfessionParent) {
          const input = otherProfessionParent.querySelector('input[type="text"]');
          if (input) {
            input.value = professionText;
            input.classList.add('_form-input');
            input.parentElement.classList.add('_form-input');
          }
        }
      }
    }
  }
}

function setPersPhone(popupEl, trigger) {
  const parent = trigger.closest('[data-persdata-item]');
  const phoneEl = popupEl.querySelector('[data-persdata="number"]')
  if (parent&&phoneEl) {
    const parentPhoneEl = parent.querySelector('[data-profile="phone"]');
    if (parentPhoneEl?.textContent?.trim()) {
      phoneEl.textContent = parentPhoneEl.textContent.trim();
    }
  }
}
function setPersEmail(popupEl, trigger) {
  const parent = trigger.closest('[data-persdata-item]');
  const phoneEl = popupEl.querySelector('[data-persdata="email"]')
  if (parent&&phoneEl) {
    const parentPhoneEl = parent.querySelector('[data-profile="email"]');
    if (parentPhoneEl?.textContent?.trim()) {
      phoneEl.textContent = parentPhoneEl.textContent.trim();
    }
  }
}
function setPersAddress(popupEl, trigger) {
  const parent = trigger.closest('[data-persdata-item]');
  const phoneEl = popupEl.querySelector('[data-persdata="address"]')
  if (parent&&phoneEl) {
    const parentPhoneEl = parent.querySelector('[data-profile="address"]');
    if (parentPhoneEl?.textContent?.trim()) {
      phoneEl.textContent = parentPhoneEl.textContent.trim();
    }
  }
}

function setYurData(popupEl, trigger) {
  const parent = trigger.closest('[data-yur-item]');
  const form = popupEl.querySelector('form');
  const titleEl = popupEl.querySelector('.authPopup__title');
  let title = 'Добавление юр. лица';
  if (form) {
    const popupHiddens = form.querySelectorAll('._cloned');
    if (popupHiddens.length) {
      popupHiddens.forEach(e=>e.remove());
    }
    if (parent) {
      title = 'Редактирование юр. лица';
      let hiddens = trigger.querySelectorAll('input[type="hidden"]');
      let id = parent.getAttribute('data-yur-item');
      if (hiddens.length) {
        setHiddens(hiddens, form);
        setYurFields(parent, form);
        form.setAttribute('data-id', id);
      }
    } else {
      formValidate.formClean(form);
      form.removeAttribute('data-id');
    }
    
    if (titleEl) {
      titleEl.innerHTML = title;
    }
  }
}

function setHiddens(hiddens, form) {
  hiddens.forEach(hidden=>{
    let clone = hidden.cloneNode(false);
    clone.classList.add('_cloned');
    form.appendChild(clone);
  })

}

function setYurFields(parent, form) {
  const nameEl = parent.querySelector('[data-name]');
  const nameField = form.querySelector('[data-name]');

  const innEl = parent.querySelector('[data-inn]');
  const innField = form.querySelector('[data-inn]');

  const bikEl = parent.querySelector('[data-bik]');
  const bikField = form.querySelector('[data-bik]');

  const checkEl = parent.querySelector('[data-check]');
  const checkField = form.querySelector('[data-check]');

  const phoneEl = parent.querySelector('[data-phone]');
  const phoneField = form.querySelector('[data-phone]');
  
  if (nameEl?.textContent.trim()&&nameField) {
    nameField.value = nameEl.textContent.trim();
    nameField.classList.add('_form-input');
    nameField.parentElement.classList.add('_form-input');
  }
  if (innEl?.textContent.trim()&&innField) {
    innField.value = innEl.textContent.trim();
    innField.classList.add('_form-input');
    innField.parentElement.classList.add('_form-input');
  }
  if (bikEl?.textContent.trim()&&bikField) {
    bikField.value = bikEl.textContent.trim();
    bikField.classList.add('_form-input');
    bikField.parentElement.classList.add('_form-input');
  }
  if (checkEl?.textContent.trim()&&checkField) {
    checkField.value = checkEl.textContent.trim();
    checkField.classList.add('_form-input');
    checkField.parentElement.classList.add('_form-input');
  }
  if (phoneEl?.textContent.trim()&&phoneField) {
    phoneField.value = phoneEl.textContent.trim();
    phoneField.classList.add('_form-input');
    phoneField.parentElement.classList.add('_form-input');
  }
}

function changeYurItem(form) {
  const id = form.getAttribute('data-id');
  const currentItem = document.querySelector(`[data-yur-item="${id}"]`);
  if (currentItem) {
    const nameField = form.querySelector('[data-name]');
    const innField = form.querySelector('[data-inn]');
    const bikField = form.querySelector('[data-bik]');
    const checkField = form.querySelector('[data-check]');
    const phoneField = form.querySelector('[data-phone]');

    const nameEl = currentItem.querySelector('[data-name]');
    const innEl = currentItem.querySelector('[data-inn]');
    const bikEl = currentItem.querySelector('[data-bik]');
    const checkEl = currentItem.querySelector('[data-check]');
    const phoneEl = currentItem.querySelector('[data-phone]');

    if (nameEl&&nameField.value.trim()) {
      nameEl.textContent = nameField.value.trim();
    }
    if (innEl&&innField.value.trim()) {
      innEl.textContent = `ИНН ${innField.value.trim()}`;
    }
    if (bikEl&&bikField.value.trim()) {
      bikEl.textContent = `БИК ${bikField.value.trim()}`;
    }
    if (checkEl&&checkField.value.trim()) {
      checkEl.textContent = `Р.сч ${checkField.value.trim()}`;
    }
    if (phoneEl&&phoneField.value.trim()) {
      phoneEl.textContent = phoneField.value.trim();
      phoneEl.setAttribute('href', phoneField.value.trim());
    }

    mhzModules.popup.close('#yurPopup');
    formValidate.formClean(form);
  }
}

function setNewYurId(form, responseResult) {
  const yurParent = document.querySelector('[data-yur-parent]');
  if (yurParent) {
    const nameField = form.querySelector('[data-name]');
    const innField = form.querySelector('[data-inn]');
    const bikField = form.querySelector('[data-bik]');
    const checkField = form.querySelector('[data-check]');
    const phoneField = form.querySelector('[data-phone]');
    let nameStr = '';
    let innStr = '';
    let bikStr = '';
    let checkStr = '';
    let phoneStr = '';
    let idStr = responseResult.id || Date.now().toString(36) + Math.random().toString(36);
  
    if (nameField.value.trim()) {
      nameStr = nameField.value.trim();
    }
    if (innField.value.trim()) {
      innStr = `ИНН ${innField.value.trim()}`;
    }
    if (bikField.value.trim()) {
      bikStr = `БИК ${bikField.value.trim()}`;
    }
    if (checkField.value.trim()) {
      checkStr = `Р.сч ${checkField.value.trim()}`;
    }
    if (phoneField.value.trim()) {
      phoneStr = phoneField.value.trim();
    }
  
    let str = `
    <div class="yur-profile__item item-yurProfile" data-yur-item="${idStr}">
      <div class="item-yurProfile__body">
        <div class="item-yurProfile__name" data-name>${nameStr}</div>
        <a href="tel:${phoneStr}" class="item-yurProfile__phone" data-phone>${phoneStr}</a>
        <div class="item-yurProfile__info">
          <div class="item-yurProfile__col" data-inn>${innStr}</div>
          <div class="item-yurProfile__col" data-bik>${bikStr}</div>
          <div class="item-yurProfile__col" data-check>${checkStr}</div>
        </div>
      </div>
      <div class="item-yurProfile__buttons">
        <a href="#" class="item-yurProfile__button item-yurProfile__button_change" data-popup="#yurPopup">
          <input type="hidden" name="id" value="${idStr}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 10.5V19.125C18 19.3712 17.9515 19.615 17.8573 19.8425C17.763 20.07 17.6249 20.2767 17.4508 20.4508C17.2767 20.6249 17.07 20.763 16.8425 20.8573C16.615 20.9515 16.3712 21 16.125 21H4.875C4.37772 21 3.90081 20.8025 3.54917 20.4508C3.19754 20.0992 3 19.6223 3 19.125V7.875C3 7.37772 3.19754 6.90081 3.54917 6.54917C3.90081 6.19754 4.37772 6 4.875 6H12.7256" stroke="#2CA5F5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21.5597 2.49611C21.4912 2.42085 21.4082 2.36025 21.3156 2.31799C21.2231 2.27573 21.1229 2.25267 21.0211 2.25022C20.9194 2.24777 20.8182 2.26596 20.7237 2.30371C20.6292 2.34147 20.5434 2.39799 20.4713 2.46986L19.8915 3.04689C19.8212 3.11721 19.7817 3.21255 19.7817 3.31197C19.7817 3.41138 19.8212 3.50673 19.8915 3.57705L20.423 4.10767C20.4579 4.14268 20.4993 4.17046 20.5449 4.18941C20.5905 4.20837 20.6394 4.21812 20.6888 4.21812C20.7382 4.21812 20.7871 4.20837 20.8327 4.18941C20.8783 4.17046 20.9197 4.14268 20.9546 4.10767L21.5199 3.54517C21.8058 3.2597 21.8326 2.7947 21.5597 2.49611ZM18.7191 4.21877L10.2572 12.6656C10.2059 12.7167 10.1686 12.7802 10.149 12.8499L9.75756 14.0156C9.74818 14.0473 9.74752 14.0809 9.75564 14.1128C9.76375 14.1448 9.78035 14.174 9.80368 14.1973C9.82701 14.2207 9.85621 14.2373 9.88818 14.2454C9.92016 14.2535 9.95374 14.2528 9.98537 14.2435L11.1502 13.8521C11.2199 13.8324 11.2833 13.7951 11.3344 13.7438L19.7813 5.28095C19.8595 5.20197 19.9033 5.09535 19.9033 4.98423C19.9033 4.87312 19.8595 4.7665 19.7813 4.68752L19.3149 4.21877C19.2358 4.1399 19.1287 4.09562 19.017 4.09562C18.9053 4.09562 18.7982 4.1399 18.7191 4.21877Z" fill="#2CA5F5"/>
          </svg>
          <span>Изменить</span>
        </a>
        <button type="button" class="item-yurProfile__button item-yurProfile__button_del" data-del>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.375 4.375L5.15625 16.875C5.19336 17.5973 5.71875 18.125 6.40625 18.125H13.5938C14.284 18.125 14.7996 17.5973 14.8438 16.875L15.625 4.375" stroke="#FF3B30" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.125 4.375H16.875H3.125Z" fill="#FF3B30"/>
            <path d="M3.125 4.375H16.875" stroke="#FF3B30" stroke-miterlimit="10" stroke-linecap="round"/>
            <path d="M12.8125 6.875L12.5 15.625M7.5 4.375V2.8125C7.49964 2.68929 7.52364 2.56722 7.57063 2.45331C7.61761 2.33941 7.68666 2.23591 7.77378 2.14879C7.86091 2.06166 7.9644 1.99262 8.07831 1.94563C8.19221 1.89865 8.31428 1.87464 8.4375 1.875H11.5625C11.6857 1.87464 11.8078 1.89865 11.9217 1.94563C12.0356 1.99262 12.1391 2.06166 12.2262 2.14879C12.3133 2.23591 12.3824 2.33941 12.4294 2.45331C12.4764 2.56722 12.5004 2.68929 12.5 2.8125V4.375H7.5ZM10 6.875V15.625V6.875ZM7.1875 6.875L7.5 15.625L7.1875 6.875Z" stroke="#FF3B30" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Удалить</span>
        </button>
      </div>
    </div>
    `;

    const noOneDiv = yurParent.querySelector('._no-one-yur');
    if (noOneDiv) {
      noOneDiv.remove();
    }
    yurParent.insertAdjacentHTML('beforeend', str);
    mhzModules.popup.close('#yurPopup');
    formValidate.formClean(form);
    mhzModules.tippyInit();
  }
}

function setCustomScrollHeight(eventsCustomScrollEl) {
  const eventsItems = eventsCustomScrollEl.querySelectorAll('.item-eventsProfile');
  if (eventsItems.length) {
    let hght = 0;
    eventsItems.forEach((e, index)=>{
      if (index < 3) {
        hght += e.offsetHeight;
      }
    })
    eventsCustomScrollEl.style.height = `${hght}px`
  }
}

async function getMoreEvents(eventsCustomScrollEl, loader) {
  let path = eventsCustomScrollEl.getAttribute('data-query-path');
  if (path) {
    const nextPage = eventsCustomScrollEl.getAttribute('data-next-page') || 2;
    let options = {
      method:'GET',
    }
    let url = `${path}?page=${nextPage}`;
    let forInsert = eventsCustomScrollEl.querySelector('.simplebar-content') ? eventsCustomScrollEl.querySelector('.simplebar-content') : eventsCustomScrollEl;
    await fetch(url, options)
      .then(res=>res.json())
      .then(res=>{
        if (res.html) {
          forInsert.insertAdjacentHTML('beforeend', res.html);
        }
        if (!res.next_page) {
          loader.remove();
        }
      })
  }
}

function setPayEventPopupData(popupEl, trigger) {
  const clonedEls = popupEl.querySelectorAll('._cloned');
  if (clonedEls.length) {
    clonedEls.forEach(e=>e.remove());
  }

  const eventItem = trigger.closest('[data-event-item]');
  const eventItemInPopup = popupEl.querySelector('[data-event]');
  const form = popupEl.querySelector('form');
  const hiddens = trigger.querySelectorAll('input[type="hidden"]');
  const yurItems = document.querySelectorAll('[data-yur-item]');
  const yurParent = popupEl.querySelector('[data-event-pay-yurs]');

  if (eventItem&&eventItemInPopup) {
    cloneEventEls(eventItem, eventItemInPopup);
  }
  let eventPriceEl = formEventPrice(eventItem, trigger);
  eventItemInPopup.appendChild(eventPriceEl);

  if (form&&hiddens.length) {
    setHiddens(hiddens, form);
  }

  if (yurParent) {
    renderYurs(yurParent, yurItems)
  }


  function cloneEventEls(eventItem, eventItemInPopup) {
    const eventEls = [
      eventItem.querySelector('.item-eventsProfile__name'),
      eventItem.querySelector('.item-eventsProfile__other'),
      eventItem.querySelector('.item-eventsProfile__info'),
    ];
    eventEls.forEach(el=>{
      if (el) {
        let clone = el.cloneNode(true);
        clone.classList.add('_cloned');
        eventItemInPopup.appendChild(clone);
      }
    })
  }

  function formEventPrice(eventItem, trigger) {
    let priceEl = eventItem.querySelector('[data-price]');
    let stars = trigger.getAttribute('data-stars');
    let oldprice = trigger.getAttribute('data-oldprice');
    let price = false;
    
    if (priceEl) {
      price = priceEl.innerHTML;
    }

    let priceDiv = document.createElement('div');
    priceDiv.className = 'eventPayPopup__price price-eventPayPopup _cloned'

    let priceStr = price ? `<div class="price-eventPayPopup__price">${price}</div>` : '';
    let starsStr = price ? `<div class="price-eventPayPopup__stars"><svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.49008 0.7164C6.64735 0.351197 7.16515 0.351197 7.32242 0.716399L8.76009 4.05481C8.82569 4.20714 8.96928 4.31146 9.13442 4.32678L12.7537 4.66246C13.1496 4.69918 13.3096 5.19164 13.0109 5.45407L10.2802 7.853C10.1556 7.96246 10.1007 8.13125 10.1372 8.29305L10.9363 11.8389C11.0238 12.2268 10.6049 12.5312 10.263 12.3282L7.1376 10.4724C6.99499 10.3877 6.81751 10.3877 6.6749 10.4724L3.54954 12.3282C3.20764 12.5312 2.78873 12.2268 2.87615 11.8389L3.67532 8.29305C3.71179 8.13125 3.65694 7.96246 3.53234 7.853L0.801586 5.45407C0.502858 5.19164 0.662867 4.69918 1.0588 4.66246L4.67808 4.32678C4.84322 4.31146 4.98681 4.20714 5.05241 4.05481L6.49008 0.7164Z" fill="white"/></svg><span>${stars}</span></div>` : '';
    let oldpriceStr = price ? `<div class="price-eventPayPopup__oldprice">${parseFloat(oldprice).toLocaleString('ru-RU')} <font class="rub">i</font></div>` : '';
    let str = `
    <div class="price-eventPayPopup__row">
      ${priceStr}\n
      ${starsStr}\n
    </div>
    <div class="price-eventPayPopup__row">
      ${oldpriceStr}
    </div>
    `;

    priceDiv.innerHTML = str;

    return priceDiv;
  }

  function renderYurs(yurParent, yurItems) {
    let str = '';
    if (yurItems.length) {
      yurItems.forEach(yurItem=>{
        let id = yurItem.getAttribute('data-yur-item');
        let nameEl = yurItem.querySelector('[data-name]');
        let name = nameEl ? nameEl.textContent.trim() : '';

        let substr = `
        <div class="eventPayPopup__yuritem">
          <div class="eventPayPopup__yurname">${name}</div>
          <button type="submit" class="eventPayPopup__button btn btn-lightblue" value="${id}">Создать счет</button>
        </div>\n`;

        str += substr;
      })
    } else {
      str = '<div class="_no-one-yur" style="margin-right: 0px; margin-left: 0px;">У вас нет ни одного юридического лица</div>';
    }

    yurParent.innerHTML = str;
  }
}

function checkLkBoxes() {
  const lkDownloads = document.querySelectorAll('[data-lk-download*="checked"]');
  if (lkDownloads.length) {
    const checkedBoxes = document.querySelectorAll('[data-lk-box]:checked');
    if (checkedBoxes.length) {
      lkDownloads.forEach(e=>{
        e.removeAttribute('disabled');
      })
    } else {
      lkDownloads.forEach(e=>{
        e.setAttribute('disabled', '');
      })
    }
  }
}

function lkDownload(lkDownloadBtn) {
  const parent = lkDownloadBtn.closest('[data-lk-downloads]');
  if (parent) {
    let url = parent.getAttribute('data-lk-downloads');
    if (url.trim()) {
      url = url.trim();
    }

    const otherBtns = parent.querySelectorAll('[data-lk-download]');
    if (otherBtns.length) {
      otherBtns.forEach(otherBtn=>{
        if (otherBtn !== lkDownloadBtn) {
          otherBtn.setAttribute('disabled', '');
        }
      })
    }

    let btnAttr = lkDownloadBtn.getAttribute('data-lk-download').replaceAll(' ', '').split(',');
    let all_or_checked = btnAttr[0];
    let briefly_or_detail = btnAttr[1];
    if (all_or_checked == 'photo') {
      const body = new FormData();
      body.append('photo', true);
  
      const options = {
        method: 'POST',
        body
      }

      lkDownloadAction(lkDownloadBtn, url, options, parent);

    } else {
      if (all_or_checked&&briefly_or_detail) {
  
        const body = new FormData();
        body.append('all_or_checked', btnAttr[0])
        body.append('briefly_or_detail', btnAttr[1])
  
        if (all_or_checked == 'checked') {
          let checkedArr = [];
          const checkedSpeakers = document.querySelectorAll('[data-lk-box]:checked');
          if (checkedSpeakers.length) {
            checkedSpeakers.forEach(checkedSpeaker=>{
              let val = checkedSpeaker.value;
              if (val.trim()&&!checkedArr.includes(val)) {
                checkedArr.push(val.trim());
              }
            })
            // body.ids = checkedArr;
            body.append('ids', checkedArr);
          }
        }
  
        const options = {
          method: 'POST',
          body
        }
  
        lkDownloadAction(lkDownloadBtn, url, options, parent);
      }
    }
  }
}

async function lkDownloadAction(lkDownloadBtn, url, options, parent) {
  lkDownloadBtn.classList.add('_in-process');
  
  let answer = false;
  await fetch(url, options)
    .then(res=>res.json())
    .then(res=>{
      answer = res;
      const otherBtns = parent.querySelectorAll('[data-lk-download]');
      if (otherBtns.length) {
        otherBtns.forEach(otherBtn=>{
          otherBtn.removeAttribute('disabled');
        })
      }
    });

  if (answer?.success) {
    lkDownloadBtn.classList.remove('_in-process');
    let href = answer.href;

    let link = document.createElement('a');
    link.setAttribute('href', href);
    link.setAttribute('target', '_blank');
    link.setAttribute('download', '');
    link.click();
    link.remove();
  }

}

function mobileDropDownOpen(mobileDropDownTrigger) {
  if (md3.matches) {
    let attr = mobileDropDownTrigger.getAttribute('data-mobile-dropdown-trigger');
    const mobileDropDown = document.querySelector(`[data-mobile-dropdown="${attr}"]`);
    if (mobileDropDown) {
      bodyLock();
      mobileDropDown.classList.add('_active');
    }
  }
}
function mobileDropClose(closeTrigger) {
  if (md3.matches) {
    const mobileDropDown = closeTrigger.closest('[data-mobile-dropdown]');
    if (mobileDropDown) {
      const attr = mobileDropDown.getAttribute('data-mobile-dropdown');
      const trigger = document.querySelector(`[data-mobile-dropdown-trigger="${attr.trim()}"]`);
      !trigger||!trigger.closest('.popup') ? bodyUnlock() : null;

      mobileDropDown.classList.remove('_active');
    }
  }
}

function mobileDropDownChange(target, mobileDropDown) {
  const attr = mobileDropDown.getAttribute('data-mobile-dropdown');
  const trigger = document.querySelector(`[data-mobile-dropdown-trigger="${attr.trim()}"]`);
  const closeButton = mobileDropDown.querySelector('button[data-close]');
  const form = trigger.closest('form');

  if (trigger) {
    let element = 
      trigger.querySelector('select')
      ||trigger.querySelector('input[type="text"]')
      ||trigger.querySelector('input[type="number"]')
      ||trigger.querySelector(`input[type="checkbox"][value="${target.value}"]`)
      ||trigger.querySelector(`input[type="radio"][value="${target.value}"]`)

    if (element) {
      switch (element) {
        case trigger.querySelector('select'):
          [...element.options].forEach(option=>{
            if (option.value == target.value) {
              option.selected = true;
            }
          })
          break
        case trigger.querySelector('input[type="text"]')||trigger.querySelector('input[type="number"]'):
          element.value = target.value;
          element.classList.add('_form-input');
          element.parentElement.classList.add('_form-input');
          break
        case trigger.querySelector(`input[type="checkbox"][value="${target.value}"]`)||trigger.querySelector(`input[type="radio"][value="${target.value}"]`):
          if (!element.checked) {
            element.click();
          }
          break
        default: 
          console.log('Not found');
      }

      let evt = new Event('change', {bubbles:true})
      element.dispatchEvent(evt);

      if (closeButton) {
        closeButton.disabled = false;
      }
    }
  }
}