import { Route, Routes } from "react-router-dom";
import SamplePage from "./pages/SamplePage.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterStudentPage from "./pages/RegisterStudentPage.jsx";
import RegisterTeacherPage from "./pages/RegisterTeacherPage.jsx";
import StudentHackathonPage from "./pages/StudentHackathonPage.jsx";
import FAQPage from "./pages/FAQPage.jsx";
function App() {
  

  return (
    <>
      <div id="origin" className="flex">
        <Routes>
            <Route path="/" element={<LoginPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/student/register" element={<RegisterStudentPage/>}/>
            <Route path="/teacher/register" element={<RegisterTeacherPage/>}/>
            <Route path="/student/dashboard" element={<SamplePage/>}/>
            <Route path="/hackathon" element={<StudentHackathonPage/>}/>
            <Route path="/faq" element={<FAQPage/>}/>
            <Route path="/teacher/dashboard" element={<TeacherDashboard/>}/>
        </Routes>
      </div>
    </>
  )
}

export default App
