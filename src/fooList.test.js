import React from "react";
import { act } from "react-dom/test-utils";
import TestRenderer from "react-test-renderer";
import io from "socket.io-client";
import NameList from "./fooList";

jest.mock("socket.io-client");

const mockSocket = new function Socket() {
	/**
	 * Stores the channel to which this instance attends
	 */
	this.channel = "";

	/**
	 * Holds event handlers by message type
	 */
	this.handlers = {};

	/**
	 * Mocks emitting data, assumed to be a channel being joined, from client
	 * to server
	 */
	this.emit = (messageType, data) => {
		this.channel = data;
	};

	/**
	 * Adds an event handler for the message type
	 */
	this.on = (messageType, handler) => {
		if (!this.handlers.hasOwnProperty(messageType)) {
			this.handlers[messageType] = [];
		}
		this.handlers[messageType].push(handler);
	};

	/**
	 * Removes the event handler for the message type
	 */
	this.off = (messageType, handler) => {
		const typeHandlers = this.handlers[messageType];
		for (let i = 0; i < typeHandlers.length; i++) {
			if (typeHandlers[i] === handler) {
				typeHandlers.splice(i, 1);
				break;
			}
		}
	};

	/**
	 * Mocks receiving data from a server by invoking the event handlers for
	 * the message type
	 */
	this.mockReceiveData = (channel, messageType, data) => {
		if (channel === this.channel) {
			// Error: no such handler because 'on' was never called from effect
			this.handlers[messageType].forEach(handler => handler(data));
		}
	};
}();

beforeAll(() => {
	io.mockImplementation(() => mockSocket);
});


it("should render children with data from socket message with name", () => {
	const channelId = 42;

	const renderer = TestRenderer.create(<NameList channelId={channelId} />);

	const testSocketMessage = {
		first_name: "Test",
		last_name: "User"
	};
	act(() => {
		mockSocket.mockReceiveData(`id-${channelId}`, "message", testSocketMessage);
	});

	const expectedChildProps = {
		name: `${testSocketMessage.first_name} ${testSocketMessage.last_name}`
	};
	expect(renderer.root.findAllByProps(expectedChildProps)).toHaveLength(1);
});
