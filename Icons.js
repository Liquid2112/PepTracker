/* ============================================================
   PEPTIDE TRACKER — Icon Library
   SVG icons exposed as a React component on window.PT_Icons
   Usage: <PT_Icons.Icon name="flask" size={16} />
   ============================================================ */

(function() {
  var Icon = function(props) {
    var name  = props.name;
    var size  = props.size  || 16;
    var color = props.color || "currentColor";
    var style = props.style || {};
    var cls   = props.className || "";

    var paths = {
      home:     React.createElement(React.Fragment, null,
                  React.createElement("path", {d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),
                  React.createElement("polyline", {points:"9 22 9 12 15 12 15 22"})
                ),
      flask:    React.createElement(React.Fragment, null,
                  React.createElement("path", {d:"M9 3h6v8l3.5 6A2 2 0 0 1 17 20H7a2 2 0 0 1-1.5-3L9 11V3z"}),
                  React.createElement("line", {x1:"6",y1:"3",x2:"18",y2:"3"})
                ),
      plus:     React.createElement(React.Fragment, null,
                  React.createElement("line", {x1:"12",y1:"5",x2:"12",y2:"19"}),
                  React.createElement("line", {x1:"5",y1:"12",x2:"19",y2:"12"})
                ),
      edit:     React.createElement(React.Fragment, null,
                  React.createElement("path", {d:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"}),
                  React.createElement("path", {d:"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"})
                ),
      trash:    React.createElement(React.Fragment, null,
                  React.createElement("polyline", {points:"3 6 5 6 21 6"}),
                  React.createElement("path", {d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"})
                ),
      check:    React.createElement("polyline", {points:"20 6 9 12 4 10"}),
      x:        React.createElement(React.Fragment, null,
                  React.createElement("line", {x1:"18",y1:"6",x2:"6",y2:"18"}),
                  React.createElement("line", {x1:"6",y1:"6",x2:"18",y2:"18"})
                ),
      syringe:  React.createElement(React.Fragment, null,
                  React.createElement("path", {d:"m18 2 4 4"}),
                  React.createElement("path", {d:"m17 7 3-3"}),
                  React.createElement("path", {d:"M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"}),
                  React.createElement("path", {d:"m9 11 4 4"}),
                  React.createElement("path", {d:"m5 19-3 3"}),
                  React.createElement("path", {d:"m14 4 6 6"})
                ),
      calendar: React.createElement(React.Fragment, null,
                  React.createElement("rect", {x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),
                  React.createElement("line", {x1:"16",y1:"2",x2:"16",y2:"6"}),
                  React.createElement("line", {x1:"8",y1:"2",x2:"8",y2:"6"}),
                  React.createElement("line", {x1:"3",y1:"10",x2:"21",y2:"10"})
                ),
      history:  React.createElement(React.Fragment, null,
                  React.createElement("path", {d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}),
                  React.createElement("path", {d:"M3 3v5h5"}),
                  React.createElement("path", {d:"M12 7v5l4 2"})
                ),
      settings: React.createElement(React.Fragment, null,
                  React.createElement("circle", {cx:"12",cy:"12",r:"3"}),
                  React.createElement("path", {d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"})
                ),
      alert:    React.createElement(React.Fragment, null,
                  React.createElement("path", {d:"M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),
                  React.createElement("line", {x1:"12",y1:"9",x2:"12",y2:"13"}),
                  React.createElement("line", {x1:"12",y1:"17",x2:"12.01",y2:"17"})
                ),
      sun:      React.createElement(React.Fragment, null,
                  React.createElement("circle", {cx:"12",cy:"12",r:"5"}),
                  React.createElement("path", {d:"M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"})
                ),
      moon:     React.createElement("path", {d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"}),
      loader:   React.createElement("path", {d:"M21 12a9 9 0 1 1-6.219-8.56"}),
      menu:     React.createElement(React.Fragment, null,
                  React.createElement("line", {x1:"3",y1:"6",x2:"21",y2:"6"}),
                  React.createElement("line", {x1:"3",y1:"12",x2:"21",y2:"12"}),
                  React.createElement("line", {x1:"3",y1:"18",x2:"21",y2:"18"})
                ),
      info:     React.createElement(React.Fragment, null,
                  React.createElement("circle", {cx:"12",cy:"12",r:"10"}),
                  React.createElement("path", {d:"M12 16v-4M12 8h.01"})
                ),
      download: React.createElement(React.Fragment, null,
                  React.createElement("path", {d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}),
                  React.createElement("polyline", {points:"7 10 12 15 17 10"}),
                  React.createElement("line", {x1:"12",y1:"15",x2:"12",y2:"3"})
                ),
      droplet:  React.createElement("path", {d:"M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"}),
      refresh:  React.createElement(React.Fragment, null,
                  React.createElement("polyline", {points:"23 4 23 10 17 10"}),
                  React.createElement("polyline", {points:"1 20 1 14 7 14"}),
                  React.createElement("path", {d:"M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"})
                ),
      link:     React.createElement(React.Fragment, null,
                  React.createElement("path", {d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"}),
                  React.createElement("path", {d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"})
                ),
      "chevron-right": React.createElement("polyline", {points:"9 18 15 12 9 6"}),
      "chevron-down":  React.createElement("polyline", {points:"6 9 12 15 18 9"}),
    };

    var content = paths[name];
    if (!content) {
      // Fallback: question mark circle
      content = React.createElement(React.Fragment, null,
        React.createElement("circle", {cx:"12",cy:"12",r:"10"}),
        React.createElement("path", {d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"}),
        React.createElement("line", {x1:"12",y1:"17",x2:"12.01",y2:"17"})
      );
    }

    return React.createElement(
      "svg",
      {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
        style: style,
        className: cls,
      },
      content
    );
  };

  window.PT_Icons = { Icon: Icon };
})();
