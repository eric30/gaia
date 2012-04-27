/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

window.addEventListener('DOMContentLoaded', function discoverDevices(evt) {
  var gBluetoothAdapter = navigator.mozBluetooth;
  var _ = document.mozL10n.get;

  var gBluetoothPowerStatus = document.querySelector('#bluetooth-status small');
  var gBluetoothDeviceLabel = document.querySelector('#bluetooth-connect small');
  var gBluetoothDiscoverLabel = document.querySelector('#bluetooth-discovery small');
  var gBluetoothResultLabel = document.querySelector('#bluetooth-result span');
  var gDeviceList = document.querySelector('#bluetooth-devices');

  var gDiscoveredDevices = new Array();

  document.querySelector('#bluetooth-status input').onchange = function() {
    var req = gBluetoothAdapter.setEnabled(this.checked);

    req.onsuccess = function() {
      dump("Bluetooth - success");

      if(!gBluetoothAdapter.enabled) {
        gBluetoothPowerStatus.textContent = 'Disabled';
      } else {
        gBluetoothPowerStatus.textContent = 'Enabled';
      }
    };

    req.onerror = function() {
      dump("Bluetooth - error");
    };
  };

  document.querySelector('#bluetooth-discovery input').onchange = function() {
    if (this.checked) {    
      gDiscoveredDevices.length = 0;
      clearList();

      gBluetoothAdapter.startDiscovery();
    } else {
      gBluetoothAdapter.stopDiscovery();
    }
  };

  gBluetoothAdapter.onpropertychanged = function onpropertychanged(evt) {
    dump("Get onpropertychanged");
    var propertyName = evt.propertyName;

    if (propertyName == "Discovering")
    {
      if (gBluetoothAdapter.discovering) {
        gBluetoothDiscoverLabel.textContent = "Discovering";
      } else {
        gBluetoothDiscoverLabel.textContent = "Ready";
      }
    }
  }

  gBluetoothAdapter.ondevicefound = function ondevicefound(evt) {
    var i;
    var len = gDiscoveredDevices.length;

    for (i = 0;i < len;++i) {
      if (gDiscoveredDevices[i] == evt.device) {
        break;
      }
    }

    if (i == len) {
      gDeviceList.appendChild(newScanItem(i, evt.device.name));
      gDiscoveredDevices[i] = evt.device;
    }
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

      if (device.connected) {
        gBluetoothResultLabel.textContent = "Disconnecting";

        if (device.disconnect()) {
          gBluetoothResultLabel.textContent = "Disconnected";
        } else {
          gBluetoothResultLabel.textContent = "Disconnect Failed";
        }
      } else {
        gBluetoothResultLabel.textContent = "Connecting";

        if (device.connect(2)) {
          gBluetoothResultLabel.textContent = "Connected";
        } else {
          gBluetoothResultLabel.textContent = "Connect Failed";
        }
      }
    }

    return li;
  };

  function clearList() {
    while (gDeviceList.hasChildNodes())
      gDeviceList.removeChild(gDeviceList.lastChild);
  };
});
