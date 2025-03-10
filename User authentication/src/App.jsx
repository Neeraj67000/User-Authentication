import { useState } from "react";
import SignupForm from "./components/signup.jsx";
import SignIn from "./components/signin.jsx";
import "./App.css";

function App() {
  const [form, setform] = useState();
  const [user, setuser] = useState([]);
  const [fetched, setfetched] = useState(false);

  async function saveUser(data) {
    setuser([...user, data]);
    try {
      const fetched = await fetch("http://localhost:3000/", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      setfetched(true);
    } catch (error) {
      console.log(`Something went wrong ${error.message}`);
    }
  }
  return (
    <>
      <SignupForm saveUser={saveUser} />
      {/* <SignIn saveUser={saveUser} /> */}
      {fetched && <p>You have been successfully registered</p>}
    </>
  );
}

export default App;
