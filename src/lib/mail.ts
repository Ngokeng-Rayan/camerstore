import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const defaultFrom = process.env.EMAIL_FROM || "Camer Store <naassarl98@gmail.com>";

/**
 * Envoie un email à l'admin lorsqu'un client remplit le formulaire de contact
 */
export async function sendContactMessage(name: string, phone: string, message: string) {
  const allUsers = await prisma.user.findMany({ where: { isActive: true }, select: { email: true } });
  const recipientEmails = allUsers.map(a => a.email).join(', ') || process.env.EMAIL_USER;

  const mailOptions = {
    from: defaultFrom,
    to: recipientEmails, // Envoyer à toute l'équipe (Admin + Closers)
    subject: `Nouveau Message de Contact - ${name}`,
    html: `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0;">Nouveau Message de Contact</h2>
        </div>
        <div style="padding: 20px; background-color: #f8fafc;">
          <p style="font-size: 16px; color: #334155;">Vous avez reçu un nouveau message depuis le formulaire de contact :</p>
          
          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 20px;">
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Téléphone :</strong> ${phone}</p>
            <p><strong>Message :</strong></p>
            <p style="white-space: pre-wrap; background-color: #f1f5f9; padding: 10px; border-radius: 5px;">${message}</p>
          </div>
        </div>
        <div style="background-color: #e2e8f0; padding: 10px; text-align: center; font-size: 12px; color: #64748b;">
          Camer Store - Notification Automatique
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Envoie un email à l'équipe (admin/closers) lorsqu'une nouvelle commande est passée
 */
export async function sendNewOrderNotification(order: any, productTitle: string) {
  const allUsers = await prisma.user.findMany({ where: { isActive: true }, select: { email: true } });
  const recipientEmails = allUsers.map(a => a.email).join(', ') || process.env.EMAIL_USER;

  const mailOptions = {
    from: defaultFrom,
    to: recipientEmails, // Envoyer à toute l'équipe (Admin + Closers)
    subject: `Nouvelle Commande 🛒 - ${order.customerName}`,
    html: `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #16a34a; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0;">🎉 Nouvelle Commande Enregistrée !</h2>
        </div>
        <div style="padding: 20px; background-color: #f8fafc;">
          <p style="font-size: 16px; color: #334155;">Une nouvelle commande vient d'être passée sur la boutique.</p>
          
          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 20px;">
            <h3 style="color: #0f172a; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Détails du Produit</h3>
            <p><strong>Produit :</strong> ${productTitle}</p>
            <p><strong>Total :</strong> ${order.totalPrice} FCFA</p>
            
            <h3 style="color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-top: 20px;">Coordonnées du Client</h3>
            <p><strong>Nom :</strong> ${order.customerName}</p>
            <p><strong>Téléphone :</strong> <a href="tel:${order.customerPhone}">${order.customerPhone}</a></p>
            <p><strong>Ville/Quartier :</strong> ${order.customerCity}</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Voir dans le Backoffice</a>
          </div>
        </div>
        <div style="background-color: #e2e8f0; padding: 10px; text-align: center; font-size: 12px; color: #64748b;">
          Camer Store - Notification Automatique
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Envoie un email avec les identifiants lors de la création d'un utilisateur (closer)
 */
export async function sendUserCredentials(email: string, name: string, plainPassword: string) {
  const mailOptions = {
    from: defaultFrom,
    to: email,
    subject: `Bienvenue dans l'équipe Camer Store 🚀`,
    html: `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0;">Bienvenue ${name || 'dans l\'équipe'} !</h2>
        </div>
        <div style="padding: 20px; background-color: #f8fafc;">
          <p style="font-size: 16px; color: #334155;">Votre compte d'accès au Backoffice Camer Store a été créé avec succès.</p>
          
          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 20px;">
            <h3 style="color: #0f172a; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Vos identifiants de connexion</h3>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Mot de passe :</strong> <code>${plainPassword}</code></p>
            <p style="color: #ef4444; font-size: 12px;"><em>Veuillez garder ces informations confidentielles et changer votre mot de passe dès votre première connexion.</em></p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="display: inline-block; background-color: #16a34a; color: #0f172a; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Se connecter au Backoffice</a>
          </div>
        </div>
        <div style="background-color: #e2e8f0; padding: 10px; text-align: center; font-size: 12px; color: #64748b;">
          Camer Store - Notification Automatique
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
