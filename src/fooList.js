import React, { useEffect, useState } from "react";
import io from "socket.io-client";

export default function NameList(props) {
	const [names, setNames] = useState([]);

	const handleMessage = msg => {
		setNames(prevState => [
			...prevState,
			`${msg.first_name} ${msg.last_name}`
		]);
	};

	// We only want to emit "join-channel" once
	const socket = io();
	socket.emit("join-channel", `id-${props.channelId}`);

	// We only want to create a listener once, but want it off if the component
	//  is destroyed
	useEffect(() => {
		/***
		 * When running test, this code is never reached.
		 **/
		socket.on("message", handleMessage);
		return () => socket.off("message", handleMessage);
	}, [socket]);

	return names && names.map((name, i) => <Name key={i} name={name} />);
}

function Name(props) {
	return <div>{props.name}</div>;
}
