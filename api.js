/* ============================================================
   PEPTIDE TRACKER — API Layer
   All Google Apps Script fetch calls live here.
   Exposed on window.PT_API for use by all components.

   Every call uses GET + ?action=... to avoid CORS preflight.
   ============================================================ */

(function() {

  /* ── Core fetch ──────────────────────────────────────────── */

  function call(action, params) {
    var url = window.PT_SCRIPT_URL;
    if (!url || url === "https://script.google.com/macros/s/AKfycbzbYbNPvm1QoM5i_cU_2yqBc-s197o1RzqPOGcXXN_OAWgPq4xTSsX-y8n-ddKdgDti/exec") {
      return Promise.reject(new Error("Backend URL not configured. Go to Settings."));
    }

    var u = new URL(url);
    u.searchParams.set("action", action);

    if (params) {
      Object.keys(params).forEach(function(k) {
        var v = params[k];
        if (v !== undefined && v !== null && v !== "") {
          u.searchParams.set(k, String(v));
        }
      });
    }

    return fetch(u.toString())
      .then(function(res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function(data) {
        if (!data.success) throw new Error(data.error || "Unknown API error");
        return data;
      });
  }

  /* ── Endpoints ───────────────────────────────────────────── */

  // Test the backend is alive
  // Returns: { success, message, ts, sheets }
  function ping() {
    return call("ping");
  }

  // Fetch all active peptides
  // Returns: { success, peptides: [] }
  function getPeptides() {
    return call("getPeptides");
  }

  // Add a new peptide
  // Required: name, vialMg, doseMg, frequencyDays
  // Optional: remainingMg, lastDose (ISO string), notes
  // Returns: { success, id, message }
  function addPeptide(params) {
    return call("addPeptide", params);
  }

  // Update a peptide (partial — only send changed fields)
  // Required: id
  // Optional: name, vialMg, doseMg, frequencyDays, remainingMg, lastDose, notes
  // Returns: { success, message }
  function updatePeptide(params) {
    return call("updatePeptide", params);
  }

  // Soft-delete a peptide (sets active = false)
  // Required: id
  // Returns: { success, message }
  function deletePeptide(id) {
    return call("deletePeptide", { id: id });
  }

  // Log a dose taken — auto-decrements remainingMg, sets lastDose
  // Required: peptideId, doseMg
  // Optional: peptideName, notes
  // Returns: { success, logId, message }
  function logDose(params) {
    return call("logDose", params);
  }

  // Fetch dose logs
  // Optional: peptideId (filter by peptide), limit (default 100)
  // Returns: { success, logs: [] }
  function getLogs(params) {
    return call("getLogs", params || {});
  }

  /* ── Expose on window ────────────────────────────────────── */
  window.PT_API = {
    ping:          ping,
    getPeptides:   getPeptides,
    addPeptide:    addPeptide,
    updatePeptide: updatePeptide,
    deletePeptide: deletePeptide,
    logDose:       logDose,
    getLogs:       getLogs,
  };

})();
