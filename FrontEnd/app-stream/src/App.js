import logo from './logo.svg';
import './App.css';
import Home from './page/home';
import 'bootstrap/dist/css/bootstrap.min.css';
import VideoChat from './socketComponents/WebRTCConnection'; 

function App() {
  return (
    <div className="App">
      <main>
        <Home />
        <VideoChat />
      </main>
    </div>
  );
}

export default App;
