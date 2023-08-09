import './App.css';
import Graph from './Graph';
import './styles.css'; // Import the CSS file

// Importing modules
import React, {useState} from "react";

function MyButton() {
  const [count, setCount] = useState(0);
  function handleClick() {
    setCount(count + 1);
  }
  return (
    <button onClick={handleClick}>
    Clicked {count} times
  </button>
  );
}

const App = () => {
  return (
    <div className="App" style={{ margin: 0, padding: '0px 0' }}>
      {/* Outer wrapper with the background color for the entire App */}
      <div style={{ backgroundColor: 'transparent', margin: 0, padding: '0px 0' }}>
        {/* Inner wrapper for header and graph */}
        <div style={{ margin: 0, padding: '0px 0' }}>
          <header className="App-header" style={{ margin: 0, padding: '0px 0' }}>
            {/* Set margin and padding for the header elements */}
            <h1 style={{ margin: 0, padding: '0px 0' }}>Anchorage Mode</h1>
            <MyButton style={{ margin: '0px 0' }} />
            {/* First Image on the Website */}
            <img src="blog-what-is-gps-hero.png" alt="gps_first" style={{ display: 'block', margin: '0px 0', maxWidth: '5%', height: 'auto' }} />
          {/* Render the Graph component inside the inner wrapper */}
          <Graph/>
          </header>
        </div>
      </div>
    </div>
  );
};
export default App;