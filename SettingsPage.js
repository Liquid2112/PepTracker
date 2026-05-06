/* ============================================================
   PEPTIDE TRACKER — Settings Page
   Exposes: window.PT_Pages.SettingsPage
   Deps: React, PT_Icons, PT_API
   ============================================================ */

(function() {
  var useState  = React.useState;
  var useEffect = React.useEffect;
  var Icon      = window.PT_Icons.Icon;
  var API       = window.PT_API;

  /* ── Step block ──────────────────────────────────────────── */
  function Step(props) {
    return React.createElement(
      "div", { className: "setup-step" },
      React.createElement("div", { className: "setup-step-num" }, props.num),
      React.createElement("div", { className: "setup-step-body" },
        React.createElement("div", { className: "setup-step-title" }, props.title),
        props.children
      )
    );
  }

  /* ── SettingsPage ────────────────────────────────────────── */
  function SettingsPage(props) {
    var addToast    = props.addToast;

    var urlState    = useState(window.PT_SCRIPT_URL || "");
    var url         = urlState[0]; var setUrl = urlState[1];
    var testState   = useState(null);   /* null | "testing" | "ok" | "error" */
    var testStatus  = testState[0]; var setTestStatus = testState[1];
    var testMsg     = useState("");
    var testMessage = testMsg[0]; var setTestMessage = testMsg[1];

    /* Keep local input in sync with global on load */
    useEffect(function() {
      setUrl(window.PT_SCRIPT_URL && window.PT_SCRIPT_URL !== "YOUR_APPS_SCRIPT_URL_HERE"
        ? window.PT_SCRIPT_URL : "");
    }, []);

    function handleSave() {
      var trimmed = url.trim();
      if (!trimmed) { addToast("Paste your Apps Script URL first", "error"); return; }
      window.PT_SCRIPT_URL = trimmed;
      addToast("Backend URL saved for this session", "success");
    }

    function handleTest() {
      var trimmed = url.trim();
      if (!trimmed) { addToast("Save a URL first", "error"); return; }
      window.PT_SCRIPT_URL = trimmed;
      setTestStatus("testing"); setTestMessage("");
      API.ping()
        .then(function(d) {
          setTestStatus("ok");
          setTestMessage(d.message || "Connected — sheets: " + (d.sheets || []).join(", "));
          addToast("Backend connected", "success");
        })
        .catch(function(e) {
          setTestStatus("error");
          setTestMessage(e.message);
          addToast("Connection failed: " + e.message, "error");
        });
    }

    var testBannerCls = testStatus === "ok"
      ? "countdown-banner countdown-ok"
      : testStatus === "error"
        ? "countdown-banner countdown-due"
        : "countdown-banner countdown-none";

    return React.createElement(
      "div", { className: "page-content" },
      React.createElement("h2", { className: "section-title" }, "Settings & Setup"),

      /* ── Backend URL card ── */
      React.createElement(
        "div", { className: "settings-card" },
        React.createElement("h3", { className: "settings-card-title" },
          React.createElement(Icon, { name: "link", size: 15 }),
          " Google Apps Script URL"
        ),
        React.createElement("p", {
          style: { fontSize: "var(--text-sm)", color: "var(--color-text-muted)",
                   marginBottom: "var(--space-4)", lineHeight: 1.6 }
        }, "Paste your deployed Web App URL here. The app stores it in memory for this session — re-enter it each visit, or pin this tab."),
        React.createElement("div", { style: { display: "flex", gap: "var(--space-2)" } },
          React.createElement("input", {
            className: "form-input",
            type: "url",
            placeholder: "https://script.google.com/macros/s/…/exec",
            value: url,
            onChange: function(e) { setUrl(e.target.value); setTestStatus(null); },
            style: { flex: 1, fontFamily: "var(--font-mono, monospace)", fontSize: "var(--text-xs)" },
            "aria-label": "Apps Script Web App URL",
          }),
          React.createElement("button",
            { className: "btn btn-primary", onClick: handleSave }, "Save"),
          React.createElement("button",
            { className: "btn btn-ghost", onClick: handleTest,
              disabled: testStatus === "testing" },
            testStatus === "testing"
              ? React.createElement(Icon, { name: "loader", size: 14, className: "spin" })
              : React.createElement(Icon, { name: "refresh", size: 14 }),
            " Test"
          )
        ),
        testStatus && testMessage && React.createElement(
          "div", { className: testBannerCls, style: { marginTop: "var(--space-3)" } },
          React.createElement(Icon, {
            name: testStatus === "ok" ? "check" : testStatus === "error" ? "alert" : "loader",
            size: 14, style: { flexShrink: 0 },
            className: testStatus === "testing" ? "spin" : ""
          }),
          testMessage
        )
      ),

      /* ── Setup guide ── */
      React.createElement(
        "div", { className: "settings-card" },
        React.createElement("h3", { className: "settings-card-title" },
          React.createElement(Icon, { name: "info", size: 15 }),
          " First-Time Setup Guide"
        ),
        React.createElement(Step, { num: "1", title: "Copy the Google Sheet template" },
          React.createElement("p", null,
            "Create a new Google Sheet. Add two tabs named exactly ",
            React.createElement("code", null, "Peptides"),
            " and ",
            React.createElement("code", null, "Logs"),
            "."
          ),
          React.createElement("p", { style: { marginTop: "var(--space-2)" } },
            React.createElement("strong", null, "Peptides columns (row 1):"),
            " id, name, vialMg, doseMg, frequencyDays, remainingMg, lastDose, notes, active"
          ),
          React.createElement("p", { style: { marginTop: "var(--space-1)" } },
            React.createElement("strong", null, "Logs columns (row 1):"),
            " logId, peptideId, peptideName, doseMg, timestamp, notes"
          )
        ),
        React.createElement(Step, { num: "2", title: "Add the Apps Script backend" },
          React.createElement("p", null,
            "In your Sheet: ",
            React.createElement("strong", null, "Extensions → Apps Script"),
            ". Paste the provided ",
            React.createElement("code", null, "Code.gs"),
            " file and click Save."
          )
        ),
        React.createElement(Step, { num: "3", title: "Deploy as a Web App" },
          React.createElement("p", null, "Click ",
            React.createElement("strong", null, "Deploy → New deployment"),
            ". Set:",
            React.createElement("br"),
            "• Type: Web app",
            React.createElement("br"),
            "• Execute as: Me",
            React.createElement("br"),
            "• Who has access: Anyone"
          ),
          React.createElement("p", { style: { marginTop: "var(--space-2)" } },
            "Click Deploy, authorize, and copy the Web App URL."
          )
        ),
        React.createElement(Step, { num: "4", title: "Paste the URL above and test" },
          React.createElement("p", null,
            "Paste the Web App URL in the field above, click Save, then Test Connection. " +
            "A green banner confirms your backend is live.")
        )
      ),

      /* ── About card ── */
      React.createElement(
        "div", { className: "settings-card" },
        React.createElement("h3", { className: "settings-card-title" },
          React.createElement(Icon, { name: "flask", size: 15 }),
          " About PeptideTrack"
        ),
        React.createElement("p", {
          style: { fontSize: "var(--text-sm)", color: "var(--color-text-muted)", lineHeight: 1.7 }
        },
          "PeptideTrack is a static web app — all data lives in your own Google Sheet. " +
          "No accounts, no subscriptions, no third-party servers. " +
          "Your peptide and dosing data never leaves your Google account."
        ),
        React.createElement("p", {
          style: { fontSize: "var(--text-xs)", color: "var(--color-text-faint)",
                   marginTop: "var(--space-3)" }
        }, "v2.0 · Built with React 18 · Google Apps Script backend")
      )
    );
  }

  if (!window.PT_Pages) window.PT_Pages = {};
  window.PT_Pages.SettingsPage = SettingsPage;
})();
