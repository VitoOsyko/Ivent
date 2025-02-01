import { _slideToggle, _slideDown, _slideUp } from "../functions.js";
import { datePickerInit } from './records.js'
import { formSubmit } from "../forms/forms.js"; 
const md3 = matchMedia('(max-width:768px)');

document.addEventListener('DOMContentLoaded', function() {
  const filterSubmits = document.querySelectorAll('.filters .spollers-filters__submit');
  filterSubmits.length ? filtersSubmitHandler(filterSubmits) : null;


  document.addEventListener('spollerAction', ()=>{
    const filtersRows =document.querySelectorAll('.spollers-filters__rows');
    filtersRows.length ? setFiltersRowsWidth(filtersRows) : null;
  })

  const fixedEvents = document.querySelectorAll('[data-fixed-event]');
  fixedEvents.length ? fixedEvents.forEach(fixedEvent=>{
    setFixedEventActive(fixedEvent);
  }) : null;


  const filtersBodies =document.querySelectorAll('.filters .spollers-filters__body');
  if (filtersBodies.length&&md3.matches) {
    let copyParent = document.createElement('div');
    copyParent.classList.add('filterCopies');

    filtersBodies.forEach((body, index) => {
      const inputs = body.querySelectorAll('input');
      if (inputs.length) {
        inputs.forEach((input, inpidx) => {
          input.id = `spollers-filters__checkbox_${index}_${inpidx}`;
        })
      }
    })
    
    filtersBodies.forEach((body, index)=>{

      let bodyCopy = body.cloneNode(true);
      bodyCopy.classList.remove('_slide');
      bodyCopy.style = '';
      bodyCopy.hidden = true;
      let attr = false;

      const parent = body.closest('[data-filter-item]');
      if (parent) {
        attr = parent.getAttribute('data-filter-item');
      }

      body.setAttribute('data-id', index);
      bodyCopy.setAttribute('data-id', index);
      if (attr) {
        bodyCopy.setAttribute('data-filter-item', attr);
      }

      if (bodyCopy.querySelector('.datepicker')) {
        bodyCopy.querySelector('.datepicker').remove();
        const pickerEl = bodyCopy.querySelector('[data-datepicker]');
        if (pickerEl) {
          datePickerInit(pickerEl);
        }
      }

      const idEls = bodyCopy.querySelectorAll('[id]');
      const forEls = bodyCopy.querySelectorAll('[for]');

      if (idEls.length) {
        idEls.forEach(e=>{
          let id = e.id;
          e.id = `cloned_${id}`;
        })
      }
      if (forEls.length) {
        forEls.forEach(e=>{
          let forAttr = e.getAttribute('for');
          e.setAttribute('for', `cloned_${forAttr}`);
        })
      }

      copyParent.appendChild(bodyCopy);
    });

    document.body.appendChild(copyParent);
    formSubmit();

    document.addEventListener('click', (e)=>{
      const spollerFilterTitle = e.target.closest('.spollers-filters__title')
      if (spollerFilterTitle) {
        e.stopPropagation();
        const spollerBody = spollerFilterTitle.nextElementSibling;
        if (spollerBody) {
          let id = spollerBody.getAttribute('data-id');
          const spollerBodyClone = document.querySelector(`.filterCopies [data-id="${id}"]`);
          if (spollerBodyClone) {
            _slideToggle(spollerBodyClone);
            document.documentElement.classList.toggle('_filter-spoller-open');
          }
        }
      }

      const closeTrigger = e.target.closest('.spollers-filters__close');
      if (closeTrigger) {
        const spollerBody = closeTrigger.closest('.spollers-filters__body');
        if (spollerBody) {
          document.documentElement.classList.remove('_spoller-open');
          _slideUp(spollerBody);
          document.documentElement.classList.remove('_filter-spoller-open');
        }
      }

      const filterCopiyLabel = e.target.closest('.filterCopies .spollers-filters__label');
      if (filterCopiyLabel) {
        const parent = filterCopiyLabel.closest('.spollers-filters__body[data-id]');
        const parentRow = filterCopiyLabel.closest('.spollers-filters__row');
        if (parent&&parentRow) {
          let id = parent.getAttribute('data-id');
          let boxid = parentRow.querySelector('[id]')?.id?.replace('cloned_', '');
          // let forAttr = filterCopiyLabel.getAttribute('for')?.replace('cloned_', '');
          
          const originalLabel = document.querySelector(`.filters [data-id="${id}"] [id="${boxid}"]`);
          console.log(originalLabel)
          if (originalLabel) {
            originalLabel.click();
          }
        }
      }
      
      const filterCopyDate = e.target.closest('.filterCopies [data-date]');
      if (filterCopyDate) {
        const parent = filterCopyDate.closest('.spollers-filters__body[data-id]');
        if (parent) {
          let id = parent.getAttribute('data-id');
          let attr = filterCopyDate.getAttribute('data-date');
          
          const originalLabel = document.querySelector(`.filters [data-id="${id}"] [data-date="${attr}"]`);
          if (originalLabel) {
            originalLabel.click();
          }
        }
      }

      const submitTrigger = e.target.closest('.filterCopies .spollers-filters__submit');
      if (submitTrigger) {
        const spollerBody = submitTrigger.closest('.spollers-filters__body');
        if (spollerBody) {
          let id = spollerBody.getAttribute('data-id');
          const originalFilterSubmit = document.querySelector(`.filters [data-id="${id}"] .spollers-filters__submit`);
          if (originalFilterSubmit) {
            setTimeout(() => {
              originalFilterSubmit.click();
            }, 1);
          }
          // document.documentElement.classList.remove('_spoller-open');
          // _slideUp(spollerBody);
        }
      }
    })
  }
});

