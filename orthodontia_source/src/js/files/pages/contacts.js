document.addEventListener('DOMContentLoaded', ()=>{
  if (document.querySelectorAll('[data-contacts-map]').length) {
    contactsMapsInit();
  }
})

let tryCounter = 0;

function contactsMapsInit() {
  try {
    ymaps.ready(()=>{
      const contactsMapEls =document.querySelectorAll('[data-contacts-map]');
      if (contactsMapEls.length) {
        contactsMapEls.forEach(contactsMapEl=>{
          contactsMapInit(contactsMapEl);
        })
      }
    })
  } catch(err) {
    if (tryCounter < 100) {
      tryCounter++;
      contactsMapsInit();
      // console.warn(err)
    } else {
      console.error(err)
    }
  }
}

function contactsMapInit(contactsMapEl) {
  const centerStr = contactsMapEl.getAttribute('data-center') || '59.931679, 30.400939';
  const markerStr = contactsMapEl.getAttribute('data-marker') || centerStr;

  let map = new ymaps.Map(contactsMapEl, {
    center: centerStr.split(', '),
    zoom: 15,
    controls: ['zoomControl']
  });

  
  let myPlacemark = new ymaps.Placemark(markerStr.split(', '), {
  },{
    // Опции.
    //balloonContentHeader: 'Mistoun',
    //balloonContentBody: 'Москва, Николоямская 40с1',
    //balloonContentFooter: '+ 7(495) 507-54 - 90',
    //hasBalloon: true,
    //hideIconOnBalloonOpen: true,

    hasBalloon: false,
    hideIconOnBalloonOpen: false,
    // Необходимо указать данный тип макета.
    iconLayout: 'default#imageWithContent',
    // Своё изображение иконки метки.
    iconImageHref: '../img/contacts/marker.svg',
    // Размеры метки.
    iconImageSize: [40, 40],
    // Смещение левого верхнего угла иконки относительно
    // её "ножки" (точки привязки).
    iconImageOffset: [-20, -40],
    // Смещение слоя с содержимым относительно слоя с картинкой.
    iconContentOffset: [0, 0],
  });
  map.geoObjects.add(myPlacemark);
}