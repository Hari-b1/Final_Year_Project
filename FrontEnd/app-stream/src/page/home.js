import { useEffect, useState, useRef } from 'react';
import Button from '../ui-components/Button';
import Header from '../ui-components/Header';
import io from 'socket.io-client';

export default function Home() {
    let socketRef = useRef(null);
    let [message, setMessage] = useState('');

    function handleClick() {
        if(!socketRef.current) {
            socketRef.current = io('http://localhost:3000');
            socketRef.current.on('connect', () => {
                alert('connected to server');

                socketRef.current.emit('message', 'Hello from client');

                socketRef.current.on('message', (data) => {
                    alert('Received message from server: ');

                    setMessage(data);
                })
            });
        } else {
            alert('Already connected to server');
        }
    }

    useEffect(() => {
        return () => {
            if(socketRef.current) {
                socketRef.current.disconnect();
            }
        }
    }, []);

    return (
        <div>
            <Header />
        </div>
    );
}