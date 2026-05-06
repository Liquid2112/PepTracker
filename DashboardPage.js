/* ============================================================
   PEPTIDE TRACKER — Dashboard Page
   Exposes: window.PT_Pages.DashboardPage
   Deps: React, PT_Icons, PT_UTILS, PT_API, PT_PeptideCard, PT_Modals
   ============================================================ */

(function() {
  var useState   = React.useState;
  var useEffect  = React.useEffect;
  var Icon       = window.PT_Icons.Icon;
  var U          = window.PT_UTILS;
  var API        = window.PT_API;
  var PeptideCard         = window.PT_PeptideCard.PeptideCard;
  var PeptideCardSkeleton = window.PT_PeptideCard.PeptideCardSkeleton;
  var AddEditModal = window.PT_Modals.AddEditModal;
  var LogDoseModal = window.PT_Modals.LogDoseModal;
  var DeleteModal  = window.PT_Modals.DeleteModal;
  var HistoryModal = window.PT_Modals.HistoryModal;

  function KpiCard(props) {
    return React.createElement(
      "div", { className: "kpi-card" },
      React.createElement(
        "div", { style: { display:"flex", alignItems:"flex-start", justifyContent:"space-between" } },
        React.createElement("div", { className: "kpi-label" }, props.label),
        React.createElement(Icon, { name: props.icon, size: 15,
          style: { color: props.iconColor || "var(--color-text-faint)", marginTop: 2 } })
      ),
      React.createElement("div", { className: "kpi-value", style: props.valueStyle || {} }, props.value),
      props.sub && React.createElement("div", { className: "kpi-sub" }, props.sub)
    );
  }

  function OverdueBanner(props) {
    if (!props.overdue || props.overdue.length === 0) return null;
    return React.createElement(
      "div", { className: "overdue-banner", role: "alert" },
      React.createElement(Icon, { name: "alert", size: 15, style: { flexShrink: 0 } }),
      React.createElement("div", null,
        React.createElement("strong", null,
          props.overdue.length + " peptide" + (props.overdue.length !== 1 ? "s" : "") + " overdue:"
        ),
        " " + props.overdue.map(function(p) { return p.name; }).join(", ")
      )
    );
  }

  function EmptyState(props) {
    return React.createElement(
      "div", { className: "empty-state" },
      React.createElement(Icon, { name: "flask", size: 40,
        style: { color: "var(--color-text-faint)", marginBottom: "var(--space-3)" } }),
      React.createElement("h3", null, "No peptides tracked yet"),
      React.createElement("p", null,
        "Add your first peptide to start tracking doses, supply levels, and schedules."),
      React.createElement("button", { className: "btn btn-primary", onClick: props.onAdd },
        React.createElement(Icon, { name: "plus", size: 14 }), " Add Peptide")
    );
  }

  function ErrorState(props) {
    return React.createElement(
      "div", { className: "empty-state" },
      React.createElement(Icon, { name: "alert", size: 36,
        style: { color: "var(--color-error)", marginBottom: "var(--space-3)" } }),
      React.createElement("h3", null, "Failed to load peptides"),
      React.createElement("p", null, props.message),
      React.createElement("button", { className: "btn btn-ghost", onClick: props.onRetry },
        React.createElement(Icon, { name: "refresh", size: 14 }), " Retry")
    );
  }

  function DashboardPage(props) {
    var addToast     = props.addToast;
    var pepState     = useState([]);
    var peptides     = pepState[0];  var setPeptides  = pepState[1];
    var loadState    = useState(true);
    var loading      = loadState[0]; var setLoading   = loadState[1];
    var errState     = useState(null);
    var loadError    = errState[0];  var setLoadError  = errState[1];
    var modalState   = useState(null);
    var modal        = modalState[0]; var setModal     = modalState[1];

    function fetchPeptides() {
      setLoading(true); setLoadError(null);
      API.getPeptides()
        .then(function(data) { setPeptides(data.peptides || []); setLoading(false); })
        .catch(function(err) { setLoadError(err.message); setLoading(false); });
    }
    useEffect(function() { fetchPeptides(); }, []);
    useEffect(function() {
      if (props.onRefreshRef) props.onRefreshRef.current = fetchPeptides;
    }, []);

    var overdue    = U.getOverdue(peptides);
    var totalDoses = peptides.reduce(function(s, p) { return s + U.dosesLeft(p); }, 0);
    var critLow    = peptides.filter(function(p) { return U.pctRemaining(p) < 15; }).length;

    var sorted = peptides.slice().sort(function(a, b) {
      var da = U.daysUntilDose(a), db = U.daysUntilDose(b);
      if (da === null && db === null) return 0;
      if (da === null) return 1; if (db === null) return -1;
      return da - db;
    });

    return React.createElement(
      "div", { className: "page-content" },
      React.createElement(OverdueBanner, { overdue: overdue }),

      /* KPIs */
      React.createElement("div", { className: "kpi-row" },
        React.createElement(KpiCard, { label: "Peptides Tracked", icon: "flask",
          value: loading ? "—" : peptides.length, iconColor: "var(--color-primary)" }),
        React.createElement(KpiCard, { label: "Overdue Doses", icon: "alert",
          value: loading ? "—" : overdue.length,
          valueStyle: overdue.length > 0 ? { color: "var(--color-error)" } : {},
          iconColor: overdue.length > 0 ? "var(--color-error)" : "var(--color-text-faint)",
          sub: overdue.length > 0 ? "Needs attention" : "All on schedule" }),
        React.createElement(KpiCard, { label: "Total Doses Left", icon: "droplet",
          value: loading ? "—" : totalDoses, iconColor: "var(--color-primary)" }),
        React.createElement(KpiCard, { label: "Critically Low", icon: "alert",
          value: loading ? "—" : critLow,
          valueStyle: critLow > 0 ? { color: "var(--color-warning)" } : {},
          sub: critLow > 0 ? "< 15% remaining" : "All well stocked" })
      ),

      /* Section header */
      React.createElement("div", { className: "section-header" },
        React.createElement("h2", { className: "section-title" }, "Your Peptides"),
        !loading && !loadError && React.createElement("button",
          { className: "btn btn-primary btn-sm",
            onClick: function() { setModal({ type: "add" }); } },
          React.createElement(Icon, { name: "plus", size: 14 }), " Add Peptide")
      ),

      /* Grid */
      loading
        ? React.createElement("div", { className: "peptide-grid" },
            [1,2,3].map(function(i) { return React.createElement(PeptideCardSkeleton, { key: i }); }))
        : loadError
          ? React.createElement(ErrorState, { message: loadError, onRetry: fetchPeptides })
          : sorted.length === 0
            ? React.createElement(EmptyState, { onAdd: function() { setModal({ type: "add" }); } })
            : React.createElement("div", { className: "peptide-grid" },
                sorted.map(function(p) {
                  return React.createElement(PeptideCard, {
                    key: p.id, peptide: p,
                    onEdit:    function(x) { setModal({ type: "edit",    peptide: x }); },
                    onDelete:  function(x) { setModal({ type: "delete",  peptide: x }); },
                    onLog:     function(x) { setModal({ type: "log",     peptide: x }); },
                    onHistory: function(x) { setModal({ type: "history", peptide: x }); },
                  });
                })),

      /* Modals */
      (modal && modal.type === "add") && React.createElement(AddEditModal,
        { peptide: null, onSave: fetchPeptides,
          onClose: function() { setModal(null); }, addToast: addToast }),
      (modal && modal.type === "edit") && React.createElement(AddEditModal,
        { peptide: modal.peptide, onSave: fetchPeptides,
          onClose: function() { setModal(null); }, addToast: addToast }),
      (modal && modal.type === "log") && React.createElement(LogDoseModal,
        { peptide: modal.peptide, onSave: fetchPeptides,
          onClose: function() { setModal(null); }, addToast: addToast }),
      (modal && modal.type === "delete") && React.createElement(DeleteModal,
        { peptide: modal.peptide, onSave: fetchPeptides,
          onClose: function() { setModal(null); }, addToast: addToast }),
      (modal && modal.type === "history") && React.createElement(HistoryModal,
        { peptide: modal.peptide, onClose: function() { setModal(null); } })
    );
  }

  if (!window.PT_Pages) window.PT_Pages = {};
  window.PT_Pages.DashboardPage = DashboardPage;
})();
