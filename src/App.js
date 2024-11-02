import { Route, Routes } from "react-router-dom";
import { Users } from "./pages/user/Users";
import { Admin } from "./pages/admin/Admin";
import { Home } from "./Home";
import { Control } from "./pages/control/Control";
import { AddGame } from "./pages/addgame/Addgame";
import { History } from "./pages/control/History";
import { Customer } from "./pages/control/Customer";

function App() {
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
    </>
  );
}

export default App;
