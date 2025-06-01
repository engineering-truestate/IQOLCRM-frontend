import { ClipLoader } from "react-spinners";
import Sidebar from "../components/side-bar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = ({ children, loading }: { children?: React.ReactNode; loading: boolean }) => {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Sidebar />
        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <ClipLoader color="#17294D" size={50} />
          </div>
        ) : (
          <main className="flex-grow mt-12">{children}</main>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default Layout;
