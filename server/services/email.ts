import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

interface OrderEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  subtotal: string;
  shipping: string;
  total: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">€${item.price}</td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #d0a760; margin: 0; font-size: 24px;">Car Audio Limburg</h1>
    <p style="color: #999; margin: 10px 0 0 0;">Bedankt voor je bestelling!</p>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none;">
    <p>Beste ${data.customerName},</p>
    
    <p>Bedankt voor je bestelling bij Car Audio Limburg! Hieronder vind je de details van je bestelling.</p>
    
    <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <strong>Bestelnummer:</strong> ${data.orderNumber}
    </div>
    
    <h2 style="color: #333; font-size: 18px; border-bottom: 2px solid #d0a760; padding-bottom: 10px;">Bestelde producten</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 12px; text-align: left;">Product</th>
          <th style="padding: 12px; text-align: center;">Aantal</th>
          <th style="padding: 12px; text-align: right;">Prijs</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 12px; text-align: right;">Subtotaal:</td>
          <td style="padding: 12px; text-align: right;">€${data.subtotal}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 12px; text-align: right;">Verzendkosten:</td>
          <td style="padding: 12px; text-align: right;">€${data.shipping}</td>
        </tr>
        <tr style="font-weight: bold; font-size: 18px;">
          <td colspan="2" style="padding: 12px; text-align: right; color: #d0a760;">Totaal:</td>
          <td style="padding: 12px; text-align: right; color: #d0a760;">€${data.total}</td>
        </tr>
      </tfoot>
    </table>
    
    <h2 style="color: #333; font-size: 18px; border-bottom: 2px solid #d0a760; padding-bottom: 10px; margin-top: 30px;">Verzendadres</h2>
    
    <p style="background: #f9f9f9; padding: 15px; border-radius: 4px;">
      ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
      ${data.shippingAddress.address}<br>
      ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
      ${data.shippingAddress.country}
    </p>
    
    <div style="margin-top: 30px; padding: 20px; background: #f0f7ff; border-radius: 4px; border-left: 4px solid #d0a760;">
      <strong>Wat gebeurt er nu?</strong>
      <p style="margin: 10px 0 0 0;">We verwerken je bestelling zo snel mogelijk. Je ontvangt een e-mail zodra je pakket onderweg is.</p>
    </div>
    
    <p style="margin-top: 30px;">Vragen? Neem gerust contact met ons op!</p>
    
    <p>Met vriendelijke groet,<br><strong>Team Car Audio Limburg</strong></p>
  </div>
  
  <div style="background: #1a1a1a; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
    <p style="color: #999; margin: 0; font-size: 12px;">
      Car Audio Limburg | Premium Car Audio & Installation<br>
      <a href="https://caraudiolimburg.nl" style="color: #d0a760;">www.caraudiolimburg.nl</a>
    </p>
  </div>
</body>
</html>
    `;

    await client.emails.send({
      from: fromEmail || 'noreply@caraudiolimburg.nl',
      to: data.customerEmail,
      subject: `Orderbevestiging ${data.orderNumber} - Car Audio Limburg`,
      html,
    });

    console.log(`Order confirmation email sent to ${data.customerEmail} for order ${data.orderNumber}`);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
}

export async function sendShippingNotificationEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  trackingNumber?: string,
  trackingUrl?: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();

    const trackingInfo = trackingNumber ? `
      <div style="background: #f0f7ff; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center;">
        <strong>Track & Trace:</strong><br>
        <a href="${trackingUrl || '#'}" style="color: #d0a760; font-size: 18px;">${trackingNumber}</a>
      </div>
    ` : '';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #d0a760; margin: 0;">🚚 Je pakket is onderweg!</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none;">
    <p>Beste ${customerName},</p>
    
    <p>Goed nieuws! Je bestelling <strong>${orderNumber}</strong> is verzonden en onderweg naar jou.</p>
    
    ${trackingInfo}
    
    <p>Met vriendelijke groet,<br><strong>Team Car Audio Limburg</strong></p>
  </div>
</body>
</html>
    `;

    await client.emails.send({
      from: fromEmail || 'noreply@caraudiolimburg.nl',
      to: customerEmail,
      subject: `Je bestelling ${orderNumber} is verzonden! 🚚`,
      html,
    });

    return true;
  } catch (error) {
    console.error('Failed to send shipping notification email:', error);
    return false;
  }
}

export const emailService = {
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
};
