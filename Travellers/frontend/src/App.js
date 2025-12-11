import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "./Components/Header";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Services from "./Pages/Services";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Footer from "./Components/Footer";
import Admin from "./Panels/Admin";
import Customer from "./Panels/Customer";
import Driver from "./Panels/Driver";
import CustomerAbout from "./Components/Customer/CustomerAbout";
import CustomerServices from "./Components/Customer/CustomerServices";
import CustomerContact from "./Components/Customer/CustomerContact";
import DriverAbout from "./Components/Driver/DriverAbout";
import DriverAssignedBookings from "./Components/Driver/DriverAssignedBookings";
import CarDetails from "./Components/Admin/CarDetails";
import TourBookingForm from './Components/Customer/TourBookingForm';
import RideBookingForm from './Components/Customer/RideBookingForm';

import CustomerBookings from './Components/Customer/CustomerBookings';
import MyBookings from './Components/Customer/MyBookings';
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import CustomerProfile from './Pages/CustomerProfile';
import DriverProfile from './Pages/DriverProfile';
import PaymentSuccess from './Pages/PaymentSuccess';
import PaymentCancel from './Pages/PaymentCancel';
import { SocketProvider } from './contexts/SocketContext';
import { BookingsProvider } from './contexts/BookingsContext';
import { ProfileProvider } from './contexts/ProfileContext';

function LayoutWrapper({ children }) {
  const location = useLocation();

  const standalonePaths = [
    "/admin", 
    "/customer", 
    "/driver",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password"
  ];
  // Check if the current path is a standalone page without the main header/footer
  const isStandalonePage = standalonePaths.some(path => location.pathname.toLowerCase().startsWith(path));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!isStandalonePage && <Header />}
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
      {!isStandalonePage && <Footer />}
    </Box>
  );
}

function App() {
  return (
    <SocketProvider>
      <BookingsProvider>
        <ProfileProvider>
          <Router>
            <LayoutWrapper>
            <Routes>
            {/* Main Site Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />

            {/* Admin Panel Routes */}
            <Route path="/admin/maintenance/:carId" element={<CarDetails />} />
            <Route path="/admin/*" element={<Admin />} />

            {/* Customer Panel and related routes */}
            <Route path="/customer" element={<Customer />} />
            <Route path="/customer/about" element={<CustomerAbout />} />
            <Route path="/customer/services" element={<CustomerServices />} />
            <Route path="/customer/contact" element={<CustomerContact />} />
            <Route path="/customer/tour-booking" element={<TourBookingForm />} />
            <Route path="/customer/ride-booking" element={<RideBookingForm />} />
    
            <Route path="/customer/bookings" element={<CustomerBookings />} />
            <Route path="/customer/mybookings" element={<MyBookings />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
            
            {/* Driver Panel and related routes */}
            <Route path="/driver" element={<Driver />} />
            <Route path="/driver/assigned-bookings" element={<DriverAssignedBookings />} />
            <Route path="/driver/about" element={<DriverAbout />} />
            <Route path="/driver/profile" element={<DriverProfile />} />
                                            </Routes>
          </LayoutWrapper>
        </Router>
          </ProfileProvider>
      </BookingsProvider>
    </SocketProvider>
  );
}

export default App;