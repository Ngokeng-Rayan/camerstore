"use client";

export function WhatsAppButton() {
  const phone = "237695540435"; // Numéro au format international sans le +
  const message = encodeURIComponent("Bonjour ! Je suis intéressé(e) par vos produits sur CamerStore. Pouvez-vous m'aider ?");
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-6 right-4 z-[999] flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
    >
      {/* Icône WhatsApp SVG */}
      <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 fill-white">
          <path d="M16.003 2C8.284 2 2 8.284 2 16.003c0 2.478.674 4.794 1.847 6.79L2 30l7.42-1.822A13.93 13.93 0 0 0 16.003 30C23.72 30 30 23.716 30 16.003 30 8.284 23.72 2 16.003 2zm0 25.467a11.59 11.59 0 0 1-5.928-1.629l-.424-.252-4.402 1.082 1.112-4.284-.276-.44A11.522 11.522 0 0 1 4.534 16c0-6.33 5.139-11.467 11.47-11.467C22.338 4.533 27.47 9.67 27.47 16c0 6.33-5.132 11.467-11.467 11.467zm6.3-8.587c-.346-.173-2.04-1.006-2.356-1.12-.316-.116-.547-.173-.778.173-.23.346-.895 1.12-1.097 1.35-.202.23-.404.26-.75.087-.346-.173-1.462-.54-2.785-1.72-1.03-.92-1.725-2.055-1.927-2.4-.202-.347-.022-.534.152-.706.155-.155.346-.404.52-.605.173-.202.23-.346.346-.578.115-.23.058-.433-.029-.605-.087-.173-.778-1.878-1.067-2.571-.28-.673-.565-.583-.778-.593l-.663-.01c-.23 0-.606.087-.923.433-.317.347-1.21 1.183-1.21 2.884s1.24 3.345 1.41 3.576c.173.23 2.44 3.73 5.913 5.23.827.356 1.47.57 1.974.73.83.264 1.585.226 2.182.137.666-.1 2.04-.833 2.327-1.636.288-.803.288-1.49.202-1.636-.087-.144-.317-.23-.663-.404z"/>
        </svg>
      </div>

      {/* Label visible au hover sur desktop, toujours visible sur mobile */}
      <span className="pr-4 text-sm hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-0 group-hover:max-w-xs overflow-hidden whitespace-nowrap">
        Discuter sur WhatsApp
      </span>
    </a>
  );
}
