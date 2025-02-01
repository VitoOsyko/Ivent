import { mhzModules } from "../../modules.js";
import { formValidate } from "../../forms/forms.js";
import { isMobile, _slideDown, _slideUp } from "../../functions.js";
// Подключение плагина из node_modules
import SimpleBar from 'simplebar';
// Подключение стилей из node_modules
import 'simplebar/dist/simplebar.css';

document.addEventListener('DOMContentLoaded', function() {
  const citychange = document.querySelector('[data-citychange]');
  citychange ? cityChangeActions(citychange) : null;

  const searchBox = document.querySelector('[data-search]');
  searchBox ? searchActions(searchBox) : null;

  const sideMenu = document.querySelector('.sidemenu');
  sideMenu ? sideMenuActions(sideMenu) : null;

  const middleSubMenuParents =document.querySelectorAll('[data-middlesubmenu-parent]');
  const middleSubMenuChildrens =document.querySelectorAll('[data-middlesubmenu-children]');
  if (middleSubMenuParents.length&&middleSubMenuChildrens.length) {
    subMenuActions(middleSubMenuParents, middleSubMenuChildrens);
  }
})

document.addEventListener('formSent', (e)=>{
  const { form, responseResult } = e.detail;
  const {success, findemail, message} = e.detail.responseResult;

  
  console.log('Событие отправки формы', e);
  console.log('Форма', form);
  if (form.hasAttribute('data-dev')) {
    console.log('Эта форма в дев режиме!!! Если сейчас происходит натяжка то нужно атрибут data-dev заменить на data-ajax или вовсе убрать');
  }
  console.log('Ожидаемый формат ответа', responseResult);
  console.log('..............');


  if (form.closest('#authPopup')&&success) {
    const phoneInput = form.querySelector('[data-phone]');
    const phoneOutput = document.querySelector('#pinPopup .authPopup__subtitle span');
    phoneOutput.innerHTML = phoneInput.value;
    mhzModules.popup.open('#pinPopup');
    const authPopupLinks =document.querySelectorAll('[data-popup="#authPopup"]');
    if (authPopupLinks) {
      authPopupLinks.forEach(authPopupLink=>{
        if (!authPopupLink.closest('#pinPopup')) {
          authPopupLink.setAttribute('data-popup', '#pinPopup');
          setTimeout(() => {
            authPopupLink.setAttribute('data-popup', '#authPopup');
          }, 6000);
        }
      })
    }
    const pinCodeTimer = document.querySelector('#pinPopup [data-timer]');
    pinCodeTimer ? setPinCodeTimer(pinCodeTimer.dataset.timer, pinCodeTimer) : null;

    const newCodeButton = document.querySelector('[data-newcode] button');
    newCodeButton ? 
    newCodeButton.addEventListener('click', (e)=>{
      pinCodeTimer ? setPinCodeTimer(pinCodeTimer.dataset.timer, pinCodeTimer) : null;
    })
    : null;
  }

  if (form.closest('#authEmailPopup')&&!findemail) {
    const emailInput = form.querySelector('[data-email-input]');
    if (emailInput.value !== '') {
      let email = emailInput.value;
      const emailRegisterInput = document.querySelector('#registerStepOne [data-email-input]');
      if (emailRegisterInput) {
        emailRegisterInput.value = email;
        emailRegisterInput.classList.add('_form-input');
        emailRegisterInput.parentElement.classList.add('_form-input');
      }
    }
    mhzModules.popup.open('#registerStepOne');
  }

  if (form.closest('#registerStepOne')&&success) {
    mhzModules.popup.open('#registerStepTwo');
  }
  if (form.closest('#registerStepTwo')&&success) {
    mhzModules.popup.open('#registerStepThree');
  }
  if (form.closest('#registerStepThree')&&success) {
    const finalTextEl = document.querySelector('#registerStepLast .authPopup__finaltext');
    if (message&&typeof message === 'string'&&message.trim()!==''&&finalTextEl) {
      finalTextEl.innerHTML = message;
    }
    mhzModules.popup.open('#registerStepLast');
  }
})

document.addEventListener('beforePopupClose', (e)=>{
  const form = e.detail.popup.targetOpen.element.querySelector('form');
  if (form) {
    formValidate.formClean(form, false);
    const drops = form.querySelectorAll('[data-radio-spoller-drop]');
    drops.length ? drops.forEach(drop=>{
      _slideUp(drop);
    }) : null;
  }
})

