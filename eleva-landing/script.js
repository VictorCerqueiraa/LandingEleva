(() => {
  'use strict';

  /*
    =========================================================
    CONFIGURAÇÕES PRINCIPAIS
    =========================================================
    Troque abaixo pelo número real do WhatsApp no formato internacional.
    Exemplo para Brasil: 5521999999999
  */
  const WHATSAPP_NUMBER = '5521986962865';

  /*
    =========================================================
    MAPA DE MENSAGENS POR PLANO
    =========================================================
  */
  const whatsappMessages = {
    'básico': 'Olá, gostaria de saber sobre o plano básico.',
    'intermediário': 'Olá, gostaria de saber sobre o plano intermediário.',
    'pro': 'Olá, gostaria de saber sobre o plano pro.'
  };

  const track = document.getElementById('cardsTrack');
  const cards = Array.from(document.querySelectorAll('.plan-card'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const whatsappButtons = Array.from(document.querySelectorAll('[data-whatsapp-plan]'));

  if (!track || cards.length === 0) {
    return;
  }

  let currentIndex = 0;
  let visibleCards = getVisibleCards();
  let maxIndex = getMaxIndex();
  let autoplayInterval = null;
  let touchStartX = 0;
  let touchEndX = 0;

  function getVisibleCards() {
    if (window.innerWidth <= 860) return 1;
    if (window.innerWidth <= 1199) return 2;
    return 3;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - visibleCards);
  }

  function getCardFullWidth() {
    const firstCard = cards[0];
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    return firstCard.getBoundingClientRect().width + gap;
  }

  function updateButtonsState() {
    if (prevBtn) prevBtn.disabled = currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
  }

  function updateDots() {
    const activeDotIndex = window.innerWidth <= 860 ? currentIndex : Math.min(currentIndex + (visibleCards === 3 ? 1 : 0), dots.length - 1);

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeDotIndex);
    });
  }

  function updateActiveCards() {
    cards.forEach((card, index) => {
      card.classList.remove('is-active');

      if (window.innerWidth <= 860) {
        if (index === currentIndex) card.classList.add('is-active');
        return;
      }

      if (visibleCards === 2) {
        if (index === currentIndex || index === currentIndex + 1) {
          card.classList.add('is-active');
        }
        return;
      }

      if (index === 1) {
        card.classList.add('is-active');
      }
    });
  }

  function updateCarousel(behavior = 'smooth') {
    visibleCards = getVisibleCards();
    maxIndex = getMaxIndex();

    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    const translateX = currentIndex * getCardFullWidth();
    track.style.transitionBehavior = behavior;
    track.style.transform = `translate3d(-${translateX}px, 0, 0)`;

    updateButtonsState();
    updateDots();
    updateActiveCards();
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    updateCarousel();
  }

  function next() {
    if (currentIndex >= maxIndex) {
      currentIndex = 0;
    } else {
      currentIndex += 1;
    }
    updateCarousel();
  }

  function prev() {
    if (currentIndex <= 0) {
      currentIndex = maxIndex;
    } else {
      currentIndex -= 1;
    }
    updateCarousel();
  }

  function buildWhatsAppUrl(plan) {
    const normalizedPlan = String(plan || '').trim().toLowerCase();
    const message = whatsappMessages[normalizedPlan] || 'Olá, gostaria de saber mais sobre os planos.';
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function setWhatsAppLinks() {
    whatsappButtons.forEach((button) => {
      const plan = button.dataset.whatsappPlan;
      button.href = buildWhatsAppUrl(plan);
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
    });
  }

  function startAutoplay() {
    if (window.innerWidth <= 860) {
      stopAutoplay();
      autoplayInterval = window.setInterval(next, 5000);
      return;
    }

    stopAutoplay();
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      window.clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function handleResize() {
    updateCarousel('auto');
    startAutoplay();
  }

  function handleKeyControls(event) {
    if (event.key === 'ArrowRight') next();
    if (event.key === 'ArrowLeft') prev();
  }

  function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
  }

  function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX;
    const distance = touchStartX - touchEndX;

    if (Math.abs(distance) < 40) return;

    if (distance > 0) {
      next();
    } else {
      prev();
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      if (window.innerWidth <= 860) {
        goTo(index);
        return;
      }

      if (visibleCards === 2) {
        goTo(Math.min(index, maxIndex));
        return;
      }

      goTo(Math.max(0, Math.min(index - 1, maxIndex)));
    });
  });

  track.addEventListener('touchstart', handleTouchStart, { passive: true });
  track.addEventListener('touchend', handleTouchEnd, { passive: true });
  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);

  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeyControls);

  setWhatsAppLinks();
  updateCarousel('auto');
  startAutoplay();
})();
