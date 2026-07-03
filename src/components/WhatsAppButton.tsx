"use client";

interface WhatsAppButtonProps {
  productName?: string;
  price?: number;
}

export function WhatsAppButton({ productName, price }: WhatsAppButtonProps = {}) {
  const phone = "237695540435";
  
  let messageText: string;
  if (productName && price) {
    messageText = `Bonjour CamerStore ! 👋\n\nJe souhaite commander le produit suivant :\n\n📦 *${productName}*\n💰 Prix : *${price.toLocaleString('fr-FR')} FCFA*\n\nPouvez-vous m'aider à finaliser ma commande ? Merci !`;
  } else if (productName) {
    messageText = `Bonjour CamerStore ! 👋\n\nJe suis intéressé(e) par le produit *${productName}*.\n\nPouvez-vous m'aider à commander ? Merci !`;
  } else {
    messageText = `Bonjour CamerStore ! 👋\n\nJe suis intéressé(e) par vos produits. Pouvez-vous m'aider ? Merci !`;
  }
  
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Commander via WhatsApp"
      className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[900] flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold rounded-full shadow-[0_4px_15px_rgb(37,211,102,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 group border-2 border-white/20"
    >
      {/* Icône WhatsApp SVG */}
      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 relative">
        {/* Effet d'onde derrière l'icône plus discret */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-10"></div>
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 fill-white relative z-10">
          <path d="M16.003 2C8.284 2 2 8.284 2 16.003c0 2.478.674 4.794 1.847 6.79L2 30l7.42-1.822A13.93 13.93 0 0 0 16.003 30C23.72 30 30 23.716 30 16.003 30 8.284 23.72 2 16.003 2zm0 25.467a11.59 11.59 0 0 1-5.928-1.629l-.424-.252-4.402 1.082 1.112-4.284-.276-.44A11.522 11.522 0 0 1 4.534 16c0-6.33 5.139-11.467 11.47-11.467C22.338 4.533 27.47 9.67 27.47 16c0 6.33-5.132 11.467-11.467 11.467zm6.3-8.587c-.346-.173-2.04-1.006-2.356-1.12-.316-.116-.547-.173-.778.173-.23.346-.895 1.12-1.097 1.35-.202.23-.404.26-.75.087-.346-.173-1.462-.54-2.785-1.72-1.03-.92-1.725-2.055-1.927-2.4-.202-.347-.022-.534.152-.706.155-.155.346-.404.52-.605.173-.202.23-.346.346-.578.115-.23.058-.433-.029-.605-.087-.173-.778-1.878-1.067-2.571-.28-.673-.565-.583-.778-.593l-.663-.01c-.23 0-.606.087-.923.433-.317.347-1.21 1.183-1.21 2.884s1.24 3.345 1.41 3.576c.173.23 2.44 3.73 5.913 5.23.827.356 1.47.57 1.974.73.83.264 1.585.226 2.182.137.666-.1 2.04-.833 2.327-1.636.288-.803.288-1.49.202-1.636-.087-.144-.317-.23-.663-.404z"/>
        </svg>
      </div>

      {/* Label visible au hover sur desktop */}
      <span className="pr-4 text-sm hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-0 group-hover:max-w-xs overflow-hidden whitespace-nowrap">
        Commander via WhatsApp
      </span>
    </a>
  );
}
