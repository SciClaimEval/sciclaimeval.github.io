document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".results-table").forEach(function (table) {
    var openRow = null;

    function closeRow(row) {
      row.classList.remove("open");
      var wrapper = row.nextElementSibling.querySelector(".detail-wrapper");
      wrapper.style.maxHeight = null;
    }

    function openRowFn(row) {
      row.classList.add("open");
      var wrapper = row.nextElementSibling.querySelector(".detail-wrapper");
      wrapper.style.maxHeight = wrapper.scrollHeight + "px";
    }

    table.querySelectorAll(".main-row.expandable").forEach(function (row) {
      row.addEventListener("click", function () {
        var isOpen = row.classList.contains("open");

        if (openRow && openRow !== row) {
          closeRow(openRow);
        }

        if (isOpen) {
          closeRow(row);
          openRow = null;
        } else {
          openRowFn(row);
          openRow = row;
        }
      });
    });
  });
});