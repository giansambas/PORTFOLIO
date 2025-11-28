const toggleButton = document.getElementById('theme-toggle');
const body = document.body;
toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark');
});
