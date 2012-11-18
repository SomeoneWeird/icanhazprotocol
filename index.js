
var Concentrate = require('concentrate'),
		Dissolve = require('dissolve'),
		randomstring = require('randomstring'),
		util = require('util');

var Protocol = function Protocol() {

	this.packet_names = { };
	this.packet_data = { };

}

Protocol.prototype.definePacket = function(name, pid, data) {

	var self = this;

	if(this.packet_data[pid]||this.packet_names[pid]) {
		console.error("Packet PID " + pid + " already exists.");
	}

	this.packet_names[pid] = name;
	this.packet_data[pid] = data;

	var parser = function() {
		Dissolve.call(this);
		this.loop(function(end) {
			this.uint8("pid").tap(function() {

				var data = self.packet_data[this.vars.pid];

				for(var item in data) {
						this[data[item].type](item, (data[item].type=="string") ? data[item].length : null);
				}

			}).tap(function() {
				this.emit("data", this.vars);
				this.vars = {};
			});
		});
	}
	util.inherits(parser, Dissolve);

	this.parser = parser;

}

Protocol.prototype.buildPacket = function(pid, data, cb) {

	var packet = Concentrate().uint8(pid);
	var pdata = this.packet_data[pid];


	for(var item in data) {

		var tmp = pdata[item];

		var type = pdata[item].type;
		var value = data[item];

		if(type=="string") {

			var length = pdata[item]['length'];
			var t = length - value.length;

			for(var i = 0; i < t; i++) {
				value += " ";
			}

			packet[type](value, length);

		}	else {
			packet[type](value);
		}
	}

	cb(packet.result());

}

Protocol.prototype.parsePacket = function(packet, cb) {
	var self = this;
	var p = new this.parser();
	p.on("data", function(data) {
		var t = {};
		for(var item in data) {
			if(typeof data[item] == "string")
				data[item] = data[item].trim();
			t[item] = data[item];
		}

		t.packet_name = self.packet_names[t.pid];

		cb(t);
	});
	p.write(packet);
}

module.exports = Protocol;
