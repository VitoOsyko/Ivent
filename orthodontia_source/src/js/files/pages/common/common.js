import { mhzModules } from "../../modules.js";
import { isMobile, _slideDown, _slideUp } from "../../functions.js";
import {eventPopupBodyForming} from '../home.js'
import Cookies from "js-cookie";
export const mhzObserver = new MutationObserver((mutations)=>{
  console.log(mutations);
})

Date.prototype.daysInMonth = function() {
  return new Date(this.getFullYear(), this.getMonth(), 0).getDate();
};

let md1 = window.matchMedia("(max-width: 1232px)");
let md3 = window.matchMedia("(max-width: 767px)");
document.addEventListener('DOMContentLoaded', function(e) {
  setPagePaddingTop();
  window.addEventListener('resize', setPagePaddingTop);
  
  const popupContents = document.querySelectorAll('.popup');
  popupContents.length ? popupContentsActions(popupContents) : null;
  
  ontopHideShow();
  window.addEventListener('scroll', (e)=>{
    ontopHideShow();
  })

  const noheader = document.querySelector('[data-noheader]');
  noheader ? setNoheaderClass(noheader) : null;

  const authPopups =document.querySelectorAll('.authPopup input');
  authPopups.length ? authPopups.forEach(authPopup=>{
    authPopup.addEventListener('focusin', (e)=>{
      document.documentElement.classList.add('focused');
    });
    authPopup.addEventListener('focusout', (e)=>{
      document.documentElement.classList.remove('focused');
    });
  }) : null;


  const mobileFooter = document.querySelector('.mobile-footer');
  const fixedSidebar = document.querySelector('.sidebar-event');
  if (fixedSidebar||mobileFooter) {
    setBtmHght(mobileFooter, fixedSidebar);
    window.addEventListener('resize', (e)=>{
      setBtmHght(mobileFooter, fixedSidebar);
    })
    window.addEventListener('scroll', (e)=>{
      setBtmHght(mobileFooter, fixedSidebar);
    })
  }

  if (navigator.userAgent.match(/Mozilla/i)&&!navigator.userAgent.match(/Chrome/i)) {
    document.documentElement.classList.add('_mozilla');
  }

  const bottomHeaderItems =document.querySelectorAll('.bottom-header__item');
  if (bottomHeaderItems.length) {
    bottomHeaderItems.forEach(bottomHeaderItem=>{
      if (bottomHeaderItem.querySelector('.bottom-header__subparent')) {
        bottomHeaderItem.classList.add('bottom-header__item_has')
      }
    })
  }

  const authPopupItems =document.querySelectorAll('.form-authPopup__item');
  if (authPopupItems.length) {
    authPopupItems.forEach(authPopupItem=>{
      if (authPopupItem.querySelector('label')) {
        authPopupItem.classList.add('form-authPopup__item_has');
      }
    })
  }

  document.addEventListener('selectCallback', (e)=>{
    const { select, originalSelect } = e.detail;
    const selectedOption = originalSelect.querySelector(`[value="${originalSelect.value}"]`);
    const form = originalSelect.closest('form');
    if (form&&selectedOption) {
      const phoneInput = form.querySelector('[data-phone-input]');
      phoneInput?.inputmask?.remove();
      let mask = selectedOption.dataset.mask;
      if (mask&&mask.trim()) {
        let maskStr = `'mask':'${mask}','inputmode':'number'`
        phoneInput.setAttribute('data-inputmask', maskStr);
        mhzModules.inputmask.mask(phoneInput);
      }
    }
  })


  if (isMobile.iOS()) {
    const menuToggle = document.querySelector('[data-toggle-menu]');
    // if (menuToggle) {
    //   menuToggle.click();
    //   setTimeout(() => {
    //     menuToggle.click();
    //   }, 350);
    // }
  }

  const setAddressPopup = document.querySelector('#setAddressPopup');
  let isAddressSetCookies = Cookies.get('isAddressSet');
  if (setAddressPopup) {
    let condition = isAddressSetCookies !== 'true';
    if (typeof isAddressSet!=='undefined') {
      condition = !isAddressSet||!isAddressSetCookies
    }
    if (condition&&setAddressPopup.hasAttribute('data-delay')) {
      let delay = setAddressPopup.getAttribute('data-delay') || 10000
      delay = parseFloat(delay);
      setTimeout(() => {
        mhzModules.popup.open('#setAddressPopup')
      }, delay);
    }
  }
});

