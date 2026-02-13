const $ = (id) => document.getElementById(id);

const els = {
  missedDay: $("missedDay"),
  missedAfterHours: $("missedAfterHours"),
  missedWeekend: $("missedWeekend"),
  dailyWebLeads: $("dailyWebLeads"),
  avgPatientValue: $("avgPatientValue"),

  baseBookingRate: $("baseBookingRate"),
  factorSpam: $("factorSpam"),
  factorCallback: $("factorCallback"),
  factorPrice: $("factorPrice"),

  chatbotLeadIncrease: $("chatbotLeadIncrease"),
  webLeadConversionRate: $("webLeadConversionRate"),

  monthlyMissedCalls: $("monthlyMissedCalls"),
  monthlyWebLeads: $("monthlyWebLeads"),

  baseBookingRateLabel: $("baseBookingRateLabel"),
  effectiveBookingRateLabel: $("effectiveBookingRateLabel"),

  annualImpact: $("annualImpact"),
  monthlyImpact: $("monthlyImpact"),

  bookingsFromMissedCalls: $("bookingsFromMissedCalls"),
  missedCallRevenueMonthly: $("missedCallRevenueMonthly"),

  newLeadsFromChatbot: $("newLeadsFromChatbot"),
  chatbotRevenueMonthly: $("chatbotRevenueMonthly"),

  howMissedCalls: $("howMissedCalls"),
  howChatbot: $("howChatbot"),
  howTotal: $("howTotal"),
};

// Config (matches your screenshot math)
const WEEKDAYS_PER_MONTH = 20;
const WEEKENDS_PER_MONTH = 4;

// Factor reductions (percentage points of base, applied multiplicatively)
const REDUCTIONS = {
  spam: 18,
  callback: 20,
  price: 10,
};

function num(el) {
  const v = Number(el.value);
  return Number.isFinite(v) ? v : 0;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function fmtMoney(n) {
  const v = Math.round(n);
  return v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtInt(n) {
  return Math.round(n).toLocaleString();
}

function calc() {
  // Inputs
  const missedDay = clamp(num(els.missedDay), 0, 999999);
  const missedAfterHours = clamp(num(els.missedAfterHours), 0, 999999);
  const missedWeekend = clamp(num(els.missedWeekend), 0, 999999);

  const dailyWebLeads = clamp(num(els.dailyWebLeads), 0, 999999);
  const avgPatientValue = clamp(num(els.avgPatientValue), 0, 999999999);

  const baseBookingRate = clamp(num(els.baseBookingRate), 0, 100) / 100;

  const chatbotLeadIncrease = clamp(num(els.chatbotLeadIncrease), 0, 500) / 100;
  const webLeadConversionRate = clamp(num(els.webLeadConversionRate), 0, 100) / 100;

  // Monthly volumes
  const monthlyMissedCalls =
    (missedDay * WEEKDAYS_PER_MONTH) +
    (missedAfterHours * WEEKDAYS_PER_MONTH) +
    (missedWeekend * WEEKENDS_PER_MONTH);

  const monthlyWebLeads = dailyWebLeads * WEEKDAYS_PER_MONTH;

  // Effective booking rate with selected reductions (multiplicative)
  const selectedReductions =
    (els.factorSpam.checked ? REDUCTIONS.spam : 0) +
    (els.factorCallback.checked ? REDUCTIONS.callback : 0) +
    (els.factorPrice.checked ? REDUCTIONS.price : 0);

  const effectiveBookingRate = clamp(baseBookingRate * (1 - selectedReductions / 100), 0, 1);

  // Missed call revenue
  const bookingsFromMissedCalls = monthlyMissedCalls * effectiveBookingRate;
  const missedCallRevenueMonthly = bookingsFromMissedCalls * avgPatientValue;

  // Chatbot revenue
  const additionalLeadsFromChatbot = monthlyWebLeads * chatbotLeadIncrease; // extra leads
  const newPatientsFromChatbot = additionalLeadsFromChatbot * webLeadConversionRate;
  const chatbotRevenueMonthly = newPatientsFromChatbot * avgPatientValue;

  // Total impact
  const monthlyImpact = missedCallRevenueMonthly + chatbotRevenueMonthly;
  const annualImpact = monthlyImpact * 12;

  // UI updates
  els.monthlyMissedCalls.textContent = fmtInt(monthlyMissedCalls);
  els.monthlyWebLeads.textContent = fmtInt(monthlyWebLeads);

  els.baseBookingRateLabel.textContent = `${Math.round(baseBookingRate * 100)}%`;
  els.effectiveBookingRateLabel.textContent = `${Math.round(effectiveBookingRate * 100)}%`;

  els.bookingsFromMissedCalls.textContent = fmtInt(bookingsFromMissedCalls);
  els.missedCallRevenueMonthly.textContent = fmtMoney(missedCallRevenueMonthly);

  els.newLeadsFromChatbot.textContent = fmtInt(newPatientsFromChatbot);
  els.chatbotRevenueMonthly.textContent = fmtMoney(chatbotRevenueMonthly);

  els.monthlyImpact.textContent = `${fmtMoney(monthlyImpact)} / month`;
  els.annualImpact.textContent = fmtMoney(annualImpact);

  // “How calculated” section
  els.howMissedCalls.textContent =
    `${fmtInt(monthlyMissedCalls)} missed calls/mo × ${Math.round(effectiveBookingRate * 100)}% booking rate = ` +
    `${fmtInt(bookingsFromMissedCalls)} new patients\n` +
    `${fmtInt(bookingsFromMissedCalls)} patients × ${fmtMoney(avgPatientValue)} = ${fmtMoney(missedCallRevenueMonthly)}/mo`;

  els.howChatbot.textContent =
    `${fmtInt(monthlyWebLeads)} web leads × ${Math.round(chatbotLeadIncrease * 100)}% increase = ` +
    `${fmtInt(additionalLeadsFromChatbot)} extra leads\n` +
    `${fmtInt(additionalLeadsFromChatbot)} leads × ${Math.round(webLeadConversionRate * 100)}% conversion = ` +
    `${fmtInt(newPatientsFromChatbot)} patients × ${fmtMoney(avgPatientValue)} = ${fmtMoney(chatbotRevenueMonthly)}/mo`;

  els.howTotal.textContent =
    `(${fmtMoney(missedCallRevenueMonthly)} + ${fmtMoney(chatbotRevenueMonthly)}) × 12 months = ${fmtMoney(annualImpact)}/year`;
}

// Recalc on any input change
[
  els.missedDay, els.missedAfterHours, els.missedWeekend,
  els.dailyWebLeads, els.avgPatientValue,
  els.baseBookingRate,
  els.factorSpam, els.factorCallback, els.factorPrice,
  els.chatbotLeadIncrease, els.webLeadConversionRate
].forEach(el => el.addEventListener("input", calc));

calc();