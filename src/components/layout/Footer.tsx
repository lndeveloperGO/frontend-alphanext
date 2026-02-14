import { Link } from "react-router-dom";
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { getAppName, getAppTagline } from "@/lib/env";

const appName = getAppName();
const appTagline = getAppTagline();

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        {/* <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <img
                  src="/logoAlphanext.jpg"
                  alt={appName}
                  className="h-9 w-9 rounded-xl"
                />
              </div>
              <span className="text-xl font-bold">{appName}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {appTagline}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

         
          <div>
            <h4 className="mb-4 font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/#features" className="hover:text-primary">Features</Link>
              </li>
              <li>
                <Link to="/#pricing" className="hover:text-primary">Pricing</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary">Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary">Register</Link>
              </li>
            </ul>
          </div>

          
          <div>
            <h4 className="mb-4 font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">Blog</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">Privacy Policy</a>
              </li>
            </ul>
          </div>

          
          <div>
            <h4 className="mb-4 font-semibold">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@edulearn.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div> */}

        <div className=" border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EduLearn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
