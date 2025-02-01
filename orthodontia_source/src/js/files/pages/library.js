import { wrap } from "../functions.js";
import lightGallery from 'lightgallery';
import lgZoom from 'lightgallery/plugins/zoom/lg-zoom.min.js'
import lgAutoplay from 'lightgallery/plugins/autoplay/lg-autoplay.min.js'

document.addEventListener('DOMContentLoaded', function(e) {
  const articleContent = document.querySelector('.article');
  if (articleContent) {
    if (articleContent.hasAttribute('data-custom-gallery')) {
      const pictures = articleContent.querySelectorAll('img');
      if (pictures.length) {
        pictures.forEach(picture=>{
          if (!picture.closest('.banner-eventsfull')) {
            let attributes = [];
            if (picture.src.trim()) {
              attributes.push({
                name: 'href',
                value: picture.src.replace(location.origin, '')
              })
            }
            wrap(picture, 'a', 'article__img', attributes, picture.alt)
          }
        })
      }
    } else {
      const pictures = articleContent.querySelectorAll('img');
      if (pictures.length) {
        pictures.forEach(picture=>{
          if (!picture.closest('.banner-eventsfull')) {
            let attributes = [];
            if (picture.hasAttribute('data-style')||picture.hasAttribute('style')) {
              attributes.push({
                name: 'style',
                value: picture.getAttribute('data-style') || picture.getAttribute('style')
              });
            }
            wrap(picture, 'div', 'article__img', attributes)
          }
        })
      }
    }

    const links = articleContent.querySelectorAll('a');
    if (links.length) {
      links.forEach(link => {
        let condition = 
          link.href.includes('#')
          &&!link.classList.contains('article__download')
          &&!link.classList.contains('btn')
          &&!link.hasAttribute('data-popup')
          &&!link.closest('.event-banner__container');

        if (condition) {
          link.setAttribute('data-goto', link.getAttribute('href'));
          link.setAttribute('data-goto-header', '');
          link.removeAttribute('href');
        }
      })
    }

    if (articleContent.hasAttribute('data-custom-gallery')) {
      lightGallery(articleContent, {
        plugins: [lgZoom, lgAutoplay],
        licenseKey: '7EC452A9-0CFD441C-BD984C7C-17C8456E',
        speed: 500,
        selector: 'a.article__img',
        infiniteZoom: true,
        hash: true,
        mobileSettings: {
          controls: true
        }
      })
    }
  }
})