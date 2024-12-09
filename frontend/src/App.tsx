import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Grader } from './components/grader/Grader';
import { NavBar } from './components/navbar/NavBar';
import { useEffect, useState } from 'react';
import { UserInfo } from './components/userInfo/UserInfo';
import { Submissions } from './components/submissions/Submissions';
import { User } from './model/domain/User';
import { Submission } from './model/domain/Submission';
import { Login } from './components/login/Login';
import Cookies from 'js-cookie';
import { ErrorModal } from './components/errorModal/ErrorModal';
import { Admin } from './components/admin/Admin';
import { Stats } from './components/stats/Stats';

function App() {
  const [semesterOver, setSemesterOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(!!localStorage.getItem('isAdmin'));
  const [impersonating, setImpersonating] = useState<boolean>(!!localStorage.getItem('impersonatedUser'));
  const [user, setUser] = useState<User | null>(
    impersonating
      ? localStorage.getItem('impersonatedUser')
        ? User.fromJson(JSON.parse(localStorage.getItem('impersonatedUser')!))
        : null
      : localStorage.getItem('user')
      ? User.fromJson(JSON.parse(localStorage.getItem('user')!))
      : null
  );
  const [submissions, setSubmissions] = useState<Submission[]>(
    impersonating
      ? localStorage.getItem('impersonatedSubmissions')
        ? JSON.parse(localStorage.getItem('impersonatedSubmissions')!).map((item: JSON) => Submission.fromJson(item))
        : []
      : localStorage.getItem('submissions')
      ? JSON.parse(localStorage.getItem('submissions')!).map((item: JSON) => Submission.fromJson(item))
      : []
  );
  // const [stats, setStats] = useState<object>({});
  const handleClose = () => setErrorMessage(null);

  useEffect(() => {
    // If front end thinks logged in but has no token
    if (!Cookies.get('token') && user) {
      localStorage.removeItem('user');
      localStorage.removeItem('submissions');
      localStorage.removeItem('impersonatedUser');
      localStorage.removeItem('impersonatedSubmissions');
      setUser(null);
      setSubmissions([]);
      window.location.href = '/';
    }
  }, []);

  return (
    <>
      {errorMessage && <ErrorModal errorMessage={errorMessage} handleClose={handleClose} />}
      <BrowserRouter>
        <NavBar
          setErrorMessage={setErrorMessage}
          impersonating={impersonating}
          setImpersonating={setImpersonating}
          user={user}
          setUser={setUser}
          setSubmissions={setSubmissions}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
          semesterOver={semesterOver}
          setSemesterOver={setSemesterOver}
        />
        <Routes>
          <Route path="/admin" element={<Admin setErrorMessage={setErrorMessage} />} />
          <Route
            path="/login"
            element={<Login setErrorMessage={setErrorMessage} setUser={setUser} setSubmissions={setSubmissions} setIsAdmin={setIsAdmin} />}
          />
        </Routes>
        {user ? (
          <Routes>
            <Route path="/grader" element={<Grader user={user} setSubmissions={setSubmissions} impersonating={impersonating} />} />
            <Route path="/profile" element={<UserInfo impersonating={impersonating} user={user} setUser={setUser} />} />
            <Route path="/submissions" element={<Submissions submissions={submissions} />} />
            {user.isAdmin && <Route path="/stats" element={<Stats setErrorMessage={setErrorMessage} />} />}
            <Route path="*" element={<Grader user={user} setSubmissions={setSubmissions} impersonating={impersonating} />} />
          </Routes>
        ) : (
          <h1>Please log in to access the autograder.</h1>
        )}
      </BrowserRouter>
    </>
  );
}

export default App;
