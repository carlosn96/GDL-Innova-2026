import { useSiteConfig } from '@/lib/site-context';

export default function Footer() {
  const { siteConfig } = useSiteConfig();
  return (
    <footer data-section="footer" className="site-section py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
              <div className="w-20 md:w-28">
                <img src="/logo-completo.svg" alt="Hackathon Logo" className="w-20 md:w-28" />
                
              </div>
            </div>
            <p className="theme-font-primary font-medium">{siteConfig.organization.name}</p>
            <p className="theme-accent-cyan theme-font-primary text-sm mt-2">
              Innovación • Colaboración • Transformación
            </p>
          </div>

          <div className="text-center md:text-right">
            <p className="theme-font-primary mb-2">Organizado por:</p>
            <p className="theme-accent-pink theme-font-subheading font-semibold">{siteConfig.organization.departments.design}</p>
            <p className="theme-accent-purple theme-font-subheading font-semibold">{siteConfig.organization.departments.engineering}</p>
          </div>
        </div>

        <div className="border-t theme-border-muted mt-8 pt-8 text-center">
          <p className="theme-text-muted theme-font-primary text-sm">
            © {new Date().getFullYear()} {siteConfig.organization.name} Todos los derechos reservados
          </p>
          <p className="theme-text-muted theme-font-primary text-xs mt-2">
            {siteConfig.organization.location}
          </p>
        </div>
      </div>
    </footer>
  );
}