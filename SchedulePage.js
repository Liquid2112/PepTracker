/* ============================================================
   PEPTIDE TRACKER — Schedule Page  (28-day forward view)
   Exposes: window.PT_Pages.SchedulePage
   Deps: React, PT_Icons, PT_UTILS, PT_API, PT_Modals
   ============================================================ */

(function() {
  var useState  = React.useState;
  var useEffect = React.useEffect;
  var Icon      = window.PT_Icons.Icon;
  var U         = window.PT_UTILS;
  var API       = window.PT_API;
  var LogDoseModal = window.PT_Modals.LogDoseModal;

  /* ── Day card ────────────────────────────────────────────── */
  function DayCard(props) {
    var entry    = props.entry;   /* { date, peptides[] } */
    var onLog    = props.onLog;
    var date     = entry.date;
    var isToday  = (new Date().toDateString() === date.toDateString());

    var dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    var monNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    return React.createElement(
      "div", { className: "schedule-day" + (isToday ? " today" : "") },
      /* Date header */
      React.createElement(
        "div", { className: "schedule-day-header" },
        React.createElement(
          "div", { className: "schedule-date" },
          React.createElement("span", { className: "schedule-dow" },
            isToday ? "Today" : dayNames[date.getDay()]),
          React.createElement("span", { className: "schedule-dom" },
            monNames[date.getMonth()] + " " + date.getDate())
        ),
        React.createElement(
          "span", { className: "badge badge-blue" },
          entry.peptides.length + " dose" + (entry.peptides.length !== 1 ? "s" : "")
        )
      ),
      /* Peptide rows */
      React.createElement(
        "div", { className: "schedule-peptides" },
        entry.peptides.map(function(p) {
          return React.createElement(
            "div", { key: p.id, className: "schedule-peptide-row" },
            React.createElement(
              "div", { className: "schedule-peptide-name" },
              React.createElement(Icon, { name: "syringe", size: 12,
                style: { color: "var(--color-primary)", flexShrink: 0 } }),
              p.name
            ),
            React.createElement("div", { className: "schedule-peptide-dose" }, U.fmtMg(p.doseMg)),
            isToday && React.createElement(
              "button",
              { className: "btn btn-xs btn-primary",
                onClick: function() { onLog(p); },
                "aria-label": "Log dose for " + p.name },
              "Log"
            )
          );
        })
      )
    );
  }

  /* ── SchedulePage ────────────────────────────────────────── */
  function SchedulePage(props) {
    var addToast  = props.addToast;
    var pepState  = useState([]);
    var peptides  = pepState[0]; var setPeptides = pepState[1];
    var loadState = useState(true);
    var loading   = loadState[0]; var setLoading  = loadState[1];
    var errState  = useState(null);
    var error     = errState[0]; var setError     = errState[1];
    var modalState = useState(null);
    var logTarget  = modalState[0]; var setLogTarget = modalState[1];
    var windowState = useState(28);
    var dayWindow   = windowState[0]; var setDayWindow = windowState[1];

    function fetchPeptides() {
      setLoading(true); setError(null);
      API.getPeptides()
        .then(function(d) { setPeptides(d.peptides || []); setLoading(false); })
        .catch(function(e) { setError(e.message); setLoading(false); });
    }
    useEffect(function() { fetchPeptides(); }, []);

    var schedule = U.buildSchedule(peptides, dayWindow);

    /* Skeleton rows */
    function SkeletonRows() {
      return React.createElement(
        "div", { className: "schedule-list" },
        [1,2,3,4].map(function(i) {
          return React.createElement("div", { key: i, className: "schedule-day" },
            React.createElement("div", { className: "skeleton", style: { height: 70, borderRadius: "var(--radius-lg)" } })
          );
        })
      );
    }

    return React.createElement(
      "div", { className: "page-content" },

      /* Controls */
      React.createElement(
        "div", { className: "section-header" },
        React.createElement("div", null,
          React.createElement("h2", { className: "section-title" }, "Upcoming Schedule"),
          React.createElement("p", { style: { fontSize: "var(--text-xs)", color: "var(--color-text-muted)",
            marginTop: "var(--space-1)" } },
            schedule.length + " dose day" + (schedule.length !== 1 ? "s" : "") +
            " in the next " + dayWindow + " days")
        ),
        React.createElement(
          "div", { style: { display: "flex", gap: "var(--space-2)" } },
          [14, 28, 60].map(function(d) {
            return React.createElement("button", {
              key: d,
              className: "btn btn-sm " + (dayWindow === d ? "btn-primary" : "btn-ghost"),
              onClick: function() { setDayWindow(d); }
            }, d + "d");
          })
        )
      ),

      /* Body */
      loading
        ? React.createElement(SkeletonRows)
        : error
          ? React.createElement("div", { className: "countdown-banner countdown-due" },
              React.createElement(Icon, { name: "alert", size: 14, style: { flexShrink: 0 } }),
              "Failed to load schedule: " + error)
          : schedule.length === 0
            ? React.createElement("div", { className: "empty-state" },
                React.createElement(Icon, { name: "calendar", size: 36,
                  style: { color: "var(--color-text-faint)", marginBottom: "var(--space-3)" } }),
                React.createElement("h3", null, "No doses scheduled"),
                React.createElement("p", null,
                  "Add peptides with a last dose date to see your upcoming schedule."))
            : React.createElement("div", { className: "schedule-list" },
                schedule.map(function(entry, i) {
                  return React.createElement(DayCard, {
                    key: i, entry: entry,
                    onLog: function(p) { setLogTarget(p); }
                  });
                })),

      /* Log modal */
      logTarget && React.createElement(LogDoseModal, {
        peptide:  logTarget,
        onSave:   fetchPeptides,
        onClose:  function() { setLogTarget(null); },
        addToast: addToast,
      })
    );
  }

  if (!window.PT_Pages) window.PT_Pages = {};
  window.PT_Pages.SchedulePage = SchedulePage;
})();