document.addEventListener('change', (e)=>{
  const target = e.target;
  const mainParent = target.closest('[data-radio-spollers]');
  if (mainParent&&target.type !== 'text') {
    const parent = target.closest('[data-radio-spoller]');
    const drops = mainParent.querySelectorAll('[data-radio-spoller-drop]')
    drops.forEach(drop=>{
      if (!parent||!parent.contains(drop)) {
        if (drop.querySelectorAll('[data-need-required]').length) {
          drop.querySelectorAll('[data-need-required]').forEach(e=>{
            e.removeAttribute('data-required');
          })
        }
        _slideUp(drop, 250);
      } else {
        if (drop.querySelectorAll('[data-need-required]').length) {
          drop.querySelectorAll('[data-need-required]').forEach(e=>{
            e.setAttribute('data-required', '');
          })
        }
        _slideDown(drop, 250);
      }
    })
  }
})

document.addEventListener('input', (e)=>{
  formMomentValidate(e);
  setTimeout(() => {
    formMomentValidate(e);
  }, 10);
});
document.addEventListener('focusin', (e)=>{
  formMomentValidate(e);
  setTimeout(() => {
    formMomentValidate(e);
  }, 10);
});
document.addEventListener('focusout', (e)=>{
  formMomentValidate(e);
  setTimeout(() => {
    formMomentValidate(e);
  }, 10);
});
document.addEventListener('change', (e)=>{
  formMomentValidate(e);
  setTimeout(() => {
    formMomentValidate(e);
  }, 10);
});

export function formMomentValidate(e) {
  const target = e.target ? e.target : e;
  const form = target.closest('form[data-validate]');
  if (form) {
    let attr = form.getAttribute('data-validate');
    let condition = true;
    if (attr.trim()) {
      condition = attr.includes(e.type)
    }
    if (condition) {
      const button = form.querySelector('[type="submit"]');
      let setErrors = form?.hasAttribute('data-set-errors');
      button.disabled = formValidate.getErrors(form, setErrors)>0;
    }
  }
}

function cityChangeActions(citychange) {
  const citylinks = citychange.querySelectorAll('[data-number]');
  const cityoutput = citychange.querySelector('[data-output]');
  const spollerTrigger = citychange.querySelector('[data-spoller]');
  citylinks.forEach(citylink=>{
    citylink.addEventListener('click', (e)=>{
      e.preventDefault();
      let number = citylink.getAttribute('data-number');
      let numberRedacted = number.replaceAll('(','').replaceAll(')','').replaceAll('-','').replaceAll(' ','');
      let city = citylink.textContent;
      spollerTrigger.querySelector('span') 
        ? spollerTrigger.querySelector('span').innerHTML = city 
        : spollerTrigger.innerHTML = city;

      cityoutput.innerHTML = number;
      cityoutput.setAttribute('href', `tel:${numberRedacted}`)
      spollerTrigger.click();
      citylinks.forEach(citylink=>{citylink.hidden = false});
      citylink.hidden = true;
    })
  })
}

function searchActions(searchBox) {
  const searchInput = searchBox.querySelector('[data-search-input]');
  const searchClear = searchBox.querySelector('[data-search-clean]');
  if (searchInput) {
    searchInput.addEventListener('focusin', (e)=>{
      const middleHeaderMenu = document.querySelector('.middle-header__menu');
      const middleHeaderSocials = document.querySelector('.middle-header__socials');
      let width = searchBox.offsetWidth;
      middleHeaderMenu ? width += middleHeaderMenu.offsetWidth+20 : null;
      middleHeaderSocials ? width += middleHeaderSocials.offsetWidth+20 : null;
      searchBox.style.setProperty('--srchwdth', `${width}px`);
      searchBox.classList.add('_active');
    });
    searchInput.addEventListener('focusout', (e)=>{
      searchBox.classList.remove('_active');
    });

    searchClear.addEventListener('click', (e)=>{
      e.preventDefault();
      searchInput.value = '';
      searchInput.classList.remove('_form-input');
      searchInput.parentElement.classList.remove('_form-input');
    })
  }
}

function setPinCodeTimer(seconds, pinCodeTimer) {
  const newCode = pinCodeTimer.closest('form').querySelector('[data-newcode]');
  pinCodeTimer.parentElement.hidden = false;
  newCode.hidden = true;
  let minutes = Math.floor(seconds/60);
  let seconds_new = seconds - 60*minutes;
  let timeString = `${minutes < 10 ? `0${minutes}` : minutes}:${seconds_new<10?`0${seconds_new}`:seconds_new}`
  pinCodeTimer.innerHTML = timeString;
  
  let interval = setInterval(() => {
    let minutes = Math.floor(seconds/60);
    let seconds_new = seconds - 60*minutes;
    let timeString = `${minutes < 10 ? `0${minutes}` : minutes}:${seconds_new<10?`0${seconds_new}`:seconds_new}`
    pinCodeTimer.innerHTML = timeString;
    if (seconds>0) {
      --seconds;
    } else {
      clearInterval(interval);
      newCode.hidden = false;
      pinCodeTimer.parentElement.hidden = true;
    }
  }, 1000);

  document.addEventListener('beforePopupClose', (e) =>{
    if (e.detail.popup.targetOpen.element.contains(pinCodeTimer)) {
      typeof interval !== 'undefined' ? clearInterval(interval) : null;
    }
  })
}