document.addEventListener('change', (e)=>{
  const setAddressCountryEl = e.target.closest('[data-setaddress-country]');
  const value = e.target.value;
  if (setAddressCountryEl) {
    const parent = setAddressCountryEl.closest('form');
    if (parent) {
      const button = parent.querySelector('[type="submit"]');
      const setAddressCityEl = document.querySelector('[data-setaddress-city]');
      const setAddressAddressEl = document.querySelector('[data-setaddress-address]');

      if (setAddressCityEl&&setAddressAddressEl) {
        if (button) {
          setTimeout(() => {
            button.setAttribute('disabled', '');
          }, 15);
        }

        let toHideEl = null;
        let toShowEl = null;

        if (value.toLowerCase().includes('росси')||value.toLowerCase().includes('russi')) {
          toHideEl = setAddressCityEl;
          toShowEl = setAddressAddressEl;
        } else {
          toHideEl = setAddressAddressEl;
          toShowEl = setAddressCityEl;
        }

        if (toHideEl&&!toHideEl.hasAttribute('hidden')) {
          _slideUp(toHideEl);
          toHideEl.querySelector('input')?.removeAttribute('data-required');
        }
        if (toShowEl&&toShowEl.hasAttribute('hidden')) {
          _slideDown(toShowEl);
          if (toShowEl.querySelector('input')?.hasAttribute('data-need-required')) {
            toShowEl.querySelector('input')?.setAttribute('data-required', '');
          }
          setTimeout(() => {
            toShowEl.querySelector('input')?.focus();
          }, 100);
        }
      }
    }
  }
})

function setBtmHght(mobileFooter, fixedSidebar) {
  let height = mobileFooter ? mobileFooter.scrollHeight : 0;
  if (fixedSidebar&&getComputedStyle(fixedSidebar).position === 'fixed') {
    height += fixedSidebar.offsetHeight;
  }
  document.body.style.setProperty('--btmhght', `${height}px`)
}

function setPagePaddingTop() {
  const header = document.querySelector('.header');
  const page = document.querySelector('.page');
  const headerMobile = document.querySelector('.header__mobile');
  if (header&&page) {
    let height = header.offsetHeight;
    let mobileHeight = headerMobile.offsetHeight
    // page.style.paddingTop = md1.matches ? `${mobileHeight}px` : `${height < 138 ? 138 : height}px`;
    document.body.style.setProperty('--headerHeight', md1.matches ? `${mobileHeight}px` : `${height < 138 ? 138 : height}px`);
  }
}

function popupContentsActions(popupContents) {
  popupContents.forEach(popupContent => {
    const popupContentCloseSpan = popupContent.querySelector('[data-drag-close]');
    if (popupContentCloseSpan) {
      let touchStartPoint = null;
      popupContentCloseSpan.addEventListener('touchstart', e => {
        document.documentElement.classList.add('lock');
        touchStartPoint = e.touches[0].clientY;
        const popupEl = e.target.closest('#popupEventRegFull');
        if (popupEl) {
          document.documentElement.classList.add('lock');
          const trigger = document.querySelector('[data-main-button]');
          if (trigger) {
            const triggerEvent = trigger.closest('[data-event]');
            eventPopupBodyForming(trigger, triggerEvent, popupEl);
          }
        }
      });
      popupContentCloseSpan.addEventListener('touchmove', e => {
        if (!touchStartPoint) return;
        let touchPoint = e.touches[0].clientY - touchStartPoint;
        let condition = !popupContentCloseSpan.hasAttribute('data-drag-open')||document.documentElement.classList.contains('popup-show') ? touchPoint > 0 : true;
        if (condition) {
          popupContent.style.transition = `none`;
          popupContent.style.transform = `translateY(${touchPoint}px)`;
          touchPoint > 0 ?
          document.documentElement.classList.add('_popup-drag-down') : 
          document.documentElement.classList.add('_popup-drag-up')
          if (touchPoint > 50) {
            // popupContent.classList.add('_long_anim');
            mhzModules.popup.close(popupContent);
          }
          if (touchPoint < -50) {
            mhzModules.popup.open(`#${popupContent.id}`);
          }
        }
      });
      popupContentCloseSpan.addEventListener('touchend', (e) => { 
        if (
          !document.documentElement.classList.contains('popup-show')&&
          !document.documentElement.classList.contains('menu-open')&&
          !document.documentElement.classList.contains('_filter-spoller-open')
        ) {
          document.documentElement.classList.remove('lock');
        }
        touchStartPoint = null;
        popupContent.style = '';
        setTimeout(() => {
          document.documentElement.classList.remove('_popup-drag-down');
          document.documentElement.classList.remove('_popup-drag-up');
          document.documentElement.classList.contains('lock')&&!document.documentElement.classList.contains('popup-show') ? document.documentElement.classList.remove('lock') : null;
        }, 500);
      });

      // if (popupContentCloseSpan.hasAttribute('data-drag-open')) {
      //   let windowHeight = window.innerHeight;
      //   popupContent.querySelector('.popup__content').style = windowHeight < 600 ? `--tp:${windowHeight - 120}px` :  `--tp:${windowHeight - 180}px`;
      //   window.addEventListener('resize', ()=>{
      //     let windowHeight = window.innerHeight;
      //     popupContent.querySelector('.popup__content').style = windowHeight < 600 ? `--tp:${windowHeight - 120}px` :  `--tp:${windowHeight - (120 + windowHeight*0.018)}px`;
      //     console.log(windowHeight)
      //   })
      // }
    }
  });
}

