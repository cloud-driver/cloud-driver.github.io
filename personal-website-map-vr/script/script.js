
document.querySelectorAll('.house').forEach(house => {
  house.addEventListener('click', () => {
    const target = house.getAttribute('data-link');
    if (target) {
      window.location.href = target;
    }
  });
});
