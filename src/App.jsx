// ============================================================
// App.jsx — COMPLETE FINAL VERSION
// ============================================================

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider }     from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import Navbar         from "./components/Navbar";
import Footer         from "./components/Footer";

import Home           from "./pages/Home";
import Shop           from "./pages/Shop";
import Cart           from "./pages/Cart";
import Checkout       from "./pages/Checkout";
import Auth           from "./pages/Auth";
import Sell           from "./pages/Sell";
import ProductDetail  from "./pages/ProductDetail";
import SellerProfile  from "./pages/SellerProfile";
import Account        from "./pages/Account";
import Wishlist       from "./pages/Wishlist";
import MyListings     from "./pages/MyListings";
import { PaymentSuccess } from "./pages/ExtraPages";
import { NotFound }       from "./pages/ExtraPages";

// Scroll to top on every page navigation — keeps your existing behaviour
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    // WishlistProvider wraps everything so any component
    // can call useWishlist() to access saved items
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />

          <Routes>
            <Route path="/"                   element={<Home />}           />
            <Route path="/shop"               element={<Shop />}           />
            <Route path="/product/:id"        element={<ProductDetail />}  />
            <Route path="/seller/:sellerName" element={<SellerProfile />}  />
            <Route path="/cart"               element={<Cart />}           />
            <Route path="/checkout"           element={<Checkout />}       />
            <Route path="/auth"               element={<Auth />}           />
            <Route path="/sell"               element={<Sell />}           />
            <Route path="/account"            element={<Account />}        />
            <Route path="/wishlist"           element={<Wishlist />}       />
            <Route path="/my-listings"        element={<MyListings />}     />
            <Route path="/success"            element={<PaymentSuccess />} />
            {/* Catches any URL that doesn't match — shows 404 page */}
            <Route path="*"                   element={<NotFound />}       />
          </Routes>

          <Footer />
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
