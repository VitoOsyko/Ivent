import { gotoBlock } from "../scroll/gotoblock.js";
import SimpleBar from 'simplebar';

let md2 = window.matchMedia("(max-width: 992px)")
document.addEventListener('DOMContentLoaded', function() {
  const learningsEl = document.querySelector('[data-learnings]');
  if (learningsEl) {
    try {
      new Learnings(learningsEl);
    } catch(err) {
      console.error(err);
    }
  }
})


class Learnings {

  constructor(learningsEl) {
    if (learningsEl) {
      this.root = learningsEl;
      this.els = {
        list: learningsEl.querySelector('[data-list]'),
        listBody: learningsEl.querySelector('[data-list-body]'),
        mapParent: learningsEl.querySelector('[data-map]')
      }
      
      this.init();
    }
  }

  async init() {
    this.setHeights();
    window.addEventListener('resize', this.setHeights.bind(this));
    this.setClickHandler();
    this.data = await this.getData();
    if (this.data) {
      this.tryInitMap();
      if (this.els.listBody) {
        this.renderList();
      }
      console.log('LETS LEARNING');
    }
  }

  setHeights() {
    if (this.els.mapParent&&this.els.listBody) {
      this.els.listBody.style.maxHeight = !md2.matches ? `${this.els.mapParent.offsetHeight}px` : `228px`;
    }
  }

  setClickHandler() {
    document.addEventListener('click', (e)=>{
      if (e.target.closest('.list-learnings__trigger')) {
        this.openList();
      }

      if (!e.target.closest('.learnings__container')||e.target.closest('.list-learnings__close')) {
        this.closeList();
      }

      const listItem = e.target.closest('[data-list-body] [data-coords]');
      if (listItem) {
        const coords = listItem.dataset.coords.split(',');
        const id = listItem.dataset.id;
        this.setMapZoomCenter(coords, 12);
        this.objectManager.objects.balloon.open(id);
        this.listItemsUnActive();
        listItem.classList.add('_active');
      }

      if (!e.target.closest('.learnings__container')||e.target.closest('.list-learnings__close')) {
        this.objectManager.objects.balloon.close();
        this.map.setBounds(this.map.geoObjects.getBounds());
        this.listItemsUnActive();
      }
    })
  }

  openList() {
    document.documentElement.classList.add('list-learnings-open');
    md2.matches ? document.documentElement.classList.add('lock') : null;
    gotoBlock('[data-learnings] [data-map]', true);
  }

  closeList() {
    document.documentElement.classList.remove('lock');
    document.documentElement.classList.remove('list-learnings-open');
    this.customScroll.getScrollElement().scrollTo({ top: 0, behavior: "smooth" });
  }

  setMapZoomCenter(center, zoom) {
    this.map.setCenter(center);
    this.map.setZoom(zoom);
  }

  async getData() {
    const attr = this.root.getAttribute('data-learnings')
    let method = 'GET';
    let url = attr;
    if (attr.indexOf(',')>=0) {
      method = attr.split(',')[1].trim().toUpperCase();
      url = attr.split(',')[0].trim();
    }
    let options = {
      method,
    }
    let answer = false;
    await fetch(url, options)
      .then(res=>res.json())
      .then(response=>answer = response)
      .catch(err=>console.error(err));
    
    return answer;
  }

  tryInitMap() {
    try {
      if (ymaps) {
        ymaps.ready(this.initMap.bind(this))
      }
    } catch(err) {
      console.error(err);
      this.tryInitMap();
    }
  }

  initMap() {
    this.map = new ymaps.Map(this.els.mapParent, {
      center: [55.76, 37.64],
      zoom: 10,
      controls: ['zoomControl']
    });

    this.objectManager = new ymaps.ObjectManager({
      clusterize: false,
      gridSize: 32,
    });

    this.objectManager.objects.events.add('add', this.onObjectEvent.bind(this));
    this.objectManager.objects.events.add('click', this.onObjectClick.bind(this));

    this.map.geoObjects.add(this.objectManager);
    this.objectManager.add(this.data);
    this.map.setBounds(this.map.geoObjects.getBounds());
  }

