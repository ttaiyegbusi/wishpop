const form = document.getElementById('waitlistForm');
const email = document.getElementById('email');

document.getElementById('navCta').addEventListener('click', () => {
  email.scrollIntoView({ behavior: 'smooth', block: 'center' });
  email.focus({ preventScroll: true });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = email.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  if (!valid) {
    email.classList.remove('shake');
    void email.offsetWidth; /* restart animation */
    email.classList.add('shake');
    email.focus();
    return;
  }

  form.innerHTML = '<p class="success">You’re on the list \u{1F389}</p>';
});
