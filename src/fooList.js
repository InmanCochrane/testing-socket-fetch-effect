import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";

function useSocket(channel, onMessage) {
	// We only want to emit "join-channel" once, so hold a ref to socket
	const socketRef = useRef(io("http://localhost:3001"));
	socketRef.current.emit("join-channel", channel);

	// We only want to create a listener once, but want it off if the component
	//  is destroyed
	useEffect(() => {
		/***
		 * When running test, this code is never reached.
		 **/
		const socket = socketRef.current;
		socket.on("message", onMessage);
		return () => socket.off("message", onMessage);
	});
}

export default function FooList(props) {
	const [name, setName] = useState("");

	const handleMessage = msg => {
		// In reality, we sometimes needs to fetch and sometimes don't
		fetch(msg.url).then(res =>
			setName(`${res.first_name} ${res.last_name}`)
		);
	};

	useSocket(`id-${props.barId}`, handleMessage);

	return name && name.map((fooProps, i) => <Foo key={i} {...fooProps} />);
}

function Foo(props) {
	return <div>{JSON.stringify(props)}</div>;
}
