

const form = document.querySelector('form');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const phoneInput = document.querySelector('#phone');
const messageInput = document.querySelector('#message');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !email || !message) {
    alert('Please fill in all required fields.');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('message', message);

  fetch('contact.php', {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        alert('Email sent successfully!');
        form.reset();
      } else {
        throw new Error('Failed to send email.');
      }
    })
    .catch((error) => {
      console.error(error);
      alert('Failed to send email. Please try again later.');
    });
});