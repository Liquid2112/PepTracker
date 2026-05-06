/* ============================================================
   PEPTIDE TRACKER — Utility Functions
   Pure functions only. No React, no DOM, no API calls.
   Exposed on window.PT_UTILS for use by all components.
   ============================================================ */

(function() {

  /* ── Date formatters ─────────────────────────────────────── */

  function formatDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatDateShort(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function formatDateTime(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit"
    });
  }

  function isoToDateInput(iso) {
    // Returns "YYYY-MM-DD" for <input type="date">
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return "";
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function todayInputValue() {
    return isoToDateInput(new Date().toISOString());
  }

  /* ── Dose math ───────────────────────────────────────────── */

  function addDays(iso, days) {
    var d = new Date(iso);
    d.setDate(d.getDate() + Math.round(Number(days)));
    return d.toISOString();
  }

  // Returns ISO string of next scheduled dose, or null if no lastDose
  function nextDoseISO(peptide) {
    if (!peptide.lastDose) return null;
    return addDays(peptide.lastDose, peptide.frequencyDays);
  }

  // Returns fractional days until next dose (negative = overdue)
  function daysUntilDose(peptide) {
    var next = nextDoseISO(peptide);
    if (!next) return null;
    return (new Date(next) - new Date()) / 86400000;
  }

  // Number of full doses left in the vial
  function dosesLeft(peptide) {
    var dose = parseFloat(peptide.doseMg);
    if (!dose || dose <= 0) return 0;
    return Math.floor(parseFloat(peptide.remainingMg) / dose);
  }

  // Days of supply remaining
  function daysSupplyLeft(peptide) {
    return dosesLeft(peptide) * parseFloat(peptide.frequencyDays);
  }

  // Percentage of vial remaining (0-100)
  function pctRemaining(peptide) {
    var vial = parseFloat(peptide.vialMg);
    if (!vial || vial <= 0) return 0;
    var pct = (parseFloat(peptide.remainingMg) / vial) * 100;
    return Math.min(100, Math.max(0, pct));
  }

  // Progress bar color based on remaining %
  function progressColor(pct) {
    if (pct > 40) return "var(--color-primary)";
    if (pct > 15) return "var(--color-warning)";
    return "var(--color-error)";
  }

  /* ── Countdown helpers ───────────────────────────────────── */

  // Returns { type, label } for a countdown badge
  function countdownStatus(peptide) {
    var days = daysUntilDose(peptide);
    if (days === null) return { type: "none",  label: "No dose logged" };
    if (days < 0)      return { type: "due",   label: "Overdue " + Math.abs(Math.round(days)) + "d" };
    if (days < 0.5)    return { type: "due",   label: "Due today" };
    if (days < 1.5)    return { type: "soon",  label: "Due tomorrow" };
    if (days < 3)      return { type: "soon",  label: "In " + Math.round(days) + "d" };
    return               { type: "ok",    label: "In " + Math.round(days) + "d" };
  }

  // Badge CSS class from countdown type
  function countdownBadgeClass(type) {
    var map = { due: "badge-red", soon: "badge-yellow", ok: "badge-green", none: "badge-gray" };
    return map[type] || "badge-gray";
  }

  // Banner CSS class from countdown type
  function countdownBannerClass(type) {
    var map = { due: "countdown-due", soon: "countdown-soon", ok: "countdown-ok", none: "countdown-none" };
    return map[type] || "countdown-none";
  }

  /* ── 28-day schedule ─────────────────────────────────────── */

  // Returns array of { date, peptides[] } for the next N days with doses
  function buildSchedule(peptides, days) {
    days = days || 28;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var result = [];

    for (var d = 0; d < days; d++) {
      var date = new Date(today);
      date.setDate(date.getDate() + d);
      date.setHours(0, 0, 0, 0);

      var due = peptides.filter(function(p) {
        var next = nextDoseISO(p);
        if (!next) return false;
        var nextDate = new Date(next);
        nextDate.setHours(0, 0, 0, 0);
        var diff = Math.round((nextDate - date) / 86400000);
        if (diff < 0)  return false;
        if (diff === 0) return true;
        var freq = parseFloat(p.frequencyDays) || 1;
        return diff % freq === 0;
      });

      if (due.length > 0) {
        result.push({ date: date, peptides: due });
      }
    }
    return result;
  }

  /* ── Overdue list ────────────────────────────────────────── */

  function getOverdue(peptides) {
    return peptides.filter(function(p) {
      var d = daysUntilDose(p);
      return d !== null && d < 0;
    });
  }

  /* ── CSV export ──────────────────────────────────────────── */

  function logsToCSV(logs) {
    var header = ["Date", "Peptide", "Dose (mg)", "Notes"].join(",");
    var rows = logs.map(function(l) {
      return [
        '"' + formatDateTime(l.timestamp) + '"',
        '"' + (l.peptideName || "") + '"',
        parseFloat(l.doseMg).toFixed(2),
        '"' + (l.notes || "") + '"'
      ].join(",");
    });
    return [header].concat(rows).join("\n");
  }

  function downloadCSV(content, filename) {
    var blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement("a");
    a.href  = url;
    a.download = filename || "export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── Form validation ─────────────────────────────────────── */

  function validatePeptideForm(form) {
    var errors = {};
    if (!form.name || !form.name.trim()) {
      errors.name = "Name is required";
    }
    if (!form.vialMg || isNaN(form.vialMg) || parseFloat(form.vialMg) <= 0) {
      errors.vialMg = "Enter a valid mg amount";
    }
    if (!form.doseMg || isNaN(form.doseMg) || parseFloat(form.doseMg) <= 0) {
      errors.doseMg = "Enter a valid dose";
    }
    if (!form.frequencyDays || isNaN(form.frequencyDays) || parseFloat(form.frequencyDays) <= 0) {
      errors.frequencyDays = "Enter frequency in days";
    }
    if (form.remainingMg !== "" && form.remainingMg !== undefined) {
      if (isNaN(form.remainingMg) || parseFloat(form.remainingMg) < 0) {
        errors.remainingMg = "Must be 0 or greater";
      }
    }
    return errors;
  }

  /* ── Number formatting ───────────────────────────────────── */

  function fmtMg(val) {
    var n = parseFloat(val);
    if (isNaN(n)) return "—";
    return n % 1 === 0 ? n.toFixed(0) + "mg" : n.toFixed(2) + "mg";
  }

  function fmtMgPlain(val) {
    var n = parseFloat(val);
    if (isNaN(n)) return "0";
    return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
  }

  /* ── Expose on window ────────────────────────────────────── */
  window.PT_UTILS = {
    formatDate:           formatDate,
    formatDateShort:      formatDateShort,
    formatDateTime:       formatDateTime,
    isoToDateInput:       isoToDateInput,
    todayInputValue:      todayInputValue,
    addDays:              addDays,
    nextDoseISO:          nextDoseISO,
    daysUntilDose:        daysUntilDose,
    dosesLeft:            dosesLeft,
    daysSupplyLeft:       daysSupplyLeft,
    pctRemaining:         pctRemaining,
    progressColor:        progressColor,
    countdownStatus:      countdownStatus,
    countdownBadgeClass:  countdownBadgeClass,
    countdownBannerClass: countdownBannerClass,
    buildSchedule:        buildSchedule,
    getOverdue:           getOverdue,
    logsToCSV:            logsToCSV,
    downloadCSV:          downloadCSV,
    validatePeptideForm:  validatePeptideForm,
    fmtMg:                fmtMg,
    fmtMgPlain:           fmtMgPlain,
  };

})();
