'use strict';

if ('mozBluetooth' in navigator) {
  console.log("Got mozBluetooth successfully.");
} else {
  console.log("couldn't get mozBluetooth");
}

var bluetooth = navigator.mozBluetooth;
var result = document.getElementById("result");

var isEnabled = function() {
  return bluetooth.enabled;
};

document.getElementById("request-getDefaultAdapter").addEventListener(
  'click', function() {
    var req = bluetooth.getDefaultAdapter();
    req.onsuccess = function() {
      var message = "Get default adapter failed.";
      message += "Bluetooth enabled? " + isEnabled();

      result.innerHTML = message;
    };
    req.onerror = function() {
      var message = "Get default adapter failed.";
      message += "Bluetooth enabled? " + isEnabled();

      result.innerHTML = message;
    };
});


