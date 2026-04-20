import { BrowserRouter, Route, Routes } from "react-router-dom"
import SignIn from "./components/Signin/SignIn"
import SignUp from "./components/SignUp/SignUp"
import ChatPage from "./pages/Chatpage/ChatPage"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/chatpage" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