document.addEventListener('change', (e)=>{
  const filtersBody = e.target.closest('.spollers-filters__body');
  if (filtersBody) {
    const submitButton = filtersBody.querySelector('.spollers-filters__submit');
    const filtersCheckedInputs =filtersBody.querySelectorAll('input:checked');
    if (submitButton) {
      submitButton.hidden = filtersCheckedInputs.length ? false : true;
    }
  }

  const consultFileInputCondition = e.target.classList.contains('consultPopup__file');
  if (consultFileInputCondition) {
    const maxSizeAttr = e.target.getAttribute('data-maxsize');
    const parent = e.target.closest('.consultPopup__row');
    const fileSpan = document.querySelector('.consultPopup__filespan');
    if (maxSizeAttr) {
      let size = 0;
      const maxSize = 1000000*maxSizeAttr;
      const files = e.target.files;
      let str = ``;
      if (Object.keys(files).length) {
        Object.keys(files).forEach((e, index)=>{
          const file = files[e];
          size += file.size;
          let dop = index === Object.keys(files).length-1 ? '' : ', ';
          str+=file.name+dop;
        })
      } else {
        str = 'Файл не выбран';
      }
      fileSpan ? fileSpan.innerHTML = str : null;
      if (size > maxSize) {
        e.target.classList.add('_form-error');
        if (parent) {
          parent.classList.add('_form-error');
          const infoText = parent.querySelector('.consultPopup__info');
          if (infoText) {
            infoText.innerHTML = `Размер загружаемого файла превышает ${maxSizeAttr} Mb`;
          }
        }
      } else {
        e.target.classList.remove('_form-error');
        if (parent) {
          parent.classList.remove('_form-error');
          const infoText = parent.querySelector('.consultPopup__info');
          if (infoText) {
            infoText.innerHTML = `Максимальный размер загружаемого файла ${maxSizeAttr} Mb`;
          }
        }
      }
    }
  }
})

function filtersSubmitHandler(filterSubmits) {
  filterSubmits.forEach(filterSubmit=>{
    filterCheckedRender(filterSubmit);
    filterSubmit.addEventListener('click', (e)=>{
      filterCheckedRender(filterSubmit, e);
    })
  })
  document.addEventListener('spollerAction', (e)=>{
    const filterItem = e.detail.spoller.closest('.spollers-filters__item');
    if (filterItem) {
      if (window.innerWidth < 767&&document.querySelector('._spoller-active')) {
        document.documentElement.classList.add('_filter-spoller-open');
      } else {
        document.documentElement.classList.remove('_filter-spoller-open');
      }
      // const filterSubmit = filterItem.querySelector('.spollers-filters__submit');
      // filterSubmit ? filterCheckedRender(filterSubmit) : null;
    }
  })

  document.addEventListener('click', (e)=>{
    const checkedItem = e.target.closest('.checked-filters__item');
    const delFilters = e.target.closest('.checked-filters__del');
    const closeFilters = e.target.closest('.spollers-filters__close');
    const filterReset = e.target.closest('button.checked-filters__button');
    if (window.innerWidth < 767) {
      if (checkedItem&&!delFilters) {
        const whosParent = checkedItem ? checkedItem : closeFilters.closest('.spollers-filters__body');
        let filterSpollerTitle = whosParent.parentElement.querySelector('[data-spoller]');
        if (whosParent.classList.contains('_cloned')) {
          let id = whosParent.getAttribute('data-id');
          const whosTemp = document.querySelector(`.spollers-filters__body[data-id="${id}"]`);
          if (whosTemp) {
            filterSpollerTitle = whosTemp.parentElement.querySelector('[data-spoller]')
          }
        } else {
          filterSpollerTitle.click();
        }
      }
    }
    if (delFilters) {
      filtersDel(delFilters);
    }
    if (filterReset) {
      resetFilters(filterReset);
    }
  })
}

