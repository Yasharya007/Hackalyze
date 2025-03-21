import { Route, Routes } from "react-router-dom";
import SamplePage from "./pages/SamplePage.jsx";
function App() {
  

  return (
    <>
      <div id="origin" className="flex">
        <Routes>
            <Route path="/" element={<SamplePage/>}/>
        </Routes>
      </div>
    </>
  )
}

export default App
