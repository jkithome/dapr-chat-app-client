import React, { useState, useEffect, useRef, Fragment } from "react";
import {
  Header,
  Icon,
  Input,
  Grid,
  Segment,
  Card,
  Comment,
  Button,
} from "semantic-ui-react";
import "./App.css";

const App = () => {
  const [socketMessages, setSocketMessages] = useState([]);
  const webSocket = useRef(null);
  const [message, setMessage] = useState("");
  const messagesRef = useRef([]);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    webSocket.current = new WebSocket("ws://localhost:9000");
    webSocket.current.onmessage = message => {
      const data = JSON.parse(message.data);
      setSocketMessages(prev => [...prev, data]);
    };
    webSocket.current.onclose = () => {
      webSocket.current.close();
    };
    return () => webSocket.current.close();
  }, []);

  useEffect(() => {
    let data = socketMessages.pop();
    if (data) {
      switch (data.type) {
        case "message":
          handleMessageReceived(data.text);
          break;
        default:
          break;
      }
    }
  }, [socketMessages]);

  const handleMessageReceived = (text) => {
    let messages = messagesRef.current;
    let newMessages = [...messages, text];
    messagesRef.current = newMessages;
    setMessages(newMessages);
  };

  const handleSubmit = (e) => {
    fetch('/publish', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method:"POST",
        body: JSON.stringify({ message }),
    });
    e.preventDefault();
    setMessage('');
  }

  return (
    <div className="App">
      <Header as="h2" icon>
        <Icon name="users" />
        Dapr Chat App
      </Header>
      <Grid centered>
        <Grid.Column width={9}>
          <Card fluid>
            <Card.Content>
              {messages.length ? (
                  <Fragment>
                    {messages.map((text,id) => (
                      <Comment key={`msg-${id}`}>
                        <Comment.Content>
                          <Comment.Text>{text}</Comment.Text>
                        </Comment.Content>
                      </Comment>
                    ))}
                  </Fragment>
              ) : (
                <Segment placeholder>
                  <Header icon>
                    <Icon name="discussions" />
                    No messages available yet
                  </Header>
                </Segment>
              )}
              <Input
                fluid
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type message"
                action
              >
                <input />
                <Button color="teal" disabled={!message} onClick={handleSubmit}>
                  <Icon name="send" />
                  Send Message
                </Button>
              </Input>
            </Card.Content>
          </Card>
        </Grid.Column>
      </Grid>
    </div>
  );
};

export default App;