function filtersDel(delFilters) {
  const delFiltersItem = delFilters.closest('[data-checked-item]');
  if (delFiltersItem) {
    const selector = delFiltersItem.getAttribute('data-checked-item');
    if (selector.trim()) {
      const filterItems = document.querySelectorAll(`[data-filter-item="${selector}"]`);
      if (filterItems.length) {
        filterItems.forEach(filterItem=>{
          const filterSubmit = filterItem.querySelector('.spollers-filters__submit');
          const filterInputs = filterItem.querySelectorAll('input');
          filterInputs.length ? filterInputs.forEach(filterInput=>{
            if (filterInput.type==='checkbox'||filterInput.type==='radio') {
              filterInput.checked = false;
            } else {
              filterItem.classList.remove('_checked');
              filterInput.value = '';
            }
          }) : null;
          const datepicker = filterItem.querySelector('[data-datepicker]');
          if (datepicker?.picker) {
            datepicker.picker.dates = [];
            datepicker.picker.setDate([], {clean: true, render: true});
            const selectedDates = filterItem.querySelectorAll('.datepicker-cell.day.selected');
            if (selectedDates.length) {
              selectedDates.forEach(e=>{
                e.classList.remove('selected');
                e.classList.remove('focused');
              })
            }
          }
          filterSubmit ? filterSubmit.hidden = true : null;
          filterSubmit ? filterCheckedRender(filterSubmit) : null;
        })
      }
    }
  }
}

function resetFilters(filterReset) {
  const filterCheckedsGlobal = document.querySelectorAll('.spollers-filters__body input:checked');
  const filterCheckedItems = document.querySelectorAll('.checked-filters__item');
  const spollersItemsChecked =document.querySelectorAll('.spollers-filters__item._checked');
  const submitBtns = document.querySelectorAll('.spollers-filters__submit');
  if (submitBtns.length) {
    submitBtns.forEach(e=>e.hidden=true);
  }
  if (filterCheckedsGlobal.length) {
    filterCheckedsGlobal.forEach(e=>e.checked = false);
  }
  if (filterCheckedItems.length) {
    filterCheckedItems.forEach(e=>e.remove());
  }
  if (spollersItemsChecked.length) {
    spollersItemsChecked.forEach(e=>{
      e.classList.remove('_checked');
      const datepicker = e.querySelector('[data-datepicker]');
      if (datepicker?.picker) {
        datepicker.picker.dates = [];
        datepicker.picker.setDate([], {clean: true, render: true});
        const selectedDates = document.querySelectorAll('.datepicker-cell.day.selected');
        if (selectedDates.length) {
          selectedDates.forEach(e=>{
            e.classList.remove('selected');
            e.classList.remove('focused');
          })
        }
      }
    });
  }
  filterReset.hidden = true;

}

