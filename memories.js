/* ============================================================
   CHERISHED MEMORIES — Interactive Polaroid Scrapbook
   Brings the 17 photos from /birthday-person to life with
   vintage polaroid styling, smooth navigation, captions,
   and floating scene keepsakes.
   ============================================================ */

import { sound } from './audio.js';

export const MEMORIES = [
  {
    id: 1,
    src: '/birthday-person/Snapchat-949252343.jpg',
    title: 'Brightest Smile',
    caption: 'That unforgettable, contagious smile that lights up every room ✨',
    tag: 'Favorite Moments'
  },
  {
    id: 2,
    src: '/birthday-person/IMG-20221001-WA0000.jpg',
    title: 'Grace & Elegance',
    caption: 'Dressed up and glowing — celebrating another wonderful chapter 🌸',
    tag: 'Celebration'
  },
  {
    id: 3,
    src: '/birthday-person/IMG-20221001-WA0001.jpg',
    title: 'Pure Laughter',
    caption: 'The moments where we could not stop laughing until our stomachs hurt 💫',
    tag: 'Good Times'
  },
  {
    id: 4,
    src: '/birthday-person/IMG-20221001-WA0002.jpg',
    title: 'Golden Days',
    caption: 'Memories together that turn everyday moments into gold 💛',
    tag: 'Memories'
  },
  {
    id: 5,
    src: '/birthday-person/IMG-20221001-WA0003.jpg',
    title: 'Sweet Candid',
    caption: 'Caught in the moment — natural, effortless, and radiant 📸',
    tag: 'Candid'
  },
  {
    id: 6,
    src: '/birthday-person/IMG-20221001-WA0004.jpg',
    title: 'Radiant Energy',
    caption: 'Bringing sunshine and positivity everywhere you go ☀️',
    tag: 'Joy'
  },
  {
    id: 7,
    src: '/birthday-person/IMG-20221001-WA0005.jpg',
    title: 'Cherished Friend',
    caption: 'Forever thankful for a friendship as genuine and special as ours 🥂',
    tag: 'Friendship'
  },
  {
    id: 8,
    src: '/birthday-person/IMG-20221001-WA0006.jpg',
    title: 'Golden Hour Smile',
    caption: 'Warm memories that we will look back on for years to come 🌅',
    tag: 'Golden Hour'
  },
  {
    id: 9,
    src: '/birthday-person/IMG-20221001-WA0007.jpg',
    title: 'Precious Keepsake',
    caption: 'A snapshot of happiness frozen in time 💖',
    tag: 'Keepsake'
  },
  {
    id: 10,
    src: '/birthday-person/IMG-20221001-WA0008.jpg',
    title: 'Warm & Kind',
    caption: 'Always thoughtful, always caring, and such a wonderful soul 🌷',
    tag: 'Sweet Moments'
  },
  {
    id: 11,
    src: '/birthday-person/IMG-20221001-WA0009.jpg',
    title: 'Happy Days',
    caption: 'Wishing you 365 more days filled with this same happiness ✨',
    tag: 'Wishes'
  },
  {
    id: 12,
    src: '/birthday-person/IMG-20221001-WA0010.jpg',
    title: 'Birthday Star',
    caption: 'Celebrating the incredible, one-of-a-kind person you are 🎉',
    tag: 'Cheers'
  },
  {
    id: 13,
    src: '/birthday-person/IMG-20210930-WA0032.jpg',
    title: 'Looking Back',
    caption: 'Time flies, but the greatest friendships only get stronger 🍃',
    tag: 'Nostalgia'
  },
  {
    id: 14,
    src: '/birthday-person/IMG-20210930-WA0035.jpg',
    title: 'Endless Sunshine',
    caption: 'Keep shining your light wherever life takes you 🌼',
    tag: 'Sunshine'
  },
  {
    id: 15,
    src: '/birthday-person/IMG-20210930-WA0036.jpg',
    title: 'Storybook Chapter',
    caption: 'Another unforgettable chapter in the story of life 📖',
    tag: 'Adventures'
  },
  {
    id: 16,
    src: '/birthday-person/IMG_8907.JPG',
    title: 'Sparkle & Joy',
    caption: 'That sparkle in your eyes that never dims 💫',
    tag: 'Sparkle'
  },
  {
    id: 17,
    src: '/birthday-person/20230321_201614.jpg',
    title: 'To Bright Horizons',
    caption: 'Here is to new dreams, bigger adventures, and endless joy! 🚀✨',
    tag: 'Future'
  },
];

let currentIndex = 0;
let isPlayingSlideshow = false;
let slideshowTimer = null;

