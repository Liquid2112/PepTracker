/* ============================================================
   PEPTIDE TRACKER — PeptideCard Component
   Exposes: window.PT_PeptideCard.PeptideCard
   Deps: React, PT_Icons, PT_UTILS
   ============================================================ */

(function() {
  var Icon  = window.PT_Icons.Icon;
  var U     = window.PT_UTILS;

  /* ── Next Dose Badge ─────────────────────────────────────── */
  function NextDoseBadge(props) {
    var peptide = props.peptide;
    var status  = U.countdownStatus(peptide);
    var cls     = "badge " + U.countdownBadgeClass(status.type);
    return React.createElement("span", { className: cls }, status.label);
  }

  /* ── Dose Countdown Banner ───────────────────────────────── */
  // Used inside modals — larger contextual banner
  function DoseCountdownBanner(props) {
    var peptide = props.peptide;
    var status  = U.countdownStatus(peptide);
    var bannerCls = "countdown-banner " + U.countdownBannerClass(status.type);
    var days    = U.daysUntilDose(peptide);
    var next    = U.nextDoseISO(peptide);

    var iconName = "calendar";
    if (status.type === "due")  iconName = "alert";
    if (status.type === "soon") iconName = "alert";

    var text = "";
    if (days === null) {
      text = "No dose logged yet — log your first dose below";
    } else if (days < 0) {
      var overdueDays = Math.abs(Math.round(days));
      text = "Overdue by " + overdueDays + " day" + (overdueDays !== 1 ? "s" : "") + " — take your dose now";
    } else if (days < 0.5) {
      text = "Due today";
      if (next) text += " — " + new Date(next).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } else if (days < 1.5) {
      text = "Due tomorrow — " + U.formatDate(next);
    } else {
      text = "Next dose in " + Math.round(days) + " days — " + U.formatDate(next);
    }

    return React.createElement(
      "div", { className: bannerCls },
      React.createElement(Icon, { name: iconName, size: 14, style: { flexShrink: 0 } }),
      text
    );
  }

  /* ── Progress Section ────────────────────────────────────── */
  function ProgressSection(props) {
    var peptide = props.peptide;
    var pct     = U.pctRemaining(peptide);
    var color   = U.progressColor(pct);
    var remaining = parseFloat(peptide.remainingMg);
    var vial      = parseFloat(peptide.vialMg);

    return React.createElement(
      "div", null,
      /* Label row */
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", marginBottom: "var(--space-1)" } },
        React.createElement(
          "span",
          { style: { fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontWeight: 600 } },
          "Remaining"
        ),
        React.createElement(
          "span",
          { style: { fontSize: "var(--text-xs)", fontWeight: 700,
                     fontVariantNumeric: "tabular-nums", color: color } },
          U.fmtMgPlain(remaining) + "mg / " + U.fmtMgPlain(vial) + "mg"
        )
      ),
      /* Bar */
      React.createElement(
        "div", { className: "progress-track" },
        React.createElement("div", {
          className: "progress-fill",
          style: { width: pct.toFixed(1) + "%", background: color },
          role: "progressbar",
          "aria-valuenow": Math.round(pct),
          "aria-valuemin": 0,
          "aria-valuemax": 100,
          "aria-label": Math.round(pct) + "% remaining",
        })
      ),
      /* Sub label */
      React.createElement(
        "div",
        { style: { fontSize: "var(--text-xs)", color: "var(--color-text-faint)",
                   marginTop: "var(--space-1)" } },
        pct.toFixed(0) + "% remaining"
      )
    );
  }

  /* ── Stat Row ────────────────────────────────────────────── */
  function StatRow(props) {
    return React.createElement(
      "div", { className: "peptide-stat-row" },
      React.createElement("span", { className: "peptide-stat-label" }, props.label),
      React.createElement(
        "span",
        { className: "peptide-stat-value", style: props.valueStyle || {} },
        props.value
      )
    );
  }

  /* ── Skeleton Card ───────────────────────────────────────── */
  function PeptideCardSkeleton() {
    return React.createElement(
      "div", { className: "peptide-card", "aria-hidden": "true" },
      React.createElement(
        "div", { className: "peptide-card-header",
                 style: { background: "var(--color-surface-offset)" } },
        React.createElement("div", {
          className: "skeleton",
          style: { height: 20, width: "55%", borderRadius: "var(--radius-sm)" }
        })
      ),
      React.createElement(
        "div", { className: "peptide-card-body" },
        [70, 50, 65, 45, 80].map(function(w, i) {
          return React.createElement("div", {
            key: i, className: "skeleton",
            style: { height: 14, width: w + "%", borderRadius: "var(--radius-sm)" }
          });
        })
      )
    );
  }

  /* ── Main PeptideCard ────────────────────────────────────── */
  // Props: peptide, onEdit, onDelete, onLog, onHistory
  function PeptideCard(props) {
    var p          = props.peptide;
    var onEdit     = props.onEdit;
    var onDelete   = props.onDelete;
    var onLog      = props.onLog;
    var onHistory  = props.onHistory;

    var left        = U.dosesLeft(p);
    var supplyDays  = U.daysSupplyLeft(p);
    var nextISO     = U.nextDoseISO(p);
    var pct         = U.pctRemaining(p);

    /* Warning colors for low doses / supply */
    var dosesLeftColor  = left <= 3 ? "var(--color-error)" : "inherit";
    var supplyColor     = supplyDays <= 7 ? "var(--color-warning)" : "inherit";

    return React.createElement(
      "article",
      { className: "peptide-card" },

      /* ── Header ── */
      React.createElement(
        "div", { className: "peptide-card-header" },
        React.createElement(
          "div", { style: { minWidth: 0 } },
          React.createElement("div", { className: "peptide-card-name" }, p.name),
          p.notes && React.createElement(
            "div", { className: "peptide-card-notes" }, p.notes
          )
        ),
        React.createElement(NextDoseBadge, { peptide: p })
      ),

      /* ── Body ── */
      React.createElement(
        "div", { className: "peptide-card-body" },

        React.createElement(ProgressSection, { peptide: p }),

        React.createElement("div", { className: "separator" }),

        React.createElement(StatRow, {
          label: "Dose",
          value: U.fmtMg(p.doseMg),
        }),
        React.createElement(StatRow, {
          label: "Frequency",
          value: "Every " + p.frequencyDays + " day" + (p.frequencyDays != 1 ? "s" : ""),
        }),
        React.createElement(StatRow, {
          label: "Doses Left",
          value: left + " dose" + (left !== 1 ? "s" : ""),
          valueStyle: { color: dosesLeftColor },
        }),
        React.createElement(StatRow, {
          label: "Days of Supply",
          value: supplyDays + " days",
          valueStyle: { color: supplyColor },
        }),
        React.createElement(StatRow, {
          label: "Last Dose",
          value: U.formatDate(p.lastDose),
          valueStyle: { color: "var(--color-text-muted)" },
        }),
        React.createElement(StatRow, {
          label: "Next Dose",
          value: nextISO ? U.formatDate(nextISO) : "—",
          valueStyle: { color: "var(--color-primary)", fontWeight: 700 },
        })
      ),

      /* ── Footer actions ── */
      React.createElement(
        "div", { className: "peptide-card-footer" },
        /* History */
        React.createElement(
          "button",
          {
            className: "btn btn-sm btn-ghost btn-icon",
            onClick: function() { onHistory(p); },
            title: "Dose history",
            "aria-label": "View dose history for " + p.name,
          },
          React.createElement(Icon, { name: "history", size: 14 })
        ),
        /* Edit */
        React.createElement(
          "button",
          {
            className: "btn btn-sm btn-ghost btn-icon",
            onClick: function() { onEdit(p); },
            title: "Edit",
            "aria-label": "Edit " + p.name,
          },
          React.createElement(Icon, { name: "edit", size: 14 })
        ),
        /* Delete */
        React.createElement(
          "button",
          {
            className: "btn btn-sm btn-ghost btn-icon",
            onClick: function() { onDelete(p); },
            title: "Remove",
            "aria-label": "Remove " + p.name,
            style: { color: "var(--color-error)" },
          },
          React.createElement(Icon, { name: "trash", size: 14 })
        ),
        /* Log dose — primary CTA */
        React.createElement(
          "button",
          {
            className: "btn btn-sm btn-primary",
            onClick: function() { onLog(p); },
            "aria-label": "Log dose for " + p.name,
          },
          React.createElement(Icon, { name: "syringe", size: 13 }),
          "Log Dose"
        )
      )
    );
  }

  window.PT_PeptideCard = {
    PeptideCard:          PeptideCard,
    PeptideCardSkeleton:  PeptideCardSkeleton,
    DoseCountdownBanner:  DoseCountdownBanner,
    NextDoseBadge:        NextDoseBadge,
  };
})();
