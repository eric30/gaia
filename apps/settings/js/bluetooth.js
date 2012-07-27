/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

window.addEventListener('DOMContentLoaded', function bluetoothSettings(evt) {
  var gBluetoothManager = navigator.mozBluetooth;
  var gBluetoothDefaultAdapter = null;

  var gBluetoothPowerStatus = document.querySelector('#bluetooth-status small');
  var gBluetoothVisibility = document.querySelector('#bluetooth-visibility small');
  var gDeviceList = document.querySelector('#bluetooth-devices');

  var gDiscoveredDevices = new Array();

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
        dump("[Gaia] Device path = " + evt.deviceAddress);

        // TODO(Eric)
        // To respond to this event, we need to pop up a dialog to let user
        // check passkey. If it matches, call 
        gBluetoothDefaultAdapter.setPairingConfirmation(evt.deviceAddress, true)
        // , or call 
        // gBluetoothDefaultAdapter.setPairingConfirmationTemp(false)

        // TODO(Eric)
        // I did what SMS had done, use NotificationHelper to show a 
        // notification on status bar.
        NotificationHelper.send("Bluetooth", "test", null);
      };    
      
      gBluetoothDefaultAdapter.onrequestpincode = function(evt) {
        dump("[Gaia] We need to send a set of pin code back!");
        gBluetoothDefaultAdapter.setPinCode(evt.deviceAddress, "0000");
      };

      gBluetoothDefaultAdapter.onrequestpasskey = function(evt) {
        dump("[Gaia] We need to send a set of passkey back!");
      };      

      gBluetoothDefaultAdapter.oncancel = function(evt) {
        dump("[Gaia] Cancel");
      };      

      gBluetoothDefaultAdapter.ondevicefound = function(evt) {
        dump("[Gaia] Device found!!!");
        var i;
        var len = gDiscoveredDevices.length;

        for (i = 0;i < len;++i) {
          if (gDiscoveredDevices[i].address == evt.device.address) {
            break;
          }
        }

        if (i == len) {
          if (evt.device.name != "") {
            gDeviceList.appendChild(newScanItem(i, evt.device.name));
            gDiscoveredDevices[i] = evt.device;
          }
        }
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

  function startStopDiscovery() {
    var req;

    if (this.checked) {
      gDiscoveredDevices.length = 0;
      clearList(gDeviceList);

      req = gBluetoothDefaultAdapter.startDiscovery();
    } else {
      req = gBluetoothDefaultAdapter.stopDiscovery();
    }

    req.onsuccess = function bt_startStopDiscovery() {
      dump("[Gaia] Start/Stop discovery ok.");
    };

    req.onerror = function bt_startStopDiscoveryFail() {
      dump("[Gaia] Start/Stop discovery failed.");
    };
  };

  function newScanItem(index, str) {
    var a = document.createElement('a');
    a.textContent = str;

    var span = document.createElement('span');
    span.className = 'bluetooth-search';

    var label = document.createElement('label');
    label.appendChild(span);

    var li = document.createElement('li');
    li.appendChild(a);
    li.appendChild(label);

    li.onclick = function() {
      var device = gDiscoveredDevices[index];
      var req = gBluetoothDefaultAdapter.pairTemp(device.address);

      req.onsuccess = function bt_pairTempSuccess() {
        dump("pairing request sent");
      };

      req.onerror = function() {
        dump("error on pairing, try to unpair");
        var req2 = gBluetoothDefaultAdapter.unpairTemp(device.address);
      };

      dump("[Gaia] device clicked!");
    }

    return li;
  };

  function clearList(list) {
    while (list.hasChildNodes())
      list.removeChild(list.lastChild);
  };

  document.querySelector('#bluetooth-status input').onchange = changeBT;
  document.querySelector('#bluetooth-visibility input').onchange = changeBtVisibility;
  document.querySelector('#bluetooth-discovery input').onchange = startStopDiscovery;
});
