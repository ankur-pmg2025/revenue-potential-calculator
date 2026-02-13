/* V2: permalink + editable month assumptions + revenue model toggle + lead source split w/ uplift+conversion */
const $ = (id) => document.getElementById(id);

const DEFAULTS = {
  missedDay: 12,
  missedAfterHours: 2,
  missedWeekend: 2,
  dailyWebLeads: 15,

  avgPatientValue: 499,
  ltvPerPatient: 2500,

  weekdaysPerMonth: 20,
  weekendsPerMonth: 4,

  baseBookingRate: 70,
  factorSpam: false,
  factorCallback: false,
  factorPrice: false,

  revenueModel: "first_visit",

  shareWeb: 60,
  shareGmb: 25,
  shareAds: 15,

  upliftWeb: 15,
  upliftGmb: 12,
  upliftAds: 18,

  convWeb: 25,
  convGmb: 20,
  convAds: 18,

  autoUpdateUrl: true,
};

const REDUCTIONS = { spam: 18, callback: 20, price: 10 };

const els = {
  missedDay: $("missedDay"),
  missedAfterHours: $("missedAfterHours"),
  missedWeekend: $("missedWeekend"),
  dailyWebLeads: $("dailyWebLeads"),
  avgPatientValue: $("avgPatientValue"),
  ltvPerPatient: $("ltvPerPatient"),

  weekdaysPerMonth: $("weekdaysPerMonth"),
  weekendsPerMonth: $("weekendsPerMonth"),

  baseBookingRate: $("baseBookingRate"),
  factorSpam: $("factorSpam"),
  factorCallback: $("factorCallback"),
  factorPrice: $("factorPrice"),

  shareWeb: $("shareWeb"),
  shareGmb: $("shareGmb"),
  shareAds: $("shareAds"),

  upliftWeb: $("upliftWeb"),
  upliftGmb: $("upliftGmb"),
  upliftAds: $("upliftAds"),

  convWeb: $("convWeb"),
  convGmb: $("convGmb"),
  convAds: $("convAds"),

  autoUpdateUrl: $("autoUpdateUrl"),

  monthlyMissedCalls: $("monthlyMissedCalls"),
  monthlyTotalLeads: $("monthlyTotalLeads"),
  monthlyLeadSplit: $("monthlyLeadSplit"),
  leadSplitNote: $("leadSplitNote"),

  baseBookingRateLabel: $("baseBookingRateLabel"),
  effectiveBookingRateLabel: $("effectiveBookingRateLabel"),

  annualImpact: $("annualImpact"),
  monthlyImpact: $("monthlyImpact"),

  bookingsFromMissedCalls: $("bookingsFromMissedCalls"),
  missedCallRevenueMonthly: $("missedCallRevenueMonthly"),

  newPatientsFromAi: $("newPatientsFromAi"),
  aiRevenueMonthly: $("aiRevenueMonthly"),
  aiBySourceLines: $("aiBySourceLines"),
  valueModelLabel: $("valueModelLabel"),

  howMissedCalls: $("howMissedCalls"),
  howAiLeads: $("howAiLeads"),
  howTotal: $("howTotal"),

  btnCopyLink: $("btnCopyLink"),
  btnReset: $("btnReset"),
  copyStatus: $("copyStatus"),
};

function getRevenueModel() {
  const r = document.querySelector('input[name="revenueModel"]:checked');
  return r ? r.value : DEFAULTS.revenueModel;
}

function setRevenueModel(value) {
  const el = document.querySelector(`input[name="revenueModel"][value="${value}"]`);
  if (el) el.checked = true;
}

function n(el) {
  const v = Number(el.value);
  return Number.isFinite(v) ? v : 0;
}
function b(el) { return !!el.checked; }

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

