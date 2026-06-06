
(function(){
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if(menu && nav){
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', open ? 'true':'false');
    });
  }
  const filters = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-tags]');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    cards.forEach(card => {
      const tags = card.dataset.tags.split(' ');
      card.style.display = (filter === 'all' || tags.includes(filter)) ? '' : 'none';
    });
  }));
})();
