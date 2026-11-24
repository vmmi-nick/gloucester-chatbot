/* Gloucester County Constituent Chatbot - embeddable popup widget loader.
   Include on any page with a single script tag:
     <script src="https://YOUR-HOST/widget.js" defer></script>
   The panel loads embed.html from the same origin this script was
   loaded from, so the same file works on any host. Shortly after page
   load a teaser card appears in the corner saying what this is and
   inviting a tap; clicking it opens the full chat panel. Dismissing
   the teaser, or closing the panel, collapses it to a bubble and is
   remembered for the rest of the browser session. */
(function () {
  'use strict';
  if (window.__gcchatWidgetLoaded) return;
  window.__gcchatWidgetLoaded = true;

  var SESSION_KEY = 'gcchat-closed';
  var TEASER_DELAY_MS = 1000;

  /* Teaser copy follows the host page's language when it declares one;
     the chat itself is bilingual either way. */
  var IS_ES = false;
  try { IS_ES = /^es/i.test(document.documentElement.getAttribute('lang') || ''); } catch (e) {}
  var TEASER_TITLE = IS_ES ? 'Pregunte al Condado de Gloucester' : 'Ask Gloucester County';
  var TEASER_TEXT = IS_ES
    ? '¿Preguntas sobre los servicios del condado? Toque para chatear con el asistente del condado.'
    : 'Questions about county services? Tap to chat with the county assistant.';

  /* Derive the embed URL from this script's own address. */
  var base = '';
  try {
    var src = (document.currentScript && document.currentScript.src) || '';
    if (!src) {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (/\/widget\.js($|\?)/.test(scripts[i].src || '')) { src = scripts[i].src; break; }
      }
    }
    if (src) base = src.replace(/\/widget\.js($|\?.*$)/, '');
  } catch (e) {}
  var EMBED_URL = base + '/embed.html';

  var CHAT_SVG = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-9 9H7V9h4v2zm6 0h-4V9h4v2z"/></svg>';

  var CSS = [
    '.gcchat-panel{position:fixed;right:20px;bottom:20px;width:380px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100vh - 40px);max-height:calc(100dvh - 40px);background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,39,77,.35),0 2px 8px rgba(0,39,77,.2);z-index:2147483000;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;opacity:0;transform:translateY(16px);pointer-events:none;transition:opacity .28s ease,transform .28s ease}',
    '.gcchat-panel.gcchat-open{opacity:1;transform:translateY(0);pointer-events:auto}',
    '.gcchat-head{flex:0 0 auto;background:#004382;color:#fff;border-bottom:3px solid #196b3a;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px}',
    '.gcchat-title{font-family:Georgia,"Times New Roman",serif;font-size:.98rem;font-weight:700;letter-spacing:.02em;line-height:1.25}',
    '.gcchat-title small{display:block;font-family:inherit;font-size:.62rem;font-weight:400;letter-spacing:.14em;text-transform:uppercase;color:#cfe6d6}',
    '.gcchat-close{flex:0 0 auto;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.4);background:transparent;color:#fff;font-size:1.15rem;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '.gcchat-close:hover{background:rgba(255,255,255,.15)}',
    '.gcchat-close:focus-visible{outline:3px solid #cfe6d6;outline-offset:2px}',
    '.gcchat-framewrap{flex:1 1 auto;min-height:0;background:#f7faf8}',
    '.gcchat-frame{width:100%;height:100%;border:0;display:block}',
    '.gcchat-bubble{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:none;align-items:center;gap:9px;background:#004382;color:#fff;border:2px solid #196b3a;border-radius:999px;padding:12px 18px 12px 14px;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:.95rem;font-weight:600;box-shadow:0 8px 24px rgba(0,39,77,.35);opacity:0;transform:translateY(8px);transition:opacity .25s ease,transform .25s ease}',
    '.gcchat-bubble.gcchat-show{display:inline-flex;opacity:1;transform:translateY(0)}',
    '.gcchat-bubble:hover{background:#00274d}',
    '.gcchat-bubble:focus-visible{outline:3px solid #cfe6d6;outline-offset:2px}',
    '.gcchat-teaser{position:fixed;right:20px;bottom:20px;width:320px;max-width:calc(100vw - 16px);background:#004382;color:#fff;border:2px solid #196b3a;border-radius:16px;box-shadow:0 12px 32px rgba(0,39,77,.35),0 2px 8px rgba(0,39,77,.2);z-index:2147483000;padding:14px 40px 14px 14px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;opacity:0;transform:translateY(12px);pointer-events:none;visibility:hidden;transition:opacity .3s ease,transform .3s ease,visibility .3s}',
    '.gcchat-teaser.gcchat-show{opacity:1;transform:translateY(0);pointer-events:auto;visibility:visible}',
    '.gcchat-teaser-main{display:flex;align-items:flex-start;gap:11px;background:none;border:0;color:inherit;font:inherit;text-align:left;cursor:pointer;padding:0;width:100%}',
    '.gcchat-teaser-main:focus-visible{outline:3px solid #cfe6d6;outline-offset:2px}',
    '.gcchat-teaser-icon{flex:0 0 auto;width:42px;height:42px;border-radius:50%;background:#196b3a;color:#fff;display:flex;align-items:center;justify-content:center}',
    '.gcchat-teaser-title{display:block;font-family:Georgia,"Times New Roman",serif;font-size:1rem;font-weight:700;line-height:1.25;margin-bottom:2px}',
    '.gcchat-teaser-text{display:block;font-size:.86rem;line-height:1.4;color:#dcebf5}',
    '.gcchat-teaser-close{position:absolute;top:6px;right:6px;width:26px;height:26px;border-radius:50%;border:1px solid rgba(255,255,255,.4);background:transparent;color:#fff;font-size:.95rem;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}',
    '.gcchat-teaser-close:hover{background:rgba(255,255,255,.15)}',
    '.gcchat-teaser-close:focus-visible{outline:3px solid #cfe6d6;outline-offset:2px}',
    '@media (max-width:480px){.gcchat-panel{right:8px;left:8px;bottom:8px;width:auto;height:calc(100vh - 16px);height:calc(100dvh - 16px);max-height:none}.gcchat-bubble{right:12px;bottom:12px}.gcchat-teaser{right:12px;bottom:12px}}'
  ].join('\n');

  var panel = null, bubble = null, teaser = null, frame = null, isOpen = false;

  function sessionClosed() {
    try { return window.sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
  }
  function markSessionClosed() {
    try { window.sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
  }

  function ensureFrame() {
    if (frame) return;
    frame = document.createElement('iframe');
    frame.className = 'gcchat-frame';
    frame.title = 'Gloucester County Constituent Chatbot';
    frame.setAttribute('src', EMBED_URL);
    frame.setAttribute('allow', 'microphone');
    panel.querySelector('.gcchat-framewrap').appendChild(frame);
  }

  function showTeaser() {
    if (!teaser || isOpen || sessionClosed()) return;
    teaser.classList.add('gcchat-show');
  }

  function hideTeaser() {
    if (teaser) teaser.classList.remove('gcchat-show');
  }

  function dismissTeaser() {
    hideTeaser();
    bubble.classList.add('gcchat-show');
    markSessionClosed();
  }

  function openPanel() {
    ensureFrame();
    isOpen = true;
    hideTeaser();
    panel.classList.add('gcchat-open');
    bubble.classList.remove('gcchat-show');
    panel.setAttribute('aria-hidden', 'false');
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('gcchat-open');
    bubble.classList.add('gcchat-show');
    panel.setAttribute('aria-hidden', 'true');
    markSessionClosed();
  }

  function build() {
    if (panel) return;
    var style = document.createElement('style');
    style.id = 'gcchat-style';
    style.textContent = CSS;
    document.head.appendChild(style);

    panel = document.createElement('div');
    panel.className = 'gcchat-panel';
    panel.id = 'gcchat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Gloucester County Constituent Chatbot');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<div class="gcchat-head">' +
        '<div class="gcchat-title">Gloucester County Constituent Chatbot<small>Gloucester County, New Jersey</small></div>' +
        '<button type="button" class="gcchat-close" id="gcchat-close" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="gcchat-framewrap"></div>';
    document.body.appendChild(panel);

    teaser = document.createElement('div');
    teaser.className = 'gcchat-teaser';
    teaser.id = 'gcchat-teaser';
    teaser.innerHTML =
      '<button type="button" class="gcchat-teaser-main" aria-label="Open the Gloucester County Constituent Chatbot">' +
        '<span class="gcchat-teaser-icon">' + CHAT_SVG + '</span>' +
        '<span><span class="gcchat-teaser-title">' + TEASER_TITLE + '</span>' +
        '<span class="gcchat-teaser-text">' + TEASER_TEXT + '</span></span>' +
      '</button>' +
      '<button type="button" class="gcchat-teaser-close" aria-label="Dismiss">&times;</button>';
    document.body.appendChild(teaser);

    bubble = document.createElement('button');
    bubble.type = 'button';
    bubble.className = 'gcchat-bubble';
    bubble.id = 'gcchat-bubble';
    bubble.setAttribute('aria-label', 'Open the Gloucester County Constituent Chatbot');
    bubble.innerHTML = CHAT_SVG + '<span>Ask Gloucester County</span>';
    document.body.appendChild(bubble);

    panel.querySelector('#gcchat-close').addEventListener('click', closePanel);
    bubble.addEventListener('click', openPanel);
    teaser.querySelector('.gcchat-teaser-main').addEventListener('click', openPanel);
    teaser.querySelector('.gcchat-teaser-close').addEventListener('click', dismissTeaser);

    if (sessionClosed()) {
      bubble.classList.add('gcchat-show');
    } else {
      window.setTimeout(showTeaser, TEASER_DELAY_MS);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
