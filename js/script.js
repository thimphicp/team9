document.addEventListener('DOMContentLoaded', () => {

  const sections =
    document.querySelectorAll('.content-section');

  function toggleSection(section) {

    section.classList.toggle('active');
  }

  sections.forEach(section => {

    const header =
      section.querySelector('.section-header');

    header.addEventListener('click', () => {

      toggleSection(section);
    });
  });

  const triggers =
    document.querySelectorAll(
      '.toc-link, .button-area button'
    );

  triggers.forEach(trigger => {

    trigger.addEventListener('click', (e) => {

      e.preventDefault();

      const targetId =
        trigger.getAttribute('href')?.substring(1)
        ||
        trigger.getAttribute('data-target');

      const targetSection =
        document.getElementById(targetId);

      if (targetSection) {

        if (!targetSection.classList.contains('active')) {

          targetSection.classList.add('active');
        }

        setTimeout(() => {

          const offset = 80;

          const bodyRect =
            document.body.getBoundingClientRect().top;

          const elementRect =
            targetSection.getBoundingClientRect().top;

          window.scrollTo({

            top:
              (elementRect - bodyRect) - offset,

            behavior: 'smooth'
          });

        }, 100);
      }
    });
  });
});