export function initMemories() {
  const modal = document.getElementById('memoriesModal');
  const openBtn = document.getElementById('memoriesBtn');
  const letterMemoriesBtn = document.getElementById('letterMemoriesBtn');
  const closeBtn = document.getElementById('memoriesCloseBtn');
  const backdrop = document.getElementById('memoriesBackdrop');
  const prevBtn = document.getElementById('memPrevBtn');
  const nextBtn = document.getElementById('memNextBtn');
  const playBtn = document.getElementById('memPlayBtn');
  const filmstrip = document.getElementById('memoriesFilmstrip');

  if (openBtn) {
    openBtn.addEventListener('click', () => openMemoriesModal(0));
  }

  if (letterMemoriesBtn) {
    letterMemoriesBtn.addEventListener('click', () => {
      // Close letter modal and open memories
      const letterModal = document.getElementById('letterModal');
      if (letterModal) {
        letterModal.classList.remove('is-open');
        letterModal.setAttribute('aria-hidden', 'true');
      }
      openMemoriesModal(0);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMemoriesModal);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMemoriesModal);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => navigateMemory(-1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => navigateMemory(1));
  }

  if (playBtn) {
    playBtn.addEventListener('click', toggleSlideshow);
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeMemoriesModal();
    if (e.key === 'ArrowLeft') navigateMemory(-1);
    if (e.key === 'ArrowRight') navigateMemory(1);
    if (e.key === ' ') {
      e.preventDefault();
      toggleSlideshow();
    }
  });

  // Touch Swipe for mobile devices
  let touchStartX = 0;
  let touchEndX = 0;
  if (modal) {
    modal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        navigateMemory(1); // Swipe left -> Next
      } else if (touchEndX - touchStartX > 50) {
        navigateMemory(-1); // Swipe right -> Prev
      }
    }, { passive: true });
  }

  // Build the bottom filmstrip thumbnails
  buildFilmstrip();
}

function buildFilmstrip() {
  const filmstrip = document.getElementById('memoriesFilmstrip');
  if (!filmstrip) return;
  filmstrip.innerHTML = '';

  MEMORIES.forEach((m, idx) => {
    const thumb = document.createElement('button');
    thumb.className = `filmThumb ${idx === 0 ? 'is-active' : ''}`;
    thumb.type = 'button';
    thumb.setAttribute('aria-label', `View photo ${idx + 1}: ${m.title}`);
    thumb.innerHTML = `
      <img src="${m.src}" alt="${m.title}" loading="lazy" />
      <span class="filmThumb__num">${idx + 1}</span>
    `;
    thumb.addEventListener('click', () => {
      goToMemory(idx);
    });
    filmstrip.appendChild(thumb);
  });
}

export function openMemoriesModal(index = 0) {
  const modal = document.getElementById('memoriesModal');
  if (!modal) return;

  goToMemory(index, false);

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  sound.playAlbumOpen();
  
  // Automatically start the slideshow when opened
  startSlideshow();
}

export function closeMemoriesModal() {
  const modal = document.getElementById('memoriesModal');
  if (!modal) return;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  stopSlideshow();
}

export function goToMemory(index, playSfx = true) {
  if (index < 0) index = MEMORIES.length - 1;
  if (index >= MEMORIES.length) index = 0;
  currentIndex = index;

  const item = MEMORIES[currentIndex];

  const photoImg = document.getElementById('polaroidImg');
  const titleEl = document.getElementById('polaroidTitle');
  const captionEl = document.getElementById('polaroidCaption');
  const countEl = document.getElementById('polaroidCount');
  const tagEl = document.getElementById('polaroidTag');
  const polaroidCard = document.getElementById('polaroidCard');

  if (polaroidCard) {
    polaroidCard.classList.remove('is-flipping');
    void polaroidCard.offsetWidth; // force reflow
    polaroidCard.classList.add('is-flipping');
  }

  if (photoImg) {
    photoImg.src = item.src;
    photoImg.alt = item.title;
  }
  if (titleEl) titleEl.textContent = item.title;
  if (captionEl) captionEl.textContent = item.caption;
  if (countEl) countEl.textContent = `${currentIndex + 1} / ${MEMORIES.length}`;
  if (tagEl) tagEl.textContent = item.tag;

  // Update filmstrip highlight & scroll into view
  const filmstrip = document.getElementById('memoriesFilmstrip');
  if (filmstrip) {
    const thumbs = filmstrip.querySelectorAll('.filmThumb');
    thumbs.forEach((t, i) => {
      if (i === currentIndex) {
        t.classList.add('is-active');
        t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        t.classList.remove('is-active');
      }
    });
  }

  if (playSfx) {
    sound.playPhotoFlip();
  }

  // Refresh auto-advance timer on manual interaction
  if (isPlayingSlideshow && slideshowTimer) {
    clearInterval(slideshowTimer);
    slideshowTimer = setInterval(() => {
      navigateMemory(1);
    }, 3800);
  }
}

export function navigateMemory(delta) {
  goToMemory(currentIndex + delta);
}

function toggleSlideshow() {
  if (isPlayingSlideshow) {
    stopSlideshow();
  } else {
    startSlideshow();
  }
}

function startSlideshow() {
  isPlayingSlideshow = true;
  const playBtn = document.getElementById('memPlayBtn');
  if (playBtn) {
    playBtn.innerHTML = `<span>⏸</span><span>Pause</span>`;
    playBtn.classList.add('is-playing');
  }
  if (slideshowTimer) clearInterval(slideshowTimer);
  slideshowTimer = setInterval(() => {
    navigateMemory(1);
  }, 3800);
}

