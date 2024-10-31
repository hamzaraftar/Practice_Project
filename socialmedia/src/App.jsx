import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Siderbar from "./components/Siderbar";

function App() {
  return (
    <div className="app-container">
      <Siderbar />
      <div className="content">
      <Header />
      <Footer />
      </div>
    </div>
  );
}

export default App;
