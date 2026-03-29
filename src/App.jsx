// ============================================================
// App.jsx — COMPLETE FINAL VERSION
// ============================================================

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider }      from "./context/AuthContext";
import { CartProvider }      from "./context/CartContext";
import { WishlistProvider }  from "./context/WishlistContext";
import { MessagingProvider } from "./context/MessagingContext";

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
import Inbox          from "./pages/Inbox";
import Conversation   from "./pages/Conversation";
import HelpCenter     from "./pages/HelpCenter";
import Deals          from "./pages/Deals";
import PriceGuide     from "./pages/PriceGuide";
import OrderHistory   from "./pages/OrderHistory";
import EditListing    from "./pages/EditListing";
import SellerDashboard   from "./pages/SellerDashboard";
import SellerOnboarding  from "./pages/SellerOnboarding";
import { PaymentSuccess } from "./pages/ExtraPages";
import { NotFound }       from "./pages/ExtraPages";

// Scroll to top on every page navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    // AuthProvider is outermost so all other contexts can access the logged-in user
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <MessagingProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Navbar />

              <Routes>
                <Route path="/"                         element={<Home />}            />
                <Route path="/shop"                     element={<Shop />}            />
                <Route path="/product/:id"              element={<ProductDetail />}   />
                <Route path="/seller/:sellerName"       element={<SellerProfile />}   />
                <Route path="/cart"                     element={<Cart />}            />
                <Route path="/checkout"                 element={<Checkout />}        />
                <Route path="/auth"                     element={<Auth />}            />
                <Route path="/sell"                     element={<Sell />}            />
                <Route path="/sell/edit/:id"            element={<EditListing />}     />
                <Route path="/account"                  element={<Account />}         />
                <Route path="/wishlist"                 element={<Wishlist />}        />
                <Route path="/my-listings"              element={<MyListings />}      />
                <Route path="/messages"                 element={<Inbox />}           />
                <Route path="/messages/:conversationId" element={<Conversation />}   />
                <Route path="/help"                     element={<HelpCenter />}      />
                <Route path="/deals"                    element={<Deals />}           />
                <Route path="/price-guide"              element={<PriceGuide />}      />
                <Route path="/orders"                   element={<OrderHistory />}    />
                <Route path="/dashboard"                element={<SellerDashboard />} />
                <Route path="/success"                  element={<PaymentSuccess />}  />
                <Route path="/seller-onboarding"        element={<SellerOnboarding />}          />
                {/* Catches any URL that doesn't match — shows 404 page */}
                <Route path="*"                         element={<NotFound />}        />
              </Routes>

              <Footer />
            </BrowserRouter>
          </MessagingProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
