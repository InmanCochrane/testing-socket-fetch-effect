import React, { useEffect, useState } from "react";
import io from "socket.io-client";

export default function FooList(props) {
	const [names, setNames] = useState([]);

	const handleMessage = msg => {
		if (msg.url) {
			fetch(msg.url)
				.then(res => res.json())
				.then(data => {
					setNames(prevState => [
						...prevState,
						`${data.first_name} ${data.last_name}`
					]);
				});
		} else {
			setNames(prevState => [
				...prevState,
				`${msg.first_name} ${msg.last_name}`
			]);
		}
	};

	// We only want to emit "join-channel" once
	const socket = io();
	socket.emit("join-channel", `id-${props.barId}`);

	// We only want to create a listener once, but want it off if the component
	//  is destroyed
	useEffect(() => {
		/***
		 * When running test, this code is never reached.
		 **/
		socket.on("message", handleMessage);
		return () => socket.off("message", handleMessage);
	}, [socket]);

	return names && names.map((name, i) => <Foo key={i} name={name} />);
}

function Foo(props) {
	return <div>{props.name}</div>;
}
