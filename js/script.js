const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const sidebar = $('#sidebar');
const menuToggle = $('#menuToggle');
const themeToggle = $('#themeToggle');
const searchInput = $('#wikiSearch');
const progressBar = $('#readProgress');
const toTop = $('#toTop');
const sections = $$('.wiki-section');
const navLinks = $$('.nav-link');
const emptyState = $('#emptyState');

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('tetris-wiki-theme', theme);
}

function getSectionText(section) {
  return `${section.dataset.title || ''} ${section.dataset.tags || ''} ${section.innerText || ''}`.toLowerCase();
}

function clearMarks(root) {
  $$('mark', root).forEach(mark => mark.replaceWith(document.createTextNode(mark.textContent)));
}

function highlightText(section, keyword) {
  if (!keyword) return;
  const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'MARK'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return node.nodeValue.toLowerCase().includes(keyword.toLowerCase()) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    const value = node.nodeValue;
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    const fragment = document.createElement('span');
    fragment.innerHTML = value.replace(regex, '<mark>$1</mark>');
    node.replaceWith(fragment);
  });
}

function filterSections() {
  const keyword = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  sections.forEach(section => {
    clearMarks(section);
    const visible = !keyword || getSectionText(section).includes(keyword);
    section.hidden = !visible;
    if (visible) {
      visibleCount += 1;
      highlightText(section, keyword);
    }
  });

  emptyState.hidden = visibleCount !== 0;
}

function updateActiveNav() {
  const visibleSections = sections.filter(section => !section.hidden);
  const current = visibleSections
    .map(section => ({ id: section.id, top: section.getBoundingClientRect().top }))
    .filter(item => item.top < 160)
    .sort((a, b) => b.top - a.top)[0];

  if (!current) return;
  navLinks.forEach(link => link.classList.toggle('active', link.dataset.section === current.id));
}

function updateProgress() {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const percent = height <= 0 ? 0 : Math.min(100, (scrollTop / height) * 100);
  progressBar.style.width = `${percent}%`;
  toTop.classList.toggle('visible', scrollTop > 500);
}

menuToggle?.addEventListener('click', () => sidebar.classList.toggle('open'));

navLinks.forEach(link => {
  link.addEventListener('click', () => sidebar.classList.remove('open'));
});

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(current);
});

searchInput.addEventListener('input', filterSections);

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

window.addEventListener('scroll', () => {
  updateActiveNav();
  updateProgress();
}, { passive: true });

const savedTheme = localStorage.getItem('tetris-wiki-theme');
if (savedTheme) setTheme(savedTheme);
updateProgress();
updateActiveNav();
