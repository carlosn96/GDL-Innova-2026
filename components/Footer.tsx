import { useSiteConfig } from '@/lib/site-context';
import { GradientBox } from '@/components/ui/gradient-box';

export default function Footer() {
  const { siteConfig } = useSiteConfig();
  return (
    <footer data-section="footer" className="site-section py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
              <img src="/logo.svg" alt="GDL Innova Logo" className="w-10 h-10 rounded-lg" />
            </div>
            <h4 className="text-2xl font-bold theme-title-gradient bg-clip-text text-transparent mb-2">
              {siteConfig.name}
            </h4>
            <p className="theme-accent-cyan-soft font-medium">{siteConfig.organization.name}</p>
            <p className="theme-accent-cyan text-sm mt-2">
              Innovación • Colaboración • Transformación
            </p>
          </div>

          <div className="text-center md:text-right">
            <p className="theme-text-muted mb-2">Organizado por:</p>
            <p className="theme-accent-purple-soft font-semibold">{siteConfig.organization.departments.design}</p>
            <p className="theme-accent-cyan-soft font-semibold">{siteConfig.organization.departments.engineering}</p>
          </div>
        </div>

        <div className="border-t theme-border-muted mt-8 pt-8 text-center">
          <p className="theme-text-muted text-sm">
            © {new Date().getFullYear()} {siteConfig.organization.name} Todos los derechos reservados
          </p>
          <p className="theme-text-muted text-xs mt-2">
            {siteConfig.organization.location}
          </p>
        </div>
      </div>
    </footer>
  );
}