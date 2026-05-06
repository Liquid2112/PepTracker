/* ============================================================
   PEPTIDE TRACKER — All Modal Components
   Exposes: window.PT_Modals
     .AddEditModal    — add or edit a peptide
     .LogDoseModal    — log a dose taken
     .DeleteModal     — confirm peptide removal
     .HistoryModal    — view dose history for one peptide
   Deps: React, PT_Icons, PT_UTILS, PT_API, PT_PeptideCard
   ============================================================ */

(function() {
  var useState    = React.useState;
  var useEffect   = React.useEffect;
  var Icon        = window.PT_Icons.Icon;
  var U           = window.PT_UTILS;
  var API         = window.PT_API;
  var DoseCountdownBanner = window.PT_PeptideCard.DoseCountdownBanner;

  /* ── Shared: Modal shell ─────────────────────────────────── */
  // Props: title, onClose, children, footer, size ("" | "sm")
  function ModalShell(props) {
    var title    = props.title;
    var onClose  = props.onClose;
    var children = props.children;
    var footer   = props.footer;
    var size     = props.size || "";

    // Close on backdrop click
    function handleBackdrop(e) {
      if (e.target === e.currentTarget) onClose();
    }

    // Close on Escape key
    useEffect(function() {
      function onKey(e) { if (e.key === "Escape") onClose(); }
      document.addEventListener("keydown", onKey);
      return function() { document.removeEventListener("keydown", onKey); };
    }, [onClose]);

    return React.createElement(
      "div",
      { className: "modal-backdrop", onClick: handleBackdrop, role: "dialog",
        "aria-modal": "true", "aria-labelledby": "modal-title" },
      React.createElement(
        "div", { className: "modal " + (size === "sm" ? "modal-sm" : "") },

        /* Header */
        React.createElement(
          "div", { className: "modal-header" },
          React.createElement("h2", { className: "modal-title", id: "modal-title" }, title),
          React.createElement(
            "button",
            { className: "btn btn-icon btn-ghost", onClick: onClose, "aria-label": "Close modal" },
            React.createElement(Icon, { name: "x", size: 16 })
          )
        ),

        /* Body */
        React.createElement("div", { className: "modal-body" }, children),

        /* Footer */
        footer && React.createElement("div", { className: "modal-footer" }, footer)
      )
    );
  }

  /* ── Shared: form field helpers ──────────────────────────── */
  function FormGroup(props) {
    return React.createElement(
      "div", { className: "form-group" },
      React.createElement("label", { className: "form-label", htmlFor: props.id }, props.label),
      props.children,
      props.error && React.createElement("span", { className: "form-error", role: "alert" }, props.error),
      props.hint  && React.createElement("span", { className: "form-hint" }, props.hint)
    );
  }

  function TextInput(props) {
    return React.createElement("input", Object.assign({
      className: "form-input",
      id: props.id,
    }, props));
  }

  function NumberInput(props) {
    return React.createElement("input", Object.assign({
      className: "form-input",
      type: "number",
      id: props.id,
    }, props));
  }

  /* ── Spinner button label ────────────────────────────────── */
  function SpinLabel(props) {
    return React.createElement(
      React.Fragment, null,
      React.createElement(Icon, { name: "loader", size: 14, className: "spin" }),
      " " + props.label
    );
  }

  /* ══════════════════════════════════════════════════════════
     1. ADD / EDIT MODAL
     ══════════════════════════════════════════════════════════ */
  // Props: peptide (null = add mode), onSave, onClose, addToast
  function AddEditModal(props) {
    var peptide  = props.peptide;
    var onSave   = props.onSave;
    var onClose  = props.onClose;
    var addToast = props.addToast;
    var isEdit   = !!peptide;

    var initialForm = {
      name:          isEdit ? String(peptide.name || "")          : "",
      vialMg:        isEdit ? String(peptide.vialMg || "")        : "",
      doseMg:        isEdit ? String(peptide.doseMg || "")        : "",
      frequencyDays: isEdit ? String(peptide.frequencyDays || "") : "",
      remainingMg:   isEdit ? String(peptide.remainingMg || "")  : "",
      lastDose:      isEdit ? U.isoToDateInput(peptide.lastDose)  : "",
      notes:         isEdit ? String(peptide.notes || "")         : "",
    };

    var formState  = useState(initialForm);
    var form       = formState[0];
    var setForm    = formState[1];

    var errState   = useState({});
    var errors     = errState[0];
    var setErrors  = errState[1];

    var savingState = useState(false);
    var saving      = savingState[0];
    var setSaving   = savingState[1];

    function set(key, val) {
      setForm(function(prev) {
        var next = Object.assign({}, prev);
        next[key] = val;
        return next;
      });
    }

    /* Live calc preview */
    var vialNum  = parseFloat(form.vialMg);
    var doseNum  = parseFloat(form.doseMg);
    var freqNum  = parseFloat(form.frequencyDays);
    var showCalc = !isNaN(vialNum) && vialNum > 0 &&
                   !isNaN(doseNum) && doseNum > 0 &&
                   !isNaN(freqNum) && freqNum > 0;
    var totalDoses  = showCalc ? Math.floor(vialNum / doseNum) : 0;
    var totalDaysSup = showCalc ? Math.round(totalDoses * freqNum) : 0;

    function handleSubmit() {
      var errs = U.validatePeptideForm(form);
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setErrors({});
      setSaving(true);

      /* Build ISO lastDose from date input */
      var lastDoseISO = "";
      if (form.lastDose) {
        var parts = form.lastDose.split("-");
        if (parts.length === 3) {
          var d = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
            12, 0, 0
          );
          lastDoseISO = d.toISOString();
        }
      }

      var payload = {
        name:          form.name.trim(),
        vialMg:        form.vialMg,
        doseMg:        form.doseMg,
        frequencyDays: form.frequencyDays,
        remainingMg:   form.remainingMg !== "" ? form.remainingMg : form.vialMg,
        lastDose:      lastDoseISO,
        notes:         form.notes.trim(),
      };

      var apiCall = isEdit
        ? API.updatePeptide(Object.assign({ id: peptide.id }, payload))
        : API.addPeptide(payload);

      apiCall
        .then(function() {
          addToast(isEdit ? peptide.name + " updated" : form.name.trim() + " added", "success");
          onSave();
          onClose();
        })
        .catch(function(err) {
          addToast(err.message, "error");
          setSaving(false);
        });
    }

    /* Footer buttons */
    var footer = React.createElement(
      React.Fragment, null,
      React.createElement("button", { className: "btn btn-ghost", onClick: onClose, disabled: saving }, "Cancel"),
      React.createElement(
        "button",
        { className: "btn btn-primary", onClick: handleSubmit, disabled: saving },
        saving
          ? React.createElement(SpinLabel, { label: "Saving…" })
          : (isEdit ? "Save Changes" : "Add Peptide")
      )
    );

    return React.createElement(
      ModalShell,
      { title: isEdit ? "Edit — " + peptide.name : "Add Peptide", onClose: onClose, footer: footer },

      /* Name */
      React.createElement(
        FormGroup, { label: "Peptide Name *", id: "pt-name", error: errors.name },
        React.createElement(TextInput, {
          id: "pt-name",
          placeholder: "e.g. BPC-157, TB-500, GHK-Cu",
          value: form.name,
          onChange: function(e) { set("name", e.target.value); },
          autoFocus: true,
        })
      ),

      /* Vial + Dose */
      React.createElement(
        "div", { className: "form-row" },
        React.createElement(
          FormGroup, { label: "Vial Size (mg) *", id: "pt-vial", error: errors.vialMg },
          React.createElement(NumberInput, {
            id: "pt-vial", min: "0", step: "0.1", placeholder: "5",
            value: form.vialMg,
            onChange: function(e) { set("vialMg", e.target.value); },
          })
        ),
        React.createElement(
          FormGroup, { label: "Dose Per Injection (mg) *", id: "pt-dose", error: errors.doseMg },
          React.createElement(NumberInput, {
            id: "pt-dose", min: "0", step: "0.01", placeholder: "0.25",
            value: form.doseMg,
            onChange: function(e) { set("doseMg", e.target.value); },
          })
        )
      ),

      /* Frequency + Remaining */
      React.createElement(
        "div", { className: "form-row" },
        React.createElement(
          FormGroup, {
            label: "Frequency (every N days) *", id: "pt-freq",
            error: errors.frequencyDays,
            hint: "e.g. 1 = daily · 3 = every 3 days · 7 = weekly",
          },
          React.createElement(NumberInput, {
            id: "pt-freq", min: "0.5", step: "0.5", placeholder: "3",
            value: form.frequencyDays,
            onChange: function(e) { set("frequencyDays", e.target.value); },
          })
        ),
        React.createElement(
          FormGroup, {
            label: "Current Remaining (mg)", id: "pt-remaining",
            error: errors.remainingMg,
            hint: "Leave blank to default to full vial",
          },
          React.createElement(NumberInput, {
            id: "pt-remaining", min: "0", step: "0.01", placeholder: "Defaults to vial size",
            value: form.remainingMg,
            onChange: function(e) { set("remainingMg", e.target.value); },
          })
        )
      ),

      /* Last dose date */
      React.createElement(
        FormGroup, {
          label: "Last Dose Date", id: "pt-lastdose",
          hint: "Sets the starting point for your next-dose countdown",
        },
        React.createElement("input", {
          id: "pt-lastdose",
          className: "form-input",
          type: "date",
          value: form.lastDose,
          max: U.todayInputValue(),
          onChange: function(e) { set("lastDose", e.target.value); },
        })
      ),

      /* Notes */
      React.createElement(
        FormGroup, { label: "Notes", id: "pt-notes" },
        React.createElement("textarea", {
          id: "pt-notes",
          className: "form-textarea",
          rows: 2,
          placeholder: "Reconstitution notes, source, storage info…",
          value: form.notes,
          onChange: function(e) { set("notes", e.target.value); },
        })
      ),

      /* Live calc hint */
      showCalc && React.createElement(
        "div", { className: "form-calc-hint" },
        React.createElement("span", null, "💉 " + totalDoses + " total doses"),
        React.createElement("span", null, "📅 " + totalDaysSup + "-day supply")
      )
    );
  }

  /* ══════════════════════════════════════════════════════════
     2. LOG DOSE MODAL
     ══════════════════════════════════════════════════════════ */
  // Props: peptide, onSave, onClose, addToast
  function LogDoseModal(props) {
    var peptide  = props.peptide;
    var onSave   = props.onSave;
    var onClose  = props.onClose;
    var addToast = props.addToast;

    var doseState  = useState(String(peptide.doseMg || ""));
    var doseMg     = doseState[0];
    var setDoseMg  = doseState[1];

    var notesState = useState("");
    var notes      = notesState[0];
    var setNotes   = notesState[1];

    var savingState = useState(false);
    var saving      = savingState[0];
    var setSaving   = savingState[1];

    var doseNum    = parseFloat(doseMg) || 0;
    var remaining  = parseFloat(peptide.remainingMg) || 0;
    var afterDose  = Math.max(0, remaining - doseNum);
    var isLow      = afterDose < parseFloat(peptide.doseMg || 0);

    function handleLog() {
      if (!doseMg || isNaN(parseFloat(doseMg)) || parseFloat(doseMg) <= 0) {
        addToast("Enter a valid dose amount", "error");
        return;
      }
      setSaving(true);
      API.logDose({
        peptideId:   peptide.id,
        peptideName: peptide.name,
        doseMg:      doseMg,
        notes:       notes,
      })
        .then(function() {
          addToast(doseMg + "mg logged for " + peptide.name, "success");
          onSave();
          onClose();
        })
        .catch(function(err) {
          addToast(err.message, "error");
          setSaving(false);
        });
    }

    var footer = React.createElement(
      React.Fragment, null,
      React.createElement("button", { className: "btn btn-ghost", onClick: onClose, disabled: saving }, "Cancel"),
      React.createElement(
        "button",
        { className: "btn btn-primary", onClick: handleLog, disabled: saving },
        saving
          ? React.createElement(SpinLabel, { label: "Logging…" })
          : React.createElement(
              React.Fragment, null,
              React.createElement(Icon, { name: "syringe", size: 14 }),
              " Log Dose"
            )
      )
    );

    return React.createElement(
      ModalShell,
      { title: "Log Dose — " + peptide.name, onClose: onClose, footer: footer },

      /* Countdown banner */
      React.createElement(DoseCountdownBanner, { peptide: peptide }),

      /* Dose amount */
      React.createElement(
        FormGroup, {
          label: "Dose Amount (mg)", id: "ld-dose",
          hint: "Standard dose: " + U.fmtMg(peptide.doseMg),
        },
        React.createElement(NumberInput, {
          id: "ld-dose", min: "0", step: "0.01",
          placeholder: String(peptide.doseMg),
          value: doseMg,
          onChange: function(e) { setDoseMg(e.target.value); },
          autoFocus: true,
        })
      ),

      /* Notes */
      React.createElement(
        FormGroup, { label: "Notes (optional)", id: "ld-notes" },
        React.createElement(TextInput, {
          id: "ld-notes",
          placeholder: "Injection site, batch, etc.",
          value: notes,
          onChange: function(e) { setNotes(e.target.value); },
        })
      ),

      /* Before / after mini cards */
      React.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" } },
        /* Before */
        React.createElement(
          "div",
          { style: { background: "var(--color-surface-2)", border: "1px solid var(--color-border)",
                     borderRadius: "var(--radius-lg)", padding: "var(--space-3) var(--space-4)" } },
          React.createElement("div", { className: "kpi-label" }, "Current"),
          React.createElement(
            "div",
            { style: { fontSize: "var(--text-lg)", fontWeight: 700, fontVariantNumeric: "tabular-nums" } },
            U.fmtMg(remaining)
          )
        ),
        /* After */
        React.createElement(
          "div",
          { style: { background: "var(--color-surface-2)", border: "1px solid var(--color-border)",
                     borderRadius: "var(--radius-lg)", padding: "var(--space-3) var(--space-4)" } },
          React.createElement("div", { className: "kpi-label" }, "After This Dose"),
          React.createElement(
            "div",
            { style: { fontSize: "var(--text-lg)", fontWeight: 700, fontVariantNumeric: "tabular-nums",
                       color: isLow ? "var(--color-error)" : "var(--color-success)" } },
            U.fmtMg(afterDose)
          )
        )
      ),

      /* Low supply warning */
      isLow && React.createElement(
        "div",
        { className: "countdown-banner countdown-due" },
        React.createElement(Icon, { name: "alert", size: 14, style: { flexShrink: 0 } }),
        "Low supply after this dose — consider reordering"
      )
    );
  }

  /* ══════════════════════════════════════════════════════════
     3. DELETE CONFIRM MODAL
     ══════════════════════════════════════════════════════════ */
  // Props: peptide, onSave, onClose, addToast
  function DeleteModal(props) {
    var peptide  = props.peptide;
    var onSave   = props.onSave;
    var onClose  = props.onClose;
    var addToast = props.addToast;

    var deletingState = useState(false);
    var deleting      = deletingState[0];
    var setDeleting   = deletingState[1];

    function handleDelete() {
      setDeleting(true);
      API.deletePeptide(peptide.id)
        .then(function() {
          addToast(peptide.name + " removed", "success");
          onSave();
          onClose();
        })
        .catch(function(err) {
          addToast(err.message, "error");
          setDeleting(false);
        });
    }

    var footer = React.createElement(
      React.Fragment, null,
      React.createElement("button", { className: "btn btn-ghost", onClick: onClose, disabled: deleting }, "Cancel"),
      React.createElement(
        "button",
        { className: "btn btn-danger", onClick: handleDelete, disabled: deleting },
        deleting ? React.createElement(SpinLabel, { label: "Removing…" }) : "Remove Peptide"
      )
    );

    return React.createElement(
      ModalShell,
      { title: "Remove Peptide?", onClose: onClose, size: "sm", footer: footer },
      React.createElement(
        "p",
        { style: { fontSize: "var(--text-sm)", color: "var(--color-text-muted)", lineHeight: 1.6 } },
        "This will remove ",
        React.createElement("strong", null, peptide.name),
        " from your tracker. Your dose history will be preserved in the spreadsheet."
      )
    );
  }

  /* ══════════════════════════════════════════════════════════
     4. HISTORY MODAL
     ══════════════════════════════════════════════════════════ */
  // Props: peptide, onClose
  function HistoryModal(props) {
    var peptide  = props.peptide;
    var onClose  = props.onClose;

    var logsState   = useState([]);
    var logs        = logsState[0];
    var setLogs     = logsState[1];

    var loadingState = useState(true);
    var loading      = loadingState[0];
    var setLoading   = loadingState[1];

    var errState = useState(null);
    var loadErr  = errState[0];
    var setErr   = errState[1];

    useEffect(function() {
      API.getLogs({ peptideId: peptide.id, limit: 100 })
        .then(function(data) {
          setLogs(data.logs || []);
          setLoading(false);
        })
        .catch(function(err) {
          setErr(err.message);
          setLoading(false);
        });
    }, [peptide.id]);

    var footer = React.createElement(
      "button", { className: "btn btn-ghost", onClick: onClose }, "Close"
    );

    var bodyContent;
    if (loading) {
      bodyContent = React.createElement(
        "div", { style: { display: "flex", flexDirection: "column", gap: "var(--space-2)" } },
        [1, 2, 3, 4].map(function(i) {
          return React.createElement("div", {
            key: i, className: "skeleton",
            style: { height: 40, borderRadius: "var(--radius-md)" }
          });
        })
      );
    } else if (loadErr) {
      bodyContent = React.createElement(
        "div", { className: "countdown-banner countdown-due" },
        React.createElement(Icon, { name: "alert", size: 14, style: { flexShrink: 0 } }),
        "Failed to load history: " + loadErr
      );
    } else if (logs.length === 0) {
      bodyContent = React.createElement(
        "div", { className: "empty-state", style: { padding: "var(--space-10)" } },
        React.createElement(Icon, { name: "syringe", size: 32, style: { color: "var(--color-text-faint)", marginBottom: "var(--space-2)" } }),
        React.createElement("h3", null, "No doses logged yet"),
        React.createElement("p", null, "Use the Log Dose button to record your first dose.")
      );
    } else {
      bodyContent = React.createElement(
        "div", { className: "table-wrap" },
        React.createElement(
          "table",
          null,
          React.createElement(
            "thead", null,
            React.createElement(
              "tr", null,
              React.createElement("th", null, "Date & Time"),
              React.createElement("th", null, "Dose"),
              React.createElement("th", null, "Notes")
            )
          ),
          React.createElement(
            "tbody", null,
            logs.map(function(log) {
              return React.createElement(
                "tr", { key: log.logId },
                React.createElement(
                  "td",
                  { style: { color: "var(--color-text-muted)", whiteSpace: "nowrap" } },
                  U.formatDateTime(log.timestamp)
                ),
                React.createElement(
                  "td", null,
                  React.createElement(
                    "span", { className: "badge badge-blue mono" },
                    parseFloat(log.doseMg).toFixed(2) + "mg"
                  )
                ),
                React.createElement(
                  "td",
                  { style: { color: "var(--color-text-faint)", fontSize: "var(--text-xs)" } },
                  log.notes || "—"
                )
              );
            })
          )
        )
      );
    }

    return React.createElement(
      ModalShell,
      { title: "Dose History — " + peptide.name, onClose: onClose, footer: footer },
      bodyContent
    );
  }

  window.PT_Modals = {
    AddEditModal:  AddEditModal,
    LogDoseModal:  LogDoseModal,
    DeleteModal:   DeleteModal,
    HistoryModal:  HistoryModal,
  };
})();
