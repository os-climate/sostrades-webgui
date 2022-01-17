import * as jExcel from "node_modules/jspreadsheet-ce";

var clockEditor = function () {
  var methods: any;

  methods.createCell = function (cell, value, x, y, instance, options) {
    cell.innerHTML = value;
  }

  methods.updateCell = function (cell, value, x, y, instance, options) {
    if (cell) {
      cell.innerHTML = value;
    }
  }

  methods.openEditor = function (cell, value, x, y, instance, options) {
    // Create input from the helpers
    var editor = jExcel.helpers.createEditor('input', cell);
    editor.value = value;
    // Instance of the clock picker
    editor.clockpicker({
      afterHide: function () {
        setTimeout(function () {
          // To avoid double call
          if (cell.children[0]) {
            instance.closeEditor(cell, true);
          }
        });
      }
    });
    editor.focus();
  }

  methods.closeEditor = function (cell, save) {
    if (save) {
      cell.innerHTML = cell.children[0].value;
    } else {
      cell.innerHTML = '';
    }

    return cell.innerHTML;
  }

  return methods;
}();
