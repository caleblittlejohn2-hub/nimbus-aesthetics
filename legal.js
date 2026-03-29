/**
 * ══════════════════════════════════════════════════════════════
 * EMBERLINE LEGAL SYSTEM v1.0
 * Shared across ALL Emberline products:
 *   Reading Oasis · TMC Prep · IMAT Prep · Nimbus · Submit Portal
 *
 * What this file does (auto on load):
 *   1. Cookie consent banner (GDPR/CCPA/TDPSA)
 *   2. COPPA parent gate on auth pages
 *   3. Legal footer links injected into every page
 *   4. "Privacy Settings" re-open button
 *
 * Usage: <script src="/legal.js" data-product="oasis"></script>
 * data-product values: oasis | tmc | imat | nimbus | submit
 * ══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  /* ── CONFIG ──────────────────────────────────────────────── */
  const CONSENT_KEY     = 'ember_cookie_consent';
  const CONSENT_VERSION = '1.0';
  const COPPA_KEY       = 'ember_age_verified';
  const SB_EDGE         = 'https://rqytpqaswofdwhmsaykn.supabase.co/functions/v1';

  // Detect which product we're on
  const scriptTag   = document.currentScript || {};
  const PRODUCT     = scriptTag.getAttribute('data-product') || 'oasis';
  const IS_AUTH     = window.location.pathname.includes('auth') || document.title.toLowerCase().includes('sign in') || document.title.toLowerCase().includes('sign up') || document.title.toLowerCase().includes('threshold');
  const IS_COPPA_EXEMPT = PRODUCT === 'review-dashboard' || PRODUCT === 'tmc' || PRODUCT === 'imat'; // adult-only products

  // Legal page paths (relative — works on any subdomain)
  const PRIVACY_URL    = '/privacy.html';
  const TERMS_URL      = '/terms.html';
  const GUIDELINES_URL = '/guidelines.html';

  /* ── STYLES ──────────────────────────────────────────────── */
  const css = `
    /* ── Reset for legal elements ── */
    #ember-legal-cookie,
    #ember-legal-modal,
    #ember-legal-coppa,
    #ember-legal-footer-bar,
    #ember-privacy-btn {
      font-family: 'Cormorant Garamond', Georgia, serif;
      box-sizing: border-box;
    }
    #ember-legal-cookie *,
    #ember-legal-modal *,
    #ember-legal-coppa *,
    #ember-legal-footer-bar *,
    #ember-privacy-btn * {
      box-sizing: border-box;
    }

    /* ── COOKIE BANNER ── */
    #ember-legal-cookie {
      position: fixed; bottom: 0; left: 0; right: 0;
      z-index: 99000;
      background: rgba(5,7,4,.97);
      backdrop-filter: blur(32px) saturate(1.6);
      border-top: 1px solid rgba(0,212,138,.15);
      padding: 1.4rem 2rem;
      transform: translateY(110%);
      transition: transform .5s cubic-bezier(.16,1,.3,1);
    }
    #ember-legal-cookie::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0,212,138,.4), rgba(212,114,10,.2), transparent);
    }
    #ember-legal-cookie.ecl-show { transform: translateY(0); }
    .ecl-inner {
      max-width: 1140px; margin: 0 auto;
      display: flex; align-items: center;
      justify-content: space-between;
      gap: 1.5rem; flex-wrap: wrap;
    }
    .ecl-text-wrap {}
    .ecl-title {
      font-style: italic; font-weight: 300;
      font-size: 1rem; color: #F4EDD8;
      margin-bottom: .3rem;
    }
    .ecl-text {
      font-style: italic; font-size: .9rem;
      color: rgba(154,138,104,.7); line-height: 1.75;
    }
    .ecl-text a { color: #00D48A; text-decoration: none; }
    .ecl-text a:hover { color: #3DFFC0; }
    .ecl-btns {
      display: flex; gap: .5rem; flex-wrap: wrap;
      align-items: center; flex-shrink: 0;
    }
    .ecl-btn {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: .42rem; letter-spacing: .16em; text-transform: uppercase;
      padding: .55rem 1.2rem; border-radius: 1px;
      cursor: pointer; transition: all .3s;
      white-space: nowrap; border: 1px solid; font-style: normal;
    }
    .ecl-accept {
      color: #030402;
      background: linear-gradient(135deg, #3DFFC0, #00D48A);
      border-color: transparent;
    }
    .ecl-accept:hover { box-shadow: 0 4px 20px rgba(0,212,138,.4); transform: translateY(-1px); }
    .ecl-necessary {
      color: #9A8A68; background: transparent;
      border-color: rgba(212,114,10,.2);
    }
    .ecl-necessary:hover { border-color: rgba(212,114,10,.4); color: #D8CCAA; }
    .ecl-manage {
      color: #4A3E28; background: transparent;
      border-color: transparent; text-decoration: underline;
      text-decoration-color: rgba(74,62,40,.4);
    }
    .ecl-manage:hover { color: #9A8A68; }

    /* ── COOKIE PREFS MODAL ── */
    #ember-legal-modal {
      position: fixed; inset: 0; z-index: 99001;
      background: rgba(3,4,2,.88);
      backdrop-filter: blur(24px);
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
      opacity: 0; pointer-events: none;
      transition: opacity .4s;
    }
    #ember-legal-modal.ecm-show { opacity: 1; pointer-events: all; }
    .ecm-box {
      max-width: 540px; width: 100%;
      background: linear-gradient(145deg, rgba(15,20,10,.99), rgba(6,8,4,1));
      border: 1px solid rgba(0,212,138,.3); border-radius: 4px;
      padding: 2.5rem; position: relative; overflow: hidden;
    }
    .ecm-box::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, #00D48A, #3DFFC0, transparent);
    }
    .ecm-title {
      font-style: italic; font-weight: 300;
      font-size: 1.4rem; color: #F4EDD8; margin-bottom: .35rem;
    }
    .ecm-sub {
      font-style: italic; font-size: .9rem;
      color: #4A3E28; margin-bottom: 1.6rem; line-height: 1.75;
    }
    .ecm-close {
      position: absolute; top: 1rem; right: 1rem;
      font-family: 'DM Mono', monospace; font-size: .42rem;
      letter-spacing: .12em; text-transform: uppercase;
      color: #4A3E28; background: none; border: none;
      cursor: pointer; transition: color .25s; font-style: normal;
    }
    .ecm-close:hover { color: #FF9B3A; }
    .ecm-cat {
      border: 1px solid rgba(212,114,10,.13);
      border-radius: 1px; padding: .9rem 1.1rem; margin-bottom: .65rem;
    }
    .ecm-cat-head {
      display: flex; align-items: center;
      justify-content: space-between; gap: 1rem;
    }
    .ecm-cat-title {
      font-family: 'DM Mono', monospace;
      font-size: .43rem; letter-spacing: .15em; text-transform: uppercase;
      color: #9A8A68; font-style: normal; font-weight: 400;
    }
    .ecm-cat-body {
      font-style: italic; font-size: .88rem;
      color: #4A3E28; margin-top: .45rem; line-height: 1.7;
    }
    .ecm-always {
      font-family: 'DM Mono', monospace;
      font-size: .4rem; letter-spacing: .1em; text-transform: uppercase;
      color: #00D48A; font-style: normal;
    }
    /* Toggle */
    .ecm-toggle { position: relative; width: 40px; height: 20px; flex-shrink: 0; }
    .ecm-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
    .ecm-track {
      position: absolute; inset: 0; border-radius: 10px; cursor: pointer;
      background: rgba(212,114,10,.2); border: 1px solid rgba(212,114,10,.2);
      transition: background .3s;
    }
    .ecm-toggle input:checked + .ecm-track { background: #00D48A; border-color: #00D48A; }
    .ecm-track::after {
      content: ''; position: absolute;
      width: 14px; height: 14px; border-radius: 50%;
      background: #F4EDD8; top: 2px; left: 2px;
      transition: transform .3s; box-shadow: 0 1px 3px rgba(0,0,0,.3);
    }
    .ecm-toggle input:checked + .ecm-track::after { transform: translateX(20px); }
    .ecm-toggle input:disabled + .ecm-track { opacity: .5; cursor: not-allowed; }
    .ecm-save {
      width: 100%; margin-top: 1.4rem; padding: .88rem;
      background: linear-gradient(135deg, #3DFFC0, #00D48A);
      border: none; border-radius: 1px;
      font-style: italic; font-weight: 300; font-size: 1rem;
      color: #030402; cursor: pointer; transition: all .3s;
    }
    .ecm-save:hover { box-shadow: 0 6px 26px rgba(0,212,138,.4); }

    /* ── COPPA GATE ── */
    #ember-legal-coppa {
      position: fixed; inset: 0; z-index: 99002;
      background: rgba(3,4,2,.97);
      backdrop-filter: blur(40px);
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
      opacity: 0; pointer-events: none;
      transition: opacity .5s;
    }
    #ember-legal-coppa.ecg-show { opacity: 1; pointer-events: all; }
    .ecg-box {
      max-width: 560px; width: 100%;
      background: linear-gradient(145deg, rgba(15,20,10,.99), rgba(6,8,4,1));
      border: 1px solid rgba(0,212,138,.3); border-radius: 6px;
      padding: 3rem; position: relative; overflow: hidden; text-align: center;
    }
    .ecg-box::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, #00D48A, #3DFFC0, #00D48A, transparent);
    }
    .ecg-step { display: none; }
    .ecg-step.ecg-active { display: block; }
    .ecg-icon {
      font-size: 2.8rem; margin-bottom: 1.4rem; display: block;
      filter: drop-shadow(0 0 20px rgba(0,212,138,.6));
    }
    .ecg-title {
      font-style: italic; font-weight: 300;
      font-size: 1.8rem; color: #F4EDD8; margin-bottom: .5rem;
    }
    .ecg-body {
      font-style: italic; font-size: .97rem;
      color: #4A3E28; line-height: 2; margin-bottom: 1.8rem;
    }
    .ecg-body strong { color: #D8CCAA; font-weight: 400; font-style: normal; }
    .ecg-choices { display: flex; gap: .8rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.4rem; }
    .ecg-choice {
      flex: 1; min-width: 140px; display: flex; flex-direction: column;
      align-items: center; gap: .5rem;
      padding: 1.1rem 1.5rem; border: 1px solid rgba(212,114,10,.2);
      border-radius: 2px; cursor: pointer; transition: all .3s;
      background: transparent; font-style: italic;
    }
    .ecg-choice:hover {
      border-color: rgba(0,212,138,.35); background: rgba(0,212,138,.05);
      transform: translateY(-2px);
    }
    .ecg-choice-icon { font-size: 1.8rem; }
    .ecg-choice-label {
      font-family: 'DM Mono', monospace;
      font-size: .42rem; letter-spacing: .14em; text-transform: uppercase;
      color: #9A8A68; font-style: normal;
    }
    .ecg-choice-sub { font-style: italic; font-size: .85rem; color: #4A3E28; }
    .ecg-input {
      width: 100%; background: rgba(3,4,2,.9);
      border: 1px solid rgba(212,114,10,.2); border-radius: 1px;
      padding: .82rem 1rem; color: #F4EDD8;
      font-style: italic; font-size: .97rem;
      outline: none; transition: border-color .3s;
      margin-bottom: .9rem; text-align: center;
    }
    .ecg-input:focus { border-color: #00D48A; }
    .ecg-input::placeholder { color: rgba(154,138,104,.3); }
    .ecg-btn {
      width: 100%; padding: .95rem;
      background: linear-gradient(135deg, #3DFFC0, #00D48A);
      border: none; border-radius: 1px;
      font-style: italic; font-weight: 300; font-size: 1rem;
      color: #030402; cursor: pointer; transition: all .3s; margin-bottom: .7rem;
    }
    .ecg-btn:hover { box-shadow: 0 8px 30px rgba(0,212,138,.4); }
    .ecg-note {
      font-style: italic; font-size: .86rem;
      color: #4A3E28; line-height: 1.8;
    }
    .ecg-note a { color: #00D48A; text-decoration: none; }
    .ecg-msg {
      font-family: 'DM Mono', monospace;
      font-size: .43rem; letter-spacing: .12em; text-transform: uppercase;
      font-style: normal; margin: .7rem 0; display: none;
    }
    .ecg-msg.ok { color: #00D48A; display: block; }
    .ecg-msg.err { color: #FF9B3A; display: block; }

    /* ── LEGAL FOOTER BAR ── */
    #ember-legal-footer-bar {
      position: relative; z-index: 10;
      border-top: 1px solid rgba(212,114,10,.08);
      padding: 1.4rem 2.5rem;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 1rem;
      background: rgba(3,4,2,.6);
      backdrop-filter: blur(10px);
    }
    .elb-brand {
      font-style: italic; font-weight: 300;
      font-size: .92rem; color: #F4EDD8;
    }
    .elb-brand em { font-style: normal; color: #FF9B3A; }
    .elb-links { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .elb-link {
      font-style: italic; font-size: .88rem;
      color: #4A3E28; text-decoration: none;
      transition: color .25s; background: none; border: none; cursor: pointer;
    }
    .elb-link:hover { color: #FF9B3A; }
    .elb-legal {
      font-family: 'DM Mono', monospace;
      font-size: .4rem; letter-spacing: .12em; text-transform: uppercase;
      color: rgba(154,138,104,.2); text-align: right; font-style: normal;
    }

    /* ── PRIVACY RE-OPEN BUTTON ── */
    #ember-privacy-btn {
      position: fixed; bottom: 1.2rem; left: 1.5rem; z-index: 9998;
      font-family: 'DM Mono', monospace;
      font-size: .4rem; letter-spacing: .14em; text-transform: uppercase;
      color: rgba(0,212,138,.45);
      background: rgba(5,7,4,.9);
      border: 1px solid rgba(0,212,138,.1);
      border-radius: 1px; padding: .38rem .85rem;
      cursor: pointer; transition: all .3s; font-style: normal;
    }
    #ember-privacy-btn:hover { color: #00D48A; border-color: rgba(0,212,138,.3); }

    @media (max-width: 640px) {
      .ecl-inner { flex-direction: column; }
      .ecg-choices { flex-direction: column; }
    }
  `;

  /* ── INJECT STYLES ─────────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.id = 'ember-legal-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── CONSENT UTILS ─────────────────────────────────────── */
  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY)) || null; } catch(e) { return null; }
  }
  function saveConsent(prefs) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      version: CONSENT_VERSION, timestamp: Date.now(), ...prefs
    }));
  }
  function getCoppa() {
    try { return JSON.parse(sessionStorage.getItem(COPPA_KEY)) || null; } catch(e) { return null; }
  }

  /* ── BUILD COOKIE BANNER ───────────────────────────────── */
  function buildCookieBanner() {
    const el = document.createElement('div');
    el.id = 'ember-legal-cookie';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie consent');
    el.innerHTML = `
      <div class="ecl-inner">
        <div class="ecl-text-wrap">
          <div class="ecl-title">The Oasis uses cookies.</div>
          <div class="ecl-text">
            We use strictly necessary cookies to keep you signed in, and optional analytics cookies to improve the experience.
            We never use advertising cookies or sell your data.
            <a href="${PRIVACY_URL}" target="_blank">Privacy Policy</a> &middot;
            <a href="${TERMS_URL}" target="_blank">Terms of Service</a>
          </div>
        </div>
        <div class="ecl-btns">
          <button class="ecl-btn ecl-accept" id="ecl-accept-all">Accept All</button>
          <button class="ecl-btn ecl-necessary" id="ecl-necessary">Necessary Only</button>
          <button class="ecl-btn ecl-manage" id="ecl-manage">Manage Preferences</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);

    document.getElementById('ecl-accept-all').onclick = () => {
      saveConsent({ necessary: true, functional: true, analytics: true, marketing: false });
      hideBanner(); closeModal();
    };
    document.getElementById('ecl-necessary').onclick = () => {
      saveConsent({ necessary: true, functional: false, analytics: false, marketing: false });
      hideBanner(); closeModal();
    };
    document.getElementById('ecl-manage').onclick = openModal;
  }

  function showBanner() { document.getElementById('ember-legal-cookie')?.classList.add('ecl-show'); }
  function hideBanner() { document.getElementById('ember-legal-cookie')?.classList.remove('ecl-show'); }

  /* ── BUILD PREFS MODAL ─────────────────────────────────── */
  function buildPrefsModal() {
    const el = document.createElement('div');
    el.id = 'ember-legal-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML = `
      <div class="ecm-box">
        <button class="ecm-close" id="ecm-close">✕ Close</button>
        <div class="ecm-title">Cookie Preferences</div>
        <p class="ecm-sub">Choose which cookies you allow. Update anytime via the privacy button.</p>
        <div class="ecm-cat">
          <div class="ecm-cat-head">
            <div class="ecm-cat-title">Strictly Necessary <span class="ecm-always">Always On</span></div>
            <label class="ecm-toggle"><input type="checkbox" checked disabled><span class="ecm-track"></span></label>
          </div>
          <div class="ecm-cat-body">Authentication sessions, security tokens, and your consent record. Cannot be disabled — required for the service to function.</div>
        </div>
        <div class="ecm-cat">
          <div class="ecm-cat-head">
            <div class="ecm-cat-title">Functional</div>
            <label class="ecm-toggle"><input type="checkbox" id="ck-functional" checked><span class="ecm-track"></span></label>
          </div>
          <div class="ecm-cat-body">Remember your preferences — reading position, display settings, theme.</div>
        </div>
        <div class="ecm-cat">
          <div class="ecm-cat-head">
            <div class="ecm-cat-title">Analytics</div>
            <label class="ecm-toggle"><input type="checkbox" id="ck-analytics"><span class="ecm-track"></span></label>
          </div>
          <div class="ecm-cat-body">Anonymized usage data to improve the experience. No personally identifiable information. Never shared with advertisers.</div>
        </div>
        <div class="ecm-cat" style="border-color:rgba(212,114,10,.06)">
          <div class="ecm-cat-head">
            <div class="ecm-cat-title">Marketing / Advertising</div>
            <label class="ecm-toggle"><input type="checkbox" id="ck-marketing" disabled><span class="ecm-track"></span></label>
          </div>
          <div class="ecm-cat-body" style="color:rgba(74,62,40,.55)">Not used. Emberline products are ad-free by design. This toggle is permanently off.</div>
        </div>
        <button class="ecm-save" id="ecm-save">✦ Save My Preferences</button>
      </div>
    `;
    document.body.appendChild(el);

    document.getElementById('ecm-close').onclick = closeModal;
    document.getElementById('ecm-save').onclick = () => {
      saveConsent({
        necessary: true,
        functional: document.getElementById('ck-functional').checked,
        analytics: document.getElementById('ck-analytics').checked,
        marketing: false,
      });
      hideBanner(); closeModal();
    };
  }

  function openModal() {
    const c = getConsent();
    if (c) {
      const fn = document.getElementById('ck-functional');
      const an = document.getElementById('ck-analytics');
      if (fn) fn.checked = !!c.functional;
      if (an) an.checked = !!c.analytics;
    }
    document.getElementById('ember-legal-modal')?.classList.add('ecm-show');
  }
  function closeModal() { document.getElementById('ember-legal-modal')?.classList.remove('ecm-show'); }

  /* ── BUILD COPPA GATE ──────────────────────────────────── */
  function buildCoppaGate() {
    const el = document.createElement('div');
    el.id = 'ember-legal-coppa';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Age verification');
    el.innerHTML = `
      <div class="ecg-box">
        <!-- Step 1: Age question -->
        <div class="ecg-step ecg-active" id="ecg-s1">
          <span class="ecg-icon">🌿</span>
          <h2 class="ecg-title">Welcome to Emberline.</h2>
          <p class="ecg-body">Before you enter, we need one quick thing — it helps us protect the privacy of young readers.</p>
          <p class="ecg-body"><strong>Who is creating this account?</strong></p>
          <div class="ecg-choices">
            <button class="ecg-choice" id="ecg-adult">
              <span class="ecg-choice-icon">🧑</span>
              <span class="ecg-choice-label">Age 13 or Older</span>
              <span class="ecg-choice-sub">Creating for myself</span>
            </button>
            <button class="ecg-choice" id="ecg-child">
              <span class="ecg-choice-icon">🧒</span>
              <span class="ecg-choice-label">Child Under 13</span>
              <span class="ecg-choice-sub">Parent setting this up</span>
            </button>
          </div>
          <div class="ecg-note">
            We comply with COPPA (Children's Online Privacy Protection Act).
            We never collect a child's personal information without verifiable parental consent.
            <br><a href="${PRIVACY_URL}#s3" target="_blank">Children's Privacy Policy →</a>
          </div>
        </div>

        <!-- Step 2a: 13+ — enter -->
        <div class="ecg-step" id="ecg-s2a">
          <span class="ecg-icon">✦</span>
          <h2 class="ecg-title">The portal is open.</h2>
          <p class="ecg-body">Welcome to the Oasis, traveler.</p>
          <button class="ecg-btn" id="ecg-enter">✦ Continue</button>
        </div>

        <!-- Step 2b: Under 13 — parent consent -->
        <div class="ecg-step" id="ecg-s2b">
          <span class="ecg-icon">👪</span>
          <h2 class="ecg-title">Parent Setup Required</h2>
          <p class="ecg-body">To protect your child's privacy under COPPA, we need your consent first.</p>
          <input class="ecg-input" type="email" id="ecg-parent-email" placeholder="Your email address (parent/guardian)">
          <input class="ecg-input" type="text" id="ecg-child-name" placeholder="A display name for your child (no real name needed)" maxlength="30">
          <div class="ecg-msg" id="ecg-msg"></div>
          <button class="ecg-btn" id="ecg-consent-btn">✦ Send Consent Email</button>
          <div class="ecg-note">
            We'll send a consent link to your email. Your child's account activates when you click it.
            <br><a href="${PRIVACY_URL}#s3" target="_blank">Your COPPA rights →</a>
          </div>
        </div>

        <!-- Step 3: Email sent -->
        <div class="ecg-step" id="ecg-s3">
          <span class="ecg-icon">📬</span>
          <h2 class="ecg-title">Check your email.</h2>
          <p class="ecg-body">We've sent a consent link. Your child's account activates when you confirm it.</p>
          <p class="ecg-body">Questions? <a href="mailto:coppa@emberlinegroup.org">coppa@emberlinegroup.org</a></p>
          <button class="ecg-btn" id="ecg-close-btn">✦ Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);

    document.getElementById('ecg-adult').onclick = () => coppaGoStep('2a');
    document.getElementById('ecg-child').onclick = () => coppaGoStep('2b');
    document.getElementById('ecg-enter').onclick = () => {
      sessionStorage.setItem(COPPA_KEY, JSON.stringify({ type: 'adult', ts: Date.now() }));
      document.getElementById('ember-legal-coppa').classList.remove('ecg-show');
    };
    document.getElementById('ecg-consent-btn').onclick = submitParentConsent;
    document.getElementById('ecg-close-btn').onclick = () => {
      document.getElementById('ember-legal-coppa').classList.remove('ecg-show');
    };
  }

  function coppaGoStep(step) {
    document.querySelectorAll('.ecg-step').forEach(s => s.classList.remove('ecg-active'));
    const target = document.getElementById('ecg-s' + step);
    if (target) target.classList.add('ecg-active');
  }

  async function submitParentConsent() {
    const email    = (document.getElementById('ecg-parent-email')?.value || '').trim();
    const name     = (document.getElementById('ecg-child-name')?.value  || '').trim();
    const msgEl    = document.getElementById('ecg-msg');
    const btn      = document.getElementById('ecg-consent-btn');

    if (!email || !email.includes('@')) {
      msgEl.textContent = 'Please enter a valid parent/guardian email.';
      msgEl.className = 'ecg-msg err'; return;
    }
    if (!name || name.length < 2) {
      msgEl.textContent = 'Please enter a display name for your child.';
      msgEl.className = 'ecg-msg err'; return;
    }

    msgEl.textContent = 'Sending consent email...';
    msgEl.className = 'ecg-msg ok';
    btn.disabled = true;

    try {
      await fetch(SB_EDGE + '/oasis-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'coppa_consent', email, data: { childName: name, ts: new Date().toISOString(), product: PRODUCT } })
      });
    } catch(e) { /* proceed even if email fails */ }

    sessionStorage.setItem(COPPA_KEY, JSON.stringify({
      type: 'under13_pending', parentEmail: email, childName: name, ts: Date.now()
    }));
    coppaGoStep('3');
  }

  /* ── BUILD LEGAL FOOTER ────────────────────────────────── */
  function buildLegalFooter() {
    // Don't inject if an existing <footer> already has legal links
    const existing = document.querySelectorAll('footer');
    for (const f of existing) {
      if (f.innerHTML.includes('Privacy') || f.innerHTML.includes('Terms')) return;
    }

    const bar = document.createElement('div');
    bar.id = 'ember-legal-footer-bar';
    bar.innerHTML = `
      <div class="elb-brand">Ember<em>line</em></div>
      <div class="elb-links">
        <a href="${PRIVACY_URL}" class="elb-link">Privacy Policy</a>
        <a href="${TERMS_URL}" class="elb-link">Terms of Service</a>
        <a href="${GUIDELINES_URL}" class="elb-link">Community Guidelines</a>
        <button class="elb-link" id="elb-cookie-settings">Cookie Settings</button>
      </div>
      <div class="elb-legal">
        <p>© 2026 Emberline Holdings Company LLC</p>
        <p>No Ads · No Data Sold</p>
      </div>
    `;
    document.body.appendChild(bar);
    document.getElementById('elb-cookie-settings').onclick = openModal;
  }

  /* ── PRIVACY RE-OPEN BUTTON ────────────────────────────── */
  function buildPrivacyBtn() {
    const btn = document.createElement('button');
    btn.id = 'ember-privacy-btn';
    btn.title = 'Privacy & Cookie Settings';
    btn.textContent = '🛡 Privacy Settings';
    btn.onclick = () => {
      showBanner();
      openModal();
    };
    document.body.appendChild(btn);
  }

  /* ── MAIN INIT ─────────────────────────────────────────── */
  function init() {
    buildCookieBanner();
    buildPrefsModal();
    buildCoppaGate();
    buildLegalFooter();
    buildPrivacyBtn();

    // Show cookie banner if not yet consented
    const consent = getConsent();
    if (!consent || consent.version !== CONSENT_VERSION) {
      setTimeout(showBanner, 1400);
    }

    // Show COPPA gate on auth pages for non-adult products
    if (IS_AUTH && !IS_COPPA_EXEMPT) {
      const coppa = getCoppa();
      if (!coppa) {
        setTimeout(() => {
          document.getElementById('ember-legal-coppa')?.classList.add('ecg-show');
        }, 800);
      }
    }
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── PUBLIC API ────────────────────────────────────────── */
  window.EmberLegal = {
    showCookieBanner:   showBanner,
    openCookiePrefs:    openModal,
    getConsent:         getConsent,
    showCoppaGate:      () => document.getElementById('ember-legal-coppa')?.classList.add('ecg-show'),
    getCoppaStatus:     getCoppa,
    isChildAccount:     () => { const c = getCoppa(); return c?.type === 'under13_pending'; },
    hasAgeVerified:     () => !!getCoppa(),
    hasAnalyticsConsent: () => !!getConsent()?.analytics,
  };

})();
