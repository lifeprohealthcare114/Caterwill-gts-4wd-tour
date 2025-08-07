import './Footer.css';
function Footer() {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} LifePro Healthcare. All rights reserved.
    </footer>
  );
}

export default Footer;
