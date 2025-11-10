// MarineTrack Design System - Component Interactions

// Bottom Sheet
function showBottomSheet() {
  const sheet = document.getElementById('bottomSheet');
  sheet.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideBottomSheet() {
  const sheet = document.getElementById('bottomSheet');
  sheet.classList.remove('active');
  document.body.style.overflow = '';
}

// Toast Notifications
function showToast(type) {
  const messages = {
    success: 'Vessel tracked successfully',
    warning: 'Connection unstable - retrying...',
    error: 'Failed to update route',
    info: 'Task assigned to Ocean Explorer'
  };
  
  const icons = {
    success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l5 5L18 5"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2l8 14H2L10 2z"/><path d="M10 8v4"/><circle cx="10" cy="15" r="0.5"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M6 6l8 8M14 6l-8 8"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M10 10v4"/><circle cx="10" cy="6" r="0.5"/></svg>'
  };
  
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div>${messages[type]}</div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => {
      container.removeChild(toast);
    }, 180);
  }, 3000);
}

// Chip Toggle
document.addEventListener('DOMContentLoaded', () => {
  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
  
  const segments = document.querySelectorAll('.segment');
  segments.forEach(segment => {
    segment.addEventListener('click', () => {
      segments.forEach(s => s.classList.remove('active'));
      segment.classList.add('active');
    });
  });
  
  const pillToggles = document.querySelectorAll('.pill-toggle');
  pillToggles.forEach(pill => {
    pill.addEventListener('click', () => {
      pillToggles.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });
});