document.addEventListener('afterPopupClose', (e)=>{
  setTimeout(() => {
    document.querySelectorAll('._long_anim').length ? document.querySelectorAll('._long_anim').forEach(e=>{
      e.classList.remove('_long_anim');
    }) : null;
  }, 100);
  setTimeout(() => {
    document.documentElement.classList.contains('lock')&&!document.documentElement.classList.contains('popup-show') ? document.documentElement.classList.remove('lock') : null;
  }, 500);
});

document.addEventListener('beforePopupOpen', (e)=>{
  const popup = e.detail.popup;
  const popupEl = popup?.targetOpen?.element;
  const id = popupEl?.id;
  if (id ==='consultPopup') {
    const trigger = popup.previousActiveElement;
    const triggerParent = trigger.closest('.item-consult__footer');
    const form = popup.targetOpen.element.querySelector('form');
    if (triggerParent&&form) {
      const hiddenInputs = triggerParent.querySelectorAll('input[type="hidden"]');
      const formHiddenInputs = form.querySelectorAll('input._cloned');
      if (formHiddenInputs.length) {
        formHiddenInputs.forEach(input=>{
          input.remove();
        })
      }
      if (hiddenInputs.length) {
        hiddenInputs.forEach(input=>{
          const name = input.getAttribute('name');
          const value = input.getAttribute('value');
          const newInput = document.createElement('input');
          newInput.setAttribute('type', 'hidden');
          name ? newInput.setAttribute('name', name) : null;
          value ? newInput.setAttribute('value', value) : null;
          newInput.classList.add('_cloned');
          form.appendChild(newInput);
        })
      }
    }
  }

  if (id === 'coursePopup') {
    const trigger = popup.previousActiveElement;
    const form = popup.targetOpen.element.querySelector('form');
    if (trigger) {
      const triggerParent = trigger.closest('[data-course]');
      if (form) {
        const formHiddenInputs = form.querySelectorAll('input._cloned');
        if (formHiddenInputs.length) {
          formHiddenInputs.forEach(e=>e.remove());
        }
        if (triggerParent) {
          const hiddenInputs = triggerParent.querySelectorAll('input[type="hidden"]');
          if (hiddenInputs.length) {
            hiddenInputs.forEach(input=>{
              const newInput = input.cloneNode(true);
              newInput.classList.add('_cloned');
              form.appendChild(newInput);
            })
          }
        }
      }
      if (triggerParent) {
        const name = triggerParent.querySelector('[data-name]');
        const price = triggerParent.querySelector('[data-price]');
        const popupName = popupEl.querySelector('[data-name]');
        const popupPrice = popupEl.querySelector('[data-price]');
        if (name&&popupName) {
          let nameValue = name.innerHTML;
          popupName.innerHTML = nameValue;
          if (popupName.tagName === 'A'&&name.tagName === 'A') {
            popupName.href = name.href;
          }
        }
        if (price&&popupPrice) {
          let priceValue = price.innerHTML;
          popupPrice.innerHTML = priceValue;
        }
      }
    }
  }
});

document.addEventListener('click', (e)=>{
  const closeNotification = e.target.closest('[data-notification] [data-close]');
  if (closeNotification) {
    const notification = closeNotification.closest('[data-notification]');
    if (notification) {
      if (!md3.matches) {
        _slideUp(notification);
      } else {
        notification.style.setProperty('transition', 'all 0.3s ease 0s');
        notification.style.setProperty('transform', 'translateY(110%)');
      }
      setTimeout(() => {
        notification.remove();
      }, 1000);
    }
  }
})


function ontopHideShow() {
  const ontop = document.querySelector('.ontop');
  if (ontop) {
    let offset = ontop.hasAttribute('data-offset')&&!isNaN(parseFloat(ontop.getAttribute('data-offset'))) ? parseFloat(ontop.getAttribute('data-offset')) : 250;
    if (pageYOffset > offset) {
      ontop.classList.remove('_hidden');
    } else {
      ontop.classList.add('_hidden');
    }
  }
}


function setNoheaderClass(noheader) {
  const noheaderMediaNum = noheader.getAttribute('data-noheader').trim()&&!isNaN(parseFloat(noheader.getAttribute('data-noheader'))) ? parseFloat(noheader.getAttribute('data-noheader')) : 0;
  const noheaderMedia = window.matchMedia(`(min-width: ${noheaderMediaNum}px)`);
  if (noheaderMedia.matches) {
    document.documentElement.classList.add('_no-fixed-header');
  } else {
    document.documentElement.classList.remove('_no-fixed-header');
  }
  noheaderMedia.onchange = function() {
    if (this.matches) {
      document.documentElement.classList.add('_no-fixed-header');
    } else {
      document.documentElement.classList.remove('_no-fixed-header');
    }
  }
}