function fmtMoney(x) {
  const v = Math.round(x);
  return v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function fmtInt(x) {
  return Math.round(x).toLocaleString();
}
function fmtPct01(x) {
  return `${Math.round(x * 100)}%`;
}

function serializeState() {
  const state = {
    missedDay: clamp(n(els.missedDay), 0, 999999),
    missedAfterHours: clamp(n(els.missedAfterHours), 0, 999999),
    missedWeekend: clamp(n(els.missedWeekend), 0, 999999),
    dailyWebLeads: clamp(n(els.dailyWebLeads), 0, 999999),
    avgPatientValue: clamp(n(els.avgPatientValue), 0, 999999999),
    ltvPerPatient: clamp(n(els.ltvPerPatient), 0, 999999999),

    weekdaysPerMonth: clamp(n(els.weekdaysPerMonth), 0, 31),
    weekendsPerMonth: clamp(n(els.weekendsPerMonth), 0, 10),

    baseBookingRate: clamp(n(els.baseBookingRate), 0, 100),
    factorSpam: b(els.factorSpam),
    factorCallback: b(els.factorCallback),
    factorPrice: b(els.factorPrice),

    revenueModel: getRevenueModel(),

    shareWeb: clamp(n(els.shareWeb), 0, 100),
    shareGmb: clamp(n(els.shareGmb), 0, 100),
    shareAds: clamp(n(els.shareAds), 0, 100),

    upliftWeb: clamp(n(els.upliftWeb), 0, 500),
    upliftGmb: clamp(n(els.upliftGmb), 0, 500),
    upliftAds: clamp(n(els.upliftAds), 0, 500),

    convWeb: clamp(n(els.convWeb), 0, 100),
    convGmb: clamp(n(els.convGmb), 0, 100),
    convAds: clamp(n(els.convAds), 0, 100),

    autoUpdateUrl: b(els.autoUpdateUrl),
  };
  return state;
}

function applyState(state) {
  const s = { ...DEFAULTS, ...(state || {}) };

  els.missedDay.value = s.missedDay;
  els.missedAfterHours.value = s.missedAfterHours;
  els.missedWeekend.value = s.missedWeekend;
  els.dailyWebLeads.value = s.dailyWebLeads;
  els.avgPatientValue.value = s.avgPatientValue;
  els.ltvPerPatient.value = s.ltvPerPatient;

  els.weekdaysPerMonth.value = s.weekdaysPerMonth;
  els.weekendsPerMonth.value = s.weekendsPerMonth;

  els.baseBookingRate.value = s.baseBookingRate;
  els.factorSpam.checked = !!s.factorSpam;
  els.factorCallback.checked = !!s.factorCallback;
  els.factorPrice.checked = !!s.factorPrice;

  setRevenueModel(s.revenueModel);

  els.shareWeb.value = s.shareWeb;
  els.shareGmb.value = s.shareGmb;
  els.shareAds.value = s.shareAds;

  els.upliftWeb.value = s.upliftWeb;
  els.upliftGmb.value = s.upliftGmb;
  els.upliftAds.value = s.upliftAds;

  els.convWeb.value = s.convWeb;
  els.convGmb.value = s.convGmb;
  els.convAds.value = s.convAds;

  els.autoUpdateUrl.checked = !!s.autoUpdateUrl;
}

function stateToQuery(state) {
  const q = new URLSearchParams();
  Object.entries(state).forEach(([k, v]) => {
    if (v === DEFAULTS[k]) return; // keep links shorter
    q.set(k, String(v));
  });
  return q.toString();
}

function queryToState() {
  const q = new URLSearchParams(window.location.search);
  if ([...q.keys()].length === 0) return null;

  const state = {};
  for (const [k, v] of q.entries()) {
    if (!(k in DEFAULTS)) continue;

    if (typeof DEFAULTS[k] === "boolean") {
      state[k] = v === "true";
    } else if (typeof DEFAULTS[k] === "number") {
      const num = Number(v);
      state[k] = Number.isFinite(num) ? num : DEFAULTS[k];
    } else {
      state[k] = v;
    }
  }
  return state;
}

function updateUrlFromState(state) {
  const qs = stateToQuery(state);
  const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState({}, "", newUrl);
}

function normalizeShares(web, gmb, ads) {
  const sum = web + gmb + ads;
  if (sum <= 0) return { web: 0, gmb: 0, ads: 0, sum: 0, normalized: false };
  if (Math.abs(sum - 100) < 0.0001) return { web, gmb, ads, sum, normalized: false };

  // Normalize to 100 while preserving proportions
  const nw = (web / sum) * 100;
  const ng = (gmb / sum) * 100;
  const na = (ads / sum) * 100;
  return { web: nw, gmb: ng, ads: na, sum, normalized: true };
}

function calc() {
  const st = serializeState();

  // Month assumptions
  const WEEKDAYS = st.weekdaysPerMonth;
  const WEEKENDS = st.weekendsPerMonth;

  // Monthly missed calls = day + after-hours per weekday + weekend per weekend
  const monthlyMissedCalls =
    (st.missedDay * WEEKDAYS) +
    (st.missedAfterHours * WEEKDAYS) +
    (st.missedWeekend * WEEKENDS);

  // Monthly total leads from weekday pipeline
  const monthlyTotalLeads = st.dailyWebLeads * WEEKDAYS;

  // Booking rate from missed calls (base reduced by selected factors, multiplicative)
  const baseBookingRate = clamp(st.baseBookingRate / 100, 0, 1);
  const selectedReductions =
    (st.factorSpam ? REDUCTIONS.spam : 0) +
    (st.factorCallback ? REDUCTIONS.callback : 0) +
    (st.factorPrice ? REDUCTIONS.price : 0);
  const effectiveBookingRate = clamp(baseBookingRate * (1 - selectedReductions / 100), 0, 1);

  // Value per patient based on model
  const model = st.revenueModel;
  const valuePerPatient = model === "ltv" ? st.ltvPerPatient : st.avgPatientValue;

  // Missed call revenue
  const bookingsFromMissedCalls = monthlyMissedCalls * effectiveBookingRate;
  const missedCallRevenueMonthly = bookingsFromMissedCalls * valuePerPatient;

  // Lead split (normalize if shares != 100)
  const shares = normalizeShares(st.shareWeb, st.shareGmb, st.shareAds);
  const shareWeb01 = shares.web / 100;
  const shareGmb01 = shares.gmb / 100;
  const shareAds01 = shares.ads / 100;

  const webLeads = monthlyTotalLeads * shareWeb01;
  const gmbLeads = monthlyTotalLeads * shareGmb01;
  const adsLeads = monthlyTotalLeads * shareAds01;

  // AI uplift creates "additional leads", then conversion turns those into patients
  const upliftWeb01 = clamp(st.upliftWeb / 100, 0, 10);
  const upliftGmb01 = clamp(st.upliftGmb / 100, 0, 10);
  const upliftAds01 = clamp(st.upliftAds / 100, 0, 10);

  const convWeb01 = clamp(st.convWeb / 100, 0, 1);
  const convGmb01 = clamp(st.convGmb / 100, 0, 1);
  const convAds01 = clamp(st.convAds / 100, 0, 1);

  const addWebLeads = webLeads * upliftWeb01;
  const addGmbLeads = gmbLeads * upliftGmb01;
  const addAdsLeads = adsLeads * upliftAds01;

  const newWebPatients = addWebLeads * convWeb01;
  const newGmbPatients = addGmbLeads * convGmb01;
  const newAdsPatients = addAdsLeads * convAds01;

  const newPatientsFromAi = newWebPatients + newGmbPatients + newAdsPatients;
  const aiRevenueMonthly = newPatientsFromAi * valuePerPatient;

  // Total impact
  const monthlyImpact = missedCallRevenueMonthly + aiRevenueMonthly;
  const annualImpact = monthlyImpact * 12;

  // UI
  els.monthlyMissedCalls.textContent = fmtInt(monthlyMissedCalls);
  els.monthlyTotalLeads.textContent = fmtInt(monthlyTotalLeads);

  const splitCounts = `Web ${fmtInt(webLeads)}, Google ${fmtInt(gmbLeads)}, Ads ${fmtInt(adsLeads)}`;
  els.monthlyLeadSplit.textContent = splitCounts;

  els.baseBookingRateLabel.textContent = fmtPct01(baseBookingRate);
  els.effectiveBookingRateLabel.textContent = fmtPct01(effectiveBookingRate);

  els.bookingsFromMissedCalls.textContent = fmtInt(bookingsFromMissedCalls);
  els.missedCallRevenueMonthly.textContent = fmtMoney(missedCallRevenueMonthly);

  els.newPatientsFromAi.textContent = fmtInt(newPatientsFromAi);
  els.aiRevenueMonthly.textContent = fmtMoney(aiRevenueMonthly);

  els.monthlyImpact.textContent = `${fmtMoney(monthlyImpact)} / month`;
  els.annualImpact.textContent = fmtMoney(annualImpact);

  els.valueModelLabel.textContent = model === "ltv" ? "LTV" : "First Visit";

  const bySourceLines =
    `Website: ${fmtInt(newWebPatients)} patients → ${fmtMoney(newWebPatients * valuePerPatient)}\n` +
    `Google:  ${fmtInt(newGmbPatients)} patients → ${fmtMoney(newGmbPatients * valuePerPatient)}\n` +
    `Ads:     ${fmtInt(newAdsPatients)} patients → ${fmtMoney(newAdsPatients * valuePerPatient)}`;
  els.aiBySourceLines.textContent = bySourceLines;

  const shareMsg = shares.normalized
    ? `Lead shares sum to ${Math.round(shares.sum)}%. Normalized to 100% for calculations (link will store your inputs as entered).`
    : `Lead shares sum to 100%.`;
  els.leadSplitNote.textContent = shareMsg;

  // How calculated
  els.howMissedCalls.textContent =
    `${fmtInt(monthlyMissedCalls)} missed calls/mo × ${fmtPct01(effectiveBookingRate)} booking rate = ${fmtInt(bookingsFromMissedCalls)} patients\n` +
    `${fmtInt(bookingsFromMissedCalls)} × ${fmtMoney(valuePerPatient)} (${model === "ltv" ? "LTV" : "first visit"}) = ${fmtMoney(missedCallRevenueMonthly)}/mo`;

  els.howAiLeads.textContent =
    `Monthly total leads: ${fmtInt(monthlyTotalLeads)}\n` +
    `Split:\n` +
    `  Website: ${fmtInt(webLeads)} leads × ${Math.round(upliftWeb01*100)}% uplift = ${fmtInt(addWebLeads)} extra leads × ${Math.round(convWeb01*100)}% conv = ${fmtInt(newWebPatients)} patients\n` +
    `  Google:  ${fmtInt(gmbLeads)} leads × ${Math.round(upliftGmb01*100)}% uplift = ${fmtInt(addGmbLeads)} extra leads × ${Math.round(convGmb01*100)}% conv = ${fmtInt(newGmbPatients)} patients\n` +
    `  Ads:     ${fmtInt(adsLeads)} leads × ${Math.round(upliftAds01*100)}% uplift = ${fmtInt(addAdsLeads)} extra leads × ${Math.round(convAds01*100)}% conv = ${fmtInt(newAdsPatients)} patients\n` +
    `Total new patients from AI uplift: ${fmtInt(newPatientsFromAi)}\n` +
    `${fmtInt(newPatientsFromAi)} × ${fmtMoney(valuePerPatient)} = ${fmtMoney(aiRevenueMonthly)}/mo`;

  els.howTotal.textContent =
    `Monthly impact = missed calls + AI uplift\n` +
    `${fmtMoney(missedCallRevenueMonthly)} + ${fmtMoney(aiRevenueMonthly)} = ${fmtMoney(monthlyImpact)}/mo\n` +
    `${fmtMoney(monthlyImpact)} × 12 = ${fmtMoney(annualImpact)}/year`;

  // Auto-update URL
  if (st.autoUpdateUrl) updateUrlFromState(st);

  return st;
}

async function copyShareLink() {
  const st = calc();
  const qs = stateToQuery(st);
  const url = qs ? `${window.location.origin}${window.location.pathname}?${qs}` : `${window.location.origin}${window.location.pathname}`;
  try {
    await navigator.clipboard.writeText(url);
    els.copyStatus.textContent = "Copied share link to clipboard.";
    setTimeout(() => (els.copyStatus.textContent = ""), 2500);
  } catch {
    // Fallback: show it
    els.copyStatus.textContent = `Copy failed. Use this URL: ${url}`;
  }
}

function resetDefaults() {
  applyState(DEFAULTS);
  updateUrlFromState(DEFAULTS);
  calc();
}

function wireEvents() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((el) => {
    const evt = (el.type === "checkbox" || el.type === "radio") ? "change" : "input";
    el.addEventListener(evt, () => calc());
  });

  document.querySelectorAll('input[name="revenueModel"]').forEach((el) => {
    el.addEventListener("change", () => calc());
  });

  els.btnCopyLink.addEventListener("click", copyShareLink);
  els.btnReset.addEventListener("click", resetDefaults);

  // If auto-update is toggled off, keep URL stable until user copies
  els.autoUpdateUrl.addEventListener("change", () => {
    if (els.autoUpdateUrl.checked) {
      updateUrlFromState(serializeState());
    }
  });
}

(function init() {
  const fromQuery = queryToState();
  if (fromQuery) {
    applyState(fromQuery);
  } else {
    applyState(DEFAULTS);
  }
  wireEvents();
  calc();
})();
