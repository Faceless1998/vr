import { Route, Routes,useNavigate  } from "react-router-dom";
import { Users } from "./pages/user/Users";
import { Admin } from "./pages/admin/Admin";
import { Home } from "./Home";
import { Control } from "./pages/control/Control";
import { AddGame } from "./pages/addgame/Addgame";
import { History } from "./pages/control/History";
import { Customer } from "./pages/control/Customer";
import "./App.css"
function App() {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="users" element={<Users />} />
        <Route path="admin" element ={<Admin />} />
        <Route path="admin/add" element ={<AddGame />} />
        <Route path="admin/control" element ={<Control />} />
        <Route path="admin/history" element ={<History />} />
        <Route path="admin/costumers" element ={<Customer />} />
      </Routes>
      <button
        className="backButton"
        onClick={() => navigate(-1)} // Navigate back to the previous page
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>
    </>
  );
}

export default App;
