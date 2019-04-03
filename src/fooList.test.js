import React from "react";
import { act } from "react-dom/test-utils";
import TestRenderer from "react-test-renderer";
import mockFetch from "jest-fetch-mock";
import io from "socket.io-client";
import FooList from "./fooList";

global.fetch = mockFetch;
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
			/***
			 * Error occurs here because handler was never set up because 'on'
			 *  was never called
			 **/
			this.handlers[messageType].forEach(handler => handler(data));
		}
	};
}();

beforeAll(() => {
	io.mockImplementation(() => mockSocket);
});

beforeEach(() => {
	fetch.resetMocks();
});

it("should render children with data from socket message with name", () => {
	const barId = 42;

	const renderer = TestRenderer.create(<FooList barId={barId} />);

	const testSocketMessage = {
		first_name: "Test",
		last_name: "User"
	};
	act(() => {
		mockSocket.mockReceiveData(`id-${barId}`, "message", testSocketMessage);
	});

	const expectedChildProps = {
		name: `${testSocketMessage.first_name} ${testSocketMessage.last_name}`
	};
	expect(renderer.root.findAllByProps(expectedChildProps)).toHaveLength(1);
});

it("should render children with data from user API on socket message with url", () => {
	const barId = 42;

	const renderer = TestRenderer.create(<FooList barId={barId} />);

	const testFetchResponseData = {
		first_name: "Test",
		last_name: "User"
	};
	fetch.mockResponseOnce(JSON.stringify(testFetchResponseData));

	const testSocketMessage = {
		url: "irrelevant"
	};
	act(() => {
		mockSocket.mockReceiveData(`id-${barId}`, "message", testSocketMessage);
	});

	const expectedChildProps = {
		name: `${testFetchResponseData.first_name} ${
			testFetchResponseData.last_name
		}`
	};
	expect(renderer.root.findAllByProps(expectedChildProps)).toHaveLength(1);
});
