import { isMobile, wrap } from '../functions.js';

document.addEventListener('DOMContentLoaded', function(e) {
  const iframes =document.querySelectorAll('._content iframe');
  if (iframes.length) {
    iframes.forEach(iframe=>{
      wrap(iframe, 'div', 'iframe_wrap');
    })

    const iframeWraps = document.querySelectorAll('.iframe_wrap');
    if (iframeWraps.length) {
      setIframeSize(iframeWraps);
      window.addEventListener('resize', ()=>{
        setIframeSize(iframeWraps);
      })
    }
  }
})


function setIframeSize(iframeWraps) {
  iframeWraps.forEach(iframe=>{
    let style = 'padding-bottom:56.25%';
    if (window.innerWidth > 793) {
      style = 'height:446.0625px';
    }
    iframe.style = style;
  })
}