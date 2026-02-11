import { siteConfig } from '@/config/site.config';
import { GradientBox } from '@/components/ui/gradient-box';
import { Icon } from '@/components/ui/icon';

export default function Footer() {
  return (
    <footer className="py-12 px-4 bg-black bg-opacity-40">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
              <GradientBox
                gradientFrom="cyan-500"
                gradientTo="purple-600"
                icon="fas fa-brain"
                className="w-10 h-10 rounded-lg"
              />
            </div>
            <h4 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
              {siteConfig.name}
            </h4>
            <p className="text-cyan-300 font-medium">{siteConfig.organization.name}</p>
            <p className="text-cyan-500 text-sm mt-2">
              Innovación • Colaboración • Transformación
            </p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-gray-400 mb-2">Organizado por:</p>
            <p className="text-cyan-300 font-semibold">{siteConfig.organization.departments.engineering}</p>
            <p className="text-purple-300 font-semibold">{siteConfig.organization.departments.design}</p>
            <div className="mt-4 flex justify-center md:justify-end space-x-4">
              <a 
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center hover:bg-cyan-500/30 transition"
                aria-label="Facebook"
              >
                <Icon name="fab fa-facebook" className="text-cyan-300" />
              </a>
              <a 
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center hover:bg-purple-500/30 transition"
                aria-label="Instagram"
              >
                <Icon name="fab fa-instagram" className="text-purple-300" />
              </a>
              <a 
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center hover:bg-pink-500/30 transition"
                aria-label="Twitter"
              >
                <Icon name="fab fa-twitter" className="text-pink-300" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {siteConfig.organization.name} Todos los derechos reservados
          </p>
          <p className="text-gray-500 text-xs mt-2">
            {siteConfig.organization.location}
          </p>
        </div>
      </div>
    </footer>
  );
}