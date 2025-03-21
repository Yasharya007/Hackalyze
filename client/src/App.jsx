import { Route, Routes } from "react-router-dom";
import SamplePage from "./pages/SamplePage.jsx";
import LoginAdminPage from "./pages/LoginAdminPage.jsx";
import LoginStudentPage from "./pages/LoginStudentPage.jsx";
import LoginTeacherPage from "./pages/LoginTeacherPage.jsx";
import RegisterStudentPage from "./pages/RegisterStudentPage.jsx";
import RegisterTeacher from "./pages/RegisterTeacher.jsx";
function App() {
  

  return (
    <>
      <div id="origin" className="flex">
        <Routes>
            <Route path="/" element={<SamplePage/>}/>
            <Route path="/admin/login" element={<LoginAdminPage/>}/>
            <Route path="/student/login" element={<LoginStudentPage/>}/>
            <Route path="/teacher/login" element={<LoginTeacherPage/>}/>
            <Route path="/student/register" element={<RegisterStudentPage/>}/>
            <Route path="/teacher/register" element={<RegisterTeacher/>}/>
        </Routes>
      </div>
    </>
  )
}

export default App
