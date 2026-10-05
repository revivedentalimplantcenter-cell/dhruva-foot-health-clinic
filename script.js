// Mobile navigation toggle
(function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
  });

  // Close the menu when a link is tapped
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
    });
  });
})();
