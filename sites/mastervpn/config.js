/**
 * MasterVPN — configuración central
 * Edita aquí precios, ubicaciones, WhatsApp, textos y enlaces legales.
 * No inventes un número nuevo: usa el de MastersAWS o déjalo vacío.
 */
window.MASTERVPN_CONFIG = {
  brand: {
    name: "MasterVPN",
    parent: "MastersAWS",
    tagline: "Un servicio de MastersAWS",
    siteUrl: "https://www.mastersaws.com/mastervpn",
    parentUrl: "https://www.mastersaws.com",
    logoSrc: "logo.png",
  },

  /**
   * WhatsApp (solo dígitos, con código de país).
   * Valor tomado del contacto oficial de MastersAWS en el sitio.
   * Si aún no aplica a MasterVPN, deja whatsappNumber en "" y el CTA pedirá configurar.
   */
  contact: {
    whatsappNumber: "584129837999", // EDITAR: número oficial MasterVPN / MastersAWS
    whatsappDisplay: "+58 412 9837999",
    email: "sales@mastersaws.com",
    defaultMessage:
      "Hola, quiero información sobre MasterVPN.",
  },

  seo: {
    title: "MasterVPN | Internet privado, seguro y sin fronteras",
    description:
      "Protege tu conexión, navega con mayor privacidad y accede a tus servicios digitales desde diferentes ubicaciones con MasterVPN.",
    keywords:
      "VPN, conexión privada, navegación segura, protección Wi-Fi, acceso internacional, VPN para Android, VPN para iPhone, VPN para Windows, MasterVPN, MastersAWS",
    ogImage:
      "https://www.mastersaws.com/wp-content/uploads/2025/09/a553171c-cd61-4b20-b5fb-43ddfa8e2ed8.png", // PLACEHOLDER OG: reemplazar por imagen 1200x630 de MasterVPN
  },

  legal: {
    termsUrl: "#terminos", // EDITAR cuando exista la página
    privacyUrl: "#privacidad",
    aupUrl: "#uso-aceptable",
    supportUrl: "https://www.mastersaws.com/soporte/",
  },

  /**
   * Ubicaciones / regiones (configurables; no inventar países definitivos).
   * status: "available" | "coming_soon"
   */
  locations: [
    { id: "na", label: "Norteamérica", status: "available" },
    { id: "eu", label: "Europa", status: "available" },
    { id: "latam", label: "Latinoamérica", status: "available" },
    { id: "more", label: "Próximamente más ubicaciones", status: "coming_soon" },
  ],

  /**
   * Planes — precios pendientes: usa "Consultar" o actualiza priceLabel.
   * featured: true marca el plan recomendado (Plan Personal).
   */
  plans: [
    {
      id: "individual",
      name: "Plan Individual",
      priceLabel: "Consultar", // EDITAR precio
      duration: "Mensual / anual", // EDITAR duración
      devices: "1 dispositivo",
      locations: "Ubicaciones incluidas según disponibilidad",
      support: "Soporte en español",
      recommendedLabel: "",
      featured: false,
      primaryCta: "Elegir plan",
      whatsappCta: "Solicitar por WhatsApp",
      whatsappMessage:
        "Hola, me interesa el Plan Individual de MasterVPN. ¿Me pueden orientar?",
    },
    {
      id: "personal",
      name: "Plan Personal",
      priceLabel: "Consultar", // EDITAR precio
      duration: "Mensual / anual",
      devices: "Hasta 3 dispositivos",
      locations: "Ubicaciones incluidas según disponibilidad",
      support: "Soporte prioritario en español",
      recommendedLabel: "Más popular",
      featured: true,
      primaryCta: "Elegir plan",
      whatsappCta: "Solicitar por WhatsApp",
      whatsappMessage:
        "Hola, me interesa el Plan Personal de MasterVPN (el más popular). ¿Me pueden orientar?",
    },
    {
      id: "familiar",
      name: "Plan Familiar",
      priceLabel: "Consultar", // EDITAR precio
      duration: "Mensual / anual",
      devices: "Hasta 5 dispositivos",
      locations: "Ubicaciones incluidas según disponibilidad",
      support: "Soporte en español",
      recommendedLabel: "",
      featured: false,
      primaryCta: "Elegir plan",
      whatsappCta: "Solicitar por WhatsApp",
      whatsappMessage:
        "Hola, me interesa el Plan Familiar de MasterVPN. ¿Me pueden orientar?",
    },
    {
      id: "empresarial",
      name: "Plan Empresarial",
      priceLabel: "Consultar", // EDITAR precio
      duration: "A medida",
      devices: "Dispositivos según necesidad",
      locations: "Ubicaciones según acuerdo",
      support: "Acompañamiento y soporte dedicado",
      recommendedLabel: "",
      featured: false,
      primaryCta: "Elegir plan",
      whatsappCta: "Solicitar por WhatsApp",
      whatsappMessage:
        "Hola, me interesa el Plan Empresarial de MasterVPN para mi equipo. ¿Podemos conversar?",
    },
  ],

  devices: [
    { id: "android", label: "Android" },
    { id: "ios", label: "iPhone y iPad" },
    { id: "windows", label: "Windows" },
    { id: "macos", label: "macOS" },
  ],

  faq: [
    {
      q: "¿Qué es MasterVPN?",
      a: "MasterVPN es un servicio de conexión privada que te ayuda a navegar con mayor privacidad, proteger tu tráfico en redes públicas y acceder a tus servicios digitales desde distintas ubicaciones. Es un servicio de MastersAWS.",
    },
    {
      q: "¿Para qué sirve una VPN?",
      a: "Una VPN cifra tu conexión y te permite navegar con más privacidad. También facilita el acceso a servicios digitales cuando cambias de ubicación, por ejemplo al viajar o al conectarte desde redes distintas.",
    },
    {
      q: "¿En cuáles dispositivos puedo utilizarla?",
      a: "MasterVPN está pensado para Android, iPhone y iPad, Windows y macOS. Te acompañamos en la configuración de tus dispositivos incluidos en el plan.",
    },
    {
      q: "¿Cuántos dispositivos puedo conectar?",
      a: "Depende del plan que elijas. Cada plan indica la cantidad de dispositivos incluidos. Si necesitas más, podemos orientarte sobre la opción más adecuada.",
    },
    {
      q: "¿Puedo usarla cuando estoy de viaje?",
      a: "Sí. MasterVPN está diseñado para acompañarte cuando cambias de red o de ubicación, ayudándote a mantener una conexión más privada y a utilizar tus servicios habituales con mayor comodidad.",
    },
    {
      q: "¿MasterVPN garantiza acceso a todas las plataformas?",
      a: "No. La disponibilidad de plataformas y contenidos puede depender de terceros, de sus políticas y de tu ubicación. MasterVPN facilita el acceso internacional dentro de lo posible, pero no garantiza el acceso a todos los servicios. Úsalo conforme a las leyes aplicables.",
    },
    {
      q: "¿Recibiré ayuda para instalarla?",
      a: "Sí. Nuestro equipo te acompaña con instalación guiada y soporte en español para configurar MasterVPN en tus dispositivos.",
    },
    {
      q: "¿Cómo puedo renovar mi plan?",
      a: "La renovación es sencilla. Contáctanos por WhatsApp o soporte y te ayudamos a renovar o ajustar tu plan según tus necesidades.",
    },
  ],
};

window.MasterVPNUtils = {
  buildWhatsAppUrl: function (message) {
    var cfg = window.MASTERVPN_CONFIG || {};
    var num = (cfg.contact && cfg.contact.whatsappNumber) || "";
    if (!num) return "#contacto-whatsapp";
    var text = message || (cfg.contact && cfg.contact.defaultMessage) || "";
    return "https://wa.me/" + String(num).replace(/\D/g, "") + "?text=" + encodeURIComponent(text);
  },
};
