/* ============================================================
   PEPTIDE TRACKER — History Page  (all-peptide dose log)
   Exposes: window.PT_Pages.HistoryPage
   Deps: React, PT_Icons, PT_UTILS, PT_API
   ============================================================ */

(function() {
  var useState  = React.useState;
  var useEffect = React.useEffect;
  var Icon      = window.PT_Icons.Icon;
  var U         = window.PT_UTILS;
  var API       = window.PT_API;

  function HistoryPage(props) {
    var addToast   = props.addToast;
    var logsState  = useState([]);
    var logs       = logsState[0];   var setLogs    = logsState[1];
    var loadState  = useState(true);
    var loading    = loadState[0];   var setLoading = loadState[1];
    var errState   = useState(null);
    var error      = errState[0];    var setError   = errState[1];
    var filterState = useState("all");
    var filter      = filterState[0]; var setFilter  = filterState[1];
    var limitState  = useState(100);
    var limit       = limitState[0];  var setLimit   = limitState[1];

    function fetchLogs() {
      setLoading(true); setError(null);
      API.getLogs({ limit: limit })
        .then(function(d) { setLogs(d.logs || []); setLoading(false); })
        .catch(function(e) { setError(e.message); setLoading(false); });
    }
    useEffect(function() { fetchLogs(); }, [limit]);

    /* Unique peptide names for filter dropdown */
    var names = [];
    logs.forEach(function(l) {
      if (l.peptideName && names.indexOf(l.peptideName) === -1) names.push(l.peptideName);
    });
    names.sort();

    var visible = filter === "all"
      ? logs
      : logs.filter(function(l) { return l.peptideName === filter; });

    /* CSV export */
    function handleExport() {
      var csv = U.logsToCSV(visible);
      U.downloadCSV(csv, "peptide-dose-history.csv");
      addToast("Exported " + visible.length + " records", "success");
    }

    /* Skeleton rows */
    function SkeletonTable() {
      return React.createElement(
        "div", { className: "table-wrap" },
        React.createElement("table", null,
          React.createElement("thead", null,
            React.createElement("tr", null,
              ["Date & Time","Peptide","Dose","Notes"].map(function(h) {
                return React.createElement("th", { key: h }, h);
              })
            )
          ),
          React.createElement("tbody", null,
            [1,2,3,4,5,6].map(function(i) {
              return React.createElement("tr", { key: i },
                [80,55,35,60].map(function(w, j) {
                  return React.createElement("td", { key: j },
                    React.createElement("div", { className: "skeleton",
                      style: { height: 14, width: w + "%", borderRadius: "var(--radius-sm)" } })
                  );
                })
              );
            })
          )
        )
      );
    }

    return React.createElement(
      "div", { className: "page-content" },

      /* Header */
      React.createElement("div", { className: "section-header" },
        React.createElement("div", null,
          React.createElement("h2", { className: "section-title" }, "Dose History"),
          React.createElement("p", {
            style: { fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }
          }, visible.length + " record" + (visible.length !== 1 ? "s" : ""))
        ),
        React.createElement("div", { style: { display: "flex", gap: "var(--space-2)", flexWrap: "wrap" } },
          /* Filter by peptide */
          React.createElement(
            "select",
            { className: "form-input",
              style: { width: "auto", fontSize: "var(--text-xs)", padding: "var(--space-1) var(--space-3)" },
              value: filter,
              onChange: function(e) { setFilter(e.target.value); } },
            React.createElement("option", { value: "all" }, "All peptides"),
            names.map(function(n) {
              return React.createElement("option", { key: n, value: n }, n);
            })
          ),
          /* Load more */
          React.createElement("button",
            { className: "btn btn-sm btn-ghost",
              onClick: function() { setLimit(function(l) { return l + 100; }); },
              disabled: loading },
            "Load more"
          ),
          /* Refresh */
          React.createElement("button",
            { className: "btn btn-sm btn-ghost",
              onClick: fetchLogs, disabled: loading,
              "aria-label": "Refresh" },
            React.createElement(Icon, { name: loading ? "loader" : "refresh", size: 14,
              className: loading ? "spin" : "" })
          ),
          /* Export */
          React.createElement("button",
            { className: "btn btn-sm btn-ghost",
              onClick: handleExport, disabled: loading || visible.length === 0 },
            React.createElement(Icon, { name: "download", size: 14 }),
            " Export CSV"
          )
        )
      ),

      /* Body */
      loading
        ? React.createElement(SkeletonTable)
        : error
          ? React.createElement("div", { className: "countdown-banner countdown-due",
              style: { marginTop: "var(--space-4)" } },
              React.createElement(Icon, { name: "alert", size: 14, style: { flexShrink: 0 } }),
              "Failed to load history: " + error)
          : visible.length === 0
            ? React.createElement("div", { className: "empty-state" },
                React.createElement(Icon, { name: "history", size: 36,
                  style: { color: "var(--color-text-faint)", marginBottom: "var(--space-3)" } }),
                React.createElement("h3", null, "No dose history"),
                React.createElement("p", null,
                  filter !== "all"
                    ? "No records found for " + filter + "."
                    : "Start logging doses from the Dashboard to see your history here."))
            : React.createElement("div", { className: "table-wrap" },
                React.createElement("table", null,
                  React.createElement("thead", null,
                    React.createElement("tr", null,
                      React.createElement("th", null, "Date & Time"),
                      React.createElement("th", null, "Peptide"),
                      React.createElement("th", null, "Dose"),
                      React.createElement("th", null, "Notes")
                    )
                  ),
                  React.createElement("tbody", null,
                    visible.map(function(log) {
                      return React.createElement("tr", { key: log.logId },
                        React.createElement("td", {
                          style: { color: "var(--color-text-muted)", whiteSpace: "nowrap",
                                   fontSize: "var(--text-xs)" } },
                          U.formatDateTime(log.timestamp)
                        ),
                        React.createElement("td", null,
                          React.createElement("span", { className: "peptide-name-pill" },
                            log.peptideName || "—")
                        ),
                        React.createElement("td", null,
                          React.createElement("span", { className: "badge badge-blue mono" },
                            parseFloat(log.doseMg).toFixed(2) + "mg")
                        ),
                        React.createElement("td", {
                          style: { color: "var(--color-text-faint)", fontSize: "var(--text-xs)" } },
                          log.notes || "—"
                        )
                      );
                    })
                  )
                )
              )
    );
  }

  if (!window.PT_Pages) window.PT_Pages = {};
  window.PT_Pages.HistoryPage = HistoryPage;
})();