function filterCheckedRender(filterSubmit, e) {
  const filterItem = filterSubmit.closest('.spollers-filters__item');
  if (filterItem) {
    const filterCheckedParent = window.innerWidth > 767 ? document.querySelector('.checked-filters') : filterItem;
    const filtersContainer = document.querySelector('.filters__container');
    const filterReset = document.querySelector('button.checked-filters__button');
    const filterCheckedsGlobal = document.querySelectorAll('.spollers-filters__body input:checked');
    let globalArr = [
      ...filterItem.querySelectorAll('input[hidden]'), 
      ...filterItem.querySelectorAll('input[type="hidden"]'),
      ...filterItem.querySelectorAll('input[data-fordate]')
    ]
    if (filterReset) {
      filterReset.hidden = filterCheckedsGlobal.length ? false : true;
      if (globalArr.length) {
        globalArr.forEach(e=>{
          if (e.value) {
            filterReset.hidden = false;
          }
        })
      }
    }
    if (filterItem) {
      const filterTitle = filterItem.querySelector('.spollers-filters__title');
      let filterCheckeds = filterItem.querySelectorAll('input:checked');
      if (filterItem.querySelectorAll('input[hidden]')||filterItem.querySelectorAll('input[type="hidden"]')||filterItem.querySelectorAll('input[data-fordate]')) {
        filterCheckeds = [
          ...filterCheckeds, 
          ...filterItem.querySelectorAll('input[hidden]'), 
          ...filterItem.querySelectorAll('input[type="hidden"]'),
          ...filterItem.querySelectorAll('input[data-fordate]'),
        ]
      }
      if (filterCheckedParent&&filterTitle) {
        let filterName = filterTitle.textContent.trim();
        const filterCheckedItem = filterCheckedParent.querySelector(`[data-checked-item="${filterName}"]`);
        if (filterCheckeds.length) {
          filtersContainer ? filtersContainer.style = '' : null;
          filterItem.classList.add('_checked');
          let str = ``;
          filterCheckeds.forEach(filterChecked=>{
            let value = filterChecked.value;
            const checkedLabel = filterChecked.parentElement.querySelector('.spollers-filters__label');
            if (checkedLabel) {
              str+= checkedLabel.textContent.trim() ? `<div class="checked-filters__value" data-value="${value}">${checkedLabel.textContent.trim()}</div>\n` : '';
            } else {
              str += value.trim()!=='' ? `<div class="checked-filters__value" data-value="${value}">${value}</div>\n` : ''
            }
          });
          if (filterCheckedItem&&filterCheckedItem.querySelector('.checked-filters__body')) {
            if (str.trim()!=='') {
              filterCheckedItem.querySelector('.checked-filters__body').innerHTML = str;
            } else {
              filterCheckedItem.remove();
              filterItem.classList.remove('_checked');
            }
          } else {
            if (str.trim()) {
              const forPast = filterCheckedParent.querySelector('.checked-filters__wrapper')&&window.innerWidth>767 ? filterCheckedParent.querySelector('.checked-filters__wrapper') : filterCheckedParent;
              forPast.insertAdjacentHTML('beforeend', `
              <div class="checked-filters__item" data-checked-item="${filterName}">
                <div class="checked-filters__name">${filterName}:</div>
                <div class="checked-filters__body">
                  ${str}
                </div>
                <div class="checked-filters__del"></div>
              </div>
              `);
            } else {
              filterItem.classList.remove('_checked');
            }
          }
          if (window.innerWidth < 767) {
            if (filterItem.querySelector('.checked-filters__item')) {
              setTimeout(() => {
                let width = filterItem.querySelector('.checked-filters__item').offsetWidth;
                if (filterItem.querySelector('[data-fordate]')) {
                  if (!filterItem.querySelector('[data-fordate]').value.trim()) {
                    width = 0;
                  }
                }
                filterItem.style.minWidth = `${width}px`;
              }, 50);
            } else {
              filterItem.style.minWidth = ``;
            }
          }
        } else {
          filterItem.classList.remove('_checked');
          filterItem.style='';
          filterCheckedItem ? filterCheckedItem.remove() : null;
          setTimeout(() => {
            if (!filterCheckedParent.querySelector('.checked-filters__item')) {
              filtersContainer&&window.innerWidth>767 ? filtersContainer.style = 'padding-bottom: 0' : null;
            }
          }, 1);
        }
        e ? filterTitle.click() : null;
      }
    }

    document.documentElement.classList.remove('_filter-spoller-open');
  }
}

function setFiltersRowsWidth(filtersRows) {
  filtersRows.forEach(filtersRow=>{
    let arr = [];
    const rows = filtersRow.querySelectorAll('.spollers-filters__row');
    if (rows.length) {
      rows.forEach(e=>{
        arr.push(e.scrollWidth);
      });
      filtersRow.style.minWidth = `${Math.max(...arr)}px`
    }
  })
}

function setFixedEventActive(fixedEvent) {
  let offsetTopAttr = fixedEvent.getAttribute('data-fixed-event');
  let offsetTop = offsetTopAttr.trim()&&!isNaN(offsetTopAttr) ? parseFloat(offsetTopAttr) : 350;
  window.pageYOffset > offsetTop ? fixedEvent.classList.add('_active') : fixedEvent.classList.remove('_active');
  window.addEventListener('scroll', ()=>{
    window.pageYOffset > offsetTop ? fixedEvent.classList.add('_active') : fixedEvent.classList.remove('_active');
  })
}