"use strict";
document.addEventListener('DOMContentLoaded', () => {
  const whatsappNumber = '+2347068723401';

  // Tab Switching
  const tabs = document.querySelectorAll('#bottom-nav .nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  function switchTab(targetId) {
    tabContents.forEach((content) => {
      content.classList.toggle('active', content.id === targetId);
    });
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.target === targetId);
    });
    logAnalyticsEvent('tab-switch', targetId);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.target));
  });

  switchTab('tab-products');

  // Product Order buttons
  const productList = document.getElementById('product-list');
  productList.addEventListener('click', (e) => {
    if (e.target.classList.contains('order-btn')) {
      const product = e.target.closest('.product');
      const sku = product.dataset.sku || 'N/A';
      const name = product.querySelector('h3')?.innerText.trim() || 'Product';
      const price = product.dataset.price ? '₦' + product.dataset.price : '';
      const message = encodeURIComponent(`Hello Yoursco, I want to order:\nSKU: ${sku}\nProduct: ${name}\nPrice: ${price}\nPlease send me order details.`);
      window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
      logAnalyticsEvent('product-order', sku);
    }
  });

  // Booking form
  const bookingForm = document.getElementById('booking-form');
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const deviceType = bookingForm['device-type'].value.trim();
    const brandModel = bookingForm['brand-model'].value.trim();
    const selectedIssues = Array.from(bookingForm['issues'].options)
      .filter(o => o.selected)
      .map(o => o.value).join(', ');
    const fullName = bookingForm['full-name'].value.trim();
    const phoneWhatsApp = bookingForm['phone-whatsapp'].value.trim();
    const pickupAddress = bookingForm['pickup-address'].value.trim();
    const preferredDate = bookingForm['preferred-date'].value.trim();
    const timeWindow = bookingForm['time-window'].value.trim();

    if (!deviceType || !brandModel || !selectedIssues.length || !fullName || !phoneWhatsApp || !pickupAddress || !preferredDate) {
      alert('Please fill in all required fields marked with *.');
      return;
    }

    if (!/^\+234\d{10}$/.test(phoneWhatsApp.replace(/\s+/g, ''))) {
      alert('Phone/WhatsApp number must be in the format +234xxxxxxxxxx');
      return;
    }

    if (!pickupAddress.toLowerCase().includes('ikorodu')) {
      alert('Pickup address must be in the Ikorodu area.');
      return;
    }

    let message = `Hello Yoursco,\nI want to book a repair pickup with these details:\n`;
    message += `Device Type: ${deviceType}\n`;
    message += `Brand/Model: ${brandModel}\n`;
    message += `Issues: ${selectedIssues}\n`;
    message += `Customer Name: ${fullName}\n`;
    message += `Phone/WhatsApp: ${phoneWhatsApp}\n`;
    message += `Pickup Address: ${pickupAddress}\n`;
    message += `Preferred Date & Time: ${preferredDate}\n`;
    if (timeWindow) message += `Pickup Time Window: ${timeWindow}\n`;
    if (bookingForm['photos'].files.length) message += `Photos: [Sent separately via WhatsApp]\n`;

    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    bookingForm.reset();
    logAnalyticsEvent('booking-submission', deviceType);
  });

  // Contact form
  const contactForm = document.getElementById('contact-form');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm['contact-name'].value.trim();
    const email = contactForm['contact-email'].value.trim();
    const message = contactForm['contact-message'].value.trim();

    if (!name || !email || !message) {
      alert('Please fill all contact form fields.');
      return;
    }

    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:info@yoursco.com?subject=${subject}&body=${body}`;

    contactForm.reset();
    logAnalyticsEvent('contact-form-submit');
  });

  // Analytics
  function logAnalyticsEvent(eventType, detail = '') {
    const key = `analytics_${eventType}_${detail || 'general'}`;
    let count = parseInt(localStorage.getItem(key)) || 0;
    count++;
    localStorage.setItem(key, count);

    console.log(`Analytics Event: ${eventType} - ${detail} | Count: ${count}`);

    // To report analytics via WhatsApp manually (optional: uncomment below to enable)
    /*
    const msg = encodeURIComponent(`Yoursco Analytics Report:\nEvent: ${eventType}\nDetail: ${detail}\nCount: ${count}`);
    const waUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${msg}`;
    window.open(waUrl, '_blank');
    */
  }

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(registration => console.log('Service Worker registered:', registration.scope))
        .catch(error => console.error('Service Worker registration failed:', error));
    });
  }
});
