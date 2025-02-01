import LazyLoad from "vanilla-lazyload";

// Работает с объектами с класом ._lazy
window.addEventListener('load', (e)=>{
  setTimeout(() => {
    const lazyMedia = new LazyLoad({
      elements_selector: '[data-src],[data-srcset]',
      class_loaded: '_lazy-loaded',
      use_native: false,
    });
  }, 100);
})

// Обновить модуль
//lazyMedia.update();