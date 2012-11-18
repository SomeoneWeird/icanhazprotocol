var icanhazprotocol = require('./index.js'),
		assert = require('assert');

var protocol = new icanhazprotocol();

protocol.definePacket("testPacket", 0x01, {

	"test1": {
		type: "uint32be"
	},

	"test2": {
		type: "string",
		length: 30
	}

});

var testPacket = function() {

	var pid = 0x01;

	var data = {

		"test1": 20,
		"test2": "test data"

	}

	protocol.buildPacket(pid, data, function(packet) {

		protocol.parsePacket(packet, function(packet_data) {

			assert.equal(packet_data.pid, pid, "Packet has pid: " + packet_data.pid + " expected " + pid);
			assert.equal(packet_data.packet_name, "testPacket", "Packet has name: " + packet_data.packet_name + " expected testPacket");

			for(var item in data) {
				assert.equal(packet_data[item], data[item], item + " should equal " + data[item] + " but equals " + packet_data[item]);
			}

			console.log("Basic test passed.");

		});

	});
}

testPacket();
