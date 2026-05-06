/* ============================================================
   PEPTIDE TRACKER — Toast Notification System
   Exposes:
     window.PT_Toast.useToasts()   — hook returning { toasts, addToast }
     window.PT_Toast.Container     — renders active toasts
   ============================================================ */

(function() {
  var useState    = React.useState;
  var useCallback = React.useCallback;
  var Icon        = window.PT_Icons.Icon;

  /* ── useToasts hook ──────────────────────────────────────── */
  function useToasts() {
    var state = useState([]);
    var toasts    = state[0];
    var setToasts = state[1];

    var addToast = useCallback(function(msg, type) {
      type = type || "info";
      var id = Date.now() + Math.random();
      setToasts(function(prev) {
        return prev.concat([{ id: id, msg: msg, type: type }]);
      });
      setTimeout(function() {
        setToasts(function(prev) {
          return prev.filter(function(t) { return t.id !== id; });
        });
      }, 3800);
    }, []);

    return { toasts: toasts, addToast: addToast };
  }

  /* ── Toast icon ──────────────────────────────────────────── */
  function toastIconName(type) {
    if (type === "success") return "check";
    if (type === "error")   return "x";
    if (type === "warning") return "alert";
    return "info";
  }

  function toastIconColor(type) {
    if (type === "success") return "var(--color-success)";
    if (type === "error")   return "var(--color-error)";
    if (type === "warning") return "var(--color-warning)";
    return "var(--color-primary)";
  }

  /* ── ToastContainer ──────────────────────────────────────── */
  function ToastContainer(props) {
    var toasts = props.toasts || [];

    return React.createElement(
      "div",
      {
        className: "toast-container",
        role: "alert",
        "aria-live": "polite",
        "aria-atomic": "false",
      },
      toasts.map(function(t) {
        return React.createElement(
          "div",
          {
            key: t.id,
            className: "toast toast-" + t.type,
          },
          React.createElement(Icon, {
            name:  toastIconName(t.type),
            size:  15,
            color: toastIconColor(t.type),
            style: { flexShrink: 0 },
          }),
          React.createElement("span", null, t.msg)
        );
      })
    );
  }

  window.PT_Toast = {
    useToasts:      useToasts,
    ToastContainer: ToastContainer,
  };
})();
