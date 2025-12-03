'use client';

export default function Footer() {
  return (
    <footer className="bg-[#0b0b0b] py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold">SMA Ingeniería & Software</p>
          <p className="text-sm text-white/70">Gestión online de maquinaria, flotas y operaciones críticas.</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-white/80">
          <a href="#caracteristicas" className="hover:text-white">
            Capacidades
          </a>
          <a href="#clientes" className="hover:text-white">
            Clientes
          </a>
          <a href="#precios" className="hover:text-white">
            Planes
          </a>
          <a href="#contacto" className="hover:text-white">
            Contacto
          </a>
        </div>
        <p className="text-xs text-white/60">© {new Date().getFullYear()} SMA Ingeniería. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}


