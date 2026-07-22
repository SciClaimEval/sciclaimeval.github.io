document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".results-table").forEach(function (table) {
    var openRow = null;

    function openDetail(row) {
      var wrapper = row.nextElementSibling.querySelector(".detail-wrapper");
      row.classList.add("open");
      wrapper.style.overflow = "hidden";
      wrapper.style.maxHeight = wrapper.scrollHeight + "px";

      var onDone = function (e) {
        if (e.propertyName !== "max-height") return;
        wrapper.style.overflow = "visible";
        wrapper.removeEventListener("transitionend", onDone);
      };
      wrapper.addEventListener("transitionend", onDone);
    }

    function closeDetail(row) {
      var wrapper = row.nextElementSibling.querySelector(".detail-wrapper");
      row.classList.remove("open");
      // Re-clip immediately so the closing animation looks right.
      wrapper.style.overflow = "hidden";
      wrapper.style.maxHeight = null;
    }

    table.querySelectorAll(".main-row.expandable").forEach(function (row) {
      row.addEventListener("click", function () {
        var isOpen = row.classList.contains("open");

        if (openRow && openRow !== row) {
          closeDetail(openRow);
        }

        if (isOpen) {
          closeDetail(row);
          openRow = null;
        } else {
          openDetail(row);
          openRow = row;
        }
      });
    });
  });

  // --- evidence-format tabs (PNG / JSON / TeX) ---
  //
  // Each `.evaluation-table` block owns its own `.tab-nav` + `.tab-panel`s,
  // scoped independently so Subtask 1's tabs don't affect Subtask 2's.

  document.querySelectorAll(".evaluation-table").forEach(function (block) {
    var nav = block.querySelector(".tab-nav");
    if (!nav) return;

    var buttons = nav.querySelectorAll(".tab-btn");
    var panels = block.querySelectorAll(".tab-panel");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetId = btn.getAttribute("data-target");

        buttons.forEach(function (b) {
          b.classList.toggle("active", b === btn);
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });

        panels.forEach(function (panel) {
          panel.hidden = panel.id !== targetId;
        });
      });
    });
  });

});