function subMenuActions(middleSubMenuParents, middleSubMenuChildrens) {
  middleSubMenuParents.forEach(middleSubMenuParent=>{
    let name = middleSubMenuParent.getAttribute('data-middlesubmenu-parent')
    const children = document.querySelector(`[data-middlesubmenu-children="${name}"]`);
    middleSubMenuParent.addEventListener('mouseenter', (e)=>{
      children ? children.classList.add('_active') : null;
      middleSubMenuParent.classList.add('_active');
    })
    middleSubMenuParent.addEventListener('mouseleave', (e)=>{
      if (children) {
        children.classList.remove('_active');
      }
      middleSubMenuParent.classList.remove('_active');
    })
  })
  middleSubMenuChildrens.forEach(middleSubMenuChildren=>{
    let name = middleSubMenuChildren.getAttribute('data-middlesubmenu-children')
    const children = document.querySelector(`[data-middlesubmenu-parent="${name}"]`);
    middleSubMenuChildren.addEventListener('mouseenter', (e)=>{
      if (children) {
        children.closest('[data-middlesubmenu-children]') ? 
        children.closest('[data-middlesubmenu-children]').classList.add('_active') :  
        children.classList.add('_active')
      }
      middleSubMenuChildren.classList.add('_active');
    })
    middleSubMenuChildren.addEventListener('mouseleave', (e)=>{
      if (children) {
        children.closest('[data-middlesubmenu-children]') ? 
        children.closest('[data-middlesubmenu-children]').classList.remove('_active') :  
        children.classList.remove('_active')
      }
      middleSubMenuChildren.classList.remove('_active');
    })
  })
}

function sideMenuActions(sideMenu) {
  const submenuTriggers = sideMenu.querySelectorAll('[data-submenu-trigger]');
  const back = sideMenu.querySelector('.sidemenu__back');
  const mainList = sideMenu.querySelector('.sidemenu__list_main');
  let lastOpened = null;
  let lastStyled = null;
  if (submenuTriggers) {
    submenuTriggers.forEach(submenuTrigger=>{
      submenuTrigger.addEventListener('click', (e)=>{
        const subMenuBody = submenuTrigger.parentElement.querySelector('[data-submenu-body]');
        if (subMenuBody) {
          e.preventDefault();
          subMenuBody.classList.add('_active');
          lastOpened = subMenuBody;
          mainList.style = `height:${subMenuBody.offsetHeight}px; overflow:hidden;`;
          lastStyled = mainList;
          if (submenuTrigger.closest('[data-submenu-body]')) {
            submenuTrigger.closest('[data-submenu-body]').style = `height:${subMenuBody.offsetHeight}px;overflow:hidden;`;
            lastStyled = submenuTrigger.closest('[data-submenu-body]');
          }
          back.hidden = false;
        }
      })
    });
    document.addEventListener('toggleMenu', (e)=>{
      const activeSubMenus =document.querySelectorAll('[data-submenu-body]');
      back.hidden = true;
      activeSubMenus.length ? activeSubMenus.forEach(activeSubMenu=>{
        activeSubMenu.classList.remove('_active');
        activeSubMenu.style = '';
        mainList.style = '';
      }) : null;
    });
    back.addEventListener('click', (e)=>{
      if (lastOpened) {
        lastOpened.classList.remove('_active');
        lastOpened = lastOpened.closest('[data-submenu-body]._active');
        if (lastOpened === null) {
          back.hidden = true;
        }
      } else {
        const activeBodies =document.querySelectorAll('[data-submenu-body]._active');
        activeBodies[activeBodies.length-1].classList.remove('_active');
        back.hidden = true;
      }
      if (lastStyled&&lastStyled!==mainList) {
        lastStyled.style='';
        mainList.style = `height:${lastStyled.offsetHeight}px; overflow:hidden;`;
        lastStyled = lastStyled.closest('[data-submenu-body]._active');
        if (lastStyled === null) {
          mainList.style = '';
        }
      } else {
        mainList.style = '';
      }
    })
  }
}