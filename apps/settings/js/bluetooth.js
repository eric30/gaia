/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

window.addEventListener('DOMContentLoaded', function bluetoothSettings(evt) {
  var gBluetoothManager = navigator.mozBluetooth;
  var gBluetoothDefaultAdapter = null;

  var gBluetoothPowerStatus = document.querySelector('#bluetooth-status small');
  var gBluetoothVisibility = document.querySelector('#bluetooth-visibility small');

  var settings = window.navigator.mozSettings;
  if (settings) {
    var req = settings.getLock().get('bluetooth.enabled');
    req.onsuccess = function bt_EnabledSuccess() {
      var bluetooth = window.navigator.mozBluetooth;
      if (!bluetooth)
        return;

      var enabled = req.result['bluetooth.enabled'];
      bluetooth.setEnabled(enabled);
      document.querySelector('#bluetooth-status input').checked = enabled;
    };

    req.onerror = function bt_EnabledError() {
      console.log('Settings error when reading bluetooth setting!');
    };
  }

  function getDefaultAdapter() {
    var req = gBluetoothManager.getDefaultAdapter();

    req.onsuccess = function bt_getDefaultAdapterSuccess() {
      gBluetoothDefaultAdapter = req.result;
    };

    req.onerror = function bt_getDefaultAdapterError() {
      dump("ADAPTER GET ERROR");
      dump(req.error.name);
    }
  };

  function changeBT() {
    var req = gBluetoothManager.setEnabled(this.checked);

    req.onsuccess = function bt_enabledSuccess() {
      if (gBluetoothManager.enabled) {
        gBluetoothPowerStatus.textContent = 'Enabled';
        window.setTimeout(getDefaultAdapter, 1000);
      } else {
        gBluetoothPowerStatus.textContent = 'Disabled';
      }

      var settings = window.navigator.mozSettings;
      if (settings) {
        settings.getLock().set({
          'bluetooth.enabled': gBluetoothManager.enabled
        });
      }
    };

    req.onerror = function bt_enabledError() {
      gBluetoothPowerStatus.textContent = 'Error';
    };
  };

  function changeBtVisibility() {
    if (!gBluetoothManager.enabled) {
      console.log("Bluetooth has not enabled.");
      return ;
    }
  };

  document.querySelector('#bluetooth-status input').onchange = changeBT;
  document.querySelector('#bluetooth-visibility input').onchange = changeBtVisibility;
});