  onObjectEvent(e) {
    let object = this.objectManager.objects.getById(e.get('objectId'));
    const properties = object.properties;
    let linkstr = '';
    if (properties.phones?.length) {
      properties.phones.forEach((phone, index)=>{
        let number = phone;
        if (phone.indexOf(',')>=0) {
          number = phone.split(',')[0].trim();
        }
        linkstr += `<a href="tel:${number}">${phone}</a>${index+1<properties.phones.length ? ', ' : ''}`
      })
    }
    let mailsStr = ``;
    if (properties.mails?.length) {
      properties.mails.forEach((mail, index)=>{
        mailsStr += `<a href="mailto:${mail}">${mail}</a>${index+1<properties.phones.length ? ', ' : ''}`
      })
    }
    object.properties.balloonContentBody = `
      <div class="baloon-learnings">
        <div class="baloon-learnings__name">${properties.name}</div>
        <ul class="baloon-learnings__body">
          <li>
            <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="5.12813" cy="7.26051" rx="1.62837" ry="1.62837" stroke="#8A8A8A" stroke-width="0.842593" stroke-linecap="round" stroke-linejoin="round"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.32035 10.331L6.0173 12.6341C5.59344 13.0575 4.90669 13.0575 4.48283 12.6341L2.17923 10.331C0.48351 8.63524 0.483558 5.88588 2.17933 4.19014C3.87511 2.4944 6.62447 2.4944 8.32025 4.19014C10.016 5.88588 10.0161 8.63524 8.32035 10.331V10.331Z" stroke="#8A8A8A" stroke-width="0.842593" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${properties.address}</span>
          </li>
          <li>${linkstr}</li>
          <li>${mailsStr}</li>
        </ul>
      </div>
    `
  }

  onObjectClick(e) {
    let id = e.get('objectId');
    const object = this.objectManager.objects.getById(id);
    const listItem = document.querySelector(`[data-list-body] [data-id="${id}"]`);
    if (listItem) {
      this.setMapZoomCenter(object.geometry.coordinates, 12)
      this.listItemsUnActive();
      this.openList();

      setTimeout(() => {
        this.customScroll.getScrollElement().scrollTo({ top: listItem.offsetTop, behavior: "smooth" });
        listItem.classList.add('_active');
      }, 320);
    }
  }

  listItemsUnActive() {
    const listItems =document.querySelectorAll('[data-list-body] [data-coords]');
    if (listItems.length) {
      listItems.forEach(e=>e.classList.remove('_active'));
    }
  }

  renderList() {
    const arr = this.data.features ? this.data.features : [];
    if (arr.length) {
      let str = '';
      arr.forEach(element => {
        const properties = element.properties;
        if (properties) {
          let linkstr = '';
          if (properties.phones?.length) {
            properties.phones.forEach((phone, index)=>{
              let number = phone;
              if (phone.indexOf(',')>=0) {
                number = phone.split(',')[0].trim();
              }
              linkstr += `<a href="tel:${number}">${phone}</a>${index+1<properties.phones.length ? ', ' : ''}`
            })
          }
          let mailsStr = ``;
          if (properties.mails?.length) {
            properties.mails.forEach((mail, index)=>{
              mailsStr += `<a href="mailto:${mail}">${mail}</a>${index+1<properties.phones.length ? ', ' : ''}`
            })
          }
          const coords = element.geometry.coordinates;
          str += `
            <div class="list-learning__item item-learnings" data-coords="${coords}" data-id="${element.id}">
              <div class="item-learnings__name">
                ${properties.name}
              </div>
              <ul class="item-learnings__info">
                <li>
                  <svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="7.59344" cy="9.33492" rx="2.09362" ry="2.09361" stroke="#8A8A8A" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.6975 13.2828L8.73646 16.2438C8.1915 16.7882 7.30853 16.7882 6.76358 16.2438L3.8018 13.2828C1.6216 11.1024 1.62166 7.56756 3.80194 5.38732C5.98222 3.20708 9.51712 3.20708 11.6974 5.38732C13.8777 7.56756 13.8777 11.1024 11.6975 13.2828V13.2828Z" stroke="#8A8A8A" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>${properties.address}</span>
                </li>
                <li>
                  ${linkstr}
                </li>
                <li>
                  ${mailsStr}
                </li>
              </ul>
              <a href="${properties.href}" target="_blank" class="item-learnings__link">
                <span>Страница центра</span>
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.96826 6.71191C7.96826 6.89502 7.89502 7.05615 7.75586 7.19531L1.95508 12.8716C1.82324 13.0034 1.66211 13.0693 1.47168 13.0693C1.09814 13.0693 0.805176 12.7837 0.805176 12.4028C0.805176 12.2124 0.878418 12.0513 0.995605 11.9268L6.32764 6.71191L0.995605 1.49707C0.878418 1.37256 0.805176 1.2041 0.805176 1.021C0.805176 0.640137 1.09814 0.354492 1.47168 0.354492C1.66211 0.354492 1.82324 0.42041 1.95508 0.544922L7.75586 6.22852C7.89502 6.36035 7.96826 6.52881 7.96826 6.71191Z" fill="#2CA5F5"/>
                </svg>
              </a>
            </div>
          \n`;
        }
      });
      this.els.listBody.innerHTML = str;
      this.listCustomScrollInit();
    }
  }

  listCustomScrollInit() {
		this.customScroll = new SimpleBar(this.els.listBody, {
			autoHide: true
		});
  }
}