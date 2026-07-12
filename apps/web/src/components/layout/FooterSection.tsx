import { useState } from "react";

const Footer = () => {
  const [date, _] = useState(() => new Date().getFullYear());

  return (
    <footer className="border-t border-border/50 mt-4">
      <div className="container mx-auto  flex flex-wrap gap-4 justify-between p-4">
        <div>
          <span className="text-lg font-bold glow-text">SEO-Checker</span>
          <p className="text-sm text-muted-foreground mt-2">
            by ridwanfansuri.com. Get a full SEO report with scores, recommendations, and crawl insights — all in one place.
          </p>
        </div>
        <div className="text-right">
          <h4 className="font-semibold mb-3 text-sm">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="https://github.com/ridwanf" className="hover:text-primary transition-colors">Github</a></li>
            <li><a href="https://www.linkedin.com/in/ridwanfansuri/" className="hover:text-primary transition-colors">Linkedin</a></li>
            <li><a href="https://medium.com/@ridwanfansuri" className="hover:text-primary transition-colors">Medium</a></li>
          </ul>
        </div>
        <div className="text-right">
          <h4 className="font-semibold mb-3 text-sm">Support Me</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="https://trakteer.id/ridwan-fansuri" className="hover:text-primary transition-colors">Trakteer</a></li>
            <li><a href="https://www.paypal.com/paypalme/ridwanfansuri" className="hover:text-primary transition-colors">Paypal</a></li>
          </ul>
        </div>

      </div>
      <div className="container mx-auto mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
        © {date} seo-checker. Developed by <a href="https://ridwanfansuri.com/" className="font-bold" target="_blank">ridwanfansuri.com</a>
      </div>
    </footer>
  );
};

export default Footer;
