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
      if (gBluetoothDefaultAdapter != null) return;

      gBluetoothDefaultAdapter = req.result;

      gBluetoothDefaultAdapter.onrequestconfirmation = function(evt) {
        dump("[Gaia] Passkey = " + evt.passkey + ", request confirmation");
        dump("[Gaia] Device path = " + evt.deviceObjectPath);

        // TODO(Eric)
        // To respond to this event, we need to pop up a dialog to let user
        // check passkey. If it matches, call 
        // gBluetoothDefaultAdapter.setPairingConfirmationTemp(true)
        // , or call 
        // gBluetoothDefaultAdapter.setPairingConfirmationTemp(false)

        // TODO(Eric)
        // I did what SMS had done, use NotificationHelper to show a 
        // notification on status bar.
        NotificationHelper.send("Bluetooth", "test", null);
      };    
      
      gBluetoothDefaultAdapter.onrequestpincode = function(evt) {
        dump("[Gaia] We need to send a set of pin code back!");
      };

      gBluetoothDefaultAdapter.onrequestpasskey = function(evt) {
        dump("[Gaia] We need to send a set of passkey back!");
      };      
      
      gBluetoothDefaultAdapter.oncancel = function(evt) {
        dump("[Gaia] Cancel");
      };
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
      dump("Bluetooth has not enabled.");
      return;
    }

    // xxxxxxxxxx  Temp
    var testBdAddress = "A8:26:D9:DF:64:7A";

    if (this.checked) {
      var req2 = gBluetoothDefaultAdapter.pairTemp(testBdAddress);

      req2.onsuccess = function bt_pairTempSuccess() {
        dump("pairing request sent");
      };

      req2.onerror = function() {
        dump("error on pairing");
      };
    } else {
      var req2 = gBluetoothDefaultAdapter.unpairTemp(testBdAddress);

      req2.onsuccess = function bt_unpairTempSuccess() {
        dump("unpairing request sent");
      };

      req2.onerror = function() {
        dump("error on unpairing");
      };
    }

    return;

    if (this.checked == gBluetoothDefaultAdapter.discoverable) {
      dump("Same value, no action will be performed.");
      return;
    }

    var req = gBluetoothDefaultAdapter.setDiscoverable(this.checked);
    
    req.onsuccess = function bt_setDiscoverableSuccess() {
      gBluetoothVisibility.textContent = gBluetoothDefaultAdapter.discoverable ? 'visible' : 'invisible';
      dump("Discoverable: " + gBluetoothDefaultAdapter.discoverable);
    };

    req.onerror = function bt_setDiscoverableError() {
      dump("Error on set discoverable");
    }
  };

  document.querySelector('#bluetooth-status input').onchange = changeBT;
  document.querySelector('#bluetooth-visibility input').onchange = changeBtVisibility;
});
