
var net = require('net'),
		icanhazprotocol = require('./index.js');


/* Create a new instance of icanhazprotocol */

var protocol = new icanhazprotocol();

/*	
		Define a couple of packets to test with.
		First argument is the packet name (can be blank), second is the PID
		third is the data field.
*/
		
protocol.definePacket('examplePacket1', 0x01, {

	/* Add a field to the packet labelled dataField1 */ 

	"dataField1": {

		/* Define dataField1 as a string */

		type: "string",

		/* Strings need a length set, strings under this length will be padded, so set it to the maximum length you expect */

		length: 20

	},

	/* Add another field */

	"dataField2": {

		/* Define dataField2 as an unsigned int, you don't need to define a length */

		type: "uint32be"

	}

});

protocol.definePacket('examplePacket2', 0x02, {

	"dataField1": {
		type: "string",
		length: 5
	},

	"fieldscanbenamedanything": {
		type: "string",
		length: 200
		/* 	
				and can be very large too (remember, when you build a packet
				if the string you pass to the function is less than the defined length, it will be padded)
		*/
	}

});

/* Setup a socket server */

var server = net.createServer(function (socket) {

	socket.on("data", function(packet) {

		/* We have a packet, now lets parse it */

		protocol.parsePacket(packet, function(data) {

			console.log("Server got packet " + data.packet_name + " (PID: " + data.pid + ") ---->");

			console.log(data);

			// Lets send another one back.

			protocol.buildPacket(0x02, {

				"dataField1": "hello",
				"fieldscanbenamedanything": "this is a very long string, but is less than 200 chars so it will be padded"

			}, function(packet) {

				// Send it back

				socket.write(packet);

			});

		});

	});

});

server.listen(8080);


var client = net.connect({ port: 8080 }, function() {

  // We've connected, lets build a packet to send.

  protocol.buildPacket(0x01, {

  	"dataField1": "this is a string",
  	"dataField2": Math.floor(Math.random()*1000)

  }, function(packet) {

  	// Got the packet, now lets send it.

  	client.write(packet);

  });

});

client.on('data', function(packet) {

  // We got a packet, lets parse it.

  protocol.parsePacket(packet, function(data) {

  	console.log("\n\nClient got packet " + data.packet_name + " (PID: " + data.pid + ") ---->");

  	console.log(data);

  });

});



