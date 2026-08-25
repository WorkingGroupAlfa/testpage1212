(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion && reduceMotion.matches) return;

  function onReady(callback) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback, { once: true });
    else callback();
  }

  function createElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (typeof text === 'string') element.textContent = text;
    return element;
  }

  function normalizeAngle(value) {
    return Math.atan2(Math.sin(value), Math.cos(value));
  }

  onReady(function () {
    var sourceHeading = document.getElementById('rec854658914');
    var sourcePortfolio = document.getElementById('rec2234630163');
    if (!sourceHeading || !sourcePortfolio || document.getElementById('portfolioVortex')) return;

    var projects = Array.prototype.map.call(
      sourcePortfolio.querySelectorAll('.t-card__col'),
      function (card, index) {
        var link = card.querySelector('.t-card__link');
        var image = card.querySelector('[data-original]');
        var description = card.querySelector('.t-card__descr');
        if (!link || !image) return null;
        return {
          index: index,
          title: link.textContent.replace(/\s+/g, ' ').trim(),
          description: description ? description.textContent.replace(/\s+/g, ' ').trim() : '',
          href: link.getAttribute('href') || '#',
          image: image.getAttribute('data-original') || '',
          placeholder: image.style.backgroundImage || ''
        };
      }
    ).filter(Boolean);

    if (projects.length < 6) return;

    var section = createElement('section', 'portfolio-vortex');
    section.id = 'portfolioVortex';
    section.setAttribute('aria-labelledby', 'portfolioVortexTitle');

    var header = createElement('header', 'portfolio-vortex__header');
    var title = createElement('h2', 'portfolio-vortex__title', 'Our Portfolio');
    title.id = 'portfolioVortexTitle';
    var intro = createElement('p', 'portfolio-vortex__intro', 'Explore a selection of architectural visualisations created for developers, architects and design-led brands.');
    header.appendChild(title);
    header.appendChild(intro);

    var stage = createElement('div', 'portfolio-vortex__stage');
    stage.setAttribute('aria-label', 'Interactive project gallery. Drag horizontally to rotate.');
    var stageMeta = createElement('div', 'portfolio-vortex__stage-meta');
    stageMeta.setAttribute('aria-hidden', 'true');
    stageMeta.appendChild(createElement('span', '', String(projects.length).padStart(2, '0') + ' SELECTED PROJECTS'));
    stageMeta.appendChild(createElement('span', '', 'DRAG TO EXPLORE'));
    var traces = createElement('div', 'portfolio-vortex__traces');
    traces.setAttribute('aria-hidden', 'true');
    var orbit = createElement('div', 'portfolio-vortex__orbit');
    orbit.setAttribute('role', 'list');
    stage.appendChild(stageMeta);
    stage.appendChild(traces);
    stage.appendChild(orbit);

    var readout = createElement('div', 'portfolio-vortex__readout');
    var count = createElement('div', 'portfolio-vortex__count');
    var countLabel = createElement('span', 'portfolio-vortex__count-label', 'Project:');
    var countValue = createElement('span', 'portfolio-vortex__count-value');
    count.appendChild(countLabel);
    count.appendChild(countValue);
    var activeCopy = createElement('div', 'portfolio-vortex__active');
    var activeName = createElement('span', 'portfolio-vortex__active-name');
    var activeDescription = createElement('span', 'portfolio-vortex__active-description');
    activeCopy.appendChild(activeName);
    activeCopy.appendChild(activeDescription);

    var readoutLink = createElement('a', 'portfolio-vortex__readout-link');
    readoutLink.appendChild(document.createTextNode('View project'));
    readoutLink.appendChild(createElement('span', '', '↗'));

    var controls = createElement('div', 'portfolio-vortex__controls');
    var previous = createElement('button', 'portfolio-vortex__control portfolio-vortex__control--previous', '←');
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Previous project');
    var next = createElement('button', 'portfolio-vortex__control portfolio-vortex__control--next');
    next.type = 'button';
    next.setAttribute('aria-label', 'Next project');
    next.appendChild(createElement('span', '', 'Next'));
    next.appendChild(createElement('span', 'portfolio-vortex__control-arrow', '→'));
    controls.appendChild(previous);
    controls.appendChild(next);

    readout.appendChild(count);
    readout.appendChild(activeCopy);
    readout.appendChild(readoutLink);
    readout.appendChild(controls);
    section.appendChild(header);
    section.appendChild(stage);
    section.appendChild(readout);

    var ringCounts = projects.length === 24 ? [4, 5, 6, 5, 4] : [
      Math.max(2, Math.floor(projects.length * 0.16)),
      Math.max(2, Math.floor(projects.length * 0.21)),
      Math.max(2, Math.floor(projects.length * 0.26)),
      Math.max(2, Math.floor(projects.length * 0.21))
    ];
    if (projects.length !== 24) {
      ringCounts.push(projects.length - ringCounts.reduce(function (sum, value) { return sum + value; }, 0));
    }

    var slots = [];
    var projectIndex = 0;
    ringCounts.forEach(function (ringCount, ringIndex) {
      for (var itemIndex = 0; itemIndex < ringCount && projectIndex < projects.length; itemIndex += 1) {
        var project = projects[projectIndex];
        var slot = createElement('div', 'portfolio-vortex__slot');
        slot.setAttribute('role', 'listitem');
        var card = createElement('a', 'portfolio-vortex__card');
        card.href = project.href;
        card.tabIndex = -1;
        if (project.placeholder) card.style.backgroundImage = project.placeholder;
        card.setAttribute('aria-label', project.title + (project.description ? ', ' + project.description : '') + '. View project.');

        var image = createElement('img', 'portfolio-vortex__image');
        image.src = project.image;
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        card.appendChild(image);
        card.appendChild(createElement('span', 'portfolio-vortex__number', String(project.index + 1).padStart(2, '0')));

        var cardCopy = createElement('span', 'portfolio-vortex__card-copy');
        cardCopy.appendChild(createElement('span', 'portfolio-vortex__card-title', project.title));
        if (project.description) cardCopy.appendChild(createElement('span', 'portfolio-vortex__card-description', project.description));
        card.appendChild(cardCopy);
        slot.appendChild(card);
        orbit.appendChild(slot);

        slots.push({
          project: project,
          ringIndex: ringIndex,
          itemIndex: itemIndex,
          count: ringCount,
          baseAngle: (itemIndex / ringCount) * Math.PI * 2 + ringIndex * 0.31,
          direction: ringIndex % 2 === 0 ? 1 : -1,
          slot: slot,
          card: card,
          depth: 0
        });
        projectIndex += 1;
      }
    });

    sourceHeading.parentNode.insertBefore(section, sourceHeading);

    var geometry = [];
    var angle = 0;
    var autoSpeed = 0.00011;
    var velocity = autoSpeed;
    var targetAngle = null;
    var activeIndex = -1;
    var manualIndex = -1;
    var manualUntil = 0;
    var hoveredIndex = -1;
    var dragging = false;
    var pointerId = null;
    var pointerStartX = 0;
    var pointerStartY = 0;
    var lastPointerX = 0;
    var lastPointerTime = 0;
    var gestureMode = null;
    var didDrag = false;
    var isVisible = true;
    var animationFrame = 0;
    var lastFrameTime = 0;
    var abortController = new AbortController();
    var signal = abortController.signal;

    function calculateGeometry() {
      var mobile = stage.clientWidth <= 760;
      var width = Math.max(stage.clientWidth, 320);
      var height = Math.max(stage.clientHeight, 560);
      if (mobile) {
        var mobileRadius = Math.min(250, Math.max(176, width * 0.62));
        var spread = Math.min(230, Math.max(188, height * 0.33));
        geometry = [
          { radius: mobileRadius * 0.52, y: -spread, scale: 0.46, ellipse: 0.18 },
          { radius: mobileRadius * 0.76, y: -spread * 0.52, scale: 0.63, ellipse: 0.2 },
          { radius: mobileRadius, y: 0, scale: 0.9, ellipse: 0.23, focus: true },
          { radius: mobileRadius * 0.8, y: spread * 0.53, scale: 0.65, ellipse: 0.25 },
          { radius: mobileRadius * 0.56, y: spread, scale: 0.48, ellipse: 0.27 }
        ];
      } else {
        var ratio = Math.min(1, width / 1240);
        geometry = [
          { radius: 180 * ratio, y: -255, scale: 0.56, ellipse: 0.17 },
          { radius: 300 * ratio, y: -138, scale: 0.74, ellipse: 0.2 },
          { radius: 430 * ratio, y: 0, scale: 0.98, ellipse: 0.22, focus: true },
          { radius: 340 * ratio, y: 150, scale: 0.78, ellipse: 0.24 },
          { radius: 220 * ratio, y: 265, scale: 0.58, ellipse: 0.26 }
        ];
      }

      traces.replaceChildren();
      geometry.forEach(function (ring) {
        var trace = createElement('span', 'portfolio-vortex__trace' + (ring.focus ? ' is-focus' : ''));
        trace.style.width = ring.radius * 2 + 'px';
        trace.style.height = ring.radius * 2 * ring.ellipse + 'px';
        trace.style.top = 'calc(50% + ' + ring.y + 'px)';
        traces.appendChild(trace);
      });
      render(performance.now());
    }

    function updateReadout(index) {
      if (index < 0 || index >= slots.length || index === activeIndex) return;
      activeIndex = index;
      var active = slots[index].project;
      countValue.textContent = String(active.index + 1) + ' / ' + String(projects.length);
      readout.style.setProperty('--pv-progress', ((active.index + 1) / projects.length * 100).toFixed(2) + '%');
      activeName.textContent = active.title;
      activeDescription.textContent = active.description || 'Architectural visualisation';
      readoutLink.href = active.href;
      readoutLink.setAttribute('aria-label', 'View project ' + active.title);
      slots.forEach(function (slot, slotIndex) {
        var selected = slotIndex === activeIndex;
        slot.card.classList.toggle('is-active', selected);
        slot.card.tabIndex = selected ? 0 : -1;
        slot.card.setAttribute('aria-current', selected ? 'true' : 'false');
      });
    }

    function render(now) {
      if (!geometry.length) return;
      var automaticFocus = -1;
      var best = Infinity;

      slots.forEach(function (slot, index) {
        var ring = geometry[slot.ringIndex];
        if (!ring) return;
        var currentAngle = slot.direction * (slot.baseAngle + angle);
        var x = Math.sin(currentAngle) * ring.radius;
        var z = Math.cos(currentAngle) * ring.radius;
        var yOffset = z * ring.ellipse;
        var depth = (z + ring.radius) / (2 * ring.radius);
        var scale = ring.scale * (0.54 + depth * 0.54);
        var opacity = 0.16 + depth * 0.84;
        var blur = (1 - depth) * 2.2;
        slot.depth = depth;
        slot.slot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + (ring.y - yOffset).toFixed(1) + 'px,0) scale(' + scale.toFixed(3) + ')';
        slot.slot.style.opacity = opacity.toFixed(3);
        slot.slot.style.filter = blur > 0.14 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
        slot.slot.style.zIndex = String(1000 + Math.round(depth * 1000) - slot.ringIndex);
        slot.card.style.pointerEvents = depth > 0.34 ? 'auto' : 'none';

        if (ring.focus) {
          var distance = Math.abs(normalizeAngle(currentAngle));
          if (distance < best) {
            best = distance;
            automaticFocus = index;
          }
        }
      });

      var requestedIndex = hoveredIndex >= 0 ? hoveredIndex : (now < manualUntil && manualIndex >= 0 ? manualIndex : automaticFocus);
      updateReadout(requestedIndex);
    }

    function frame(timestamp) {
      animationFrame = 0;
      if (!isVisible || document.hidden) return;
      var deltaTime = lastFrameTime ? Math.min(timestamp - lastFrameTime, 40) : 16;
      lastFrameTime = timestamp;

      if (!dragging && hoveredIndex < 0) {
        if (targetAngle !== null) {
          var difference = targetAngle - angle;
          angle += difference * (1 - Math.exp(-deltaTime * 0.012));
          if (Math.abs(difference) < 0.001) {
            angle = targetAngle;
            targetAngle = null;
            velocity = autoSpeed;
          }
        } else {
          angle += velocity * deltaTime;
          velocity += (autoSpeed - velocity) * Math.min(1, deltaTime * 0.0025);
        }
      }

      render(timestamp);
      animationFrame = window.requestAnimationFrame(frame);
    }

    function startAnimation() {
      if (animationFrame || !isVisible || document.hidden) return;
      lastFrameTime = 0;
      animationFrame = window.requestAnimationFrame(frame);
    }

    function stopAnimation() {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastFrameTime = 0;
    }

    function selectProject(index) {
      var nextIndex = (index + slots.length) % slots.length;
      var slot = slots[nextIndex];
      var desired = -slot.baseAngle;
      targetAngle = angle + normalizeAngle(desired - angle);
      manualIndex = nextIndex;
      manualUntil = performance.now() + 3200;
      updateReadout(nextIndex);
      startAnimation();
    }

    slots.forEach(function (slot, index) {
      slot.card.addEventListener('pointerenter', function (event) {
        if (event.pointerType === 'touch') return;
        hoveredIndex = index;
        updateReadout(index);
      }, { signal: signal });
      slot.card.addEventListener('pointerleave', function (event) {
        if (event.pointerType === 'touch') return;
        hoveredIndex = -1;
        manualIndex = index;
        manualUntil = performance.now() + 900;
      }, { signal: signal });
      slot.card.addEventListener('focus', function () {
        selectProject(index);
      }, { signal: signal });
    });

    stage.addEventListener('pointerdown', function (event) {
      if (event.button !== undefined && event.button !== 0) return;
      pointerId = event.pointerId;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      lastPointerX = event.clientX;
      lastPointerTime = performance.now();
      gestureMode = event.pointerType === 'mouse' ? 'pending-mouse' : null;
      didDrag = false;
      targetAngle = null;
    }, { signal: signal });

    stage.addEventListener('pointermove', function (event) {
      if (event.pointerId !== pointerId) return;
      var totalX = event.clientX - pointerStartX;
      var totalY = event.clientY - pointerStartY;

      if (!gestureMode && (Math.abs(totalX) > 10 || Math.abs(totalY) > 10)) {
        gestureMode = Math.abs(totalX) > Math.abs(totalY) * 1.2 ? 'horizontal' : 'vertical';
      }
      if (gestureMode === 'pending-mouse' && (Math.abs(totalX) > 4 || Math.abs(totalY) > 4)) gestureMode = 'horizontal';
      if (gestureMode !== 'horizontal') return;

      if (!dragging) {
        dragging = true;
        didDrag = true;
        stage.classList.add('is-dragging');
        try { stage.setPointerCapture(pointerId); } catch (error) { /* Pointer capture is optional. */ }
      }

      if (event.cancelable) event.preventDefault();
      var now = performance.now();
      var pointerDelta = event.clientX - lastPointerX;
      var timeDelta = Math.max(now - lastPointerTime, 1);
      var angularDelta = pointerDelta * 0.0045;
      angle += angularDelta;
      velocity = angularDelta / timeDelta;
      lastPointerX = event.clientX;
      lastPointerTime = now;
      manualUntil = 0;
      hoveredIndex = -1;
      render(now);
    }, { signal: signal });

    function finishPointer(event) {
      if (event.pointerId !== pointerId) return;
      if (dragging) {
        velocity = Math.max(-0.004, Math.min(0.004, velocity));
        dragging = false;
        stage.classList.remove('is-dragging');
      }
      pointerId = null;
      gestureMode = null;
      window.setTimeout(function () { didDrag = false; }, 0);
      startAnimation();
    }

    stage.addEventListener('pointerup', finishPointer, { signal: signal });
    stage.addEventListener('pointercancel', finishPointer, { signal: signal });
    stage.addEventListener('click', function (event) {
      if (didDrag && event.target.closest('.portfolio-vortex__card')) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, { capture: true, signal: signal });

    previous.addEventListener('click', function () { selectProject(activeIndex - 1); }, { signal: signal });
    next.addEventListener('click', function () { selectProject(activeIndex + 1); }, { signal: signal });
    section.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        selectProject(activeIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        selectProject(activeIndex + 1);
      }
    }, { signal: signal });

    var resizeObserver = window.ResizeObserver ? new ResizeObserver(calculateGeometry) : null;
    if (resizeObserver) resizeObserver.observe(stage);
    else window.addEventListener('resize', calculateGeometry, { signal: signal });

    var intersectionObserver = window.IntersectionObserver ? new IntersectionObserver(function (entries) {
      isVisible = entries[0] ? entries[0].isIntersecting : true;
      if (isVisible) startAnimation();
      else stopAnimation();
    }, { rootMargin: '200px 0px', threshold: 0.01 }) : null;
    if (intersectionObserver) intersectionObserver.observe(section);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAnimation();
      else startAnimation();
    }, { signal: signal });

    window.addEventListener('pagehide', function (event) {
      if (event.persisted) return;
      stopAnimation();
      abortController.abort();
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
    }, { once: true });

    calculateGeometry();
    document.documentElement.classList.add('portfolio-vortex-ready');
    startAnimation();
  });
})();
