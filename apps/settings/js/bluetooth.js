/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var uuidAudioSink     = "0000110B-0000-1000-8000-00805F9B34FB";
var uuidAudioSource   = "0000110A-0000-1000-8000-00805F9B34FB";
var uuidAdvAudioDist  = "0000110D-0000-1000-8000-00805F9B34FB";
var uuidHeadset       = "00001108-0000-1000-8000-00805F9B34FB";
var uuidHandsfree     = "0000111E-0000-1000-8000-00805F9B34FB";
var uuidHandsfreeAG   = "0000111F-0000-1000-8000-00805F9B34FB";

window.addEventListener('DOMContentLoaded', function discoverDevices(evt) {
  var gBluetoothAdapter = navigator.mozBluetooth;
  var _ = document.mozL10n.get;

  var gBluetoothPowerStatus = document.querySelector('#bluetooth-status small');
  var gBluetoothDeviceLabel = document.querySelector('#bluetooth-connect small');
  var gBluetoothDiscoverLabel = document.querySelector('#bluetooth-discovery small');
  var gConnectedDeviceList = document.querySelector('#bluetooth-connected-devices');
  var gDeviceList = document.querySelector('#bluetooth-devices');

  var gDiscoveredDevices = new Array();
  var gConnectedDevice = null;

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
      clearList(gDeviceList);

      gBluetoothAdapter.startDiscovery();
    } else {
      gBluetoothAdapter.stopDiscovery();
    }
  };

  gBluetoothAdapter.ondeviceconnected = function ondeviceconnected(evt) {
    dump("Device connected: " + evt.device.name);
    gConnectedDevice = evt.device;
    gConnectedDeviceList.appendChild(newConnectedItem(evt.device.name));
  }

  gBluetoothAdapter.ondevicedisconnected = function ondevicedisconnected(evt) {
    dump("Device disconnected" + evt.deviceAddress);
    gConnectedDevice = null;
    clearList(gConnectedDeviceList);
  }

  gBluetoothAdapter.onpropertychanged = function onpropertychanged(evt) {
    dump("Get onpropertychanged");
    var propertyName = evt.propertyName;

    if (propertyName == "Discovering") {
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

  function newConnectedItem(description) {
    var a = document.createElement('a');
    a.textContent = description;

    var span = document.createElement('span');
    span.className = 'bluetooth-connected';

    var label = document.createElement('label');
    label.appendChild(span);

    var li = document.createElement('li');
    li.appendChild(a);
    li.appendChild(label);

    li.onclick = function() {
      gConnectedDevice.disconnect();
    }

    return li;
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
      var channel = device.queryServerChannel(uuidHandsfree);

      dump("Channel is " + channel);

      // -1 means not a HFP device
      if (channel != -1) {        
        device.connect(channel);
      } else {
        dump("Not support HFP");
      }
    }

    return li;
  };

  function clearList(list) {
    while (list.hasChildNodes())
      list.removeChild(list.lastChild);
  };
});
