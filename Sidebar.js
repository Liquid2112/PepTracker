/* ============================================================
   PEPTIDE TRACKER — Sidebar + Topbar Components
   Exposes:
     window.PT_Layout.Sidebar   — navigation sidebar
     window.PT_Layout.Topbar    — top header bar
   ============================================================ */

(function() {
  var Icon = window.PT_Icons.Icon;

  /* ── Logo mark SVG ───────────────────────────────────────── */
  function LogoMark() {
    return React.createElement(
      "div", { className: "sidebar-logo-mark", "aria-hidden": "true" },
      React.createElement(
        "svg",
        { width:18, height:18, viewBox:"0 0 24 24", fill:"none",
          stroke:"white", strokeWidth:"2.5", strokeLinecap:"round", strokeLinejoin:"round" },
        React.createElement("path", { d:"m18 2 4 4" }),
        React.createElement("path", { d:"m17 7 3-3" }),
        React.createElement("path", { d:"M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" }),
        React.createElement("path", { d:"m9 11 4 4" }),
        React.createElement("path", { d:"m5 19-3 3" }),
        React.createElement("path", { d:"m14 4 6 6" })
      )
    );
  }

  /* ── Nav items config ────────────────────────────────────── */
  var NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard",    icon: "home"     },
    { id: "schedule",  label: "Schedule",     icon: "calendar" },
    { id: "history",   label: "Dose History", icon: "history"  },
    { id: "settings",  label: "Settings",     icon: "settings" },
  ];

  /* ── Sidebar ─────────────────────────────────────────────── */
  // Props: page, onNav, isOpen, overdueCount
  function Sidebar(props) {
    var page         = props.page;
    var onNav        = props.onNav;
    var isOpen       = props.isOpen;
    var overdueCount = props.overdueCount || 0;

    var sidebarClass = "sidebar" + (isOpen ? " open" : "");

    return React.createElement(
      "nav",
      { className: sidebarClass, "aria-label": "Main navigation" },

      /* Logo */
      React.createElement(
        "div", { className: "sidebar-logo" },
        React.createElement(LogoMark),
        React.createElement(
          "span", { className: "sidebar-logo-text" },
          "Peptide",
          React.createElement("span", null, "Track")
        )
      ),

      /* Nav */
      React.createElement(
        "div", { className: "sidebar-nav" },
        React.createElement("div", { className: "nav-section-label" }, "Tracker"),
        NAV_ITEMS.map(function(item) {
          var isActive = page === item.id;
          var showBadge = item.id === "dashboard" && overdueCount > 0;

          return React.createElement(
            "button",
            {
              key:       item.id,
              className: "nav-item" + (isActive ? " active" : ""),
              onClick:   function() { onNav(item.id); },
              "aria-current": isActive ? "page" : undefined,
            },
            React.createElement(Icon, { name: item.icon, size: 16 }),
            item.label,
            showBadge && React.createElement(
              "span", { className: "nav-badge", "aria-label": overdueCount + " overdue" },
              overdueCount
            )
          );
        })
      ),

      /* Footer */
      React.createElement(
        "div", { className: "sidebar-footer" },
        "PeptideTrack v2.0",
        React.createElement("br"),
        "Google Sheets backend"
      )
    );
  }

  /* ── Mobile overlay ──────────────────────────────────────── */
  // Props: isOpen, onClose
  function MobileOverlay(props) {
    if (!props.isOpen) return null;
    return React.createElement("div", {
      className: "mobile-overlay",
      onClick:   props.onClose,
      "aria-hidden": "true",
    });
  }

  /* ── Topbar ──────────────────────────────────────────────── */
  // Props: title, theme, onThemeToggle, onMenuClick, onRefresh, showRefresh, loading
  function Topbar(props) {
    var title          = props.title        || "Dashboard";
    var theme          = props.theme        || "light";
    var onThemeToggle  = props.onThemeToggle;
    var onMenuClick    = props.onMenuClick;
    var onRefresh      = props.onRefresh;
    var showRefresh    = props.showRefresh;
    var loading        = props.loading;

    return React.createElement(
      "header", { className: "topbar" },

      /* Left: hamburger + title */
      React.createElement(
        "div", { className: "topbar-left" },
        React.createElement(
          "button",
          {
            className: "btn btn-icon btn-ghost mobile-menu-btn",
            onClick:   onMenuClick,
            "aria-label": "Open navigation menu",
          },
          React.createElement(Icon, { name: "menu", size: 18 })
        ),
        React.createElement("h1", { className: "topbar-title" }, title)
      ),

      /* Right: refresh + theme toggle */
      React.createElement(
        "div", { className: "topbar-actions" },
        showRefresh && React.createElement(
          "button",
          {
            className: "btn btn-sm btn-ghost",
            onClick:   onRefresh,
            disabled:  loading,
            "aria-label": "Refresh data",
          },
          React.createElement(Icon, {
            name:      loading ? "loader" : "refresh",
            size:      14,
            className: loading ? "spin" : "",
          }),
          loading ? "Loading…" : "Refresh"
        ),
        React.createElement(
          "button",
          {
            className: "theme-toggle",
            onClick:   onThemeToggle,
            "aria-label": "Switch to " + (theme === "dark" ? "light" : "dark") + " mode",
          },
          React.createElement(Icon, {
            name: theme === "dark" ? "sun" : "moon",
            size: 15,
          })
        )
      )
    );
  }

  window.PT_Layout = {
    Sidebar:       Sidebar,
    MobileOverlay: MobileOverlay,
    Topbar:        Topbar,
  };
})();
