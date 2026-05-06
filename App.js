/* ============================================================
   PEPTIDE TRACKER — Root App + index.html entry point
   Exposes: window.PT_APP (for debugging)
   Deps: ALL prior files
   ============================================================ */

(function() {
  var useState  = React.useState;
  var Icon      = window.PT_Icons.Icon;
  var ToastContainer = window.PT_Toast.ToastContainer;
  var useToasts      = window.PT_Toast.useToasts;
  var Sidebar        = window.PT_Layout.Sidebar;
  var MobileOverlay  = window.PT_Layout.MobileOverlay;
  var Topbar         = window.PT_Layout.Topbar;
  var DashboardPage  = window.PT_Pages.DashboardPage;
  var SchedulePage   = window.PT_Pages.SchedulePage;
  var HistoryPage    = window.PT_Pages.HistoryPage;
  var SettingsPage   = window.PT_Pages.SettingsPage;
  var U              = window.PT_UTILS;

  var PAGE_TITLES = {
    dashboard: "Dashboard",
    schedule:  "Schedule",
    history:   "Dose History",
    settings:  "Settings",
  };

  function App() {
    var pageState    = useState("dashboard");
    var page         = pageState[0]; var setPage = pageState[1];
    var menuState    = useState(false);
    var menuOpen     = menuState[0]; var setMenuOpen = menuState[1];
    var themeState   = useState(
      document.documentElement.getAttribute("data-theme") || "light"
    );
    var theme        = themeState[0]; var setTheme = themeState[1];
    var loadingState = useState(false);
    var loading      = loadingState[0]; var setLoading = loadingState[1];

    var toastPack  = useToasts();
    var toasts     = toastPack.toasts;
    var addToast   = toastPack.addToast;

    /* Theme toggle */
    function toggleTheme() {
      var next = theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      setTheme(next);
    }

    /* Mobile menu */
    function handleNav(id) { setPage(id); setMenuOpen(false); }

    /* Overdue count for badge */
    var overdueCountState = useState(0);
    var overdueCount      = overdueCountState[0];
    var setOverdueCount   = overdueCountState[1];

    /* Refresh ref (Dashboard wires itself in) */
    var refreshRef = { current: null };

    function handleRefresh() {
      if (refreshRef.current) {
        setLoading(true);
        refreshRef.current();
        setTimeout(function() { setLoading(false); }, 1200);
      }
    }

    /* Page component */
    var pageEl = null;
    if (page === "dashboard") {
      pageEl = React.createElement(DashboardPage, {
        addToast:     addToast,
        onRefreshRef: refreshRef,
      });
    } else if (page === "schedule") {
      pageEl = React.createElement(SchedulePage, { addToast: addToast });
    } else if (page === "history") {
      pageEl = React.createElement(HistoryPage, { addToast: addToast });
    } else if (page === "settings") {
      pageEl = React.createElement(SettingsPage, { addToast: addToast });
    }

    return React.createElement(
      "div", { className: "app-shell" },

      /* Sidebar */
      React.createElement(Sidebar, {
        page:         page,
        onNav:        handleNav,
        isOpen:       menuOpen,
        overdueCount: overdueCount,
      }),
      React.createElement(MobileOverlay, {
        isOpen:  menuOpen,
        onClose: function() { setMenuOpen(false); },
      }),

      /* Main */
      React.createElement(
        "div", { className: "main-area" },
        React.createElement(Topbar, {
          title:         PAGE_TITLES[page] || "",
          theme:         theme,
          onThemeToggle: toggleTheme,
          onMenuClick:   function() { setMenuOpen(function(o) { return !o; }); },
          onRefresh:     handleRefresh,
          showRefresh:   page === "dashboard",
          loading:       loading,
        }),
        React.createElement("div", { className: "main-scroll" }, pageEl)
      ),

      /* Toast container */
      React.createElement(ToastContainer, { toasts: toasts })
    );
  }

  window.PT_APP = App;

  /* ── Bootstrap ───────────────────────────────────────────── */
  var root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(React.createElement(App));
})();