function stopSlideshow() {
  isPlayingSlideshow = false;
  const playBtn = document.getElementById('memPlayBtn');
  if (playBtn) {
    playBtn.innerHTML = `<span>▶</span><span>Slideshow</span>`;
    playBtn.classList.remove('is-playing');
  }
  if (slideshowTimer) {
    clearInterval(slideshowTimer);
    slideshowTimer = null;
  }
}

/* ============================================================
   Floating Keepsake Polaroids in Act 4 (The Blooming Tree)
   Delicately floats polaroids that automatically rotate photos!
   ============================================================ */
let floatingCycleTimer = null;
let currentKeepsakeIndices = [0, 1, 2, 3, 4, 5, 7];

export function showFloatingPolaroids() {
  const container = document.getElementById('floatingPolaroids');
  if (!container) return;

  container.innerHTML = '';
  container.classList.add('is-visible');

  if (floatingCycleTimer) {
    clearInterval(floatingCycleTimer);
    floatingCycleTimer = null;
  }

  const slots = [
    // Right side keepsakes
    { classSuffix: 'r1', style: 'top: 9%; right: 4%; --rot: 5.5deg; animation-delay: 0s;' },
    { classSuffix: 'r2', style: 'top: 22%; right: 13.5%; --rot: -4.2deg; animation-delay: -1.8s;' },
    { classSuffix: 'r3', style: 'top: 39%; right: 3%; --rot: -6deg; animation-delay: -3.5s;' },
    { classSuffix: 'r4', style: 'top: 51%; right: 14%; --rot: 4.5deg; animation-delay: -2.2s;' },
    { classSuffix: 'r5', style: 'top: 72%; right: 6%; --rot: -3.2deg; animation-delay: -4.5s;' },
    // Left side keepsakes
    { classSuffix: 'l1', style: 'top: 11%; left: 5%; --rot: -5.2deg; animation-delay: -1.2s;' },
    { classSuffix: 'l2', style: 'top: 25%; left: 6.5%; --rot: 4.8deg; animation-delay: -3.8s;' },
    { classSuffix: 'l3', style: 'top: 41%; left: 4%; --rot: -4deg; animation-delay: -2.5s;' },
  ];

  slots.forEach((slot, slotIdx) => {
    const memoryIdx = currentKeepsakeIndices[slotIdx] % MEMORIES.length;
    const item = MEMORIES[memoryIdx];

    const card = document.createElement('div');
    card.className = `floatingPolaroid floatingPolaroid--${slot.classSuffix}`;
    card.id = `fpCard_${slot.classSuffix}`;
    card.style = slot.style;
    card.title = `Click to view: ${item.title}`;
    card.innerHTML = `
      <div class="floatingPolaroid__pin">📌</div>
      <div class="floatingPolaroid__frame">
        <img class="floatingPolaroid__img" src="${item.src}" alt="${item.title}" />
        <span class="floatingPolaroid__label">${item.title}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      openMemoriesModal(currentKeepsakeIndices[slotIdx]);
    });

    container.appendChild(card);
  });

  // Dynamic Keepsakes Auto-Slideshow: smooth crossfade 1 visible polaroid every 3.8s
  let nextCycleSlot = 0;
  let nextMemoryPoolIdx = 8; // start with next unseen photos

  floatingCycleTimer = setInterval(() => {
    // Find next visible card to cycle so hidden slots on mobile are skipped
    let attempts = 0;
    let card = null;
    let chosenSlotIdx = 0;
    while (attempts < slots.length) {
      const idx = nextCycleSlot % slots.length;
      nextCycleSlot++;
      attempts++;
      const candidateSlot = slots[idx];
      const candidateCard = document.getElementById(`fpCard_${candidateSlot.classSuffix}`);
      if (candidateCard && candidateCard.offsetParent !== null) {
        card = candidateCard;
        chosenSlotIdx = idx;
        break;
      }
    }
    if (!card) return;

    const newMemoryIdx = nextMemoryPoolIdx % MEMORIES.length;
    currentKeepsakeIndices[chosenSlotIdx] = newMemoryIdx;
    const nextItem = MEMORIES[newMemoryIdx];

    const img = card.querySelector('.floatingPolaroid__img');
    const label = card.querySelector('.floatingPolaroid__label');

    if (img && label) {
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      card.style.opacity = '0.2';
      card.style.transform = 'scale(0.92) rotate(var(--rot, 0deg))';

      setTimeout(() => {
        img.src = nextItem.src;
        img.alt = nextItem.title;
        label.textContent = nextItem.title;
        card.title = `Click to view: ${nextItem.title}`;
        card.style.opacity = '1';
        card.style.transform = 'scale(1) rotate(var(--rot, 0deg))';
      }, 500);
    }

    nextMemoryPoolIdx++;
  }, 3800);
}

export function stopFloatingPolaroids() {
  if (floatingCycleTimer) {
    clearInterval(floatingCycleTimer);
    floatingCycleTimer = null;
  }
}
