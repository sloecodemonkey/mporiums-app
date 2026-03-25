// ============================================================
// Footer.jsx
// ============================================================ 
import { Link } from "react-router-dom";

function Footer() {
  return ( 
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">

          {/* ── COLUMN 1: Logo + Tagline ── */}
          <div>
            {}
            <img
              src="/images/mporiums-logo.png"
              alt="M.Poriums"
              style={{ height: "32px", marginBottom: "1rem" }}
            />
            <p className="text-muted text-sm">
              The trusted marketplace for buying and selling audio hardware and musical instruments.
            </p>
          </div>

          {/* ── COLUMN 2: Marketplace Links ── */}
          <div>
            <h4 className="footer-heading">Marketplace</h4>
            <ul className="footer-links">
              {}
              <li><Link to="/shop">Shop All</Link></li>
              <li><Link to="/sell">Sell Gear</Link></li>

              {/* These pages don't exist yet, so href="#" is fine for now.
                  When you build them, just replace with <Link to="/price-guide"> etc. */}
              <li><Link to="/price-guide">Price Guide</Link></li>
              <li><Link to="/deals">Deals</Link></li>
            </ul>
          </div>

          {/* ── COLUMN 3: Support Links ── */}
          <div>
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/help#buyer-protection">Buyer Protection</Link></li>
              <li><Link to="/help#shipping">Shipping Info</Link></li>
              <li><Link to="/help#returns">Returns</Link></li>
            </ul>
          </div>

          {/* ── COLUMN 4: Company Links ── */}
          <div>
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

        </div>

        {/* ── Copyright Bar ── */}
        {}
        <div className="footer-bottom">
          © {new Date().getFullYear()} M.Poriums. All rights reserved.
        </div>

      </div>
    </footer>
  );
}


export default Footer;
